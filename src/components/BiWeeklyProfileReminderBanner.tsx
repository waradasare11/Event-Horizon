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
      const legacy = localStorage.getItem('peakform_profile_reminder_snoozed_until');
      if (legacy) {
        localStorage.setItem('aroh_profile_reminder_snoozed_until', legacy);
        localStorage.removeItem('peakform_profile_reminder_snoozed_until');
      }
      const snoozedUntil = localStorage.getItem('aroh_profile_reminder_snoozed_until');
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
      localStorage.setItem('aroh_profile_reminder_snoozed_until', String(Date.now() + threeDaysMs));
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#3B82F6]/15 via-[#1E3A5F]/40 to-[#38BDF8]/15 border border-[#3B82F6]/30 p-4 sm:p-5 shadow-lg backdrop-blur-md mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-[#60A5FA] flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#60A5FA] bg-[#3B82F6]/15 px-2 py-0.5 rounded-md">
                2-Week Profile Calibration Due
              </span>
              <span className="text-[11px] text-[#8BA3C7] font-medium">
                Last updated {daysSince} days ago ({userProfile.email})
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white font-['Space_Grotesk',sans-serif]">
              Keep Your Athlete Profile & Metabolic Calculations Calibrated
            </h4>
            <p className="text-xs text-[#8BA3C7] max-w-2xl leading-relaxed">
              It has been {daysSince} days since your last profile review. Updating your current weight ({userProfile.weightKg || '--'} kg), daily calorie targets ({userProfile.dailyCalories || '--'} kcal), and training days ensures your progressive overload and macro formulas remain properly calibrated for your training.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 ml-auto md:ml-0">
          <button
            type="button"
            onClick={onConfirmCurrentSettings}
            className="px-3.5 py-2 rounded-xl bg-[#121A2B] hover:bg-[#1E3A5F] text-[#E8F1FF] border border-[#1E3A5F] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Confirm that your current weight, macros, and training schedule are unchanged"
          >
            <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
            <span>Keep As Is</span>
          </button>

          <button
            type="button"
            onClick={onOpenCalibration}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#60A5FA] hover:to-[#3B82F6] text-white text-xs font-bold shadow-md shadow-[#3B82F6]/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Calibrate Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleSnooze}
            className="p-2 rounded-xl text-[#8BA3C7] hover:text-[#E8F1FF] hover:bg-[#121A2B] transition-all cursor-pointer"
            title="Snooze reminder for 3 days"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
