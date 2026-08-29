import { UserProfile, BodyMetric, MealLog, GoalType, DietType } from '../../types';

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: ValidationIssue[];
  sanitizedData?: T;
}

/**
 * Robust single-decimal rounding immune to JavaScript floating point inaccuracy
 */
export function roundToOneDecimal(val: number): number {
  return Math.round((val + Number.EPSILON) * 10) / 10;
}

/**
 * Sanitize string values to prevent injection and strip leading/trailing whitespace
 */
export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return '';
  return val
    .trim()
    .replace(/[<>]/g, ''); // strip angle brackets
}

/**
 * Validate and sanitize User Profile inputs
 */
export function validateUserProfile(data: Partial<UserProfile>): ValidationResult<UserProfile> {
  const errors: ValidationIssue[] = [];

  // Name validation
  const name = typeof data.name === 'string' ? sanitizeString(data.name) : '';
  if (!name || name.length < 1) {
    errors.push({ field: 'name', message: 'Name cannot be empty' });
  } else if (name.length > 80) {
    errors.push({ field: 'name', message: 'Name cannot exceed 80 characters' });
  }

  // Age validation
  const age = Number(data.age);
  if (isNaN(age) || age < 10 || age > 120) {
    errors.push({ field: 'age', message: 'Age must be between 10 and 120 years' });
  }

  // Sex validation
  const validSexes = ['male', 'female'];
  if (!data.sex || !validSexes.includes(data.sex)) {
    errors.push({ field: 'sex', message: 'Sex must be male or female' });
  }

  // Height validation (cm)
  const heightCm = Number(data.heightCm);
  if (isNaN(heightCm) || heightCm < 50 || heightCm > 260) {
    errors.push({ field: 'heightCm', message: 'Height must be between 50 cm and 260 cm' });
  }

  // Weight validation (kg)
  const weightKg = Number(data.weightKg);
  if (isNaN(weightKg) || weightKg < 25 || weightKg > 350) {
    errors.push({ field: 'weightKg', message: 'Current weight must be between 25 kg and 350 kg' });
  }

  // Target Weight validation (kg)
  const targetWeightKg = Number(data.targetWeightKg);
  if (isNaN(targetWeightKg) || targetWeightKg < 25 || targetWeightKg > 350) {
    errors.push({ field: 'targetWeightKg', message: 'Target weight must be between 25 kg and 350 kg' });
  }

  // Goal validation
  const validGoals: GoalType[] = ['lose_fat', 'build_muscle', 'recomp'];
  if (!data.goal || !validGoals.includes(data.goal)) {
    errors.push({ field: 'goal', message: 'Invalid fitness goal specified' });
  }

  // Diet Type validation
  const validDiets: DietType[] = ['non_veg', 'vegetarian', 'eggetarian', 'vegan', 'flexible'];
  if (!data.dietType || !validDiets.includes(data.dietType)) {
    errors.push({ field: 'dietType', message: 'Invalid dietary preference specified' });
  }

  // Daily Step Target validation
  if (data.dailyStepTarget !== undefined) {
    const steps = Number(data.dailyStepTarget);
    if (isNaN(steps) || steps < 1000 || steps > 100000) {
      errors.push({ field: 'dailyStepTarget', message: 'Daily step target must be between 1,000 and 100,000 steps' });
    }
  }

  // Daily Sleep Duration validation
  if (data.dailySleepDurationHours !== undefined) {
    const sleep = Number(data.dailySleepDurationHours);
    if (isNaN(sleep) || sleep < 3 || sleep > 16) {
      errors.push({ field: 'dailySleepDurationHours', message: 'Daily sleep duration must be between 3 and 16 hours' });
    }
  }

  const isValid = errors.length === 0;

  let sanitizedData: UserProfile | undefined = undefined;
  if (isValid) {
    sanitizedData = {
      ...(data as UserProfile),
      name,
      age: Math.round(age),
      heightCm: roundToOneDecimal(heightCm),
      weightKg: roundToOneDecimal(weightKg),
      targetWeightKg: roundToOneDecimal(targetWeightKg),
      dailyStepTarget: data.dailyStepTarget ? Math.round(Number(data.dailyStepTarget)) : 10000,
      dailySleepDurationHours: data.dailySleepDurationHours ? roundToOneDecimal(Number(data.dailySleepDurationHours)) : 8,
    };
  }

  return {
    isValid,
    errors,
    sanitizedData,
  };
}

/**
 * Validate and sanitize Body Metric logs
 */
