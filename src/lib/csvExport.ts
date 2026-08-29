import { CheckInRecord, BodyMetric, WorkoutCompletionLog, MealLog, UserProfile } from '../types';

/**
 * Generates and triggers download of comprehensive CSV progress data
 */
export function exportUserDataToCSV(
  userProfile: UserProfile,
  bodyMetrics: BodyMetric[],
  checkIns: CheckInRecord[],
  workoutLogs: WorkoutCompletionLog[],
  mealLogs: MealLog[]
) {
  const rows: string[][] = [];

  // Metadata Section
  rows.push(['=== PEAKFORM AI - COMPREHENSIVE USER DATA EXPORT ===']);
  rows.push(['Export Generated Date', new Date().toISOString()]);
  rows.push(['User Name', userProfile.name]);
  rows.push(['Primary Goal', userProfile.goal]);
  rows.push(['Diet Type', userProfile.dietType]);
  rows.push(['Current Weight (kg)', userProfile.weightKg.toString()]);
  rows.push(['Target Weight (kg)', userProfile.targetWeightKg.toString()]);
  rows.push(['Target Date', userProfile.targetDate]);
  rows.push(['Caloric Target (kcal)', (userProfile.dailyCalories || 2150).toString()]);
  rows.push(['Protein Target (g)', (userProfile.dailyProtein || 165).toString()]);
  rows.push([]);

  // Section 1: Body Metrics (Weight History)
  rows.push(['=== 1. BODY COMPOSITION & WEIGHT LOGS ===']);
  rows.push(['Date', 'Weight (kg)', 'Body Fat (%)', 'Waist (cm)', 'Notes']);
  if (bodyMetrics && bodyMetrics.length > 0) {
    bodyMetrics.forEach((m) => {
      rows.push([
        m.date,
        m.weightKg.toFixed(1),
        m.bodyFatPct ? m.bodyFatPct.toFixed(1) : 'N/A',
        m.waistCm ? m.waistCm.toFixed(1) : 'N/A',
        `"${(m.notes || '').replace(/"/g, '""')}"`,
      ]);
    });
  } else {
    rows.push(['No body metric logs recorded yet']);
  }
  rows.push([]);

  // Section 2: Workout Completion History
  rows.push(['=== 2. WORKOUT SESSIONS LOG ===']);
  rows.push(['Date', 'Session Name', 'Duration (min)', 'Exercises Done', 'Total Exercises', 'Avg RPE', 'Rest Day', 'Notes']);
  if (workoutLogs && workoutLogs.length > 0) {
    workoutLogs.forEach((w) => {
      rows.push([
        w.date,
        `"${w.dayName.replace(/"/g, '""')}"`,
        w.durationMin.toString(),
        w.exercisesCompleted.toString(),
        w.totalExercises.toString(),
        w.rpeAverage ? w.rpeAverage.toString() : 'N/A',
        w.isRestDay ? 'Yes' : 'No',
        `"${(w.notes || '').replace(/"/g, '""')}"`,
      ]);
    });
  } else {
    rows.push(['No workout logs recorded yet']);
  }
  rows.push([]);

  // Section 3: Daily Nutrition Logs
  rows.push(['=== 3. NUTRITION & MEAL LOGS ===']);
  rows.push(['Date', 'Time', 'Meal Type', 'Food / Meal Title', 'Calories (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Fiber (g)', 'User Notes']);
  if (mealLogs && mealLogs.length > 0) {
    mealLogs.forEach((meal) => {
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
        `"${(meal.userNotes || '').replace(/"/g, '""')}"`,
      ]);
    });
  } else {
    rows.push(['No meal logs recorded yet']);
  }
  rows.push([]);

  // Section 4: Weekly AI Check-In Records
  rows.push(['=== 4. WEEKLY AI CHECK-IN & ADJUSTMENT RECORDS ===']);
  rows.push(['Date', 'Weight (kg)', 'Adherence (1-5)', 'Energy (1-5)', 'Caloric Adjustment', 'AI Feedback Summary', 'Notes']);
  if (checkIns && checkIns.length > 0) {
    checkIns.forEach((c) => {
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
    rows.push(['No weekly check-ins recorded yet']);
  }

  // Convert array to CSV string
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const sanitizedUserName = userProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `peakform_${sanitizedUserName}_data_export_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
