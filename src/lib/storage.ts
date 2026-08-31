import { UserProfile, MealLog, BodyMetric, WorkoutProgram, CheckInRecord, AIAdjustedMealPlan, CustomGeneratedRecipe, WorkoutCompletionLog, FormAnalysisResult, SmartShoppingList, ShoppingListItem, Exercise } from '../types';
import { INITIAL_USER_PROFILE, INITIAL_SAMPLE_MEAL_LOGS, INITIAL_SAMPLE_BODY_METRICS, INITIAL_SAMPLE_WORKOUT_LOGS } from './sample-data';
import { MASTER_WORKOUT_PROGRAMS } from '../data/workoutPrograms';

const STORAGE_KEYS = {
  PROFILE: 'peakform_user_profile',
  MEAL_LOGS: 'peakform_meal_logs',
  BODY_METRICS: 'peakform_body_metrics',
  WORKOUT_PROGRAMS: 'peakform_workout_programs',
  CHECK_INS: 'peakform_check_ins',
  AI_MEAL_PLAN: 'peakform_ai_meal_plan',
  CUSTOM_RECIPES: 'peakform_custom_recipes',
  WORKOUT_LOGS: 'peakform_workout_logs',
  FORM_ANALYSES: 'peakform_form_analyses',
  SMART_SHOPPING_LIST: 'peakform_smart_shopping_list',
};

export function getUserScopedKey(baseKey: string, userEmail?: string): string {
  let email = userEmail;
  if (!email && typeof window !== 'undefined') {
    try {
      email = localStorage.getItem('peakform_current_active_email') || '';
      if (!email) {
        const rawProf = localStorage.getItem(STORAGE_KEYS.PROFILE);
        if (rawProf) {
          const parsed = JSON.parse(rawProf);
          email = parsed.email || '';
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (!email || !email.includes('@')) return baseKey;
  const sanitized = email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${baseKey}__usr_${sanitized}`;
}

export function setCurrentActiveEmail(email: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('peakform_current_active_email', email.trim().toLowerCase());
    }
  } catch (e) {
    // ignore
  }
}

export function getCurrentActiveEmail(): string {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('peakform_current_active_email') || '';
    }
  } catch (e) {
    // ignore
  }
  return '';
}

export function getStoredProfile(userEmail?: string): UserProfile {
  try {
    const scopedKey = getUserScopedKey(STORAGE_KEYS.PROFILE, userEmail);
    const raw = localStorage.getItem(scopedKey) || localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      // If profile has no valid email, ensure it strictly starts unauthenticated & not onboarded
      if (!parsed.email || !parsed.email.includes('@')) {
        return {
          ...INITIAL_USER_PROFILE,
          ...parsed,
          email: userEmail || '',
          isOnboarded: false,
        };
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed reading user profile from storage', e);
  }
  return {
    ...INITIAL_USER_PROFILE,
    email: userEmail || '',
  };
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    if (profile.email) {
      setCurrentActiveEmail(profile.email);
    }
    const scopedKey = getUserScopedKey(STORAGE_KEYS.PROFILE, profile.email);
    const serialized = JSON.stringify(profile);
    localStorage.setItem(scopedKey, serialized);
    localStorage.setItem(STORAGE_KEYS.PROFILE, serialized);
  } catch (e) {
    console.error('Failed saving user profile to storage', e);
  }
}

export function getStoredMealLogs(userEmail?: string): MealLog[] {
  try {
    const scopedKey = getUserScopedKey(STORAGE_KEYS.MEAL_LOGS, userEmail);
    const raw = localStorage.getItem(scopedKey) || localStorage.getItem(STORAGE_KEYS.MEAL_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading meal logs from storage', e);
  }
  return INITIAL_SAMPLE_MEAL_LOGS;
}

export function saveStoredMealLogs(logs: MealLog[], userEmail?: string): void {
  try {
    const scopedKey = getUserScopedKey(STORAGE_KEYS.MEAL_LOGS, userEmail);
    const serialized = JSON.stringify(logs);
    localStorage.setItem(scopedKey, serialized);
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, serialized);
  } catch (e) {
    console.error('Failed saving meal logs to storage', e);
  }
}

export function addMealLog(log: MealLog): MealLog[] {
  const current = getStoredMealLogs();
  const updated = [log, ...current];
  saveStoredMealLogs(updated);
  return updated;
}

export function deleteMealLog(id: string): MealLog[] {
  const current = getStoredMealLogs();
  const updated = current.filter((l) => l.id !== id);
  saveStoredMealLogs(updated);
  return updated;
}

export function getStoredBodyMetrics(userEmail?: string): BodyMetric[] {
  try {
    const scopedKey = getUserScopedKey(STORAGE_KEYS.BODY_METRICS, userEmail);
    const raw = localStorage.getItem(scopedKey) || localStorage.getItem(STORAGE_KEYS.BODY_METRICS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading body metrics from storage', e);
  }
  return INITIAL_SAMPLE_BODY_METRICS;
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
    const scopedKey = getUserScopedKey(STORAGE_KEYS.WORKOUT_LOGS, userEmail);
    const raw = localStorage.getItem(scopedKey) || localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading workout logs from storage', e);
  }
  return INITIAL_SAMPLE_WORKOUT_LOGS;
}

export function saveStoredWorkoutLogs(logs: WorkoutCompletionLog[], userEmail?: string): void {
  try {
    const scopedKey = getUserScopedKey(STORAGE_KEYS.WORKOUT_LOGS, userEmail);
    const serialized = JSON.stringify(logs);
    localStorage.setItem(scopedKey, serialized);
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, serialized);
  } catch (e) {
    console.error('Failed saving workout logs to storage', e);
  }
}

export function addWorkoutLog(log: WorkoutCompletionLog): WorkoutCompletionLog[] {
  const current = getStoredWorkoutLogs();
  const updated = [log, ...current.filter((l) => l.date !== log.date || l.dayId !== log.dayId)];
  saveStoredWorkoutLogs(updated);
  return updated;
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
  totalVolumeKg?: number
): WorkoutCompletionLog[] {
  const current = getStoredWorkoutLogs();
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
      notes: isRestDay ? 'Active recovery and central nervous system replenishment' : `Full workout completed with average RPE ${rpeAverage?.toFixed(1) || '8.0'}/10`,
    };
    updated = [newLog, ...current];
  }
  
  saveStoredWorkoutLogs(updated);
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

export function getStoredSmartShoppingList(): SmartShoppingList | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SMART_SHOPPING_LIST);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading smart shopping list from storage', e);
  }
  return null;
}

export function saveStoredSmartShoppingList(list: SmartShoppingList | null): void {
  try {
    if (list) {
      localStorage.setItem(STORAGE_KEYS.SMART_SHOPPING_LIST, JSON.stringify(list));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SMART_SHOPPING_LIST);
    }
  } catch (e) {
    console.error('Failed saving smart shopping list to storage', e);
  }
}

export function toggleStoredShoppingItemPurchased(itemId: string): SmartShoppingList | null {
  const current = getStoredSmartShoppingList();
  if (!current) return null;
  const updatedItems = current.items.map((item) =>
    item.id === itemId ? { ...item, isPurchased: !item.isPurchased } : item
  );
  const updatedList: SmartShoppingList = { ...current, items: updatedItems };
  saveStoredSmartShoppingList(updatedList);
  return updatedList;
}



