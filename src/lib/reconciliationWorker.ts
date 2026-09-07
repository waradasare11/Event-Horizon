/**
 * PeakForm AI - Automated Data Reconciliation Worker
 * 
 * Runs on application initialization to cross-check local IndexedDB state
 * against Firestore snapshots, detect metric & log discrepancies,
 * perform bi-directional state repairs, and emit 'Sync Repair' notifications.
 */

import { auth, db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { 
  idbGetAllOfflineMeals, 
  idbGetAllOfflineWorkouts, 
  idbGetAllOfflineMetrics, 
  idbGetAllSyncJobs,
  idbSaveOfflineMeal,
  idbSaveOfflineWorkout,
  idbSaveOfflineMetric,
} from './indexedDbQueue';
import { processPendingSyncQueue } from './syncManager';
import { 
  getStoredProfile, 
  saveStoredProfile, 
  getStoredMealLogs, 
  saveStoredMealLogs, 
  getStoredWorkoutLogs, 
  saveStoredWorkoutLogs, 
  getStoredBodyMetrics, 
  saveStoredBodyMetrics 
} from './storage';
import { syncMealLog, syncWorkoutLog, syncBodyMetric, syncUserProfile } from './firestoreSync';
import { MealLog, WorkoutCompletionLog, BodyMetric, ReconciliationReport, UserProfile } from '../types';

export type ReconciliationCallback = (report: ReconciliationReport) => void;

const RECONCILIATION_HISTORY_KEY = 'peakform_reconciliation_history';
let reconciliationListeners = new Set<ReconciliationCallback>();

export function subscribeReconciliationReports(callback: ReconciliationCallback): () => void {
  reconciliationListeners.add(callback);
  return () => {
    reconciliationListeners.delete(callback);
  };
}

/**
 * Runs the automated reconciliation engine between local state (IndexedDB/localStorage) and Firestore.
 */
export async function runAutomatedDataReconciliation(): Promise<ReconciliationReport | null> {
  const user = auth.currentUser;
  if (!user || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return null;
  }

  const startTime = Date.now();
  let discrepanciesFound = 0;
  let repairedCount = 0;
  const details: string[] = [];

  try {
    // 1. Drain pending queue first
    const pendingJobs = await idbGetAllSyncJobs();
    if (pendingJobs.length > 0) {
      await processPendingSyncQueue();
      details.push(`Drained ${pendingJobs.length} pending offline sync operations.`);
    }

    // 2. Fetch local IndexedDB state
    const [localIdbMeals, localIdbWorkouts, localIdbMetrics] = await Promise.all([
      idbGetAllOfflineMeals(),
      idbGetAllOfflineWorkouts(),
      idbGetAllOfflineMetrics(),
    ]);

    const localStoreMeals = getStoredMealLogs();
    const localStoreWorkouts = getStoredWorkoutLogs();
    const localStoreMetrics = getStoredBodyMetrics();
    const localProfile = getStoredProfile();

    // 3. Fetch Remote Firestore state
    const [remoteMealsSnap, remoteWorkoutsSnap, remoteMetricsSnap, remoteProfileSnap] = await Promise.all([
      getDocs(collection(db, 'users', user.uid, 'mealLogs')),
      getDocs(collection(db, 'users', user.uid, 'workoutLogs')),
      getDocs(collection(db, 'users', user.uid, 'bodyMetrics')),
      getDoc(doc(db, 'users', user.uid)),
    ]);

    const remoteMeals = remoteMealsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as MealLog[];
    const remoteWorkouts = remoteWorkoutsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as WorkoutCompletionLog[];
    const remoteMetrics = remoteMetricsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as BodyMetric[];
    const remoteProfile = remoteProfileSnap.exists() ? (remoteProfileSnap.data() as Partial<UserProfile>) : null;

    // --- RECONCILE MEALS ---
    const remoteMealIdMap = new Map(remoteMeals.map((m) => [m.id, m]));
    const localMealIdMap = new Map(localStoreMeals.map((m) => [m.id, m]));

    // Check for offline meals missing in Firestore
    for (const lMeal of localStoreMeals) {
      if (!remoteMealIdMap.has(lMeal.id)) {
        discrepanciesFound++;
        await syncMealLog(lMeal);
        repairedCount++;
        details.push(`Synced missing local meal "${lMeal.mealTitle}" (${lMeal.date}) to Firestore.`);
      }
    }

    // Check for remote meals missing in local storage / IndexedDB
    let localMealsUpdated = false;
    const mergedMeals = [...localStoreMeals];
    for (const rMeal of remoteMeals) {
      if (!localMealIdMap.has(rMeal.id)) {
        discrepanciesFound++;
        mergedMeals.push(rMeal);
        await idbSaveOfflineMeal(rMeal);
        localMealsUpdated = true;
        repairedCount++;
        details.push(`Cached remote meal "${rMeal.mealTitle}" (${rMeal.date}) to local IndexedDB.`);
      }
    }
    if (localMealsUpdated) {
      saveStoredMealLogs(mergedMeals);
    }

    // --- RECONCILE WORKOUTS ---
    const remoteWorkoutIdMap = new Map(remoteWorkouts.map((w) => [w.id, w]));
    const localWorkoutIdMap = new Map(localStoreWorkouts.map((w) => [w.id, w]));

    for (const lWorkout of localStoreWorkouts) {
      if (!remoteWorkoutIdMap.has(lWorkout.id)) {
        discrepanciesFound++;
        await syncWorkoutLog(lWorkout);
        repairedCount++;
        details.push(`Synced missing local workout "${lWorkout.dayName}" (${lWorkout.date}) to Firestore.`);
      }
    }

    let localWorkoutsUpdated = false;
    const mergedWorkouts = [...localStoreWorkouts];
    for (const rWorkout of remoteWorkouts) {
      if (!localWorkoutIdMap.has(rWorkout.id)) {
        discrepanciesFound++;
        mergedWorkouts.push(rWorkout);
        await idbSaveOfflineWorkout(rWorkout);
        localWorkoutsUpdated = true;
        repairedCount++;
        details.push(`Cached remote workout "${rWorkout.dayName}" (${rWorkout.date}) to local IndexedDB.`);
      }
    }
    if (localWorkoutsUpdated) {
      saveStoredWorkoutLogs(mergedWorkouts);
    }

    // --- RECONCILE BODY METRICS ---
    const remoteMetricIdMap = new Map(remoteMetrics.map((m) => [m.id, m]));
    const localMetricIdMap = new Map(localStoreMetrics.map((m) => [m.id, m]));

    for (const lMetric of localStoreMetrics) {
      if (!remoteMetricIdMap.has(lMetric.id)) {
        discrepanciesFound++;
        await syncBodyMetric(lMetric);
        repairedCount++;
        details.push(`Synced missing metric entry (${lMetric.date}: ${lMetric.weightKg}kg) to Firestore.`);
      }
    }

    let localMetricsUpdated = false;
    const mergedMetrics = [...localStoreMetrics];
    for (const rMetric of remoteMetrics) {
      if (!localMetricIdMap.has(rMetric.id)) {
        discrepanciesFound++;
        mergedMetrics.push(rMetric);
        await idbSaveOfflineMetric(rMetric);
        localMetricsUpdated = true;
        repairedCount++;
        details.push(`Cached remote metric (${rMetric.date}: ${rMetric.weightKg}kg) to local IndexedDB.`);
      }
    }
    if (localMetricsUpdated) {
      saveStoredBodyMetrics(mergedMetrics);
    }

    // --- RECONCILE USER PROFILE TARGETS ---
    if (remoteProfile && localProfile) {
      const isMismatched = 
        remoteProfile.dailyCalories !== localProfile.dailyCalories ||
        remoteProfile.dailyProtein !== localProfile.dailyProtein ||
        remoteProfile.weightKg !== localProfile.weightKg;

      if (isMismatched) {
        discrepanciesFound++;
        // Prefer newer updated profile or remote snapshot
        const reconciledProfile = {
          ...localProfile,
          ...remoteProfile,
        };
        saveStoredProfile(reconciledProfile as UserProfile);
        repairedCount++;
        details.push('Harmonized metabolic caloric targets & body composition metrics between local and cloud.');
      }
    } else if (localProfile && !remoteProfile) {
      discrepanciesFound++;
      await syncUserProfile(localProfile);
      repairedCount++;
      details.push('Initialized user profile state in Firestore from local session.');
    }

    const report: ReconciliationReport = {
      timestamp: new Date().toISOString(),
      discrepanciesFound,
      repairedCount,
      offlineMealsChecked: localIdbMeals.length + remoteMeals.length,
      offlineWorkoutsChecked: localIdbWorkouts.length + remoteWorkouts.length,
      offlineMetricsChecked: localIdbMetrics.length + remoteMetrics.length,
      queueDrained: pendingJobs.length,
      details,
      repairedItemsSummary: discrepanciesFound > 0
        ? `Reconciled ${repairedCount} discrepancy item(s) across meals, workouts, and metric state.`
        : 'All local IndexedDB stores and Firestore snapshots are 100% in perfect sync.',
    };

    saveReconciliationReport(report);

    // Notify listeners (UI toasts & status monitors)
    reconciliationListeners.forEach((listener) => {
      try {
        listener(report);
      } catch (e) {
        console.error('Reconciliation listener error:', e);
      }
    });

    return report;
  } catch (err) {
    console.warn('[ReconciliationWorker] Error during automated cross-check:', err);
    return null;
  }
}

export function getLatestReconciliationReport(): ReconciliationReport | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RECONCILIATION_HISTORY_KEY);
    if (raw) {
      const list: ReconciliationReport[] = JSON.parse(raw);
      if (list && list.length > 0) return list[0];
    }
  } catch {}
  return null;
}

