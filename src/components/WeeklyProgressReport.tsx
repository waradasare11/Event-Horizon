import React, { useState, useMemo } from 'react';
import { 
  Award, 
  TrendingDown, 
  TrendingUp, 
  Dumbbell, 
  Utensils, 
  Scale, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  Printer,
  Share2,
  RefreshCw,
  Info,
  Activity,
  Check
} from 'lucide-react';
import { UserProfile, MealLog, WorkoutCompletionLog, BodyMetric } from '../types';

interface WeeklyProgressReportProps {
  userProfile: UserProfile;
  mealLogs: MealLog[];
  workoutLogs: WorkoutCompletionLog[];
  bodyMetrics: BodyMetric[];
  onOpenCheckIn?: () => void;
}

export const WeeklyProgressReport: React.FC<WeeklyProgressReportProps> = ({
  userProfile,
  mealLogs,
  workoutLogs,
  bodyMetrics,
  onOpenCheckIn,
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0); // 0 = current week, 1 = 1 week ago, etc.
  const [isGeneratingAiInsight, setIsGeneratingAiInsight] = useState<boolean>(false);
  const [customAiInsight, setCustomAiInsight] = useState<string | null>(null);

  // Compute date range for selected week
  const { startDateStr, endDateStr, dateList, weekLabel } = useMemo(() => {
    const today = new Date();
    // End date is today minus (weekOffset * 7) days
    const end = new Date(today);
    end.setDate(today.getDate() - (weekOffset * 7));
    
    // Start date is 6 days before end date
    const start = new Date(end);
    start.setDate(end.getDate() - 6);

    const formatShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const label = weekOffset === 0 
      ? `Current Week (${formatShort(start)} – ${formatShort(end)})`
      : weekOffset === 1
      ? `Previous Week (${formatShort(start)} – ${formatShort(end)})`
      : `${weekOffset} Weeks Ago (${formatShort(start)} – ${formatShort(end)})`;

    const dList: string[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      dList.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    return {
      startDateStr: start.toISOString().split('T')[0],
      endDateStr: end.toISOString().split('T')[0],
      dateList: dList,
      weekLabel: label,
    };
  }, [weekOffset]);

  // Aggregate Metrics for this 7-day period
  const stats = useMemo(() => {
    // 1. Workout Consistency
    const weekWorkouts = workoutLogs.filter((w) => dateList.includes(w.date));
    const completedWorkouts = weekWorkouts.filter((w) => !w.isRestDay).length;
    const completedRestDays = weekWorkouts.filter((w) => w.isRestDay).length;
    const targetWorkouts = userProfile.trainingDaysPerWeek || 4;
    const workoutAdherencePct = Math.min(100, Math.round((completedWorkouts / targetWorkouts) * 100));
    const totalTrainingMin = weekWorkouts.reduce((acc, w) => acc + (w.durationMin || 0), 0);
    const avgRpe = weekWorkouts.length > 0 
      ? Number((weekWorkouts.reduce((acc, w) => acc + (w.rpeAverage || 8.0), 0) / weekWorkouts.length).toFixed(1))
      : 8.0;

    // 2. Nutrition Adherence
    const weekMeals = mealLogs.filter((m) => dateList.includes(m.date));
    
    // Aggregate by day
    const dailyCalsMap: { [date: string]: { cals: number; protein: number; fiber: number } } = {};
    dateList.forEach((d) => {
      dailyCalsMap[d] = { cals: 0, protein: 0, fiber: 0 };
    });

    weekMeals.forEach((m) => {
      if (dailyCalsMap[m.date]) {
        dailyCalsMap[m.date].cals += m.calories;
        dailyCalsMap[m.date].protein += m.proteinG;
        dailyCalsMap[m.date].fiber += m.fiberG || 0;
      }
    });

    const loggedDays = Object.values(dailyCalsMap).filter((d) => d.cals > 0);
    const numLoggedDays = loggedDays.length || 1;
    const totalCals = loggedDays.reduce((acc, d) => acc + d.cals, 0);
    const totalProtein = loggedDays.reduce((acc, d) => acc + d.protein, 0);
    const totalFiber = loggedDays.reduce((acc, d) => acc + d.fiber, 0);

    const avgDailyCals = loggedDays.length > 0 ? Math.round(totalCals / numLoggedDays) : userProfile.dailyCalories;
    const avgDailyProtein = loggedDays.length > 0 ? Math.round(totalProtein / numLoggedDays) : userProfile.dailyProtein;
    const avgDailyFiber = loggedDays.length > 0 ? Math.round(totalFiber / numLoggedDays) : 32;

    const calDeltaFromTarget = avgDailyCals - userProfile.dailyCalories;
    const proteinDeltaFromTarget = avgDailyProtein - userProfile.dailyProtein;

    // Nutrition adherence score (within 10% of calorie and protein target)
    const calAccuracy = Math.max(0, 100 - Math.abs((calDeltaFromTarget / (userProfile.dailyCalories || 2000)) * 100));
    const proteinAccuracy = Math.min(100, Math.round((avgDailyProtein / (userProfile.dailyProtein || 150)) * 100));
    const nutritionAdherencePct = Math.round((calAccuracy * 0.6) + (proteinAccuracy * 0.4));

    // 3. Body Weight Changes
    // Find metric closest to start of week and end of week
    const sortedMetrics = [...bodyMetrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Weight at start of week
    const startMetric = sortedMetrics.filter((m) => m.date <= startDateStr).pop() || sortedMetrics[0] || { weightKg: userProfile.weightKg };
    // Weight at end of week
    const endMetric = sortedMetrics.filter((m) => m.date <= endDateStr).pop() || sortedMetrics[sortedMetrics.length - 1] || { weightKg: userProfile.weightKg };

    const startWeight = startMetric.weightKg;
    const endWeight = endMetric.weightKg;
    const weightDelta = Number((endWeight - startWeight).toFixed(2));
    const targetWeeklyDelta = userProfile.weeklyRateKg || -0.5;
    const weightDeltaMatchesGoal = (targetWeeklyDelta < 0 && weightDelta <= 0) || (targetWeeklyDelta > 0 && weightDelta >= 0);

    // 4. Overall Master Composite Score (0 - 100)
    const compositeScore = Math.round(
      (workoutAdherencePct * 0.4) + 
      (nutritionAdherencePct * 0.4) + 
      (numLoggedDays >= 5 ? 20 : (numLoggedDays / 7) * 20)
    );

    let ratingVerdict = 'Outstanding Execution';
    let ratingBadgeColor = 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800';
    if (compositeScore < 70) {
      ratingVerdict = 'Needs Calibration';
      ratingBadgeColor = 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800';
    } else if (compositeScore < 85) {
      ratingVerdict = 'Solid Consistency';
      ratingBadgeColor = 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800';
    }

    return {
      completedWorkouts,
      targetWorkouts,
      completedRestDays,
      workoutAdherencePct,
      totalTrainingMin,
      avgRpe,
      avgDailyCals,
      avgDailyProtein,
      avgDailyFiber,
      calDeltaFromTarget,
      proteinDeltaFromTarget,
      nutritionAdherencePct,
      numLoggedDays,
      startWeight,
      endWeight,
      weightDelta,
      targetWeeklyDelta,
      weightDeltaMatchesGoal,
      compositeScore,
      ratingVerdict,
      ratingBadgeColor,
    };
  }, [userProfile, mealLogs, workoutLogs, bodyMetrics, dateList, startDateStr, endDateStr]);

  const [structuredAiSummary, setStructuredAiSummary] = useState<{
    headline: string;
    executiveSummary: string;
    physiologicalTrajectory: string;
    trainingVolumeVerdict: string;
    nutritionAdherenceVerdict: string;
    recoveryScore: number;
    keyStrengths: string[];
    recommendedActionPlan: string[];
    scientificTakeaway: string;
  } | null>(null);

  const handleGenerateAiWeeklyAudit = async () => {
    setIsGeneratingAiInsight(true);
    try {
      const response = await fetch('/api/ai/generate-weekly-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          weeklyStats: stats,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setStructuredAiSummary(data.data);
        setCustomAiInsight(data.data.executiveSummary);
      }
    } catch (err) {
      console.error('Failed to generate AI weekly audit:', err);
    } finally {
      setIsGeneratingAiInsight(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#242826] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#5FD1B8] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
              Weekly Progress Report
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">
              Consolidated adherence across training, nutrition, and scale weight
            </p>
          </div>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="p-2 rounded-lg border border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-gray-50 dark:hover:bg-[#1F2220] text-[#4B5563] dark:text-[#D1D5DB] transition-all cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1F2220] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#1A1D1B] dark:text-[#E8ECE9]">
            {weekLabel}
          </span>
          <button
            onClick={() => setWeekOffset((prev) => Math.max(0, prev - 1))}
            disabled={weekOffset === 0}
            className="p-2 rounded-lg border border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-gray-50 dark:hover:bg-[#1F2220] disabled:opacity-40 text-[#4B5563] dark:text-[#D1D5DB] transition-all cursor-pointer"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Master Score Banner */}
      <div className="bg-gradient-to-br from-[#0F6E5F]/10 via-[#0F6E5F]/5 to-transparent border border-[#0F6E5F]/20 rounded-3xl p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Adherence Score Gauge */}
          <div className="md:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left space-y-2 border-b md:border-b-0 md:border-r border-[#E5E7EB] dark:border-[#242826] pb-6 md:pb-0 md:pr-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9EA8A2]">
              Master Weekly Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-[#0F6E5F] dark:text-[#5FD1B8]">
                {stats.compositeScore}
              </span>
              <span className="text-sm font-semibold text-[#6B7280] dark:text-[#9EA8A2]">/ 100</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${stats.ratingBadgeColor}`}>
              {stats.ratingVerdict}
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-1">
              Calculated from {stats.completedWorkouts} workouts, {stats.numLoggedDays}/7 days nutrition logs, and weigh-in consistency.
            </p>
          </div>

          {/* Core KPI Triple Cards */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Training KPI */}
            <div className="bg-white dark:bg-[#161817] p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9EA8A2]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Training</span>
                <Dumbbell className="w-4 h-4 text-[#0F6E5F] dark:text-[#5FD1B8]" />
              </div>
              <div className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                {stats.completedWorkouts} / {stats.targetWorkouts}
                <span className="text-xs font-normal text-[#6B7280] dark:text-[#9EA8A2] ml-1">sessions</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-[#242826] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-[#0F6E5F] dark:bg-[#5FD1B8] h-1.5 rounded-full" 
                  style={{ width: `${stats.workoutAdherencePct}%` }}
                />
              </div>
              <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] flex justify-between">
                <span>{stats.totalTrainingMin}m total</span>
                <span>RPE ~{stats.avgRpe}</span>
              </div>
            </div>

            {/* 2. Nutrition KPI */}
            <div className="bg-white dark:bg-[#161817] p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9EA8A2]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Avg Calories</span>
                <Utensils className="w-4 h-4 text-[#E8912D]" />
              </div>
              <div className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                {stats.avgDailyCals}
                <span className="text-xs font-normal text-[#6B7280] dark:text-[#9EA8A2] ml-1">kcal/d</span>
              </div>
              <div className="text-[11px] flex items-center gap-1 font-semibold">
                {stats.calDeltaFromTarget > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400">+{stats.calDeltaFromTarget} kcal vs goal</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">{stats.calDeltaFromTarget} kcal vs goal</span>
                )}
              </div>
              <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] flex justify-between">
                <span>{stats.avgDailyProtein}g protein/d</span>
                <span>{stats.avgDailyFiber}g fiber</span>
              </div>
            </div>

            {/* 3. Weight Delta KPI */}
            <div className="bg-white dark:bg-[#161817] p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9EA8A2]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Scale Trend</span>
                <Scale className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-baseline gap-1">
                {stats.weightDelta > 0 ? `+${stats.weightDelta}` : stats.weightDelta}
                <span className="text-xs font-normal text-[#6B7280] dark:text-[#9EA8A2]">kg this wk</span>
              </div>
              <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
                Target rate: <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">{stats.targetWeeklyDelta} kg/wk</span>
              </div>
              <div className="text-[11px] flex items-center gap-1">
                {stats.weightDeltaMatchesGoal ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> On Track
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> Minor Variance
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown: 3 Columns for Training, Nutrition, and Weight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Workout Adherence Breakdown */}
        <div className="bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#242826] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#242826]">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#0F6E5F] dark:text-[#5FD1B8]" />
              <h3 className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9]">
                Training Execution
              </h3>
            </div>
            <span className="text-xs font-bold text-[#0F6E5F] dark:text-[#5FD1B8]">
              {stats.workoutAdherencePct}% Adherence
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#202322]">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Prescribed Sessions</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">{stats.targetWorkouts} days</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#202322]">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Completed Sessions</span>
              <span className="font-semibold text-[#0F6E5F] dark:text-[#5FD1B8]">{stats.completedWorkouts} days</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#202322]">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Active Recovery / Rest</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">{stats.completedRestDays} days</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#202322]">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Total Gym Duration</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">{stats.totalTrainingMin} minutes</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Mean Set Intensity</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">RPE {stats.avgRpe} / 10</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1E201F] text-[11px] text-[#525B56] dark:text-[#9EA8A2] leading-relaxed">
            {stats.completedWorkouts >= stats.targetWorkouts ? (
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                ✓ Full training stimulus achieved. Progressive overload targets on compound movements stimulated hypertrophy.
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-300 font-medium">
                ! {stats.targetWorkouts - stats.completedWorkouts} session(s) missed. Recommend consolidating volume into remaining days or taking an active rest day.
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Nutrition Adherence Breakdown */}
        <div className="bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#242826] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#242826]">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#E8912D]" />
              <h3 className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9]">
                Nutrition & Macros
              </h3>
            </div>
            <span className="text-xs font-bold text-[#E8912D]">
              {stats.nutritionAdherencePct}% Adherence
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#202322]">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Target Calories</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">{userProfile.dailyCalories} kcal</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#202322]">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Avg Actual Calories</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">{stats.avgDailyCals} kcal</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#202322]">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Target Protein</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">{userProfile.dailyProtein}g</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#202322]">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Avg Actual Protein</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">{stats.avgDailyProtein}g</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Days Logged with Vision</span>
              <span className="font-semibold text-[#0F6E5F] dark:text-[#5FD1B8]">{stats.numLoggedDays} / 7 days</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1E201F] text-[11px] text-[#525B56] dark:text-[#9EA8A2] leading-relaxed">
            {Math.abs(stats.calDeltaFromTarget) <= 150 ? (
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                ✓ Energy balance is tightly controlled within ±{Math.abs(stats.calDeltaFromTarget)} kcal of prescribed target.
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-300 font-medium">
                ! Energy variance of {stats.calDeltaFromTarget > 0 ? '+' : ''}{stats.calDeltaFromTarget} kcal observed. Consider meal pre-planning to tighten adherence.
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Body Composition & Rate of Change */}
        <div className="bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#242826] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#242826]">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-sky-500" />
              <h3 className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9]">
                Body Weight & Rate
              </h3>
            </div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
              {stats.weightDelta > 0 ? `+${stats.weightDelta}` : `${stats.weightDelta}`} kg
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#202322]">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Week Start Weight</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">{stats.startWeight} kg</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#202322]">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Week End Weight</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">{stats.endWeight} kg</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#202322]">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Prescribed Target Rate</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">{stats.targetWeeklyDelta} kg / week</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#202322]">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Distance to Ultimate Goal</span>
              <span className="font-semibold text-[#0F6E5F] dark:text-[#5FD1B8]">
                {Math.abs(Number((stats.endWeight - (userProfile.targetWeightKg || 75)).toFixed(1)))} kg remaining
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#6B7280] dark:text-[#9EA8A2]">Est. Weeks to Goal</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">
                {Math.max(1, Math.round(Math.abs(stats.endWeight - (userProfile.targetWeightKg || 75)) / Math.abs(stats.targetWeeklyDelta || 0.5)))} weeks
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1E201F] text-[11px] text-[#525B56] dark:text-[#9EA8A2] leading-relaxed">
            <span className="text-sky-700 dark:text-sky-300 font-medium">
              ℹ Scale weight reflects both glycogen/water fluctuations and tissue composition. 7-day rolling averages minimize daily noise.
            </span>
          </div>
        </div>
      </div>

      {/* AI Weekly Synthesis & Scientific Action Plan */}
      <div className="bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#242826] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB] dark:border-[#242826]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F6E5F] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#E8912D]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#1A1D1B] dark:text-[#E8ECE9]">
                AI Science Coach Weekly Synthesis
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">
                Evidence-based strategy review and next-week programming cues
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateAiWeeklyAudit}
            disabled={isGeneratingAiInsight}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F6E5F] hover:bg-[#0C584C] disabled:bg-gray-400 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            {isGeneratingAiInsight ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Physiological Audit...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>{customAiInsight ? 'Regenerate Weekly Synthesis' : 'Generate Full AI Audit'}</span>
              </>
            )}
          </button>
        </div>

        {structuredAiSummary ? (
          <div className="space-y-4 animate-in fade-in">
            {/* Header & Recovery Score */}
            <div className="p-5 rounded-2xl bg-[#0F6E5F]/5 dark:bg-[#0F6E5F]/10 border border-[#0F6E5F]/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-bold text-base text-[#0F6E5F] dark:text-[#5FD1B8]">
                  {structuredAiSummary.headline}
                </h4>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9EA8A2]">Recovery & Adaptation:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#0F6E5F] text-white">
                    {structuredAiSummary.recoveryScore}/100
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#1A1D1B] dark:text-[#E8ECE9] leading-relaxed">
                {structuredAiSummary.executiveSummary}
              </p>
            </div>

            {/* Verdicts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#282C2A] space-y-1.5">
                <div className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#0F6E5F] dark:text-[#5FD1B8]" />
                  <span>Physiological & Weight Trajectory</span>
                </div>
                <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                  {structuredAiSummary.physiologicalTrajectory}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#282C2A] space-y-1.5">
                <div className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-sky-500" />
                  <span>Training Stimulus & Volume</span>
                </div>
                <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                  {structuredAiSummary.trainingVolumeVerdict}
                </p>
              </div>
            </div>

            {/* Strengths & Action Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {/* Key Strengths */}
              <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Standout Execution Strengths</span>
                </div>
                <ul className="space-y-1.5 text-[#374151] dark:text-[#D1D5DB]">
                  {structuredAiSummary.keyStrengths.map((st, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">•</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Plan */}
              <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Next Week's Actionable Micro-Plan</span>
                </div>
                <ul className="space-y-1.5 text-[#374151] dark:text-[#D1D5DB]">
                  {structuredAiSummary.recommendedActionPlan.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">{i + 1}.</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Scientific Takeaway */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#282C2A] text-xs flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#E8912D] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">Physiological Principle: </span>
                <span className="text-[#4B5563] dark:text-[#9EA8A2]">{structuredAiSummary.scientificTakeaway}</span>
              </div>
            </div>
          </div>
        ) : customAiInsight ? (
          <div className="p-5 rounded-2xl bg-[#0F6E5F]/5 dark:bg-[#0F6E5F]/10 border border-[#0F6E5F]/20 text-xs sm:text-sm text-[#1A1D1B] dark:text-[#E8ECE9] leading-relaxed whitespace-pre-wrap">
            {customAiInsight}
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#1F2220] border border-[#E5E7EB] dark:border-[#242826] text-xs text-[#525B56] dark:text-[#9EA8A2] space-y-2">
            <div className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">
              Weekly Automated Summary:
            </div>
            <p className="leading-relaxed">
              Your weekly training volume ({stats.completedWorkouts}/{stats.targetWorkouts} sessions) and nutrition tracking ({stats.avgDailyCals} kcal/day avg, {stats.avgDailyProtein}g protein) align with your {userProfile.goal === 'lose_fat' ? 'fat loss' : userProfile.goal === 'build_muscle' ? 'hypertrophy' : 'recomposition'} plan. 
              {stats.weightDeltaMatchesGoal 
                ? ' Weight delta matches scientific expectations within acceptable variance.'
                : ' Continue holding macros steady to confirm true tissue change versus temporary water weight shifts.'}
            </p>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
              Click &quot;Generate Full AI Audit&quot; above for personalized micro-adjustments and refeed scheduling.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
