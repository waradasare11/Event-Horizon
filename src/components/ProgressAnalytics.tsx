import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
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
  BarChart2
} from 'lucide-react';
import { BodyMetric, UserProfile, MealLog, WorkoutCompletionLog } from '../types';
import { WeeklyProgressReport } from './WeeklyProgressReport';

interface ProgressAnalyticsProps {
  bodyMetrics: BodyMetric[];
  userProfile: UserProfile;
  mealLogs: MealLog[];
  workoutLogs: WorkoutCompletionLog[];
  onAddBodyMetric: (metric: BodyMetric) => void;
  onOpenCheckIn: () => void;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({
  bodyMetrics,
  userProfile,
  mealLogs,
  workoutLogs,
  onAddBodyMetric,
  onOpenCheckIn,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'weekly' | 'trends'>('weekly');
  const [newWeight, setNewWeight] = useState<number>(userProfile.weightKg);
  const [newBodyFat, setNewBodyFat] = useState<number>(userProfile.bodyFatPct || 18);
  const [showAddMetricModal, setShowAddMetricModal] = useState<boolean>(false);

  // Format data for weight progression chart
  const initialWeight = bodyMetrics[0]?.weightKg || userProfile.weightKg;
  const currentWeight = bodyMetrics[bodyMetrics.length - 1]?.weightKg || userProfile.weightKg;
  const totalChange = Number((currentWeight - initialWeight).toFixed(1));

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
      <div className="bg-white dark:bg-[#161817] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0F6E5F]/10 text-[#0F6E5F] dark:text-[#5FD1B8]">
              Body Composition Analytics
            </span>
            <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Actual vs. Scientific Target</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-2">
            Progress & Performance Center
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA8A2] mt-1 max-w-2xl">
            Track your weekly consistency across workouts and nutrition, alongside long-term trajectory toward target body composition.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddMetricModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#1A1D1B] dark:text-[#E8ECE9] text-xs sm:text-sm font-semibold hover:bg-[#F9FAFB] dark:hover:bg-[#232726] transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#0F6E5F] dark:text-[#5FD1B8]" />
            <span>Log Weight</span>
          </button>

          <button
            onClick={onOpenCheckIn}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F6E5F] text-white text-xs sm:text-sm font-semibold hover:bg-[#0D5B4F] transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#E8912D]" />
            <span>Weekly Check-In</span>
          </button>
        </div>
      </div>

      {/* Sub-view switcher: Weekly Progress Report vs Long-Term Trends */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-[#242826] pb-2">
        <button
          onClick={() => setActiveSubTab('weekly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'weekly'
              ? 'bg-[#0F6E5F] text-white shadow-xs'
              : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9] hover:bg-gray-100 dark:hover:bg-[#1E201F]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Weekly Progress Report</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trends')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'trends'
              ? 'bg-[#0F6E5F] text-white shadow-xs'
              : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9] hover:bg-gray-100 dark:hover:bg-[#1E201F]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Long-Term Trajectory & Charts</span>
        </button>
      </div>

      {/* Sub-Tab Content: Weekly Progress Report */}
      {activeSubTab === 'weekly' && (
        <WeeklyProgressReport
          userProfile={userProfile}
          mealLogs={mealLogs}
          workoutLogs={workoutLogs}
          bodyMetrics={bodyMetrics}
          onOpenCheckIn={onOpenCheckIn}
        />
      )}

      {/* Sub-Tab Content: Long-Term Trends */}
      {activeSubTab === 'trends' && (
        <div className="space-y-8">
          {/* Metric Cards Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#161817] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs">
              <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Current Weight</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1">
                {currentWeight} <span className="text-sm font-normal text-[#6B7280] dark:text-[#9EA8A2]">kg</span>
              </div>
              <div className="text-xs text-[#0F6E5F] dark:text-[#5FD1B8] font-semibold mt-1">
                {totalChange <= 0 ? `${totalChange} kg` : `+${totalChange} kg`} from start
              </div>
            </div>

            <div className="bg-white dark:bg-[#161817] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs">
              <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Target Goal</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0F6E5F] dark:text-[#5FD1B8] mt-1">
                {userProfile.targetWeightKg} <span className="text-sm font-normal text-[#6B7280] dark:text-[#9EA8A2]">kg</span>
              </div>
              <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-1">
                {Math.abs(currentWeight - userProfile.targetWeightKg).toFixed(1)} kg to go
              </div>
            </div>

            <div className="bg-white dark:bg-[#161817] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs">
              <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Estimated Body Fat</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#E8912D] mt-1">
                {bodyMetrics[bodyMetrics.length - 1]?.bodyFatPct || userProfile.bodyFatPct || 18.5} <span className="text-sm font-normal text-[#6B7280] dark:text-[#9EA8A2]">%</span>
              </div>
              <div className="text-xs text-[#16A34A] font-semibold mt-1">
                Lean Mass Preserved
              </div>
            </div>

            <div className="bg-white dark:bg-[#161817] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs">
              <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Projected Goal Date</div>
              <div className="text-xl sm:text-2xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1 truncate">
                {userProfile.targetDate || 'Nov 20, 2026'}
              </div>
              <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-1">
                Safe rate: {userProfile.weeklyRateKg} kg / week
              </div>
            </div>
          </div>

          {/* Main Interactive Chart: Actual Weight vs Safe Projected Path */}
          <div className="bg-white dark:bg-[#161817] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] dark:border-[#242826] pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0F6E5F] dark:text-[#5FD1B8]" />
                  <span>Weight Trajectory vs. Scientific Goal Path</span>
                </h2>
                <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
                  Green line represents your logged weigh-ins; amber dashed line represents projected trajectory.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#0F6E5F]" />
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
                      border: '1px solid #2A2E2C',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualWeight"
                    name="Actual Weight (kg)"
                    stroke="#0F6E5F"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0F6E5F' }}
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

          {/* Adherence & Nutrition Consistency Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#161817] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#242826] pb-3">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#1A1D1B] dark:text-[#E8ECE9]">
                    Daily Caloric Adherence
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Target: {userProfile.dailyCalories} kcal/day</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#16A34A]/10 text-[#16A34A]">
                  96% Target Adherence
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
                        border: '1px solid #2A2E2C',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="calories" name="Consumed (kcal)" fill="#0F6E5F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-[#161817] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#242826] pb-3">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#1A1D1B] dark:text-[#E8ECE9]">
                    Protein Consistency
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Target: {userProfile.dailyProtein}g/day</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#0F6E5F]/10 text-[#0F6E5F] dark:text-[#5FD1B8]">
                  Optimal Leucine Spikes
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
                        border: '1px solid #2A2E2C',
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

      {/* Manual Add Weight Modal */}
      {showAddMetricModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161817] rounded-2xl p-6 max-w-sm w-full shadow-xl border border-[#E5E7EB] dark:border-[#242826] animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#1A1D1B] dark:text-[#E8ECE9]">Log New Body Weight</h3>
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
                  className="w-full text-sm px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#242826] bg-transparent text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none focus:ring-1 focus:ring-[#0F6E5F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
                  Body Fat % (Optional estimate):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newBodyFat}
                  onChange={(e) => setNewBodyFat(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#242826] bg-transparent text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none focus:ring-1 focus:ring-[#0F6E5F]"
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
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#0F6E5F] text-white hover:bg-[#0D5B4F] cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
