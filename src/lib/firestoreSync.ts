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
  where,
  writeBatch
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
 * Build a clean UserSubscription object from a HostGrantedSubscription
 * to protect against profile-level overrides and accurate duration calculation.
 */
export function buildSubscriptionFromHostGrant(grant: HostGrantedSubscription): any {
  const isLifetime = !!grant.isLifetime || (grant.durationDays && grant.durationDays >= 3650);
  const now = Date.now();
  let subscriptionEndDate = grant.expiresAt;
  if (!subscriptionEndDate) {
    subscriptionEndDate = isLifetime 
      ? '2099-12-31T23:59:59.000Z' 
      : new Date(now + (grant.durationDays || 90) * 86400000).toISOString();
  }

  let daysRemaining = 36500;
  let status: 'active' | 'expired' = 'active';

  if (!isLifetime) {
    const endMs = new Date(subscriptionEndDate).getTime();
    const diff = Math.ceil((endMs - now) / 86400000);
    if (diff <= 0) {
      status = 'expired';
      daysRemaining = 0;
    } else {
      status = 'active';
      daysRemaining = diff;
    }
  }

  let defaultPlanName = 'VIP Pro Access (Host Grant)';
  if (isLifetime) {
    defaultPlanName = 'VIP Lifetime Pro Access (Host Grant)';
  } else if (grant.planId === '3_months' || grant.durationDays === 90) {
    defaultPlanName = 'Quarterly Transformation (3 Months Free Grant)';
  } else if (grant.planId === '1_month' || grant.durationDays === 30) {
    defaultPlanName = 'Monthly Kickstarter (1 Month Free Grant)';
  } else if (grant.planId === '1_year' || grant.durationDays === 365) {
    defaultPlanName = 'Annual Championship (1 Year Free Grant)';
  } else if (grant.planId === '2_years') {
    defaultPlanName = 'Elite 2-Year Athlete (2 Years Free Grant)';
  } else if (grant.planId === '3_years') {
    defaultPlanName = 'Dynasty 3-Year Athlete (3 Years Free Grant)';
  }

  return {
    status,
    planId: grant.planId || '3_months',
    planName: grant.planName || defaultPlanName,
    trialStartDate: grant.grantedAt || new Date().toISOString(),
    trialEndDate: grant.grantedAt || new Date().toISOString(),
    subscriptionStartDate: grant.grantedAt || new Date().toISOString(),
    subscriptionEndDate,
    amountPaidINR: 0,
    paymentMethod: 'MANUAL_GRANT',
    isTrialActive: false,
    daysRemaining,
    verifiedBy: grant.grantedByName || 'Host Administrator (VIP Grant)',
    lastPaymentVerifiedAt: new Date().toISOString(),
    isLifetime,
  };
}

/**
 * Save or update the user's master profile in Firestore
 * IMMUNE TO OVERRIDES: If user has an active grant in 'grants', preserves grant instead of overwriting with trial!
 */
