import React, { useState, useMemo } from 'react';
import { 
  RefreshCw, 
  Sparkles, 
  Scale, 
  Activity, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Flame, 
  Info,
  Calendar,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid, 
  Area, 
  AreaChart 
} from 'recharts';
import { UserProfile, BodyMetric } from '../types';
import { calculateBMR, calculateTDEE } from '../lib/calc/energy';
import { calculateMacros } from '../lib/calc/macros';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  bodyMetrics: BodyMetric[];
  onCompleteCheckIn: (updatedProfile: UserProfile, newMetric: BodyMetric) => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  bodyMetrics,
  onCompleteCheckIn,
}) => {
  const [currentWeight, setCurrentWeight] = useState<number | string>(userProfile.weightKg || '');
  const [currentBodyFat, setCurrentBodyFat] = useState<number | string>(userProfile.bodyFatPct || '');
  const [adherenceScore, setAdherenceScore] = useState<number>(4);
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [notes, setNotes] = useState<string>('');
  const [activeChartMetric, setActiveChartMetric] = useState<'weight' | 'bodyFat'>('weight');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleNumChange = (raw: string, setter: (val: string) => void) => {
    if (raw === '') {
      setter('');
      return;
    }
    const sanitized = raw.replace(/^0+(?=\d)/, '');
    setter(sanitized);
  };

  const parsedWeight = Number(currentWeight) || userProfile.weightKg || 70;
  const parsedBodyFat = currentBodyFat !== '' ? Number(currentBodyFat) : undefined;

  // Live Chart Data Construction
  const chartData = useMemo(() => {
    // Sort historical data chronologically
    const sorted = [...bodyMetrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const formattedHistory = sorted.map((bm) => {
      const d = new Date(bm.date);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: label,
        fullDate: bm.date,
        weightKg: Number(bm.weightKg.toFixed(1)),
        bodyFatPct: bm.bodyFatPct ? Number(bm.bodyFatPct.toFixed(1)) : undefined,
        isLive: false,
      };
    });

    // Append the dynamic Live Check-In point
    const livePoint = {
      date: 'Today (Live)',
      fullDate: new Date().toISOString().split('T')[0],
      weightKg: Number(Number(currentWeight || userProfile.weightKg).toFixed(1)),
      bodyFatPct: currentBodyFat ? Number(Number(currentBodyFat).toFixed(1)) : undefined,
      isLive: true,
    };

    return [...formattedHistory, livePoint];
  }, [bodyMetrics, currentWeight, currentBodyFat, userProfile.weightKg]);

  if (!isOpen) return null;

  // Previous recorded baseline (last logged point before today)
  const lastRecordedWeight = bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1].weightKg : userProfile.weightKg;
  const weightDelta = Number((parsedWeight - lastRecordedWeight).toFixed(1));
  const goalDistance = Number((parsedWeight - userProfile.targetWeightKg).toFixed(1));

  // Determine rate analysis
  const getRateVerdict = () => {
    if (userProfile.goal === 'lose_fat') {
      if (weightDelta <= -0.2 && weightDelta >= -1.0) {
        return { text: 'Optimal Fat Loss Pace (-0.5% to -1.0% BW/wk)', color: 'text-[#16A34A] bg-[#16A34A]/10 border-[#16A34A]/20' };
      } else if (weightDelta < -1.0) {
        return { text: 'Aggressive Fat Loss Pace (>1% BW/wk) • Watch Muscle Retention', color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20' };
      } else if (weightDelta > 0.2) {
        return { text: 'Weight Uptick • Fluid/Sodium or Energy Surplus', color: 'text-[#E8912D] bg-[#E8912D]/10 border-[#E8912D]/20' };
      }
      return { text: 'Maintenance / Recomposition Range', color: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' };
    } else if (userProfile.goal === 'build_muscle') {
      if (weightDelta >= 0.1 && weightDelta <= 0.4) {
        return { text: 'Optimal Lean Hypertrophy Pace (+0.25% to +0.5% BW/wk)', color: 'text-[#16A34A] bg-[#16A34A]/10 border-[#16A34A]/20' };
      } else if (weightDelta > 0.4) {
        return { text: 'Rapid Gain (>0.5% BW/wk) • Higher Fat Accumulation', color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20' };
      }
      return { text: 'Slow Gaining Pace • Small Calorie Bump Recommended', color: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' };
    }
    return { text: 'Body Recomposition Steady State', color: 'text-[#0F6E5F] bg-[#0F6E5F]/10 border-[#0F6E5F]/20' };
  };

  const rateVerdict = getRateVerdict();

  const minWeight = Math.min(...chartData.map(d => d.weightKg), userProfile.targetWeightKg) - 1.5;
  const maxWeight = Math.max(...chartData.map(d => d.weightKg), userProfile.targetWeightKg) + 1.5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Recalculate BMR and TDEE based on the new weight
    const newBMR = calculateBMR(userProfile.sex, parsedWeight, userProfile.heightCm, userProfile.age);
    const newTDEE = calculateTDEE(newBMR, userProfile.trainingDaysPerWeek);
    const newMacros = calculateMacros(newTDEE, userProfile.goal, userProfile.sex, parsedWeight, userProfile.dietType);

    const updatedProfile: UserProfile = {
      ...userProfile,
      weightKg: parsedWeight,
      bodyFatPct: parsedBodyFat ?? userProfile.bodyFatPct,
      bmr: newBMR,
      tdee: newTDEE,
      dailyCalories: newMacros.dailyCalories,
      dailyProtein: newMacros.proteinG,
      dailyCarbs: newMacros.carbsG,
      dailyFat: newMacros.fatG,
    };

    const newMetric: BodyMetric = {
      id: 'bm_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      weightKg: parsedWeight,
      bodyFatPct: parsedBodyFat,
      notes: `Weekly Check-In: ${notes || 'Target adjusted'} (Adherence: ${adherenceScore}/5)`,
    };

    setTimeout(() => {
      setIsProcessing(false);
      onCompleteCheckIn(updatedProfile, newMetric);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#161817] rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-[#E5E7EB] dark:border-[#242826] animate-in zoom-in-95 duration-200 text-left my-auto space-y-5 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#242826] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#2DD4BF] flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-[#1A1D1B] dark:text-[#E8ECE9]">
                Weekly Adaptive Check-In
              </h2>
              <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
                Live trajectory calibration powered by metabolic energy balance algorithms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAFAF8] dark:bg-[#1E2220] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#9CA3AF] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white flex items-center justify-center transition-all text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* REAL-TIME PROGRESS TREND CHART */}
        <div className="bg-[#FAFAF8] dark:bg-[#111312] p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#0F6E5F] dark:text-[#2DD4BF]" />
                  Live Progress Trend
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0F6E5F] text-white animate-pulse">
                  Updates in Real-Time
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
                Adjust the weight input below to see your real-time trajectory shift against your target goal ({userProfile.targetWeightKg} kg).
              </p>
            </div>

            {/* Toggle Metric */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#161817] p-1 rounded-lg border border-[#E5E7EB] dark:border-[#2A2E2C] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveChartMetric('weight')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  activeChartMetric === 'weight'
                    ? 'bg-[#0F6E5F] text-white'
                    : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white'
                }`}
              >
                Weight (kg)
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMetric('bodyFat')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  activeChartMetric === 'bodyFat'
                    ? 'bg-[#0F6E5F] text-white'
                    : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white'
                }`}
              >
                Body Fat %
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#2A2E2C]">
              <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] block">Live Weight</span>
              <span className="text-sm font-extrabold text-[#1A1D1B] dark:text-[#E8ECE9]">{currentWeight} kg</span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#2A2E2C]">
              <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] block">Weekly Delta</span>
              <span className={`text-sm font-extrabold flex items-center justify-center gap-0.5 ${
                weightDelta < 0 ? 'text-[#16A34A] dark:text-[#4ADE80]' : weightDelta > 0 ? 'text-[#E8912D]' : 'text-[#6B7280] dark:text-[#9EA8A2]'
              }`}>
                {weightDelta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : weightDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : null}
                {weightDelta >= 0 ? `+${weightDelta}` : weightDelta} kg
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#2A2E2C]">
              <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] block">To Target Goal</span>
              <span className="text-sm font-extrabold text-[#0F6E5F] dark:text-[#2DD4BF]">
                {goalDistance === 0 ? 'Goal Hit! 🎯' : `${Math.abs(goalDistance)} kg ${goalDistance > 0 ? 'to drop' : 'to gain'}`}
              </span>
            </div>
          </div>

          {/* Rate Analysis Pill */}
          <div className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${rateVerdict.color}`}>
            <Info className="w-4 h-4 shrink-0" />
            <span>{rateVerdict.text}</span>
          </div>

          {/* Chart Canvas */}
          <div className="h-44 sm:h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartMetric === 'weight' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="checkInWeightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F6E5F" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0F6E5F" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.4} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                    axisLine={{ stroke: '#4B5563', opacity: 0.4 }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[Math.floor(minWeight), Math.ceil(maxWeight)]} 
                    tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-xl bg-[#1A1D1B] text-white text-xs shadow-lg border border-white/10 space-y-1">
                            <div className="font-bold flex items-center gap-1">
                              <span>{data.date}</span>
                              {data.isLive && (
                                <span className="text-[9px] bg-[#0F6E5F] text-white px-1.5 py-0.2 rounded">Live Input</span>
                              )}
                            </div>
                            <div className="text-[#E8912D] font-extrabold">{data.weightKg} kg</div>
                            {data.bodyFatPct && (
                              <div className="text-[11px] text-[#9CA3AF]">Body Fat: {data.bodyFatPct}%</div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Target Goal Line */}
                  <ReferenceLine 
                    y={userProfile.targetWeightKg} 
                    stroke="#E8912D" 
                    strokeDasharray="4 4" 
                    label={{ 
                      value: `Target Goal: ${userProfile.targetWeightKg}kg`, 
                      position: 'top', 
                      fill: '#E8912D', 
                      fontSize: 10,
                      fontWeight: 'bold' 
                    }} 
                  />
                  <Area
                    type="monotone"
                    dataKey="weightKg"
                    stroke="#0F6E5F"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#checkInWeightGrad)"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (payload.isLive) {
                        return (
                          <g key={`dot-live`}>
                            <circle cx={cx} cy={cy} r={7} fill="#0F6E5F" opacity={0.3} className="animate-ping" />
                            <circle cx={cx} cy={cy} r={5} fill="#0F6E5F" stroke="#ffffff" strokeWidth={2} />
                          </g>
                        );
                      }
                      return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#0F6E5F" />;
                    }}
                  />
                </AreaChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="checkInBFGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.4} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                    axisLine={{ stroke: '#4B5563', opacity: 0.4 }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']} 
                    tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-xl bg-[#1A1D1B] text-white text-xs shadow-lg border border-white/10 space-y-1">
                            <div className="font-bold flex items-center gap-1">
                              <span>{data.date}</span>
                              {data.isLive && (
                                <span className="text-[9px] bg-[#3B82F6] text-white px-1.5 py-0.2 rounded">Live Input</span>
                              )}
                            </div>
                            <div className="text-[#3B82F6] font-extrabold">{data.bodyFatPct || '--'}% Body Fat</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bodyFatPct"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#checkInBFGrad)"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (payload.isLive) {
                        return (
                          <g key={`dot-bf-live`}>
                            <circle cx={cx} cy={cy} r={7} fill="#3B82F6" opacity={0.3} className="animate-ping" />
                            <circle cx={cx} cy={cy} r={5} fill="#3B82F6" stroke="#ffffff" strokeWidth={2} />
                          </g>
                        );
                      }
                      return <circle key={`dot-bf-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#3B82F6" />;
                    }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* INPUT FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#242826] hover:border-[#0F6E5F] dark:hover:border-[#2DD4BF] transition-all">
              <label className="block text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1 flex items-center justify-between">
                <span>Current Weight (kg)</span>
                <span className="text-[10px] text-[#0F6E5F] dark:text-[#2DD4BF] font-bold">Interactive</span>
              </label>
              <input
                type="number"
                step="0.1"
                min={30}
                max={250}
                value={currentWeight}
                onChange={(e) => handleNumChange(e.target.value, setCurrentWeight)}
                placeholder="e.g. 70.5"
                className="w-full text-base font-extrabold text-[#1A1D1B] dark:text-[#E8ECE9] p-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-[#FAFAF8] dark:bg-[#111312] focus:outline-none focus:ring-2 focus:ring-[#0F6E5F]"
                required
              />
              <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] mt-1 block">
                Previous: {lastRecordedWeight} kg ({weightDelta >= 0 ? `+${weightDelta}` : weightDelta} kg)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#242826] hover:border-[#0F6E5F] dark:hover:border-[#2DD4BF] transition-all">
              <label className="block text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1 flex items-center justify-between">
                <span>Body Fat % (Optional)</span>
                <span className="text-[10px] text-[#3B82F6] font-bold">Interactive</span>
              </label>
              <input
                type="number"
                step="0.1"
                min={3}
                max={60}
                value={currentBodyFat}
                onChange={(e) => handleNumChange(e.target.value, setCurrentBodyFat)}
                placeholder="e.g. 15.5"
                className="w-full text-base font-extrabold text-[#1A1D1B] dark:text-[#E8ECE9] p-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-[#FAFAF8] dark:bg-[#111312] focus:outline-none focus:ring-2 focus:ring-[#0F6E5F]"
              />
              <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] mt-1 block">
                Previous: {userProfile.bodyFatPct || 18}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
                Dietary Adherence
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    type="button"
                    key={score}
                    onClick={() => setAdherenceScore(score)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      adherenceScore === score
                        ? 'bg-[#0F6E5F] text-white border-[#0F6E5F]'
                        : 'bg-[#FAFAF8] dark:bg-[#111312] border-[#E5E7EB] dark:border-[#2A2E2C] text-[#6B7280] dark:text-[#9EA8A2]'
                    }`}
                  >
                    {score}★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
                Energy & Recovery
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    type="button"
                    key={score}
                    onClick={() => setEnergyLevel(score)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      energyLevel === score
                        ? 'bg-[#E8912D] text-white border-[#E8912D]'
                        : 'bg-[#FAFAF8] dark:bg-[#111312] border-[#E5E7EB] dark:border-[#2A2E2C] text-[#6B7280] dark:text-[#9EA8A2]'
                    }`}
                  >
                    {score}⚡
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
              Check-In Notes / Hunger / Satiety (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Hit all protein targets, strength increased on barbell bench press"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-[#FAFAF8] dark:bg-[#111312] text-[#1A1D1B] dark:text-[#E8ECE9]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB] dark:border-[#242826]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F6E5F] text-white text-xs font-bold hover:bg-[#0D5B4F] shadow-sm transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#E8912D]" />
                  <span>Recalibrating Metabolism...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E8912D]" />
                  <span>Confirm Check-In & Recalibrate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
