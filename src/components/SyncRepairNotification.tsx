import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Database, 
  AlertTriangle, 
  Scale, 
  ListOrdered, 
  ArrowUp, 
  Trash2, 
  Check, 
  Clock 
} from 'lucide-react';
import {
  SyncHashDiscrepancy,
  subscribeDiscrepancyNotice,
  runAutomatedDataReconciliation,
  verifySummaryHashAndDetectDiscrepancies,
  repairCaloricDeviations,
} from '../lib/reconciliationWorker';
import { 
  getPendingQueueSnapshot, 
  prioritizeSyncJob, 
  clearSyncJob, 
  clearAllSyncJobs, 
  SyncJob, 
  useSyncStatus 
} from '../lib/syncManager';

export const SyncRepairNotification: React.FC = () => {
  const [discrepancy, setDiscrepancy] = useState<SyncHashDiscrepancy | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairSuccess, setRepairSuccess] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showQueueManager, setShowQueueManager] = useState(false);
  const [queueItems, setQueueItems] = useState<SyncJob[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(5); // 5-second auto fade out
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { pendingCount, isSyncing, triggerSync } = useSyncStatus();

  // Refresh queue snapshot whenever pendingCount changes or modal opens
  useEffect(() => {
    setQueueItems(getPendingQueueSnapshot());
  }, [pendingCount, showQueueManager]);

  useEffect(() => {
    // Check on session startup
    const initialTimer = setTimeout(() => {
      verifySummaryHashAndDetectDiscrepancies().then((res) => {
        if (res && res.hasDiscrepancy) {
          setDiscrepancy(res);
          setTimeLeft(5);
        }
      });
    }, 2500);

    const unsub = subscribeDiscrepancyNotice((notice) => {
      if (notice.hasDiscrepancy) {
        setDiscrepancy(notice);
        setIsDismissed(false);
        setTimeLeft(5);
      }
    });

    return () => {
      clearTimeout(initialTimer);
      unsub();
    };
  }, []);

  // 5-second countdown timer for auto-dismiss (pauses if user is interacting or viewing details/queue)
  useEffect(() => {
    if (!discrepancy || !discrepancy.hasDiscrepancy || isDismissed || isRepairing || showDetails || showQueueManager || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsDismissed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [discrepancy, isDismissed, isRepairing, showDetails, showQueueManager, isPaused]);

  if ((!discrepancy || !discrepancy.hasDiscrepancy || isDismissed) && !showQueueManager && pendingCount === 0) {
    return null;
  }

  // If dismissed but pending items exist and user had queue open, keep it open
  if (isDismissed && !showQueueManager) {
    return null;
  }

  const handleRunRepair = async () => {
    setIsRepairing(true);
    try {
      if (discrepancy?.flaggedMeals && discrepancy.flaggedMeals.length > 0) {
        await repairCaloricDeviations(discrepancy.flaggedMeals);
      }
      const report = await runAutomatedDataReconciliation();
      if (report) {
        setRepairSuccess(true);
        setTimeout(() => {
          setDiscrepancy(null);
          setRepairSuccess(false);
        }, 3500);
      }
    } catch (err) {
      console.warn('Manual sync repair execution error:', err);
    } finally {
      setIsRepairing(false);
    }
  };

  const handlePrioritize = (jobId: string) => {
    prioritizeSyncJob(jobId);
    setQueueItems(getPendingQueueSnapshot());
  };

  const handleClearJob = (jobId: string) => {
    clearSyncJob(jobId);
    setQueueItems(getPendingQueueSnapshot());
  };

  const handleClearAll = () => {
    clearAllSyncJobs();
    setQueueItems([]);
  };

  const formatJobTitle = (job: SyncJob) => {
    switch (job.type) {
      case 'meal_add':
        return `Meal: ${job.payload?.mealTitle || 'Nutrition Log'}`;
      case 'meal_delete':
        return `Delete Meal: ${job.targetId || 'ID'}`;
      case 'workout_add':
        return `Workout: ${job.payload?.routineName || 'Training Session'}`;
      case 'workout_delete':
        return `Delete Workout: ${job.targetId || 'ID'}`;
      case 'profile':
        return `Profile: ${job.payload?.name || 'Athlete Calibration'}`;
      case 'body_metric':
        return `Metric: ${job.payload?.weightKg ? `${job.payload.weightKg}kg` : 'Weight Log'}`;
      default:
        return `${job.type.replace('_', ' ')}`;
    }
  };

  const hasCaloricDeviations = (discrepancy?.caloricDeviationsCount || 0) > 0;

  return (
    <div
      id="sync-repair-notification-toast"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed bottom-6 right-6 z-40 max-w-md w-full transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="relative overflow-hidden p-4 rounded-2xl bg-white/95 dark:bg-[#151C2C]/95 backdrop-blur-md border border-emerald-500/30 dark:border-cyan-500/30 shadow-2xl text-left space-y-3">
        
        {/* Subtle 5-second countdown progress bar */}
        {!isRepairing && !repairSuccess && !showQueueManager && !showDetails && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-cyan-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 5) * 100}%` }}
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-2.5 pt-0.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              hasCaloricDeviations 
                ? 'bg-amber-500/15 text-amber-500' 
                : pendingCount > 0 
                  ? 'bg-cyan-500/15 text-cyan-400' 
                  : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              {hasCaloricDeviations ? <Scale className="w-4 h-4" /> : <Database className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Sync & Local Storage Queue
                </h4>
                {pendingCount > 0 ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30">
                    {pendingCount} Pending
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 font-mono">
                    {timeLeft}s
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {hasCaloricDeviations
                  ? `${discrepancy?.caloricDeviationsCount} deviation item(s) audit flag.`
                  : pendingCount > 0
                    ? `${pendingCount} offline action(s) stored locally in IndexedDB.`
                    : 'All athlete records synced with Google Drive & Cloud.'}
              </p>
            </div>
          </div>

          <button
            id="dismiss-sync-repair-btn"
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Flagged items breakdown if expanded */}
        {hasCaloricDeviations && discrepancy?.flaggedMeals && discrepancy.flaggedMeals.length > 0 && showDetails && (
          <div className="max-h-28 overflow-y-auto space-y-1 p-2 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px]">
            {discrepancy.flaggedMeals.map((flag) => (
              <div key={flag.mealLogId} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span className="font-medium truncate max-w-[140px]">{flag.mealTitle}</span>
                <span className="text-rose-500 font-bold">{flag.loggedCalories} → {flag.expectedCalories} kcal</span>
              </div>
            ))}
          </div>
        )}

        {/* VISUAL QUEUE MANAGEMENT INTERFACE */}
        {showQueueManager && (
          <div className="space-y-2.5 p-3 bg-slate-50 dark:bg-[#111622] rounded-xl border border-slate-200 dark:border-[#232B3E] animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pending Sync Queue ({queueItems.length})</span>
              </div>
              <div className="flex items-center gap-2">
                {queueItems.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
                <button
                  onClick={() => triggerSync()}
                  disabled={isSyncing}
                  className="text-[10px] text-cyan-500 hover:text-cyan-400 font-bold flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync All</span>
                </button>
              </div>
            </div>

            {queueItems.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                Queue is completely clear. All actions synced!
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {queueItems.map((job, idx) => (
                  <div
                    key={job.id}
                    className="p-2 rounded-lg bg-white dark:bg-[#182032] border border-slate-200 dark:border-[#232B3E] flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 truncate text-[11px]">
                        {formatJobTitle(job)}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(job.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        {job.retryCount > 0 && (
                          <span className="text-amber-500 font-medium">Retries: {job.retryCount}</span>
                        )}
                        {idx === 0 && (
                          <span className="text-[9px] font-bold px-1 rounded bg-cyan-500/20 text-cyan-400">
                            NEXT
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {idx > 0 && (
                        <button
                          onClick={() => handlePrioritize(job.id)}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 text-[10px] font-bold flex items-center gap-0.5"
                          title="Prioritize to top of queue & sync immediately"
                        >
                          <ArrowUp className="w-3 h-3" />
                          <span className="hidden sm:inline">First</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleClearJob(job.id)}
                        className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove from sync queue"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {repairSuccess ? (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>State Harmonized & Synchronized!</span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQueueManager(!showQueueManager)}
                className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>{showQueueManager ? 'Hide Queue' : `Manage Queue (${queueItems.length})`}</span>
              </button>

              {hasCaloricDeviations && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
                >
                  {showDetails ? 'Hide' : 'Details'}
                </button>
              )}
            </div>

            <button
              id="execute-sync-repair-btn"
              onClick={handleRunRepair}
              disabled={isRepairing}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0F6E5F] to-emerald-600 text-white text-[11px] font-bold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isRepairing ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{hasCaloricDeviations ? 'Recalibrate' : 'Auto Repair'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