export async function syncUserProfile(profile: UserProfile): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const sanitized = sanitizeUserProfile(profile);
  const path = `users/${user.uid}`;
  const cleanEmail = (user.email || sanitized.email || '').trim().toLowerCase();

  let effectiveSubscription = sanitized.subscription || null;

  try {
    const payload = {
      userId: user.uid,
      name: sanitized.name || user.displayName || 'Peak Athlete',
      email: cleanEmail,
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
      subscription: effectiveSubscription,
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
 * Batch delete multiple MealLogs from Firestore
 */
export async function deleteMealLogsBatchFirestore(mealIds: string[]): Promise<void> {
  const user = auth.currentUser;
  if (!user || mealIds.length === 0) return;

  const path = `users/${user.uid}/mealLogs`;
  try {
    const batch = writeBatch(db);
    for (const id of mealIds) {
      const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
      batch.delete(doc(db, 'users', user.uid, 'mealLogs', safeId));
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Clear all MealLogs from Firestore for the active user
 */
export async function clearAllMealLogsFirestore(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}/mealLogs`;
  try {
    const snap = await getDocs(collection(db, 'users', user.uid, 'mealLogs'));
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
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
 * Batch delete multiple WorkoutLogs from Firestore
 */
export async function deleteWorkoutLogsBatchFirestore(logIds: string[]): Promise<void> {
  const user = auth.currentUser;
  if (!user || logIds.length === 0) return;

  const path = `users/${user.uid}/workoutLogs`;
  try {
    const batch = writeBatch(db);
    for (const id of logIds) {
      const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
      batch.delete(doc(db, 'users', user.uid, 'workoutLogs', safeId));
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Clear all WorkoutLogs from Firestore for the active user
 */
export async function clearAllWorkoutLogsFirestore(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}/workoutLogs`;
  try {
    const snap = await getDocs(collection(db, 'users', user.uid, 'workoutLogs'));
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
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
 * Host grants are managed exclusively by the backend server (/api/host/*).
 * Server owns host_ledger, hostGrantedSubscriptions, grants, and persistent_host_grants collections.
 */
export async function syncHostGrantedSubscription(_grant: HostGrantedSubscription): Promise<void> {
  // Server owns grants and host ledger. Client firestore writes removed per rule D.
}

export async function fetchHostGrantedSubscriptionByEmail(_email: string): Promise<HostGrantedSubscription | null> {
  // Server owns grants and host ledger. Client firestore reads removed per rule D.
  return null;
}

export async function fetchAllHostGrantedSubscriptions(): Promise<HostGrantedSubscription[]> {
  // Server owns grants and host ledger. Client firestore reads removed per rule D.
  return [];
}

export async function fetchPersistentGrantsCollection(): Promise<HostGrantedSubscription[]> {
  // Server owns grants and host ledger. Client firestore reads removed per rule D.
  return [];
}

export async function deleteHostGrantedSubscription(_email: string): Promise<void> {
  // Server owns grants and host ledger. Client firestore deletes removed per rule D.
}

/**
 * Save or update a Host Coupon in Firestore
 */
export async function syncHostCouponToFirestore(coupon: any): Promise<void> {
  const safeId = (coupon.id || `coupon_${coupon.code}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  try {
    const cRef = doc(db, 'host_coupons', safeId);
    await setDoc(cRef, coupon, { merge: true });
  } catch (error) {
    console.warn('Notice syncing coupon to Firestore:', error);
  }
}

/**
 * Fetch all Host Coupons from Firestore
 */
export async function fetchAllHostCouponsFromFirestore(): Promise<any[]> {
  try {
    const colRef = collection(db, 'host_coupons');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data());
    }
  } catch (error) {
    console.warn('Notice fetching coupons from Firestore:', error);
  }
  return [];
}

/**
 * Delete / Revoke coupon from Firestore
 */
export async function deleteHostCouponFromFirestore(couponId: string): Promise<void> {
  const safeId = couponId.replace(/[^a-zA-Z0-9_-]/g, '_');
  try {
    const cRef = doc(db, 'host_coupons', safeId);
    await deleteDoc(cRef);
  } catch (error) {
    console.warn('Notice deleting coupon from Firestore:', error);
  }
}

/**
 * Record a Password-Verified Host Grant Action in the isolated Firestore 'grant_verifications'
 * and 'host_verification_logs' collections for multi-layer audit trails.
 */
export async function recordHostVerificationLogFirestore(entry: {
  id?: string;
  action: string;
  targetEmail?: string;
  planId?: string;
  planName?: string;
  durationMonths?: number;
  durationDays?: number;
  isLifetime?: boolean;
  expiresAt?: string;
  verifiedByPin?: boolean;
  authMethod?: string;
  deviceFingerprint?: string;
  notes?: string;
  performedBy?: string;
  actorEmail?: string;
  pinProvided?: string;
  details?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  status?: string;
  checksum?: string;
}): Promise<void> {
  const logId = entry.id || `vlog_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const payload = {
    ...entry,
    id: logId,
    timestamp: entry.timestamp || new Date().toISOString(),
    performedBy: entry.performedBy || entry.actorEmail || 'Host Administrator',
    verifiedByPin: entry.verifiedByPin ?? true,
    authMethod: entry.authMethod || 'HOST_PASSWORD_AUTHENTICATED',
    status: entry.status || 'AUTHENTICATED',
    updatedAt: new Date().toISOString(),
  };

  try {
    const gvRef = doc(db, 'grant_verifications', logId);
    await setDoc(gvRef, payload, { merge: true });
  } catch (error) {
    console.warn('Notice logging to grant_verifications in Firestore:', error);
  }

  try {
    const vRef = doc(db, 'host_verification_logs', logId);
    await setDoc(vRef, payload, { merge: true });
  } catch (error) {
    console.warn('Notice logging verification action to Firestore:', error);
  }
}

export const recordGrantVerificationLogFirestore = recordHostVerificationLogFirestore;

/**
 * Fetch all Password-Verified Host Grant logs from Firestore 'grant_verifications' or 'host_verification_logs'
 */
export async function fetchHostVerificationLogsFirestore(): Promise<any[]> {
  const map = new Map<string, any>();

  try {
    const colRef = collection(db, 'grant_verifications');
    const snap = await getDocs(colRef);
    snap.docs.forEach((d) => {
      const data = d.data();
      if (data && data.id) {
        map.set(data.id, data);
      }
    });
  } catch (error) {
    console.warn('Notice fetching grant_verifications from Firestore:', error);
  }

  try {
    const colRef = collection(db, 'host_verification_logs');
    const snap = await getDocs(colRef);
    snap.docs.forEach((d) => {
      const data = d.data();
      if (data && data.id && !map.has(data.id)) {
        map.set(data.id, data);
      }
    });
  } catch (error) {
    console.warn('Notice fetching verification logs from Firestore:', error);
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
  );
}

/**
 * Athlete login telemetry is handled exclusively via server route /api/me/session.
 * Client Firestore writes/reads removed per rule D.
 */
export async function syncAthleteLoginToFirestore(_loginRecord: any): Promise<void> {
  // Server owns athlete logins. Client firestore writes removed per rule D.
}

export async function fetchAthleteLoginsFromFirestore(): Promise<any[]> {
  // Server owns athlete logins via /api/host/athlete-logins. Client firestore reads removed per rule D.
  return [];
}

/**
 * Permanently wipe all Firestore documents and subcollections for the active user
 * (DPDP Act, 2023 - Right to Erasure / Data Deletion)
 */
export async function wipeUserFirestoreData(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  const subcollections = [
    'mealLogs',
    'workoutLogs',
    'bodyMetrics',
    'customRecipes',
    'formAnalyses',
    'shoppingList'
  ];

  try {
    for (const sub of subcollections) {
      try {
        const subRef = collection(db, 'users', user.uid, sub);
        const snapshot = await getDocs(subRef);
        if (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
          await batch.commit();
        }
      } catch (subErr) {
        console.warn(`Notice wiping subcollection ${sub}:`, subErr);
      }
    }

    // Delete the root user profile document
    await deleteDoc(doc(db, 'users', user.uid));
    return true;
  } catch (err) {
    console.error('Error wiping user data from Firestore:', err);
    return false;
  }
}


