/**
 * Data Deletion & Privacy Orchestrator
 * Fully compliant with the Digital Personal Data Protection Act, 2023 (DPDP Act, 2023 - Right to Erasure)
 * Permanently purges user data across Firestore, connected Google Drive backups, and local storage.
 */

import { wipeUserFirestoreData } from './firestoreSync';
import { deleteAllGoogleDriveBackups } from './googleWorkspace';

export interface DataDeletionSummary {
  firestoreWiped: boolean;
  driveBackupsPurged: boolean;
  localStorageCleared: boolean;
  timestamp: string;
}

/**
 * Execute complete account data erasure
 */
export async function executeCompleteAccountDataErasure(userEmail?: string): Promise<DataDeletionSummary> {
  const summary: DataDeletionSummary = {
    firestoreWiped: false,
    driveBackupsPurged: false,
    localStorageCleared: false,
    timestamp: new Date().toISOString(),
  };

  // 1. Wipe Firestore cloud database
  try {
    summary.firestoreWiped = await wipeUserFirestoreData();
  } catch (err) {
    console.warn('Notice during Firestore wipe:', err);
  }

  // 2. Wipe Google Drive backups
  try {
    const driveRes = await deleteAllGoogleDriveBackups();
    summary.driveBackupsPurged = driveRes.success;
  } catch (err) {
    console.warn('Notice during Drive backups purge:', err);
  }

  // 3. Wipe all LocalStorage and SessionStorage entries related to AROH / PeakForm
  if (typeof window !== 'undefined') {
    try {
      const keysToPurge: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) {
          keysToPurge.push(k);
        }
      }

      keysToPurge.forEach((key) => {
        // Purge all app-specific data, logs, tokens, metrics, profiles, and cached states
        if (
          key.startsWith('peakform_') ||
          key.startsWith('aroh_') ||
          key.includes('meal') ||
          key.includes('workout') ||
          key.includes('profile') ||
          key.includes('metric') ||
          key.includes('drive') ||
          key.includes('firebase') ||
          key.includes('auth') ||
          key.includes('subscription')
        ) {
          localStorage.removeItem(key);
        }
      });

      // Clear current session storage
      sessionStorage.clear();
      summary.localStorageCleared = true;
    } catch (err) {
      console.warn('Notice during local storage purge:', err);
    }
  }

  return summary;
}
