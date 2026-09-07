import { CheckInRecord, BodyMetric, WorkoutCompletionLog, MealLog, UserProfile } from '../types';

export interface GranularExportOptions {
  userProfile: UserProfile;
  bodyMetrics: BodyMetric[];
  checkIns: CheckInRecord[];
  workoutLogs: WorkoutCompletionLog[];
  mealLogs: MealLog[];
  dateRange?: 'all' | '7d' | '30d' | '90d' | 'custom';
  startDate?: string;
  endDate?: string;
  includeWorkouts?: boolean;
  includeMeals?: boolean;
  includeMetrics?: boolean;
  includeCheckIns?: boolean;
  includeProfileMetadata?: boolean;
  delimiter?: ',' | ';';
}

/**
 * Filter items by date range
 */
function filterByDateRange<T extends { date: string }>(
  items: T[],
  dateRange: 'all' | '7d' | '30d' | '90d' | 'custom' = 'all',
  startDate?: string,
  endDate?: string
): T[] {
  if (!items || items.length === 0) return [];
  if (dateRange === 'all') return items;

  const today = new Date();
  let startBoundary: string | undefined = startDate;
  let endBoundary: string | undefined = endDate || today.toISOString().split('T')[0];

  if (dateRange === '7d') {
    const d = new Date();
    d.setDate(today.getDate() - 7);
    startBoundary = d.toISOString().split('T')[0];
  } else if (dateRange === '30d') {
    const d = new Date();
    d.setDate(today.getDate() - 30);
    startBoundary = d.toISOString().split('T')[0];
  } else if (dateRange === '90d') {
    const d = new Date();
    d.setDate(today.getDate() - 90);
    startBoundary = d.toISOString().split('T')[0];
  }

  return items.filter((item) => {
    if (startBoundary && item.date < startBoundary) return false;
    if (endBoundary && item.date > endBoundary) return false;
    return true;
  });
}

/**
 * Generates CSV string based on granular export options
 */
