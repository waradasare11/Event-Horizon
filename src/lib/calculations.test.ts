import { describe, it, expect } from 'vitest';
import { calculateBMR, calculateTDEE } from './calc/energy';
import { calculateMacros, calculateGoalTimeline } from './calc/macros';
import { enforceSafetyFloors, SAFETY_FLOORS } from './calc/safety-floors';
import { calculateDailyMacrosSum, calculateWorkoutStreak, calculateGoalProgress } from './calc/dailyStats';
import { 
  INDIAN_NUTRITION_DATABASE, 
  calculateIngredientMacros, 
  findBestMatchingIndianIngredient, 
  searchIndianIngredients 
} from './indianNutritionData';
import { MealLog, WorkoutCompletionLog } from '../types';

describe('Energy & Caloric Calculations (Mifflin-St Jeor & ISSN)', () => {
  it('calculates male BMR accurately', () => {
    // 10 * 75kg + 6.25 * 175cm - 5 * 25yo + 5 = 750 + 1093.75 - 125 + 5 = 1723.75 -> 1724
    const bmr = calculateBMR('male', 75, 175, 25);
    expect(bmr).toBe(1724);
  });

  it('calculates female BMR accurately', () => {
    // 10 * 60kg + 6.25 * 165cm - 5 * 28yo - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330
    const bmr = calculateBMR('female', 60, 165, 28);
    expect(bmr).toBe(1330);
  });

  it('computes TDEE according to training frequency multipliers', () => {
    const bmr = 1700;
    expect(calculateTDEE(bmr, 0)).toBe(Math.round(1700 * 1.375));
    expect(calculateTDEE(bmr, 4)).toBe(Math.round(1700 * 1.55));
    expect(calculateTDEE(bmr, 5)).toBe(Math.round(1700 * 1.725));
    expect(calculateTDEE(bmr, 7)).toBe(Math.round(1700 * 1.9));
  });

  it('enforces safety floors for male and female trainees', () => {
    const lowMale = enforceSafetyFloors(1200, 'male', 70);
    expect(lowMale.safeCalories).toBe(SAFETY_FLOORS.MIN_CALORIES_MALE);
    expect(lowMale.warning).toBeDefined();

    const lowFemale = enforceSafetyFloors(1000, 'female', 55);
    expect(lowFemale.safeCalories).toBe(SAFETY_FLOORS.MIN_CALORIES_FEMALE);

    const normal = enforceSafetyFloors(2100, 'male', 75);
    expect(normal.safeCalories).toBe(2100);
    expect(normal.warning).toBeUndefined();
  });

  it('calculates macros for fat loss, muscle building, and recomp with exact ratios', () => {
    const cut = calculateMacros(2500, 'lose_fat', 'male', 75, 'vegetarian');
    expect(cut.dailyCalories).toBeLessThan(2500);
    expect(cut.proteinG).toBe(Math.round(75 * 2.2)); // 165g
    expect(cut.weeklyRateKg).toBe(-0.5);

    const bulk = calculateMacros(2500, 'build_muscle', 'male', 75, 'vegetarian');
    expect(bulk.dailyCalories).toBe(2500 + SAFETY_FLOORS.SURPLUS_CALORIES_LEAN_BULK);
    expect(bulk.proteinG).toBe(Math.round(75 * 1.8));

    const veganCut = calculateMacros(2500, 'lose_fat', 'male', 75, 'vegan');
    expect(veganCut.proteinG).toBe(Math.round(75 * 2.4)); // +0.2 bonus for vegan biological value
  });

  it('calculates realistic goal timeline', () => {
    const timeline = calculateGoalTimeline(80, 75, -0.5);
    expect(timeline.weeksNeeded).toBe(10);
    expect(timeline.projectedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('Indian Nutrient Database & Per-Gram Ingredient Scaling', () => {
  it('contains vital authentic Indian foods in database', () => {
    expect(INDIAN_NUTRITION_DATABASE.length).toBeGreaterThanOrEqual(30);
    
    const soya = INDIAN_NUTRITION_DATABASE.find(i => i.id === 'soya-chunks-nutrela');
    expect(soya).toBeDefined();
    expect(soya?.per100g.proteinG).toBe(52.0); // 52g protein per 100g dry soya chunks

    const paneer = INDIAN_NUTRITION_DATABASE.find(i => i.id === 'paneer-full-fat');
    expect(paneer).toBeDefined();
    expect(paneer?.per100g.proteinG).toBe(18.3);
  });

  it('calculates exact per-gram values for standard 50g Soya Chunks', () => {
    const soya = INDIAN_NUTRITION_DATABASE.find(i => i.id === 'soya-chunks-nutrela')!;
    const calculated50g = calculateIngredientMacros(soya, 50);

    expect(calculated50g.grams).toBe(50);
    expect(calculated50g.proteinG).toBe(26.0); // 52 * 0.5
    expect(calculated50g.calories).toBe(Math.round(345 * 0.5));
    expect(calculated50g.carbsG).toBe(Number((33.0 * 0.5).toFixed(1)));
  });

  it('calculates multi-ingredient plate combination macros accurately', () => {
    const paneer = INDIAN_NUTRITION_DATABASE.find(i => i.id === 'paneer-full-fat')!;
    const rice = INDIAN_NUTRITION_DATABASE.find(i => i.id === 'basmati-rice-cooked')!;
    const ghee = INDIAN_NUTRITION_DATABASE.find(i => i.id === 'desi-cow-ghee')!;

    const mPaneer = calculateIngredientMacros(paneer, 100); // 100g Paneer
    const mRice = calculateIngredientMacros(rice, 150); // 150g Cooked Rice
    const mGhee = calculateIngredientMacros(ghee, 10); // 10g Ghee

    const totalProtein = Number((mPaneer.proteinG + mRice.proteinG + mGhee.proteinG).toFixed(1));
    const totalCarbs = Number((mPaneer.carbsG + mRice.carbsG + mGhee.carbsG).toFixed(1));
    const totalFat = Number((mPaneer.fatG + mRice.fatG + mGhee.fatG).toFixed(1));
    const totalCalories = mPaneer.calories + mRice.calories + mGhee.calories;

    expect(totalProtein).toBeGreaterThan(15);
    expect(totalCarbs).toBeGreaterThan(30);
    expect(totalFat).toBeGreaterThan(25);
    expect(totalCalories).toBeGreaterThan(400);
  });

  it('searches and finds ingredients by English, Hindi, and regional aliases', () => {
    const matchKhichdi = findBestMatchingIndianIngredient('Sabudana Khichdi');
    expect(matchKhichdi).toBeDefined();

    const matchDahi = findBestMatchingIndianIngredient('curd');
    expect(matchDahi).toBeDefined();

    const results = searchIndianIngredients('roti');
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('Daily Macros Summation & Nutritional Precision', () => {
  it('correctly aggregates empty meal logs with zero defaults', () => {
    const totals = calculateDailyMacrosSum([], '2026-08-28');
    expect(totals.calories).toBe(0);
    expect(totals.proteinG).toBe(0);
    expect(totals.carbsG).toBe(0);
    expect(totals.fatG).toBe(0);
    expect(totals.fiberG).toBe(0);
    expect(totals.mealCount).toBe(0);
    expect(totals.itemsCount).toBe(0);
  });

  it('aggregates multiple meal logs for a specific target date', () => {
    const sampleMeals: MealLog[] = [
      {
        id: 'm1',
        mealTitle: 'High-Protein Breakfast',
        mealType: 'Breakfast',
        date: '2026-08-28',
        time: '08:30',
        calories: 520,
        proteinG: 42.5,
        carbsG: 50.0,
        fatG: 14.0,
        fiberG: 8.5,
        isEstimated: false,
        items: [
          { name: 'Soya Chunks', portionDescription: '100g', weightG: 100, calories: 200, proteinG: 30.0, carbsG: 15.0, fatG: 1.0 },
          { name: 'Oats Bowl', portionDescription: '1 bowl', weightG: 150, calories: 320, proteinG: 12.5, carbsG: 35.0, fatG: 13.0 }
        ]
      },
      {
        id: 'm2',
        mealTitle: 'Paneer Bowl Lunch',
        mealType: 'Lunch',
        date: '2026-08-28',
        time: '13:30',
        calories: 650,
        proteinG: 38.0,
        carbsG: 60.0,
        fatG: 22.0,
        fiberG: 7.0,
        isEstimated: false,
        items: []
      },
      {
        id: 'm3',
        mealTitle: 'Yesterday Dinner',
        mealType: 'Dinner',
        date: '2026-08-27',
        time: '20:00',
        calories: 700,
        proteinG: 45.0,
        carbsG: 70.0,
        fatG: 20.0,
        fiberG: 5.0,
        isEstimated: false,
        items: []
      }
    ];

    const todayTotals = calculateDailyMacrosSum(sampleMeals, '2026-08-28');
    expect(todayTotals.mealCount).toBe(2);
    expect(todayTotals.calories).toBe(1170); // 520 + 650
    expect(todayTotals.proteinG).toBe(80.5); // 42.5 + 38.0
    expect(todayTotals.carbsG).toBe(110.0); // 50.0 + 60.0
    expect(todayTotals.fatG).toBe(36.0); // 14.0 + 22.0
    expect(todayTotals.fiberG).toBe(15.5); // 8.5 + 7.0
  });

  it('preserves floating point precision without cumulative arithmetic drift', () => {
    const microMeals: MealLog[] = [
      { id: '1', mealTitle: 'Snack 1', mealType: 'Snack', date: '2026-08-28', time: '10:00', calories: 100, proteinG: 10.1, carbsG: 12.2, fatG: 2.3, fiberG: 0, isEstimated: false, items: [] },
      { id: '2', mealTitle: 'Snack 2', mealType: 'Snack', date: '2026-08-28', time: '11:00', calories: 100, proteinG: 10.2, carbsG: 12.2, fatG: 2.3, fiberG: 0, isEstimated: false, items: [] },
      { id: '3', mealTitle: 'Snack 3', mealType: 'Snack', date: '2026-08-28', time: '12:00', calories: 100, proteinG: 10.3, carbsG: 12.2, fatG: 2.3, fiberG: 0, isEstimated: false, items: [] },
    ];

    const totals = calculateDailyMacrosSum(microMeals, '2026-08-28');
    expect(totals.proteinG).toBe(30.6); // 10.1 + 10.2 + 10.3 exactly
    expect(totals.carbsG).toBe(36.6);
    expect(totals.fatG).toBe(6.9);
  });
});

describe('Workout Streak Calculation & Consistency Resilience', () => {
  it('returns 0 streak for empty logs', () => {
    const res = calculateWorkoutStreak([], new Date('2026-08-28T12:00:00Z'));
    expect(res.currentStreak).toBe(0);
    expect(res.longestStreak).toBe(0);
    expect(res.isTodayCompleted).toBe(false);
  });

  it('calculates continuous streak when today is logged', () => {
    const logs: WorkoutCompletionLog[] = [
      { id: '1', date: '2026-08-28', dayId: 'd1', dayName: 'Push A', durationMin: 60, exercisesCompleted: 6, totalExercises: 6 },
      { id: '2', date: '2026-08-27', dayId: 'd2', dayName: 'Pull A', durationMin: 60, exercisesCompleted: 6, totalExercises: 6 },
      { id: '3', date: '2026-08-26', dayId: 'd3', dayName: 'Legs A', durationMin: 60, exercisesCompleted: 6, totalExercises: 6 },
      { id: '4', date: '2026-08-25', dayId: 'd4', dayName: 'Rest Day', durationMin: 0, exercisesCompleted: 0, totalExercises: 0, isRestDay: true },
    ];

    const res = calculateWorkoutStreak(logs, new Date('2026-08-28T12:00:00Z'));
    expect(res.currentStreak).toBe(4);
    expect(res.isTodayCompleted).toBe(true);
    expect(res.isYesterdayCompleted).toBe(true);
    expect(res.longestStreak).toBe(4);
  });

  it('preserves streak when today is unlogged but yesterday is logged (active morning)', () => {
    const logs: WorkoutCompletionLog[] = [
      { id: '1', date: '2026-08-27', dayId: 'd2', dayName: 'Pull A', durationMin: 60, exercisesCompleted: 6, totalExercises: 6 },
      { id: '2', date: '2026-08-26', dayId: 'd3', dayName: 'Legs A', durationMin: 60, exercisesCompleted: 6, totalExercises: 6 },
    ];

    const res = calculateWorkoutStreak(logs, new Date('2026-08-28T09:00:00Z'));
    expect(res.currentStreak).toBe(2);
    expect(res.isTodayCompleted).toBe(false);
    expect(res.isYesterdayCompleted).toBe(true);
  });

  it('breaks streak when a day is skipped', () => {
    const logs: WorkoutCompletionLog[] = [
      { id: '1', date: '2026-08-28', dayId: 'd1', dayName: 'Push A', durationMin: 60, exercisesCompleted: 6, totalExercises: 6 },
      // 2026-08-27 skipped
      { id: '2', date: '2026-08-26', dayId: 'd3', dayName: 'Legs A', durationMin: 60, exercisesCompleted: 6, totalExercises: 6 },
      { id: '3', date: '2026-08-25', dayId: 'd4', dayName: 'Upper', durationMin: 60, exercisesCompleted: 6, totalExercises: 6 },
    ];

    const res = calculateWorkoutStreak(logs, new Date('2026-08-28T12:00:00Z'));
    expect(res.currentStreak).toBe(1); // only today
    expect(res.longestStreak).toBe(2); // 25th + 26th
  });

  it('handles multiple workouts on the same day without duplicating streak count', () => {
    const logs: WorkoutCompletionLog[] = [
      { id: '1a', date: '2026-08-28', dayId: 'd1', dayName: 'Morning Cardio', durationMin: 30, exercisesCompleted: 1, totalExercises: 1 },
      { id: '1b', date: '2026-08-28', dayId: 'd1', dayName: 'Evening Hypertrophy', durationMin: 60, exercisesCompleted: 6, totalExercises: 6 },
      { id: '2', date: '2026-08-27', dayId: 'd2', dayName: 'Pull A', durationMin: 60, exercisesCompleted: 6, totalExercises: 6 },
    ];

    const res = calculateWorkoutStreak(logs, new Date('2026-08-28T12:00:00Z'));
    expect(res.currentStreak).toBe(2);
  });

  it('computes goal progress and percentage accurately', () => {
    const cutProgress = calculateGoalProgress(75, 80, 70, 'lose_fat');
    expect(cutProgress.pct).toBe(50);
    expect(cutProgress.remainingKg).toBe(5);
    expect(cutProgress.isAchieved).toBe(false);

    const achieved = calculateGoalProgress(70, 80, 70, 'lose_fat');
    expect(achieved.pct).toBe(100);
    expect(achieved.remainingKg).toBe(0);
    expect(achieved.isAchieved).toBe(true);
  });
});

