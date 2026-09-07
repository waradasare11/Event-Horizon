import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Flame, 
  Moon, 
  Sun, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  Droplets, 
  Sliders, 
  ShieldCheck,
  Lock,
  Unlock,
  ChevronRight,
  Info
} from 'lucide-react';
import { IntermittentFastingSettings } from '../types';

interface IntermittentFastingCardProps {
  settings: IntermittentFastingSettings;
  onUpdateSettings: (newSettings: IntermittentFastingSettings) => void;
  isOverrideDimming: boolean;
  onToggleOverrideDimming: () => void;
}

export const IntermittentFastingCard: React.FC<IntermittentFastingCardProps> = ({
  settings,
  onUpdateSettings,
  isOverrideDimming,
  onToggleOverrideDimming,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isEditingWindow, setIsEditingWindow] = useState<boolean>(false);

  // Update clock every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Parse eating window start and end hours/minutes
  const { isCurrentlyFasting, timeUntilNextTransition, progressPercent, fastingHoursElapsed } = useMemo(() => {
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = settings.eatingWindowStart.split(':').map(Number);
    const [endH, endM] = settings.eatingWindowEnd.split(':').map(Number);

    const eatingStartMin = startH * 60 + startM;
    const eatingEndMin = endH * 60 + endM;

    let isFasting = false;
    let minutesUntilChange = 0;
    let elapsedFastingMin = 0;
    const totalFastingMin = settings.targetFastingHours * 60;

    if (eatingStartMin <= eatingEndMin) {
      // Standard daytime window (e.g. 12:00 to 20:00)
      if (currentMinutes >= eatingStartMin && currentMinutes < eatingEndMin) {
        isFasting = false;
        minutesUntilChange = eatingEndMin - currentMinutes;
      } else {
        isFasting = true;
        if (currentMinutes < eatingStartMin) {
          minutesUntilChange = eatingStartMin - currentMinutes;
          elapsedFastingMin = (24 * 60 - eatingEndMin) + currentMinutes;
        } else {
          minutesUntilChange = (24 * 60 - currentMinutes) + eatingStartMin;
          elapsedFastingMin = currentMinutes - eatingEndMin;
        }
      }
    } else {
      // Overnight window (e.g. 20:00 to 04:00)
      if (currentMinutes >= eatingStartMin || currentMinutes < eatingEndMin) {
        isFasting = false;
        minutesUntilChange = currentMinutes >= eatingStartMin 
          ? (24 * 60 - currentMinutes) + eatingEndMin 
          : eatingEndMin - currentMinutes;
      } else {
        isFasting = true;
        minutesUntilChange = eatingStartMin - currentMinutes;
        elapsedFastingMin = currentMinutes - eatingEndMin;
      }
    }

    const hours = Math.floor(minutesUntilChange / 60);
    const mins = minutesUntilChange % 60;
    const timeUntilStr = `${hours}h ${mins}m`;

    const progress = isFasting
      ? Math.min(100, Math.round((elapsedFastingMin / totalFastingMin) * 100))
      : 100;

    return {
      isCurrentlyFasting: isFasting,
      timeUntilNextTransition: timeUntilStr,
      progressPercent: progress,
      fastingHoursElapsed: (elapsedFastingMin / 60).toFixed(1),
    };
  }, [currentTime, settings]);

  const handleProtocolSelect = (protocol: '16:8' | '14:10' | '18:6' | '20:4') => {
    let eatingHours = 8;
    let fastingHours = 16;
    let eatingStart = '12:00';
    let eatingEnd = '20:00';

    if (protocol === '14:10') {
      eatingHours = 10;
      fastingHours = 14;
      eatingStart = '10:00';
      eatingEnd = '20:00';
    } else if (protocol === '18:6') {
      eatingHours = 6;
      fastingHours = 18;
      eatingStart = '13:00';
      eatingEnd = '19:00';
    } else if (protocol === '20:4') {
      eatingHours = 4;
      fastingHours = 20;
      eatingStart = '14:00';
      eatingEnd = '18:00';
    }

    onUpdateSettings({
      ...settings,
      protocol,
      targetFastingHours: fastingHours,
      eatingWindowHours: eatingHours,
      eatingWindowStart: eatingStart,
      eatingWindowEnd: eatingEnd,
    });
  };

  const handleToggleEnabled = () => {
    onUpdateSettings({
      ...settings,
      enabled: !settings.enabled,
    });
  };

  return (
    <div className="bg-white dark:bg-[#161817] p-5 sm:p-6 rounded-3xl border border-emerald-500/20 shadow-xs space-y-5">
      {/* Header & Main Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`p-2.5 rounded-2xl transition-all ${
            settings.enabled 
              ? 'bg-[#0F6E5F] text-white shadow-xs' 
              : 'bg-gray-100 dark:bg-[#252826] text-gray-500'
          }`}>
            <Clock className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                Intermittent Fasting Schedule
              </h3>
              {settings.enabled && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#0F6E5F] dark:text-[#5FD1B8] border border-emerald-500/20">
                  {settings.protocol} Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Auto-dims meal log inputs during fasting hours to strengthen dietary discipline and metabolic health.
            </p>
          </div>
        </div>

        {/* Master ON / OFF Toggle */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
            {settings.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <button
            type="button"
            onClick={handleToggleEnabled}
            className={`w-12 h-6.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              settings.enabled ? 'bg-[#0F6E5F]' : 'bg-gray-300 dark:bg-[#343836]'
            }`}
            aria-label="Toggle Intermittent Fasting"
          >
            <div
              className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${
                settings.enabled ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* When Fasting is Enabled: Controls & Live State */}
      {settings.enabled && (
        <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800 animate-in fade-in">
          {/* Protocol Selection Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mr-1">
              Select Protocol:
            </span>
            {(['16:8', '14:10', '18:6', '20:4'] as const).map((proto) => (
              <button
                key={proto}
                type="button"
                onClick={() => handleProtocolSelect(proto)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.protocol === proto
                    ? 'bg-[#0F6E5F] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-[#252826] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2E3230]'
                }`}
              >
                {proto} {proto === '16:8' ? '(LeanGains)' : proto === '14:10' ? '(Gentle)' : proto === '18:6' ? '(Warrior)' : '(OMAD)'}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsEditingWindow(!isEditingWindow)}
              className="ml-auto text-xs font-bold text-[#0F6E5F] dark:text-[#5FD1B8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isEditingWindow ? 'Done' : 'Custom Window'}</span>
            </button>
          </div>

          {/* Custom Window Time Selectors */}
          {isEditingWindow && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1A1D1C] border border-gray-200 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Eating Window Starts
                </label>
                <input
                  type="time"
                  value={settings.eatingWindowStart}
                  onChange={(e) => onUpdateSettings({ ...settings, eatingWindowStart: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#242826] border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Eating Window Ends (Fasting Starts)
                </label>
                <input
                  type="time"
                  value={settings.eatingWindowEnd}
                  onChange={(e) => onUpdateSettings({ ...settings, eatingWindowEnd: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#242826] border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Live Fasting / Eating Status Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isCurrentlyFasting
              ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/30 dark:via-[#161817] dark:to-[#161817] border-amber-500/30'
              : 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/30 dark:via-[#161817] dark:to-[#161817] border-emerald-500/30'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`p-2.5 rounded-2xl ${
                  isCurrentlyFasting 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'bg-[#0F6E5F] text-white shadow-xs'
                }`}>
                  {isCurrentlyFasting ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black uppercase tracking-wider ${
                      isCurrentlyFasting ? 'text-amber-800 dark:text-amber-300' : 'text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {isCurrentlyFasting ? '⏳ Fasting Window Active' : '🍽️ Eating Window Open'}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({settings.eatingWindowStart} - {settings.eatingWindowEnd})
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-gray-900 dark:text-white mt-0.5">
                    {isCurrentlyFasting
                      ? `Opens in ${timeUntilNextTransition} (at ${settings.eatingWindowStart})`
                      : `Closes in ${timeUntilNextTransition} (at ${settings.eatingWindowEnd})`}
                  </div>
                </div>
              </div>

              {/* Dimming Override Button */}
              {isCurrentlyFasting && (
                <button
                  type="button"
                  onClick={onToggleOverrideDimming}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto ${
                    isOverrideDimming
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-[#252826] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {isOverrideDimming ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span>{isOverrideDimming ? 'Dimming Overridden' : 'Un-dim Inputs'}</span>
                </button>
              )}
            </div>

            {/* Fasting Progress Bar */}
            {isCurrentlyFasting && (
              <div className="space-y-1.5 mt-4 pt-3 border-t border-amber-500/20">
                <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-400">
                  <span>Fasting Progress</span>
                  <span>{fastingHoursElapsed}h / {settings.targetFastingHours}h ({progressPercent}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
