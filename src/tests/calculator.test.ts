import { describe, it, expect } from 'vitest';
import {
  calculateDailyMacrosSum,
  calculateWorkoutStreak,
  calculateGoalProgress,
} from '../lib/calc/dailyStats';
import { MealLog, WorkoutCompletionLog } from '../types';

function mockMeal(partial: Partial<MealLog> & { id: string; date: string }): MealLog {
  return {
    mealTitle: 'Test Meal',
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    fiberG: 0,
    mealType: 'Lunch',
    time: '12:00',
    isEstimated: false,
    items: [],
    ...partial,
  };
}

function mockWorkout(partial: Partial<WorkoutCompletionLog> & { id: string; date: string; dayName: string }): WorkoutCompletionLog {
  return {
    dayId: 'day_1',
    exercisesCompleted: 5,
    totalExercises: 5,
    durationMin: 45,
    ...partial,
  };
}

describe('calculateDailyMacrosSum', () => {
  it('returns zeros for empty or null meal logs array', () => {
    const resEmpty = calculateDailyMacrosSum([]);
    expect(resEmpty).toEqual({
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
      mealCount: 0,
      itemsCount: 0,
    });

    const resUndefined = calculateDailyMacrosSum(undefined as any);
    expect(resUndefined.calories).toBe(0);
    expect(resUndefined.mealCount).toBe(0);
  });

  it('accurately calculates macros for a specific target date', () => {
    const meals: MealLog[] = [
      mockMeal({
        id: '1',
        date: '2025-05-10',
        mealTitle: 'High Protein Oats & Whey',
        calories: 450,
        proteinG: 38.5,
        carbsG: 52.0,
        fatG: 8.5,
        fiberG: 6.0,
      }),
      mockMeal({
        id: '2',
        date: '2025-05-10',
        mealTitle: 'Grilled Chicken & Rice',
        calories: 620,
        proteinG: 55.0,
        carbsG: 65.0,
        fatG: 14.0,
        fiberG: 4.5,
      }),
      mockMeal({
        id: '3',
        date: '2025-05-11', // Different date, must be excluded
        mealTitle: 'Post Workout Shake',
        calories: 300,
        proteinG: 40.0,
        carbsG: 20.0,
        fatG: 4.0,
      }),
    ];

    const totals = calculateDailyMacrosSum(meals, '2025-05-10');
    expect(totals.calories).toBe(1070);
    expect(totals.proteinG).toBe(93.5);
    expect(totals.carbsG).toBe(117.0);
    expect(totals.fatG).toBe(22.5);
    expect(totals.fiberG).toBe(10.5);
    expect(totals.mealCount).toBe(2);
  });

  it('prioritizes item-level ingredient breakdowns when present', () => {
    const meals: MealLog[] = [
      mockMeal({
        id: 'm1',
        date: '2025-06-01',
        mealTitle: 'Salmon & Asparagus Bowl',
        calories: 0, // Should be computed from items
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
        items: [
          {
            name: 'Wild Atlantic Salmon',
            portionDescription: '180g fillet',
            weightG: 180,
            calories: 374,
            proteinG: 36.2,
            carbsG: 0,
            fatG: 23.4,
          },
          {
            name: 'Steamed Asparagus',
            portionDescription: '100g spears',
            weightG: 100,
            calories: 20,
            proteinG: 2.2,
            carbsG: 3.8,
            fatG: 0.2,
            fiberG: 2.1,
          },
        ],
      }),
    ];

    const res = calculateDailyMacrosSum(meals, '2025-06-01');
    expect(res.calories).toBe(394);
    expect(res.proteinG).toBe(38.4);
    expect(res.carbsG).toBe(3.8);
    expect(res.fatG).toBe(23.6);
    expect(res.fiberG).toBe(2.1);
    expect(res.itemsCount).toBe(2);
  });

  it('handles floating point addition precision stably (0.1 + 0.2)', () => {
    const meals: MealLog[] = [
      mockMeal({ id: '1', date: '2025-01-01', mealTitle: 'A', calories: 100, proteinG: 0.1, carbsG: 0.1, fatG: 0.1 }),
      mockMeal({ id: '2', date: '2025-01-01', mealTitle: 'B', calories: 100, proteinG: 0.2, carbsG: 0.2, fatG: 0.2 }),
    ];
    const res = calculateDailyMacrosSum(meals, '2025-01-01');
    expect(res.proteinG).toBe(0.3);
    expect(res.carbsG).toBe(0.3);
    expect(res.fatG).toBe(0.3);
  });

  it('resiliently ignores malformed, null, or negative entries', () => {
    const meals: any[] = [
      null,
      undefined,
      { id: '1', date: '2025-01-01', calories: -50, proteinG: -10, carbsG: 20, fatG: 5 },
      { id: '2', date: '2025-01-01', calories: 'invalid', proteinG: 'NaN', carbsG: 10, fatG: 2 },
    ];
    const res = calculateDailyMacrosSum(meals, '2025-01-01');
    expect(res.calories).toBe(0);
    expect(res.proteinG).toBe(0);
    expect(res.carbsG).toBe(30);
    expect(res.fatG).toBe(7);
  });
});