export function generateGranularCSVString(options: GranularExportOptions): string {
  const {
    userProfile,
    bodyMetrics,
    checkIns,
    workoutLogs,
    mealLogs,
    dateRange = 'all',
    startDate,
    endDate,
    includeWorkouts = true,
    includeMeals = true,
    includeMetrics = true,
    includeCheckIns = true,
    includeProfileMetadata = true,
    delimiter = ',',
  } = options;

  const filteredMetrics = filterByDateRange(bodyMetrics, dateRange, startDate, endDate);
  const filteredWorkouts = filterByDateRange(workoutLogs, dateRange, startDate, endDate);
  const filteredMeals = filterByDateRange(mealLogs, dateRange, startDate, endDate);
  const filteredCheckIns = filterByDateRange(checkIns, dateRange, startDate, endDate);

  const rows: string[][] = [];

  // Metadata Section
  if (includeProfileMetadata) {
    rows.push(['=== AROH - GRANULAR USER DATA EXPORT ===']);
    rows.push(['Export Generated Date', new Date().toISOString()]);
    rows.push(['User Name', userProfile.name]);
    rows.push(['User Email', userProfile.email || 'N/A']);
    rows.push(['Date Range Filter', `${dateRange} (${startDate || 'Start'} to ${endDate || 'Latest'})`]);
    rows.push(['Primary Goal', userProfile.goal]);
    rows.push(['Diet Type', userProfile.dietType]);
    rows.push(['Current Weight (kg)', userProfile.weightKg.toString()]);
    rows.push(['Target Weight (kg)', userProfile.targetWeightKg.toString()]);
    rows.push(['Target Date', userProfile.targetDate]);
    rows.push(['Caloric Target (kcal)', (userProfile.dailyCalories || 2150).toString()]);
    rows.push(['Protein Target (g)', (userProfile.dailyProtein || 165).toString()]);
    rows.push(['Carbs Target (g)', (userProfile.dailyCarbs || 220).toString()]);
    rows.push(['Fat Target (g)', (userProfile.dailyFat || 65).toString()]);
    rows.push([]);
  }

  // Section 1: Body Metrics (Weight History)
  if (includeMetrics) {
    rows.push(['=== BODY COMPOSITION & WEIGHT LOGS ===']);
    rows.push(['Date', 'Weight (kg)', 'Body Fat (%)', 'Waist (cm)', 'Notes']);
    if (filteredMetrics && filteredMetrics.length > 0) {
      filteredMetrics.forEach((m) => {
        rows.push([
          m.date,
          m.weightKg.toFixed(1),
          m.bodyFatPct ? m.bodyFatPct.toFixed(1) : 'N/A',
          m.waistCm ? m.waistCm.toFixed(1) : 'N/A',
          `"${(m.notes || '').replace(/"/g, '""')}"`,
        ]);
      });
    } else {
      rows.push(['No body metric records match the selected date range']);
    }
    rows.push([]);
  }

  // Section 2: Workout Completion History
  if (includeWorkouts) {
    rows.push(['=== WORKOUT SESSIONS LOG ===']);
    rows.push(['Date', 'Session Name', 'Duration (min)', 'Exercises Done', 'Total Exercises', 'Avg RPE', 'Rest Day', 'Total Volume (kg)', 'Athlete Notes & Reflections']);
    if (filteredWorkouts && filteredWorkouts.length > 0) {
      filteredWorkouts.forEach((w) => {
        rows.push([
          w.date,
          `"${(w.dayName || 'Workout').replace(/"/g, '""')}"`,
          w.durationMin.toString(),
          w.exercisesCompleted.toString(),
          w.totalExercises.toString(),
          w.rpeAverage ? w.rpeAverage.toString() : 'N/A',
          w.isRestDay ? 'Yes' : 'No',
          w.totalVolumeKg ? w.totalVolumeKg.toString() : '0',
          `"${(w.notes || '').replace(/"/g, '""')}"`,
        ]);
      });
    } else {
      rows.push(['No workout records match the selected date range']);
    }
    rows.push([]);
  }

  // Section 3: Daily Nutrition Logs
  if (includeMeals) {
    rows.push(['=== NUTRITION & MEAL LOGS ===']);
    rows.push(['Date', 'Time', 'Meal Type', 'Food / Meal Title', 'Calories (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Fiber (g)', 'User Notes']);
    if (filteredMeals && filteredMeals.length > 0) {
      filteredMeals.forEach((meal) => {
        rows.push([
          meal.date,
          meal.time || '',
          meal.mealType,
          `"${(meal.mealTitle || 'Meal').replace(/"/g, '""')}"`,
          meal.calories.toString(),
          meal.proteinG.toString(),
          meal.carbsG.toString(),
          meal.fatG.toString(),
          meal.fiberG ? meal.fiberG.toString() : '0',
          `"${(meal.userNotes || meal.notes || '').replace(/"/g, '""')}"`,
        ]);
      });
    } else {
      rows.push(['No nutrition records match the selected date range']);
    }
    rows.push([]);
  }

  // Section 4: Weekly AI Check-In Records
  if (includeCheckIns) {
    rows.push(['=== WEEKLY AI CHECK-IN & ADJUSTMENT RECORDS ===']);
    rows.push(['Date', 'Weight (kg)', 'Adherence (1-5)', 'Energy (1-5)', 'Caloric Adjustment', 'AI Feedback Summary', 'Notes']);
    if (filteredCheckIns && filteredCheckIns.length > 0) {
      filteredCheckIns.forEach((c) => {
        rows.push([
          c.date,
          c.weightKg.toString(),
          c.adherenceRating.toString(),
          c.energyLevel.toString(),
          `${c.caloricAdjustment > 0 ? '+' : ''}${c.caloricAdjustment} kcal`,
          `"${c.aiFeedbackSummary.replace(/"/g, '""')}"`,
          `"${(c.notes || '').replace(/"/g, '""')}"`,
        ]);
      });
    } else {
      rows.push(['No weekly check-ins match the selected date range']);
    }
  }

  return rows.map((e) => e.join(delimiter)).join('\n');
}

/**
 * Triggers browser download for granular CSV export
 */
export function exportGranularUserDataToCSV(options: GranularExportOptions): void {
  const csvText = generateGranularCSVString(options);
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);

  const sanitizedUserName = options.userProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const rangeTag = options.dateRange || 'all';
  link.setAttribute('download', `aroh_${sanitizedUserName}_data_${rangeTag}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Legacy export for backward compatibility
 */
export function exportUserDataToCSV(
  userProfile: UserProfile,
  bodyMetrics: BodyMetric[],
  checkIns: CheckInRecord[],
  workoutLogs: WorkoutCompletionLog[],
  mealLogs: MealLog[]
) {
  exportGranularUserDataToCSV({
    userProfile,
    bodyMetrics,
    checkIns,
    workoutLogs,
    mealLogs,
    dateRange: 'all',
  });
}

