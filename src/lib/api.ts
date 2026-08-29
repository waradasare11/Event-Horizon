/**
 * Robust API Middleware & Validation Utility for Gemini AI Endpoints
 * 
 * Provides:
 * 1. Automatic vegetarian & dietary compliance auditing on all parsed AI responses.
 * 2. Automatic re-prompting / correction when non-vegetarian keywords are detected for vegetarian users.
 * 3. Standardized error handling, retry backoff, and fallback telemetry.
 */

import { UserProfile, AIAnalysisResult, AIAdjustedMealPlan, AIMealPlanItem } from '../types';
import { recordPerformanceMetric } from './performanceMonitoring';

export const NON_VEGETARIAN_KEYWORDS: string[] = [
  'chicken',
  'mutton',
  'lamb',
  'beef',
  'pork',
  'fish',
  'salmon',
  'tuna',
  'shrimp',
  'prawn',
  'prawns',
  'seafood',
  'crab',
  'lobster',
  'meat',
  'poultry',
  'turkey',
  'bacon',
  'ham',
  'gelatin',
  'lard',
  'duck',
  'goat',
  'squid',
  'anchovy',
  'anchovies',
  'bone broth',
  'calamari',
  'venison',
  'prosciutto',
  'pepperoni',
  'salami',
  'sausage',
  'veal',
  'clam',
  'mussel',
  'oyster',
  'octopus',
  'steak',
  'sirloin',
  'ribeye',
  'tallow',
];

// Regex matching whole words only, avoiding subword false positives like "chickpea" or "nutmeal"
const NON_VEG_REGEX_MAP = NON_VEGETARIAN_KEYWORDS.map(
  (kw) => ({ word: kw, regex: new RegExp(`\\b${kw}(s|es)?\\b`, 'i') })
);

export interface ValidationViolation {
  keyword: string;
  field: string;
  context: string;
}

export interface ComplianceAuditResult {
  isCompliant: boolean;
  violations: ValidationViolation[];
}

/**
 * Checks if a user is classified as vegetarian or vegan
 */
export function isUserVegetarian(userProfile?: Partial<UserProfile> | null): boolean {
  if (!userProfile) return false;
  const diet = userProfile.dietType?.toLowerCase() || '';
  const lock = (userProfile as any).dietaryPreferenceLock?.toLowerCase() || '';
  const isExplicitStrict = Boolean((userProfile as any).isStrictVegetarian);

  return (
    diet === 'vegetarian' ||
    diet === 'vegan' ||
    lock.includes('vegetarian') ||
    lock.includes('locked') ||
    isExplicitStrict
  );
}

/**
 * Deep inspection utility that parses JSON or object data and identifies non-vegetarian keywords
 */
export function auditVegetarianCompliance(data: any, currentPath = ''): ComplianceAuditResult {
  const violations: ValidationViolation[] = [];

  function inspectValue(val: any, path: string) {
    if (val === null || val === undefined) return;

    if (typeof val === 'string') {
      for (const { word, regex } of NON_VEG_REGEX_MAP) {
        if (regex.test(val)) {
          // Double-check exceptions (e.g., "chickpea" is veg, "chicken" is non-veg)
          // Also handle phrases like "without chicken" or "no meat"
          const lowerVal = val.toLowerCase();
          const isNegated = 
            lowerVal.includes(`no ${word}`) ||
            lowerVal.includes(`without ${word}`) ||
            lowerVal.includes(`free of ${word}`) ||
            lowerVal.includes(`zero ${word}`) ||
            lowerVal.includes(`instead of ${word}`) ||
            lowerVal.includes(`replace ${word}`);

          if (!isNegated) {
            violations.push({
              keyword: word,
              field: path || 'root',
              context: val.length > 80 ? val.slice(0, 80) + '...' : val,
            });
          }
        }
      }
    } else if (Array.isArray(val)) {
      val.forEach((item, idx) => inspectValue(item, `${path}[${idx}]`));
    } else if (typeof val === 'object') {
      for (const key of Object.keys(val)) {
        inspectValue(val[key], path ? `${path}.${key}` : key);
      }
    }
  }

  inspectValue(data, currentPath);

  return {
    isCompliant: violations.length === 0,
    violations,
  };
}

