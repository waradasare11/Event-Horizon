/**
 * AROH User Memory - Source of Truth Persistence Layer
 *
 * Each signed-in Google user saves ALL data into THAT Gmail account's Google Drive
 * folder ("AROH AI" / AROH_UserMemory.json).
 *
 * Firestore stays as a secondary cache.
 * LocalStorage is only a fast offline cache for the ACTIVE email.
 */

import {
  UserProfile,
  MealLog,
  BodyMetric,
  WorkoutProgram,
  CheckInRecord,
  AIAdjustedMealPlan,
  CustomGeneratedRecipe,
  WorkoutCompletionLog,
  FormAnalysisResult,
  SmartShoppingList,
} from '../types';
import { ThemeMode } from './theme';
import { getOrCreateArohFolder } from './googleWorkspace';
import { getCurrentActiveEmail, setCurrentActiveEmail } from './storage';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface CoachChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: any[];
}

export interface UserMemorySnapshot {
  schemaVersion: number;
  email: string;
  uid: string;
  savedAt: string;
  userProfile: UserProfile;
  mealLogs: MealLog[];
  workoutLogs: WorkoutCompletionLog[];
  bodyMetrics: BodyMetric[];
  formAnalyses: FormAnalysisResult[];
  customRecipes: CustomGeneratedRecipe[];
  shoppingList: SmartShoppingList | null;
  checkIns: CheckInRecord[];
  aiMealPlan: AIAdjustedMealPlan | null;
  workoutPrograms: WorkoutProgram[];
  coachChat: { messages: CoachChatMessage[] };
  ui: {
    theme: ThemeMode;
    activeTab: string;
  };
  subscriptionPublic: {
    status: 'trial' | 'active' | 'expired';
    planId: string;
    trialEndDate: string;
    subscriptionEndDate: string;
  };
}

export type DriveSyncStatusType = 'synced' | 'saving' | 'offline' | 'reconnect_needed' | 'error';

export interface DriveSyncStatus {
  status: DriveSyncStatusType;
  lastSavedAt?: string;
  errorMessage?: string;
  folderId?: string | null;
}

export interface AroHDriveAuth {
  accessToken: string | null;
  expiresAt: number | null;
  email: string;
  driveFolderId: string | null;
  lastBackupTimestamp?: string | null;
}

export const USER_MEMORY_DRIVE_FOLDER = 'AROH AI';
export const USER_MEMORY_FILE_NAME = 'AROH_UserMemory.json';

// Global listeners for Drive Sync Status
type StatusListener = (status: DriveSyncStatus) => void;
const statusListeners = new Set<StatusListener>();

let currentDriveStatus: DriveSyncStatus = {
  status: 'synced',
  lastSavedAt: undefined,
  folderId: null,
};

export function subscribeDriveSyncStatus(listener: StatusListener): () => void {
  statusListeners.add(listener);
  listener(currentDriveStatus);
  return () => {
    statusListeners.delete(listener);
  };
}

export function notifyDriveStatus(newStatus: Partial<DriveSyncStatus>): void {
  currentDriveStatus = { ...currentDriveStatus, ...newStatus };
  statusListeners.forEach((l) => {
    try {
      l(currentDriveStatus);
    } catch (e) {
      console.warn('Error in drive status listener', e);
    }
  });
}

export function getDriveStatus(): DriveSyncStatus {
  return currentDriveStatus;
}

/**
 * Email sanitization for storage keys
 */
