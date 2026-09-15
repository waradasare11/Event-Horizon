import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  Calendar,
  CheckSquare,
  HardDrive,
  FolderSync,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  getStoredGoogleWorkspaceAuth,
  connectGoogleWorkspace,
  backupAllDataToGoogleDrive,
  GoogleWorkspaceAuthState,
  createGoogleCalendarWorkoutEvent,
  syncDailyTasksToGoogleTasks,
} from '../lib/googleWorkspace';
import { UserProfile, MealLog, WorkoutLog, BodyMetric } from '../types';

interface CloudSyncWidgetProps {
  userProfile: UserProfile;
  mealLogs: MealLog[];
  workoutLogs: WorkoutLog[];
  bodyMetrics: BodyMetric[];
}

export const CloudSyncWidget: React.FC<CloudSyncWidgetProps> = ({
  userProfile,
  mealLogs,
  workoutLogs,
  bodyMetrics,
}) => {
  const [authState, setAuthState] = useState<GoogleWorkspaceAuthState>(getStoredGoogleWorkspaceAuth());
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setAuthState(getStoredGoogleWorkspaceAuth());
  }, []);

  const handleConnect = async () => {
    setErrorMessage(null);
    setBackupMessage(null);
    try {
      const result = await connectGoogleWorkspace(userProfile.email);
      if (result.success) {
        setAuthState(getStoredGoogleWorkspaceAuth());
        setBackupMessage('Connected to Google Drive, Calendar & Tasks. "AROH AI" folder ready.');
        setTimeout(() => setBackupMessage(null), 4000);
      } else {
        setErrorMessage(result.error || 'Failed to connect Google Workspace');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection error');
    }
  };

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    setErrorMessage(null);
    setBackupMessage(null);
    try {
      const res = await backupAllDataToGoogleDrive({
        userProfile,
        mealLogs,
        workoutLogs,
        bodyMetrics,
      });

      if (res.success) {
        setAuthState(getStoredGoogleWorkspaceAuth());
        setBackupMessage(`Backup saved to "AROH AI" folder in Google Drive at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Backup failed. Please verify Google Drive permissions.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const formattedLastBackup = authState.lastBackupTimestamp
    ? new Date(authState.lastBackupTimestamp).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never';

  return (
    <div
      id="cloud-sync-control-section"
      className="mt-4 pt-4 border-t border-[#E5E7EB] dark:border-[#2A2416] flex flex-col md:flex-row md:items-center justify-between gap-3.5 text-left"
    >
      {/* Left: Google Workspace Services Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 text-[#A68523] dark:text-[#F0D060] flex items-center justify-center shrink-0">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-[#1A1D1B] dark:text-[#E8ECE9]">
                Google Workspace Cloud Sync
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/10 text-[#A68523] dark:text-[#F0D060] border border-[#D4AF37]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                <span>Connected</span>
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] flex items-center gap-1.5 mt-0.5">
              <FolderSync className="w-3 h-3 text-[#D4AF37] dark:text-[#F0D060]" />
              <span>Drive Folder: <strong>AROH AI</strong></span>
              <span>•</span>
              <span>Last Backup: <strong>{formattedLastBackup}</strong></span>
            </p>
          </div>
        </div>

        {/* Integration Status Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2220] border border-[#E5E7EB] dark:border-[#2A2416] text-[10px] font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">
            <HardDrive className="w-3 h-3 text-[#D4AF37] dark:text-[#F0D060]" />
            <span>Drive (CSV Backups)</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2220] border border-[#E5E7EB] dark:border-[#2A2416] text-[10px] font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">
            <Calendar className="w-3 h-3 text-amber-500" />
            <span>Calendar</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2220] border border-[#E5E7EB] dark:border-[#2A2416] text-[10px] font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">
            <CheckSquare className="w-3 h-3 text-[#D4AF37]" />
            <span>Tasks</span>
          </span>
        </div>
      </div>

      {/* Right: Backup Now Action Trigger */}
      <div className="flex items-center gap-2 self-start md:self-center shrink-0">
        <button
          id="cloud-sync-backup-now-btn"
          type="button"
          onClick={handleBackupNow}
          disabled={isBackingUp}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#D4AF37] hover:bg-[#A68523] text-white shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 min-h-[38px]"
          title="Export all workouts, nutrition logs, and body metrics directly to your AROH AI Google Drive folder"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
          <span>{isBackingUp ? 'Backing Up...' : 'Backup Now'}</span>
        </button>
      </div>

      {/* Status Notifications */}
      {(backupMessage || errorMessage) && (
        <div className="w-full mt-2">
          {backupMessage && (
            <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#8E701C] dark:text-[#F0D060] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{backupMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
