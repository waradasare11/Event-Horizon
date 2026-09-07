import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  RefreshCw, 
  Scale, 
  Target, 
  Sparkles, 
  Dumbbell, 
  Utensils, 
  Flame, 
  X, 
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import { UserProfile, GoalType, DietType, EquipmentType } from '../types';
import { calculateBMR, calculateTDEE } from '../lib/calc/energy';
import { calculateMacros } from '../lib/calc/macros';

interface QuarterlyProfileCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

export const QuarterlyProfileCalibrationModal: React.FC<QuarterlyProfileCalibrationModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [weightKg, setWeightKg] = useState<number>(userProfile.weightKg || 70);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(userProfile.targetWeightKg || 68);
  const [goal, setGoal] = useState<GoalType>(userProfile.goal || 'recomp');
  const [dietType, setDietType] = useState<DietType>(userProfile.dietType || 'flexible');
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<number>(userProfile.trainingDaysPerWeek || 4);
  const [bodyFatPct, setBodyFatPct] = useState<number>(userProfile.bodyFatPct || 18);
  const [equipmentType, setEquipmentType] = useState<EquipmentType>(userProfile.equipmentType || 'full_gym');
  const [dailyStepTarget, setDailyStepTarget] = useState<number>(userProfile.dailyStepTarget || 8000);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeepAsIs = () => {
    const updated: UserProfile = {
      ...userProfile,
      lastProfileUpdateDate: new Date().toISOString(),
      lastQuarterlyReviewDate: new Date().toISOString(),
    };
    onSaveProfile(updated);
    setNotice('All existing athlete information confirmed and preserved perfectly!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSaveUpdated = () => {
    // Recalculate BMR, TDEE, Calories, and Macros based on any calibrated values
    const age = userProfile.age || 25;
    const sex = userProfile.sex || 'male';
    const heightCm = userProfile.heightCm || 175;

    const bmr = calculateBMR(sex, weightKg, heightCm, age);
    const tdee = calculateTDEE(bmr, trainingDaysPerWeek);
    const macros = calculateMacros(tdee, goal, sex, weightKg, dietType);
    const dailyCalories = macros.dailyCalories;

    const updated: UserProfile = {
      ...userProfile,
      weightKg,
      targetWeightKg,
      goal,
      dietType,
      trainingDaysPerWeek,
      bodyFatPct,
      equipmentType,
      dailyStepTarget,
      bmr,
      tdee,
      dailyCalories,
      dailyProtein: macros.proteinG,
      dailyCarbs: macros.carbsG,
      dailyFat: macros.fatG,
      lastProfileUpdateDate: new Date().toISOString(),
      lastQuarterlyReviewDate: new Date().toISOString(),
    };

    onSaveProfile(updated);
    setNotice('Calibration saved and synchronized across all storage layers!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#2A2E2C] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0F6E5F]/15 dark:bg-[#0F6E5F]/30 text-[#0F6E5F] dark:text-[#4ade80] flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  Quarterly Metabolic & Fitness Calibration
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#0F6E5F]/10 text-[#0F6E5F] dark:text-[#4ade80] font-semibold">
                  60-90 Day Review
                </span>
              </div>
              <p className="text-sm text-[#5A605B] dark:text-[#9CA3AF] mt-1">
                Your existing profile data is safely loaded below. Verify your current metrics or keep everything as is with 1 click.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notice && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {notice}
          </div>
        )}

        {/* Info callout */}
        <div className="mb-6 p-4 rounded-xl bg-[#F0FDF4] dark:bg-[#064e3b]/20 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#0F6E5F] mt-0.5" />
          <div>
            <strong>100% Data Preservation Guarantee:</strong> We never reset your logs or force you to re-enter your details. This check-in ensures your metabolic calculations stay aligned with your latest body composition.
          </div>
        </div>

        {/* Existing Profile Data Inputs */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A605B] dark:text-[#9CA3AF] mb-1.5">
                Current Body Weight (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E211F] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0F6E5F]"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-gray-400">kg</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A605B] dark:text-[#9CA3AF] mb-1.5">
                Target Body Weight (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E211F] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0F6E5F]"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-gray-400">kg</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A605B] dark:text-[#9CA3AF] mb-1.5">
                Primary Fitness Objective
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as GoalType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E211F] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0F6E5F]"
              >
                <option value="lose_fat">Fat Loss & Leanness</option>
                <option value="build_muscle">Muscle Hypertrophy</option>
                <option value="recomp">Body Recomposition</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A605B] dark:text-[#9CA3AF] mb-1.5">
                Workout Frequency (Days/Week)
              </label>
              <select
                value={trainingDaysPerWeek}
                onChange={(e) => setTrainingDaysPerWeek(parseInt(e.target.value) || 4)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E211F] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0F6E5F]"
              >
                <option value={2}>2 Days / Week</option>
                <option value={3}>3 Days / Week</option>
                <option value={4}>4 Days / Week</option>
                <option value={5}>5 Days / Week</option>
                <option value={6}>6 Days / Week</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A605B] dark:text-[#9CA3AF] mb-1.5">
                Estimated Body Fat %
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={bodyFatPct}
                  onChange={(e) => setBodyFatPct(parseFloat(e.target.value) || 18)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E211F] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0F6E5F]"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-gray-400">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A605B] dark:text-[#9CA3AF] mb-1.5">
                Daily Step Target
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="500"
                  value={dailyStepTarget}
                  onChange={(e) => setDailyStepTarget(parseInt(e.target.value) || 8000)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E211F] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0F6E5F]"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-gray-400">steps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={handleKeepAsIs}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Keep Existing Info As Is
          </button>

          <button
            type="button"
            onClick={handleSaveUpdated}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Save Calibrated Profile
          </button>
        </div>
      </div>
    </div>
  );
};
