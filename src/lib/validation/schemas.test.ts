import { describe, it, expect } from 'vitest';
import { 
  validateUserProfile, 
  validateBodyMetric, 
  validateMealInput, 
  sanitizeString 
} from './schemas';

describe('Centralized Validation Schemas', () => {
  describe('sanitizeString', () => {
    it('strips dangerous HTML angle brackets and trims whitespace', () => {
      const input = '  <script>alert("xss")</script> Warad Asare  ';
      const output = sanitizeString(input);
      expect(output).toBe('scriptalert("xss")/script Warad Asare');
    });
  });

  describe('validateUserProfile', () => {
    it('accepts a valid user profile and sanitizes numbers', () => {
      const validProfile = {
        name: '  Warad Asare  ',
        age: 24,
        sex: 'male' as const,
        heightCm: 175.45,
        weightKg: 72.34,
        targetWeightKg: 70.0,
        goal: 'build_muscle' as const,
        dietType: 'vegetarian' as const,
        dailyStepTarget: 10000,
        dailySleepDurationHours: 8,
      };

      const result = validateUserProfile(validProfile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedData?.name).toBe('Warad Asare');
      expect(result.sanitizedData?.heightCm).toBe(175.5);
      expect(result.sanitizedData?.weightKg).toBe(72.3);
    });

    it('rejects invalid age and out-of-range weights', () => {
      const invalidProfile = {
        name: '',
        age: 140, // out of range
        sex: 'invalid_sex' as any,
        heightCm: 20, // too short
        weightKg: 400, // too heavy
        targetWeightKg: 10, // too light
        goal: 'invalid_goal' as any,
        dietType: 'invalid_diet' as any,
      };

      const result = validateUserProfile(invalidProfile);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(4);
      expect(result.errors.some((e) => e.field === 'name')).toBe(true);
      expect(result.errors.some((e) => e.field === 'age')).toBe(true);
      expect(result.errors.some((e) => e.field === 'sex')).toBe(true);
      expect(result.errors.some((e) => e.field === 'heightCm')).toBe(true);
      expect(result.errors.some((e) => e.field === 'weightKg')).toBe(true);
      expect(result.errors.some((e) => e.field === 'targetWeightKg')).toBe(true);
    });
  });

  describe('validateBodyMetric', () => {
    it('accepts valid metric entry and rounds fields properly', () => {
      const metric = {
        weightKg: 74.88,
        bodyFatPct: 15.67,
        waistCm: 81.34,
        notes: ' <strong style="color:red">Morning fasted weight</strong> ',
      };

      const result = validateBodyMetric(metric);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData?.weightKg).toBe(74.9);
      expect(result.sanitizedData?.bodyFatPct).toBe(15.7);
      expect(result.sanitizedData?.waistCm).toBe(81.3);
      expect(result.sanitizedData?.notes).toBe('strong style="color:red"Morning fasted weight/strong');
    });

    it('rejects unreasonable body fat % or invalid weights', () => {
      const invalidMetric = {
        weightKg: 15, // below 25kg
        bodyFatPct: 95, // above 70%
      };

      const result = validateBodyMetric(invalidMetric);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'weightKg')).toBe(true);
      expect(result.errors.some((e) => e.field === 'bodyFatPct')).toBe(true);
    });
  });

  describe('validateMealInput', () => {
    it('validates and sanitizes a valid meal log', () => {
      const meal = {
        mealTitle: 'Paneer Tikka Bowl',
        mealType: 'Lunch' as const,
        calories: 520.4,
        proteinG: 34.65,
        carbsG: 42.12,
        fatG: 18.89,
        fiberG: 6.2,
      };

      const result = validateMealInput(meal);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData?.calories).toBe(520);
      expect(result.sanitizedData?.proteinG).toBe(34.7);
      expect(result.sanitizedData?.carbsG).toBe(42.1);
      expect(result.sanitizedData?.fatG).toBe(18.9);
    });

    it('rejects negative macro values and missing title', () => {
      const invalidMeal = {
        mealTitle: '',
        mealType: 'Dinner' as const,
        calories: -50,
        proteinG: -10,
        carbsG: 100,
        fatG: 20,
      };

      const result = validateMealInput(invalidMeal);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'mealTitle')).toBe(true);
      expect(result.errors.some((e) => e.field === 'calories')).toBe(true);
      expect(result.errors.some((e) => e.field === 'proteinG')).toBe(true);
    });
  });
});
