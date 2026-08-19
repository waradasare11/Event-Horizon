import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  Clock, 
  ChevronRight, 
  Check, 
  ChefHat, 
  ShieldAlert, 
  Scale, 
  Lightbulb,
  Utensils,
  BookOpen,
  ShoppingCart
} from 'lucide-react';
import { UserProfile, MealLog, AIAdjustedMealPlan } from '../types';
import { CustomRecipeGenerator } from './CustomRecipeGenerator';
import { MicroNutrientTracker } from './MicroNutrientTracker';
import { SmartShoppingListView } from './SmartShoppingListView';

interface NutritionPlannerProps {
  userProfile: UserProfile;
  mealLogs: MealLog[];
  aiMealPlan: AIAdjustedMealPlan | null;
  onUpdateAIMealPlan: (plan: AIAdjustedMealPlan) => void;
  onSaveToMealLog: (log: MealLog) => void;
}

export const NutritionPlanner: React.FC<NutritionPlannerProps> = ({
  userProfile,
  mealLogs,
  aiMealPlan,
  onUpdateAIMealPlan,
  onSaveToMealLog,
}) => {
  const [plannerSubView, setPlannerSubView] = useState<'recipe_gen' | 'daily_blueprint' | 'smart_grocery'>('smart_grocery');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('High-Protein Global & Mediterranean');
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Recalculate meal structure based on latest body composition and goal');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Daily totals consumed today
  const totalCaloriesToday = mealLogs.reduce((sum, m) => sum + m.calories, 0);
  const totalProteinToday = mealLogs.reduce((sum, m) => sum + m.proteinG, 0);
  const totalCarbsToday = mealLogs.reduce((sum, m) => sum + m.carbsG, 0);
  const totalFatToday = mealLogs.reduce((sum, m) => sum + m.fatG, 0);

  const remainingCalories = Math.max(0, userProfile.dailyCalories - totalCaloriesToday);
  const remainingProtein = Math.max(0, userProfile.dailyProtein - totalProteinToday);
  const remainingCarbs = Math.max(0, (userProfile.dailyCarbs || 200) - totalCarbsToday);
  const remainingFat = Math.max(0, (userProfile.dailyFat || 60) - totalFatToday);

  const handleGenerateAIMealPlan = async () => {
    try {
      setIsGeneratingPlan(true);
      setErrorMessage(null);

      const res = await fetch('/api/ai/adjust-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: {
            ...userProfile,
            cuisinePreference: selectedCuisine,
          },
          recentLogs: {
            totalCaloriesLoggedToday: totalCaloriesToday,
            totalProteinLoggedToday: totalProteinToday,
            numberOfMealsToday: mealLogs.length,
          },
          reason: adjustmentReason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'Failed to generate plan');
      }

      onUpdateAIMealPlan({
        ...data.data,
        generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
    } catch (err: any) {
      console.error('Error generating AI meal plan:', err);
      setErrorMessage(err.message || 'Failed to generate plan. Please try again.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left">
      {/* Top Banner with Targets & Sub-view toggle */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0F6E5F]/10 text-[#0F6E5F]">
              Deterministic Energy Engine
            </span>
            <span className="text-xs text-[#6B7280]">Mifflin-St Jeor + ISSN Standards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1D1B] mt-2">
            AI Nutrition & Macro-Friendly Recipe Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1 max-w-2xl">
            Calculated from your BMR ({userProfile.bmr} kcal) and TDEE ({userProfile.tdee} kcal). Use the AI Chef to generate individual custom recipes or generate a full 1-day blueprint.
          </p>
        </div>

        {/* View Switcher Chips */}
        <div className="flex flex-wrap items-center gap-2 bg-[#FAFAF8] p-1.5 rounded-xl border border-[#E5E7EB] shrink-0">
          <button
            onClick={() => setPlannerSubView('smart_grocery')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              plannerSubView === 'smart_grocery'
                ? 'bg-[#0F6E5F] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1A1D1B]'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Smart Shopping List</span>
          </button>
          <button
            onClick={() => setPlannerSubView('daily_blueprint')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              plannerSubView === 'daily_blueprint'
                ? 'bg-[#0F6E5F] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1A1D1B]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1-Day Plan Blueprint</span>
          </button>
          <button
            onClick={() => setPlannerSubView('recipe_gen')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              plannerSubView === 'recipe_gen'
                ? 'bg-[#0F6E5F] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1A1D1B]'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Custom Recipe Generator</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Daily Target vs Consumed Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <Flame className="w-4 h-4 text-[#E8912D]" />
              <span>Daily Calories</span>
            </div>
            <span className="text-xs font-bold text-[#0F6E5F]">
              {userProfile.dailyCalories} kcal target
            </span>
          </div>
          <div className="text-2xl font-bold text-[#1A1D1B] mt-2">
            {totalCaloriesToday} <span className="text-xs font-normal text-[#6B7280]">kcal eaten</span>
          </div>
          <div className="w-full bg-[#F3F4F6] rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-[#0F6E5F] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalCaloriesToday / userProfile.dailyCalories) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#6B7280] mt-1.5">
            <span>Remaining Budget</span>
            <span className="font-semibold text-[#1A1D1B]">{remainingCalories} kcal</span>
          </div>
        </div>

        {/* Protein */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#0F6E5F]">
              <Dumbbell className="w-4 h-4 text-[#0F6E5F]" />
              <span>Protein Target</span>
            </div>
            <span className="text-xs font-bold text-[#0F6E5F]">
              {userProfile.dailyProtein}g target
            </span>
          </div>
          <div className="text-2xl font-bold text-[#1A1D1B] mt-2">
            {totalProteinToday.toFixed(0)} <span className="text-xs font-normal text-[#6B7280]">g eaten</span>
          </div>
          <div className="w-full bg-[#F3F4F6] rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-[#E8912D] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalProteinToday / userProfile.dailyProtein) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#6B7280] mt-1.5">
            <span>Remaining Budget</span>
            <span className="font-semibold text-[#1A1D1B]">{remainingProtein.toFixed(0)}g</span>
          </div>
        </div>

        {/* Carbohydrates */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#3B82F6]">
              <Wheat className="w-4 h-4 text-[#3B82F6]" />
              <span>Carbohydrates</span>
            </div>
            <span className="text-xs font-bold text-[#3B82F6]">
              {userProfile.dailyCarbs}g target
            </span>
          </div>
          <div className="text-2xl font-bold text-[#1A1D1B] mt-2">
            {totalCarbsToday.toFixed(0)} <span className="text-xs font-normal text-[#6B7280]">g eaten</span>
          </div>
          <div className="w-full bg-[#F3F4F6] rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-[#3B82F6] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalCarbsToday / (userProfile.dailyCarbs || 200)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#6B7280] mt-1.5">
            <span>Remaining Budget</span>
            <span className="font-semibold text-[#1A1D1B]">{remainingCarbs.toFixed(0)}g</span>
          </div>
        </div>

        {/* Fats */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#F59E0B]">
              <Droplet className="w-4 h-4 text-[#F59E0B]" />
              <span>Essential Fats</span>
            </div>
            <span className="text-xs font-bold text-[#F59E0B]">
              {userProfile.dailyFat}g target
            </span>
          </div>
          <div className="text-2xl font-bold text-[#1A1D1B] mt-2">
            {totalFatToday.toFixed(0)} <span className="text-xs font-normal text-[#6B7280]">g eaten</span>
          </div>
          <div className="w-full bg-[#F3F4F6] rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-[#F59E0B] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalFatToday / (userProfile.dailyFat || 60)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#6B7280] mt-1.5">
            <span>Remaining Budget</span>
            <span className="font-semibold text-[#1A1D1B]">{remainingFat.toFixed(0)}g</span>
          </div>
        </div>
      </div>

      {/* Micro-Nutrient Dashboard & Daily Threshold Warning System */}
      <MicroNutrientTracker
        userProfile={userProfile}
        mealLogs={mealLogs}
        onSaveToMealLog={onSaveToMealLog}
      />

      {/* SUBVIEW 1: SMART SHOPPING LIST */}
      {plannerSubView === 'smart_grocery' && (
        <SmartShoppingListView
          userProfile={userProfile}
          aiMealPlan={aiMealPlan}
          onNavigateToBlueprint={() => setPlannerSubView('daily_blueprint')}
        />
      )}

      {/* SUBVIEW 2: AI CUSTOM RECIPE GENERATOR */}
      {plannerSubView === 'recipe_gen' && (
        <CustomRecipeGenerator
          userProfile={userProfile}
          remainingCalories={remainingCalories}
          remainingProtein={remainingProtein}
          onSaveToMealLog={onSaveToMealLog}
        />
      )}

      {/* SUBVIEW 3: 1-DAY BLUEPRINT SECTION */}
      {plannerSubView === 'daily_blueprint' && (
        <div className="bg-white dark:bg-[#1A1D1C] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#242826] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E8912D]" />
                <h2 className="text-lg sm:text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  {aiMealPlan?.planName || 'Personalized Body-Comp Adaptive Meal Plan'}
                </h2>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
                {aiMealPlan
                  ? `Generated on ${aiMealPlan.generatedAt} • Custom tailored to ${userProfile.weightKg}kg with ${userProfile.bodyFatPct || 18}% body fat`
                  : 'Click "Recalculate AI Plan" below to generate a tailored 1-day meal breakdown.'}
              </p>
            </div>

            {/* Cuisine Filter & Action */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setPlannerSubView('smart_grocery')}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#242826] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#1A1D1B] dark:text-[#E8ECE9] text-xs font-semibold hover:bg-gray-100 dark:hover:bg-[#2E3330] transition-all cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-[#0F6E5F] dark:text-[#2DD4BF]" />
                <span>View Grocery List</span>
              </button>

              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="text-xs font-medium px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-[#FAFAF8] dark:bg-[#141615] text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none focus:ring-1 focus:ring-[#0F6E5F]"
              >
                <option value="High-Protein Global & Mediterranean">Global & Mediterranean</option>
                <option value="High-Protein Indian (Veg & Non-Veg)">High-Protein Indian</option>
                <option value="High-Protein Vegetarian / Paneer / Tofu">High-Protein Vegetarian</option>
                <option value="Quick 15-Minute Meal Prep">Quick 15-Min Prep</option>
              </select>

              <button
                onClick={handleGenerateAIMealPlan}
                disabled={isGeneratingPlan}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F6E5F] text-white text-xs font-semibold hover:bg-[#0D5B4F] transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPlan ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E8912D]" />
                    <span>Recalculating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#E8912D]" />
                    <span>Recalculate Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Rationale & Explanation Card */}
          {aiMealPlan && (
            <div className="p-4 rounded-xl bg-[#0F6E5F]/5 border border-[#0F6E5F]/20 text-xs text-[#374151] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#0F6E5F]">
                <Lightbulb className="w-4 h-4 text-[#E8912D]" />
                <span>Scientific Body Composition Rationale</span>
              </div>
              <p>{aiMealPlan.bodyCompRationale}</p>
              <div className="pt-2 border-t border-[#0F6E5F]/15 text-[11px] text-[#4B5563]">
                <strong>Adaptive Strategy:</strong> {aiMealPlan.adjustmentSummary}
              </div>
            </div>
          )}

          {/* Meal Breakdown Carousel / Tabs */}
          {aiMealPlan ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {aiMealPlan.meals.map((meal, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#E5E7EB] dark:border-[#242826] bg-[#FAFAF8] dark:bg-[#141615] hover:border-[#0F6E5F] dark:hover:border-[#2DD4BF] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#2DD4BF]">
                        {meal.mealType}
                      </span>
                      <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meal.timeRecommendation || 'Flexible'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9] mt-2 line-clamp-2">
                      {meal.dishName}
                    </h3>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-1 line-clamp-2">
                      {meal.description}
                    </p>

                    {/* Ingredients List */}
                    <div className="mt-3 pt-3 border-t border-[#E5E7EB] dark:border-[#242826]">
                      <span className="text-[11px] font-bold text-[#1A1D1B] dark:text-[#E8ECE9] block mb-1">
                        Key Ingredients:
                      </span>
                      <ul className="space-y-1 text-[11px] text-[#4B5563] dark:text-[#D1D5DB]">
                        {meal.ingredients.map((ing, i) => (
                          <li key={i} className="flex justify-between">
                            <span>• {ing.item}</span>
                            <span className="text-[#6B7280] dark:text-[#9EA8A2]">{ing.amount}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Macro summary & cooking tip */}
                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-[#242826]">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#E8912D]">{meal.calories} kcal</span>
                      <span className="text-[#0F6E5F] dark:text-[#2DD4BF]">{meal.proteinG}g Protein</span>
                    </div>
                    {meal.cookingTip && (
                      <div className="mt-2 text-[10px] text-[#6B7280] dark:text-[#9EA8A2] italic bg-white dark:bg-[#1A1D1C] p-2 rounded border border-[#E5E7EB] dark:border-[#242826]">
                        🧑‍🍳 {meal.cookingTip}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 border-2 border-dashed border-[#E5E7EB] rounded-xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#0F6E5F]/10 text-[#0F6E5F] flex items-center justify-center mx-auto">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#1A1D1B]">No 1-Day Plan Generated Yet</h3>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                Tap the button below to have Gemini generate a calibrated meal plan based on your current weight ({userProfile.weightKg}kg), target, and {userProfile.dietType} preference.
              </p>
              <button
                onClick={handleGenerateAIMealPlan}
                disabled={isGeneratingPlan}
                className="px-6 py-2.5 rounded-xl bg-[#0F6E5F] text-white text-xs font-semibold hover:bg-[#0D5B4F] transition-all shadow-xs"
              >
                Generate AI 1-Day Plan Now
              </button>
            </div>
          )}

          {/* Hydration and Electrolytes Guideline */}
          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-[#3B82F6]" />
              <span className="font-semibold text-[#1A1D1B]">Daily Hydration Target:</span>
              <span className="font-bold text-[#0F6E5F]">
                {aiMealPlan?.hydrationTargetLiters || userProfile.hydrationLiters || 3.5} Liters / day
              </span>
            </div>
            <span className="text-[11px] text-[#6B7280]">
              Aim for ~500ml upon waking + 500-750ml intra-workout for optimal cellular hydration and protein synthesis.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

