export type GoalType = 'lose_fat' | 'build_muscle' | 'recomp';
export type DietType = 'non_veg' | 'vegetarian' | 'eggetarian' | 'vegan' | 'flexible';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type PreferredTime = 'morning' | 'afternoon' | 'evening' | 'flexible';
export type MusclePriority = 'chest' | 'back' | 'shoulders' | 'arms' | 'quads' | 'glutes_hamstrings' | 'balanced';
export type EquipmentType = 'full_gym' | 'dumbbells_bench' | 'pullup_bands' | 'bodyweight_only';

export interface WorkoutNotificationSettings {
  enabled: boolean;
  reminderLeadTimeMin: number; // e.g. 15, 30, 60 minutes before
  customReminderTime: string; // e.g. "07:00"
  soundEnabled: boolean;
  lastNotifiedDate?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  sex: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  targetDate: string; // ISO date string
  bodyFatPct?: number;
  goal: GoalType;
  dietType: DietType;
  equipmentType?: EquipmentType;
  hasPullUpBar?: boolean;
  notificationSettings?: WorkoutNotificationSettings;
  experienceLevel: ExperienceLevel;
  trainingDaysPerWeek: number;
  selectedDays: string[]; // e.g. ['Mon', 'Wed', 'Fri']
  sessionDurationMin: number;
  preferredTime: PreferredTime;
  musclePriority: MusclePriority;
  injuries: string[];
  injuryNotes?: string;
  allergies?: string;
  cuisinePreference?: string;
  dietaryPreferenceLock?: 'vegetarian_locked' | 'vegan_locked' | 'jain_locked' | 'eggetarian_locked' | 'unlocked';
  
  // Detailed Lifestyle & Physiological Predictors
  dailyStepCount?: number;
  dailyStepTarget?: number;
  occupationType?: 'sedentary' | 'standing' | 'lightly_active' | 'heavy_labor';
  occupationStyle?: 'sedentary' | 'standing' | 'lightly_active' | 'heavy_labor' | string;
  sleepHours?: number;
  dailySleepDurationHours?: number;
  stressLevel?: 'low' | 'moderate' | 'high' | 'very_high';
  dailyStressLevel?: 'low' | 'moderate' | 'high' | 'very_high';
  liftingExperienceYears?: number;
  yearsLifting?: number;
  availableEquipment?: string;
  foodAllergies?: string;
  targetBodyFatPct?: number;
  goalPredictedDate?: string;
  goalDaysRequired?: number;
  goalWeeksRequired?: number;
  goalPredictionReport?: GoalTimelinePredictionResult;
  goalTimelinePrediction?: GoalTimelinePredictionResult;

  // Calculated Nutrition Targets
  bmr: number;
  tdee: number;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  hydrationLiters: number;
  weeklyRateKg: number;
  
  isOnboarded: boolean;
  email?: string;
  authProvider?: string;
  subscription?: UserSubscription;
}

export type SubscriptionPlanId = 'trial_7d' | '1_month' | '3_months' | '1_year' | '2_years' | '3_years';
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'pending_verification';

export interface SubscriptionPlanConfig {
  id: SubscriptionPlanId;
  name: string;
  durationLabel: string;
  durationMonths: number;
  durationDays?: number;
  priceINR: number;
  monthlyEquivalentINR?: number;
  savingsBadge?: string;
  popular?: boolean;
  bestValue?: boolean;
}

export interface UserSubscription {
  status: SubscriptionStatus;
  planId: SubscriptionPlanId;
  planName?: string;
  trialStartDate: string; // ISO String
  trialEndDate: string; // ISO String
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  amountPaidINR?: number;
  utrNumber?: string;
  paymentMethod?: 'UPI_QR' | 'UPI_DIRECT' | 'PROMO_TRIAL';
  isTrialActive: boolean;
  daysRemaining: number;
  lastPaymentVerifiedAt?: string;
  verifiedBy?: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: SubscriptionPlanId;
  planName: string;
  durationLabel: string;
  amountINR: number;
  utrNumber: string; // 12-digit UPI reference number
  recipientVpa: string; // e.g. '9284160309@fam'
  recipientName: string; // e.g. 'Warad Asare'
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  clientIp?: string;
  notes?: string;
}

