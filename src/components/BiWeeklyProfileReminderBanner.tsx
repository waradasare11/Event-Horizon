import React, { useState } from 'react';
import { UserProfile } from '../types';
import { UserCheck, RefreshCw, X, ArrowRight, ShieldCheck, Sparkles, Clock } from 'lucide-react';

interface BiWeeklyProfileReminderBannerProps {
  userProfile: UserProfile;
  onOpenCalibration: () => void;
  onConfirmCurrentSettings: () => void;
}

export const BiWeeklyProfileReminderBanner: React.FC<BiWeeklyProfileReminderBannerProps> = ({
  userProfile,
  onOpenCalibration,
  onConfirmCurrentSettings,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      const snoozedUntil = localStorage.getItem('peakform_profile_reminder_snoozed_until');
      if (snoozedUntil) {
        return Date.now() < Number(snoozedUntil);
      }
    } catch {
      // ignore
    }
    return false;
  });

  if (isDismissed || !userProfile.isOnboarded || !userProfile.email) {
    return null;
  }

  // Calculate days since last update
  const lastUpdate = userProfile.lastProfileUpdateDate || userProfile.lastQuarterlyReviewDate;
  const daysSince = lastUpdate
    ? Math.floor((Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24))
    : 15; // default to 15 if not set yet so new onboarded user gets prompt after 2 weeks

  // Only show if 14 or more days have elapsed
  if (daysSince < 14) {
    return null;
  }

  const handleSnooze = () => {
    setIsDismissed(true);
    try {
      // Snooze for 3 days
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      localStorage.setItem('peakform_profile_reminder_snoozed_until', String(Date.now() + threeDaysMs));
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-cyan-500/15 border border-amber-500/30 dark:border-amber-400/30 p-4 sm:p-5 shadow-lg backdrop-blur-md mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md">
                2-Week Profile Calibration Due
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Last updated {daysSince} days ago ({userProfile.email})
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Space_Grotesk',sans-serif]">
              Keep Your Athlete Profile & Metabolic Calculations Calibrated
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              It has been {daysSince} days since your last profile review. Updating your current weight ({userProfile.weightKg || '--'} kg), daily calorie targets ({userProfile.dailyCalories || '--'} kcal), and training days ensures your progressive overload and macro formulas remain properly calibrated for your training.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 ml-auto md:ml-0">
          <button
            type="button"
            onClick={onConfirmCurrentSettings}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#141C34] hover:bg-slate-200 dark:hover:bg-[#1C2748] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Confirm that your current weight, macros, and training schedule are unchanged"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Keep As Is</span>
          </button>

          <button
            type="button"
            onClick={onOpenCalibration}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Calibrate Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleSnooze}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Snooze reminder for 3 days"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
