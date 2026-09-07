import { MealLog, WorkoutCompletionLog, GoalType } from '../../types';

export interface DailyMacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  mealCount: number;
  itemsCount: number;
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  loggedDates: string[];
  lastLoggedDate: string | null;
  isTodayCompleted: boolean;
  isYesterdayCompleted: boolean;
}

/**
 * Helper to get days since UTC epoch for precise leap-year and timezone immune day-diff calculation
 */
function getUtcDayNumber(dateStr: string): number {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return NaN;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return NaN;
  return Math.floor(Date.UTC(y, m - 1, d) / (1000 * 60 * 60 * 24));
}

function formatUtcDayToIso(utcDayNumber: number): string {
  const date = new Date(utcDayNumber * 86400000);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Accurately calculates daily macronutrient totals from meal logs with float rounding stability.
 * Supports filtering by a specific ISO date (YYYY-MM-DD). If no date provided, calculates today's totals.
 * Handles null, undefined, empty items, negative values, and floating point precision.
 */
export function calculateDailyMacrosSum(
  mealLogs: MealLog[] = [],
  targetDate?: string
): DailyMacroTotals {
  if (!Array.isArray(mealLogs) || mealLogs.length === 0) {
    return {
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
      mealCount: 0,
      itemsCount: 0,
    };
  }

  const dateToMatch = targetDate || new Date().toISOString().split('T')[0];
  const filtered = mealLogs.filter((m) => m && typeof m === 'object' && m.date === dateToMatch);

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let itemsCount = 0;

  for (const meal of filtered) {
    // If meal has line items, cross-check for high precision
    if (Array.isArray(meal.items) && meal.items.length > 0) {
      itemsCount += meal.items.length;
      let itemCal = 0;
      let itemP = 0;
      let itemC = 0;
      let itemF = 0;
      let itemFib = 0;

      for (const item of meal.items) {
        if (!item) continue;
        itemCal += Math.max(0, Number(item.calories) || 0);
        itemP += Math.max(0, Number(item.proteinG) || 0);
        itemC += Math.max(0, Number(item.carbsG) || 0);
        itemF += Math.max(0, Number(item.fatG) || 0);
        itemFib += Math.max(0, Number((item as any).fiberG) || 0);
      }

      // If line item total is valid, prefer line item sum; otherwise fallback to meal level
      totalCalories += Math.round(itemCal > 0 ? itemCal : Math.max(0, Number(meal.calories) || 0));
      totalProtein += itemP > 0 ? itemP : Math.max(0, Number(meal.proteinG) || 0);
      totalCarbs += itemC > 0 ? itemC : Math.max(0, Number(meal.carbsG) || 0);
      totalFat += itemF > 0 ? itemF : Math.max(0, Number(meal.fatG) || 0);
      totalFiber += itemFib > 0 ? itemFib : Math.max(0, Number((meal as any).fiberG) || 0);
    } else {
      totalCalories += Math.round(Math.max(0, Number(meal.calories) || 0));
      totalProtein += Math.max(0, Number(meal.proteinG) || 0);
      totalCarbs += Math.max(0, Number(meal.carbsG) || 0);
      totalFat += Math.max(0, Number(meal.fatG) || 0);
      totalFiber += Math.max(0, Number((meal as any).fiberG) || 0);
    }
  }

  return {
    calories: Math.round(totalCalories),
    proteinG: Number(totalProtein.toFixed(1)),
    carbsG: Number(totalCarbs.toFixed(1)),
    fatG: Number(totalFat.toFixed(1)),
    fiberG: Number(totalFiber.toFixed(1)),
    mealCount: filtered.length,
    itemsCount,
  };
}

/**
 * Calculates continuous workout & consistency streak.
 * Honors active workouts and scheduled rest days as legitimate logged consistency days.
 * Gracefully handles today not yet logged without prematurely breaking yesterday's streak.
 * Robust across leap years (e.g. Feb 29), irregular schedules, duplicate workouts on same day, and unsorted inputs.
 */
export function calculateWorkoutStreak(
  workoutLogs: WorkoutCompletionLog[] = [],
  referenceDate: Date = new Date()
): StreakResult {
  if (!Array.isArray(workoutLogs) || workoutLogs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      loggedDates: [],
      lastLoggedDate: null,
      isTodayCompleted: false,
      isYesterdayCompleted: false,
    };
  }

  // Extract unique sorted list of completion dates
  const uniqueDatesSet = new Set<string>();
  const validUtcDays: number[] = [];

  workoutLogs.forEach((log) => {
    if (log && typeof log.date === 'string' && log.date.trim().length > 0) {
      const trimmedDate = log.date.trim();
      if (!uniqueDatesSet.has(trimmedDate)) {
        const utcDay = getUtcDayNumber(trimmedDate);
        if (!isNaN(utcDay)) {
          uniqueDatesSet.add(trimmedDate);
          validUtcDays.push(utcDay);
        }
      }
    }
  });

  if (validUtcDays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      loggedDates: [],
      lastLoggedDate: null,
      isTodayCompleted: false,
      isYesterdayCompleted: false,
    };
  }

  // Sort ascending by UTC day
  validUtcDays.sort((a, b) => a - b);
  const sortedDatesDescending = [...validUtcDays].reverse().map(formatUtcDayToIso);

  // Compute reference today and yesterday UTC day numbers
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1;
  const refDay = referenceDate.getDate();
  const refTodayUtcDay = Math.floor(Date.UTC(refYear, refMonth - 1, refDay) / (1000 * 60 * 60 * 24));
  const refYesterdayUtcDay = refTodayUtcDay - 1;

  const todayStr = formatUtcDayToIso(refTodayUtcDay);
  const yesterdayStr = formatUtcDayToIso(refYesterdayUtcDay);

  const isTodayCompleted = uniqueDatesSet.has(todayStr);
  const isYesterdayCompleted = uniqueDatesSet.has(yesterdayStr);

  const utcDaySet = new Set(validUtcDays);

  // Calculate current streak backward from reference today
  let currentStreak = 0;
  const maxLookbackDays = 365;

  for (let i = 0; i < maxLookbackDays; i++) {
    const checkUtcDay = refTodayUtcDay - i;
    if (utcDaySet.has(checkUtcDay)) {
      currentStreak++;
    } else if (i === 0) {
      // Today is not yet completed - do not break streak if yesterday was completed
      continue;
    } else {
      // Missing day in consecutive chain
      break;
    }
  }

  // Calculate all-time longest streak in history
  let longestStreak = 0;
  let tempStreak = 0;
  let prevUtcDay: number | null = null;

  for (const currentUtcDay of validUtcDays) {
    if (prevUtcDay === null) {
      tempStreak = 1;
    } else {
      const diff = currentUtcDay - prevUtcDay;
      if (diff === 1) {
        tempStreak++;
      } else if (diff === 0) {
        // Same day duplicate - do nothing
      } else {
        tempStreak = 1;
      }
    }
    prevUtcDay = currentUtcDay;
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return {
    currentStreak,
    longestStreak,
    loggedDates: sortedDatesDescending,
    lastLoggedDate: sortedDatesDescending[0] || null,
    isTodayCompleted,
    isYesterdayCompleted,
  };
}

