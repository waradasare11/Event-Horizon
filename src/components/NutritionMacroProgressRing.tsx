import React from 'react';
import { Flame, Dumbbell, Wheat, Droplet, CheckCircle2, TrendingUp } from 'lucide-react';
import { UserProfile, MealLog } from '../types';

interface NutritionMacroProgressRingProps {
  userProfile: UserProfile;
  mealLogs: MealLog[];
}

export const NutritionMacroProgressRing: React.FC<NutritionMacroProgressRingProps> = ({
  userProfile,
  mealLogs,
}) => {
  const totalCalories = mealLogs.reduce((sum, m) => sum + m.calories, 0);
  const totalProteinG = Number(mealLogs.reduce((sum, m) => sum + m.proteinG, 0).toFixed(1));
  const totalCarbsG = Number(mealLogs.reduce((sum, m) => sum + m.carbsG, 0).toFixed(1));
  const totalFatG = Number(mealLogs.reduce((sum, m) => sum + m.fatG, 0).toFixed(1));

  const targetCalories = userProfile.dailyCalories || 2200;
  const targetProtein = userProfile.dailyProtein || 140;
  const targetCarbs = userProfile.dailyCarbs || 200;
  const targetFat = userProfile.dailyFat || 60;

  const calPct = Math.min(100, Math.round((totalCalories / targetCalories) * 100));
  const proteinPct = Math.min(100, Math.round((totalProteinG / targetProtein) * 100));
  const carbsPct = Math.min(100, Math.round((totalCarbsG / targetCarbs) * 100));
  const fatPct = Math.min(100, Math.round((totalFatG / targetFat) * 100));

  const overallAvgPct = Math.round((calPct + proteinPct + carbsPct + fatPct) / 4);

  // SVG Concentric Ring Dimensions
  const size = 200;
  const center = size / 2;
  const strokeWidth = 10;
  const gap = 3;

  // Radii for 4 rings
  const rCalories = 84;
  const rProtein = 70;
  const rCarbs = 56;
  const rFat = 42;

  const getCircumference = (r: number) => 2 * Math.PI * r;
  const getOffset = (r: number, pct: number) => {
    const c = getCircumference(r);
    return c - (pct / 100) * c;
  };

  return (
    <div className="bg-white dark:bg-[#161817] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] dark:border-[#242826] pb-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live Macro Ring
            </span>
            <h3 className="font-bold text-base text-[#1A1D1B] dark:text-[#E8ECE9]">
              Daily Nutritional Goal Achievement Rings
            </h3>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
            Concentric real-time visual progress showing percentage fulfillment for Calories, Protein, Carbs, and Fats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Completion:</span>
          <span className="px-3 py-1 rounded-xl bg-[#0F6E5F] text-white text-xs font-black shadow-2xs">
            {overallAvgPct}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Concentric Progress Ring SVG */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-[200px] h-[200px] flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background Tracks */}
              <circle
                cx={center}
                cy={center}
                r={rCalories}
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
                fill="transparent"
                className="dark:stroke-[#242826]"
              />
              <circle
                cx={center}
                cy={center}
                r={rProtein}
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
                fill="transparent"
                className="dark:stroke-[#242826]"
              />
              <circle
                cx={center}
                cy={center}
                r={rCarbs}
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
                fill="transparent"
                className="dark:stroke-[#242826]"
              />
              <circle
                cx={center}
                cy={center}
                r={rFat}
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
                fill="transparent"
                className="dark:stroke-[#242826]"
              />

              {/* Foreground Animated Rings */}
              {/* 1. Calories (Orange) */}
              <circle
                cx={center}
                cy={center}
                r={rCalories}
                stroke="#F97316"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={getCircumference(rCalories)}
                strokeDashoffset={getOffset(rCalories, calPct)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />

              {/* 2. Protein (Emerald) */}
              <circle
                cx={center}
                cy={center}
                r={rProtein}
                stroke="#10B981"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={getCircumference(rProtein)}
                strokeDashoffset={getOffset(rProtein, proteinPct)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />

              {/* 3. Carbs (Cyan / Blue) */}
              <circle
                cx={center}
                cy={center}
                r={rCarbs}
                stroke="#06B6D4"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={getCircumference(rCarbs)}
                strokeDashoffset={getOffset(rCarbs, carbsPct)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />

              {/* 4. Fats (Amber) */}
              <circle
                cx={center}
                cy={center}
                r={rFat}
                stroke="#F59E0B"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={getCircumference(rFat)}
                strokeDashoffset={getOffset(rFat, fatPct)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Ring Text */}
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black text-[#1A1D1B] dark:text-[#E8ECE9]">
                {overallAvgPct}%
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                Goal Score
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mt-3 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Cals
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Protein
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /> Carbs
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Fats
            </span>
          </div>
        </div>

        {/* Macro Details Grid */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Calories Card */}
          <div className="p-3.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Calories</span>
              </span>
              <span className="font-black text-orange-700 dark:text-orange-400 text-xs">
                {calPct}%
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-black text-base text-gray-900 dark:text-white">
                {totalCalories} <span className="text-[11px] font-normal text-gray-500">/ {targetCalories} kcal</span>
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {Math.max(0, targetCalories - totalCalories)} kcal left
              </span>
            </div>
          </div>

          {/* Protein Card */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                <span>Protein</span>
              </span>
              <span className="font-black text-emerald-700 dark:text-emerald-400 text-xs">
                {proteinPct}%
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-black text-base text-gray-900 dark:text-white">
                {totalProteinG}g <span className="text-[11px] font-normal text-gray-500">/ {targetProtein}g</span>
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {Math.max(0, targetProtein - totalProteinG).toFixed(0)}g left
              </span>
            </div>
          </div>

          {/* Carbs Card */}
          <div className="p-3.5 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/50">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                <Wheat className="w-4 h-4 text-cyan-600" />
                <span>Carbohydrates</span>
              </span>
              <span className="font-black text-cyan-700 dark:text-cyan-400 text-xs">
                {carbsPct}%
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-black text-base text-gray-900 dark:text-white">
                {totalCarbsG}g <span className="text-[11px] font-normal text-gray-500">/ {targetCarbs}g</span>
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {Math.max(0, targetCarbs - totalCarbsG).toFixed(0)}g left
              </span>
            </div>
          </div>

          {/* Fats Card */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-amber-600" />
                <span>Essential Fats</span>
              </span>
              <span className="font-black text-amber-700 dark:text-amber-400 text-xs">
                {fatPct}%
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-black text-base text-gray-900 dark:text-white">
                {totalFatG}g <span className="text-[11px] font-normal text-gray-500">/ {targetFat}g</span>
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {Math.max(0, targetFat - totalFatG).toFixed(0)}g left
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
