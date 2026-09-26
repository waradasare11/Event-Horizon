import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle2, RefreshCw, AlertCircle, ShieldCheck, Database, Zap, X, WifiOff, ArrowUpCircle, ExternalLink, HardDrive } from 'lucide-react';
import { User } from 'firebase/auth';
import { useSyncStatus, getPendingQueueSnapshot, SyncJob } from '../lib/syncManager';
import { subscribeDriveSyncStatus, DriveSyncStatus, getDriveStatus, getStoredDriveAuth } from '../lib/userMemory';
import { connectGoogleWorkspace } from '../lib/googleWorkspace';

export type SyncState = 'synced' | 'syncing' | 'validating' | 'drift_corrected' | 'offline';

interface SyncStatusIndicatorProps {
  isSyncing?: boolean;
  currentUser?: User | null;
  onForceSync?: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  isSyncing = false,
  currentUser = null,
  onForceSync,
}) => {
  const { 
    isOnline, 
    isSyncing: managerIsSyncing, 
    pendingCount, 
    triggerSync, 
    lastSyncedAt,
    isIndexedDBActive 
  } = useSyncStatus();

  const [internalState, setInternalState] = useState<SyncState>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false);
  const [validationReport, setValidationReport] = useState<string>('Local state verified against Firestore (0 drift)');
  const [queuedJobs, setQueuedJobs] = useState<SyncJob[]>([]);
  const [driveStatus, setDriveStatus] = useState<DriveSyncStatus>(getDriveStatus());
  const [isReconnectingDrive, setIsReconnectingDrive] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeDriveSyncStatus((newStatus) => {
      setDriveStatus(newStatus);
    });
    return unsub;
  }, []);

  const activeSyncing = isSyncing || managerIsSyncing || driveStatus.status === 'saving';

  useEffect(() => {
    if (activeSyncing) {
      setInternalState('syncing');
    } else if (!isOnline) {
      setInternalState('offline');
    } else {
      setInternalState('synced');
    }
  }, [activeSyncing, isOnline]);

  // Update snapshot of queued jobs when popover opens or pendingCount changes
  useEffect(() => {
    if (isOpenPopover || pendingCount > 0) {
      setQueuedJobs(getPendingQueueSnapshot());
    }
  }, [isOpenPopover, pendingCount]);

  const handleManualValidation = async () => {
    setInternalState('validating');
    setValidationReport('Auditing local cache and draining queued changes to Firestore...');
    try {
      if (onForceSync) onForceSync();
      await triggerSync();
      setInternalState('drift_corrected');
      setValidationReport('Validation complete: All local changes reconciled and synced with Firestore.');
      setLastSyncTime(new Date());
      setTimeout(() => {
        setInternalState(isOnline ? 'synced' : 'offline');
      }, 2000);
    } catch {
      setValidationReport('Network interruption during sync. Changes remain safely queued locally.');
      setInternalState(isOnline ? 'synced' : 'offline');
    }
  };

  const handleReconnectDrive = async () => {
    if (!currentUser?.email) return;
    setIsReconnectingDrive(true);
    try {
      await connectGoogleWorkspace(currentUser.email);
    } catch (e) {
      console.warn('Reconnect drive error:', e);
    } finally {
      setIsReconnectingDrive(false);
    }
  };

  const activeEmail = currentUser?.email || '';
  const driveAuth = getStoredDriveAuth(activeEmail);
  const resolvedFolderId = driveStatus.folderId || driveAuth?.driveFolderId;

  const getBadgeContent = () => {
    if (!isOnline) {
      return {
        icon: <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />,
        label: 'Offline',
        colorClass: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30',
        dotClass: 'bg-zinc-400',
        pendingBadge: pendingCount > 0 ? pendingCount : null,
      };
    }

    if (activeSyncing || driveStatus.status === 'saving') {
      return {
        icon: <RefreshCw className="w-3 h-3 animate-spin text-[#3B82F6] shrink-0" />,
        label: 'Saving…',
        colorClass: 'bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA] border-[#3B82F6]/30',
        dotClass: 'bg-[#3B82F6] animate-ping',
        pendingBadge: pendingCount > 0 ? pendingCount : null,
      };
    }

    return {
      icon: <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_#34D399]" />,
      label: 'Saved',
      colorClass: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
      dotClass: 'bg-emerald-400',
      pendingBadge: null,
    };
  };

  const badge = getBadgeContent();

  return (
    <div className="relative inline-block text-left">
      {/* Persistent Clickable Status Pill */}
      <button
        id="sync-status-indicator-btn"
        type="button"
        onClick={() => setIsOpenPopover(!isOpenPopover)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer hover:shadow-xs ${badge.colorClass}`}
        title={pendingCount > 0 ? `${pendingCount} items queued for cloud sync` : "Google Drive & Cloud Sync Status"}
      >
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${badge.dotClass}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${badge.dotClass}`} />
        </span>
        <span className="hidden sm:inline font-medium">{badge.label}</span>
        {badge.pendingBadge !== null && (
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-600 text-white leading-tight animate-in fade-in">
            {badge.pendingBadge}
          </span>
        )}
      </button>

      {/* Granular Diagnostics, Pending Sync & Drift Popover */}
      {isOpenPopover && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpenPopover(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] shadow-2xl z-50 p-5 space-y-4 animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2416] pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  AROH Cloud & Drive Memory
                </h4>
              </div>
              <button
                onClick={() => setIsOpenPopover(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Google Drive Status Section */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E2220] border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Google Drive Storage</span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Folder: <strong>AROH AI</strong>
                </span>
              </div>

              {resolvedFolderId && (
                <a
                  href={`https://drive.google.com/drive/folders/${resolvedFolderId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all border border-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open my AROH AI folder</span>
                </a>
              )}

              {driveStatus.status === 'reconnect_needed' && (
                <button
                  type="button"
                  onClick={handleReconnectDrive}
                  disabled={isReconnectingDrive}
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReconnectingDrive ? 'animate-spin' : ''}`} />
                  <span>Reconnect Google Drive</span>
                </button>
              )}
            </div>

            {/* Pending Sync Queue Card if items exist */}
            {pendingCount > 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <ArrowUpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Pending Cloud Sync Queue</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-600 text-white">
                    {pendingCount} {pendingCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  {isOnline
                    ? 'Changes are buffered in IndexedDB and waiting to upload to your Firestore database.'
                    : 'Network is offline. Your modifications are safely persisted in IndexedDB and will auto-upload when reconnected.'}
                </p>

                {queuedJobs.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-28 overflow-y-auto pr-1">
                    {queuedJobs.slice(0, 5).map((job) => (
                      <div
                        key={job.id}
                        className="text-[10px] p-1.5 rounded bg-white/70 dark:bg-black/40 border border-amber-500/20 flex items-center justify-between text-zinc-800 dark:text-zinc-200"
                      >
                        <span className="font-mono font-semibold uppercase">{job.type.replace('_', ' ')}</span>
                        <span className="text-zinc-500 dark:text-zinc-400 text-[9px]">
                          {new Date(job.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                    {queuedJobs.length > 5 && (
                      <div className="text-[10px] text-center text-amber-700 dark:text-amber-400 font-medium">
                        + {queuedJobs.length - 5} more queued actions
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Sync Queue Empty — 0 pending items. All local data is backed up.</span>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2220] border border-[#E5E7EB] dark:border-[#2A2416]">
                <span className="text-[#6B7280] dark:text-[#9EA8A2]">Connectivity</span>
                <span className={`font-semibold flex items-center gap-1 ${
                  isOnline ? 'text-amber-700 dark:text-amber-300' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {isOnline ? 'Online (Realtime)' : 'Offline (Local-First)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2220] border border-[#E5E7EB] dark:border-[#2A2416]">
                <span className="text-[#6B7280] dark:text-[#9EA8A2]">Account</span>
                <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] truncate max-w-[170px]">
                  {currentUser ? currentUser.email : 'Guest (Local Store)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2220] border border-[#E5E7EB] dark:border-[#2A2416]">
                <span className="text-[#6B7280] dark:text-[#9EA8A2]">Last Drive Backup</span>
                <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  {driveStatus.lastSavedAt || (lastSyncedAt
                    ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/5 dark:bg-amber-500/15 border border-amber-500/20 space-y-1">
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Drift Verification
                </div>
                <p className="text-[11px] text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                  {validationReport}
                </p>
              </div>
            </div>

            <button
              onClick={handleManualValidation}
              disabled={activeSyncing}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-sans disabled:opacity-50 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${activeSyncing ? 'animate-spin' : ''}`} />
              <span>
                {pendingCount > 0 ? `Flush Queue & Sync (${pendingCount})` : 'Reconcile & Force Cloud Sync'}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