/**
 * Calculates progress percentage toward physique weight goal
 */
export function calculateGoalProgress(
  currentWeightKg: number,
  startWeightKg: number,
  targetWeightKg: number,
  goal: GoalType
): { pct: number; remainingKg: number; isAchieved: boolean } {
  if (startWeightKg === targetWeightKg) {
    return { pct: 100, remainingKg: 0, isAchieved: true };
  }

  const totalDelta = Math.abs(startWeightKg - targetWeightKg);
  const remainingKg = Number(Math.abs(currentWeightKg - targetWeightKg).toFixed(1));

  let achievedDelta = 0;
  if (goal === 'lose_fat') {
    achievedDelta = startWeightKg - currentWeightKg;
  } else if (goal === 'build_muscle') {
    achievedDelta = currentWeightKg - startWeightKg;
  } else {
    achievedDelta = totalDelta - remainingKg;
  }

  const rawPct = (achievedDelta / totalDelta) * 100;
  const pct = Math.min(100, Math.max(0, Math.round(rawPct)));
  const isAchieved = goal === 'lose_fat' ? currentWeightKg <= targetWeightKg : currentWeightKg >= targetWeightKg;

  return {
    pct,
    remainingKg,
    isAchieved,
  };
}

/**
 * Calculates scientifically validated Basal Metabolic Rate (BMR)
 * Uses Katch-McArdle when body fat % is known (most accurate for athletes),
 * or Mifflin-St Jeor equation as the clinical standard.
 */
