import React, { useState } from 'react';
import { 
  ChefHat, 
  Sparkles, 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  Clock, 
  Check, 
  Plus, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  RefreshCw, 
  Lightbulb, 
  ShieldCheck, 
  UtensilsCrossed, 
  Trash2,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { UserProfile, CustomGeneratedRecipe, MealLog } from '../types';
import { getStoredCustomRecipes, addStoredCustomRecipe, deleteStoredCustomRecipe } from '../lib/storage';

interface CustomRecipeGeneratorProps {
  userProfile: UserProfile;
  remainingCalories: number;
  remainingProtein: number;
  onSaveToMealLog: (log: MealLog) => void;
}

const PRESET_MEAL_TYPES = [
  { id: 'High-Protein Breakfast', label: 'Breakfast', ratioCals: 0.25, ratioProt: 0.25, defaultTime: 15 },
  { id: 'Lean High-Volume Lunch', label: 'Lunch', ratioCals: 0.35, ratioProt: 0.35, defaultTime: 20 },
  { id: 'Anabolic Muscle Dinner', label: 'Dinner', ratioCals: 0.30, ratioProt: 0.30, defaultTime: 25 },
  { id: 'Guilt-Free High-Protein Dessert / Snack', label: 'Snack / Dessert', ratioCals: 0.15, ratioProt: 0.15, defaultTime: 10 },
];

export const CustomRecipeGenerator: React.FC<CustomRecipeGeneratorProps> = ({
  userProfile,
  remainingCalories,
  remainingProtein,
  onSaveToMealLog,
}) => {
  const defaultMealCals = Math.round(userProfile.dailyCalories * 0.3);
  const defaultMealProt = Math.round(userProfile.dailyProtein * 0.3);

  // Generator Form State
  const [selectedMealType, setSelectedMealType] = useState<string>('Lean High-Volume Lunch');
  const [targetCalories, setTargetCalories] = useState<number>(defaultMealCals);
  const [targetProtein, setTargetProtein] = useState<number>(defaultMealProt);
  const [availableIngredients, setAvailableIngredients] = useState<string>('');
  const [maxCookTime, setMaxCookTime] = useState<number>(20);
  const [cuisineStyle, setCuisineStyle] = useState<string>(userProfile.cuisinePreference || 'High-Protein Global & Mediterranean');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Execution & UI State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<CustomGeneratedRecipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<CustomGeneratedRecipe[]>(getStoredCustomRecipes());
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');

  const handleSelectPreset = (preset: typeof PRESET_MEAL_TYPES[0]) => {
    setSelectedMealType(preset.id);
    setTargetCalories(Math.round(userProfile.dailyCalories * preset.ratioCals));
    setTargetProtein(Math.round(userProfile.dailyProtein * preset.ratioProt));
    setMaxCookTime(preset.defaultTime);
  };

  const handleFitRemaining = () => {
    const cals = remainingCalories > 150 ? remainingCalories : Math.round(userProfile.dailyCalories * 0.25);
    const prot = remainingProtein > 15 ? remainingProtein : Math.round(userProfile.dailyProtein * 0.25);
    setTargetCalories(cals);
    setTargetProtein(prot);
    setSelectedMealType(remainingCalories < 400 ? 'Guilt-Free High-Protein Dessert / Snack' : 'Lean High-Volume Lunch');
    setSuccessToast(`Calibrated target to your exact remaining budget: ${cals} kcal & ${prot}g protein!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const isVegUser = userProfile.dietType === 'vegetarian' || userProfile.dietType === 'vegan' || Boolean(userProfile.dietaryPreferenceLock?.includes('locked'));

  const handleGenerateRecipe = async () => {
    try {
      setIsGenerating(true);
      setErrorMessage(null);
      setCheckedIngredients({});
      setCheckedSteps({});

      const res = await fetch('/api/ai/generate-custom-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: {
            ...userProfile,
            isStrictVegetarian: isVegUser,
            dietaryPreferenceLock: isVegUser ? 'vegetarian_locked' : userProfile.dietaryPreferenceLock,
          },
          recipeRequirements: {
            mealType: selectedMealType,
            targetCalories: Number(targetCalories),
            targetProteinG: Number(targetProtein),
            maxCookTimeMin: Number(maxCookTime),
            availableIngredients: availableIngredients.trim() || undefined,
            cuisineStyle,
            dietaryFramework: isVegUser ? 'Strict Vegetarian' : userProfile.dietType,
            notes: specialNotes.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'Failed to generate recipe');
      }

      const newRecipe: CustomGeneratedRecipe = {
        ...data.data,
        id: 'rec_' + Date.now(),
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

      setGeneratedRecipe(newRecipe);
    } catch (err: any) {
      console.error('Recipe generation error:', err);
      setErrorMessage(err.message || 'Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToRecipeBook = () => {
    if (!generatedRecipe) return;
    const updated = addStoredCustomRecipe({ ...generatedRecipe, isBookmarked: true });
    setSavedRecipes(updated);
    setGeneratedRecipe({ ...generatedRecipe, isBookmarked: true });
    setSuccessToast('Recipe saved to your personal AROH Recipe Book!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleDeleteSavedRecipe = (id: string) => {
    const updated = deleteStoredCustomRecipe(id);
    setSavedRecipes(updated);
  };

  const handleLogToDailyTracker = (recipeToLog: CustomGeneratedRecipe) => {
    const newLog: MealLog = {
      id: 'log_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType: recipeToLog.mealCategory.includes('Breakfast')
        ? 'Breakfast'
        : recipeToLog.mealCategory.includes('Lunch')
        ? 'Lunch'
        : recipeToLog.mealCategory.includes('Dinner')
        ? 'Dinner'
        : 'Snack',
      isEstimated: false,
      mealTitle: recipeToLog.recipeName,
      calories: recipeToLog.totalCalories,
      proteinG: recipeToLog.proteinG,
      carbsG: recipeToLog.carbsG,
      fatG: recipeToLog.fatG,
      fiberG: recipeToLog.fiberG || Math.round(recipeToLog.carbsG * 0.12),
      sodiumMg: Math.round(recipeToLog.totalCalories * 1.15),
      calciumMg: Math.round(recipeToLog.proteinG * 12 + 60),
      potassiumMg: Math.round(recipeToLog.carbsG * 8 + 120),
      items: recipeToLog.ingredients.map((ing) => ({
        name: ing.item,
        portionDescription: ing.amount,
        weightG: 100,
        calories: Math.round(recipeToLog.totalCalories / recipeToLog.ingredients.length),
        proteinG: Number((recipeToLog.proteinG / recipeToLog.ingredients.length).toFixed(1)),
        carbsG: Number((recipeToLog.carbsG / recipeToLog.ingredients.length).toFixed(1)),
        fatG: Number((recipeToLog.fatG / recipeToLog.ingredients.length).toFixed(1)),
      })),
      userNotes: `Cooked from AROH AI Custom Recipe: ${recipeToLog.headlineTag}`,
    };

    onSaveToMealLog(newLog);
    setSuccessToast(`Logged ${recipeToLog.recipeName} (${recipeToLog.totalCalories} kcal, ${recipeToLog.proteinG}g protein) to today's food tracker!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const toggleIngredientCheck = (idx: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStepCheck = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#1E293B] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 dark:bg-[#00D4FF]/20 text-[#00D4FF] dark:text-[#38BDF8] flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-[#00D4FF] dark:text-[#38BDF8]" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
              AI Macro-Friendly Recipe Generator
            </h2>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#00D4FF]/10 dark:bg-[#00D4FF]/20 text-[#00D4FF] dark:text-[#38BDF8]">
              Gemini 3.7 Flash
            </span>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-1">
            Precision-tailors gourmet recipes to hit your exact calorie and protein targets (with 0.4g/kg MPS leucine threshold).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-[#00D4FF] text-white shadow-xs'
                : 'bg-white dark:bg-[#0E1424] border border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white'
            }`}
          >
            Create New Recipe
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-[#00D4FF] text-white shadow-xs'
                : 'bg-white dark:bg-[#0E1424] border border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Recipes ({savedRecipes.length})</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-[#16A34A]/10 dark:bg-[#16A34A]/20 border border-[#16A34A]/20 dark:border-[#16A34A]/30 text-[#16A34A] dark:text-[#38BDF8] text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-[#DC2626]/10 dark:bg-[#DC2626]/20 border border-[#DC2626]/20 dark:border-[#DC2626]/30 text-[#DC2626] dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* CREATE TAB */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls & Parameters Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0E1424] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-xs space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] uppercase tracking-wide">
                  1. Meal Preset & Category
                </label>
                <button
                  type="button"
                  onClick={handleFitRemaining}
                  className="text-[11px] font-bold text-[#00D4FF] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#E8912D]" />
                  <span>Fit Today's Remaining ({remainingCalories} kcal)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PRESET_MEAL_TYPES.map((preset) => {
                  const isSelected = selectedMealType === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#00D4FF] dark:border-[#38BDF8] bg-[#00D4FF]/5 dark:bg-[#00D4FF]/20 ring-1 ring-[#00D4FF] dark:ring-[#38BDF8]'
                          : 'border-[#E5E7EB] dark:border-[#1E293B] bg-[#FAFAF8] dark:bg-[#0B0F1E] hover:bg-white dark:hover:bg-[#1E201F]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">{preset.label}</div>
                      <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
                        ~{Math.round(userProfile.dailyCalories * preset.ratioCals)} kcal • {Math.round(userProfile.dailyProtein * preset.ratioProt)}g P
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Calorie & Protein Sliders / Numbers */}
            <div className="space-y-4 pt-2 border-t border-[#E5E7EB] dark:border-[#1E293B]">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1 text-[#1A1D1B] dark:text-[#E8ECE9]">
                    <Flame className="w-3.5 h-3.5 text-[#E8912D]" />
                    <span>Target Recipe Calories:</span>
                  </span>
                  <span className="font-bold text-[#E8912D] text-sm">{targetCalories} kcal</span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={Math.max(1200, userProfile.dailyCalories)}
                  step={10}
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="w-full accent-[#00D4FF] dark:accent-[#38BDF8] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
                  <span>150 kcal (Light Snack)</span>
                  <span>{userProfile.dailyCalories} kcal (Full Daily Budget)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1 text-[#1A1D1B] dark:text-[#E8ECE9]">
                    <Dumbbell className="w-3.5 h-3.5 text-[#00D4FF] dark:text-[#38BDF8]" />
                    <span>Target Recipe Protein:</span>
                  </span>
                  <span className="font-bold text-[#00D4FF] dark:text-[#38BDF8] text-sm">{targetProtein} g</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={Math.max(80, userProfile.dailyProtein)}
                  step={1}
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(Number(e.target.value))}
                  className="w-full accent-[#00D4FF] dark:accent-[#38BDF8] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
                  <span>15g (Min Satiety)</span>
                  <span>{userProfile.dailyProtein}g (Max MPS Spike)</span>
                </div>
              </div>
            </div>

            {/* Custom Inputs */}
            <div className="space-y-3 pt-2 border-t border-[#E5E7EB] dark:border-[#1E293B]">
              <div>
                <label className="block text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
                  Ingredients In My Fridge / Pantry (Optional):
                </label>
                <input
                  type="text"
                  placeholder={
                    isVegUser
                      ? "e.g. Low-fat paneer, extra firm tofu, Greek yogurt, spinach, oats, bell peppers, chickpeas"
                      : "e.g. Chicken breast, eggs, spinach, Greek yogurt, oats, bell peppers"
                  }
                  value={availableIngredients}
                  onChange={(e) => setAvailableIngredients(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-[#FAFAF8] dark:bg-[#0B0F1E] text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none focus:ring-1 focus:ring-[#00D4FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
                    Max Prep Time:
                  </label>
                  <select
                    value={maxCookTime}
                    onChange={(e) => setMaxCookTime(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-[#FAFAF8] dark:bg-[#0B0F1E] text-[#1A1D1B] dark:text-[#E8ECE9]"
                  >
                    <option value={10}>⚡ 10 Minutes (Ultra Fast)</option>
                    <option value={20}>⏱️ 20 Minutes (Standard)</option>
                    <option value={35}>🍳 35 Minutes (Gourmet)</option>
                    <option value={50}>🥘 50 Minutes (Meal Prep)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
                    Cuisine Style:
                  </label>
                  <select
                    value={cuisineStyle}
                    onChange={(e) => setCuisineStyle(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-[#FAFAF8] dark:bg-[#0B0F1E] text-[#1A1D1B] dark:text-[#E8ECE9]"
                  >
                    <option value="High-Protein Global & Mediterranean">Global / Med</option>
                    <option value="High-Protein Indian Style (Tikka/Curry/Dal)">High-Protein Indian</option>
                    <option value="Mexican Fiesta Bowl / Burrito">Mexican Bowl</option>
                    <option value="Asian Wok Stir-Fry / Teriyaki">Asian Stir-Fry</option>
                    <option value="Classic American Diner / Skillet">American Diner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
                  Specific Cravings / Notes (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra crunchy, chocolate fix, high fiber, single-pan only"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-[#FAFAF8] dark:bg-[#0B0F1E] text-[#1A1D1B] dark:text-[#E8ECE9]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerateRecipe}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 rounded-xl bg-[#00D4FF] dark:bg-[#00D4FF] text-white font-bold text-xs sm:text-sm hover:bg-[#0369A1] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#E8912D]" />
                  <span>Chef AI Synthesizing Recipe...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E8912D]" />
                  <span>Generate Custom {targetCalories} kcal Recipe</span>
                </>
              )}
            </button>
          </div>

          {/* Right Recipe Output & Detail (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {generatedRecipe ? (
              <div className="bg-white dark:bg-[#0E1424] p-6 sm:p-7 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-xs space-y-6 animate-in fade-in duration-300">
                {/* Recipe Title & Meta Header */}
                <div className="border-b border-[#E5E7EB] dark:border-[#1E293B] pb-5 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00D4FF]/10 dark:bg-[#00D4FF]/20 text-[#00D4FF] dark:text-[#38BDF8]">
                      {generatedRecipe.headlineTag}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9EA8A2]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {generatedRecipe.prepTimeMin + generatedRecipe.cookTimeMin} mins total
                      </span>
                      <span>• {generatedRecipe.servings} serving</span>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                    {generatedRecipe.recipeName}
                  </h3>

                  <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] leading-relaxed">
                    {generatedRecipe.description}
                  </p>

                  {/* Macros Bar */}
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#0B0F1E] border border-[#E5E7EB] dark:border-[#1E293B] text-center">
                      <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] uppercase font-bold">Calories</div>
                      <div className="text-sm sm:text-base font-extrabold text-[#E8912D]">
                        {generatedRecipe.totalCalories}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#0B0F1E] border border-[#E5E7EB] dark:border-[#1E293B] text-center">
                      <div className="text-[10px] text-[#00D4FF] dark:text-[#38BDF8] uppercase font-bold">Protein</div>
                      <div className="text-sm sm:text-base font-extrabold text-[#00D4FF] dark:text-[#38BDF8]">
                        {generatedRecipe.proteinG}g
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#0B0F1E] border border-[#E5E7EB] dark:border-[#1E293B] text-center">
                      <div className="text-[10px] text-[#3B82F6] dark:text-[#60A5FA] uppercase font-bold">Carbs</div>
                      <div className="text-sm sm:text-base font-extrabold text-[#3B82F6] dark:text-[#60A5FA]">
                        {generatedRecipe.carbsG}g
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#0B0F1E] border border-[#E5E7EB] dark:border-[#1E293B] text-center">
                      <div className="text-[10px] text-[#F59E0B] dark:text-[#FBBF24] uppercase font-bold">Fat</div>
                      <div className="text-sm sm:text-base font-extrabold text-[#F59E0B] dark:text-[#FBBF24]">
                        {generatedRecipe.fatG}g
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#0B0F1E] border border-[#E5E7EB] dark:border-[#1E293B] text-center">
                      <div className="text-[10px] text-[#16A34A] dark:text-[#38BDF8] uppercase font-bold">Fiber</div>
                      <div className="text-sm sm:text-base font-extrabold text-[#16A34A] dark:text-[#38BDF8]">
                        {generatedRecipe.fiberG}g
                      </div>
                    </div>
                  </div>
                </div>

                {/* Science & Alignment Highlight */}
                <div className="p-4 rounded-xl bg-[#00D4FF]/5 dark:bg-[#00D4FF]/15 border border-[#00D4FF]/20 dark:border-[#00D4FF]/30 text-xs text-[#374151] dark:text-[#D1D5DB] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#00D4FF] dark:text-[#38BDF8]">
                    <Lightbulb className="w-4 h-4 text-[#E8912D]" />
                    <span>Scientific Muscle & Satiety Rationale</span>
                  </div>
                  <p>{generatedRecipe.bodyCompBenefit}</p>
                  <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
                    <strong>Target Match:</strong> {generatedRecipe.macrosMatchExplanation}
                  </div>
                </div>

                {/* Ingredients Checklist */}
                <div>
                  <h4 className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Precision Ingredients Checklist</span>
                    <span className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] font-normal">Tap to check off</span>
                  </h4>
                  <div className="space-y-1.5">
                    {generatedRecipe.ingredients.map((ing, idx) => {
                      const isChecked = !checkedIngredients[idx];
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleIngredientCheck(idx)}
                          className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                            isChecked
                              ? 'bg-[#FAFAF8] dark:bg-[#0B0F1E] border-[#E5E7EB] dark:border-[#1E293B] line-through text-[#9CA3AF] dark:text-[#6B7280]'
                              : 'bg-white dark:bg-[#191B1A] border-[#E5E7EB] dark:border-[#1E293B] text-[#1A1D1B] dark:text-[#E8ECE9] hover:border-[#00D4FF]/50 dark:hover:border-[#38BDF8]/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${
                                isChecked
                                  ? 'bg-[#00D4FF] dark:bg-[#38BDF8] border-[#00D4FF] dark:border-[#38BDF8] text-white dark:text-gray-900'
                                  : 'border-[#D1D5DB] dark:border-[#4B5563]'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                            <span className="font-semibold">{ing.item}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#00D4FF] dark:text-[#38BDF8]">{ing.amount}</span>
                            {ing.macrosContribution && (
                              <span className="text-[10px] text-[#9CA3AF] dark:text-[#6B7280] hidden sm:inline">
                                ({ing.macrosContribution})
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step-by-Step Cooking Method */}
                <div>
                  <h4 className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] uppercase tracking-wider mb-2">
                    Step-by-Step Culinary Instructions
                  </h4>
                  <div className="space-y-2.5">
                    {generatedRecipe.stepByStepInstructions.map((step, idx) => {
                      const isDone = !checkedSteps[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleStepCheck(idx)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                            isDone
                              ? 'bg-[#FAFAF8] dark:bg-[#0B0F1E] border-[#E5E7EB] dark:border-[#1E293B] text-[#9CA3AF] dark:text-[#6B7280] line-through'
                              : 'bg-[#FAFAF8] dark:bg-[#0B0F1E] border-[#E5E7EB] dark:border-[#1E293B] text-[#374151] dark:text-[#D1D5DB] hover:border-[#00D4FF] dark:hover:border-[#38BDF8]'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                              isDone
                                ? 'bg-[#16A34A] text-white'
                                : 'bg-[#00D4FF]/10 dark:bg-[#00D4FF]/20 text-[#00D4FF] dark:text-[#38BDF8]'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chef Science Tip */}
                <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#0B0F1E] border border-[#E5E7EB] dark:border-[#1E293B] text-xs text-[#6B7280] dark:text-[#9EA8A2]">
                  🧑‍🍳 <strong>Chef's Science Tip:</strong> {generatedRecipe.chefScienceTip}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-[#E5E7EB] dark:border-[#1E293B]">
                  <button
                    onClick={() => handleLogToDailyTracker(generatedRecipe)}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#00D4FF] dark:bg-[#00D4FF] text-white font-bold text-xs hover:bg-[#0369A1] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#E8912D]" />
                    <span>Log to Today's Food Tracker</span>
                  </button>

                  <button
                    onClick={handleSaveToRecipeBook}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white dark:bg-[#0E1424] border border-[#E5E7EB] dark:border-[#1E293B] text-[#1A1D1B] dark:text-[#E8ECE9] font-semibold text-xs hover:bg-[#FAFAF8] dark:hover:bg-[#1E201F] transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {generatedRecipe.isBookmarked ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 text-[#00D4FF] dark:text-[#38BDF8]" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 text-[#6B7280] dark:text-[#9EA8A2]" />
                        <span>Save to Recipe Book</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0E1424] p-12 rounded-2xl border border-dashed border-[#E5E7EB] dark:border-[#1E293B] text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#00D4FF]/10 dark:bg-[#00D4FF]/20 text-[#00D4FF] dark:text-[#38BDF8] flex items-center justify-center mx-auto">
                  <ChefHat className="w-8 h-8 text-[#00D4FF] dark:text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1A1D1B] dark:text-[#E8ECE9]">
                    No Custom Recipe Generated Yet
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] max-w-md mx-auto mt-1">
                    Select your target calories (e.g. {targetCalories} kcal) and protein ({targetProtein}g), choose your cuisine style, and tap <strong>"Generate Custom Recipe"</strong> to have the AI chef formulate an exact recipe for your targets.
                  </p>
                </div>
                <button
                  onClick={handleGenerateRecipe}
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-xl bg-[#00D4FF] text-white text-xs font-semibold hover:bg-[#0369A1] transition-all shadow-xs cursor-pointer"
                >
                  Generate {targetCalories} kcal Meal Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SAVED RECIPES TAB */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white dark:bg-[#0E1424] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#00D4FF] dark:hover:border-[#38BDF8] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#00D4FF]/10 dark:bg-[#00D4FF]/20 text-[#00D4FF] dark:text-[#38BDF8]">
                        {recipe.mealCategory}
                      </span>
                      <button
                        onClick={() => handleDeleteSavedRecipe(recipe.id)}
                        className="text-[#9CA3AF] hover:text-[#DC2626] cursor-pointer"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9] mt-2 line-clamp-2">
                      {recipe.recipeName}
                    </h4>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-1 line-clamp-2">
                      {recipe.description}
                    </p>

                    {/* Macros grid */}
                    <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-[#E5E7EB] dark:border-[#1E293B] text-center">
                      <div className="p-1.5 rounded bg-[#FAFAF8] dark:bg-[#0B0F1E]">
                        <div className="text-[9px] text-[#6B7280] dark:text-[#9EA8A2]">Cals</div>
                        <div className="text-xs font-bold text-[#E8912D]">{recipe.totalCalories}</div>
                      </div>
                      <div className="p-1.5 rounded bg-[#FAFAF8] dark:bg-[#0B0F1E]">
                        <div className="text-[9px] text-[#6B7280] dark:text-[#9EA8A2]">Protein</div>
                        <div className="text-xs font-bold text-[#00D4FF] dark:text-[#38BDF8]">{recipe.proteinG}g</div>
                      </div>
                      <div className="p-1.5 rounded bg-[#FAFAF8] dark:bg-[#0B0F1E]">
                        <div className="text-[9px] text-[#6B7280] dark:text-[#9EA8A2]">Carbs</div>
                        <div className="text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA]">{recipe.carbsG}g</div>
                      </div>
                      <div className="p-1.5 rounded bg-[#FAFAF8] dark:bg-[#0B0F1E]">
                        <div className="text-[9px] text-[#6B7280] dark:text-[#9EA8A2]">Fat</div>
                        <div className="text-xs font-bold text-[#F59E0B] dark:text-[#FBBF24]">{recipe.fatG}g</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E5E7EB] dark:border-[#1E293B]">
                    <button
                      onClick={() => {
                        setGeneratedRecipe(recipe);
                        setActiveTab('create');
                      }}
                      className="flex-1 py-2 rounded-lg bg-[#FAFAF8] dark:bg-[#0B0F1E] border border-[#E5E7EB] dark:border-[#1E293B] text-[#1A1D1B] dark:text-[#E8ECE9] text-xs font-semibold hover:bg-white dark:hover:bg-[#1E201F] cursor-pointer"
                    >
                      View Recipe
                    </button>
                    <button
                      onClick={() => handleLogToDailyTracker(recipe)}
                      className="py-2 px-3 rounded-lg bg-[#00D4FF] text-white text-xs font-semibold hover:bg-[#0369A1] cursor-pointer"
                      title="Log to today's food tracker"
                    >
                      + Log
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0E1424] p-12 rounded-2xl border border-dashed border-[#E5E7EB] dark:border-[#1E293B] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 dark:bg-[#00D4FF]/20 text-[#00D4FF] dark:text-[#38BDF8] flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9]">No Saved Recipes Yet</h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] max-w-sm mx-auto">
                Generate any custom macro-friendly recipe on the "Create New Recipe" tab and click "Save to Recipe Book" to bookmark it here.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-5 py-2 rounded-xl bg-[#00D4FF] text-white text-xs font-semibold hover:bg-[#0369A1] cursor-pointer"
              >
                Create Recipe
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
