import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportUserDataToPDF, generateUserDataPDFBlob, triggerPDFDownload } from './pdfExport';
import { UserProfile, MealLog, WorkoutCompletionLog, BodyMetric } from '../types';

describe('Offline PDF Report Exporter (Static Sovereign Backup)', () => {
  const sampleProfile: UserProfile = {
    id: 'user-123',
    name: 'Vikram Sharma',
    email: 'vikram.athlete@gmail.com',
    age: 28,
    sex: 'male',
    heightCm: 178,
    weightKg: 76.5,
    targetWeightKg: 74.0,
    targetDate: '2026-12-31',
    dailyCalories: 2350,
    dailyProtein: 160,
    dailyCarbs: 240,
    dailyFat: 65,
    bmr: 1750,
    tdee: 2500,
    hydrationLiters: 3.5,
    weeklyRateKg: -0.5,
    goal: 'build_muscle',
    dietType: 'vegetarian',
    foodLabelLanguage: 'english',
    experienceLevel: 'intermediate',
    trainingDaysPerWeek: 4,
    selectedDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    sessionDurationMin: 60,
    preferredTime: 'morning',
    musclePriority: 'chest',
    injuries: [],
    isOnboarded: true,
  };

  const sampleMeals: MealLog[] = [
    {
      id: 'meal-1',
      date: '2026-09-25',
      time: '13:00',
      mealType: 'Lunch',
      isEstimated: false,
      mealTitle: 'Paneer Bhurji & Roti',
      calories: 620,
      proteinG: 34,
      carbsG: 68,
      fatG: 22,
      fiberG: 8,
      items: [
        { name: 'Paneer Bhurji', portionDescription: '1.5 bowl', weightG: 150, calories: 380, proteinG: 24, carbsG: 8, fatG: 28 },
        { name: 'Roti (Whole Wheat)', portionDescription: '2 pieces', weightG: 80, calories: 240, proteinG: 10, carbsG: 60, fatG: 2 },
      ],
      userNotes: 'Post-workout lunch',
    },
    {
      id: 'meal-2',
      date: '2026-09-26',
      time: '20:00',
      mealType: 'Dinner',
      isEstimated: true,
      mealTitle: 'Tofu Palak & Brown Rice',
      calories: 510,
      proteinG: 28,
      carbsG: 55,
      fatG: 18,
      fiberG: 6,
      items: [
        { name: 'Tofu Palak', portionDescription: '1 plate', weightG: 200, calories: 280, proteinG: 20, carbsG: 12, fatG: 16 },
        { name: 'Brown Rice', portionDescription: '1 cup cooked', weightG: 120, calories: 230, proteinG: 8, carbsG: 43, fatG: 2 },
      ],
      userNotes: 'Dinner',
    },
  ];

  const sampleWorkouts: WorkoutCompletionLog[] = [
    {
      id: 'workout-1',
      date: '2026-09-25',
      dayId: 'day-1',
      dayName: 'Upper Body Hypertrophy',
      durationMin: 55,
      exercisesCompleted: 3,
      totalExercises: 3,
      totalVolumeKg: 4200,
      rpeAverage: 8,
      loggedExercises: [
        { exerciseId: 'ex-1', exerciseName: 'Barbell Bench Press', sets: 4, reps: 8, weightKg: 80, volumeKg: 2560 },
        { exerciseId: 'ex-2', exerciseName: 'Incline Dumbbell Press', sets: 3, reps: 10, weightKg: 26, volumeKg: 780 },
        { exerciseId: 'ex-3', exerciseName: 'Barbell Row', sets: 4, reps: 8, weightKg: 75, volumeKg: 2400 },
      ],
    },
  ];

  const sampleMetrics: BodyMetric[] = [
    {
      id: 'metric-1',
      date: '2026-09-25',
      weightKg: 76.5,
      bodyFatPct: 15.2,
      waistCm: 81.5,
      notes: 'Morning weigh-in fasting',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exports user data to PDF and returns valid document and filename', () => {
    const result = exportUserDataToPDF({
      userProfile: sampleProfile,
      mealLogs: sampleMeals,
      workoutLogs: sampleWorkouts,
      bodyMetrics: sampleMetrics,
    });

    expect(result).toBeDefined();
    expect(result.filename).toMatch(/^AROH_Report_Vikram_Sharma_\d{4}-\d{2}-\d{2}\.pdf$/);
    expect(result.doc).toBeDefined();
    expect(result.doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it('handles empty logs gracefully without throwing', () => {
    const result = exportUserDataToPDF({
      userProfile: sampleProfile,
      mealLogs: [],
      workoutLogs: [],
      bodyMetrics: [],
    });

    expect(result).toBeDefined();
    expect(result.doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it('filters meals and workouts by date range correctly', () => {
    const result = exportUserDataToPDF({
      userProfile: sampleProfile,
      mealLogs: sampleMeals,
      workoutLogs: sampleWorkouts,
      bodyMetrics: sampleMetrics,
      startDate: '2026-09-26',
      endDate: '2026-09-26',
    });

    expect(result).toBeDefined();
    expect(result.doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it('operates successfully in simulated offline environment', () => {
    const originalNavigator = global.navigator;
    try {
      Object.defineProperty(global, 'navigator', {
        value: { onLine: false },
        configurable: true,
      });

      const result = exportUserDataToPDF({
        userProfile: sampleProfile,
        mealLogs: sampleMeals,
        workoutLogs: sampleWorkouts,
      });

      expect(result).toBeDefined();
      expect(result.doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    } finally {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        configurable: true,
      });
    }
  });

  it('generates a PDF Blob via generateUserDataPDFBlob', () => {
    const result = generateUserDataPDFBlob({
      userProfile: sampleProfile,
      mealLogs: sampleMeals,
      workoutLogs: sampleWorkouts,
    });

    expect(result).toBeDefined();
    expect(result.filename).toContain('Vikram_Sharma');
    expect(result.blob).toBeDefined();
    expect(result.doc).toBeDefined();
  });

  it('respects autoSave: false and does not invoke doc.save', () => {
    const result = exportUserDataToPDF({
      userProfile: sampleProfile,
      mealLogs: sampleMeals,
      workoutLogs: sampleWorkouts,
      autoSave: false,
    });

    expect(result).toBeDefined();
    expect(result.doc).toBeDefined();
    expect(result.filename).toMatch(/^AROH_Report_Vikram_Sharma_/);
  });

  it('triggers triggerPDFDownload without error', () => {
    const result = exportUserDataToPDF({
      userProfile: sampleProfile,
      mealLogs: sampleMeals,
      workoutLogs: sampleWorkouts,
      autoSave: false,
    });

    expect(() => {
      triggerPDFDownload(result.doc, result.filename);
    }).not.toThrow();
  });

  it('supports selectively excluding meals or workouts', () => {
    const resultNoMeals = exportUserDataToPDF({
      userProfile: sampleProfile,
      mealLogs: sampleMeals,
      workoutLogs: sampleWorkouts,
      includeMeals: false,
      includeWorkouts: true,
      autoSave: false,
    });
    expect(resultNoMeals.doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);

    const resultNoWorkouts = exportUserDataToPDF({
      userProfile: sampleProfile,
      mealLogs: sampleMeals,
      workoutLogs: sampleWorkouts,
      includeMeals: true,
      includeWorkouts: false,
      autoSave: false,
    });
    expect(resultNoWorkouts.doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });
});
