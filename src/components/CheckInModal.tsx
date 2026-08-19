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
  const [currentWeight, setCurrentWeight] = useState<number>(userProfile.weightKg);
  const [currentBodyFat, setCurrentBodyFat] = useState<number>(userProfile.bodyFatPct || 18);
  const [adherenceScore, setAdherenceScore] = useState<number>(4);
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [notes, setNotes] = useState<string>('');
  const [activeChartMetric, setActiveChartMetric] = useState<'weight' | 'bodyFat'>('weight');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
  const weightDelta = Number((currentWeight - lastRecordedWeight).toFixed(1));
  const goalDistance = Number((currentWeight - userProfile.targetWeightKg).toFixed(1));

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
    const newBMR = calculateBMR(userProfile.sex, currentWeight, userProfile.heightCm, userProfile.age);
    const newTDEE = calculateTDEE(newBMR, userProfile.trainingDaysPerWeek);
    const newMacros = calculateMacros(newTDEE, userProfile.goal, userProfile.sex, currentWeight, userProfile.dietType);

    const updatedProfile: UserProfile = {
      ...userProfile,
      weightKg: currentWeight,
      bodyFatPct: currentBodyFat,
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
      weightKg: currentWeight,
      bodyFatPct: currentBodyFat,
      notes: `Weekly Check-In: ${notes || 'Target adjusted'} (Adherence: ${adherenceScore}/5)`,
    };

    setTimeout(() => {
      setIsProcessing(false);
      onCompleteCheckIn(updatedProfile, newMetric);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-[#E5E7EB] animate-in zoom-in-95 duration-200 text-left my-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F6E5F]/10 text-[#0F6E5F] flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-[#1A1D1B]">
                Weekly Adaptive Check-In
              </h2>
              <p className="text-[11px] text-[#6B7280]">
                Live trajectory calibration powered by metabolic energy balance algorithms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAFAF8] border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#1A1D1B] flex items-center justify-center transition-all text-xs"
          >
            ✕
          </button>
        </div>

        {/* REAL-TIME PROGRESS TREND CHART */}
        <div className="bg-[#FAFAF8] p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A1D1B] uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#0F6E5F]" />
                  Live Progress Trend
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0F6E5F] text-white animate-pulse">
                  Updates in Real-Time
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                Adjust the weight input below to see your real-time trajectory shift against your target goal ({userProfile.targetWeightKg} kg).
              </p>
            </div>

            {/* Toggle Metric */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E5E7EB] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveChartMetric('weight')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  activeChartMetric === 'weight'
                    ? 'bg-[#0F6E5F] text-white'
                    : 'text-[#6B7280] hover:text-[#1A1D1B]'
                }`}
              >
                Weight (kg)
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMetric('bodyFat')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  activeChartMetric === 'bodyFat'
                    ? 'bg-[#0F6E5F] text-white'
                    : 'text-[#6B7280] hover:text-[#1A1D1B]'
                }`}
              >
                Body Fat %
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-white border border-[#E5E7EB]">
              <span className="text-[10px] text-[#6B7280] block">Live Weight</span>
              <span className="text-sm font-extrabold text-[#1A1D1B]">{currentWeight} kg</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E5E7EB]">
              <span className="text-[10px] text-[#6B7280] block">Weekly Delta</span>
              <span className={`text-sm font-extrabold flex items-center justify-center gap-0.5 ${
                weightDelta < 0 ? 'text-[#16A34A]' : weightDelta > 0 ? 'text-[#E8912D]' : 'text-[#6B7280]'
              }`}>
                {weightDelta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : weightDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : null}
                {weightDelta >= 0 ? `+${weightDelta}` : weightDelta} kg
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E5E7EB]">
              <span className="text-[10px] text-[#6B7280] block">To Target Goal</span>
              <span className="text-sm font-extrabold text-[#0F6E5F]">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: '#6B7280' }} 
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[Math.floor(minWeight), Math.ceil(maxWeight)]} 
                    tick={{ fontSize: 10, fill: '#6B7280' }} 
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: '#6B7280' }} 
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']} 
                    tick={{ fontSize: 10, fill: '#6B7280' }} 
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
            <div className="p-3 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#0F6E5F] transition-all">
              <label className="block text-xs font-bold text-[#1A1D1B] mb-1 flex items-center justify-between">
                <span>Current Weight (kg)</span>
                <span className="text-[10px] text-[#0F6E5F] font-bold">Interactive</span>
              </label>
              <input
                type="number"
                step="0.1"
                min={30}
                max={250}
                value={currentWeight}
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                className="w-full text-base font-extrabold text-[#1A1D1B] p-2 rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#0F6E5F]"
                required
              />
              <span className="text-[10px] text-[#6B7280] mt-1 block">
                Previous: {lastRecordedWeight} kg ({weightDelta >= 0 ? `+${weightDelta}` : weightDelta} kg)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#0F6E5F] transition-all">
              <label className="block text-xs font-bold text-[#1A1D1B] mb-1 flex items-center justify-between">
                <span>Body Fat % (Optional)</span>
                <span className="text-[10px] text-[#3B82F6] font-bold">Interactive</span>
              </label>
              <input
                type="number"
                step="0.1"
                min={3}
                max={60}
                value={currentBodyFat}
                onChange={(e) => setCurrentBodyFat(Number(e.target.value))}
                className="w-full text-base font-extrabold text-[#1A1D1B] p-2 rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#0F6E5F]"
              />
              <span className="text-[10px] text-[#6B7280] mt-1 block">
                Previous: {userProfile.bodyFatPct || 18}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">
                Dietary Adherence
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    type="button"
                    key={score}
                    onClick={() => setAdherenceScore(score)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      adherenceScore === score
                        ? 'bg-[#0F6E5F] text-white border-[#0F6E5F]'
                        : 'bg-[#FAFAF8] border-[#E5E7EB] text-[#6B7280]'
                    }`}
                  >
                    {score}★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">
                Energy & Recovery
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    type="button"
                    key={score}
                    onClick={() => setEnergyLevel(score)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      energyLevel === score
                        ? 'bg-[#E8912D] text-white border-[#E8912D]'
                        : 'bg-[#FAFAF8] border-[#E5E7EB] text-[#6B7280]'
                    }`}
                  >
                    {score}⚡
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">
              Check-In Notes / Hunger / Satiety (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Hit all protein targets, strength increased on barbell bench press"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAF8]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#6B7280] hover:text-[#1A1D1B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F6E5F] text-white text-xs font-bold hover:bg-[#0D5B4F] shadow-sm transition-all"
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
