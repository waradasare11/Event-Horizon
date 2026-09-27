import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut as fbSignOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { initializeFirestore, setLogLevel, doc, getDocFromServer, collection, getDocs, setDoc, deleteDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Silence internal Firestore SDK transport and retry logs in iframe sandbox
try {
  setLogLevel('silent');
} catch {
  // Graceful fallback if setLogLevel is unavailable in specific environment
}

// CRITICAL: Initialize Firestore with forced long polling for proxy/iframe resilience
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  (firebaseConfig as any).firestoreDatabaseId
);
export const auth = getAuth(app);

/**
 * Creates a clean GoogleAuthProvider for login / sign-in with default scopes only:
 * email, profile, openid.
 * CRITICAL RULE: Never request Google Drive scope (drive.file) during Sign-In.
 * Drive scopes must ONLY be requested post-login when the user opts into Drive backup.
 */
export function createLoginGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

// Global provider for default sign-in with basic email + profile scopes
export const googleProvider = createLoginGoogleProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errCode = (error as any)?.code || '';

  // If network is offline or backend is temporarily unreachable, log resilient warning without throwing unhandled crash
  if (
    errCode === 'unavailable' ||
    errMsg.includes('unavailable') ||
    errMsg.includes('Could not reach Cloud Firestore backend') ||
    errMsg.includes('client is offline') ||
    errMsg.includes('The operation could not be completed')
  ) {
    console.warn(`[Firestore] Connection offline or re-establishing (${operationType} on ${path}). Local cache active.`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test at boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('unavailable'))) {
      console.warn('Firestore operating in offline cache mode.');
    }
    return false;
  }
}

/**
 * Map Firebase and Google Identity authentication errors to friendly, actionable athlete messages.
 */
export function mapAuthError(error: any): string {
  if (!error) return '';
  const code = String(error?.code || '').toLowerCase();
  const msg = String(error?.message || '').toLowerCase();

  if (code.includes('unauthorized-domain') || msg.includes('unauthorized domain') || msg.includes('unauthorized-domain')) {
    return 'This website is not yet allowed by Google. Ask the host to add it in Firebase Authorized domains.';
  }
  if (
    code.includes('access_denied') ||
    code.includes('access-denied') ||
    msg.includes('access blocked') ||
    msg.includes('testing') ||
    msg.includes('access_denied') ||
    msg.includes('app is in testing')
  ) {
    return 'Google is still in Testing. Only approved Gmails can sign in until the host publishes the OAuth consent screen.';
  }
  if (
    msg.includes('unverified') ||
    msg.includes('not verified') ||
    code.includes('unverified')
  ) {
    return 'Google has not verified this app yet. On the Google screen tap Advanced, then continue. Or wait until the host publishes OAuth.';
  }
  if (
    code.includes('network') ||
    code.includes('network-request-failed') ||
    msg.includes('network error') ||
    msg.includes('network')
  ) {
    return 'Network error. Try again on Wi‑Fi.';
  }
  return error?.message || 'Authentication failed. Please try again.';
}

/**
 * Check if running on mobile device or standalone PWA
 */
export function isMobileOrStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandalone = Boolean(
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    (window.navigator as any)?.standalone === true
  );
  const isMobile = Boolean(
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '')
  );
  return isStandalone || isMobile;
}

let redirectCheckPromise: Promise<User | null> | null = null;

/**
 * Call getRedirectResult(auth) once on boot to complete redirect sign-ins.
 * Ignores auth/popup-closed and no-pending-redirect.
 */
export async function completeRedirectSignIn(): Promise<User | null> {
  if (redirectCheckPromise) return redirectCheckPromise;

  redirectCheckPromise = (async () => {
    try {
      const result = await getRedirectResult(auth);
      return result ? result.user : null;
    } catch (error: any) {
      const code = String(error?.code || '');
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/null-user'
      ) {
        return null;
      }
      console.warn('Redirect sign-in resolution notice:', error);
      throw error;
    }
  })();

  return redirectCheckPromise;
}

// Auth Actions
export async function signInWithGoogle(): Promise<User | null> {
  const loginProvider = createLoginGoogleProvider();

  // Mobile / iOS / Android / Standalone PWA: Use full-page redirect to prevent blocked popups
  if (isMobileOrStandalonePwa()) {
    await signInWithRedirect(auth, loginProvider);
    return null;
  }

  // Desktop: Try popup first, gracefully falling back to redirect if blocked or dismissed
  try {
    const result = await signInWithPopup(auth, loginProvider);
    return result.user;
  } catch (error: any) {
    const code = String(error?.code || '');
    const msg = String(error?.message || '');

    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/internal-error' ||
      msg.includes('Cross-Origin-Opener-Policy') ||
      msg.includes('window-closed') ||
      msg.includes('popup')
    ) {
      console.info('Desktop popup blocked or closed; falling back to redirect Google sign-in.');
      await signInWithRedirect(auth, loginProvider);
      return null;
    }

    console.error('Failed to sign in with Google:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Failed to sign out:', error);
    throw error;
  }
}
