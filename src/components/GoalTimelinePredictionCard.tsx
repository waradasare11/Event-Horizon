import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  Flame, 
  Target, 
  BookOpen, 
  ShieldCheck, 
  Activity,
  Award,
  Zap,
  Info,
  Sliders,
  BarChart3,
  Check,
  Layers
} from 'lucide-react';
import { GoalTimelinePredictionResult, UserProfile } from '../types';
import { AnimatedGoalDate } from './AnimatedGoalDate';
import { fireCelebrationConfetti } from '../lib/confetti';

interface GoalTimelinePredictionCardProps {
  prediction: GoalTimelinePredictionResult;
  userProfile: Partial<UserProfile>;
  onAcceptPlan?: () => void;
  showActionButton?: boolean;
}

export const GoalTimelinePredictionCard: React.FC<GoalTimelinePredictionCardProps> = ({
  prediction,
  userProfile,
  onAcceptPlan,
  showActionButton = false,
}) => {
  const isLosing = (userProfile.weightKg || 70) > (userProfile.targetWeightKg || 65);
  const diffKg = Math.abs((userProfile.weightKg || 70) - (userProfile.targetWeightKg || 65));

  // Visual Confidence Interval toggle
  const [showConfidenceInterval, setShowConfidenceInterval] = useState<boolean>(true);

  // Compliance Rate simulator state (70% to 100%)
  const [complianceRate, setComplianceRate] = useState<number>(90);

  // Compute confidence interval bounds
  const baseDays = Math.max(14, prediction.totalDaysRequired || 60);
  
  // Calculate adjusted days based on simulated compliance
  const simulatedDays = Math.round(baseDays * (1 + (100 - complianceRate) * 0.012));
  const simulatedWeeks = Math.max(2, Math.round(simulatedDays / 7));
  
  const now = new Date();
  const simulatedTargetDate = new Date(now.getTime() + simulatedDays * 24 * 60 * 60 * 1000);
  
  // 80% to 95% compliance range calculations
  const fastDays95 = Math.round(baseDays * 0.92);
  const slowDays80 = Math.round(baseDays * 1.18);
  const range95Date = new Date(now.getTime() + fastDays95 * 24 * 60 * 60 * 1000);
  const baselineDate = new Date(now.getTime() + baseDays * 24 * 60 * 60 * 1000);
  const range80Date = new Date(now.getTime() + slowDays80 * 24 * 60 * 60 * 1000);

  const bestCaseDate = new Date(now.getTime() + Math.round(baseDays * 0.9) * 24 * 60 * 60 * 1000);
  const expectedDate = new Date(now.getTime() + baseDays * 24 * 60 * 60 * 1000);
  const conservativeDate = new Date(now.getTime() + Math.round(baseDays * 1.25) * 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleCommit = () => {
    fireCelebrationConfetti();
    if (onAcceptPlan) {
      onAcceptPlan();
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#111111] border border-[#3B82F6]/30 dark:border-[#3B82F6]/40 shadow-xl overflow-hidden text-left space-y-0 transition-colors">
      {/* Top Banner with Smooth Animated Date Count-Up */}
      <div className="bg-gradient-to-r from-[#3B82F6] via-[#1D4ED8] to-[#083D34] p-6 sm:p-7 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-[#60A5FA] border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>AI Evidence-Grounded Physiological Forecast</span>
            </div>

            {/* Visual Toggle for Confidence Interval */}
            <button
              type="button"
              onClick={() => setShowConfidenceInterval(!showConfidenceInterval)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer border border-white/30"
              title="Toggle Confidence Interval range overlay"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Confidence Interval: {showConfidenceInterval ? 'ON (80-95%)' : 'OFF'}</span>
            </button>
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-[#F4EBD0] uppercase tracking-wider">
            Predicted Target Milestone Date:
          </h3>

          <AnimatedGoalDate
            targetDateStr={formatDate(simulatedTargetDate)}
            totalDays={simulatedDays}
            totalWeeks={simulatedWeeks}
          />

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#F4EBD0]/90 border-t border-white/10">
            <span className="flex items-center gap-1 font-semibold">
              <Flame className="w-4 h-4 text-amber-300" />
              <span>{prediction.weeklyRateKg.toFixed(2)} kg / week</span> optimal physiological adaptation pace
            </span>
            <span className="bg-white/10 px-2.5 py-0.5 rounded-full font-mono text-[11px] text-amber-200">
              Confidence Adherence: {complianceRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 sm:p-7 space-y-6">
        
        {/* SHADED CONFIDENCE INTERVAL RANGE VISUALIZER (80-95% COMPLIANCE) */}
        {showConfidenceInterval && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#3B82F6]/10 via-[#3B82F6]/5 to-[#60A5FA]/10 border-2 border-[#3B82F6]/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="text-xs font-black uppercase tracking-wider text-[#3B82F6] dark:text-[#60A5FA] flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Physiological Confidence Interval (80%–95% Compliance Zone)</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Real-world variance range accounting for daily schedule flexibility, sleep quality, and spontaneous physical activity.
                </p>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-[#3B82F6]/20 text-[#8E701C] dark:text-[#60A5FA] text-[11px] font-mono font-bold shrink-0">
                ±{Math.round((slowDays80 - fastDays95) / 2)} Days Variance Band
              </div>
            </div>

            {/* Shaded Visual Timeline Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111111] border border-[#3B82F6]/20 space-y-3">
              <div className="flex justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400">
                <span>95% High Adherence (Fastest)</span>
                <span className="font-bold text-[#1D4ED8] dark:text-[#60A5FA]">Projected Target</span>
                <span>80% Flexible Adherence</span>
              </div>

              {/* Shaded Interval Track */}
              <div className="relative w-full h-8 bg-gray-100 dark:bg-[#252826] rounded-xl overflow-hidden flex items-center">
                {/* Shaded 80-95% Compliance Range Area */}
                <div 
                  className="absolute left-[15%] right-[15%] h-full bg-gradient-to-r from-[#3B82F6]/30 via-[#3B82F6]/40 to-amber-500/30 border-y border-dashed border-[#3B82F6]/50 flex items-center justify-center text-[10px] font-black text-[#8E701C] dark:text-[#60A5FA] tracking-wider uppercase"
                >
                  <span className="hidden sm:inline">Shaded Confidence Interval (80%–95%)</span>
                </div>

                {/* Left boundary pin (95% adherence) */}
                <div className="absolute left-[15%] top-0 bottom-0 w-1 bg-[#3B82F6] z-10" />
                
                {/* Middle target pin (baseline) */}
                <div className="absolute left-[50%] top-0 bottom-0 w-1.5 bg-[#3B82F6] dark:bg-[#60A5FA] z-20 shadow-xs" />

                {/* Right boundary pin (80% adherence) */}
                <div className="absolute right-[15%] top-0 bottom-0 w-1 bg-amber-500 z-10" />
              </div>

              {/* Range Dates Display */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20">
                  <div className="text-[10px] text-[#1D4ED8] dark:text-[#60A5FA] font-bold uppercase">95% Compliance</div>
                  <div className="font-extrabold text-gray-900 dark:text-white text-xs">{formatDate(range95Date)}</div>
                  <div className="text-[10px] text-gray-500">~{fastDays95} Days</div>
                </div>

                <div className="p-2 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 ring-1 ring-[#3B82F6]/30">
                  <div className="text-[10px] text-[#3B82F6] dark:text-[#60A5FA] font-black uppercase">Projected Baseline</div>
                  <div className="font-extrabold text-gray-900 dark:text-white text-xs">{formatDate(baselineDate)}</div>
                  <div className="text-[10px] text-gray-500">~{baseDays} Days</div>
                </div>

                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase">80% Compliance</div>
                  <div className="font-extrabold text-gray-900 dark:text-white text-xs">{formatDate(range80Date)}</div>
                  <div className="text-[10px] text-gray-500">~{slowDays80} Days</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPLIANCE RATE SENSITIVITY SIMULATOR */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#3B82F6]/5 via-[#3B82F6]/5 to-[#60A5FA]/5 border border-[#3B82F6]/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="text-xs font-black uppercase tracking-wider text-[#3B82F6] dark:text-[#60A5FA] flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                <span>Interactive Adherence Sensitivity Slider</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Adjust your simulated adherence rate to see exact milestone date variation under real-world conditions.
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setComplianceRate(100)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                  complianceRate === 100
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-gray-100 dark:bg-[#1F2220] text-gray-700 dark:text-gray-300'
                }`}
              >
                100% Peak
              </button>
              <button
                type="button"
                onClick={() => setComplianceRate(88)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                  complianceRate === 88
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-gray-100 dark:bg-[#1F2220] text-gray-700 dark:text-gray-300'
                }`}
              >
                88% High
              </button>
              <button
                type="button"
                onClick={() => setComplianceRate(75)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                  complianceRate === 75
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-gray-100 dark:bg-[#1F2220] text-gray-700 dark:text-gray-300'
                }`}
              >
                75% Flexible
              </button>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
              <span>Simulated Diet & Training Adherence:</span>
              <span className="text-[#3B82F6] dark:text-[#60A5FA] font-mono text-sm">{complianceRate}%</span>
            </div>
            <input
              type="range"
              min={65}
              max={100}
              step={1}
              value={complianceRate}
              onChange={(e) => setComplianceRate(Number(e.target.value))}
              className="w-full accent-[#3B82F6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-mono">
              <span>65% (High Social/Travel Variance)</span>
              <span>85% (Optimal Consistency)</span>
              <span>100% (Strict Athlete Protocol)</span>
            </div>
          </div>

          {/* 3-Tier Confidence Range Interval Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
              complianceRate >= 95 
                ? 'bg-[#3B82F6]/15 border-[#3B82F6]/40 ring-2 ring-[#3B82F6]/30' 
                : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#1D4ED8] dark:text-[#60A5FA]">
                  Best Case (95-100%)
                </span>
                {complianceRate >= 95 && <Check className="w-3 h-3 text-[#3B82F6]" />}
              </div>
              <div className="text-sm font-extrabold text-gray-900 dark:text-white">
                {formatDate(bestCaseDate)}
              </div>
              <div className="text-[10px] text-gray-500">
                ~{Math.round(baseDays * 0.9)} Days • Zero missed sessions
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
              complianceRate >= 80 && complianceRate < 95
                ? 'bg-[#3B82F6]/15 border-[#3B82F6]/40 ring-2 ring-[#3B82F6]/30' 
                : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#1D4ED8] dark:text-[#60A5FA]">
                  Target Expected (85-90%)
                </span>
                {complianceRate >= 80 && complianceRate < 95 && <Check className="w-3 h-3 text-[#3B82F6]" />}
              </div>
              <div className="text-sm font-extrabold text-gray-900 dark:text-white">
                {formatDate(expectedDate)}
              </div>
              <div className="text-[10px] text-gray-500">
                ~{baseDays} Days • Realistic high adherence
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
              complianceRate < 80
                ? 'bg-amber-500/15 border-amber-500/40 ring-2 ring-amber-500/30' 
                : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                  Conservative (70-75%)
                </span>
                {complianceRate < 80 && <Check className="w-3 h-3 text-amber-500" />}
              </div>
              <div className="text-sm font-extrabold text-gray-900 dark:text-white">
                {formatDate(conservativeDate)}
              </div>
              <div className="text-[10px] text-gray-500">
                ~{Math.round(baseDays * 1.25)} Days • Buffer for travel & plateaus
              </div>
            </div>
          </div>

          {/* Variable Sensitivity Factors Breakdown */}
          <div className="p-3 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
            <div className="font-bold text-gray-900 dark:text-white text-[11px] uppercase tracking-wider">
              Sensitivity Drivers Impacting Your Completion Horizon:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-gray-400">Caloric Deficit:</span>
                <strong className="block text-[#1D4ED8] dark:text-[#60A5FA]">±12 Days Variance</strong>
              </div>
              <div>
                <span className="text-gray-400">Sleep (7.5h+):</span>
                <strong className="block text-blue-600 dark:text-blue-400">±8 Days Variance</strong>
              </div>
              <div>
                <span className="text-gray-400">NEAT Steps (8k+):</span>
                <strong className="block text-[#1D4ED8] dark:text-[#60A5FA]">±7 Days Variance</strong>
              </div>
              <div>
                <span className="text-gray-400">Lifting Progression:</span>
                <strong className="block text-amber-600 dark:text-amber-400">±9 Days Variance</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Core Calculated Macro & Energy Targets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1C1F1D] border border-gray-200 dark:border-gray-800 text-center space-y-1">
            <div className="text-[11px] font-bold text-gray-500 uppercase">Daily Calorie Target</div>
            <div className="text-lg font-black text-[#3B82F6] dark:text-[#60A5FA]">
              {prediction.dailyCalorieTarget} kcal
            </div>
            <div className="text-[10px] text-gray-400">
              TDEE: {prediction.metabolicBreakdown.tdee} kcal
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1C1F1D] border border-gray-200 dark:border-gray-800 text-center space-y-1">
            <div className="text-[11px] font-bold text-gray-500 uppercase">Daily Protein Target</div>
            <div className="text-lg font-black text-[#E8912D]">
              {prediction.dailyProteinGrams}g
            </div>
            <div className="text-[10px] text-gray-400">
              {((prediction.dailyProteinGrams / (userProfile.weightKg || 70))).toFixed(1)}g / kg bodyweight
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1C1F1D] border border-gray-200 dark:border-gray-800 text-center space-y-1">
            <div className="text-[11px] font-bold text-gray-500 uppercase">Carbs & Fat Balance</div>
            <div className="text-lg font-black text-gray-800 dark:text-gray-200">
              {prediction.dailyCarbsGrams}g C / {prediction.dailyFatGrams}g F
            </div>
            <div className="text-[10px] text-gray-400">
              Optimal Glycogen & Hormones
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1C1F1D] border border-gray-200 dark:border-gray-800 text-center space-y-1">
            <div className="text-[11px] font-bold text-gray-500 uppercase">Hydration Target</div>
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">
              {prediction.hydrationLiters} L / day
            </div>
            <div className="text-[10px] text-gray-400">
              Electrolyte & Cellular Osmosis
            </div>
          </div>
        </div>

        {/* Scientific Evidence & Metabolic Adaptation */}
        <div className="p-4 rounded-2xl bg-[#3B82F6]/5 dark:bg-[#3B82F6]/15 border border-[#3B82F6]/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Physiological Grounding & Metabolic Model</span>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            {prediction.scientificEvidence?.basis || prediction.metabolicBreakdown?.energyBalanceModel}
          </p>
          {prediction.scientificEvidence?.citedPrinciples && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {prediction.scientificEvidence.citedPrinciples.map((principle, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-white dark:bg-[#070707] border border-[#3B82F6]/20 text-[10px] font-bold text-[#3B82F6] dark:text-[#60A5FA]"
                >
                  ✓ {principle}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Step-by-Step Milestones Roadmap */}
        {prediction.milestones && prediction.milestones.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />
              <span>Step-by-Step Physiological Milestones Roadmap</span>
            </div>

            <div className="space-y-2.5">
              {prediction.milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1C1F1D] border border-gray-200 dark:border-gray-800 flex items-start gap-3 transition-all hover:border-[#3B82F6]/50"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] font-black text-xs flex items-center justify-center shrink-0">
                    W{m.weekNumber}
                  </div>

                  <div className="space-y-1 flex-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-gray-900 dark:text-white">
                        {m.milestoneTitle}
                      </span>
                      <span className="text-[11px] font-mono text-[#1D4ED8] dark:text-[#60A5FA] font-bold">
                        Target: {m.projectedWeightKg} kg
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400">
                      {m.description}
                    </p>

                    <div className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                      Biochemical Phase: {m.physiologicalAdaptation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recovery & Injury Prevention Guidance */}
        {prediction.recoveryGuidance && (
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
            <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Recovery & Longevity Prescription</span>
            </div>
            <div className="text-gray-600 dark:text-gray-300 space-y-1">
              <div>
                • Optimal Sleep Target: <strong>{prediction.recoveryGuidance.sleepTargetHours} hours / night</strong> (Deep slow-wave growth hormone release).
              </div>
              <div>
                • Scheduled Deload Frequency: <strong>Every {prediction.recoveryGuidance.deloadFrequencyWeeks} weeks</strong> to reset central nervous system fatigue.
              </div>
              {prediction.recoveryGuidance.injuryPreventionTips && prediction.recoveryGuidance.injuryPreventionTips.length > 0 && (
                <div>
                  • Safegaurd Focus: {prediction.recoveryGuidance.injuryPreventionTips.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {showActionButton && onAcceptPlan && (
          <button
            onClick={handleCommit}
            className="w-full py-3.5 rounded-2xl bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-black text-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Lock In Goal Date & Proceed to Plan Selection</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

