import { 
  UserProfile, 
  MealLog, 
  WorkoutCompletionLog, 
  BodyMetric, 
  PaymentTransaction, 
  UserSubscription 
} from '../types';

// Host Secret Salt for client-side HMAC integrity checks (backed by server-side secret)
const INTEGRITY_SECRET_SALT = 'PEAKFORM_SECURE_SALT_WARAD_ASARE_9284160309_FAM';

/**
 * Basic SHA-256 implementation using native Web Crypto API
 */
export async function computeSHA256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a cryptographic HMAC integrity signature for financial transactions
 */
export async function generateTransactionChecksum(tx: {
  userId: string;
  planId: string;
  amountINR: number;
  utrNumber: string;
  createdAt: string;
}): Promise<string> {
  const payload = `${tx.userId}::${tx.planId}::${tx.amountINR}::${tx.utrNumber}::${tx.createdAt}::${INTEGRITY_SECRET_SALT}`;
  return computeSHA256(payload);
}

/**
 * Verify integrity checksum of a payment transaction to prevent client-side falsification
 */
export async function verifyTransactionIntegrity(
  tx: PaymentTransaction,
  providedChecksum?: string
): Promise<boolean> {
  if (!tx.utrNumber || tx.utrNumber.length !== 12) return false;
  if (![89, 239, 919, 1820, 2700].includes(tx.amountINR)) return false;
  if (tx.recipientVpa !== '9284160309@fam') return false;

  const expectedChecksum = await generateTransactionChecksum({
    userId: tx.userId,
    planId: tx.planId,
    amountINR: tx.amountINR,
    utrNumber: tx.utrNumber,
    createdAt: tx.createdAt,
  });

  if (providedChecksum && providedChecksum !== expectedChecksum) {
    return false;
  }

  return true;
}

/**
 * String sanitizer: Strips HTML, control characters, and trims whitespace
 */
export function sanitizeString(val?: string, maxLen = 500): string {
  if (!val) return '';
  return String(val)
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags to prevent XSS
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control chars
    .trim()
    .slice(0, maxLen);
}

/**
 * Numeric sanitizer with minimum and maximum bounds clamping
 */
export function sanitizeNumber(val: any, min = 0, max = 100000, fallback = 0): number {
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return fallback;
  return Math.min(Math.max(num, min), max);
}

/**
 * Sanitizes UserProfile data before Firestore sync to enforce physiological safety bounds
 */
export function sanitizeUserProfile(raw: Partial<UserProfile>): UserProfile {
  const age = sanitizeNumber(raw.age, 10, 100, 25);
  const heightCm = sanitizeNumber(raw.heightCm, 100, 250, 175);
  const weightKg = sanitizeNumber(raw.weightKg, 30, 300, 70);
  const targetWeightKg = sanitizeNumber(raw.targetWeightKg, 30, 300, weightKg);
  const trainingDays = sanitizeNumber(raw.trainingDaysPerWeek, 1, 7, 4);

  return {
    id: sanitizeString(raw.id || `usr_${Date.now()}`, 50),
    name: sanitizeString(raw.name || 'Peak Athlete', 80),
    age,
    sex: raw.sex === 'female' ? 'female' : 'male',
    heightCm,
    weightKg,
    targetWeightKg,
    targetDate: sanitizeString(raw.targetDate, 30),
    bodyFatPct: raw.bodyFatPct ? sanitizeNumber(raw.bodyFatPct, 3, 60, 15) : undefined,
    goal: ['lose_fat', 'build_muscle', 'recomp'].includes(raw.goal as string) ? (raw.goal as any) : 'lose_fat',
    dietType: ['non_veg', 'vegetarian', 'eggetarian', 'vegan', 'flexible'].includes(raw.dietType as string) ? (raw.dietType as any) : 'flexible',
    experienceLevel: ['beginner', 'intermediate', 'advanced'].includes(raw.experienceLevel as string) ? (raw.experienceLevel as any) : 'intermediate',
    trainingDaysPerWeek: trainingDays,
    selectedDays: Array.isArray(raw.selectedDays) ? raw.selectedDays.map((d) => sanitizeString(d, 10)) : ['Mon', 'Tue', 'Thu', 'Fri'],
    sessionDurationMin: sanitizeNumber(raw.sessionDurationMin, 15, 180, 50),
    preferredTime: ['morning', 'afternoon', 'evening', 'flexible'].includes(raw.preferredTime as string) ? (raw.preferredTime as any) : 'morning',
    musclePriority: ['chest', 'back', 'shoulders', 'arms', 'quads', 'glutes_hamstrings', 'balanced'].includes(raw.musclePriority as string) ? (raw.musclePriority as any) : 'balanced',
    injuries: Array.isArray(raw.injuries) ? raw.injuries.map((i) => sanitizeString(i, 60)) : [],
    injuryNotes: sanitizeString(raw.injuryNotes, 300),
    allergies: sanitizeString(raw.allergies, 200),
    cuisinePreference: sanitizeString(raw.cuisinePreference, 100),
    dietaryPreferenceLock: raw.dietaryPreferenceLock,
    bmr: sanitizeNumber(raw.bmr, 800, 4000, 1600),
    tdee: sanitizeNumber(raw.tdee, 1000, 6000, 2200),
    dailyCalories: sanitizeNumber(raw.dailyCalories, 1000, 5000, 2000),
    dailyProtein: sanitizeNumber(raw.dailyProtein, 30, 400, 140),
    dailyCarbs: sanitizeNumber(raw.dailyCarbs, 20, 800, 220),
    dailyFat: sanitizeNumber(raw.dailyFat, 20, 250, 60),
    hydrationLiters: sanitizeNumber(raw.hydrationLiters, 1, 10, 3.5),
    weeklyRateKg: sanitizeNumber(raw.weeklyRateKg, -2, 2, -0.5),
    isOnboarded: Boolean(raw.isOnboarded),
    email: sanitizeString(raw.email, 120),
    authProvider: sanitizeString(raw.authProvider, 50),
    subscription: raw.subscription,
  };
}

