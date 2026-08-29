import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ShieldAlert, CheckCircle2, X, Sparkles, Database, AlertTriangle, Scale } from 'lucide-react';
import {
  SyncHashDiscrepancy,
  subscribeDiscrepancyNotice,
  runAutomatedDataReconciliation,
  verifySummaryHashAndDetectDiscrepancies,
  repairCaloricDeviations,
} from '../lib/reconciliationWorker';

export const SyncRepairNotification: React.FC = () => {
  const [discrepancy, setDiscrepancy] = useState<SyncHashDiscrepancy | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairSuccess, setRepairSuccess] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(5); // 5-second auto fade out
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // 5-second countdown timer for auto-dismiss
  useEffect(() => {
    if (!discrepancy || !discrepancy.hasDiscrepancy || isDismissed || isRepairing || showDetails || isPaused) {
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
  }, [discrepancy, isDismissed, isRepairing, showDetails, isPaused]);

  if (!discrepancy || !discrepancy.hasDiscrepancy || isDismissed) {
    return null;
  }

  const handleRunRepair = async () => {
    setIsRepairing(true);
    try {
      if (discrepancy.flaggedMeals && discrepancy.flaggedMeals.length > 0) {
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

  const hasCaloricDeviations = (discrepancy.caloricDeviationsCount || 0) > 0;

  return (
    <div
      id="sync-repair-notification-toast"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed bottom-6 right-6 z-40 max-w-sm w-full transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white/95 dark:bg-[#161817]/95 backdrop-blur-md border border-emerald-500/30 dark:border-emerald-500/20 shadow-xl text-left space-y-2.5">
        
        {/* Subtle 5-second countdown progress bar */}
        {!isRepairing && !repairSuccess && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 5) * 100}%` }}
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-2.5 pt-0.5">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              hasCaloricDeviations ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              {hasCaloricDeviations ? <Scale className="w-4 h-4" /> : <Database className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Sync & Data Consistency Check
                </h4>
                <span className="text-[9px] text-slate-400 font-mono">
                  {timeLeft}s
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {hasCaloricDeviations
                  ? `${discrepancy.caloricDeviationsCount} deviation item(s) audit flag.`
                  : `Background check active (${discrepancy.discrepancyCount || 1} sync items ready).`}
              </p>
            </div>
          </div>

          <button
            id="dismiss-sync-repair-btn"
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Flagged items breakdown if expanded */}
        {hasCaloricDeviations && discrepancy.flaggedMeals && discrepancy.flaggedMeals.length > 0 && showDetails && (
          <div className="max-h-28 overflow-y-auto space-y-1 p-2 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px]">
            {discrepancy.flaggedMeals.map((flag) => (
              <div key={flag.mealLogId} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span className="font-medium truncate max-w-[120px]">{flag.mealTitle}</span>
                <span className="text-rose-500 font-bold">{flag.loggedCalories} → {flag.expectedCalories} kcal</span>
              </div>
            ))}
          </div>
        )}

        {repairSuccess ? (
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>State Harmonized & Calibrated!</span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
            >
              {showDetails ? 'Hide details' : 'View details'}
            </button>

            <button
              id="execute-sync-repair-btn"
              onClick={handleRunRepair}
              disabled={isRepairing}
              className="px-2.5 py-1 rounded-lg bg-[#0F6E5F] text-white text-[11px] font-semibold hover:bg-[#0D5B4F] transition-all flex items-center gap-1 shadow-xs disabled:opacity-50"
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
