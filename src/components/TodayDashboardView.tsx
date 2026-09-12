import React from 'react';
import { 
  Flame, 
  Dumbbell, 
  Utensils, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Calendar, 
  Sparkles,
  Zap,
  Plus
} from 'lucide-react';
import { UserProfile, WorkoutCompletionLog, WorkoutProgram, MealLog } from '../types';

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
  onOpenCheckIn,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const targetCalories = userProfile.dailyCalories || 2000;
  const targetProtein = userProfile.dailyProtein || 150;
  const caloriePercent = Math.min(100, Math.round((caloriesConsumedToday / targetCalories) * 100));
  const proteinPercent = Math.min(100, Math.round((proteinConsumedToday / targetProtein) * 100));

  // Compute today's carbs and fat
  const todayMeals = mealLogs.filter((m) => m.date === todayStr);
  const carbsConsumedToday = Math.round(todayMeals.reduce((acc, m) => acc + (m.carbsG || 0), 0));
  const fatConsumedToday = Math.round(todayMeals.reduce((acc, m) => acc + (m.fatG || 0), 0));

  // Check if today's workout has been completed
  const completedWorkoutToday = workoutLogs.find((l) => l.date === todayStr);

  // Derive next or active workout routine
  const activeProgram = workoutPrograms[0];
  const scheduledDay = activeProgram?.days?.[0];

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome & Streak Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {getGreeting()}, {userProfile.name || 'Athlete'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {userProfile.goal === 'lose_fat'
              ? 'Target: Caloric deficit with high protein retention'
              : userProfile.goal === 'build_muscle'
              ? 'Target: Progressive overload with caloric surplus'
              : 'Target: Body recomposition with balanced macro distribution'}
          </p>
        </div>

        {/* Real Streak Indicator */}
        <div className="flex items-center gap-3 p-3.5 px-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Flame className="w-5 h-5 fill-orange-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-orange-950 dark:text-orange-200 uppercase tracking-wider">
              Workout Streak
            </div>
            <div className="text-xl font-black text-orange-700 dark:text-orange-400">
              {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Focus Grid: Nutrition & Workout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Today's Calories & Macros with ONE Primary CTA "Log Meal" */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-[#0F6E5F] dark:text-[#2DD4BF] flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Today's Nutrition
                  </h2>
                  <p className="text-xs text-gray-500">Target energy & macro balance</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300">
                {caloriePercent}% Goal
              </span>
            </div>

            {/* Calorie Progress */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">
                    {caloriesConsumedToday.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-gray-500">
                    / {targetCalories.toLocaleString()} kcal
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-500">
                  {Math.max(0, targetCalories - caloriesConsumedToday)} kcal left
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
            </div>

            {/* Macro Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                <div className="text-[11px] font-bold text-gray-500">Protein</div>
                <div className="text-base font-black text-gray-900 dark:text-white">
                  {proteinConsumedToday}g
                </div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                  / {targetProtein}g
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                <div className="text-[11px] font-bold text-gray-500">Carbs</div>
                <div className="text-base font-black text-gray-900 dark:text-white">
                  {carbsConsumedToday}g
                </div>
                <div className="text-[10px] text-gray-400">
                  Logged
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                <div className="text-[11px] font-bold text-gray-500">Fat</div>
                <div className="text-base font-black text-gray-900 dark:text-white">
                  {fatConsumedToday}g
                </div>
                <div className="text-[10px] text-gray-400">
                  Logged
                </div>
              </div>
            </div>
          </div>

          {/* SINGLE PRIMARY CTA: "Log Meal" */}
          <button
            onClick={onNavigateToFood}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#0F6E5F] hover:bg-[#0c594c] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-900/10 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Log Meal</span>
          </button>
        </div>

        {/* Card 2: Today's Workout */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-[#0F6E5F] dark:text-[#2DD4BF] flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Today's Workout
                  </h2>
                  <p className="text-xs text-gray-500">Scheduled resistance training</p>
                </div>
              </div>

              {completedWorkoutToday ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed</span>
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300">
                  Scheduled
                </span>
              )}
            </div>

            {completedWorkoutToday ? (
              <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  {completedWorkoutToday.dayName || 'Training Session'} Completed!
                </div>
                <div className="flex items-center gap-4 text-xs text-emerald-800/80 dark:text-emerald-300/80">
                  <span>Volume: {(completedWorkoutToday.totalVolumeKg || 0).toLocaleString()} kg</span>
                  <span>•</span>
                  <span>Duration: {completedWorkoutToday.durationMin || 45} min</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {scheduledDay?.dayName || 'Push Hypertrophy & Stability'}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Focus on progressive overload with controlled eccentric tempos.
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                  <span>{scheduledDay?.exercises?.length || 5} Exercises</span>
                  <span>•</span>
                  <span>~45–60 min</span>
                  <span>•</span>
                  <span>RPE 7–8</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onNavigateToWorkout}
            className="w-full py-3.5 px-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Dumbbell className="w-4 h-4" />
            <span>{completedWorkoutToday ? 'Review Workout Log' : 'Start Workout Session'}</span>
          </button>
        </div>
      </div>

      {/* Quick Today's Logged Meals (if any) */}
      {todayMeals.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Meals Logged Today ({todayMeals.length})
            </h3>
            <button
              onClick={onNavigateToFood}
              className="text-xs font-bold text-[#0F6E5F] dark:text-[#2DD4BF] hover:underline flex items-center gap-1"
            >
              <span>View in Food Tab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayMeals.map((meal) => (
              <div
                key={meal.id}
                className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    {meal.mealTitle || 'Logged Meal'}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {meal.proteinG}g P • {meal.carbsG || 0}g C • {meal.fatG || 0}g F
                  </div>
                </div>
                <div className="text-xs font-black text-teal-600 dark:text-teal-400 shrink-0">
                  {meal.calories} kcal
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
