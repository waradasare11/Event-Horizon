import React, { useState } from 'react';
import { Camera, Utensils, Sparkles, Lock } from 'lucide-react';
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
  isSubscriptionExpired?: boolean;
  onOpenPaywall?: () => void;
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
  isSubscriptionExpired = false,
  onOpenPaywall = () => {},
}) => {
  const [subTab, setSubTab] = useState<'scanner' | 'log'>(isSubscriptionExpired ? 'log' : 'scanner');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-Panel Navigation Control */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-2 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/60 w-full sm:w-auto">
          <button
            onClick={() => setSubTab('scanner')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              subTab === 'scanner'
                ? 'bg-white dark:bg-[#1A1D1B] text-[#3B82F6] dark:text-[#60A5FA] shadow-xs'
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
                ? 'bg-white dark:bg-[#1A1D1B] text-[#3B82F6] dark:text-[#60A5FA] shadow-xs'
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
        isSubscriptionExpired ? (
          <div className="max-w-xl mx-auto my-8 p-8 rounded-3xl bg-white dark:bg-[#111111] border border-amber-500/30 text-center space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Camera className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                Pro Scanner Feature
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                AI Meal Camera Scanner Locked
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
              Your 7-day free trial has expired. You can still view your nutrition history, today's logs, and add items manually. Upgrade to Pro to unlock instant camera plate scanning with Indian food database tables.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenPaywall}
                className="px-6 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md cursor-pointer transition-colors inline-flex items-center gap-2"
              >
                <span>Upgrade to Pro — ₹89/mo</span>
              </button>
            </div>
          </div>
        ) : (
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
        )
      ) : (
        <NutritionPlanner
          userProfile={userProfile}
          mealLogs={todayLogs}
          aiMealPlan={aiMealPlan}
          onUpdateAIMealPlan={onUpdateAIMealPlan}
          onSaveToMealLog={onSaveMealLog}
          isSubscriptionExpired={isSubscriptionExpired}
          onOpenPaywall={onOpenPaywall}
        />
      )}
    </div>
  );
};
