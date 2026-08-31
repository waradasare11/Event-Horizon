import { 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  Unsubscribe,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { 
  UserProfile, 
  MealLog, 
  WorkoutCompletionLog, 
  BodyMetric, 
  CustomGeneratedRecipe, 
  FormAnalysisResult,
  ShoppingListItem,
  HostGrantedSubscription
} from '../types';
import { addMealLog, deleteMealLog, addBodyMetric } from './storage';
import { 
  sanitizeUserProfile, 
  sanitizeMealLog, 
  sanitizeWorkoutLog, 
  sanitizeBodyMetric,
  sanitizeString,
  sanitizeNumber 
} from './securityMiddleware';

/**
 * Optimistically sync a MealLog: updates local state immediately,
 * then asynchronously writes to Firestore.
 */
export async function optimisticSyncMealLog(
  meal: MealLog, 
  onOptimisticUpdate?: (meals: MealLog[]) => void
): Promise<MealLog[]> {
  // 1. Immediately update local storage and execute callback for instant 0ms UI update
  const updatedMeals = addMealLog(meal);
  if (onOptimisticUpdate) {
    onOptimisticUpdate(updatedMeals);
  }

  // 2. Fire and await Firestore sync in the background
  try {
    await syncMealLog(meal);
  } catch (err) {
    console.warn('Firestore sync will retry automatically:', err);
  }

  return updatedMeals;
}

/**
 * Optimistically delete a MealLog: updates local state immediately,
 * then asynchronously deletes from Firestore.
 */
export async function optimisticDeleteMealLog(
  mealId: string, 
  onOptimisticUpdate?: (meals: MealLog[]) => void
): Promise<MealLog[]> {
  const updatedMeals = deleteMealLog(mealId);
  if (onOptimisticUpdate) {
    onOptimisticUpdate(updatedMeals);
  }

  try {
    await deleteMealLogFirestore(mealId);
  } catch (err) {
    console.warn('Firestore delete sync warning:', err);
  }

  return updatedMeals;
}

/**
 * Save or update the user's master profile in Firestore
 */
export async function syncUserProfile(profile: UserProfile): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const sanitized = sanitizeUserProfile(profile);
  const path = `users/${user.uid}`;
  try {
    const payload = {
      userId: user.uid,
      name: sanitized.name || user.displayName || 'Peak Athlete',
      email: user.email || sanitized.email || '',
      age: sanitized.age,
      sex: sanitized.sex,
      heightCm: sanitized.heightCm,
      weightKg: sanitized.weightKg,
      targetWeightKg: sanitized.targetWeightKg,
      targetDate: sanitized.targetDate || '',
      bodyFatPct: sanitized.bodyFatPct || null,
      goal: sanitized.goal,
      dietType: sanitized.dietType,
      experienceLevel: sanitized.experienceLevel,
      trainingDaysPerWeek: sanitized.trainingDaysPerWeek,
      sessionDurationMin: sanitized.sessionDurationMin,
      preferredTime: sanitized.preferredTime,
      musclePriority: sanitized.musclePriority,
      bmr: sanitized.bmr,
      tdee: sanitized.tdee,
      dailyCalories: sanitized.dailyCalories,
      dailyProtein: sanitized.dailyProtein,
      dailyCarbs: sanitized.dailyCarbs,
      dailyFat: sanitized.dailyFat,
      hydrationLiters: sanitized.hydrationLiters,
      weeklyRateKg: sanitized.weeklyRateKg,
      isOnboarded: sanitized.isOnboarded,
      subscription: sanitized.subscription || null,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save or update a MealLog in Firestore
 */
export async function syncMealLog(meal: MealLog): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeId = (meal.id || `meal_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `users/${user.uid}/mealLogs/${safeId}`;
  try {
    const payload = {
      userId: user.uid,
      mealLogId: safeId,
      date: meal.date,
      time: meal.time || '12:00',
      mealType: meal.mealType,
      mealTitle: meal.mealTitle,
      calories: Math.round(meal.calories),
      proteinG: Number(meal.proteinG.toFixed(1)),
      carbsG: Number(meal.carbsG.toFixed(1)),
      fatG: Number(meal.fatG.toFixed(1)),
      fiberG: Number((meal.fiberG || 0).toFixed(1)),
      sodiumMg: meal.sodiumMg || 0,
      calciumMg: meal.calciumMg || 0,
      potassiumMg: meal.potassiumMg || 0,
      userNotes: meal.userNotes || '',
      isEstimated: Boolean(meal.isEstimated),
      items: meal.items || [],
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid, 'mealLogs', safeId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a MealLog from Firestore
 */
export async function deleteMealLogFirestore(mealId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeId = mealId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `users/${user.uid}/mealLogs/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', user.uid, 'mealLogs', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save or update a WorkoutLog in Firestore
 */
export async function syncWorkoutLog(log: WorkoutCompletionLog): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeId = (log.id || `wl_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `users/${user.uid}/workoutLogs/${safeId}`;
  try {
    const payload = {
      userId: user.uid,
      workoutLogId: safeId,
      date: log.date,
      dayId: log.dayId || 'day_1',
      dayName: log.dayName,
      durationMin: log.durationMin || 45,
      exercisesCompleted: log.exercisesCompleted,
      totalExercises: log.totalExercises,
      rpeAverage: log.rpeAverage || 8.0,
      isRestDay: Boolean(log.isRestDay),
      notes: log.notes || '',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid, 'workoutLogs', safeId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a WorkoutLog from Firestore
 */
export async function deleteWorkoutLogFirestore(logId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeId = logId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `users/${user.uid}/workoutLogs/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', user.uid, 'workoutLogs', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save or update BodyMetric in Firestore
 */
export async function syncBodyMetric(metric: BodyMetric): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeId = (metric.id || `bm_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `users/${user.uid}/bodyMetrics/${safeId}`;
  try {
    const payload = {
      userId: user.uid,
      metricId: safeId,
      date: metric.date,
      weightKg: Number(metric.weightKg.toFixed(1)),
      bodyFatPct: metric.bodyFatPct ? Number(metric.bodyFatPct.toFixed(1)) : null,
      waistCm: metric.waistCm ? Number(metric.waistCm.toFixed(1)) : null,
      notes: metric.notes || '',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid, 'bodyMetrics', safeId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save or update CustomRecipe in Firestore
 */
export async function syncCustomRecipe(recipe: CustomGeneratedRecipe): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeId = (recipe.id || `rec_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `users/${user.uid}/customRecipes/${safeId}`;
  try {
    const payload = {
      userId: user.uid,
      recipeId: safeId,
      recipeName: recipe.recipeName,
      headlineTag: recipe.headlineTag || 'High Protein',
      description: recipe.description || '',
      mealCategory: recipe.mealCategory || 'Lunch',
      prepTimeMin: recipe.prepTimeMin || 15,
      cookTimeMin: recipe.cookTimeMin || 15,
      servings: recipe.servings || 1,
      totalCalories: Math.round(recipe.totalCalories),
      proteinG: Number(recipe.proteinG.toFixed(1)),
      carbsG: Number(recipe.carbsG.toFixed(1)),
      fatG: Number(recipe.fatG.toFixed(1)),
      fiberG: Number((recipe.fiberG || 0).toFixed(1)),
      ingredients: recipe.ingredients || [],
      stepByStepInstructions: recipe.stepByStepInstructions || [],
      chefScienceTip: recipe.chefScienceTip || '',
      bodyCompBenefit: recipe.bodyCompBenefit || '',
      createdAt: recipe.createdAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid, 'customRecipes', safeId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save FormAnalysis in Firestore
 */
export async function syncFormAnalysis(analysis: FormAnalysisResult): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeId = (analysis.id || `fa_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `users/${user.uid}/formAnalyses/${safeId}`;
  try {
    const payload = {
      userId: user.uid,
      analysisId: safeId,
      exerciseName: analysis.exerciseIdentified,
      formScore: Math.round(analysis.formScore),
      verdict: analysis.verdict,
      injuryRiskRating: analysis.injuryRiskRating,
      overallAssessment: analysis.overallAssessment,
      barPathQuality: analysis.barPathQuality,
      jointMechanics: analysis.jointMechanics || [],
      keyStrengths: analysis.keyStrengths || [],
      mechanicalFaults: analysis.mechanicalFaults || [],
      actionableCuesNextSet: analysis.actionableCuesNextSet || [],
      scientificTakeaway: analysis.scientificTakeaway,
      mediaUrl: analysis.mediaUrl || null,
      createdAt: analysis.createdAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid, 'formAnalyses', safeId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save or update a ShoppingListItem in Firestore
 */
export async function syncShoppingListItem(item: ShoppingListItem): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeId = (item.id || `item_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `users/${user.uid}/shoppingList/${safeId}`;
  try {
    const payload = {
      userId: user.uid,
      id: safeId,
      name: item.name,
      category: item.category,
      amount: item.amount,
      isPurchased: Boolean(item.isPurchased),
      notes: item.notes || '',
      mealSources: item.mealSources || [],
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid, 'shoppingList', safeId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a ShoppingListItem from Firestore
 */
export async function deleteShoppingListItemFirestore(itemId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeId = itemId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `users/${user.uid}/shoppingList/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', user.uid, 'shoppingList', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Setup Real-Time Listeners for the Authenticated User
 */
export function subscribeUserData(
  userId: string,
  callbacks: {
    onProfile?: (profile: Partial<UserProfile>) => void;
    onMealLogs?: (meals: MealLog[]) => void;
    onWorkoutLogs?: (logs: WorkoutCompletionLog[]) => void;
    onBodyMetrics?: (metrics: BodyMetric[]) => void;
    onCustomRecipes?: (recipes: CustomGeneratedRecipe[]) => void;
    onFormAnalyses?: (analyses: FormAnalysisResult[]) => void;
    onShoppingList?: (items: ShoppingListItem[]) => void;
  }
): Unsubscribe[] {
  const unsubs: Unsubscribe[] = [];

  // 1. Profile Doc
  const profileRef = doc(db, 'users', userId);
  unsubs.push(
    onSnapshot(
      profileRef,
      (snap) => {
        if (snap.exists() && callbacks.onProfile) {
          callbacks.onProfile(snap.data() as Partial<UserProfile>);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      }
    )
  );

  // 2. Meal Logs
  const mealsRef = collection(db, 'users', userId, 'mealLogs');
  unsubs.push(
    onSnapshot(
      mealsRef,
      (snap) => {
        if (callbacks.onMealLogs) {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as unknown as MealLog[];
          callbacks.onMealLogs(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}/mealLogs`);
      }
    )
  );

  // 3. Workout Logs
  const workoutsRef = collection(db, 'users', userId, 'workoutLogs');
  unsubs.push(
    onSnapshot(
      workoutsRef,
      (snap) => {
        if (callbacks.onWorkoutLogs) {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as unknown as WorkoutCompletionLog[];
          callbacks.onWorkoutLogs(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}/workoutLogs`);
      }
    )
  );

  // 4. Body Metrics
  const metricsRef = collection(db, 'users', userId, 'bodyMetrics');
  unsubs.push(
    onSnapshot(
      metricsRef,
      (snap) => {
        if (callbacks.onBodyMetrics) {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as unknown as BodyMetric[];
          callbacks.onBodyMetrics(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}/bodyMetrics`);
      }
    )
  );

  // 5. Custom Recipes
  const recipesRef = collection(db, 'users', userId, 'customRecipes');
  unsubs.push(
    onSnapshot(
      recipesRef,
      (snap) => {
        if (callbacks.onCustomRecipes) {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as unknown as CustomGeneratedRecipe[];
          callbacks.onCustomRecipes(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}/customRecipes`);
      }
    )
  );

  // 6. Form Analyses
  const formRef = collection(db, 'users', userId, 'formAnalyses');
  unsubs.push(
    onSnapshot(
      formRef,
      (snap) => {
        if (callbacks.onFormAnalyses) {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as unknown as FormAnalysisResult[];
          callbacks.onFormAnalyses(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}/formAnalyses`);
      }
    )
  );

  // 7. Shopping List
  const shoppingRef = collection(db, 'users', userId, 'shoppingList');
  unsubs.push(
    onSnapshot(
      shoppingRef,
      (snap) => {
        if (callbacks.onShoppingList) {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as unknown as ShoppingListItem[];
          callbacks.onShoppingList(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}/shoppingList`);
      }
    )
  );

  return unsubs;
}

/**
 * Sanitize email to be a safe Firestore document ID
 */
export function sanitizeEmailForDocId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Save or update a host granted subscription in Firestore
 */
export async function syncHostGrantedSubscription(grant: HostGrantedSubscription): Promise<void> {
  const docId = sanitizeEmailForDocId(grant.email);
  const docRef = doc(db, 'hostGrantedSubscriptions', docId);
  try {
    await setDoc(docRef, {
      ...grant,
      sanitizedEmail: docId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `hostGrantedSubscriptions/${docId}`);
    throw error;
  }
}

/**
 * Fetch a host granted subscription by user email from Firestore
 */
export async function fetchHostGrantedSubscriptionByEmail(email: string): Promise<HostGrantedSubscription | null> {
  if (!email) return null;
  const docId = sanitizeEmailForDocId(email);
  const docRef = doc(db, 'hostGrantedSubscriptions', docId);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as HostGrantedSubscription;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `hostGrantedSubscriptions/${docId}`);
    return null;
  }
}

/**
 * Fetch all active and historical host granted subscriptions from Firestore
 */
export async function fetchAllHostGrantedSubscriptions(): Promise<HostGrantedSubscription[]> {
  try {
    const colRef = collection(db, 'hostGrantedSubscriptions');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data() as HostGrantedSubscription);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'hostGrantedSubscriptions');
    return [];
  }
}

/**
 * Delete / revoke a host granted subscription from Firestore
 */
export async function deleteHostGrantedSubscription(email: string): Promise<void> {
  const docId = sanitizeEmailForDocId(email);
  const docRef = doc(db, 'hostGrantedSubscriptions', docId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `hostGrantedSubscriptions/${docId}`);
    throw error;
  }
}