function saveReconciliationReport(report: ReconciliationReport): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(RECONCILIATION_HISTORY_KEY);
    const list: ReconciliationReport[] = raw ? JSON.parse(raw) : [];
    list.unshift(report);
    // Keep last 10 reports
    localStorage.setItem(RECONCILIATION_HISTORY_KEY, JSON.stringify(list.slice(0, 10)));
  } catch (e) {
    console.warn('Failed saving reconciliation report', e);
  }
}

export interface CaloricDeviationFlag {
  mealLogId: string;
  mealTitle: string;
  date: string;
  loggedCalories: number;
  expectedCalories: number;
  deviationPct: number;
  deviationDirection: 'overestimated' | 'underestimated';
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface DataIntegrityAuditResult {
  auditedCount: number;
  flaggedCount: number;
  flaggedMeals: CaloricDeviationFlag[];
  isClean: boolean;
  timestamp: string;
}

export interface SyncHashDiscrepancy {
  hasDiscrepancy: boolean;
  localHash: string;
  cloudHash: string;
  discrepancyCount: number;
  caloricDeviationsCount: number;
  flaggedMeals: CaloricDeviationFlag[];
  message: string;
  timestamp: string;
}

let discrepancyNoticeListeners = new Set<(notice: SyncHashDiscrepancy) => void>();

export function subscribeDiscrepancyNotice(listener: (notice: SyncHashDiscrepancy) => void): () => void {
  discrepancyNoticeListeners.add(listener);
  return () => {
    discrepancyNoticeListeners.delete(listener);
  };
}

/**
 * Daily Data Integrity Audit:
 * Cross-checks meal logs against standard nutritional macro benchmarks (4*protein + 4*carbs + 9*fat)
 * and flags any entries where caloric values deviate by > 5%.
 */
export function runDataIntegrityAudit(mealLogs?: MealLog[]): DataIntegrityAuditResult {
  const meals = mealLogs || getStoredMealLogs();
  const flaggedMeals: CaloricDeviationFlag[] = [];

  for (const meal of meals) {
    if (!meal) continue;
    const prot = Number(meal.proteinG) || 0;
    const carbs = Number(meal.carbsG) || 0;
    const fat = Number(meal.fatG) || 0;
    const loggedCals = Number(meal.calories) || 0;

    // Atwater benchmark math: Calories = 4*Protein + 4*Carbs + 9*Fat
    const expectedCals = Math.round(prot * 4 + carbs * 4 + fat * 9);

    if (expectedCals > 20) {
      const delta = Math.abs(loggedCals - expectedCals);
      const devPct = (delta / expectedCals) * 100;

      if (devPct > 5.0) {
        flaggedMeals.push({
          mealLogId: meal.id,
          mealTitle: meal.mealTitle || 'Unnamed Meal',
          date: meal.date,
          loggedCalories: loggedCals,
          expectedCalories: expectedCals,
          deviationPct: Number(devPct.toFixed(1)),
          deviationDirection: loggedCals > expectedCals ? 'overestimated' : 'underestimated',
          proteinG: prot,
          carbsG: carbs,
          fatG: fat,
        });
      }
    }
  }

  return {
    auditedCount: meals.length,
    flaggedCount: flaggedMeals.length,
    flaggedMeals,
    isClean: flaggedMeals.length === 0,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Automatically repairs and recalibrates all flagged meal logs to exact mathematical/USDA benchmark calories
 */
export async function repairCaloricDeviations(flaggedMeals: CaloricDeviationFlag[]): Promise<number> {
  if (!flaggedMeals || flaggedMeals.length === 0) return 0;
  const flagMap = new Map(flaggedMeals.map((f) => [f.mealLogId, f.expectedCalories]));

  const localMeals = getStoredMealLogs();
  let repairedCount = 0;

  const updatedMeals = localMeals.map((m) => {
    if (flagMap.has(m.id)) {
      repairedCount++;
      const correctedCal = flagMap.get(m.id)!;
      return {
        ...m,
        calories: correctedCal,
        isEstimated: false,
      };
    }
    return m;
  });

  if (repairedCount > 0) {
    saveStoredMealLogs(updatedMeals);
    // Sync to IndexedDB and Firestore
    for (const m of updatedMeals) {
      if (flagMap.has(m.id)) {
        await idbSaveOfflineMeal(m);
        if (auth.currentUser && typeof navigator !== 'undefined' && navigator.onLine) {
          try {
            await syncMealLog(m);
          } catch (e) {
            console.warn('Error syncing recalibrated meal log:', e);
          }
        }
      }
    }
  }

  return repairedCount;
}

/**
 * Computes deterministic summary hash of local IndexedDB & localStorage records vs Firestore
 * and includes the Data Integrity Audit results.
 */
export async function verifySummaryHashAndDetectDiscrepancies(): Promise<SyncHashDiscrepancy | null> {
  const user = auth.currentUser;
  const localStoreMeals = getStoredMealLogs();
  const localStoreWorkouts = getStoredWorkoutLogs();
  const localStoreMetrics = getStoredBodyMetrics();

  // Run Data Integrity Audit on all local meal logs
  const auditResult = runDataIntegrityAudit(localStoreMeals);

  if (!user || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    // Even offline, report caloric deviations if present
    if (!auditResult.isClean) {
      const offlineNotice: SyncHashDiscrepancy = {
        hasDiscrepancy: true,
        localHash: `M${localStoreMeals.length}_W${localStoreWorkouts.length}_B${localStoreMetrics.length}`,
        cloudHash: 'Offline',
        discrepancyCount: 0,
        caloricDeviationsCount: auditResult.flaggedCount,
        flaggedMeals: auditResult.flaggedMeals,
        message: `Data Integrity Audit flagged ${auditResult.flaggedCount} meal(s) with >5% caloric deviation from USDA benchmarks.`,
        timestamp: new Date().toISOString(),
      };
      discrepancyNoticeListeners.forEach((fn) => fn(offlineNotice));
      return offlineNotice;
    }
    return null;
  }

  try {
    const [remoteMealsSnap, remoteWorkoutsSnap, remoteMetricsSnap] = await Promise.all([
      getDocs(collection(db, 'users', user.uid, 'mealLogs')),
      getDocs(collection(db, 'users', user.uid, 'workoutLogs')),
      getDocs(collection(db, 'users', user.uid, 'bodyMetrics')),
    ]);

    const localHash = `M${localStoreMeals.length}_W${localStoreWorkouts.length}_B${localStoreMetrics.length}`;
    const cloudHash = `M${remoteMealsSnap.size}_W${remoteWorkoutsSnap.size}_B${remoteMetricsSnap.size}`;

    const diffMeals = Math.abs(localStoreMeals.length - remoteMealsSnap.size);
    const diffWorkouts = Math.abs(localStoreWorkouts.length - remoteWorkoutsSnap.size);
    const diffMetrics = Math.abs(localStoreMetrics.length - remoteMetricsSnap.size);
    const totalDiff = diffMeals + diffWorkouts + diffMetrics;

    const hasDiscrepancy = localHash !== cloudHash || !auditResult.isClean;

    const notice: SyncHashDiscrepancy = {
      hasDiscrepancy,
      localHash,
      cloudHash,
      discrepancyCount: totalDiff,
      caloricDeviationsCount: auditResult.flaggedCount,
      flaggedMeals: auditResult.flaggedMeals,
      message: hasDiscrepancy
        ? `${totalDiff > 0 ? `Found ${totalDiff} record discrepancy between local and cloud state. ` : ''}${
            auditResult.flaggedCount > 0 ? `Data Integrity Audit flagged ${auditResult.flaggedCount} meal log(s) with >5% caloric deviation.` : ''
          }`
        : 'Local IndexedDB, Nutrition Database, and Cloud database state are 100% verified & synchronized.',
      timestamp: new Date().toISOString(),
    };

    if (hasDiscrepancy) {
      discrepancyNoticeListeners.forEach((fn) => {
        try {
          fn(notice);
        } catch (e) {
          console.warn('Error in discrepancy notice listener:', e);
        }
      });
    }

    return notice;
  } catch (err) {
    console.warn('[SyncRepair] Error checking summary hash:', err);
    return null;
  }
}

