/**
 * Global Error Handler Service for AROH
 * 
 * Captures all unhandled Promise rejections and uncaught runtime errors across the entire app.
 * Stores detailed error diagnostics into Firestore under the 'ClientErrorLogs' collection,
 * allowing the Host Admin to diagnose and resolve client issues centrally.
 */

import { auth, db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { isHostAdmin } from './subscription';

export interface ClientErrorLog {
  id?: string;
  message: string;
  stack?: string;
  source?: string;
  lineno?: number;
  colno?: number;
  timestamp: string;
  userEmail?: string;
  userId?: string;
  userAgent: string;
  platform: 'android' | 'windows' | 'ios' | 'mac' | 'linux' | 'other';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  url: string;
  resolved?: boolean;
}

const ERROR_LOGS_COLLECTION = 'ClientErrorLogs';
const STORAGE_KEY = 'aroh_client_error_logs';
const LEGACY_STORAGE_KEY = 'peakform_client_error_logs';
const MAX_LOCAL_LOGS = 50;

function detectPlatform(): ClientErrorLog['platform'] {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('android')) return 'android';
  if (ua.includes('windows')) return 'windows';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios';
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'mac';
  if (ua.includes('linux')) return 'linux';
  return 'other';
}

function detectDeviceType(): ClientErrorLog['deviceType'] {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function getLocalErrorLogs(): ClientErrorLog[] {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        localStorage.setItem(STORAGE_KEY, raw);
      }
    }
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed reading local error cache', e);
  }
  return [];
}

export function saveLocalErrorLog(log: ClientErrorLog): void {
  try {
    const current = getLocalErrorLogs();
    const updated = [log, ...current].slice(0, MAX_LOCAL_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed saving error to local cache', e);
  }
}

/**
 * Log error to Firestore and Local Cache
 */
export async function logClientError(errorDetails: Partial<ClientErrorLog>): Promise<void> {
  const currentUser = auth.currentUser;
  const fullLog: ClientErrorLog = {
    message: errorDetails.message || 'Unknown Client Runtime Error',
    stack: errorDetails.stack || 'No stack trace available',
    source: errorDetails.source || window.location.pathname,
    lineno: errorDetails.lineno || 0,
    colno: errorDetails.colno || 0,
    timestamp: new Date().toISOString(),
    userEmail: currentUser?.email || 'unauthenticated@aroh.fit',
    userId: currentUser?.uid || 'anonymous',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
    platform: detectPlatform(),
    deviceType: detectDeviceType(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    resolved: false,
  };

  // 1. Cache locally first
  saveLocalErrorLog(fullLog);

  // 2. Transmit to Firestore if online
  try {
    if (navigator.onLine && db) {
      await addDoc(collection(db, ERROR_LOGS_COLLECTION), fullLog);
    }
  } catch (firestoreErr) {
    console.warn('[GlobalErrorHandler] Failed transmitting error log to Firestore:', firestoreErr);
  }
}

/**
 * Host Admin: Fetch all logged client errors from Firestore
 */
export async function fetchClientErrorLogs(): Promise<ClientErrorLog[]> {
  try {
    if (db) {
      const q = query(collection(db, ERROR_LOGS_COLLECTION), orderBy('timestamp', 'desc'), limit(100));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as ClientErrorLog[];
      }
    }
  } catch (err) {
    console.warn('[GlobalErrorHandler] Could not fetch Firestore error logs, falling back to local:', err);
  }
  return getLocalErrorLogs();
}

/**
 * Host Admin: Clear all client error logs
 */
export async function clearAllClientErrorLogs(): Promise<boolean> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    if (db) {
      const q = query(collection(db, ERROR_LOGS_COLLECTION), limit(100));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map((d) => deleteDoc(doc(db, ERROR_LOGS_COLLECTION, d.id)));
      await Promise.all(deletePromises);
    }
    return true;
  } catch (err) {
    console.error('[GlobalErrorHandler] Error clearing logs:', err);
    return false;
  }
}

/**
 * Initializes global event listeners to capture unhandled errors and promise rejections
 */
export function initGlobalErrorHandler(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleGlobalError = (event: ErrorEvent) => {
    // Ignore benign Vite / websocket messages in dev sandbox
    if (
      event.message?.includes('failed to connect to websocket') ||
      event.message?.includes('ResizeObserver loop')
    ) {
      return;
    }

    console.error('[GlobalErrorHandler] Captured Uncaught Error:', event.error || event.message);
    logClientError({
      message: event.message || event.error?.message || 'Uncaught Error',
      stack: event.error?.stack,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    // Ignore benign network aborts
    if (reason?.name === 'AbortError' || reason?.message?.includes('aborted')) {
      return;
    }

    console.error('[GlobalErrorHandler] Captured Unhandled Promise Rejection:', reason);
    logClientError({
      message: reason?.message || String(reason) || 'Unhandled Promise Rejection',
      stack: reason?.stack,
      source: 'PromiseRejection',
    });
  };

  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  return () => {
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  };
}