export class VegetarianComplianceError extends Error {
  public violations: ValidationViolation[];
  constructor(message: string, violations: ValidationViolation[]) {
    super(message);
    this.name = 'VegetarianComplianceError';
    this.violations = violations;
  }
}

interface RequestOptions {
  userProfile?: Partial<UserProfile>;
  maxRetries?: number;
  headers?: Record<string, string>;
}

/**
 * Robust fetch middleware for Gemini API requests.
 * Automatically inspects responses for vegetarian compliance and re-prompts if violations occur.
 */
export async function callGeminiApi<T = any>(
  endpoint: string,
  payload: any,
  options?: RequestOptions
): Promise<T> {
  const startTime = Date.now();
  const featureName = 
    endpoint.includes('analyze-meal') ? 'MealCameraScanner (Vision AI)' :
    endpoint.includes('analyze-manual') ? 'Manual Meal Deconstructor' :
    endpoint.includes('adjust-meal') ? 'Nutrition Plan Adjuster' :
    endpoint.includes('swap-meal') ? 'Smart Ingredient Swap' :
    endpoint.includes('steps') ? 'Biomechanical Step Calculator' :
    endpoint.includes('analyze-form') ? 'Biomechanics Form Analyzer' :
    endpoint.includes('coach') ? 'Interactive AI Coach' :
    endpoint.includes('research') ? 'Google Search Research Hub' :
    `AI Endpoint (${endpoint})`;

  const maxRetries = options?.maxRetries ?? 2;
  const userProfile = options?.userProfile || payload.userProfile;
  const requireVegetarian = isUserVegetarian(userProfile);

  let currentPayload = { ...payload };
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const attemptStartTime = Date.now();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        body: JSON.stringify(currentPayload),
      });

      const durationMs = Date.now() - attemptStartTime;
      const json = await response.json();

      if (!response.ok || json.success === false) {
        recordPerformanceMetric({
          featureName,
          endpoint,
          durationMs,
          status: 'error',
          statusCode: response.status || 500,
          errorMessage: json.details || json.error || `HTTP ${response.status} Request failed`,
        });
        throw new Error(json.details || json.error || `HTTP ${response.status} Request failed`);
      }

      const responseData: T = json.data !== undefined ? json.data : json;

      // Vegetarian Compliance Guard
      if (requireVegetarian) {
        const audit = auditVegetarianCompliance(responseData);

        if (!audit.isCompliant) {
          const violationSummary = audit.violations
            .map((v) => `"${v.keyword}" in ${v.field} (${v.context})`)
            .join(', ');

          console.warn(
            `[API Middleware] Vegetarian violation detected (Attempt ${attempt + 1}/${maxRetries + 1}): ${violationSummary}`
          );

          if (attempt < maxRetries) {
            // Re-prompt payload with an explicit corrective mandate
            const correctionDirective = 
              `CRITICAL DIETARY VIOLATION IN PREVIOUS ATTEMPT: The generated meal contained non-vegetarian items (${audit.violations.map(v => v.keyword).join(', ')}). ` +
              `The user is STRICTLY VEGETARIAN (${userProfile?.dietType || 'vegetarian'}). ` +
              `You MUST regenerate immediately using 100% pure vegetarian Indian or global ingredients (such as Low-Fat Paneer, Soya Chunks, Tofu, Greek Curd, Moong Dal, Chana, Besan, Sprouts). ` +
              `Under no circumstances include any chicken, meat, fish, eggs, seafood, or animal flesh.`;

            currentPayload = {
              ...currentPayload,
              dietaryCorrectionDirective: correctionDirective,
              customNotes: currentPayload.customNotes 
                ? `${currentPayload.customNotes} | ${correctionDirective}`
                : correctionDirective,
              reason: currentPayload.reason
                ? `${currentPayload.reason} | ${correctionDirective}`
                : correctionDirective,
              userProfile: {
                ...currentPayload.userProfile,
                isStrictVegetarian: true,
                dietType: 'vegetarian',
                dietaryPreferenceLock: 'vegetarian_locked',
              },
            };

            // Small exponential backoff before retry
            await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
            continue;
          } else {
            // Throws structured error with full violation details
            throw new VegetarianComplianceError(
              `AI generated non-vegetarian items (${audit.violations.map(v => v.keyword).join(', ')}). Vegetarian lock enforced.`,
              audit.violations
            );
          }
        }
      }

      // Record successful performance metric
      recordPerformanceMetric({
        featureName,
        endpoint,
        durationMs,
        status: (json as any).fallbackUsed ? 'fallback' : 'success',
        statusCode: 200,
        modelUsed: (json as any).modelUsed || 'gemini-3.7-flash',
        payloadSizeKb: Number((JSON.stringify(currentPayload).length / 1024).toFixed(1)),
      });

      return responseData;
    } catch (err: any) {
      lastError = err;
      if (err instanceof VegetarianComplianceError && attempt >= maxRetries) {
        throw err;
      }
      if (attempt >= maxRetries) {
        recordPerformanceMetric({
          featureName,
          endpoint,
          durationMs: Date.now() - startTime,
          status: 'error',
          statusCode: 500,
          errorMessage: err?.message || 'API call failed',
        });
        break;
      }
    }
  }

  throw lastError;
}

