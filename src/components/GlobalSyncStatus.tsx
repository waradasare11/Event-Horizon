import React, { useState, useEffect } from 'react';
import { useSyncStatus } from '../lib/syncManager';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle, Wifi, WifiOff, HardDrive } from 'lucide-react';

export function GlobalSyncStatus() {
  const { isOnline, isSyncing, pendingCount, lastSyncedAt, lastError, triggerSync } = useSyncStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [relativeTime, setRelativeTime] = useState<string>('Just now');

  // Update relative time display every 15s
  useEffect(() => {
    const updateTime = () => {
      if (!lastSyncedAt) {
        setRelativeTime('Never');
        return;
      }
      const diffMs = Date.now() - new Date(lastSyncedAt).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 20) {
        setRelativeTime('Just now');
      } else if (diffSec < 60) {
        setRelativeTime(`${diffSec}s ago`);
      } else if (diffSec < 3600) {
        setRelativeTime(`${Math.floor(diffSec / 60)}m ago`);
      } else {
        setRelativeTime(`${Math.floor(diffSec / 3600)}h ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  const handleManualSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await triggerSync();
  };

  return (
    <div className="relative inline-block text-left">
      {/* Persistent Badge Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer select-none ${
          !isOnline
            ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            : isSyncing
            ? 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
            : pendingCount > 0
            ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            : 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
        }`}
        title="Click to view Global Sync Status and connection details"
      >
        {/* Status Indicator Icon */}
        {!isOnline ? (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline</span>
            {pendingCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-amber-600 text-white rounded-full text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </div>
        ) : isSyncing ? (
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
            <span>Syncing {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
          </div>
        ) : pendingCount > 0 ? (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Cloud className="w-3.5 h-3.5" />
            <span>{pendingCount} Pending Upload{pendingCount > 1 ? 's' : ''}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Cloud Synced</span>
            <span className="sm:hidden">Synced</span>
          </div>
        )}

        <span className="text-[10px] opacity-70 hidden md:inline border-l border-current/20 pl-2">
          {relativeTime}
        </span>
      </button>

      {/* Popover Card for Sync Details */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 bottom-full mb-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#1C1F1D] border border-[#E5E7EB] dark:border-[#2E3330] shadow-2xl z-50 p-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between border-b border-[#F0F2F1] dark:border-[#282D2A] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  !isOnline 
                    ? 'bg-amber-500/10 text-amber-600' 
                    : isSyncing 
                    ? 'bg-blue-500/10 text-blue-600' 
                    : 'bg-emerald-500/10 text-emerald-600'
                }`}>
                  {!isOnline ? <WifiOff className="w-4 h-4" /> : isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                    Global Cloud Sync Engine
                  </h4>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
                    Real-time persistence & offline resilience
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold px-1"
              >
                ✕
              </button>
            </div>

            {/* Metrics List */}
            <div className="space-y-2.5 text-xs">
              {/* Network Status */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F9FAFB] dark:bg-[#232725] border border-[#E5E7EB] dark:border-[#2E3330]">
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="font-medium text-[#1A1D1B] dark:text-[#E8ECE9]">
                    Network Connection
                  </span>
                </div>
                <span className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                  isOnline 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {isOnline ? 'Active (Connected)' : 'Disconnected (Offline)'}
                </span>
              </div>

              {/* Pending Upload Queue */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F9FAFB] dark:bg-[#232725] border border-[#E5E7EB] dark:border-[#2E3330]">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#6B7280] dark:text-[#9EA8A2]" />
                  <span className="font-medium text-[#1A1D1B] dark:text-[#E8ECE9]">
                    Pending Upload Queue
                  </span>
                </div>
                <span className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                  pendingCount > 0 
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' 
                    : 'bg-gray-200 dark:bg-[#2E3330] text-gray-600 dark:text-gray-300'
                }`}>
                  {pendingCount} Item{pendingCount === 1 ? '' : 's'}
                </span>
              </div>

              {/* Last Successful Sync */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F9FAFB] dark:bg-[#232725] border border-[#E5E7EB] dark:border-[#2E3330]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-[#1A1D1B] dark:text-[#E8ECE9]">
                    Last Cloud Sync
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
                  {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Pending'}
                </span>
              </div>

              {lastError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Sync note: {lastError}</span>
                </div>
              )}
            </div>

            {/* Offline Resilience Guarantee Info */}
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
              <p className="leading-relaxed">
                <strong className="text-emerald-700 dark:text-emerald-300 font-semibold">Zero-Data-Loss Guarantee:</strong> All meal logs, workouts, and biometrics are saved locally instantly with 0ms latency and automatically uploaded to Firestore when connection is available.
              </p>
            </div>

            {/* Manual Sync Trigger */}
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing || !isOnline}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#1A1D1B] dark:bg-[#E8ECE9] text-white dark:text-[#1A1D1B] text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing Now...' : 'Force Sync to Cloud'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
