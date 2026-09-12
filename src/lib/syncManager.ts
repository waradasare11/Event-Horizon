import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { 
  syncUserProfile, 
  syncMealLog, 
  deleteMealLogFirestore, 
  syncWorkoutLog, 
  deleteWorkoutLogFirestore, 
  syncBodyMetric, 
  syncCustomRecipe, 
  syncFormAnalysis, 
  syncShoppingListItem, 
  deleteShoppingListItemFirestore 
} from './firestoreSync';
import {
  SyncJob,
  SyncJobType,
  idbSaveSyncJob,
  idbGetAllSyncJobs,
  idbDeleteSyncJob,
  idbClearAllSyncJobs,
  idbSaveOfflineMeal,
  idbSaveOfflineWorkout,
  idbSaveOfflineMetric,
} from './indexedDbQueue';

export type { SyncJob, SyncJobType };

export interface GlobalSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
  isIndexedDBActive: boolean;
}

const QUEUE_STORAGE_KEY = 'aroh_pending_sync_queue';
const LAST_SYNCED_STORAGE_KEY = 'aroh_last_synced_timestamp';

// In-memory queue & listeners
let pendingQueue: SyncJob[] = loadQueueFromStorage();
let isCurrentlySyncing = false;
let lastSyncTimestamp: string | null = loadLastSyncTimestamp();
let lastSyncError: string | null = null;
let isIndexedDBActive = typeof window !== 'undefined' && 'indexedDB' in window;
const listeners = new Set<(state: GlobalSyncState) => void>();

// Hydrate from IndexedDB on startup
if (typeof window !== 'undefined') {
  idbGetAllSyncJobs().then((idbJobs) => {
    if (idbJobs && idbJobs.length > 0) {
      // Merge unique jobs from IDB into memory queue
      const existingIds = new Set(pendingQueue.map((j) => j.id));
      let hasNew = false;
      for (const j of idbJobs) {
        if (!existingIds.has(j.id)) {
          pendingQueue.push(j);
          hasNew = true;
        }
      }
      if (hasNew) {
        saveQueueToStorage(pendingQueue);
        notifyListeners();
      }
    }
  }).catch((e) => {
    console.warn('[SyncManager] Initial IDB load notice:', e);
  });
}

function loadQueueFromStorage(): SyncJob[] {
  try {
    let raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem('peakform_pending_sync_queue');
      if (legacy) {
        raw = legacy;
        try {
          localStorage.setItem(QUEUE_STORAGE_KEY, legacy);
        } catch {}
      }
    }
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load sync queue from localStorage', e);
  }
  return [];
}

function saveQueueToStorage(queue: SyncJob[]): void {
  try {
    const serialized = JSON.stringify(queue);
    localStorage.setItem(QUEUE_STORAGE_KEY, serialized);
  } catch (e) {
    console.error('Failed to save sync queue to localStorage', e);
  }
}

function loadLastSyncTimestamp(): string | null {
  try {
    let ts = localStorage.getItem(LAST_SYNCED_STORAGE_KEY);
    if (!ts) {
      const legacy = localStorage.getItem('peakform_last_synced_timestamp');
      if (legacy) {
        ts = legacy;
        try {
          localStorage.setItem(LAST_SYNCED_STORAGE_KEY, legacy);
        } catch {}
      }
    }
    return ts;
  } catch {
    return null;
  }
}

function saveLastSyncTimestamp(iso: string): void {
  lastSyncTimestamp = iso;
  try {
    localStorage.setItem(LAST_SYNCED_STORAGE_KEY, iso);
  } catch {}
}

/**
 * Prioritizes a specific job in the queue to be processed first immediately
 */
export function prioritizeSyncJob(id: string): void {
  const index = pendingQueue.findIndex((j) => j.id === id);
  if (index > 0) {
    const [job] = pendingQueue.splice(index, 1);
    // Reset retry count and set fresh timestamp
    job.retryCount = 0;
    job.timestamp = new Date().toISOString();
    pendingQueue.unshift(job);
    saveQueueToStorage(pendingQueue);
    idbSaveSyncJob(job);
    notifyListeners();
  }
  processPendingSyncQueue();
}

/**
 * Manually dismisses/clears a specific job from the sync queue
 */
export function clearSyncJob(id: string): void {
  pendingQueue = pendingQueue.filter((j) => j.id !== id);
  saveQueueToStorage(pendingQueue);
  idbDeleteSyncJob(id);
  notifyListeners();
}

/**
 * Manually clears all pending items from the sync queue
 */
export function clearAllSyncJobs(): void {
  pendingQueue = [];
  saveQueueToStorage([]);
  idbClearAllSyncJobs();
  notifyListeners();
}

export function getGlobalSyncState(): GlobalSyncState {
  return {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: isCurrentlySyncing,
    pendingCount: pendingQueue.length,
    lastSyncedAt: lastSyncTimestamp,
    lastError: lastSyncError,
    isIndexedDBActive,
  };
}

export function getPendingQueueSnapshot(): SyncJob[] {
  return [...pendingQueue];
}

