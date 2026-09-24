import React from 'react';
import { 
  Flame, 
  Dumbbell, 
  Utensils, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Calendar
} from 'lucide-react';
import { UserProfile, WorkoutCompletionLog, WorkoutProgram, MealLog } from '../types';
import { getFoodHindiName } from '../lib/hindiFoodNames';

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
  currentStreak,
  caloriesConsumedToday,
  proteinConsumedToday,
  workoutLogs,
  workoutPrograms,
  mealLogs,
  onNavigateToFood,
  onNavigateToWorkout,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const targetCalories = userProfile.dailyCalories || 2000;
  const targetProtein = userProfile.dailyProtein || 150;
  const caloriePercent = Math.min(100, Math.round((caloriesConsumedToday / targetCalories) * 100));
  const proteinPercent = Math.min(100, Math.round((proteinConsumedToday / targetProtein) * 100));

  // Today's meals calculation
  const todayMeals = mealLogs.filter((m) => m.date === todayStr);
  const carbsConsumedToday = Math.round(todayMeals.reduce((acc, m) => acc + (m.carbsG || 0), 0));
  const fatConsumedToday = Math.round(todayMeals.reduce((acc, m) => acc + (m.fatG || 0), 0));

  // Today's workout completion
  const completedWorkoutToday = workoutLogs.find((l) => l.date === todayStr);

  // Active workout program & scheduled routine
  const activeProgram = workoutPrograms[0];
  const scheduledDay = activeProgram?.days?.[0];

  // REAL calculated streak (default 0, never hardcoded)
  const streak = typeof currentStreak === 'number' && !isNaN(currentStreak) ? Math.max(0, currentStreak) : 0;

  // First name extraction
  const firstName = userProfile?.name?.trim() ? userProfile.name.trim().split(' ')[0] : 'Athlete';

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  // Empty state check for brand-new users
  const isBrandNewUser = caloriesConsumedToday === 0 && todayMeals.length === 0 && !completedWorkoutToday;

  // SVG ring calculations for concentric progress rings
  // Outer ring (Calories): R = 76, C ≈ 477.52
  // Inner ring (Protein):  R = 56, C ≈ 351.86
  const outerRadius = 76;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerOffset = outerCircumference - (caloriePercent / 100) * outerCircumference;

  const innerRadius = 56;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerOffset = innerCircumference - (proteinPercent / 100) * innerCircumference;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* 1. CINEMATIC TOP CARD */}
      <div className="relative overflow-hidden rounded-[24px] p-6 sm:p-8 lg:p-10 bg-white dark:bg-[#0B1220] border border-[#C9D7F2] dark:border-[#1E3A5F] shadow-xl shadow-blue-950/5 dark:shadow-black/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        {/* Soft Blue Vortex / Ring Motif (CSS pure) */}
        <div className="absolute -right-16 -top-16 sm:right-4 sm:-top-8 w-72 h-72 sm:w-96 sm:h-96 pointer-events-none select-none opacity-80 dark:opacity-60">
          <div className="absolute inset-0 rounded-full bg-radial from-[#3B82F6]/25 via-[#38BDF8]/10 to-transparent blur-2xl" />
          <div className="absolute inset-4 rounded-full border border-[#3B82F6]/20 animate-pulse" style={{ animationDuration: '7s' }} />
          <div className="absolute inset-12 rounded-full border border-[#38BDF8]/20" />
          <div className="absolute inset-24 rounded-full border border-dashed border-[#60A5FA]/25" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 lg:gap-8">
          {/* Top Bar: Streak Badge & Date */}
          <div className="flex items-center justify-between gap-3">
            {/* Real Calculated Streak Badge */}
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F0FE] dark:bg-[#121A2B] border border-[#C9D7F2] dark:border-[#1E3A5F] text-[#2563EB] dark:text-[#60A5FA] text-xs font-semibold shadow-xs"
              title="Current verified workout consistency streak"
            >
              <Flame className="w-4 h-4 fill-[#2563EB] dark:fill-[#38BDF8] text-[#2563EB] dark:text-[#38BDF8]" />
              <span>{streak} {streak === 1 ? 'day streak' : 'day streak'}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-[#8BA3C7]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Center Content: Greeting & Ring Progress Graphic */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Greeting & Summary */}
            <div className="lg:col-span-7 space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0B1220] dark:text-[#E8F1FF] font-heading leading-tight">
                {getGreeting()}, <span className="text-[#2563EB] dark:text-[#60A5FA]">{firstName}</span>
              </h1>

              {isBrandNewUser ? (
                <p className="text-base sm:text-lg font-medium text-[#2563EB] dark:text-[#60A5FA]">
                  Your plan is ready. Log breakfast.
                </p>
              ) : (
                <p className="text-sm sm:text-base text-slate-600 dark:text-[#8BA3C7] leading-relaxed">
                  {userProfile.goal === 'lose_fat'
                    ? 'Targeting a calibrated deficit with strict lean mass retention.'
                    : userProfile.goal === 'build_muscle'
                    ? 'Calibrated energy surplus with progressive resistance targets.'
                    : 'Balanced recomposition with active nutrient density targets.'}
                </p>
              )}

              {/* Mini Macro Status Badges when active */}
              {!isBrandNewUser && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="px-3 py-1.5 rounded-xl bg-[#E8F0FE] dark:bg-[#121A2B] border border-[#C9D7F2] dark:border-[#1E3A5F] text-xs">
                    <span className="text-slate-500 dark:text-[#8BA3C7]">Energy: </span>
                    <span className="font-bold text-[#0B1220] dark:text-[#E8F1FF]">
                      {caloriesConsumedToday} / {targetCalories} kcal
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-[#E8F0FE] dark:bg-[#121A2B] border border-[#C9D7F2] dark:border-[#1E3A5F] text-xs">
                    <span className="text-slate-500 dark:text-[#8BA3C7]">Protein: </span>
                    <span className="font-bold text-[#2563EB] dark:text-[#60A5FA]">
                      {proteinConsumedToday}g / {targetProtein}g
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Concentric SVG Progress Rings */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4">
              <div className="relative w-44 h-44 shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#38BDF8" />
                    </linearGradient>
                    <linearGradient id="proteinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                  </defs>

                  {/* Outer Ring Background (Calories) */}
                  <circle
                    cx="100"
                    cy="100"
                    r={outerRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-200 dark:text-[#121A2B]"
                  />
                  {/* Outer Ring Progress (Calories) */}
                  <circle
                    cx="100"
                    cy="100"
                    r={outerRadius}
                    fill="none"
                    stroke="url(#calorieGradient)"
                    strokeWidth="10"
                    strokeDasharray={outerCircumference}
                    strokeDashoffset={outerOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />

                  {/* Inner Ring Background (Protein) */}
                  <circle
                    cx="100"
                    cy="100"
                    r={innerRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-200 dark:text-[#121A2B]"
                  />
                  {/* Inner Ring Progress (Protein) */}
                  <circle
                    cx="100"
                    cy="100"
                    r={innerRadius}
                    fill="none"
                    stroke="url(#proteinGradient)"
                    strokeWidth="10"
                    strokeDasharray={innerCircumference}
                    strokeDashoffset={innerOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Ring Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-[#0B1220] dark:text-[#E8F1FF] tracking-tight">
                    {caloriePercent}%
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-[#8BA3C7] uppercase tracking-wider">
                    Daily Goal
                  </span>
                </div>
              </div>

              {/* Ring Legend */}
              <div className="flex sm:flex-col gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                  <span className="text-slate-600 dark:text-[#8BA3C7]">Calories ({caloriePercent}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
                  <span className="text-slate-600 dark:text-[#8BA3C7]">Protein ({proteinPercent}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* TWO BIG CTAs (44px+ tap targets, inner highlight) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {/* Primary CTA: Log Meal */}
            <button
              onClick={onNavigateToFood}
              className="min-h-[48px] sm:min-h-[52px] px-6 py-3.5 rounded-[20px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#3B82F6]/25 border border-[#60A5FA]/30 cursor-pointer active:scale-[0.98]"
            >
              <Utensils className="w-5 h-5" />
              <span>Log meal</span>
            </button>

            {/* Secondary CTA: Start Workout */}
            <button
              onClick={onNavigateToWorkout}
              className="min-h-[48px] sm:min-h-[52px] px-6 py-3.5 rounded-[20px] bg-[#E8F0FE] dark:bg-[#121A2B] hover:bg-[#D9E6FE] dark:hover:bg-[#1A253D] text-[#0B1220] dark:text-[#E8F1FF] font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all border border-[#C9D7F2] dark:border-[#1E3A5F] hover:border-[#3B82F6] shadow-md shadow-black/5 dark:shadow-black/20 cursor-pointer active:scale-[0.98]"
            >
              <Dumbbell className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
              <span>{completedWorkoutToday ? 'Review workout' : 'Start workout'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. COMPANION SECTIONS (Only visible when user has active meal or workout data) */}
      {!isBrandNewUser && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Today's Logged Meals */}
          <div className="rounded-[24px] p-6 bg-white dark:bg-[#0B1220] border border-[#C9D7F2] dark:border-[#1E3A5F] shadow-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E8F0FE] dark:bg-[#121A2B] border border-[#C9D7F2] dark:border-[#1E3A5F] flex items-center justify-center text-[#2563EB] dark:text-[#60A5FA]">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0B1220] dark:text-[#E8F1FF]">
                      Today's Meals ({todayMeals.length})
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#8BA3C7]">
                      {caloriesConsumedToday} kcal • {proteinConsumedToday}g protein
                    </p>
                  </div>
                </div>

                <button
                  onClick={onNavigateToFood}
                  className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer min-h-[44px]"
                >
                  <span>Food Tab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {todayMeals.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#E8F0FE]/50 dark:bg-[#121A2B]/50 border border-dashed border-[#C9D7F2] dark:border-[#1E3A5F] text-center text-xs text-slate-500 dark:text-[#8BA3C7]">
                  No meals logged today yet. Use the scanner or food search to track your nutrition.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {todayMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-3 rounded-xl bg-[#E8F0FE]/60 dark:bg-[#121A2B] border border-[#C9D7F2] dark:border-[#1E3A5F] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="truncate">
                        <div className="font-semibold text-[#0B1220] dark:text-[#E8F1FF] truncate flex items-center gap-1.5">
                          <span>{meal.mealTitle || 'Logged Meal'}</span>
                          {userProfile?.foodLabelLanguage === 'english_hindi' && (() => {
                            const hindi = getFoodHindiName(meal.mealTitle);
                            if (!hindi) return null;
                            return (
                              <span className="text-[10px] font-normal text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                                {hindi}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-[#8BA3C7]">
                          {meal.proteinG}g P • {meal.carbsG || 0}g C • {meal.fatG || 0}g F
                        </div>
                      </div>
                      <div className="font-bold text-[#2563EB] dark:text-[#60A5FA] shrink-0">
                        {meal.calories} kcal
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onNavigateToFood}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#E8F0FE] dark:bg-[#121A2B] hover:bg-[#D9E6FE] dark:hover:bg-[#1A253D] border border-[#C9D7F2] dark:border-[#1E3A5F] text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Add another meal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card: Today's Training */}
          <div className="rounded-[24px] p-6 bg-white dark:bg-[#0B1220] border border-[#C9D7F2] dark:border-[#1E3A5F] shadow-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E8F0FE] dark:bg-[#121A2B] border border-[#C9D7F2] dark:border-[#1E3A5F] flex items-center justify-center text-[#2563EB] dark:text-[#60A5FA]">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0B1220] dark:text-[#E8F1FF]">
                      Training Schedule
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#8BA3C7]">
                      {completedWorkoutToday ? 'Session completed today' : 'Scheduled session'}
                    </p>
                  </div>
                </div>

                {completedWorkoutToday ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#34D399]/15 border border-[#34D399]/30 text-[#059669] dark:text-[#34D399] text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-[#E8F0FE] dark:bg-[#121A2B] border border-[#C9D7F2] dark:border-[#1E3A5F] text-[#2563EB] dark:text-[#60A5FA] text-xs font-bold">
                    Ready
                  </span>
                )}
              </div>

              {completedWorkoutToday ? (
                <div className="p-4 rounded-xl bg-[#E8F0FE]/60 dark:bg-[#121A2B] border border-[#C9D7F2] dark:border-[#1E3A5F] space-y-1 text-xs">
                  <div className="font-bold text-[#0B1220] dark:text-[#E8F1FF]">
                    {completedWorkoutToday.dayName || 'Workout Routine'}
                  </div>
                  <div className="text-slate-500 dark:text-[#8BA3C7]">
                    Total Volume: {(completedWorkoutToday.totalVolumeKg || 0).toLocaleString()} kg • Duration: {completedWorkoutToday.durationMin || 45} min
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#E8F0FE]/60 dark:bg-[#121A2B] border border-[#C9D7F2] dark:border-[#1E3A5F] space-y-1 text-xs">
                  <div className="font-bold text-[#0B1220] dark:text-[#E8F1FF]">
                    {scheduledDay?.dayName || 'Push Hypertrophy & Stability'}
                  </div>
                  <div className="text-slate-500 dark:text-[#8BA3C7]">
                    {scheduledDay?.exercises?.length || 5} exercises • ~45–60 min target
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onNavigateToWorkout}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#E8F0FE] dark:bg-[#121A2B] hover:bg-[#D9E6FE] dark:hover:bg-[#1A253D] border border-[#C9D7F2] dark:border-[#1E3A5F] text-xs font-bold text-[#0B1220] dark:text-[#E8F1FF] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{completedWorkoutToday ? 'Review Workout Log' : 'Start Scheduled Workout'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