export interface FoodItemBreakdown {
  name: string;
  portionDescription: string;
  weightG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  caloriesPerGram?: number;
  proteinPerGram?: number;
  carbsPerGram?: number;
  fatPerGram?: number;
  glycemicIndex?: string | number;
  foodCategory?: string;
  ingredientSource?: string;
  hindiName?: string;
  preparationStyle?: string;
  confidenceScorePct?: number; // 0-100% item certainty
  modelAgreementCount?: number; // e.g. 3 of 3 models agreed
  verifiedByDatabase?: boolean; // Cross-referenced against USDA/IFCT
  verifiedDatabaseName?: string; // 'USDA FoodData Central' | 'ICMR-IFCT'
}

export interface ModelConsensusBreakdown {
  overallConsensusScore: number; // 0-100%
  consensusRating: 'Exceptional (98%+)' | 'High (90-97%)' | 'Solid (80-89%)' | 'Re-Evaluated';
  modelsQueried: string[];
  volumetricModelSummary?: string;
  culinaryModelSummary?: string;
  macroValidatorSummary?: string;
  consensusVoteRatio?: string; // e.g. "3/3 Models in Full Agreement"
  verifiedAgainstDatabase?: boolean;
  historicalVerificationDate?: string;
}

export interface StepsTargetCalculationResult {
  recommendedDailySteps: number;
  minRecommendedSteps: number;
  optimalRecommendedSteps: number;
  maxRecommendedSteps: number;
  estimatedDailyNeatBurnKcal: number;
  estimatedWeeklyFatLossContributionKg: number;
  stepMilestones: {
    period: 'Morning Awakening' | 'Post-Meal Digestion' | 'Evening NEAT Flux';
    targetSteps: number;
    recommendedCadence: string; // e.g. "100-115 steps/min"
    benefit: string;
  }[];
  physiologicalRationale: string;
  sedentaryCompensationNotes: string;
  neatOptimizationTips: string[];
  calculatedAt: string;
}

export interface MicronutrientEstimate {
  name: string;
  amount: string;
  benefit: string;
}

export interface SmartSwap {
  originalItem: string;
  suggestedSwap: string;
  benefitReason: string;
  calorieDifference: string;
}

export interface IndianCuisineIntelligenceData {
  isIndianDish: boolean;
  dishNameHindi?: string;
  regionalOrigin?: string; // e.g. 'Maharashtrian', 'North Indian (Punjabi)', 'South Indian', 'Gujarati'
  preparationStyle?: string; // e.g. 'Tadka / Chaunk with Ghee & Cumin', 'Fasting Non-Cereal Starch', 'Dum Steamed'
  cookingFatEstimateG?: number; // Estimated hidden/cooking fat in grams
  cookingFatType?: string; // e.g. 'Pure Desi Ghee', 'Groundnut Oil', 'Mustard Oil'
  isFastingOrVratApproved?: boolean;
  ifctDatabaseCrossReferences?: Array<{
    ingredientName: string;
    ifctCode?: string;
    detectedWeightG: number;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    glycemicRating: string;
    scientificInsight: string;
  }>;
  proteinOptimizationHacks?: string[];
  glycemicModulationVerdict?: string;
  digestiveAndMetabolicNotes?: string;
}

export interface AIAnalysisResult {
  mealTitle: string;
  confidence: 'High' | 'Medium' | 'Moderate';
  summaryDescription: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  totalSodiumMg?: number;
  totalCalciumMg?: number;
  totalPotassiumMg?: number;
  goalAlignmentScore: number; // 1-100
  goalFitVerdict: string;
  items: FoodItemBreakdown[];
  indianCuisine?: IndianCuisineIntelligenceData;
  micronutrients?: MicronutrientEstimate[];
  goalImprovementTips: string[];
  smartSwaps: SmartSwap[];
  scientificTakeaway: string;
  modelConsensus?: ModelConsensusBreakdown;
  consensusScore?: number; // 0-100%
  historicalScanStatus?: 'verified' | 'needs_review' | 'batch_corrected';
  failoverEngaged?: boolean;
  failoverModel?: string;
  failoverReason?: string;
  referenceObjectDetected?: boolean;
  referenceObjectNotes?: string;
}

export interface MealLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Post-Workout';
  photoUrl?: string;
  isEstimated: boolean;
  mealTitle: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sodiumMg?: number;
  calciumMg?: number;
  potassiumMg?: number;
  items: FoodItemBreakdown[];
  analysis?: AIAnalysisResult;
  userNotes?: string;
  notes?: string;
}


