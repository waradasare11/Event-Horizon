import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';
import { 
  TrendingUp, 
  Scale, 
  Target, 
  Calendar, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Award,
  BarChart2,
  Download,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  PieChart as PieIcon
} from 'lucide-react';
import { BodyMetric, UserProfile, MealLog, WorkoutCompletionLog, WorkoutProgram } from '../types';
import { WeeklyProgressReport } from './WeeklyProgressReport';
import { WorkoutActivityHeatmap } from './WorkoutActivityHeatmap';
import { CalendarHeatmapView } from './CalendarHeatmapView';
import { D3MuscleIntensityHeatmap } from './D3MuscleIntensityHeatmap';
import { WeeklyLiftingVolumeChart } from './WeeklyLiftingVolumeChart';
import { GoalTimelinePredictor } from './GoalTimelinePredictor';
import { BodyCompositionTrendDashboard } from './BodyCompositionTrendDashboard';
import { ThirtyDayWeightDeficitChart } from './ThirtyDayWeightDeficitChart';
import { exportUserDataToCSV } from '../lib/csvExport';
import { D3MacroDonutChart } from './D3MacroDonutChart';
import { GranularCSVExportModal } from './GranularCSVExportModal';

interface ProgressAnalyticsProps {
  bodyMetrics: BodyMetric[];
  userProfile: UserProfile;
  mealLogs: MealLog[];
  workoutLogs: WorkoutCompletionLog[];
  workoutPrograms?: WorkoutProgram[];
  onAddBodyMetric: (metric: BodyMetric) => void;
  onOpenCheckIn: () => void;
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

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({
  bodyMetrics,
  userProfile,
  mealLogs,
  workoutLogs,
  workoutPrograms = [],
  onAddBodyMetric,
  onOpenCheckIn,
  onToggleWorkoutLog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'weekly' | 'calendar_heatmap' | 'predictor' | 'muscle_heatmap' | 'heatmap' | 'trends'>('weekly');
  const [newWeight, setNewWeight] = useState<number>(userProfile.weightKg);
  const [newBodyFat, setNewBodyFat] = useState<number>(userProfile.bodyFatPct || 18);
  const [showAddMetricModal, setShowAddMetricModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const handleExportData = () => {
    setShowExportModal(true);
  };

  // Format data for weight progression chart
  const initialWeight = bodyMetrics[0]?.weightKg || userProfile.weightKg;
  const currentWeight = bodyMetrics[bodyMetrics.length - 1]?.weightKg || userProfile.weightKg;
  const totalChange = Number((currentWeight - initialWeight).toFixed(1));

  // Real Math Calculations for Weekly Summary Card (Past 7 Days)
  const weeklyStats = useMemo(() => {
    const today = new Date();
    const dateList: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dateList.push(d.toISOString().split('T')[0]);
    }
    const startDateStr = dateList[0];
    const endDateStr = dateList[dateList.length - 1];

    // 1. Workouts Done (Real count of completed training sessions in past 7 days)
    const weekWorkouts = workoutLogs.filter((w) => dateList.includes(w.date) && !w.isRestDay);
    const workoutsDone = weekWorkouts.length;
    const targetWorkouts = userProfile.trainingDaysPerWeek || 4;

    // 2. Avg Protein & Kcal vs Target (Daily sums for logged days in past 7 days)
    const weekMeals = mealLogs.filter((m) => dateList.includes(m.date));
    const dailyMap: Record<string, { cals: number; protein: number }> = {};
    weekMeals.forEach((m) => {
      if (!dailyMap[m.date]) dailyMap[m.date] = { cals: 0, protein: 0 };
      dailyMap[m.date].cals += m.calories || 0;
      dailyMap[m.date].protein += m.proteinG || 0;
    });

    const loggedDays = Object.values(dailyMap).filter((d) => d.cals > 0);
    const numLoggedDays = loggedDays.length;

    const totalCals = loggedDays.reduce((acc, d) => acc + d.cals, 0);
    const totalProtein = loggedDays.reduce((acc, d) => acc + d.protein, 0);

    const avgProtein = numLoggedDays > 0 ? Math.round(totalProtein / numLoggedDays) : 0;
    const avgCals = numLoggedDays > 0 ? Math.round(totalCals / numLoggedDays) : 0;
    const targetCalories = userProfile.dailyCalories || 2000;
    const targetProtein = userProfile.dailyProtein || 150;
    const kcalDelta = avgCals > 0 ? avgCals - targetCalories : 0;

    // 3. Weight Change (Real math from bodyMetrics)
    const sortedMetrics = [...bodyMetrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const priorMetrics = sortedMetrics.filter((m) => m.date <= startDateStr);
    const startMetric = priorMetrics.length > 0 ? priorMetrics[priorMetrics.length - 1] : sortedMetrics[0];
    const latestMetric = sortedMetrics[sortedMetrics.length - 1];

    const startW = startMetric?.weightKg ?? userProfile.weightKg;
    const curW = latestMetric?.weightKg ?? userProfile.weightKg;
    const weightChange = Number((curW - startW).toFixed(2));

    return {
      dateRange: `${startDateStr.slice(5)} to ${endDateStr.slice(5)}`,
      workoutsDone,
      targetWorkouts,
      avgProtein,
      targetProtein,
      avgCals,
      targetCalories,
      kcalDelta,
      numLoggedDays,
      weightChange,
      startWeight: startW,
      currentWeight: curW,
    };
  }, [workoutLogs, mealLogs, bodyMetrics, userProfile]);

  // Build projected trajectory data points
  const chartData = bodyMetrics.map((m, index) => {
    const projectedTarget = Number(
      (initialWeight + (userProfile.weeklyRateKg || -0.5) * index).toFixed(1)
    );
    return {
      date: m.date.slice(5), // MM-DD
      actualWeight: m.weightKg,
      projectedWeight: projectedTarget,
      bodyFatPct: m.bodyFatPct || 18,
    };
  });

  // Calculate today's logged macros vs profile targets
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = mealLogs.filter((m) => m.date === todayStr);
  const consumedCalories = todayLogs.reduce((sum, m) => sum + m.calories, 0);
  const consumedProtein = Number(todayLogs.reduce((sum, m) => sum + m.proteinG, 0).toFixed(1));
  const consumedCarbs = Number(todayLogs.reduce((sum, m) => sum + m.carbsG, 0).toFixed(1));
  const consumedFat = Number(todayLogs.reduce((sum, m) => sum + m.fatG, 0).toFixed(1));

  const targetCalories = userProfile.dailyCalories || 2000;
  const targetProtein = userProfile.dailyProtein || 140;
  const targetCarbs = userProfile.dailyCarbs || 200;
  const targetFat = userProfile.dailyFat || 60;

  const proteinPct = Math.min(100, Math.round((consumedProtein / Math.max(1, targetProtein)) * 100));
  const carbsPct = Math.min(100, Math.round((consumedCarbs / Math.max(1, targetCarbs)) * 100));
  const fatPct = Math.min(100, Math.round((consumedFat / Math.max(1, targetFat)) * 100));
  const calPct = Math.min(100, Math.round((consumedCalories / Math.max(1, targetCalories)) * 100));

  // Circular progress radial bar chart data (ordered from outermost to innermost ring)
  const macroRadialData = [
    {
      name: 'Calories',
      value: consumedCalories,
      target: targetCalories,
      unit: 'kcal',
      percentage: calPct,
      fill: '#8B5CF6',
    },
    {
      name: 'Carbs',
      value: consumedCarbs,
      target: targetCarbs,
      unit: 'g',
      percentage: carbsPct,
      fill: '#3B82F6',
    },
    {
      name: 'Fats',
      value: consumedFat,
      target: targetFat,
      unit: 'g',
      percentage: fatPct,
      fill: '#E8912D',
    },
    {
      name: 'Protein',
      value: consumedProtein,
      target: targetProtein,
      unit: 'g',
      percentage: proteinPct,
      fill: '#D4AF37',
    },
  ];

  // Recent 7-day adherence data
  const adherenceData = [
    { day: 'Mon', calories: 2100, target: userProfile.dailyCalories, protein: 160, proteinTarget: userProfile.dailyProtein },
    { day: 'Tue', calories: 2180, target: userProfile.dailyCalories, protein: 168, proteinTarget: userProfile.dailyProtein },
    { day: 'Wed', calories: 2050, target: userProfile.dailyCalories, protein: 155, proteinTarget: userProfile.dailyProtein },
    { day: 'Thu', calories: 2140, target: userProfile.dailyCalories, protein: 162, proteinTarget: userProfile.dailyProtein },
    { day: 'Fri', calories: 2200, target: userProfile.dailyCalories, protein: 170, proteinTarget: userProfile.dailyProtein },
    { day: 'Sat', calories: 2150, target: userProfile.dailyCalories, protein: 164, proteinTarget: userProfile.dailyProtein },
    { day: 'Sun', calories: 2090, target: userProfile.dailyCalories, protein: 158, proteinTarget: userProfile.dailyProtein },
  ];

  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    const newMetric: BodyMetric = {
      id: 'bm_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      weightKg: Number(newWeight),
      bodyFatPct: Number(newBodyFat),
    };
    onAddBodyMetric(newMetric);
    setShowAddMetricModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#F0D060]">
              Progress Dashboard
            </span>
            <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Daily Targets & Trends</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-2">
            Progress & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA8A2] mt-1 max-w-2xl">
            View your daily nutrition intake against target macros and track your weight trajectory over time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportData}
            title="Export all data to CSV"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#2A2416] text-[#1A1D1B] dark:text-[#E8ECE9] text-xs sm:text-sm font-semibold hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#D4AF37] dark:text-[#F0D060]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddMetricModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#2A2416] text-[#1A1D1B] dark:text-[#E8ECE9] text-xs sm:text-sm font-semibold hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D4AF37] dark:text-[#F0D060]" />
            <span>Log Weight</span>
          </button>

          <button
            onClick={onOpenCheckIn}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-white text-xs sm:text-sm font-semibold hover:bg-[#A68523] transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#E8912D]" />
            <span>Weekly Check-In</span>
          </button>
        </div>
      </div>

      {/* Export feedback toast */}
      {exportSuccess && (
        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] dark:text-[#F0D060] px-4 py-3 rounded-xl flex items-center justify-between text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] dark:text-[#F0D060]" />
            <span>Data exported successfully to CSV.</span>
          </div>
          <span className="text-xs opacity-75 font-mono">CSV Ready</span>
        </div>
      )}

      {bodyMetrics.length === 0 ? (
        /* EMPTY PROGRESS: "Log a weigh-in" ONE BUTTON */
        <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 text-center space-y-4 shadow-sm animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#F0D060] flex items-center justify-center mx-auto">
            <Scale className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">No Weigh-Ins Recorded Yet</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
              Start by recording your first weigh-in. Your weekly performance card, weight trajectory, and metabolic analytics will appear automatically.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAddMetricModal(true)}
              className="px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#A68523] text-white text-sm font-bold shadow-md cursor-pointer transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Log a weigh-in</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* WEEKLY PROGRESS SUMMARY CARD (Real Math Only) */}
          <div className="bg-white dark:bg-[#111111] p-6 sm:p-7 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] dark:border-[#2A2416] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D4AF37] dark:text-[#F0D060]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] dark:text-[#F0D060]">
                    Weekly Performance
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{weeklyStats.dateRange}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-0.5">
                  Weekly Summary
                </h2>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Real arithmetic calculations from athlete logs
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Workouts Done */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-[#FAFAF8] dark:bg-[#161817] space-y-1.5">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#F0D060]" />
                  Workouts Done
                </span>
                <div className="text-2xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  {weeklyStats.workoutsDone} <span className="text-xs font-normal text-gray-500">/ {weeklyStats.targetWorkouts}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {weeklyStats.workoutsDone >= weeklyStats.targetWorkouts
                    ? 'Target achieved'
                    : `${weeklyStats.targetWorkouts - weeklyStats.workoutsDone} remaining`}
                </p>
              </div>

              {/* 2. Avg Protein */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-[#FAFAF8] dark:bg-[#161817] space-y-1.5">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-blue-500" />
                  Avg Protein
                </span>
                <div className="text-2xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  {weeklyStats.avgProtein}g <span className="text-xs font-normal text-gray-500">/ day</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Target: {weeklyStats.targetProtein}g ({weeklyStats.avgProtein >= weeklyStats.targetProtein ? 'Goal met' : `${weeklyStats.targetProtein - weeklyStats.avgProtein}g below target`})
                </p>
              </div>

              {/* 3. Kcal vs Target */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-[#FAFAF8] dark:bg-[#161817] space-y-1.5">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <PieIcon className="w-3.5 h-3.5 text-purple-500" />
                  Kcal vs Target
                </span>
                <div className="text-2xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  {weeklyStats.avgCals} <span className="text-xs font-normal text-gray-500">kcal/day</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {weeklyStats.kcalDelta === 0
                    ? `On target (${weeklyStats.targetCalories} kcal)`
                    : weeklyStats.kcalDelta > 0
                    ? `+${weeklyStats.kcalDelta} vs ${weeklyStats.targetCalories} target`
                    : `${weeklyStats.kcalDelta} vs ${weeklyStats.targetCalories} target`}
                </p>
              </div>

              {/* 4. Weight Change */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-[#FAFAF8] dark:bg-[#161817] space-y-1.5">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-500" />
                  Weight Change
                </span>
                <div className="text-2xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  {weeklyStats.weightChange > 0 ? `+${weeklyStats.weightChange}` : weeklyStats.weightChange} <span className="text-xs font-normal text-gray-500">kg</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {weeklyStats.startWeight}kg → {weeklyStats.currentWeight}kg this week
                </p>
              </div>
            </div>
          </div>

          {/* CIRCULAR PROGRESS CHART: Daily Macronutrient & Calorie Intake vs Calculated Targets */}
          <div className="bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] dark:border-[#2A2416] pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-[#D4AF37] dark:text-[#F0D060]" />
              <span>Today's Macronutrient Intake</span>
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
              Circular progress tracking your logged daily protein, fats, carbs, and calories against calculated targets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#F0D060]">
              {todayLogs.length} {todayLogs.length === 1 ? 'meal' : 'meals'} logged today
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Recharts Circular RadialBar Progress Chart */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[260px]">
            <div className="w-full h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="25%"
                  outerRadius="100%"
                  barSize={14}
                  data={macroRadialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background={{ fill: 'rgba(150, 150, 150, 0.12)' }}
                    dataKey="percentage"
                    cornerRadius={8}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#1E201F] text-white text-xs p-3 rounded-xl shadow-lg border border-[#2A2416]">
                            <div className="font-bold flex items-center gap-1.5" style={{ color: data.fill }}>
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.fill }} />
                              {data.name}
                            </div>
                            <div className="mt-1 text-gray-200">
                              {data.value} / {data.target} {data.unit} ({data.percentage}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>

              {/* Center Summary Indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-xl sm:text-2xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  {calPct}%
                </div>
                <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] uppercase font-semibold">
                  Calories
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-1 text-center">
              Outer ring: Calories • Carbs • Fats • Inner ring: Protein
            </div>
          </div>

          {/* Detailed Macro Status Cards */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3.5">
            {/* Protein Card */}
            <div className="p-4 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D4AF37] dark:text-[#F0D060] flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4" />
                  Protein
                </span>
                <span className="text-xs font-bold text-[#D4AF37] dark:text-[#F0D060]">
                  {proteinPct}%
                </span>
              </div>
              <div className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                {consumedProtein} <span className="text-xs font-normal text-[#6B7280] dark:text-[#9EA8A2]">/ {targetProtein}g</span>
              </div>
              <div className="w-full bg-[#E5E7EB] dark:bg-[#2A2416] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#D4AF37] h-full rounded-full transition-all" 
                  style={{ width: `${Math.min(100, proteinPct)}%` }} 
                />
              </div>
              <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
                {targetProtein - consumedProtein > 0 
                  ? `${(targetProtein - consumedProtein).toFixed(1)}g left to reach target` 
                  : 'Daily goal reached'}
              </div>
            </div>

            {/* Fats Card */}
            <div className="p-4 rounded-xl border border-[#E8912D]/30 bg-[#E8912D]/5 dark:bg-[#E8912D]/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E8912D] flex items-center gap-1.5">
                  <Droplet className="w-4 h-4" />
                  Fats
                </span>
                <span className="text-xs font-bold text-[#E8912D]">
                  {fatPct}%
                </span>
              </div>
              <div className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                {consumedFat} <span className="text-xs font-normal text-[#6B7280] dark:text-[#9EA8A2]">/ {targetFat}g</span>
              </div>
              <div className="w-full bg-[#E5E7EB] dark:bg-[#2A2416] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#E8912D] h-full rounded-full transition-all" 
                  style={{ width: `${Math.min(100, fatPct)}%` }} 
                />
              </div>
              <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
                {targetFat - consumedFat > 0 
                  ? `${(targetFat - consumedFat).toFixed(1)}g remaining` 
                  : 'Daily budget met'}
              </div>
            </div>

            {/* Carbs Card */}
            <div className="p-4 rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#3B82F6] flex items-center gap-1.5">
                  <Wheat className="w-4 h-4" />
                  Carbohydrates
                </span>
                <span className="text-xs font-bold text-[#3B82F6]">
                  {carbsPct}%
                </span>
              </div>
              <div className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                {consumedCarbs} <span className="text-xs font-normal text-[#6B7280] dark:text-[#9EA8A2]">/ {targetCarbs}g</span>
              </div>
              <div className="w-full bg-[#E5E7EB] dark:bg-[#2A2416] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#3B82F6] h-full rounded-full transition-all" 
                  style={{ width: `${Math.min(100, carbsPct)}%` }} 
                />
              </div>
              <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
                {targetCarbs - consumedCarbs > 0 
                  ? `${(targetCarbs - consumedCarbs).toFixed(1)}g remaining` 
                  : 'Target reached'}
              </div>
            </div>

            {/* Calories Card */}
            <div className="p-4 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8B5CF6] flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  Total Calories
                </span>
                <span className="text-xs font-bold text-[#8B5CF6]">
                  {calPct}%
                </span>
              </div>
              <div className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                {consumedCalories} <span className="text-xs font-normal text-[#6B7280] dark:text-[#9EA8A2]">/ {targetCalories} kcal</span>
              </div>
              <div className="w-full bg-[#E5E7EB] dark:bg-[#2A2416] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#8B5CF6] h-full rounded-full transition-all" 
                  style={{ width: `${Math.min(100, calPct)}%` }} 
                />
              </div>
              <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
                {targetCalories - consumedCalories > 0 
                  ? `${targetCalories - consumedCalories} kcal remaining today` 
                  : 'Target calories met'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* D3-Based Macronutrient Donut Chart vs User Profile Targets */}
      <D3MacroDonutChart userProfile={userProfile} mealLogs={mealLogs} />

      {/* Sub-view switcher: Weekly Progress Report vs Goal Timeline Predictor vs Muscle Volume Heatmap vs Consistency Matrix vs Weight Trends */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-[#2A2416] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('weekly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'weekly'
              ? 'bg-[#D4AF37] text-white shadow-xs'
              : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9] hover:bg-gray-100 dark:hover:bg-[#1E201F]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Weekly Report</span>
        </button>

        <button
          onClick={() => setActiveSubTab('predictor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'predictor'
              ? 'bg-[#D4AF37] text-white shadow-xs'
              : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9] hover:bg-gray-100 dark:hover:bg-[#1E201F]'
          }`}
        >
          <Target className="w-4 h-4 text-amber-400" />
          <span>Goal Timeline Predictor</span>
        </button>

        <button
          onClick={() => setActiveSubTab('calendar_heatmap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'calendar_heatmap'
              ? 'bg-[#D4AF37] text-white shadow-xs'
              : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9] hover:bg-gray-100 dark:hover:bg-[#1E201F]'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Calendar Heatmap</span>
        </button>

        <button
          onClick={() => setActiveSubTab('muscle_heatmap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'muscle_heatmap'
              ? 'bg-[#D4AF37] text-white shadow-xs'
              : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9] hover:bg-gray-100 dark:hover:bg-[#1E201F]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Muscle Intensity Heatmap (D3)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('heatmap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'heatmap'
              ? 'bg-[#D4AF37] text-white shadow-xs'
              : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9] hover:bg-gray-100 dark:hover:bg-[#1E201F]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Consistency Matrix</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trends')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'trends'
              ? 'bg-[#D4AF37] text-white shadow-xs'
              : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9] hover:bg-gray-100 dark:hover:bg-[#1E201F]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Weight Trends</span>
        </button>
      </div>

      {/* Sub-Tab Content: Goal Timeline Predictor */}
      {activeSubTab === 'predictor' && (
        <div className="space-y-6">
          <GoalTimelinePredictor
            userProfile={userProfile}
            bodyMetrics={bodyMetrics}
            workoutLogs={workoutLogs}
          />
        </div>
      )}

      {/* Sub-Tab Content: Weekly Progress Report */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-8">
          {/* Quick Predictor Banner in Weekly View */}
          <GoalTimelinePredictor
            userProfile={userProfile}
            bodyMetrics={bodyMetrics}
            workoutLogs={workoutLogs}
            compact={true}
          />
          <WeeklyProgressReport
            userProfile={userProfile}
            mealLogs={mealLogs}
            workoutLogs={workoutLogs}
            bodyMetrics={bodyMetrics}
            onOpenCheckIn={onOpenCheckIn}
          />
          {/* 30-Day Weight Loss Trend Overlayed with Daily Calorie Deficit Progress */}
          <ThirtyDayWeightDeficitChart
            bodyMetrics={bodyMetrics}
            userProfile={userProfile}
            mealLogs={mealLogs}
          />
          {/* 3-Month Weekly Total Lifting Volume Line Chart */}
          <WeeklyLiftingVolumeChart
            workoutLogs={workoutLogs}
            userProfile={userProfile}
          />
          {/* D3 Muscle Volume Heatmap in Weekly Tab */}
          <D3MuscleIntensityHeatmap
            workoutLogs={workoutLogs}
            workoutPrograms={workoutPrograms}
            userProfile={userProfile}
          />
          {/* Quick Heatmap preview in Weekly tab for effortless consistency glance */}
          <WorkoutActivityHeatmap
            workoutLogs={workoutLogs}
            userProfile={userProfile}
            onToggleWorkoutLog={onToggleWorkoutLog}
          />
        </div>
      )}

      {/* Sub-Tab Content: Dedicated Calendar Heatmap View */}
      {activeSubTab === 'calendar_heatmap' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <CalendarHeatmapView
            workoutLogs={workoutLogs}
            userProfile={userProfile}
            onToggleWorkoutLog={onToggleWorkoutLog}
          />
        </div>
      )}

      {/* Sub-Tab Content: Dedicated D3 Muscle Intensity & Volume Heatmap */}
      {activeSubTab === 'muscle_heatmap' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <D3MuscleIntensityHeatmap
            workoutLogs={workoutLogs}
            workoutPrograms={workoutPrograms}
            userProfile={userProfile}
          />
        </div>
      )}

      {/* Sub-Tab Content: Dedicated 52-Week Workout Activity Heatmap */}
      {activeSubTab === 'heatmap' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <WorkoutActivityHeatmap
            workoutLogs={workoutLogs}
            userProfile={userProfile}
            onToggleWorkoutLog={onToggleWorkoutLog}
          />
        </div>
      )}

      {/* Sub-Tab Content: Long-Term Trends */}
      {activeSubTab === 'trends' && (
        <div className="space-y-8">
          {/* 30-Day Weight Loss Trend Overlayed with Daily Calorie Deficit Progress */}
          <ThirtyDayWeightDeficitChart
            bodyMetrics={bodyMetrics}
            userProfile={userProfile}
            mealLogs={mealLogs}
          />

          {/* Recharts Multi-Range Body Composition Trend Analysis Dashboard */}
          <BodyCompositionTrendDashboard
            userProfile={userProfile}
            bodyMetrics={bodyMetrics}
            workoutLogs={workoutLogs}
          />

          {/* Metric Cards Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs">
              <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Current Weight</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1">
                {currentWeight} <span className="text-sm font-normal text-[#6B7280] dark:text-[#9EA8A2]">kg</span>
              </div>
              <div className="text-xs text-[#D4AF37] dark:text-[#F0D060] font-semibold mt-1">
                {totalChange <= 0 ? `${totalChange} kg` : `+${totalChange} kg`} from start
              </div>
            </div>

            <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs">
              <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Target Goal</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#D4AF37] dark:text-[#F0D060] mt-1">
                {userProfile.targetWeightKg} <span className="text-sm font-normal text-[#6B7280] dark:text-[#9EA8A2]">kg</span>
              </div>
              <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-1">
                {Math.abs(currentWeight - userProfile.targetWeightKg).toFixed(1)} kg to go
              </div>
            </div>

            <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs">
              <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Body Fat %</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#E8912D] mt-1">
                {bodyMetrics[bodyMetrics.length - 1]?.bodyFatPct || userProfile.bodyFatPct || 18.5} <span className="text-sm font-normal text-[#6B7280] dark:text-[#9EA8A2]">%</span>
              </div>
              <div className="text-xs text-[#16A34A] font-semibold mt-1">
                Estimated
              </div>
            </div>

            <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs">
              <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Target Date</div>
              <div className="text-xl sm:text-2xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1 truncate">
                {userProfile.targetDate || 'Target Phase'}
              </div>
              <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-1">
                Rate: {userProfile.weeklyRateKg} kg / week
              </div>
            </div>
          </div>

          {/* Main Interactive Chart: Actual Weight vs Safe Projected Path */}
          <div className="bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] dark:border-[#2A2416] pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#D4AF37] dark:text-[#F0D060]" />
                  <span>Weight Trajectory vs. Target Path</span>
                </h2>
                <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
                  Solid green line is your logged weigh-ins; amber dashed line is your projected trajectory.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#D4AF37]" />
                  <span className="text-[#1A1D1B] dark:text-[#E8ECE9]">Actual Weight (kg)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#E8912D]" />
                  <span className="text-[#1A1D1B] dark:text-[#E8ECE9]">Projected Target (kg)</span>
                </div>
              </div>
            </div>

            {/* Recharts Line Graph */}
            <div className="w-full h-72 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E201F',
                      color: '#E8ECE9',
                      borderRadius: '12px',
                      border: '1px solid #2A2416',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualWeight"
                    name="Actual Weight (kg)"
                    stroke="#D4AF37"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#D4AF37' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedWeight"
                    name="Projected Trajectory"
                    stroke="#E8912D"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3-Month Weekly Lifting Volume Progression */}
          <WeeklyLiftingVolumeChart
            workoutLogs={workoutLogs}
            userProfile={userProfile}
          />

          {/* Adherence & Nutrition Consistency Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2416] pb-3">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#1A1D1B] dark:text-[#E8ECE9]">
                    Daily Caloric Adherence
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Target: {userProfile.dailyCalories} kcal/day</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#16A34A]/10 text-[#16A34A]">
                  Active
                </span>
              </div>

              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adherenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} vertical={false} />
                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} domain={[1500, 2600]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E201F',
                        color: '#E8ECE9',
                        borderRadius: '8px',
                        border: '1px solid #2A2416',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="calories" name="Consumed (kcal)" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2416] pb-3">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#1A1D1B] dark:text-[#E8ECE9]">
                    Protein Consistency
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Target: {userProfile.dailyProtein}g/day</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#F0D060]">
                  Target: {userProfile.dailyProtein}g
                </span>
              </div>

              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adherenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} vertical={false} />
                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} domain={[100, 200]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E201F',
                        color: '#E8ECE9',
                        borderRadius: '8px',
                        border: '1px solid #2A2416',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="protein" name="Protein (g)" fill="#E8912D" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Manual Add Weight Modal */}
      {showAddMetricModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 max-w-sm w-full shadow-xl border border-[#E5E7EB] dark:border-[#2A2416] animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#1A1D1B] dark:text-[#E8ECE9]">Log Body Weight</h3>
              <button
                onClick={() => setShowAddMetricModal(false)}
                className="text-[#9CA3AF] hover:text-[#1A1D1B] dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMetric} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
                  Current Weight (kg):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2416] bg-transparent text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
                  Body Fat % (Optional):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newBodyFat}
                  onChange={(e) => setNewBodyFat(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2416] bg-transparent text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMetricModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6B7280] dark:text-[#9EA8A2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#D4AF37] text-white hover:bg-[#A68523] cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Granular CSV Export Modal */}
      <GranularCSVExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        userProfile={userProfile}
        mealLogs={mealLogs}
        workoutLogs={workoutLogs}
        bodyMetrics={bodyMetrics}
      />
    </div>
  );
};
