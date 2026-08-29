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