export function validateBodyMetric(data: Partial<BodyMetric>): ValidationResult<BodyMetric> {
  const errors: ValidationIssue[] = [];

  // Weight validation
  const weightKg = Number(data.weightKg);
  if (isNaN(weightKg) || weightKg < 25 || weightKg > 350) {
    errors.push({ field: 'weightKg', message: 'Weight must be between 25 kg and 350 kg' });
  }

  // Body Fat % (optional)
  if (data.bodyFatPct !== undefined && data.bodyFatPct !== null && String(data.bodyFatPct).trim() !== '') {
    const bf = Number(data.bodyFatPct);
    if (isNaN(bf) || bf < 2 || bf > 70) {
      errors.push({ field: 'bodyFatPct', message: 'Body fat % must be between 2% and 70%' });
    }
  }

  // Waist circumference (cm) (optional)
  if (data.waistCm !== undefined && data.waistCm !== null && String(data.waistCm).trim() !== '') {
    const waist = Number(data.waistCm);
    if (isNaN(waist) || waist < 30 || waist > 250) {
      errors.push({ field: 'waistCm', message: 'Waist circumference must be between 30 cm and 250 cm' });
    }
  }

  const isValid = errors.length === 0;

  let sanitizedData: BodyMetric | undefined = undefined;
  if (isValid) {
    sanitizedData = {
      id: data.id || `metric_${Date.now()}`,
      date: data.date || new Date().toISOString().split('T')[0],
      weightKg: roundToOneDecimal(weightKg),
      bodyFatPct: data.bodyFatPct !== undefined && data.bodyFatPct !== null ? roundToOneDecimal(Number(data.bodyFatPct)) : undefined,
      waistCm: data.waistCm !== undefined && data.waistCm !== null ? roundToOneDecimal(Number(data.waistCm)) : undefined,
      notes: data.notes ? sanitizeString(data.notes) : undefined,
    };
  }

  return {
    isValid,
    errors,
    sanitizedData,
  };
}

/**
 * Validate and sanitize Meal inputs
 */
export function validateMealInput(data: Partial<MealLog>): ValidationResult<MealLog> {
  const errors: ValidationIssue[] = [];

  const mealTitle = typeof data.mealTitle === 'string' ? sanitizeString(data.mealTitle) : '';
  if (!mealTitle || mealTitle.length < 1) {
    errors.push({ field: 'mealTitle', message: 'Meal title cannot be empty' });
  } else if (mealTitle.length > 150) {
    errors.push({ field: 'mealTitle', message: 'Meal title cannot exceed 150 characters' });
  }

  const calories = Number(data.calories);
  if (isNaN(calories) || calories < 0 || calories > 10000) {
    errors.push({ field: 'calories', message: 'Calories must be between 0 and 10,000 kcal' });
  }

  const proteinG = Number(data.proteinG);
  if (isNaN(proteinG) || proteinG < 0 || proteinG > 600) {
    errors.push({ field: 'proteinG', message: 'Protein must be between 0g and 600g' });
  }

  const carbsG = Number(data.carbsG);
  if (isNaN(carbsG) || carbsG < 0 || carbsG > 1200) {
    errors.push({ field: 'carbsG', message: 'Carbs must be between 0g and 1200g' });
  }

  const fatG = Number(data.fatG);
  if (isNaN(fatG) || fatG < 0 || fatG > 600) {
    errors.push({ field: 'fatG', message: 'Fat must be between 0g and 600g' });
  }

  const validMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Post-Workout'];
  if (!data.mealType || !validMealTypes.includes(data.mealType)) {
    errors.push({ field: 'mealType', message: 'Meal type must be Breakfast, Lunch, Dinner, Snack, or Post-Workout' });
  }

  const isValid = errors.length === 0;

  let sanitizedData: MealLog | undefined = undefined;
  if (isValid) {
    sanitizedData = {
      id: data.id || `meal_${Date.now()}`,
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || new Date().toTimeString().slice(0, 5),
      mealTitle,
      mealType: data.mealType!,
      calories: Math.round(calories),
      proteinG: roundToOneDecimal(proteinG),
      carbsG: roundToOneDecimal(carbsG),
      fatG: roundToOneDecimal(fatG),
      fiberG: data.fiberG !== undefined ? roundToOneDecimal(Number(data.fiberG)) : 0,
      isEstimated: data.isEstimated ?? false,
      items: data.items || [],
      photoUrl: data.photoUrl,
      notes: data.notes ? sanitizeString(data.notes) : undefined,
      userNotes: data.userNotes ? sanitizeString(data.userNotes) : undefined,
      analysis: data.analysis,
    };
  }

  return {
    isValid,
    errors,
    sanitizedData,
  };
}