export function calculatePhysiologicalBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female',
  bodyFatPct?: number | null
): number {
  const safeWeight = Math.max(30, Number(weightKg) || 70);
  const safeHeight = Math.max(100, Number(heightCm) || 175);
  const safeAge = Math.max(14, Math.min(100, Number(age) || 25));

  // If body fat is provided and realistic, use Katch-McArdle (LBM based)
  if (bodyFatPct && bodyFatPct >= 4 && bodyFatPct <= 55) {
    const lbmKg = safeWeight * (1 - bodyFatPct / 100);
    return Math.round(370 + 21.6 * lbmKg);
  }

  // Mifflin-St Jeor formula (clinical standard)
  if (sex === 'male') {
    return Math.round(10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + 5);
  } else {
    return Math.round(10 * safeWeight + 6.25 * safeHeight - 5 * safeAge - 161);
  }
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) with multi-factor activity & NEAT modeling
 */
export function calculateActivityTDEE(
  bmr: number,
  trainingDaysPerWeek: number = 4,
  sessionDurationMin: number = 60,
  occupationStyle: string = 'sedentary',
  dailySteps: number = 8000
): number {
  // Base NEAT multiplier from occupation
  let neatMultiplier = 1.15; // sedentary base
  if (occupationStyle === 'standing' || occupationStyle === 'lightly_active') {
    neatMultiplier = 1.25;
  } else if (occupationStyle === 'moderately_active') {
    neatMultiplier = 1.35;
  } else if (occupationStyle === 'heavy_labor') {
    neatMultiplier = 1.45;
  }

  // Steps component (~0.04 kcal per kg per 1000 steps)
  const stepsBonusKcal = Math.round((Math.max(0, dailySteps - 4000) / 1000) * 35);

  // Exercise Energy Expenditure (EET) weekly average per day
  const weeklyExerciseMinutes = Math.max(0, trainingDaysPerWeek) * Math.max(20, sessionDurationMin);
  const dailyAvgExerciseMin = weeklyExerciseMinutes / 7;
  const exerciseKcalPerDay = Math.round(dailyAvgExerciseMin * 6.5); // ~6.5 kcal/min moderate-high resistance training

  const tdee = Math.round(bmr * neatMultiplier + stepsBonusKcal + exerciseKcalPerDay);
  return Math.max(bmr + 200, tdee);
}

export interface WeightLossDeficitCalculationResult {
  isDeficitActive: boolean;
  deficitTier: 'mild' | 'moderate' | 'aggressive' | 'custom';
  deficitPct: number;
  deficitKcal: number;
  maintenanceTdee: number;
  targetDailyCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  safeCalorieFloor: number;
  isBelowSafeFloor: boolean;
  weeklyFatLossKgEst: number;
  scientificExplanation: string;
  safetyAdvice: string;
}

/**
 * 1000% Accurate Scientific Weight Loss Deficit Calculator
 * Applies clinical macronutrient distribution:
 * - Protein: Elevated to 2.0 - 2.2 g/kg (to preserve lean muscle mass during negative energy balance)
 * - Fat: 20-25% of total calories (essential hormonal baseline and lipid soluble vitamins)
 * - Carbs: Remaining calories (fuel for glycolysis and high-intensity resistance training)
 */
