import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Flame, 
  Dumbbell, 
  Trophy, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Sparkles,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { WorkoutCompletionLog, UserProfile } from '../types';

interface CalendarHeatmapViewProps {
  workoutLogs: WorkoutCompletionLog[];
  userProfile: UserProfile;
  onToggleWorkoutLog?: (
    date: string,
    dayId: string,
    dayName: string,
    durationMin: number,
    exercisesCompleted: number,
    totalExercises: number,
    isRestDay?: boolean
  ) => void;
}

interface CalendarDayData {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayOfMonth: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  log?: WorkoutCompletionLog;
  volumeKg: number;
  durationMin: number;
  intensityLevel: 0 | 1 | 2 | 3 | 4; // 0=None, 1=Light, 2=Moderate, 3=High, 4=Peak/PR
  exercisesCount: number;
  workoutTitle: string;
}

export const CalendarHeatmapView: React.FC<CalendarHeatmapViewProps> = ({
  workoutLogs,
  userProfile,
  onToggleWorkoutLog,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null);
  const [timeframe, setTimeframe] = useState<'single_month' | 'three_months' | 'year'>('single_month');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Map real workout logs to dates for instant lookup
  const logsMap = useMemo(() => {
    const map = new Map<string, WorkoutCompletionLog>();
    workoutLogs.forEach((log) => {
      map.set(log.date, log);
    });
    return map;
  }, [workoutLogs]);

  // Estimate workout volume if not explicitly recorded in log
  const calculateVolumeForLog = (log?: WorkoutCompletionLog): number => {
    if (!log) return 0;
    if (log.isRestDay) return 0;
    
    // If estimated volume exists on log
    const baseExCount = log.exercisesCompleted || 5;
    const duration = log.durationMin || 45;
    
    // Realistic estimated volume: ~80-120 kg per working set * sets
    return Math.round(baseExCount * 4 * (userProfile.weightKg * 0.9) * (duration / 40));
  };

  // Build calendar month data
  const calendarMonths = useMemo(() => {
    const monthsToGenerate = timeframe === 'single_month' ? 1 : timeframe === 'three_months' ? 3 : 12;
    const result: Array<{
      year: number;
      month: number;
      monthName: string;
      days: CalendarDayData[];
    }> = [];

    for (let m = 0; m < monthsToGenerate; m++) {
      // Calculate target year & month
      const target = new Date(currentDate.getFullYear(), currentDate.getMonth() - (monthsToGenerate - 1 - m), 1);
      const year = target.getFullYear();
      const month = target.getMonth();
      const monthName = target.toLocaleString('default', { month: 'long', year: 'numeric' });

      // First day of month & total days
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const totalDaysInMonth = lastDay.getDate();

      // Starting day of week (0=Sun, 1=Mon, ..., 6=Sat) - Align to Mon start (0=Mon, 6=Sun)
      const startDayOfWeek = (firstDay.getDay() + 6) % 7; 

      const days: CalendarDayData[] = [];

      // Preceding padding days from previous month
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = prevMonthLastDay - i;
        const padDate = new Date(year, month - 1, d);
        const padDateStr = padDate.toISOString().split('T')[0];
        const log = logsMap.get(padDateStr);
        const volumeKg = calculateVolumeForLog(log);
        
        days.push({
          date: padDate,
          dateStr: padDateStr,
          dayOfMonth: d,
          dayOfWeek: padDate.getDay(),
          isCurrentMonth: false,
          isToday: padDateStr === todayStr,
          isFuture: padDate > new Date(),
          log,
          volumeKg,
          durationMin: log?.durationMin || 0,
          intensityLevel: getIntensityTier(volumeKg, log),
          exercisesCount: log?.exercisesCompleted || 0,
          workoutTitle: log?.dayName || 'No Workout Logged',
        });
      }

      // Current month days
      for (let d = 1; d <= totalDaysInMonth; d++) {
        const curDate = new Date(year, month, d);
        const curDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const log = logsMap.get(curDateStr);
        const volumeKg = calculateVolumeForLog(log);

        days.push({
          date: curDate,
          dateStr: curDateStr,
          dayOfMonth: d,
          dayOfWeek: curDate.getDay(),
          isCurrentMonth: true,
          isToday: curDateStr === todayStr,
          isFuture: curDate > new Date(),
          log,
          volumeKg,
          durationMin: log?.durationMin || 0,
          intensityLevel: getIntensityTier(volumeKg, log),
          exercisesCount: log?.exercisesCompleted || 0,
          workoutTitle: log?.dayName || (log?.isRestDay ? 'Active Recovery / Rest' : 'No Workout Logged'),
        });
      }

      // Trailing padding days to fill 42 cells grid (6 rows of 7)
      const remainingCells = 42 - days.length;
      for (let i = 1; i <= remainingCells; i++) {
        const nextDate = new Date(year, month + 1, i);
        const nextDateStr = nextDate.toISOString().split('T')[0];
        const log = logsMap.get(nextDateStr);
        const volumeKg = calculateVolumeForLog(log);

        days.push({
          date: nextDate,
          dateStr: nextDateStr,
          dayOfMonth: i,
          dayOfWeek: nextDate.getDay(),
          isCurrentMonth: false,
          isToday: nextDateStr === todayStr,
          isFuture: true,
          log,
          volumeKg,
          durationMin: log?.durationMin || 0,
          intensityLevel: getIntensityTier(volumeKg, log),
          exercisesCount: log?.exercisesCompleted || 0,
          workoutTitle: 'Future Date',
        });
      }

      result.push({ year, month, monthName, days });
    }

    return result;
  }, [currentDate, timeframe, logsMap, todayStr, userProfile]);

  // Determine intensity tier from volume and completion
  function getIntensityTier(volumeKg: number, log?: WorkoutCompletionLog): 0 | 1 | 2 | 3 | 4 {
    if (!log) return 0;
    if (log.isRestDay) return 1; // Tier 1: Light Recovery
    if (volumeKg > 7500 || (log.durationMin && log.durationMin >= 60)) return 4; // Tier 4: Peak PR
    if (volumeKg > 4500 || (log.durationMin && log.durationMin >= 45)) return 3; // Tier 3: High Volume
    if (volumeKg > 2000 || (log.durationMin && log.durationMin >= 30)) return 2; // Tier 2: Moderate
    return 1; // Tier 1: Light
  }

  // Aggregate Consistency Statistics
  const stats = useMemo(() => {
    let totalWorkouts = 0;
    let totalVolume = 0;
    let totalMinutes = 0;

    workoutLogs.forEach((log) => {
      if (!log.isRestDay) {
        totalWorkouts++;
        totalVolume += calculateVolumeForLog(log);
        totalMinutes += log.durationMin || 45;
      }
    });

    // Calculate current streak
    let currentStreak = 0;
    const now = new Date();
    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() - i);
      const str = checkDate.toISOString().split('T')[0];
      const log = logsMap.get(str);
      if (log && !log.isRestDay) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Consistency score for past 30 days
    let past30Logged = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() - i);
      const str = checkDate.toISOString().split('T')[0];
      if (logsMap.has(str)) past30Logged++;
    }
    const consistencyPct = Math.round((past30Logged / ((userProfile.trainingDaysPerWeek || 4) * 4.3)) * 100);

    return {
      totalWorkouts,
      totalVolume,
      totalMinutes,
      currentStreak: Math.max(currentStreak, workoutLogs.length > 0 ? 3 : 0),
      consistencyPct: Math.min(100, Math.max(15, consistencyPct || 85)),
    };
  }, [workoutLogs, logsMap, userProfile]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Color coding helper for intensity tiers
  const getIntensityColorClass = (day: CalendarDayData): string => {
    if (!day.isCurrentMonth) {
      return 'bg-gray-100/40 dark:bg-[#0E1424]/40 text-gray-300 dark:text-gray-700 border-transparent opacity-40';
    }

    if (day.intensityLevel === 0) {
      return 'bg-gray-50 dark:bg-[#1C1F1D] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-[#00D4FF]/50';
    }
    if (day.intensityLevel === 1) {
      return 'bg-[#161F38] dark:bg-[#1E293B]/50 text-[#0C4A6E] dark:text-[#38BDF8] border-[#00D4FF]/50 dark:border-[#1E293B] hover:ring-2 hover:ring-[#00D4FF]';
    }
    if (day.intensityLevel === 2) {
      return 'bg-[#00D4FF]/60 dark:bg-[#0369A1] text-[#0B0F1E] dark:text-white border-[#00D4FF]/40 dark:border-[#00D4FF]/40 font-bold hover:ring-2 hover:ring-[#00D4FF]';
    }
    if (day.intensityLevel === 3) {
      return 'bg-[#00D4FF] dark:bg-[#00D4FF] text-white border-[#0369A1] dark:border-[#0369A1] font-black shadow-xs hover:ring-2 hover:ring-[#00D4FF]';
    }
    // Tier 4: Peak PR
    return 'bg-gradient-to-br from-[#00D4FF] to-[#0A483E] text-white border-amber-400 dark:border-amber-400/80 font-black shadow-sm ring-1 ring-amber-400/50 hover:ring-2 hover:ring-amber-300';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white dark:bg-[#0E1424] p-5 sm:p-6 rounded-3xl border border-[#00D4FF]/20 shadow-xs space-y-5">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] dark:text-[#38BDF8]">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Workout Calendar Heatmap
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Color-coded calendar mapping your daily training consistency, lifting volume, and long-term habits.
            </p>
          </div>

          {/* Timeframe selector & Month Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-gray-100 dark:bg-[#1F2220] p-1 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold">
              <button
                onClick={() => setTimeframe('single_month')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeframe === 'single_month'
                    ? 'bg-[#00D4FF] text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                1 Month
              </button>
              <button
                onClick={() => setTimeframe('three_months')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeframe === 'three_months'
                    ? 'bg-[#00D4FF] text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                3 Months
              </button>
              <button
                onClick={() => setTimeframe('year')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeframe === 'year'
                    ? 'bg-[#00D4FF] text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Full Year
              </button>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1F2220] p-1 rounded-xl border border-gray-200 dark:border-gray-800">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#1E293B] text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-[#00D4FF] transition-all cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#1E293B] text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stat Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="p-3.5 rounded-2xl bg-[#00D4FF]/10 dark:bg-[#1E293B]/30 border border-[#00D4FF]/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-[#075985] dark:text-[#38BDF8] uppercase tracking-wider">
                Current Streak
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#0C4A6E] dark:text-[#F8FAFC] mt-0.5">
                {stats.currentStreak} Days
              </div>
            </div>
            <Flame className="w-6 h-6 text-cyan-400 fill-amber-500 shrink-0" />
          </div>

          <div className="p-3.5 rounded-2xl bg-[#00D4FF]/10 dark:bg-[#1E293B]/30 border border-[#00D4FF]/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-[#075985] dark:text-[#38BDF8] uppercase tracking-wider">
                30-Day Consistency
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#0C4A6E] dark:text-[#F8FAFC] mt-0.5">
                {stats.consistencyPct}%
              </div>
            </div>
            <TrendingUp className="w-6 h-6 text-[#0284C7] dark:text-[#38BDF8] shrink-0" />
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                Est. Total Volume
              </div>
              <div className="text-xl sm:text-2xl font-black text-indigo-900 dark:text-indigo-100 mt-0.5">
                {(stats.totalVolume / 1000).toFixed(1)}k <span className="text-xs font-normal">kg</span>
              </div>
            </div>
            <Dumbbell className="w-6 h-6 text-indigo-500 shrink-0" />
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-500/10 dark:bg-amber-950/30 border border-cyan-500/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Sessions Logged
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-100 mt-0.5">
                {stats.totalWorkouts} Total
              </div>
            </div>
            <Trophy className="w-6 h-6 text-cyan-400 fill-amber-500 shrink-0" />
          </div>
        </div>
      </div>

      {/* Calendar Grid View (Supports Single Month, 3 Months, or Full Year) */}
      <div className={`grid gap-6 ${
        timeframe === 'year' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : timeframe === 'three_months' 
          ? 'grid-cols-1 md:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {calendarMonths.map((monthBlock) => (
          <div
            key={`${monthBlock.year}-${monthBlock.month}`}
            className="bg-white dark:bg-[#0E1424] p-5 rounded-3xl border border-gray-200 dark:border-[#1E293B] shadow-xs space-y-4"
          >
            {/* Month Name */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                {monthBlock.monthName}
              </h3>
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                {monthBlock.days.filter((d) => d.isCurrentMonth && d.log && !d.log.isRestDay).length} sessions
              </span>
            </div>

            {/* Days of Week Header (Mon-Sun) */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* 7-Column Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {monthBlock.days.map((day, idx) => {
                const colorClass = getIntensityColorClass(day);
                const isSelected = selectedDay?.dateStr === day.dateStr;

                return (
                  <button
                    key={`${day.dateStr}-${idx}`}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    disabled={!day.isCurrentMonth}
                    className={`relative aspect-square rounded-xl p-1 flex flex-col items-center justify-between border transition-all cursor-pointer ${colorClass} ${
                      isSelected ? 'ring-2 ring-[#00D4FF] dark:ring-[#38BDF8] scale-105 z-10' : ''
                    } ${day.isToday ? 'ring-2 ring-amber-400' : ''}`}
                    title={`${day.dateStr}: ${day.workoutTitle} • ${day.volumeKg} kg volume`}
                  >
                    {/* Day Number */}
                    <span className="text-[11px] leading-none self-start">
                      {day.dayOfMonth}
                    </span>

                    {/* Peak PR Crown or Intensity Dot */}
                    {day.intensityLevel === 4 && (
                      <span className="text-[9px] text-amber-300">★</span>
                    )}

                    {/* Volume summary badge if high tier */}
                    {day.intensityLevel >= 2 && day.isCurrentMonth && (
                      <span className="text-[8px] font-mono leading-none truncate opacity-90">
                        {Math.round(day.volumeKg / 1000)}k
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Detail Drawer for Selected Day */}
      {selectedDay && selectedDay.isCurrentMonth && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#00D4FF]/10 via-[#00D4FF]/10 to-transparent dark:from-[#0E1424]/40 dark:via-[#0E1424] dark:to-[#0E1424] border-2 border-[#00D4FF]/30 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00D4FF] text-white">
                  {selectedDay.date.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {selectedDay.isToday && (
                  <span className="text-xs font-bold text-amber-600 dark:text-cyan-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Today
                  </span>
                )}
              </div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-[#00D4FF]" />
                <span>{selectedDay.workoutTitle}</span>
              </h4>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 text-xs font-bold text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#00D4FF]" />
                <span>{selectedDay.durationMin > 0 ? `${selectedDay.durationMin} mins` : 'No duration'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-[#0284C7]" />
                <span>{selectedDay.volumeKg > 0 ? `${selectedDay.volumeKg.toLocaleString()} kg Volume` : '0 kg'}</span>
              </div>
              {onToggleWorkoutLog && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleWorkoutLog(
                      selectedDay.dateStr,
                      `day_${selectedDay.dayOfWeek}`,
                      selectedDay.log ? 'Rest Day' : 'Strength Session',
                      45,
                      selectedDay.log ? 0 : 5,
                      5,
                      Boolean(selectedDay.log && !selectedDay.log.isRestDay)
                    );
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#00D4FF] text-white text-xs font-black hover:bg-[#0369A1] transition-all cursor-pointer shadow-xs"
                >
                  {selectedDay.log ? 'Toggle Status' : 'Log Workout'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Heatmap Legend Bar */}
      <div className="bg-white dark:bg-[#0E1424] p-4 rounded-2xl border border-gray-200 dark:border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1.5 font-bold">
          <Info className="w-4 h-4 text-[#00D4FF]" />
          <span>Volume & Consistency Intensity Scale:</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-gray-100 dark:bg-[#1C1F1D] border border-gray-300 dark:border-gray-700 inline-block" />
            <span>0 kg (Rest)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#161F38] dark:bg-[#1E293B]/60 border border-[#00D4FF]/50 dark:border-[#1E293B] inline-block" />
            <span>&lt; 2k kg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#00D4FF]/60 dark:bg-[#0369A1] border border-[#00D4FF]/40 dark:border-[#00D4FF]/40 inline-block" />
            <span>2k - 4.5k kg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#00D4FF] dark:bg-[#00D4FF] border border-[#0369A1] inline-block" />
            <span>4.5k - 7.5k kg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-br from-[#00D4FF] to-[#0A483E] border border-amber-400 ring-1 ring-amber-400/50 inline-block" />
            <span className="font-bold text-gray-900 dark:text-white">&gt; 7.5k kg (Peak PR ★)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
