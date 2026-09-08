import { MealLog, WorkoutCompletionLog, BodyMetric } from '../types';

export type SyncJobType = 
  | 'profile'
  | 'meal_add'
  | 'meal_delete'
  | 'workout_add'
  | 'workout_delete'
  | 'body_metric'
  | 'recipe'
  | 'form_analysis'
  | 'shopping_item_add'
  | 'shopping_item_delete';

export interface SyncJob {
  id: string;
  type: SyncJobType;
  payload?: any;
  targetId?: string;
  timestamp: string;
  retryCount: number;
}

const DB_NAME = 'ArohOfflineDB';
const DB_VERSION = 1;

const STORES = {
  SYNC_QUEUE: 'sync_queue',
  OFFLINE_MEALS: 'offline_meals',
  OFFLINE_WORKOUTS: 'offline_workouts',
  OFFLINE_METRICS: 'offline_metrics',
};

let dbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported in current environment'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.OFFLINE_MEALS)) {
          db.createObjectStore(STORES.OFFLINE_MEALS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.OFFLINE_WORKOUTS)) {
          db.createObjectStore(STORES.OFFLINE_WORKOUTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.OFFLINE_METRICS)) {
          db.createObjectStore(STORES.OFFLINE_METRICS, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return dbPromise;
}

export async function idbSaveSyncJob(job: SyncJob): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      store.put(job);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to save sync job:', err);
  }
}

export async function idbGetAllSyncJobs(): Promise<SyncJob[]> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to get sync jobs:', err);
    return [];
  }
}

export async function idbDeleteSyncJob(id: string): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to delete sync job:', err);
  }
}

export async function idbClearAllSyncJobs(): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to clear sync jobs:', err);
  }
}

export async function idbSaveOfflineMeal(meal: MealLog): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.OFFLINE_MEALS, 'readwrite');
      const store = tx.objectStore(STORES.OFFLINE_MEALS);
      store.put(meal);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to save offline meal:', err);
  }
}

export async function idbGetAllOfflineMeals(): Promise<MealLog[]> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.OFFLINE_MEALS, 'readonly');
      const store = tx.objectStore(STORES.OFFLINE_MEALS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    return [];
  }
}

export async function idbSaveOfflineWorkout(workout: WorkoutCompletionLog): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.OFFLINE_WORKOUTS, 'readwrite');
      const store = tx.objectStore(STORES.OFFLINE_WORKOUTS);
      store.put(workout);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to save offline workout:', err);
  }
}

export async function idbGetAllOfflineWorkouts(): Promise<WorkoutCompletionLog[]> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.OFFLINE_WORKOUTS, 'readonly');
      const store = tx.objectStore(STORES.OFFLINE_WORKOUTS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    return [];
  }
}

export async function idbSaveOfflineMetric(metric: BodyMetric): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.OFFLINE_METRICS, 'readwrite');
      const store = tx.objectStore(STORES.OFFLINE_METRICS);
      store.put(metric);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to save offline metric:', err);
  }
}

export async function idbGetAllOfflineMetrics(): Promise<BodyMetric[]> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.OFFLINE_METRICS, 'readonly');
      const store = tx.objectStore(STORES.OFFLINE_METRICS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    return [];
  }
}