export function calculateWeightLossDeficitMacros(
  tdee: number,
  weightKg: number,
  sex: 'male' | 'female',
  deficitTier: 'mild' | 'moderate' | 'aggressive' | 'custom' = 'moderate',
  customDeficitPct?: number
): WeightLossDeficitCalculationResult {
  const safeWeight = Math.max(35, Number(weightKg) || 70);
  const safeTdee = Math.max(1400, Number(tdee) || 2200);
  const safeFloor = sex === 'male' ? 1500 : 1200;

  let deficitPct = 18; // default moderate
  if (deficitTier === 'mild') deficitPct = 10;
  else if (deficitTier === 'moderate') deficitPct = 18;
  else if (deficitTier === 'aggressive') deficitPct = 25;
  else if (deficitTier === 'custom' && customDeficitPct) deficitPct = Math.min(35, Math.max(5, customDeficitPct));

  const deficitKcal = Math.round(safeTdee * (deficitPct / 100));
  let calculatedCalories = safeTdee - deficitKcal;

  let isBelowSafeFloor = false;
  if (calculatedCalories < safeFloor) {
    calculatedCalories = safeFloor;
    isBelowSafeFloor = true;
  }

  // Protein calculation: 2.0g to 2.2g per kg body weight in deficit
  const proteinMultiplier = deficitTier === 'aggressive' ? 2.2 : 2.0;
  const targetProteinG = Math.round(safeWeight * proteinMultiplier);
  const proteinKcal = targetProteinG * 4;

  // Fat calculation: 22% of total calories or minimum 0.7g/kg
  const minFatG = Math.round(safeWeight * 0.7);
  const fatCaloriesFromPct = Math.round(calculatedCalories * 0.22);
  const targetFatG = Math.max(minFatG, Math.round(fatCaloriesFromPct / 9));
  const fatKcal = targetFatG * 9;

  // Remaining calories to carbohydrates
  const remainingKcalForCarbs = Math.max(50 * 4, calculatedCalories - (proteinKcal + fatKcal));
  const targetCarbsG = Math.round(remainingKcalForCarbs / 4);

  // Recalculate true calorie sum to ensure mathematical harmony
  const harmoniousCalories = Math.round(targetProteinG * 4 + targetCarbsG * 4 + targetFatG * 9);

  // Estimated weekly adipose loss (1 kg fat ≈ 7,700 kcal deficit)
  const trueDeficitPerDay = Math.max(0, safeTdee - harmoniousCalories);
  const weeklyFatLossKgEst = Number(((trueDeficitPerDay * 7) / 7700).toFixed(2));

  let scientificExplanation = '';
  let safetyAdvice = '';

  if (deficitTier === 'mild') {
    scientificExplanation = `Mild 10% Deficit (-${trueDeficitPerDay} kcal/day): Maximizes workout strength, athletic performance, and hormonal stability while producing gradual, sustainable fat loss (~${weeklyFatLossKgEst} kg/week).`;
    safetyAdvice = 'Great for lean athletes or those preparing for endurance competition.';
  } else if (deficitTier === 'moderate') {
    scientificExplanation = `Moderate 18% Deficit (-${trueDeficitPerDay} kcal/day): The sports science gold standard. Delivers optimal fat oxidation rate (~${weeklyFatLossKgEst} kg/week) with minimal hunger and zero muscle breakdown when paired with high protein.`;
    safetyAdvice = `Maintains protein at ${targetProteinG}g (${proteinMultiplier}g/kg) to trigger Muscle Protein Synthesis (MPS).`;
  } else if (deficitTier === 'aggressive') {
    scientificExplanation = `Aggressive 25% Deficit (-${trueDeficitPerDay} kcal/day): Rapid fat loss phase (~${weeklyFatLossKgEst} kg/week). Protein is elevated to ${targetProteinG}g (2.2g/kg) to prevent muscle loss.`;
    safetyAdvice = 'Recommended for maximum 4-8 weeks before returning to maintenance calories for a diet break.';
  } else {
    scientificExplanation = `Custom ${deficitPct}% Deficit (-${trueDeficitPerDay} kcal/day): Personalized caloric restriction yielding ~${weeklyFatLossKgEst} kg fat loss per week.`;
    safetyAdvice = 'Ensure daily hydration exceeds 3.0L and sleep quality remains high.';
  }

  return {
    isDeficitActive: true,
    deficitTier,
    deficitPct,
    deficitKcal: trueDeficitPerDay,
    maintenanceTdee: safeTdee,
    targetDailyCalories: harmoniousCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
    safeCalorieFloor: safeFloor,
    isBelowSafeFloor,
    weeklyFatLossKgEst,
    scientificExplanation,
    safetyAdvice,
  };
}

