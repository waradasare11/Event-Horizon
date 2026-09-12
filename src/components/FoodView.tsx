import React, { useState } from 'react';
import { Camera, Utensils, Sparkles } from 'lucide-react';
import { UserProfile, MealLog, AIAdjustedMealPlan } from '../types';
import { MealCameraScanner } from './MealCameraScanner';
import { NutritionPlanner } from './NutritionPlanner';

interface FoodViewProps {
  userProfile: UserProfile;
  mealLogs: MealLog[];
  todayLogs: MealLog[];
  aiMealPlan: AIAdjustedMealPlan | null;
  onSaveMealLog: (meal: MealLog) => void;
  onDeleteMealLog: (id: string) => void;
  onBatchDeleteMealLogs: (ids: string[]) => void;
  onClearAllMealLogs: () => void;
  onUpdateAIMealPlan: (plan: AIAdjustedMealPlan) => void;
}

export const FoodView: React.FC<FoodViewProps> = ({
  userProfile,
  mealLogs,
  todayLogs,
  aiMealPlan,
  onSaveMealLog,
  onDeleteMealLog,
  onBatchDeleteMealLogs,
  onClearAllMealLogs,
  onUpdateAIMealPlan,
}) => {
  const [subTab, setSubTab] = useState<'scanner' | 'log'>('scanner');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-Panel Navigation Control */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-2 rounded-2xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/60 w-full sm:w-auto">
          <button
            onClick={() => setSubTab('scanner')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              subTab === 'scanner'
                ? 'bg-white dark:bg-[#1A1D1B] text-[#0F6E5F] dark:text-[#2DD4BF] shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>AI Camera Scanner</span>
          </button>

          <button
            onClick={() => setSubTab('log')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              subTab === 'log'
                ? 'bg-white dark:bg-[#1A1D1B] text-[#0F6E5F] dark:text-[#2DD4BF] shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Meals & Nutrition Planner</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 pr-2">
          <span>{todayLogs.length} meals logged today</span>
        </div>
      </div>

      {/* Render Sub-View */}
      {subTab === 'scanner' ? (
        <MealCameraScanner
          userProfile={userProfile}
          mealLogs={mealLogs}
          onSaveMealLog={(meal) => {
            onSaveMealLog(meal);
            // Optionally switch to log after saving or stay
          }}
          onDeleteMealLog={onDeleteMealLog}
          onBatchDeleteMealLogs={onBatchDeleteMealLogs}
          onClearAllMealLogs={onClearAllMealLogs}
        />
      ) : (
        <NutritionPlanner
          userProfile={userProfile}
          mealLogs={todayLogs}
          aiMealPlan={aiMealPlan}
          onUpdateAIMealPlan={onUpdateAIMealPlan}
          onSaveToMealLog={onSaveMealLog}
        />
      )}
    </div>
  );
};