function notifyListeners(): void {
  const state = getGlobalSyncState();
  listeners.forEach((listener) => {
    try {
      listener(state);
    } catch (err) {
      console.error('Error notifying sync listener:', err);
    }
  });
}

/**
 * Enqueue a sync job for offline resiliency (IndexedDB + localStorage local-first)
 */
export function enqueueSyncJob(job: Omit<SyncJob, 'id' | 'timestamp' | 'retryCount'>): void {
  const fullJob: SyncJob = {
    ...job,
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };

  // Persist domain entity into local IndexedDB offline storage
  if (job.type === 'meal_add' && job.payload) {
    idbSaveOfflineMeal(job.payload);
  } else if (job.type === 'workout_add' && job.payload) {
    idbSaveOfflineWorkout(job.payload);
  } else if (job.type === 'body_metric' && job.payload) {
    idbSaveOfflineMetric(job.payload);
  }

  // Avoid duplicate queueing of same delete or update
  pendingQueue = pendingQueue.filter(
    (existing) => !(existing.type === fullJob.type && existing.targetId && existing.targetId === fullJob.targetId)
  );

  pendingQueue.push(fullJob);
  saveQueueToStorage(pendingQueue);
  idbSaveSyncJob(fullJob);
  notifyListeners();

  // If online, immediately attempt to drain queue
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    processPendingSyncQueue();
  }
}

/**
 * Process and drain the offline queue to Firestore
 */
export async function processPendingSyncQueue(): Promise<void> {
  if (isCurrentlySyncing) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    notifyListeners();
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    // If not signed in yet, queue remains safely in IndexedDB until user authentication
    notifyListeners();
    return;
  }

  if (pendingQueue.length === 0) {
    saveLastSyncTimestamp(new Date().toISOString());
    lastSyncError = null;
    notifyListeners();
    return;
  }

  isCurrentlySyncing = true;
  lastSyncError = null;
  notifyListeners();

  try {
    const queueSnapshot = [...pendingQueue];
    const remainingQueue: SyncJob[] = [];

    for (const job of queueSnapshot) {
      try {
        switch (job.type) {
          case 'profile':
            if (job.payload) await syncUserProfile(job.payload);
            break;
          case 'meal_add':
            if (job.payload) await syncMealLog(job.payload);
            break;
          case 'meal_delete':
            if (job.targetId) await deleteMealLogFirestore(job.targetId);
            break;
          case 'workout_add':
            if (job.payload) await syncWorkoutLog(job.payload);
            break;
          case 'workout_delete':
            if (job.targetId) await deleteWorkoutLogFirestore(job.targetId);
            break;
          case 'body_metric':
            if (job.payload) await syncBodyMetric(job.payload);
            break;
          case 'recipe':
            if (job.payload) await syncCustomRecipe(job.payload);
            break;
          case 'form_analysis':
            if (job.payload) await syncFormAnalysis(job.payload);
            break;
          case 'shopping_item_add':
            if (job.payload) await syncShoppingListItem(job.payload);
            break;
          case 'shopping_item_delete':
            if (job.targetId) await deleteShoppingListItemFirestore(job.targetId);
            break;
          default:
            break;
        }
        // Remove from IndexedDB upon success
        await idbDeleteSyncJob(job.id);
      } catch (err: any) {
        console.warn(`Sync job ${job.id} (${job.type}) failed, will retain in queue:`, err);
        job.retryCount = (job.retryCount || 0) + 1;
        remainingQueue.push(job);
        lastSyncError = err?.message || 'Sync failed';
      }
    }

    pendingQueue = remainingQueue;
    saveQueueToStorage(pendingQueue);
    saveLastSyncTimestamp(new Date().toISOString());
  } catch (err: any) {
    console.error('Fatal error during sync queue processing:', err);
    lastSyncError = err?.message || 'Global sync processing error';
  } finally {
    isCurrentlySyncing = false;
    notifyListeners();
  }
}

/**
 * Initialize event listeners for online/offline events
 */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[SyncManager] Internet connectivity restored. Draining IndexedDB sync queue...');
    notifyListeners();
    processPendingSyncQueue();
  });

  window.addEventListener('offline', () => {
    console.warn('[SyncManager] Internet disconnected. Local-first IndexedDB queued mode active.');
    notifyListeners();
  });

  // Also hook into Auth state changes to process queue once user logs in
  auth.onAuthStateChanged((user) => {
    if (user && pendingQueue.length > 0) {
      processPendingSyncQueue();
    }
  });
}

/**
 * Custom React hook for subscribing to Global Sync Status across the application
 */
export function useSyncStatus(): GlobalSyncState & { triggerSync: () => Promise<void> } {
  const [state, setState] = useState<GlobalSyncState>(getGlobalSyncState);

  useEffect(() => {
    setState(getGlobalSyncState());
    const handler = (nextState: GlobalSyncState) => {
      setState(nextState);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const triggerSync = async () => {
    await processPendingSyncQueue();
  };

  return {
    ...state,
    triggerSync,
  };
}