export function sanitizeEmailForStorage(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Retrieves Drive Auth data scoped to this email
 */
export function getStoredDriveAuth(emailHint?: string): AroHDriveAuth | null {
  if (typeof window === 'undefined') return null;
  const email = (emailHint || getCurrentActiveEmail() || '').trim().toLowerCase();
  if (!email) return null;

  const sanitized = sanitizeEmailForStorage(email);
  const scopedKey = `aroh_drive_auth__usr_${sanitized}`;

  try {
    const raw = localStorage.getItem(scopedKey);
    if (raw) {
      return JSON.parse(raw);
    }
    // Migration fallback from peakform_google_workspace_auth
    const legacy = localStorage.getItem('peakform_google_workspace_auth');
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed?.userEmail?.toLowerCase() === email) {
        const migrated: AroHDriveAuth = {
          accessToken: parsed.accessToken || null,
          expiresAt: parsed.expiresAt || null,
          email,
          driveFolderId: parsed.driveFolderId || null,
          lastBackupTimestamp: parsed.lastBackupTimestamp || null,
        };
        localStorage.setItem(scopedKey, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch (e) {
    console.warn('Failed reading stored Drive auth:', e);
  }
  return null;
}

/**
 * Saves Drive Auth data scoped to this email
 */
export function saveStoredDriveAuth(authData: AroHDriveAuth): void {
  if (typeof window === 'undefined') return;
  const email = (authData.email || getCurrentActiveEmail() || '').trim().toLowerCase();
  if (!email) return;

  const sanitized = sanitizeEmailForStorage(email);
  const scopedKey = `aroh_drive_auth__usr_${sanitized}`;
  try {
    localStorage.setItem(scopedKey, JSON.stringify(authData));
    if (authData.driveFolderId) {
      notifyDriveStatus({ folderId: authData.driveFolderId });
    }
  } catch (e) {
    console.warn('Failed saving drive auth:', e);
  }
}

/**
 * Silent Google Identity Services token refresher
 */
async function refreshDriveTokenSilent(email: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const g = (window as any).google;
  if (!g?.accounts?.oauth2) return null;

  const clientId = '615099995105-6ijbveit2dpkvmfecdh7okutbfsjnrks.apps.googleusercontent.com';

  return new Promise((resolve) => {
    try {
      const client = g.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        hint: email,
        prompt: '',
        callback: (resp: any) => {
          if (resp?.access_token) {
            const expiresIn = Number(resp.expires_in) || 3500;
            const existing = getStoredDriveAuth(email);
            const updated: AroHDriveAuth = {
              accessToken: resp.access_token,
              expiresAt: Date.now() + expiresIn * 1000,
              email,
              driveFolderId: existing?.driveFolderId || null,
              lastBackupTimestamp: existing?.lastBackupTimestamp || new Date().toISOString(),
            };
            saveStoredDriveAuth(updated);
            resolve(resp.access_token);
          } else {
            resolve(null);
          }
        },
        error_callback: () => resolve(null),
      });
      client.requestAccessToken({ prompt: '' });
    } catch (e) {
      resolve(null);
    }
  });
}

/**
 * Returns a valid Drive Access Token for this user or attempts silent refresh
 */
export async function getValidDriveAccessToken(emailHint?: string): Promise<string | null> {
  const email = (emailHint || getCurrentActiveEmail() || '').trim().toLowerCase();
  if (!email) return null;

  const authData = getStoredDriveAuth(email);
  if (!authData || !authData.accessToken) {
    return null;
  }

  // Token expires within 60 seconds? Attempt silent refresh
  const now = Date.now();
  if (authData.expiresAt && authData.expiresAt - 60000 < now) {
    const refreshed = await refreshDriveTokenSilent(email);
    if (refreshed) {
      return refreshed;
    }
    notifyDriveStatus({ status: 'reconnect_needed' });
    return null;
  }

  return authData.accessToken;
}

/**
 * IndexedDB Offline Queue for failed / offline Drive backups
 */
const IDB_NAME = 'aroh_offline_queue';
const IDB_STORE = 'pending_memory_sync';

function openOfflineQueueDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'email' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function queuePendingOfflineSync(snapshot: UserMemorySnapshot): Promise<void> {
  const db = await openOfflineQueueDB();
  if (!db) return;
  try {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put({
      email: snapshot.email.trim().toLowerCase(),
      snapshot,
      queuedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Failed queuing offline Drive sync:', e);
  }
}

export async function getPendingOfflineSync(email: string): Promise<UserMemorySnapshot | null> {
  const db = await openOfflineQueueDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(email.trim().toLowerCase());
      req.onsuccess = () => resolve(req.result?.snapshot || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function clearPendingOfflineSync(email: string): Promise<void> {
  const db = await openOfflineQueueDB();
  if (!db) return;
  try {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.delete(email.trim().toLowerCase());
  } catch (e) {
    console.warn('Failed clearing pending offline sync:', e);
  }
}

/**
 * Sanitize snapshot: enforces strict privacy, eliminates any forbidden secrets
 */
export function sanitizeSnapshotForDrive(snapshot: UserMemorySnapshot): UserMemorySnapshot {
  const activeEmail = (snapshot.email || getCurrentActiveEmail() || '').trim().toLowerCase();

  // Strip food photos > 80KB to keep user memory compact and ultra-fast (< 80KB thumbnail allowed)
  const cleanedMealLogs = (snapshot.mealLogs || []).map((meal) => {
    const cleaned: any = { ...meal };
    if (cleaned.photoUrl && typeof cleaned.photoUrl === 'string' && cleaned.photoUrl.startsWith('data:') && cleaned.photoUrl.length > 80000) {
      delete cleaned.photoUrl;
    }
    if (cleaned.imageUrl && typeof cleaned.imageUrl === 'string' && cleaned.imageUrl.startsWith('data:') && cleaned.imageUrl.length > 80000) {
      delete cleaned.imageUrl;
    }
    if (cleaned.items && Array.isArray(cleaned.items)) {
      cleaned.items = cleaned.items.map((it: any) => {
        if (it.photoUri && it.photoUri.startsWith('data:') && it.photoUri.length > 80000) {
          const { photoUri, ...rest } = it;
          return rest;
        }
        return it;
      });
    }
    return cleaned as MealLog;
  });

  // Cap coach chat messages at the latest 100
  const allMessages = snapshot.coachChat?.messages || [];
  const cappedMessages = allMessages.slice(-100);

  // Clean profile: remove any host financial/internal credentials
  const profileCopy: any = { ...snapshot.userProfile };
  delete profileCopy.hostPin;
  delete profileCopy.pin;
  delete profileCopy.upiId;
  delete profileCopy.razorpayKey;
  delete profileCopy.razorpaySecret;
  delete profileCopy.hostLedger;

  return {
    schemaVersion: 1,
    email: activeEmail,
    uid: snapshot.uid || auth.currentUser?.uid || '',
    savedAt: snapshot.savedAt || new Date().toISOString(),
    userProfile: profileCopy,
    mealLogs: cleanedMealLogs,
    workoutLogs: snapshot.workoutLogs || [],
    bodyMetrics: snapshot.bodyMetrics || [],
    formAnalyses: snapshot.formAnalyses || [],
    customRecipes: snapshot.customRecipes || [],
    shoppingList: snapshot.shoppingList || null,
    checkIns: snapshot.checkIns || [],
    aiMealPlan: snapshot.aiMealPlan || null,
    workoutPrograms: snapshot.workoutPrograms || [],
    coachChat: { messages: cappedMessages },
    ui: snapshot.ui || { theme: 'system', activeTab: 'workouts' },
    subscriptionPublic: snapshot.subscriptionPublic || {
      status: 'trial',
      planId: '',
      trialEndDate: '',
      subscriptionEndDate: '',
    },
  };
}

export function buildUserMemorySnapshot(
  email: string,
  userProfile: any,
  mealLogs: any[] = [],
  workoutLogs: any[] = []
): UserMemorySnapshot {
  return sanitizeSnapshotForDrive({
    schemaVersion: 1,
    email: email.trim().toLowerCase(),
    uid: auth.currentUser?.uid || '',
    savedAt: new Date().toISOString(),
    userProfile,
    mealLogs,
    workoutLogs,
    bodyMetrics: [],
    formAnalyses: [],
  });
}

/**
 * Scoped LocalStorage access for UserMemory
 */
export function saveUserMemoryToLocal(snapshot: UserMemorySnapshot): void {
  if (typeof window === 'undefined' && typeof localStorage === 'undefined') return;
  const email = (snapshot.email || getCurrentActiveEmail() || '').trim().toLowerCase();
  if (!email) return;

  const sanitized = sanitizeEmailForStorage(email);
  const key = `aroh_user_memory__usr_${sanitized}`;
  try {
    localStorage.setItem(key, JSON.stringify(snapshot));
  } catch (e) {
    console.warn('LocalStorage full or error saving aroh_user_memory:', e);
  }
}

export function loadUserMemoryFromLocal(emailHint?: string): UserMemorySnapshot | null {
  if (typeof window === 'undefined' && typeof localStorage === 'undefined') return null;
  const email = (emailHint || getCurrentActiveEmail() || '').trim().toLowerCase();
  if (!email) return null;

  const sanitized = sanitizeEmailForStorage(email);
  const key = `aroh_user_memory__usr_${sanitized}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (!parsed.email || parsed.email.trim().toLowerCase() === email)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed loading aroh_user_memory from local:', e);
  }
  return null;
}

/**
 * In-place Google Drive file upsert:
 * Checks if fileName exists in folderId; if so, PATCH; otherwise, POST multipart.
 */
export async function upsertFileInDriveFolder(params: {
  accessToken: string;
  folderId: string;
  fileName: string;
  content: string;
  mimeType?: string;
}): Promise<{ fileId: string; webViewLink?: string }> {
  const { accessToken, folderId, fileName, content, mimeType = 'application/json' } = params;

  // 1. Search if file already exists in folder
  try {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `name = '${fileName}' and '${folderId}' in parents and trashed = false`
    )}&fields=files(id, name, webViewLink)`;

    const checkRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.files && data.files.length > 0) {
        const fileId = data.files[0].id;
        // PATCH existing file
        const updateRes = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': mimeType,
            },
            body: content,
          }
        );
        if (updateRes.ok) {
          const updated = await updateRes.json();
          return {
            fileId: updated.id || fileId,
            webViewLink: data.files[0].webViewLink,
          };
        }
      }
    }
  } catch (searchErr) {
    console.warn('Drive file search prior to upsert notice:', searchErr);
  }

  // 2. File does not exist yet -> POST multipart
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType,
    parents: [folderId],
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Drive Upload Error: ${errorText}`);
  }

  return await res.json();
}

/**
 * Generate human-readable CSVs (same constant file names, updated in place)
 */
function buildNutritionCsv(mealLogs: MealLog[]): string {
  const headers = ['Date', 'Meal Name', 'Type', 'Calories (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Fiber (g)', 'Items Summary'];
  const rows = (mealLogs || []).map((m: any) => [
    m.date || '',
    `"${(m.mealTitle || m.mealName || 'Meal').replace(/"/g, '""')}"`,
    m.mealType || 'Meal',
    m.calories || m.totalCalories || 0,
    m.proteinG || m.totalProteinG || 0,
    m.carbsG || m.totalCarbsG || 0,
    m.fatG || m.totalFatG || 0,
    m.fiberG || m.totalFiberG || 0,
    `"${(m.items?.map((it: any) => `${it.name || it.foodName} (${it.weightG || 100}g)`).join('; ') || '').replace(/"/g, '""')}"`,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function buildWorkoutCsv(workoutLogs: WorkoutCompletionLog[]): string {
  const headers = ['Date', 'Workout Name', 'Duration (min)', 'Total Sets', 'Estimated Calories', 'Exercises'];
  const rows = (workoutLogs || []).map((w) => [
    w.date || '',
    `"${(w.dayName || 'Workout').replace(/"/g, '""')}"`,
    w.durationMin || 45,
    w.loggedExercises?.reduce((acc, ex) => acc + (ex.sets || 0), 0) || 0,
    w.totalVolumeKg || 0,
    `"${(w.loggedExercises?.map((e: any) => `${e.exerciseName} (${e.sets}x${e.reps})`).join('; ') || '').replace(/"/g, '""')}"`,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function buildMetricsCsv(bodyMetrics: BodyMetric[]): string {
  const headers = ['Date', 'Weight (kg)', 'Body Fat (%)', 'Waist (cm)', 'Notes'];
  const rows = (bodyMetrics || []).map((m: any) => [
    m.date || '',
    m.weightKg || '',
    m.bodyFatPct || '',
    m.waistCm || '',
    `"${(m.notes || '').replace(/"/g, '""')}"`,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Upserts AROH_UserMemory.json and human-readable CSVs directly into user's Drive
 */
async function executeDriveSave(snapshot: UserMemorySnapshot): Promise<void> {
  const email = snapshot.email.trim().toLowerCase();
  const token = await getValidDriveAccessToken(email);

  if (!token) {
    // If not connected or token expired, queue in IndexedDB
    await queuePendingOfflineSync(snapshot);
    notifyDriveStatus({ status: 'reconnect_needed' });
    return;
  }

  notifyDriveStatus({ status: 'saving' });

  try {
    const authData = getStoredDriveAuth(email);
    let folderId = authData?.driveFolderId;
    if (!folderId) {
      folderId = await getOrCreateArohFolder(token);
      if (authData) {
        authData.driveFolderId = folderId;
        saveStoredDriveAuth(authData);
      }
    }

    const memoryJsonContent = JSON.stringify(snapshot, null, 2);

    // 1. Upsert canonical AROH_UserMemory.json
    await upsertFileInDriveFolder({
      accessToken: token,
      folderId,
      fileName: 'AROH_UserMemory.json',
      content: memoryJsonContent,
      mimeType: 'application/json',
    });

    // 2. Also keep human-readable CSVs updated in place (no dated pileup)
    const mealCsv = buildNutritionCsv(snapshot.mealLogs);
    const workoutCsv = buildWorkoutCsv(snapshot.workoutLogs);
    const metricsCsv = buildMetricsCsv(snapshot.bodyMetrics);

    Promise.all([
      upsertFileInDriveFolder({
        accessToken: token,
        folderId,
        fileName: 'AROH_Nutrition_Logs.csv',
        content: mealCsv,
        mimeType: 'text/csv',
      }).catch((e) => console.warn('CSV sync notice:', e)),
      upsertFileInDriveFolder({
        accessToken: token,
        folderId,
        fileName: 'AROH_Workout_Logs.csv',
        content: workoutCsv,
        mimeType: 'text/csv',
      }).catch((e) => console.warn('CSV sync notice:', e)),
      upsertFileInDriveFolder({
        accessToken: token,
        folderId,
        fileName: 'AROH_BodyMetrics.csv',
        content: metricsCsv,
        mimeType: 'text/csv',
      }).catch((e) => console.warn('CSV sync notice:', e)),
    ]).catch(() => {});

    // Clear any queued offline sync
    await clearPendingOfflineSync(email);

    // Also mirror to Firestore users/{uid}/userData/main as secondary backup
    if (snapshot.uid) {
      try {
        const userMainRef = doc(db, 'users', snapshot.uid, 'userData', 'main');
        await setDoc(userMainRef, {
          ...snapshot,
          updatedAt: new Date().toISOString(),
          source: 'drive-mirror',
        }, { merge: true });
      } catch (fsErr) {
        console.warn('Notice mirroring to secondary Firestore backup:', fsErr);
      }
    }

    const nowIso = new Date().toISOString();
    if (authData) {
      authData.lastBackupTimestamp = nowIso;
      saveStoredDriveAuth(authData);
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    notifyDriveStatus({
      status: 'synced',
      lastSavedAt: timeStr,
      folderId,
    });
  } catch (err: any) {
    console.warn('Drive save execution failure, queuing offline:', err);
    await queuePendingOfflineSync(snapshot);
    if (!navigator.onLine) {
      notifyDriveStatus({ status: 'offline' });
    } else if (err?.message?.includes('401') || err?.message?.includes('Invalid Credentials')) {
      notifyDriveStatus({ status: 'reconnect_needed', errorMessage: err.message });
    } else {
      notifyDriveStatus({ status: 'error', errorMessage: err.message });
    }
  }
}

/**
 * 2-Second Debounced Drive Upsert Queue
 */
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let latestPendingSnapshot: UserMemorySnapshot | null = null;

export function triggerDebouncedDriveSave(snapshot: UserMemorySnapshot): void {
  latestPendingSnapshot = snapshot;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    if (latestPendingSnapshot) {
      const snap = latestPendingSnapshot;
      latestPendingSnapshot = null;
      executeDriveSave(snap);
    }
  }, 2000);
}

/**
 * Immediate flush of any debounced memory save
 */
export async function flushUserMemory(): Promise<void> {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (latestPendingSnapshot) {
    const snap = latestPendingSnapshot;
    latestPendingSnapshot = null;
    await executeDriveSave(snap);
  }
}

// Window lifecycle listeners for flush
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushUserMemory();
    }
  });

  window.addEventListener('pagehide', () => {
    flushUserMemory();
  });

  window.addEventListener('beforeunload', () => {
    flushUserMemory();
  });

  window.addEventListener('online', async () => {
    const email = getCurrentActiveEmail();
    if (email) {
      const queued = await getPendingOfflineSync(email);
      if (queued) {
        executeDriveSave(queued);
      }
    }
  });
}

/**
 * Master saveUserMemory function:
 * 1. Writes scoped localStorage immediately (instant)
 * 2. Debounces Drive upsert of AROH_UserMemory.json to 2 seconds
 */
export function saveUserMemory(
  reason: string,
  snapshotOverride: Partial<UserMemorySnapshot> = {}
): UserMemorySnapshot | null {
  const activeEmail = (
    snapshotOverride.email ||
    getCurrentActiveEmail() ||
    auth.currentUser?.email ||
    ''
  )
    .trim()
    .toLowerCase();

  if (!activeEmail) {
    return null;
  }

  // Load local state or build from override
  const existing = loadUserMemoryFromLocal(activeEmail);

  const fullSnapshot: UserMemorySnapshot = sanitizeSnapshotForDrive({
    schemaVersion: 1,
    email: activeEmail,
    uid: snapshotOverride.uid || existing?.uid || auth.currentUser?.uid || '',
    savedAt: new Date().toISOString(),
    userProfile: snapshotOverride.userProfile || existing?.userProfile || ({} as any),
    mealLogs: snapshotOverride.mealLogs ?? existing?.mealLogs ?? [],
    workoutLogs: snapshotOverride.workoutLogs ?? existing?.workoutLogs ?? [],
    bodyMetrics: snapshotOverride.bodyMetrics ?? existing?.bodyMetrics ?? [],
    formAnalyses: snapshotOverride.formAnalyses ?? existing?.formAnalyses ?? [],
    customRecipes: snapshotOverride.customRecipes ?? existing?.customRecipes ?? [],
    shoppingList: snapshotOverride.shoppingList !== undefined ? snapshotOverride.shoppingList : existing?.shoppingList || null,
    checkIns: snapshotOverride.checkIns ?? existing?.checkIns ?? [],
    aiMealPlan: snapshotOverride.aiMealPlan !== undefined ? snapshotOverride.aiMealPlan : existing?.aiMealPlan || null,
    workoutPrograms: snapshotOverride.workoutPrograms ?? existing?.workoutPrograms ?? [],
    coachChat: snapshotOverride.coachChat || existing?.coachChat || { messages: [] },
    ui: snapshotOverride.ui || existing?.ui || { theme: 'system', activeTab: 'workouts' },
    subscriptionPublic: snapshotOverride.subscriptionPublic || existing?.subscriptionPublic || {
      status: 'trial',
      planId: '',
      trialEndDate: '',
      subscriptionEndDate: '',
    },
  });

  // 1. Write scoped localStorage immediately
  saveUserMemoryToLocal(fullSnapshot);

  // 2. Trigger debounced Drive upsert
  triggerDebouncedDriveSave(fullSnapshot);

  return fullSnapshot;
}

/**
 * Restore on Login (order of truth):
 * Step 1: Drive AROH_UserMemory.json for THIS email
 * Step 2: Firestore snapshot for this uid
 * Step 3: LocalStorage scoped cache
 * Step 4: Merge arrays by record ID (union)
 */
export async function restoreUserMemory(
  email: string,
  uidOrSnapshot?: string | any
): Promise<{
  snapshot: UserMemorySnapshot | null;
  isNewAthlete: boolean;
  source: 'drive' | 'firestore' | 'local' | 'none';
} | null> {
  const cleanEmail = (email || '').trim().toLowerCase();

  // If a direct snapshot object was passed (e.g. test verification)
  if (uidOrSnapshot && typeof uidOrSnapshot === 'object') {
    const snapEmail = (uidOrSnapshot.email || uidOrSnapshot.userProfile?.email || '').trim().toLowerCase();
    if (!cleanEmail || snapEmail !== cleanEmail) {
      console.warn('Strict email check failed: snapshot email', snapEmail, 'does not match auth email', cleanEmail);
      return null;
    }
    const sanitized = sanitizeSnapshotForDrive(uidOrSnapshot);
    return { snapshot: sanitized, isNewAthlete: false, source: 'local' };
  }

  const uid = typeof uidOrSnapshot === 'string' ? uidOrSnapshot : '';

  if (!cleanEmail) {
    return { snapshot: null, isNewAthlete: true, source: 'none' };
  }

  let driveSnapshot: UserMemorySnapshot | null = null;
  const token = await getValidDriveAccessToken(cleanEmail);

  // Step 1: Attempt to load from Google Drive
  if (token) {
    try {
      const authData = getStoredDriveAuth(cleanEmail);
      const folderId = authData?.driveFolderId || (await getOrCreateArohFolder(token));
      if (authData && !authData.driveFolderId) {
        authData.driveFolderId = folderId;
        saveStoredDriveAuth(authData);
      }

      // Search for AROH_UserMemory.json first, then legacy backups
      const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        `(name = 'AROH_UserMemory.json' or name = 'AROH_Complete_Backup.json' or name = 'PeakForm_Complete_Backup.json') and trashed = false and '${folderId}' in parents`
      )}&fields=files(id, name, modifiedTime)&orderBy=modifiedTime desc`;

      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.files && searchData.files.length > 0) {
          const fileId = searchData.files[0].id;
          const downloadRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (downloadRes.ok) {
            const rawText = await downloadRes.text();
            const parsed = JSON.parse(rawText);
            // IDENTITY RULE: If backup.email does not exist or does not match active auth email -> DISCARD
            if (!parsed || !parsed.email || parsed.email.trim().toLowerCase() !== cleanEmail) {
              console.warn('Discarded Drive backup with missing or mismatched email:', parsed?.email, '!=', cleanEmail);
            } else if (parsed && (parsed.userProfile || parsed.schemaVersion)) {
              driveSnapshot = sanitizeSnapshotForDrive({
                schemaVersion: 1,
                email: cleanEmail,
                uid,
                savedAt: parsed.savedAt || new Date().toISOString(),
                userProfile: parsed.userProfile || {},
                mealLogs: parsed.mealLogs || [],
                workoutLogs: parsed.workoutLogs || [],
                bodyMetrics: parsed.bodyMetrics || [],
                formAnalyses: parsed.formAnalyses || [],
                customRecipes: parsed.customRecipes || [],
                shoppingList: parsed.shoppingList || null,
                checkIns: parsed.checkIns || [],
                aiMealPlan: parsed.aiMealPlan || null,
                workoutPrograms: parsed.workoutPrograms || [],
                coachChat: parsed.coachChat || { messages: [] },
                ui: parsed.ui || { theme: 'system', activeTab: 'workouts' },
                subscriptionPublic: parsed.subscriptionPublic || {
                  status: 'trial',
                  planId: '',
                  trialEndDate: '',
                  subscriptionEndDate: '',
                },
              });
            }
          }
        }
      }
    } catch (driveErr) {
      console.warn('Drive restore attempt notice:', driveErr);
    }
  }

  // Step 2: Read Firestore users/{uid}/userData/main as secondary cache
  let firestoreSnapshot: UserMemorySnapshot | null = null;
  if (uid) {
    try {
      const userMainRef = doc(db, 'users', uid, 'userData', 'main');
      const fsDoc = await getDoc(userMainRef);
      if (fsDoc.exists()) {
        const fsData = fsDoc.data();
        // IDENTITY RULE: If snapshot.email does not exist or does not match active auth email -> DISCARD
        if (!fsData || !fsData.email || fsData.email.trim().toLowerCase() !== cleanEmail) {
          console.warn('Discarded Firestore snapshot with missing or mismatched email:', fsData?.email, '!=', cleanEmail);
        } else if (fsData && (fsData.userProfile || fsData.schemaVersion)) {
          firestoreSnapshot = sanitizeSnapshotForDrive({
            ...fsData,
            savedAt: fsData.savedAt || fsData.updatedAt || new Date().toISOString(),
          } as any);
        }
      }
    } catch (fsErr) {
      console.warn('Notice reading secondary Firestore snapshot on restore:', fsErr);
    }
  }

  // Step 3: If both Drive and Firestore exist, pick newer, merge arrays by record id (union, not overwrite)
  if (driveSnapshot && firestoreSnapshot) {
    const driveTime = new Date(driveSnapshot.savedAt || 0).getTime();
    const fsTime = new Date(firestoreSnapshot.savedAt || 0).getTime();
    const base = driveTime >= fsTime ? driveSnapshot : firestoreSnapshot;
    const secondary = driveTime >= fsTime ? firestoreSnapshot : driveSnapshot;

    const mergedMeals = mergeArraysById(base.mealLogs, secondary.mealLogs);
    const mergedWorkouts = mergeArraysById(base.workoutLogs, secondary.workoutLogs);
    const mergedMetrics = mergeArraysById(base.bodyMetrics, secondary.bodyMetrics);
    const mergedForm = mergeArraysById(base.formAnalyses, secondary.formAnalyses);
    const mergedRecipes = mergeArraysById(base.customRecipes, secondary.customRecipes);
    const mergedCheckIns = mergeArraysById(base.checkIns, secondary.checkIns);
    const mergedPrograms = mergeArraysById(base.workoutPrograms, secondary.workoutPrograms);
    const mergedCoach = mergeArraysById(
      base.coachChat?.messages || [],
      secondary.coachChat?.messages || []
    );

    const merged: UserMemorySnapshot = {
      ...base,
      mealLogs: mergedMeals,
      workoutLogs: mergedWorkouts,
      bodyMetrics: mergedMetrics,
      formAnalyses: mergedForm,
      customRecipes: mergedRecipes,
      checkIns: mergedCheckIns,
      workoutPrograms: mergedPrograms,
      coachChat: { messages: mergedCoach.slice(-100) },
    };

    saveUserMemoryToLocal(merged);
    return { snapshot: merged, isNewAthlete: false, source: driveTime >= fsTime ? 'drive' : 'firestore' };
  }

  // If only Drive exists
  if (driveSnapshot) {
    saveUserMemoryToLocal(driveSnapshot);
    return { snapshot: driveSnapshot, isNewAthlete: false, source: 'drive' };
  }

  // If only Firestore exists
  if (firestoreSnapshot) {
    saveUserMemoryToLocal(firestoreSnapshot);
    return { snapshot: firestoreSnapshot, isNewAthlete: false, source: 'firestore' };
  }

  // Step 4: Check Local scoped cache fallback
  const localSnapshot = loadUserMemoryFromLocal(cleanEmail);
  if (localSnapshot) {
    // IDENTITY RULE: If local snapshot email does not match active auth email -> DISCARD
    if (!localSnapshot.email || localSnapshot.email.trim().toLowerCase() !== cleanEmail) {
      console.warn('Discarded local snapshot with missing or mismatched email:', localSnapshot.email, '!=', cleanEmail);
    } else if (localSnapshot.userProfile?.goal || (localSnapshot.mealLogs && localSnapshot.mealLogs.length > 0) || (localSnapshot.workoutLogs && localSnapshot.workoutLogs.length > 0)) {
      return { snapshot: localSnapshot, isNewAthlete: false, source: 'local' };
    }
  }

  // Step 5: No previous data exists for this user anywhere -> NEW athlete
  return { snapshot: null, isNewAthlete: true, source: 'none' };
}

/**
 * Merges two arrays of objects by their 'id' property (union)
 */
function mergeArraysById<T extends { id?: string | number }>(arr1: T[] = [], arr2: T[] = []): T[] {
  const map = new Map<string, T>();
  arr1.forEach((item) => {
    if (item && item.id !== undefined) {
      map.set(String(item.id), item);
    }
  });
  arr2.forEach((item) => {
    if (item && item.id !== undefined) {
      map.set(String(item.id), item);
    }
  });
  return Array.from(map.values());
}