/**
 * Dedicated helper: Adjust Nutrition Blueprint
 */
export async function apiAdjustMealPlan(
  userProfile: UserProfile,
  recentLogs: { totalCaloriesLoggedToday: number; totalProteinLoggedToday: number; numberOfMealsToday: number },
  reason: string
): Promise<AIAdjustedMealPlan> {
  return callGeminiApi<AIAdjustedMealPlan>(
    '/api/ai/adjust-meal-plan',
    {
      userProfile: {
        ...userProfile,
        isStrictVegetarian: isUserVegetarian(userProfile),
        dietaryPreferenceLock: isUserVegetarian(userProfile) ? 'vegetarian_locked' : userProfile.dietaryPreferenceLock,
      },
      recentLogs,
      reason,
    },
    { userProfile }
  );
}

/**
 * Dedicated helper: Swap Single Meal Item
 */
export async function apiSwapMealItem(
  userProfile: UserProfile,
  currentMeal: AIMealPlanItem,
  reason = 'Alternative high-protein swap'
): Promise<AIMealPlanItem> {
  const result = await callGeminiApi<{ meal?: AIMealPlanItem } | AIMealPlanItem>(
    '/api/ai/swap-meal',
    {
      userProfile: {
        ...userProfile,
        isStrictVegetarian: isUserVegetarian(userProfile),
        dietaryPreferenceLock: isUserVegetarian(userProfile) ? 'vegetarian_locked' : userProfile.dietaryPreferenceLock,
      },
      currentMeal,
      reason,
    },
    { userProfile }
  );

  return (result as any).meal || result;
}

/**
 * Dedicated helper: Analyze Meal Image with Vision
 */
export async function apiAnalyzeMealPhoto(
  imageBase64: string,
  userProfile: UserProfile,
  customNotes?: string
): Promise<AIAnalysisResult> {
  return callGeminiApi<AIAnalysisResult>(
    '/api/ai/analyze-meal',
    {
      imageBase64,
      mimeType: 'image/jpeg',
      userProfile,
      customNotes,
    },
    { userProfile }
  );
}

/**
 * Dedicated helper: Analyze Manual Meal Text Description
 */
export async function apiAnalyzeManualMeal(
  mealText: string,
  mealType: string,
  userProfile: UserProfile
): Promise<AIAnalysisResult> {
  return callGeminiApi<AIAnalysisResult>(
    '/api/ai/analyze-manual-meal',
    {
      mealText,
      mealType,
      userProfile,
    },
    { userProfile }
  );
}
