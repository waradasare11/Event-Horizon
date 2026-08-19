export type GoalType = 'lose_fat' | 'build_muscle' | 'recomp';
export type DietType = 'non_veg' | 'vegetarian' | 'eggetarian' | 'vegan' | 'flexible';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type PreferredTime = 'morning' | 'afternoon' | 'evening' | 'flexible';
export type MusclePriority = 'chest' | 'back' | 'shoulders' | 'arms' | 'quads' | 'glutes_hamstrings' | 'balanced';

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
}

export interface FoodItemBreakdown {
  name: string;
  portionDescription: string;
  weightG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
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
  micronutrients?: MicronutrientEstimate[];
  goalImprovementTips: string[];
  smartSwaps: SmartSwap[];
  scientificTakeaway: string;
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
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  secondaryMuscles?: string[];
  equipment: string;
  sets: number;
  reps: string;
  rpeTarget: number; // Rate of perceived exertion (e.g., 8)
  restSeconds: number;
  scienceTip: string; // e.g. "Focus on 3-second eccentric stretch for maximum hypertrophy"
  emgFocus: string; // e.g. "Clavicular head activation (+34% vs flat)"
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
  splitType: 'PPL (Push/Pull/Legs)' | 'Upper/Lower' | 'Full Body Scientific';
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
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  citations?: SearchCitation[];
}