describe('calculateWorkoutStreak', () => {
  it('returns streak 0 for empty logs', () => {
    const res = calculateWorkoutStreak([]);
    expect(res.currentStreak).toBe(0);
    expect(res.longestStreak).toBe(0);
    expect(res.loggedDates).toEqual([]);
    expect(res.isTodayCompleted).toBe(false);
    expect(res.isYesterdayCompleted).toBe(false);
  });

  it('calculates current streak when completed today', () => {
    const refDate = new Date(2025, 4, 15); // May 15, 2025
    const logs: WorkoutCompletionLog[] = [
      mockWorkout({ id: '1', date: '2025-05-15', dayName: 'Push A', exercisesCompleted: 5, totalExercises: 5 }),
      mockWorkout({ id: '2', date: '2025-05-14', dayName: 'Pull A', exercisesCompleted: 6, totalExercises: 6 }),
      mockWorkout({ id: '3', date: '2025-05-13', dayName: 'Legs A', exercisesCompleted: 5, totalExercises: 5 }),
    ];

    const res = calculateWorkoutStreak(logs, refDate);
    expect(res.currentStreak).toBe(3);
    expect(res.longestStreak).toBe(3);
    expect(res.isTodayCompleted).toBe(true);
    expect(res.isYesterdayCompleted).toBe(true);
  });

  it('preserves streak if today is not yet completed but yesterday was completed', () => {
    const refDate = new Date(2025, 4, 15); // May 15, 2025 (today)
    const logs: WorkoutCompletionLog[] = [
      mockWorkout({ id: '1', date: '2025-05-14', dayName: 'Pull A', exercisesCompleted: 6, totalExercises: 6 }),
      mockWorkout({ id: '2', date: '2025-05-13', dayName: 'Legs A', exercisesCompleted: 5, totalExercises: 5 }),
      mockWorkout({ id: '3', date: '2025-05-12', dayName: 'Rest Active Recovery', exercisesCompleted: 1, totalExercises: 1, isRestDay: true }),
    ];

    const res = calculateWorkoutStreak(logs, refDate);
    expect(res.currentStreak).toBe(3);
    expect(res.isTodayCompleted).toBe(false);
    expect(res.isYesterdayCompleted).toBe(true);
  });

  it('breaks current streak when gap day exists before today', () => {
    const refDate = new Date(2025, 4, 15); // May 15, 2025
    const logs: WorkoutCompletionLog[] = [
      mockWorkout({ id: '1', date: '2025-05-15', dayName: 'Push A', exercisesCompleted: 5, totalExercises: 5 }),
      // Missing May 14
      mockWorkout({ id: '2', date: '2025-05-13', dayName: 'Legs A', exercisesCompleted: 5, totalExercises: 5 }),
      mockWorkout({ id: '3', date: '2025-05-12', dayName: 'Chest', exercisesCompleted: 5, totalExercises: 5 }),
    ];

    const res = calculateWorkoutStreak(logs, refDate);
    expect(res.currentStreak).toBe(1);
    expect(res.longestStreak).toBe(2);
  });

  it('accurately bridges leap year transitions (2024-02-28 -> 2024-02-29 -> 2024-03-01)', () => {
    const leapDayRef = new Date(2024, 2, 1); // March 1, 2024
    const leapYearLogs: WorkoutCompletionLog[] = [
      mockWorkout({ id: '1', date: '2024-02-28', dayName: 'Day 1', exercisesCompleted: 4, totalExercises: 4 }),
      mockWorkout({ id: '2', date: '2024-02-29', dayName: 'Leap Day Workout', exercisesCompleted: 5, totalExercises: 5 }),
      mockWorkout({ id: '3', date: '2024-03-01', dayName: 'Day 3', exercisesCompleted: 6, totalExercises: 6 }),
    ];

    const res = calculateWorkoutStreak(leapYearLogs, leapDayRef);
    expect(res.currentStreak).toBe(3);
    expect(res.longestStreak).toBe(3);
  });

  it('accurately handles non-leap year Feb 28 to Mar 1 transitions (2023-02-28 -> 2023-03-01)', () => {
    const nonLeapRef = new Date(2023, 2, 1); // March 1, 2023
    const nonLeapLogs: WorkoutCompletionLog[] = [
      mockWorkout({ id: '1', date: '2023-02-28', dayName: 'End of Feb', exercisesCompleted: 4, totalExercises: 4 }),
      mockWorkout({ id: '2', date: '2023-03-01', dayName: 'Start of March', exercisesCompleted: 5, totalExercises: 5 }),
    ];

    const res = calculateWorkoutStreak(nonLeapLogs, nonLeapRef);
    expect(res.currentStreak).toBe(2);
    expect(res.longestStreak).toBe(2);
  });

  it('handles multiple workouts on the same day without inflating streak count', () => {
    const refDate = new Date(2025, 6, 20); // July 20, 2025
    const logs: WorkoutCompletionLog[] = [
      mockWorkout({ id: '1', date: '2025-07-20', dayName: 'Morning Cardio', exercisesCompleted: 1, totalExercises: 1 }),
      mockWorkout({ id: '2', date: '2025-07-20', dayName: 'Evening Heavy Squats', exercisesCompleted: 6, totalExercises: 6 }),
      mockWorkout({ id: '3', date: '2025-07-19', dayName: 'Upper Body Power', exercisesCompleted: 5, totalExercises: 5 }),
    ];

    const res = calculateWorkoutStreak(logs, refDate);
    expect(res.currentStreak).toBe(2);
    expect(res.longestStreak).toBe(2);
    expect(res.loggedDates).toEqual(['2025-07-20', '2025-07-19']);
  });

  it('handles unsorted and non-chronological workout logs gracefully', () => {
    const refDate = new Date(2025, 0, 5); // Jan 5, 2025
    const logs: WorkoutCompletionLog[] = [
      mockWorkout({ id: '1', date: '2025-01-02', dayName: 'Day 2', exercisesCompleted: 4, totalExercises: 4 }),
      mockWorkout({ id: '2', date: '2025-01-05', dayName: 'Day 5', exercisesCompleted: 4, totalExercises: 4 }),
      mockWorkout({ id: '3', date: '2025-01-01', dayName: 'Day 1', exercisesCompleted: 4, totalExercises: 4 }),
      mockWorkout({ id: '4', date: '2025-01-04', dayName: 'Day 4', exercisesCompleted: 4, totalExercises: 4 }),
      mockWorkout({ id: '5', date: '2025-01-03', dayName: 'Day 3', exercisesCompleted: 4, totalExercises: 4 }),
    ];

    const res = calculateWorkoutStreak(logs, refDate);
    expect(res.currentStreak).toBe(5);
    expect(res.longestStreak).toBe(5);
  });
});

