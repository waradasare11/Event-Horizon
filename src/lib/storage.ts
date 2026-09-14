import { UserProfile, MealLog, BodyMetric, WorkoutProgram, CheckInRecord, AIAdjustedMealPlan, CustomGeneratedRecipe, WorkoutCompletionLog, FormAnalysisResult, SmartShoppingList, ShoppingListItem, Exercise } from '../types';
import { INITIAL_USER_PROFILE, INITIAL_SAMPLE_MEAL_LOGS, INITIAL_SAMPLE_BODY_METRICS, INITIAL_SAMPLE_WORKOUT_LOGS } from './sample-data';
import { MASTER_WORKOUT_PROGRAMS } from '../data/workoutPrograms';

const STORAGE_KEYS = {
  PROFILE: 'aroh_user_profile',
  MEAL_LOGS: 'aroh_meal_logs',
  BODY_METRICS: 'aroh_body_metrics',
  WORKOUT_PROGRAMS: 'aroh_workout_programs',
  CHECK_INS: 'aroh_check_ins',
  AI_MEAL_PLAN: 'aroh_ai_meal_plan',
  CUSTOM_RECIPES: 'aroh_custom_recipes',
  WORKOUT_LOGS: 'aroh_workout_logs',
  FORM_ANALYSES: 'aroh_form_analyses',
  SMART_SHOPPING_LIST: 'aroh_smart_shopping_list',
  COACH_CHAT: 'aroh_coach_chat',
};

const LEGACY_STORAGE_KEYS: Record<string, string> = {
  aroh_user_profile: 'peakform_user_profile',
  aroh_meal_logs: 'peakform_meal_logs',
  aroh_body_metrics: 'peakform_body_metrics',
  aroh_workout_programs: 'peakform_workout_programs',
  aroh_check_ins: 'peakform_check_ins',
  aroh_ai_meal_plan: 'peakform_ai_meal_plan',
  aroh_custom_recipes: 'peakform_custom_recipes',
  aroh_workout_logs: 'peakform_workout_logs',
  aroh_form_analyses: 'peakform_form_analyses',
  aroh_smart_shopping_list: 'peakform_smart_shopping_list',
  aroh_coach_chat: 'peakform_coach_chat',
};

