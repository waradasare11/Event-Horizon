import React, { useState } from 'react';
import { 
  Flame, 
  Trophy, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  TrendingUp, 
  Check, 
  Info,
  Dumbbell,
  HeartHandshake,
  Activity
} from 'lucide-react';
import { WorkoutCompletionLog, UserProfile } from '../types';
import confetti from 'canvas-confetti';

interface ConsistencyStreakTrackerProps {
  workoutLogs: WorkoutCompletionLog[];
  userProfile: UserProfile;
  onToggleWorkoutLog: (date: string, dayId: string, dayName: string, durationMin: number, exercisesCompleted: number, totalExercises: number, isRestDay?: boolean) => void;
}

export const ConsistencyStreakTracker: React.FC<ConsistencyStreakTrackerProps> = ({
  workoutLogs,
  userProfile,
  onToggleWorkoutLog,
}) => {
  const [selectedLogDate, setSelectedLogDate] = useState<string | null>(null);
  const [showScienceRationale, setShowScienceRationale] = useState<boolean>(false);

  // Generate 28-day rolling window up to today
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const daysWindow: { dateStr: string; dayNum: number; dayNameShort: string; isToday: boolean; log?: WorkoutCompletionLog }[] = [];
  
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = workoutLogs.find((l) => l.date === dateStr);
    daysWindow.push({
      dateStr,
      dayNum: d.getDate(),
      dayNameShort: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isToday: dateStr === todayStr,
      log,
    });
  }

  // Calculate Current Streak (consecutive days of completed workout or rest day)
  let currentStreak = 0;
  for (let i = daysWindow.length - 1; i >= 0; i--) {
    const day = daysWindow[i];
    if (day.log) {
      currentStreak++;
    } else if (day.isToday) {
      // If today hasn't been logged yet, check yesterday to continue streak
      continue;
    } else {
      break;
    }
  }

  // Calculate Best / Longest Streak in history
  let longestStreak = 0;
  let tempStreak = 0;
  for (const day of daysWindow) {
    if (day.log) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }
  if (longestStreak < currentStreak) longestStreak = currentStreak;

  // Calculate adherence rate over the 28-day period
  const totalCompletedInWindow = daysWindow.filter((d) => d.log).length;
  const adherencePct = Math.round((totalCompletedInWindow / 28) * 100);

  // Determine Consistency Tier
  let streakTier = 'Ignition Phase 🚀';
  let tierColor = 'text-amber-600 bg-amber-500/10 border-amber-500/30';
  let nextMilestone = 3;

  if (currentStreak >= 30) {
    streakTier = 'Legendary Iron Master 🌟';
    tierColor = 'text-purple-600 bg-purple-500/10 border-purple-500/30';
    nextMilestone = 60;
  } else if (currentStreak >= 14) {
    streakTier = 'Hypertrophy Consistency Master 👑';
    tierColor = 'text-[#0F6E5F] bg-[#0F6E5F]/10 border-[#0F6E5F]/30';
    nextMilestone = 30;
  } else if (currentStreak >= 7) {
    streakTier = 'Neural Adaptation Momentum ⚡';
    tierColor = 'text-[#E8912D] bg-[#E8912D]/10 border-[#E8912D]/30';
    nextMilestone = 14;
  } else if (currentStreak >= 3) {
    streakTier = 'Habit Formation Phase 🎯';
    tierColor = 'text-blue-600 bg-blue-500/10 border-blue-500/30';
    nextMilestone = 7;
  }

  const handleQuickLogToday = (isRest: boolean = false) => {
    onToggleWorkoutLog(
      todayStr,
      isRest ? 'rest-day' : 'upper-1',
      isRest ? 'Active Recovery & CNS Replenishment' : 'Upper Body Power Session',
      isRest ? 30 : 55,
      isRest ? 1 : 5,
      isRest ? 1 : 5,
      isRest
    );

    // Trigger confetti on logging
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0F6E5F', '#E8912D', '#16A34A', '#F59E0B'],
      });
    } catch (e) {
      // Ignored if confetti fails
    }
  };

  const todayLog = daysWindow.find((d) => d.isToday)?.log;

  return (
    <div className="bg-white dark:bg-[#161817] p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs space-y-6 text-left transition-colors">
      {/* Top Banner with Fire Streak & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E5E7EB] dark:border-[#242826]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8912D]/10 dark:bg-[#E8912D]/20 text-[#E8912D] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-[#E8912D]" />
              Retention & Adherence Engine
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tierColor}`}>
              {streakTier}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-2 flex items-center gap-2">
            Training Consistency Streak
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA8A2] mt-1 max-w-xl">
            Research shows habit adherence is the #1 predictor of long-term hypertrophy and metabolic transformation. Scheduled active recovery days keep your streak intact!
          </p>
        </div>

        {/* Big Counter & Milestone Progress */}
        <div className="flex items-center gap-4 bg-[#FAFAF8] dark:bg-[#1A1D1C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2E2C] shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#E8912D] to-amber-400 text-white flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
            <Flame className="w-6 h-6 fill-white drop-shadow-xs" />
            <span className="text-xs font-black tracking-tight">{currentStreak}D</span>
          </div>

          <div>
            <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2] font-semibold">Active Streak</div>
            <div className="text-2xl font-extrabold text-[#1A1D1B] dark:text-[#E8ECE9]">
              {currentStreak} <span className="text-xs font-normal text-[#6B7280] dark:text-[#9EA8A2]">Consecutive Days</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
              <span>Best: <strong>{longestStreak} Days</strong></span>
              <span>•</span>
              <span>28-Day Adherence: <strong className="text-[#0F6E5F] dark:text-[#2DD4BF]">{adherencePct}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Button for Today's Workout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0F6E5F]/8 via-[#0F6E5F]/4 to-transparent dark:from-[#0F6E5F]/15 dark:via-[#0F6E5F]/5 dark:to-transparent border border-[#0F6E5F]/20 dark:border-[#0F6E5F]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${todayLog ? 'bg-emerald-500 text-white' : 'bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#2DD4BF]'}`}>
            {todayLog ? <CheckCircle2 className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-1.5">
              <span>Today's Goal ({today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})</span>
              {todayLog && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  {todayLog.isRestDay ? 'Active Recovery Done' : 'Workout Completed'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
              {todayLog
                ? `Logged: ${todayLog.dayName} • Streak maintained!`
                : 'Complete your prescribed workout or log a scheduled recovery session to sustain your streak.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => handleQuickLogToday(false)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
              todayLog && !todayLog.isRestDay
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-[#0F6E5F] text-white hover:bg-[#0D5B4F]'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{todayLog && !todayLog.isRestDay ? 'Workout Logged ✓' : 'Log Workout Completed'}</span>
          </button>

          <button
            onClick={() => handleQuickLogToday(true)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 border ${
              todayLog && todayLog.isRestDay
                ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                : 'bg-white dark:bg-[#1A1D1C] text-[#4B5563] dark:text-[#E8ECE9] border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-[#F9FAFB] dark:hover:bg-[#242826]'
            }`}
            title="Scheduled rest day for CNS and muscular repair"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>{todayLog && todayLog.isRestDay ? 'Rest Day Logged' : 'Log Active Rest'}</span>
          </button>
        </div>
      </div>

      {/* 28-DAY ROLLING CONSISTENCY HEATMAP CALENDAR */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0F6E5F] dark:text-[#2DD4BF]" />
            <h3 className="text-sm font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">28-Day Consistency Matrix</h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              Workout ({daysWindow.filter((d) => d.log && !d.log.isRestDay).length})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block" />
              Active Recovery ({daysWindow.filter((d) => d.log && d.log.isRestDay).length})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#E5E7EB] dark:bg-[#2A2E2C] inline-block" />
              Missed / Rest
            </span>
          </div>
        </div>

        {/* Heatmap Grid (7 columns x 4 rows) */}
        <div className="grid grid-cols-7 gap-2 sm:gap-2.5 bg-[#FAFAF8] dark:bg-[#111312] p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#242826]">
          {daysWindow.map((day) => {
            const hasLog = !!day.log;
            const isRest = day.log?.isRestDay;
            const isSelected = selectedLogDate === day.dateStr;

            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedLogDate(isSelected ? null : day.dateStr)}
                className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all relative flex flex-col items-center justify-between h-16 sm:h-20 ${
                  isSelected
                    ? 'ring-2 ring-[#0F6E5F] dark:ring-[#2DD4BF] border-transparent shadow-xs'
                    : 'border-[#E5E7EB] dark:border-[#2A2E2C]'
                } ${
                  hasLog
                    ? isRest
                      ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200'
                      : 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-white dark:bg-[#1A1D1C] hover:bg-neutral-50 dark:hover:bg-[#232726] text-[#6B7280] dark:text-[#9EA8A2]'
                } ${day.isToday ? 'ring-2 ring-amber-400/80' : ''}`}
              >
                <div className="flex items-center justify-between w-full text-[10px]">
                  <span className="font-medium text-[#9CA3AF] dark:text-[#6B7280] uppercase">{day.dayNameShort}</span>
                  {day.isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Today" />
                  )}
                </div>

                <div className="font-extrabold text-xs sm:text-sm my-auto">
                  {day.dayNum}
                </div>

                <div className="w-full flex items-center justify-center">
                  {hasLog ? (
                    isRest ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )
                  ) : (
                    <span className="text-[10px] text-[#9CA3AF] dark:text-[#525754]">-</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED DAY DETAIL DRAWER */}
      {selectedLogDate && (
        <div className="p-4 rounded-2xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] text-xs space-y-2 animate-in fade-in duration-200">
          {(() => {
            const dayInfo = daysWindow.find((d) => d.dateStr === selectedLogDate);
            const log = dayInfo?.log;

            return (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-2">
                    <span>{new Date(selectedLogDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    {dayInfo?.isToday && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">Today</span>}
                  </div>
                  <div className="text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
                    {log
                      ? `${log.dayName} (${log.durationMin} mins, ${log.exercisesCompleted}/${log.totalExercises} exercises completed)`
                      : 'No training recorded on this day.'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onToggleWorkoutLog(
                        selectedLogDate,
                        log?.dayId || 'upper-1',
                        log?.dayName || 'Upper Body Power Session',
                        log?.durationMin || 55,
                        5,
                        5,
                        false
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0F6E5F] text-white text-xs font-semibold hover:bg-[#0D5B4F] transition-all"
                  >
                    {log && !log.isRestDay ? 'Remove Log' : 'Log Workout'}
                  </button>

                  <button
                    onClick={() => {
                      onToggleWorkoutLog(
                        selectedLogDate,
                        'rest-day',
                        'Active Recovery & CNS Replenishment',
                        30,
                        1,
                        1,
                        true
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111312] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#374151] dark:text-[#D1D5DB] text-xs font-semibold hover:bg-[#F3F4F6] dark:hover:bg-[#232726] transition-all"
                  >
                    {log && log.isRestDay ? 'Remove Rest Log' : 'Log Rest Day'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* MOTIVATIONAL MILESTONE BADGES */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#E8912D]" />
            <h3 className="text-sm font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">Scientific Retention Milestones</h3>
          </div>
          <span className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
            Next badge unlock in <strong>{Math.max(0, nextMilestone - currentStreak)} days</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Badge 1: 3-Day Ignition */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            currentStreak >= 3
              ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-[#FAFAF8] dark:bg-[#1A1D1C] border-[#E5E7EB] dark:border-[#2A2E2C] opacity-50'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xl">🚀</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                3 Days
              </span>
            </div>
            <div className="font-bold text-xs mt-2 text-[#1A1D1B] dark:text-[#E8ECE9]">Habit Ignition</div>
            <p className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">Overcomes initial inertia & triggers routine.</p>
          </div>

          {/* Badge 2: 7-Day Neural Adaptation */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            currentStreak >= 7
              ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200'
              : 'bg-[#FAFAF8] dark:bg-[#1A1D1C] border-[#E5E7EB] dark:border-[#2A2E2C] opacity-50'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xl">⚡</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-200/60 dark:bg-orange-900/60 text-orange-900 dark:text-orange-200">
                7 Days
              </span>
            </div>
            <div className="font-bold text-xs mt-2 text-[#1A1D1B] dark:text-[#E8ECE9]">Neural Momentum</div>
            <p className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">Initial motor unit recruitment optimizations.</p>
          </div>

          {/* Badge 3: 14-Day Hypertrophy Master */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            currentStreak >= 14
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-2xs'
              : 'bg-[#FAFAF8] dark:bg-[#1A1D1C] border-[#E5E7EB] dark:border-[#2A2E2C] opacity-50'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xl">🏆</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                14 Days
              </span>
            </div>
            <div className="font-bold text-xs mt-2 text-[#1A1D1B] dark:text-[#E8ECE9]">Hypertrophy Master</div>
            <p className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">Structural myofibrillar protein synthesis accretion.</p>
          </div>

          {/* Badge 4: 30-Day Built With Science Legend */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            currentStreak >= 30
              ? 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 shadow-2xs'
              : 'bg-[#FAFAF8] dark:bg-[#1A1D1C] border-[#E5E7EB] dark:border-[#2A2E2C] opacity-50'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xl">🌟</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-200/60 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200">
                30 Days
              </span>
            </div>
            <div className="font-bold text-xs mt-2 text-[#1A1D1B] dark:text-[#E8ECE9]">Science Legend</div>
            <p className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">Complete metabolic & muscular habit internalization.</p>
          </div>
        </div>
      </div>

      {/* SCIENTIFIC ADHERENCE CITATION BANNER */}
      <div className="p-4 rounded-2xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E8912D] shrink-0" />
          <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">Evidence Consensus (Schoenfeld et al.):</span>
          <span className="text-[#6B7280] dark:text-[#9EA8A2]">
            Maintaining consistent weekly volume frequency produces +38% greater hypertrophy retention than erratic spike training.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowScienceRationale(!showScienceRationale)}
          className="text-[#0F6E5F] dark:text-[#2DD4BF] font-bold hover:underline shrink-0 text-left sm:text-right"
        >
          {showScienceRationale ? 'Close Details' : 'Read Science Basis'}
        </button>
      </div>

      {showScienceRationale && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#111312] border border-[#E5E7EB] dark:border-[#2A2E2C] text-xs text-[#4B5563] dark:text-[#D1D5DB] space-y-2 animate-in fade-in duration-200">
          <p>
            <strong>Why Rest Days Do Not Break Streaks:</strong> Skeletal muscle hypertrophy occurs during periods of rest through satellite cell donation and ribosomal biogenesis. Overtraining without scheduled CNS deloads causes elevated resting cortisol, catabolic muscle breakdown, and psychological burnout.
          </p>
          <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
            PeakForm's <em>Consistency Streak</em> rewards both high-intensity progressive overload sessions and structured active recovery days to ensure healthy, lifelong adherence.
          </p>
        </div>
      )}
    </div>
  );
};