describe('calculateGoalProgress', () => {
  it('computes fat loss goal progress correctly', () => {
    // Started at 90kg, target 80kg, currently 85kg -> 50% achieved
    const res = calculateGoalProgress(85, 90, 80, 'lose_fat');
    expect(res.pct).toBe(50);
    expect(res.remainingKg).toBe(5);
    expect(res.isAchieved).toBe(false);

    // Reached 79kg -> 100% achieved
    const resAchieved = calculateGoalProgress(79, 90, 80, 'lose_fat');
    expect(resAchieved.pct).toBe(100);
    expect(resAchieved.isAchieved).toBe(true);
  });

  it('computes muscle building goal progress correctly', () => {
    // Started at 70kg, target 75kg, currently 72.5kg -> 50% achieved
    const res = calculateGoalProgress(72.5, 70, 75, 'build_muscle');
    expect(res.pct).toBe(50);
    expect(res.remainingKg).toBe(2.5);
    expect(res.isAchieved).toBe(false);

    // Reached 76kg -> 100% achieved
    const resAchieved = calculateGoalProgress(76, 70, 75, 'build_muscle');
    expect(resAchieved.pct).toBe(100);
    expect(resAchieved.isAchieved).toBe(true);
  });

  it('handles identical start and target weight', () => {
    const res = calculateGoalProgress(75, 75, 75, 'recomp');
    expect(res.pct).toBe(100);
    expect(res.remainingKg).toBe(0);
    expect(res.isAchieved).toBe(true);
  });
});