export interface Exercise {
  id: string;
  name: string;
  hindiTerminology?: string;
  targetMuscle: string;
  secondaryMuscles?: string[];
  equipment: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  muscle_engagement_rank?: number; // 1-100 score indicating peak electromyographic engagement and hypertrophy efficacy
  requiresPullUpBar?: boolean;
  sets: number;
  reps: string;
  rpeTarget: number; // Rate of perceived exertion (e.g., 8)
  restSeconds: number;
  scienceTip: string; // e.g. "Focus on 3-second eccentric stretch for maximum hypertrophy"
  emgFocus: string; // e.g. "Clavicular head activation (+34% vs flat)"
  hypertrophyRank?: 'S-Tier' | 'A-Tier' | 'B-Tier';
  hypertrophyScore?: number; // 1-10 (e.g. 9.8)
  effectivenessBadge?: string; // e.g. "S-Tier • Maximum Hypertrophy"
  muscleBuildingQuality?: string; // e.g. "Superior tension across stretched position and high overload ceiling"
  injuryAlternative?: {
    originalExercise: string;
    substitute: string;
    reason: string;
  };
  completed?: boolean;
}

export interface WorkoutDay {
  id: string;
  dayName: string; // e.g., 'Day 1: Upper Body Power'
  dayOfWeek: string; // e.g. 'Monday'
  focus: string; // e.g., 'Chest, Upper Back, Delts'
  durationMin: number;
  exercises: Exercise[];
  completed?: boolean;
}

export interface WorkoutProgram {
  id: string;
  title: string;
  description: string;
  splitType: 'PPL (Push/Pull/Legs)' | 'Upper/Lower' | 'Full Body Scientific' | 'Bro Split (5-Day)' | 'Calisthenics (Zero Equipment)' | 'Desi Akhada Functional' | string;
  daysPerWeek: number;
  days: WorkoutDay[];
  scientificPhilosophy: string;
}

export interface WorkoutCompletionLog {
  id: string;
  date: string; // YYYY-MM-DD
  dayId: string;
  dayName: string;
  durationMin: number;
  exercisesCompleted: number;
  totalExercises: number;
  rpeAverage?: number;
  loggedExercises?: Array<{
    exerciseId: string;
    exerciseName: string;
    targetMuscle?: string;
    sets: number;
    reps: number;
    weightKg: number;
    rpeLogged?: number;
    volumeKg: number;
  }>;
  totalVolumeKg?: number;
  isRestDay?: boolean;
  notes?: string;
}

export interface WorkoutStreakStats {
  currentStreak: number;
  longestStreak: number;
  totalWorkoutsCompleted: number;
  weeklyTarget: number;
  workoutsThisWeek: number;
  adherencePercentage: number;
  freezeTokensAvailable: number;
}

export interface BodyMetric {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPct?: number;
  waistCm?: number;
  notes?: string;
}

export interface CheckInRecord {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  adherenceRating: number; // 1-5
  energyLevel: number; // 1-5
  notes?: string;
  caloricAdjustment: number; // e.g. -100 or +150
  aiFeedbackSummary: string;
}

export interface AIMealPlanItem {
  mealType: string;
  timeRecommendation: string;
  dishName: string;
  description: string;
  ingredients: { item: string; amount: string }[];
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  cookingTip: string;
}

export interface AIAdjustedMealPlan {
  planName: string;
  adjustmentSummary: string;
  bodyCompRationale: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: AIMealPlanItem[];
  hydrationTargetLiters: number;
  supplementGuidance?: string[];
  generatedAt: string;
}

export interface CustomGeneratedRecipe {
  id: string;
  recipeName: string;
  headlineTag: string;
  description: string;
  mealCategory: string;
  prepTimeMin: number;
  cookTimeMin: number;
  servings: number;
  totalCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  anabolicScore?: number; // 1-10 (e.g. 9.8)
  protein_to_calorie_ratio?: number; // g of protein per 100 kcal (e.g. 9.5)
  protein_efficiency_score?: number; // 1-100 score indicating protein density
  proteinQualityRank?: 'S-Tier' | 'A-Tier' | 'B-Tier';
  muscleBuildingBadge?: string; // e.g. "S-Tier • Complete Leucine Profile"
  anabolicEfficiency?: string; // e.g. "High protein-to-calorie ratio with optimal DIAAS digestibility"
  ingredients: { item: string; amount: string; macrosContribution?: string }[];
  stepByStepInstructions: string[];
  chefScienceTip: string;
  bodyCompBenefit: string;
  macrosMatchExplanation: string;
  createdAt: string;
  isBookmarked?: boolean;
}

export interface RecipeRequirement {
  mealType: string;
  targetCalories: number;
  targetProteinG: number;
  maxCookTimeMin: number;
  availableIngredients: string;
  cuisineStyle: string;
  notes: string;
}