export function getUserScopedKey(baseKey: string, userEmail?: string): string {
  let email = userEmail;
  if (!email && (typeof window !== 'undefined' || typeof localStorage !== 'undefined')) {
    email = getCurrentActiveEmail();
  }

  if (!email || !email.includes('@')) return baseKey;
  const sanitized = email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${baseKey}__usr_${sanitized}`;
}

export function setCurrentActiveEmail(email: string): void {
  try {
    if (typeof window !== 'undefined' || typeof localStorage !== 'undefined') {
      const clean = email.trim().toLowerCase();
      localStorage.setItem('aroh_current_active_email', clean);
    }
  } catch (e) {
    // ignore
  }
}

export function getCurrentActiveEmail(): string {
  try {
    if (typeof window !== 'undefined' || typeof localStorage !== 'undefined') {
      let email = localStorage.getItem('aroh_current_active_email');
      if (!email) {
        email = localStorage.getItem('peakform_current_active_email');
        if (email) {
          localStorage.setItem('aroh_current_active_email', email);
        }
      }
      return email || '';
    }
  } catch (e) {
    // ignore
  }
  return '';
}

/**
 * Migration-aware item reader:
 * Checks new aroh_ key first, falls back to legacy peakform_ key, copies over, and returns.
 */
function readStorageItemWithMigration(key: string, userEmail?: string): string | null {
  if (typeof window === 'undefined' && typeof localStorage === 'undefined') return null;
  const effectiveEmail = (userEmail !== undefined ? userEmail : getCurrentActiveEmail()).trim().toLowerCase();

  // If this read is for an authenticated user with an email, strictly isolate to their scoped key
  if (effectiveEmail && effectiveEmail.includes('@')) {
    const scopedKey = getUserScopedKey(key, effectiveEmail);
    const val = localStorage.getItem(scopedKey);
    if (val) return val;

    // Check legacy scoped key
    const legacyBase = LEGACY_STORAGE_KEYS[key] || key.replace(/^aroh_/, 'peakform_');
    const legacyScoped = getUserScopedKey(legacyBase, effectiveEmail);
    const legacyVal = localStorage.getItem(legacyScoped);
    if (legacyVal) {
      try {
        localStorage.setItem(scopedKey, legacyVal);
      } catch (e) {}
      return legacyVal;
    }

    // STRICT USER ISOLATION: Never fall back to another user's unscoped global key
    return null;
  }

  // Only if guest / unauthenticated:
  const baseVal = localStorage.getItem(key);
  if (baseVal) return baseVal;

  // Fallback to unscoped legacy key
  const legacyBase = LEGACY_STORAGE_KEYS[key] || key.replace(/^aroh_/, 'peakform_');
  const baseLegacyVal = localStorage.getItem(legacyBase);
  if (baseLegacyVal) {
    try {
      localStorage.setItem(key, baseLegacyVal);
    } catch (e) {}
    return baseLegacyVal;
  }

  return null;
}

export function getStoredProfile(userEmail?: string): UserProfile {
  try {
    const effectiveEmail = (userEmail || getCurrentActiveEmail() || '').trim().toLowerCase();
    const sanitized = effectiveEmail.replace(/[^a-z0-9]/g, '_');
    const scopedKey = getUserScopedKey(STORAGE_KEYS.PROFILE, effectiveEmail);

    let raw = localStorage.getItem(scopedKey);

    // If scoped key didn't have it, check Drive persistent profile cache
    if (!raw && sanitized) {
      raw = localStorage.getItem(`aroh_drive_profile_${sanitized}`);
      if (!raw) {
        raw = localStorage.getItem(`peakform_drive_profile_${sanitized}`);
        if (raw) {
          localStorage.setItem(`aroh_drive_profile_${sanitized}`, raw);
        }
      }
    }

    // If still not found, check complete Drive backup cache
    if (!raw && sanitized) {
      let driveBackup = localStorage.getItem(`aroh_drive_backup_${sanitized}`);
      if (!driveBackup) {
        driveBackup = localStorage.getItem(`peakform_drive_backup_${sanitized}`);
        if (driveBackup) {
          localStorage.setItem(`aroh_drive_backup_${sanitized}`, driveBackup);
        }
      }
      if (driveBackup) {
        try {
          const parsedBundle = JSON.parse(driveBackup);
          if (parsedBundle?.userProfile) {
            raw = JSON.stringify(parsedBundle.userProfile);
          }
        } catch (e) {}
      }
    }

    // Fallback to base storage key
    if (!raw) {
      raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      // If profile has no valid email, ensure it starts unauthenticated
      if (!parsed.email || !parsed.email.includes('@')) {
        if (effectiveEmail && effectiveEmail.includes('@')) {
          return {
            ...INITIAL_USER_PROFILE,
            ...parsed,
            email: effectiveEmail,
            // If they had previously chosen goals, keep them onboarded
            isOnboarded: Boolean(parsed.isOnboarded || (parsed.goal && parsed.dailyCalories > 0)),
          };
        }
        return {
          ...INITIAL_USER_PROFILE,
          ...parsed,
          email: '',
          isOnboarded: false,
        };
      }

      // Valid email exists on profile
      return {
        ...INITIAL_USER_PROFILE,
        ...parsed,
        email: effectiveEmail || parsed.email,
        isOnboarded: Boolean(parsed.isOnboarded || (parsed.goal && parsed.dailyCalories > 0)),
      };
    }
  } catch (e) {
    console.error('Failed reading user profile from storage', e);
  }
  return {
    ...INITIAL_USER_PROFILE,
    email: userEmail || getCurrentActiveEmail() || '',
  };
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    const email = (profile.email || getCurrentActiveEmail() || '').trim().toLowerCase();
    if (email) {
      setCurrentActiveEmail(email);
    }
    const scopedKey = getUserScopedKey(STORAGE_KEYS.PROFILE, email);
    const serialized = JSON.stringify(profile);
    localStorage.setItem(scopedKey, serialized);
    localStorage.setItem(STORAGE_KEYS.PROFILE, serialized);

    if (email) {
      const sanitized = email.replace(/[^a-z0-9]/g, '_');
      localStorage.setItem(`aroh_drive_profile_${sanitized}`, serialized);
    }
  } catch (e) {
    console.error('Failed saving user profile to storage', e);
  }
}

export function getStoredMealLogs(userEmail?: string): MealLog[] {
  try {
    const raw = readStorageItemWithMigration(STORAGE_KEYS.MEAL_LOGS, userEmail);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed reading meal logs from storage', e);
  }
  return [];
}

export function saveStoredMealLogs(logs: MealLog[], userEmail?: string): void {
  try {
    const effectiveEmail = (userEmail !== undefined ? userEmail : getCurrentActiveEmail()).trim().toLowerCase();
    const scopedKey = getUserScopedKey(STORAGE_KEYS.MEAL_LOGS, effectiveEmail);
    const serialized = JSON.stringify(logs);
    localStorage.setItem(scopedKey, serialized);
    if (!effectiveEmail || !effectiveEmail.includes('@')) {
      localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, serialized);
    }
  } catch (e) {
    console.error('Failed saving meal logs to storage', e);
  }
}

export function addMealLog(log: MealLog, userEmail?: string): MealLog[] {
  const current = getStoredMealLogs(userEmail);
  const updated = [log, ...current];
  saveStoredMealLogs(updated, userEmail);
  return updated;
}

export function deleteMealLog(id: string, userEmail?: string): MealLog[] {
  const current = getStoredMealLogs(userEmail);
  const updated = current.filter((l) => l.id !== id);
  saveStoredMealLogs(updated, userEmail);
  return updated;
}

export function deleteMealLogs(ids: string[], userEmail?: string): MealLog[] {
  const current = getStoredMealLogs(userEmail);
  const idSet = new Set(ids);
  const updated = current.filter((l) => !idSet.has(l.id));
  saveStoredMealLogs(updated, userEmail);
  return updated;
}

export function clearStoredMealLogs(userEmail?: string): void {
  try {
    const scopedKey = getUserScopedKey(STORAGE_KEYS.MEAL_LOGS, userEmail);
    localStorage.removeItem(scopedKey);
    localStorage.removeItem(STORAGE_KEYS.MEAL_LOGS);
    localStorage.setItem(scopedKey, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify([]));
  } catch (e) {
    console.error('Failed clearing meal logs from storage', e);
  }
}

export function getStoredBodyMetrics(userEmail?: string): BodyMetric[] {
  try {
    const raw = readStorageItemWithMigration(STORAGE_KEYS.BODY_METRICS, userEmail);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed reading body metrics from storage', e);
  }
  return [];
}

export function saveStoredBodyMetrics(metrics: BodyMetric[], userEmail?: string): void {
  try {
    const scopedKey = getUserScopedKey(STORAGE_KEYS.BODY_METRICS, userEmail);
    const serialized = JSON.stringify(metrics);
    localStorage.setItem(scopedKey, serialized);
    localStorage.setItem(STORAGE_KEYS.BODY_METRICS, serialized);
  } catch (e) {
    console.error('Failed saving body metrics to storage', e);
  }
}

export function addBodyMetric(metric: BodyMetric): BodyMetric[] {
  const current = getStoredBodyMetrics();
  const updated = [...current, metric].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  saveStoredBodyMetrics(updated);
  return updated;
}

export function getStoredWorkoutPrograms(): WorkoutProgram[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_PROGRAMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading workout programs from storage', e);
  }
  return MASTER_WORKOUT_PROGRAMS;
}

export function saveStoredWorkoutPrograms(programs: WorkoutProgram[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_PROGRAMS, JSON.stringify(programs));
  } catch (e) {
    console.error('Failed saving workout programs to storage', e);
  }
}

export function resetWorkoutProgramsToDefault(): WorkoutProgram[] {
  saveStoredWorkoutPrograms(MASTER_WORKOUT_PROGRAMS);
  return MASTER_WORKOUT_PROGRAMS;
}

export function reorderWorkoutExercise(
  programId: string,
  dayId: string,
  fromIndex: number,
  toIndex: number
): WorkoutProgram[] {
  const programs = getStoredWorkoutPrograms();
  const updated = programs.map((p) => {
    if (p.id !== programId) return p;
    return {
      ...p,
      days: p.days.map((d) => {
        if (d.id !== dayId) return d;
        const exercises = [...d.exercises];
        if (fromIndex < 0 || fromIndex >= exercises.length || toIndex < 0 || toIndex >= exercises.length) {
          return d;
        }
        const [moved] = exercises.splice(fromIndex, 1);
        exercises.splice(toIndex, 0, moved);
        return {
          ...d,
          exercises,
        };
      }),
    };
  });
  saveStoredWorkoutPrograms(updated);
  return updated;
}

export function removeWorkoutExercise(
  programId: string,
  dayId: string,
  exerciseIndex: number
): WorkoutProgram[] {
  const programs = getStoredWorkoutPrograms();
  const updated = programs.map((p) => {
    if (p.id !== programId) return p;
    return {
      ...p,
      days: p.days.map((d) => {
        if (d.id !== dayId) return d;
        const exercises = d.exercises.filter((_, idx) => idx !== exerciseIndex);
        return {
          ...d,
          exercises,
        };
      }),
    };
  });
  saveStoredWorkoutPrograms(updated);
  return updated;
}

export function addExerciseToDay(
  programId: string,
  dayId: string,
  exercise: Exercise
): WorkoutProgram[] {
  const programs = getStoredWorkoutPrograms();
  const updated = programs.map((p) => {
    if (p.id !== programId) return p;
    return {
      ...p,
      days: p.days.map((d) => {
        if (d.id !== dayId) return d;
        return {
          ...d,
          exercises: [...d.exercises, exercise],
        };
      }),
    };
  });
  saveStoredWorkoutPrograms(updated);
  return updated;
}

export function getStoredAIMealPlan(): AIAdjustedMealPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_MEAL_PLAN);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading AI meal plan from storage', e);
  }
  return null;
}

export function saveStoredAIMealPlan(plan: AIAdjustedMealPlan): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AI_MEAL_PLAN, JSON.stringify(plan));
  } catch (e) {
    console.error('Failed saving AI meal plan to storage', e);
  }
}

export function getStoredCustomRecipes(): CustomGeneratedRecipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_RECIPES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading custom recipes from storage', e);
  }
  return [];
}

export function saveStoredCustomRecipes(recipes: CustomGeneratedRecipe[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_RECIPES, JSON.stringify(recipes));
  } catch (e) {
    console.error('Failed saving custom recipes to storage', e);
  }
}

export function addStoredCustomRecipe(recipe: CustomGeneratedRecipe): CustomGeneratedRecipe[] {
  const current = getStoredCustomRecipes();
  const updated = [recipe, ...current.filter((r) => r.id !== recipe.id)];
  saveStoredCustomRecipes(updated);
  return updated;
}

export function deleteStoredCustomRecipe(id: string): CustomGeneratedRecipe[] {
  const current = getStoredCustomRecipes();
  const updated = current.filter((r) => r.id !== id);
  saveStoredCustomRecipes(updated);
  return updated;
}

export function getStoredWorkoutLogs(userEmail?: string): WorkoutCompletionLog[] {
  try {
    const raw = readStorageItemWithMigration(STORAGE_KEYS.WORKOUT_LOGS, userEmail);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed reading workout logs from storage', e);
  }
  return [];
}

export function getStoredCoachMessages(userEmail?: string): any[] {
  try {
    const raw = readStorageItemWithMigration(STORAGE_KEYS.COACH_CHAT, userEmail);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(-100);
    }
  } catch (e) {
    console.error('Failed reading coach messages from storage', e);
  }
  return [];
}

export function saveStoredCoachMessages(messages: any[], userEmail?: string): void {
  try {
    const effectiveEmail = (userEmail !== undefined ? userEmail : getCurrentActiveEmail()).trim().toLowerCase();
    const capped = messages.slice(-100);
    const scopedKey = getUserScopedKey(STORAGE_KEYS.COACH_CHAT, effectiveEmail);
    const serialized = JSON.stringify(capped);
    localStorage.setItem(scopedKey, serialized);
    if (!effectiveEmail || !effectiveEmail.includes('@')) {
      localStorage.setItem(STORAGE_KEYS.COACH_CHAT, serialized);
    }
  } catch (e) {
    console.error('Failed saving coach messages to storage', e);
  }
}

export function clearStoredCoachMessages(userEmail?: string): void {
  try {
    const effectiveEmail = (userEmail !== undefined ? userEmail : getCurrentActiveEmail()).trim().toLowerCase();
    const scopedKey = getUserScopedKey(STORAGE_KEYS.COACH_CHAT, effectiveEmail);
    localStorage.removeItem(scopedKey);
    if (!effectiveEmail || !effectiveEmail.includes('@')) {
      localStorage.removeItem(STORAGE_KEYS.COACH_CHAT);
    }
  } catch (e) {
    console.error('Failed clearing coach messages from storage', e);
  }
}

export function saveStoredWorkoutLogs(logs: WorkoutCompletionLog[], userEmail?: string): void {
  try {
    const effectiveEmail = (userEmail !== undefined ? userEmail : getCurrentActiveEmail()).trim().toLowerCase();
    const scopedKey = getUserScopedKey(STORAGE_KEYS.WORKOUT_LOGS, effectiveEmail);
    const serialized = JSON.stringify(logs);
    localStorage.setItem(scopedKey, serialized);
    if (!effectiveEmail || !effectiveEmail.includes('@')) {
      localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, serialized);
    }
  } catch (e) {
    console.error('Failed saving workout logs to storage', e);
  }
}

export function addWorkoutLog(log: WorkoutCompletionLog, userEmail?: string): WorkoutCompletionLog[] {
  const current = getStoredWorkoutLogs(userEmail);
  const updated = [log, ...current.filter((l) => l.date !== log.date || l.dayId !== log.dayId)];
  saveStoredWorkoutLogs(updated, userEmail);
  return updated;
}

export function deleteWorkoutLog(id: string, userEmail?: string): WorkoutCompletionLog[] {
  const current = getStoredWorkoutLogs(userEmail);
  const updated = current.filter((l) => l.id !== id);
  saveStoredWorkoutLogs(updated, userEmail);
  return updated;
}

export function deleteWorkoutLogs(ids: string[], userEmail?: string): WorkoutCompletionLog[] {
  const current = getStoredWorkoutLogs(userEmail);
  const idSet = new Set(ids);
  const updated = current.filter((l) => !idSet.has(l.id));
  saveStoredWorkoutLogs(updated, userEmail);
  return updated;
}

export function clearStoredWorkoutLogs(userEmail?: string): void {
  try {
    const scopedKey = getUserScopedKey(STORAGE_KEYS.WORKOUT_LOGS, userEmail);
    localStorage.removeItem(scopedKey);
    localStorage.removeItem(STORAGE_KEYS.WORKOUT_LOGS);
    localStorage.setItem(scopedKey, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify([]));
  } catch (e) {
    console.error('Failed clearing workout logs from storage', e);
  }
}

export function toggleWorkoutDayLog(
  date: string, 
  dayId: string, 
  dayName: string, 
  durationMin: number, 
  exercisesCompleted: number, 
  totalExercises: number, 
  isRestDay: boolean = false,
  rpeAverage?: number,
  loggedExercises?: Array<{
    exerciseId: string;
    exerciseName: string;
    targetMuscle?: string;
    sets: number;
    reps: number;
    weightKg: number;
    rpeLogged?: number;
    volumeKg: number;
  }>,
  totalVolumeKg?: number,
  notes?: string,
  userEmail?: string
): WorkoutCompletionLog[] {
  const current = getStoredWorkoutLogs(userEmail);
  const existingIndex = current.findIndex((l) => l.date === date && (l.dayId === dayId || (isRestDay && l.isRestDay)));
  
  let updated: WorkoutCompletionLog[];
  if (existingIndex >= 0) {
    updated = current.filter((_, idx) => idx !== existingIndex);
  } else {
    const newLog: WorkoutCompletionLog = {
      id: 'wl_' + Date.now(),
      date,
      dayId,
      dayName,
      durationMin,
      exercisesCompleted,
      totalExercises,
      rpeAverage: isRestDay ? undefined : (rpeAverage ?? 8.0),
      loggedExercises: loggedExercises || [],
      totalVolumeKg: totalVolumeKg || 0,
      isRestDay,
      notes: notes || (isRestDay ? 'Active recovery and central nervous system replenishment' : `Full workout completed with average RPE ${rpeAverage?.toFixed(1) || '8.0'}/10`),
    };
    updated = [newLog, ...current];
  }
  
  saveStoredWorkoutLogs(updated, userEmail);
  return updated;
}

export function updateWorkoutLogNotes(id: string, notes: string, userEmail?: string): WorkoutCompletionLog[] {
  const current = getStoredWorkoutLogs(userEmail);
  const updated = current.map((log) => {
    const logIdentifier = log.id || `${log.date}_${log.dayId}`;
    if (logIdentifier === id || log.id === id) {
      return { ...log, notes };
    }
    return log;
  });
  saveStoredWorkoutLogs(updated, userEmail);
  return updated;
}


const INITIAL_FORM_ANALYSIS: FormAnalysisResult = {
  id: 'fa_sample_squat',
  exerciseIdentified: 'Barbell Back Squat',
  formScore: 92,
  verdict: 'Excellent Depth and Spinal Stability with Minor Heel Elevation',
  injuryRiskRating: 'Low',
  overallAssessment: 'Hip hinge initiates synchronously with knee flexion. Torso maintains adequate rigid tightness throughout the eccentric deceleration phase.',
  barPathQuality: 'Near-perfect vertical plumb line alignment over midfoot with <2.5cm anterior drift at reversal point.',
  jointMechanics: [
    { joint: 'Spine / Lumbar', observation: 'Neutral thoracic & lumbar alignment maintained with intra-abdominal pressure', rating: 'Optimal' },
    { joint: 'Knee Tracking', observation: 'Knees follow 2nd-3rd toe orientation without valgus collapse', rating: 'Optimal' },
    { joint: 'Ankle Dorsiflexion', observation: 'Slight heel rise at maximal depth (115° knee flexion)', rating: 'Needs Improvement' },
    { joint: 'Scapular Shelf', observation: 'Solid rear delt tension creating a firm bar platform', rating: 'Optimal' },
  ],
  keyStrengths: [
    'Sub-parallel depth reached with pelvic control and zero butt wink',
    'High intra-abdominal bracing via Valsalva maneuver',
    'Explosive concentric hip extension driven by glutes',
  ],
  mechanicalFaults: [
    { phase: 'Bottom Reversal (Hole)', faultDescription: 'Weight shifts 5% anteriorly onto metatarsals', correctionCue: 'Root big toe, pinky toe, and heel as a 3-point tripod before descent' },
  ],
  actionableCuesNextSet: [
    'Drive floor away through whole foot tripod (heel + midfoot)',
    'Screw feet into the ground to maximize glute medius activation',
    'Take a deep 360° belly breath into belt before unlocking knees',
  ],
  scientificTakeaway: 'Deep squats elicit 35% higher quadriceps and gluteus maximus hypertrophic stimulus compared to partial squats without increasing tibiofemoral shear strain.',
  mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  createdAt: new Date().toISOString(),
};

export function getStoredFormAnalyses(): FormAnalysisResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FORM_ANALYSES);
    if (!raw) return [INITIAL_FORM_ANALYSIS];
    return JSON.parse(raw);
  } catch {
    return [INITIAL_FORM_ANALYSIS];
  }
}

export function saveStoredFormAnalyses(analyses: FormAnalysisResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FORM_ANALYSES, JSON.stringify(analyses));
  } catch (err) {
    console.error('Failed to save form analyses', err);
  }
}

export function addFormAnalysis(analysis: FormAnalysisResult): FormAnalysisResult[] {
  const current = getStoredFormAnalyses();
  const updated = [analysis, ...current.filter((a) => a.id !== analysis.id)];
  saveStoredFormAnalyses(updated);
  return updated;
}

export function getStoredSmartShoppingList(userEmail?: string): SmartShoppingList | null {
  try {
    const raw = readStorageItemWithMigration(STORAGE_KEYS.SMART_SHOPPING_LIST, userEmail);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading smart shopping list from storage', e);
  }
  return null;
}

export function saveStoredSmartShoppingList(list: SmartShoppingList | null, userEmail?: string): void {
  try {
    const effectiveEmail = (userEmail !== undefined ? userEmail : getCurrentActiveEmail()).trim().toLowerCase();
    const scopedKey = getUserScopedKey(STORAGE_KEYS.SMART_SHOPPING_LIST, effectiveEmail);
    if (list) {
      const serialized = JSON.stringify(list);
      localStorage.setItem(scopedKey, serialized);
      if (!effectiveEmail || !effectiveEmail.includes('@')) {
        localStorage.setItem(STORAGE_KEYS.SMART_SHOPPING_LIST, serialized);
      }
    } else {
      localStorage.removeItem(scopedKey);
      if (!effectiveEmail || !effectiveEmail.includes('@')) {
        localStorage.removeItem(STORAGE_KEYS.SMART_SHOPPING_LIST);
      }
    }
  } catch (e) {
    console.error('Failed saving smart shopping list to storage', e);
  }
}

export function clearStoredSmartShoppingList(userEmail?: string): void {
  try {
    const effectiveEmail = (userEmail !== undefined ? userEmail : getCurrentActiveEmail()).trim().toLowerCase();
    const scopedKey = getUserScopedKey(STORAGE_KEYS.SMART_SHOPPING_LIST, effectiveEmail);
    localStorage.removeItem(scopedKey);
    if (!effectiveEmail || !effectiveEmail.includes('@')) {
      localStorage.removeItem(STORAGE_KEYS.SMART_SHOPPING_LIST);
    }
  } catch (e) {
    console.error('Failed clearing smart shopping list', e);
  }
}

export function toggleStoredShoppingItemPurchased(itemId: string, userEmail?: string): SmartShoppingList | null {
  const current = getStoredSmartShoppingList(userEmail);
  if (!current) return null;
  const updatedItems = current.items.map((item) =>
    item.id === itemId ? { ...item, isPurchased: !item.isPurchased } : item
  );
  const updatedList: SmartShoppingList = { ...current, items: updatedItems };
  saveStoredSmartShoppingList(updatedList, userEmail);
  return updatedList;
}



