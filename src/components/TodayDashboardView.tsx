import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Flame, 
  Dumbbell, 
  Utensils, 
  Check, 
  ChevronRight, 
  Droplets,
  Coffee,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile, WorkoutCompletionLog, WorkoutProgram, MealLog } from '../types';
import { fireCelebrationConfetti } from '../lib/confetti';

interface TodayDashboardViewProps {
  userProfile: UserProfile;
  currentStreak: number;
  caloriesConsumedToday: number;
  proteinConsumedToday: number;
  workoutLogs: WorkoutCompletionLog[];
  workoutPrograms: WorkoutProgram[];
  mealLogs: MealLog[];
  onNavigateToFood: () => void;
  onNavigateToWorkout: () => void;
  onOpenCheckIn?: () => void;
}

export const TodayDashboardView: React.FC<TodayDashboardViewProps> = ({
  userProfile,
  currentStreak = 0,
  caloriesConsumedToday = 0,
  proteinConsumedToday = 0,
  workoutLogs = [],
  workoutPrograms = [],
  mealLogs = [],
  onNavigateToFood,
  onNavigateToWorkout,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const targetCalories = userProfile?.dailyCalories || 2000;
  const targetProtein = userProfile?.dailyProtein || 150;

  const caloriePercent = Math.min(100, Math.round((caloriesConsumedToday / targetCalories) * 100));
  const proteinPercent = Math.min(100, Math.round((proteinConsumedToday / targetProtein) * 100));
  const remainingCalories = targetCalories - caloriesConsumedToday;

  // Real calculated streak: only show when >= 1
  const streak = typeof currentStreak === 'number' && !isNaN(currentStreak) ? Math.max(0, currentStreak) : 0;

  // First name extraction
  const firstName = userProfile?.name?.trim() ? userProfile.name.trim().split(' ')[0] : 'Athlete';

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }, []);

  // Filter today's meal logs
  const todayMeals = useMemo(() => {
    return mealLogs.filter((m) => m.date === todayStr);
  }, [mealLogs, todayStr]);

  // Map meals to Breakfast, Lunch, Dinner deterministically
  const breakfastMeal = useMemo(() => {
    return (
      todayMeals.find((m) => m.mealType?.toLowerCase() === 'breakfast' || m.mealTitle?.toLowerCase().includes('breakfast')) ||
      todayMeals.find((m) => {
        if (m.mealType && m.mealType !== 'Snack') return false;
        const hour = m.time ? parseInt(m.time.split(':')[0], 10) : 8;
        return hour < 11;
      })
    );
  }, [todayMeals]);

  const lunchMeal = useMemo(() => {
    return (
      todayMeals.find((m) => m.mealType?.toLowerCase() === 'lunch' || m.mealTitle?.toLowerCase().includes('lunch')) ||
      todayMeals.find((m) => {
        if (m.id === breakfastMeal?.id) return false;
        if (m.mealType && m.mealType !== 'Snack') return false;
        const hour = m.time ? parseInt(m.time.split(':')[0], 10) : 13;
        return hour >= 11 && hour < 16;
      })
    );
  }, [todayMeals, breakfastMeal]);

  const dinnerMeal = useMemo(() => {
    return (
      todayMeals.find((m) => m.mealType?.toLowerCase() === 'dinner' || m.mealTitle?.toLowerCase().includes('dinner')) ||
      todayMeals.find((m) => {
        if (m.id === breakfastMeal?.id || m.id === lunchMeal?.id) return false;
        if (m.mealType && m.mealType !== 'Snack') return false;
        const hour = m.time ? parseInt(m.time.split(':')[0], 10) : 19;
        return hour >= 16;
      })
    );
  }, [todayMeals, breakfastMeal, lunchMeal]);

  // Today's workout log
  const completedWorkoutToday = useMemo(() => {
    return workoutLogs.find((l) => l.date === todayStr);
  }, [workoutLogs, todayStr]);

  // Scheduled workout program day
  const activeProgram = workoutPrograms[0];
  const scheduledDay = activeProgram?.days?.[0];

  // Time-aware accent line text
  const accentJobText = useMemo(() => {
    const isBrandNew = caloriesConsumedToday === 0 && todayMeals.length === 0 && !completedWorkoutToday;
    if (isBrandNew) {
      return 'Your plan is ready.';
    }

    const hour = new Date().getHours();
    const bDone = Boolean(breakfastMeal);
    const lDone = Boolean(lunchMeal);
    const dDone = Boolean(dinnerMeal);
    const wDone = Boolean(completedWorkoutToday);

    if (hour < 12) {
      if (!bDone) return 'Log breakfast to start today.';
      if (!lDone) return 'Lunch still open. One plate.';
      if (!wDone) return 'Fuel logged. Ready for training?';
      return 'Morning routine on point.';
    } else if (hour < 17) {
      if (!lDone) return 'Lunch still open. One plate.';
      if (!wDone) return 'Lunch checked. Next: workout.';
      if (!dDone) return 'Dinner closes the day.';
      return 'Afternoon targets looking great.';
    } else {
      if (!dDone && !wDone) return 'Dinner + workout. Close the day.';
      if (!dDone) return 'Almost done. Log dinner to close today.';
      if (!wDone) return 'Dinner locked. Workout to wrap up.';
      return 'All 4 jobs complete. Solid work today.';
    }
  }, [caloriesConsumedToday, todayMeals.length, completedWorkoutToday, breakfastMeal, lunchMeal, dinnerMeal]);

  // Water tracking (slim card: 250ml taps, default 3L / 12 glasses)
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`aroh_water_glasses_${todayStr}`) || 
                    localStorage.getItem(`aroh_water_${todayStr}`);
      return saved ? Math.min(12, Math.max(0, parseInt(saved, 10))) : 0;
    } catch {
      return 0;
    }
  });

  const addWater = () => {
    if (waterGlasses < 12) {
      const next = waterGlasses + 1;
      setWaterGlasses(next);
      try {
        localStorage.setItem(`aroh_water_glasses_${todayStr}`, next.toString());
      } catch {}
    }
  };

  const decrementWater = () => {
    if (waterGlasses > 0) {
      const next = waterGlasses - 1;
      setWaterGlasses(next);
      try {
        localStorage.setItem(`aroh_water_glasses_${todayStr}`, next.toString());
      } catch {}
    }
  };

  // Confetti trigger ONLY on milestone completion (never on initial login)
  const prevMealsCountRef = useRef(todayMeals.length);
  const prevWorkoutRef = useRef(Boolean(completedWorkoutToday));
  const prevStreakRef = useRef(streak);

  useEffect(() => {
    // If first meal of the day just saved
    if (prevMealsCountRef.current === 0 && todayMeals.length > 0) {
      fireCelebrationConfetti();
    }
    // If workout just completed
    if (!prevWorkoutRef.current && completedWorkoutToday) {
      fireCelebrationConfetti();
    }
    // If streak increased
    if (streak > prevStreakRef.current && streak > 1) {
      fireCelebrationConfetti();
    }
    prevMealsCountRef.current = todayMeals.length;
    prevWorkoutRef.current = Boolean(completedWorkoutToday);
    prevStreakRef.current = streak;
  }, [todayMeals.length, completedWorkoutToday, streak]);

  // SVG Ring Calculations (One unified dual ring: Calories outer, Protein inner)
  // Outer radius 78 (C ≈ 490.09), Inner radius 62 (C ≈ 389.56)
  const outerRadius = 78;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerOffset = outerCircumference - (caloriePercent / 100) * outerCircumference;

  const innerRadius = 62;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerOffset = innerCircumference - (proteinPercent / 100) * innerCircumference;

  return (
    <div className="w-full max-w-[1120px] mx-auto p-4 sm:p-5">
      {/* HABIT HOME GRID: Desktop 1.2fr 0.8fr, gap 20px. Mobile single column */}
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-5 items-start">
        
        {/* ============================================================== */}
        {/* HERO RIGHT ON MOBILE (ORDER-1) / RIGHT COLUMN ON DESKTOP       */}
        {/* Concentric Progress Ring + Action Buttons                      */}
        {/* ============================================================== */}
        <div className="order-1 md:order-2 space-y-4">
          {/* Card: The Hero Progress Ring */}
          <div className="rounded-[24px] p-6 bg-[#0B1220] border border-[#1E3A5F] shadow-xl shadow-black/40 flex flex-col items-center justify-center text-center">
            {/* Dual SVG Progress Ring */}
            <div className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0 my-2">
              <svg 
                className="w-full h-full -rotate-90 transform" 
                viewBox="0 0 200 200"
                aria-label="Macronutrient Progress Ring"
              >
                {/* Outer Ring Background (Calories) */}
                <circle
                  cx="100"
                  cy="100"
                  r={outerRadius}
                  fill="none"
                  stroke="#1E3A5F"
                  strokeWidth="8"
                />
                {/* Outer Ring Progress (Calories) */}
                <circle
                  cx="100"
                  cy="100"
                  r={outerRadius}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="8"
                  strokeDasharray={outerCircumference}
                  strokeDashoffset={outerOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                />

                {/* Inner Ring Background (Protein) */}
                <circle
                  cx="100"
                  cy="100"
                  r={innerRadius}
                  fill="none"
                  stroke="#1E3A5F"
                  strokeWidth="8"
                />
                {/* Inner Ring Progress (Protein) */}
                <circle
                  cx="100"
                  cy="100"
                  r={innerRadius}
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="8"
                  strokeDasharray={innerCircumference}
                  strokeDashoffset={innerOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </svg>

              {/* Ring Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 pointer-events-none select-none">
                {caloriesConsumedToday === 0 ? (
                  <div className="space-y-0.5">
                    <span className="block text-base sm:text-lg font-bold text-[#E8F1FF] leading-tight">
                      Log breakfast
                    </span>
                    <span className="block text-[11px] text-[#8BA3C7]">
                      Start today
                    </span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <span className="block text-3xl sm:text-4xl font-black text-[#E8F1FF] tracking-tight leading-none">
                      {remainingCalories > 0 ? remainingCalories : 0}
                    </span>
                    <span className="block text-[10px] font-bold text-[#8BA3C7] uppercase tracking-wider">
                      {remainingCalories >= 0 ? 'kcal remaining' : 'kcal over target'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Compact Macro Legend under Ring */}
            <div className="grid grid-cols-2 gap-3 w-full pt-3 mt-1 border-t border-[#1E3A5F]/60">
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#070C16]/50 border border-[#1E3A5F]/40">
                <div className="flex items-center gap-1.5 text-xs text-[#8BA3C7] mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  <span>Energy</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#E8F1FF]">
                  {caloriesConsumedToday} / {targetCalories} kcal
                </span>
              </div>

              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#070C16]/50 border border-[#1E3A5F]/40">
                <div className="flex items-center gap-1.5 text-xs text-[#8BA3C7] mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                  <span>Protein</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#E8F1FF]">
                  {proteinConsumedToday} / {targetProtein}g
                </span>
              </div>
            </div>
          </div>

          {/* PRIMARY ACTIONS: Two buttons, 48px height, radius 16px. Equal width on desktop, stacked on mobile */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
            {/* Primary Action: Log Meal (Filled #3B82F6, goes to Food) */}
            <button
              type="button"
              onClick={onNavigateToFood}
              className="h-12 min-h-[48px] px-5 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#3B82F6]/25 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Utensils className="w-4 h-4 shrink-0" />
              <span>Log meal</span>
            </button>

            {/* Secondary Action: Start Workout (Outline, goes to Workout) */}
            <button
              type="button"
              onClick={onNavigateToWorkout}
              className="h-12 min-h-[48px] px-5 rounded-2xl border border-[#3B82F6] bg-transparent hover:bg-[#3B82F6]/10 text-[#E8F1FF] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Dumbbell className="w-4 h-4 text-[#60A5FA] shrink-0" />
              <span className="truncate">
                {completedWorkoutToday 
                  ? 'Workout complete' 
                  : scheduledDay?.dayName 
                  ? `Start: ${scheduledDay.dayName}` 
                  : 'Start workout'}
              </span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* HERO LEFT ON DESKTOP / ORDER-2 ON MOBILE                       */}
        {/* Greeting + 4 Today's Jobs + Slim Water Card                    */}
        {/* ============================================================== */}
        <div className="order-2 md:order-1 space-y-4">
          <div className="rounded-[24px] p-6 bg-[#0B1220] border border-[#1E3A5F] shadow-xl shadow-black/40 space-y-5">
            {/* Top Row: Quiet Date & Real Streak (Only if streak >= 1) */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#8BA3C7] font-medium tracking-wide">
                {formattedDate}
              </span>

              {streak >= 1 && (
                <div 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1E3A5F]/40 border border-[#3B82F6]/30 text-[#60A5FA] text-xs font-semibold"
                  title="Verified training streak"
                >
                  <Flame className="w-3.5 h-3.5 fill-[#3B82F6] text-[#3B82F6]" />
                  <span>{streak} day streak</span>
                </div>
              )}
            </div>

            {/* Greeting (max 28px) & One-line Time-Aware Job (15px accent) */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#E8F1FF] leading-tight font-heading">
                {getGreeting()}, <span className="text-[#60A5FA]">{firstName}</span>
              </h1>
              <p className="text-[15px] font-medium text-[#60A5FA] leading-normal">
                {accentJobText}
              </p>
            </div>

            {/* TODAY'S JOBS: 4 Rows (Breakfast | Lunch | Dinner | Workout) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8BA3C7] uppercase tracking-wider">
                  Today's Habits
                </span>
                <span className="text-xs text-[#8BA3C7]">
                  {[Boolean(breakfastMeal), Boolean(lunchMeal), Boolean(dinnerMeal), Boolean(completedWorkoutToday)].filter(Boolean).length} / 4 Done
                </span>
              </div>

              {/* Row 1: Breakfast */}
              <div
                onClick={onNavigateToFood}
                role="button"
                tabIndex={0}
                className={`min-h-[44px] px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-sm transition-all duration-150 cursor-pointer select-none group active:scale-[0.99] ${
                  breakfastMeal
                    ? 'bg-[#132238] border border-[#1E3A5F] text-[#E8F1FF]'
                    : 'border border-dashed border-[#3B82F6]/40 hover:border-[#3B82F6] bg-[#070C16]/30 hover:bg-[#1E3A5F]/20 text-[#8BA3C7]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    breakfastMeal ? 'bg-[#34D399]/15 text-[#34D399]' : 'bg-[#1E3A5F]/40 text-[#60A5FA]'
                  }`}>
                    {breakfastMeal ? <Check className="w-4 h-4 stroke-[3]" /> : <Coffee className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <span className="font-bold block text-xs sm:text-sm text-[#E8F1FF] truncate">
                      Breakfast
                    </span>
                    {breakfastMeal && (
                      <span className="text-[11px] text-[#8BA3C7] block truncate">
                        {breakfastMeal.mealTitle || 'Breakfast meal'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {breakfastMeal ? (
                    <span className="text-xs font-bold text-[#34D399]">
                      {breakfastMeal.calories} kcal
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-bold text-[#60A5FA] group-hover:translate-x-0.5 transition-transform">
                      <span>Log it</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Lunch */}
              <div
                onClick={onNavigateToFood}
                role="button"
                tabIndex={0}
                className={`min-h-[44px] px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-sm transition-all duration-150 cursor-pointer select-none group active:scale-[0.99] ${
                  lunchMeal
                    ? 'bg-[#132238] border border-[#1E3A5F] text-[#E8F1FF]'
                    : 'border border-dashed border-[#3B82F6]/40 hover:border-[#3B82F6] bg-[#070C16]/30 hover:bg-[#1E3A5F]/20 text-[#8BA3C7]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    lunchMeal ? 'bg-[#34D399]/15 text-[#34D399]' : 'bg-[#1E3A5F]/40 text-[#60A5FA]'
                  }`}>
                    {lunchMeal ? <Check className="w-4 h-4 stroke-[3]" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <span className="font-bold block text-xs sm:text-sm text-[#E8F1FF] truncate">
                      Lunch
                    </span>
                    {lunchMeal && (
                      <span className="text-[11px] text-[#8BA3C7] block truncate">
                        {lunchMeal.mealTitle || 'Lunch meal'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {lunchMeal ? (
                    <span className="text-xs font-bold text-[#34D399]">
                      {lunchMeal.calories} kcal
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-bold text-[#60A5FA] group-hover:translate-x-0.5 transition-transform">
                      <span>Log it</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Dinner */}
              <div
                onClick={onNavigateToFood}
                role="button"
                tabIndex={0}
                className={`min-h-[44px] px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-sm transition-all duration-150 cursor-pointer select-none group active:scale-[0.99] ${
                  dinnerMeal
                    ? 'bg-[#132238] border border-[#1E3A5F] text-[#E8F1FF]'
                    : 'border border-dashed border-[#3B82F6]/40 hover:border-[#3B82F6] bg-[#070C16]/30 hover:bg-[#1E3A5F]/20 text-[#8BA3C7]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    dinnerMeal ? 'bg-[#34D399]/15 text-[#34D399]' : 'bg-[#1E3A5F]/40 text-[#60A5FA]'
                  }`}>
                    {dinnerMeal ? <Check className="w-4 h-4 stroke-[3]" /> : <Moon className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <span className="font-bold block text-xs sm:text-sm text-[#E8F1FF] truncate">
                      Dinner
                    </span>
                    {dinnerMeal && (
                      <span className="text-[11px] text-[#8BA3C7] block truncate">
                        {dinnerMeal.mealTitle || 'Dinner meal'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {dinnerMeal ? (
                    <span className="text-xs font-bold text-[#34D399]">
                      {dinnerMeal.calories} kcal
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-bold text-[#60A5FA] group-hover:translate-x-0.5 transition-transform">
                      <span>Log it</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Workout */}
              <div
                onClick={onNavigateToWorkout}
                role="button"
                tabIndex={0}
                className={`min-h-[44px] px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-sm transition-all duration-150 cursor-pointer select-none group active:scale-[0.99] ${
                  completedWorkoutToday
                    ? 'bg-[#132238] border border-[#1E3A5F] text-[#E8F1FF]'
                    : 'border border-dashed border-[#3B82F6]/40 hover:border-[#3B82F6] bg-[#070C16]/30 hover:bg-[#1E3A5F]/20 text-[#8BA3C7]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    completedWorkoutToday ? 'bg-[#34D399]/15 text-[#34D399]' : 'bg-[#1E3A5F]/40 text-[#60A5FA]'
                  }`}>
                    {completedWorkoutToday ? <Check className="w-4 h-4 stroke-[3]" /> : <Dumbbell className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <span className="font-bold block text-xs sm:text-sm text-[#E8F1FF] truncate">
                      Workout
                    </span>
                    <span className="text-[11px] text-[#8BA3C7] block truncate">
                      {completedWorkoutToday 
                        ? completedWorkoutToday.dayName || 'Session complete' 
                        : scheduledDay?.dayName || 'Scheduled training routine'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {completedWorkoutToday ? (
                    <span className="text-xs font-bold text-[#34D399]">
                      Workout complete
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-bold text-[#60A5FA] group-hover:translate-x-0.5 transition-transform">
                      <span>Log it</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5) WATER: Slim Card under Jobs */}
            <div className="rounded-2xl p-3.5 bg-[#070C16]/60 border border-[#1E3A5F] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#1E3A5F]/50 flex items-center justify-center text-[#38BDF8] shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[#E8F1FF] truncate">Hydration</div>
                  <div className="text-[11px] text-[#8BA3C7]">
                    {waterGlasses * 250} / 3,000 ml ({waterGlasses}/12)
                  </div>
                </div>
              </div>

              {/* Action Buttons: Minus and +250ml */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={decrementWater}
                  disabled={waterGlasses <= 0}
                  className="w-8 h-8 rounded-lg border border-[#1E3A5F] text-[#8BA3C7] hover:text-[#E8F1FF] hover:bg-[#1E3A5F]/40 disabled:opacity-30 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  title="Remove 250ml"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={addWater}
                  disabled={waterGlasses >= 12}
                  className="h-8 px-3 rounded-lg border border-[#3B82F6]/50 bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 text-[#60A5FA] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Add 250ml water"
                >
                  <span>+250ml</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