export interface SearchCitation {
  title?: string;
  url?: string;
  uri?: string;
  domain?: string;
  snippet?: string;
  startIndex?: number;
  endIndex?: number;
}

export interface ResearchResult {
  query: string;
  summary: string;
  keyFindings: string[];
  evidenceStrength: 'Consensus / Meta-Analysis' | 'Randomized Controlled Trial (RCT)' | 'Mechanistic / Observational';
  practicalProtocols: string[];
  citations: SearchCitation[];
  generatedAt: string;
}

export interface JointMechanicEvaluation {
  joint: string;
  observation: string;
  rating: 'Optimal' | 'Needs Improvement' | 'Critical Fault';
}

export interface MechanicalFault {
  phase: string;
  faultDescription: string;
  correctionCue: string;
}

export interface FormAnalysisResult {
  id: string;
  exerciseIdentified: string;
  formScore: number;
  verdict: string;
  injuryRiskRating: 'Low' | 'Moderate' | 'High';
  overallAssessment: string;
  barPathQuality: string;
  jointMechanics: JointMechanicEvaluation[];
  keyStrengths: string[];
  mechanicalFaults: MechanicalFault[];
  actionableCuesNextSet: string[];
  scientificTakeaway: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface ExerciseSmartSwapOption {
  id: string;
  name: string;
  equipment: string;
  targetMuscle: string;
  prescribedSetsReps: string;
  biomechanicalRationale: string;
  jointSafetyRating: string;
  howItAddressesInjury: string;
  setupCue: string;
  matchPercentage: number;
}

export interface SmartSwapResponse {
  originalExerciseName: string;
  reasonSummary: string;
  swaps: ExerciseSmartSwapOption[];
  injurySafeguardSummary: string;
}

export type GroceryCategory = 
  | 'Lean Protein'
  | 'Complex Carbs'
  | 'Fibrous Veggies & Greens'
  | 'Fruits & Antioxidants'
  | 'Healthy Fats & Nuts'
  | 'Dairy & High-Protein Alternatives'
  | 'Pantry Essentials & Seasonings'
  | 'General';

export interface ShoppingListItem {
  id: string;
  name: string;
  category: GroceryCategory;
  amount: string;
  isPurchased: boolean;
  notes?: string;
  mealSources?: string[];
}

export interface SmartShoppingList {
  id: string;
  name: string;
  daysMultiplier: number; // e.g., 3 or 7 days
  items: ShoppingListItem[];
  estimatedCostRange?: string;
  bulkPrepTips?: string[];
  lastCompiledAt: string;
}

export interface ReverseVisualRecipeMatchResult {
  matchedDishName: string;
  regionalOrigin: string;
  confidenceScore: number; // 0 - 100%
  matchedWebSources: Array<{ title: string; url: string; snippet?: string }>;
  authenticDescription: string;
  detectedServingG: number;
  macros: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
  deconstructedIngredients: Array<{
    name: string;
    hindiName?: string;
    weightG: number;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    source: string;
  }>;
  spiceBlendProfile: {
    name: string;
    keySpices: string[];
    bioactiveCompounds: string;
  };
  preparationTechnique: string;
  traditionalFatAdjustment: {
    standardGheeOrOilG: number;
    fitnessOptimizedFatG: number;
    calorieSavings: number;
  };
  dietaryClassification: 'Strict Vegetarian' | 'Jain Friendly' | 'Vrat / Upwas' | 'Vegan' | 'Eggetarian' | 'Non-Vegetarian';
  dietaryLockVerified: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  citations?: SearchCitation[];
}

export interface PerGramIngredientItem {
  id: string;
  name: string;
  hindiName?: string;
  category: string;
  databaseSource: 'IFCT' | 'USDA' | 'ICMR-NIN';
  weightG: number;
  per100g: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    sodiumMg?: number;
    calciumMg?: number;
    potassiumMg?: number;
    ironMg?: number;
    leucineG?: number;
  };
  calculatedMacros: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    calciumMg?: number;
    potassiumMg?: number;
    ironMg?: number;
    leucineG?: number;
  };
}

export interface GoalMilestone {
  weekNumber: number;
  targetDate: string;
  projectedWeightKg: number;
  projectedBodyFatPct: number;
  milestoneTitle: string;
  description: string;
  physiologicalAdaptation: string;
}