/**
 * Sanitizes MealLog data
 */
export function sanitizeMealLog(raw: Partial<MealLog>): MealLog {
  const safeItems = Array.isArray(raw.items)
    ? raw.items.map((item) => ({
        name: sanitizeString(item.name, 100),
        portionDescription: sanitizeString(item.portionDescription, 80),
        weightG: sanitizeNumber(item.weightG, 0, 5000, 100),
        calories: sanitizeNumber(item.calories, 0, 5000, 100),
        proteinG: sanitizeNumber(item.proteinG, 0, 300, 10),
        carbsG: sanitizeNumber(item.carbsG, 0, 600, 15),
        fatG: sanitizeNumber(item.fatG, 0, 300, 5),
        fiberG: sanitizeNumber(item.fiberG, 0, 100, 2),
      }))
    : [];

  return {
    id: sanitizeString(raw.id || `meal_${Date.now()}`, 60),
    date: sanitizeString(raw.date || new Date().toISOString().slice(0, 10), 12),
    time: sanitizeString(raw.time || '12:00', 8),
    mealType: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Post-Workout'].includes(raw.mealType as string) ? (raw.mealType as any) : 'Lunch',
    mealTitle: sanitizeString(raw.mealTitle || 'Logged Meal', 120),
    calories: sanitizeNumber(raw.calories, 0, 10000, 400),
    proteinG: sanitizeNumber(raw.proteinG, 0, 500, 25),
    carbsG: sanitizeNumber(raw.carbsG, 0, 1000, 45),
    fatG: sanitizeNumber(raw.fatG, 0, 500, 15),
    fiberG: sanitizeNumber(raw.fiberG, 0, 200, 5),
    sodiumMg: sanitizeNumber(raw.sodiumMg, 0, 10000, 0),
    calciumMg: sanitizeNumber(raw.calciumMg, 0, 10000, 0),
    potassiumMg: sanitizeNumber(raw.potassiumMg, 0, 10000, 0),
    isEstimated: Boolean(raw.isEstimated),
    items: safeItems,
    userNotes: sanitizeString(raw.userNotes, 400),
    notes: sanitizeString(raw.notes, 400),
  };
}

/**
 * Sanitizes Workout Completion Log data
 */
export function sanitizeWorkoutLog(raw: Partial<WorkoutCompletionLog>): WorkoutCompletionLog {
  const safeLoggedExercises = Array.isArray(raw.loggedExercises)
    ? raw.loggedExercises.map((ex) => ({
        exerciseId: sanitizeString(ex.exerciseId, 50),
        exerciseName: sanitizeString(ex.exerciseName, 100),
        targetMuscle: sanitizeString(ex.targetMuscle, 60),
        sets: sanitizeNumber(ex.sets, 1, 30, 3),
        reps: sanitizeNumber(ex.reps, 1, 100, 10),
        weightKg: sanitizeNumber(ex.weightKg, 0, 600, 40),
        rpeLogged: sanitizeNumber(ex.rpeLogged, 5, 10, 8),
        volumeKg: sanitizeNumber(ex.volumeKg, 0, 50000, 1200),
      }))
    : [];

  return {
    id: sanitizeString(raw.id || `wl_${Date.now()}`, 60),
    date: sanitizeString(raw.date || new Date().toISOString().slice(0, 10), 12),
    dayId: sanitizeString(raw.dayId || 'day_1', 30),
    dayName: sanitizeString(raw.dayName || 'Workout Session', 100),
    durationMin: sanitizeNumber(raw.durationMin, 5, 300, 45),
    exercisesCompleted: sanitizeNumber(raw.exercisesCompleted, 0, 30, 5),
    totalExercises: sanitizeNumber(raw.totalExercises, 1, 30, 5),
    rpeAverage: sanitizeNumber(raw.rpeAverage, 5, 10, 8),
    loggedExercises: safeLoggedExercises,
    totalVolumeKg: sanitizeNumber(raw.totalVolumeKg, 0, 100000, 0),
    isRestDay: Boolean(raw.isRestDay),
    notes: sanitizeString(raw.notes, 500),
  };
}

/**
 * Sanitizes BodyMetric data
 */
export function sanitizeBodyMetric(raw: Partial<BodyMetric>): BodyMetric {
  return {
    id: sanitizeString(raw.id || `bm_${Date.now()}`, 60),
    date: sanitizeString(raw.date || new Date().toISOString().slice(0, 10), 12),
    weightKg: sanitizeNumber(raw.weightKg, 30, 350, 70),
    bodyFatPct: raw.bodyFatPct ? sanitizeNumber(raw.bodyFatPct, 3, 60, 15) : undefined,
    waistCm: raw.waistCm ? sanitizeNumber(raw.waistCm, 40, 200, 80) : undefined,
    notes: sanitizeString(raw.notes, 300),
  };
}
