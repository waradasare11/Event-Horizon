import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  buildUserMemorySnapshot, 
  restoreUserMemory, 
  sanitizeSnapshotForDrive,
  USER_MEMORY_DRIVE_FOLDER,
  USER_MEMORY_FILE_NAME
} from './userMemory';
import { 
  saveStoredMealLogs, 
  getStoredMealLogs, 
  setCurrentActiveEmail, 
  addMealLog,
  getStoredCoachMessages,
  saveStoredCoachMessages,
  clearStoredCoachMessages,
  getStoredSmartShoppingList,
  saveStoredSmartShoppingList,
  clearStoredSmartShoppingList
} from './storage';
import { MealLog, UserProfile } from '../types';
import { INITIAL_USER_PROFILE } from './sample-data';

// Mock localStorage for node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('Per-Gmail Memory Isolation & Verification Test', () => {
  beforeEach(() => {
    localStorage.clear();
    setCurrentActiveEmail('');
    vi.restoreAllMocks();
  });

  it('TEST 1: User A logs paneer, signs out, User B on same browser sees 0 meals. A signs in, paneer returns.', () => {
    const userAEmail = 'athlete.a@gmail.com';
    const userBEmail = 'athlete.b@gmail.com';

    // Step 1: User A signs in
    setCurrentActiveEmail(userAEmail);

    const paneerMeal: MealLog = {
      id: 'meal_paneer_1',
      date: '2026-09-15',
      mealTitle: 'Paneer Bhurji & Roti',
      calories: 450,
      proteinG: 28,
      carbsG: 35,
      fatG: 22,
      fiberG: 4,
      time: '12:30 PM',
      mealType: 'Lunch',
      isEstimated: false,
      items: [],
      notes: '200g low-fat paneer with turmeric'
    };

    // User A logs paneer
    addMealLog(paneerMeal, userAEmail);

    // Verify User A sees paneer
    const userAMeals = getStoredMealLogs(userAEmail);
    expect(userAMeals.length).toBe(1);
    expect(userAMeals[0].mealTitle).toBe('Paneer Bhurji & Roti');

    // Step 2: User A signs out
    setCurrentActiveEmail('');

    // Step 3: User B signs in on the same browser
    setCurrentActiveEmail(userBEmail);

    // User B on same browser sees 0 meals
    const userBMeals = getStoredMealLogs(userBEmail);
    expect(userBMeals.length).toBe(0);

    // Step 4: User A signs back in
    setCurrentActiveEmail(userAEmail);

    // Paneer returns for User A
    const restoredUserAMeals = getStoredMealLogs(userAEmail);
    expect(restoredUserAMeals.length).toBe(1);
    expect(restoredUserAMeals[0].mealTitle).toBe('Paneer Bhurji & Roti');
  });

  it('TEST 2: Strict email check - If restored snapshot.email !== auth email, discard', async () => {
    const activeAuthEmail = 'user.b@gmail.com';
    const foreignSnapshot = {
      version: 1,
      savedAt: new Date().toISOString(),
      email: 'user.a@gmail.com', // Mismatched email!
      profile: { email: 'user.a@gmail.com', name: 'User A' } as any,
      mealLogs: [{ id: 'm1', mealTitle: 'Paneer' }] as any,
      workoutLogs: [],
    };

    // Pass mismatched snapshot to restoreUserMemory for user.b@gmail.com
    const result = await restoreUserMemory(activeAuthEmail, foreignSnapshot);

    // Must discard completely and return null to prevent cross-account leak
    expect(result).toBeNull();
  });

  it('TEST 3: Drive folder is "AROH AI" and contains AROH_UserMemory.json whose email equals User A', () => {
    expect(USER_MEMORY_DRIVE_FOLDER).toBe('AROH AI');
    expect(USER_MEMORY_FILE_NAME).toBe('AROH_UserMemory.json');

    const profileA: UserProfile = {
      ...INITIAL_USER_PROFILE,
      id: 'athlete_a',
      name: 'Athlete A',
      age: 28,
      sex: 'male',
      heightCm: 178,
      weightKg: 78,
      targetWeightKg: 75,
      targetDate: '2026-12-31',
      goal: 'lose_fat',
      dietType: 'vegetarian',
      experienceLevel: 'intermediate',
      trainingDaysPerWeek: 5,
      selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      sessionDurationMin: 45,
      preferredTime: 'evening',
      musclePriority: 'chest',
      injuries: []
    };

    const paneerMeal: MealLog = {
      id: 'meal_p1',
      date: '2026-09-15',
      mealTitle: 'Tawa Paneer Tikka',
      calories: 520,
      proteinG: 34,
      carbsG: 18,
      fatG: 32,
      fiberG: 3,
      time: '1:00 PM',
      mealType: 'Lunch',
      isEstimated: false,
      items: []
    };

    const snapshot = buildUserMemorySnapshot('athlete.a@gmail.com', profileA, [paneerMeal], []);
    expect(snapshot.email).toBe('athlete.a@gmail.com');
    expect(snapshot.mealLogs.length).toBe(1);
    expect(snapshot.mealLogs[0].mealTitle).toBe('Tawa Paneer Tikka');

    const sanitized = sanitizeSnapshotForDrive(snapshot);
    const serialized = JSON.stringify(sanitized);

    expect(serialized).toContain('"email":"athlete.a@gmail.com"');
    expect(serialized).toContain('Tawa Paneer Tikka');
  });

  it('TEST 4: Coach chat and shopping list are isolated and never leak across users', () => {
    const userAEmail = 'athlete.a@gmail.com';
    const userBEmail = 'athlete.b@gmail.com';

    // User A chats with coach
    saveStoredCoachMessages([{ id: 'c1', role: 'user', content: 'How much paneer for 30g protein?' }], userAEmail);
    // User A has shopping list
    saveStoredSmartShoppingList({
      id: 'sl1',
      name: 'Paneer Diet',
      daysMultiplier: 7,
      lastCompiledAt: new Date().toISOString(),
      items: [{ id: 'i1', name: 'Low-Fat Paneer', category: 'Lean Protein', amount: '1kg', isPurchased: false }]
    }, userAEmail);

    // User B reads coach messages
    const userBMessages = getStoredCoachMessages(userBEmail);
    expect(userBMessages).toEqual([]);

    // User B reads shopping list
    const userBShopping = getStoredSmartShoppingList(userBEmail);
    expect(userBShopping).toBeNull();

    // User A reads coach messages and shopping list
    const userAMessages = getStoredCoachMessages(userAEmail);
    expect(userAMessages.length).toBe(1);
    expect(userAMessages[0].content).toContain('How much paneer');

    const userAShopping = getStoredSmartShoppingList(userAEmail);
    expect(userAShopping?.name).toBe('Paneer Diet');
  });
});