export interface GoalTimelinePredictionResult {
  predictedCompletionDate: string; // ISO string e.g. "2026-11-14"
  formattedTargetDate: string; // e.g. "Saturday, November 14, 2026"
  totalDaysRequired: number;
  totalWeeksRequired: number;
  weeklyRateKg: number;
  dailyCalorieTarget: number;
  dailyProteinGrams: number;
  dailyCarbsGrams: number;
  dailyFatGrams: number;
  hydrationLiters: number;
  metabolicBreakdown: {
    bmr: number;
    tdee: number;
    dailyDeficitOrSurplus: number;
    energyBalanceModel: string;
  };
  milestones: GoalMilestone[];
  scientificEvidence: {
    basis: string;
    citedPrinciples: string[];
    groundingSources?: string[];
  };
  recoveryGuidance: {
    sleepTargetHours: number;
    deloadFrequencyWeeks: number;
    injuryPreventionTips: string[];
  };
}

export interface HostDiscountRule {
  id: string;
  targetType: 'individual' | 'everyone';
  targetEmail?: string;
  planId: string; // 'all_plans' | 'plan_1m' | 'plan_3m' | 'plan_1y' | 'plan_2y' | 'plan_3y'
  planName?: string;
  discountType: 'free' | 'custom_price' | 'percentage';
  customPriceINR?: number;
  discountPercentage?: number;
  createdAt: string;
  createdBy: string;
  notes?: string;
  isActive: boolean;
}

export type HostAuditActionType = 
  | 'discount_created'
  | 'discount_deleted'
  | 'free_access_granted'
  | 'payment_verified'
  | 'pin_updated'
  | 'ledger_cleared'
  | 'audit_exported';

export interface HostAuditLogEntry {
  id: string;
  timestamp: string; // ISO String
  actionType: HostAuditActionType;
  actor: string; // e.g. "Warad Asare (Host Master)"
  targetEmail?: string;
  planId?: string;
  amountINR?: number;
  details: string;
  metadata?: Record<string, any>;
  integrityHash: string; // SHA-256 HMAC
}

export interface AIAccuracyReport {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  feature: 'meal_scanner' | 'biomechanics' | 'nutrition_planner' | 'coach_chat';
  targetId?: string;
  reportedAt: string; // ISO string
  aiOutputSummary: string;
  issueCategory: 'incorrect_food_item' | 'inaccurate_portion_grams' | 'faulty_macro_calculation' | 'incorrect_joint_angle' | 'misidentified_exercise' | 'dietary_preference_violation' | 'other';
  userFeedback: string;
  suggestedCorrection: string;
  structuredCorrection?: {
    correctedDishTitle?: string;
    correctedIngredients?: Array<{
      name: string;
      estimatedGrams?: number;
      calories?: number;
      proteinG?: number;
    }>;
    userCorrectionNotes?: string;
    submittedAtISO?: string;
    queuedForSupervisedFineTuning?: boolean;
  };
  confidenceScoreAtScan?: number;
  modelConsensusRating?: string;
  ingredientConfidenceBreakdown?: Array<{
    name: string;
    weightG?: number;
    calories?: number;
    proteinG?: number;
    confidenceScorePct?: number;
    ingredientSource?: string;
  }>;
  modelConsensusResult?: {
    overallConsensusScore?: number;
    consensusRating?: string;
    consensusVoteRatio?: string;
    modelsQueried?: string[];
    volumetricModelSummary?: string;
    culinaryModelSummary?: string;
    macroValidatorSummary?: string;
  };
  status: 'pending_review' | 'analyzed' | 'tuning_applied' | 'resolved' | 'dismissed';
  adminReviewNotes?: string;
  originalPayload?: any;
}

export interface AppErrorReport {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  reportedAt: string;
  errorType: 'bug' | 'visual_defect' | 'calculation_issue' | 'feature_suggestion' | 'performance_lag';
  title: string;
  description: string;
  userSuggestedFix?: string;
  systemDiagnostics: {
    userAgent: string;
    isOnline: boolean;
    isIndexedDBActive: boolean;
    pendingSyncCount: number;
    lastSyncedAt: string | null;
    viewport: string;
    currentUrl: string;
    timestamp: string;
  };
  aiAnalysisVerdict?: {
    isReproducible: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    rootCauseAnalysis: string;
    recommendedCorrection: string;
    analyzedAt: string;
    modelConfidencePct: number;
  };
  status: 'submitted' | 'analyzing' | 'analyzed' | 'resolved' | 'acknowledged';
  adminNotes?: string;
}

export interface ReconciliationReport {
  timestamp: string;
  discrepanciesFound: number;
  repairedCount: number;
  offlineMealsChecked: number;
  offlineWorkoutsChecked: number;
  offlineMetricsChecked: number;
  queueDrained: number;
  details: string[];
  repairedItemsSummary: string;
}



