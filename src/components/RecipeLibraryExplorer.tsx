import React, { useState } from 'react';
import { 
  ChefHat, 
  Search, 
  Leaf, 
  Flame, 
  Clock, 
  Plus, 
  Check, 
  Sparkles, 
  Filter, 
  Utensils, 
  Dumbbell,
  BookOpen,
  Award,
  Zap,
  ArrowUpDown,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RECIPES_DATABASE, RecipeItem, getRecipesByDiet } from '../data/recipes';
import { UserProfile, MealLog } from '../types';

interface RecipeLibraryExplorerProps {
  userProfile: UserProfile;
  onSaveToMealLog: (log: MealLog) => void;
}

export const RecipeLibraryExplorer: React.FC<RecipeLibraryExplorerProps> = ({
  userProfile,
  onSaveToMealLog,
}) => {
  const isVegetarianUser = userProfile.dietType === 'vegetarian' || userProfile.dietType === 'vegan' || userProfile.dietType === 'eggetarian';
  const [dietFilter, setDietFilter] = useState<string>(isVegetarianUser ? 'vegetarian' : 'all');
  const [selectedMealType, setSelectedMealType] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'anabolic' | 'protein_efficiency' | 'protein' | 'calories' | 'time'>('protein_efficiency');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loggedIds, setLoggedIds] = useState<Record<string, boolean>>({});
  const [selectedRecipeForDetails, setSelectedRecipeForDetails] = useState<RecipeItem | null>(null);

  // Auto-sync diet filter whenever user profile dietType changes
  React.useEffect(() => {
    if (isVegetarianUser) {
      setDietFilter('vegetarian');
    }
  }, [userProfile.dietType, isVegetarianUser]);

  const mealTypes = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack / Post-Workout'];

  let filteredRecipes = getRecipesByDiet(dietFilter, selectedMealType, searchQuery).filter((r) => {
    if (tierFilter !== 'All' && (r.proteinQualityRank || 'S-Tier') !== tierFilter) {
      return false;
    }
    return true;
  });

  // Sort recipes
  filteredRecipes.sort((a, b) => {
    if (sortBy === 'protein_efficiency') {
      const ratioA = a.totalCalories > 0 ? a.proteinG / a.totalCalories : 0;
      const ratioB = b.totalCalories > 0 ? b.proteinG / b.totalCalories : 0;
      return ratioB - ratioA;
    }
    if (sortBy === 'anabolic') {
      const scoreA = a.anabolicScore || 9.0;
      const scoreB = b.anabolicScore || 9.0;
      return scoreB - scoreA;
    }
    if (sortBy === 'protein') {
      return b.proteinG - a.proteinG;
    }
    if (sortBy === 'calories') {
      return a.totalCalories - b.totalCalories;
    }
    if (sortBy === 'time') {
      const timeA = a.prepTimeMin + (a.cookTimeMin || 0);
      const timeB = b.prepTimeMin + (b.cookTimeMin || 0);
      return timeA - timeB;
    }
    return 0;
  });

  const handleLogRecipe = (recipe: RecipeItem) => {
    const mealLog: MealLog = {
      id: `meal_log_${recipe.id}_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType: recipe.mealCategory.toLowerCase().includes('breakfast')
        ? 'Breakfast'
        : recipe.mealCategory.toLowerCase().includes('lunch')
        ? 'Lunch'
        : recipe.mealCategory.toLowerCase().includes('dinner')
        ? 'Dinner'
        : 'Snack',
      isEstimated: false,
      mealTitle: recipe.recipeName,
      calories: recipe.totalCalories,
      proteinG: recipe.proteinG,
      carbsG: recipe.carbsG,
      fatG: recipe.fatG,
      fiberG: recipe.fiberG || 0,
      items: recipe.ingredients.map((ing) => ({
        name: ing.item,
        portionDescription: ing.amount,
        weightG: 100,
        calories: 0,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
      })),
      userNotes: `Science Recipe: ${recipe.headlineTag}`,
    };

    onSaveToMealLog(mealLog);
    setLoggedIds((prev) => ({ ...prev, [recipe.id]: true }));
    setTimeout(() => {
      setLoggedIds((prev) => ({ ...prev, [recipe.id]: false }));
    }, 3000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#161817] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0F6E5F]/10 text-[#0F6E5F] dark:text-[#5FD1B8]">
                100+ Anabolic & Muscle Building Recipes
              </span>
              {isVegetarianUser && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  Vegetarian Filter Applied
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1.5">
              Science-Backed High-Protein Recipe Database
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
              Every recipe is ranked by anabolic efficiency, leucine bioavailability, and Muscle Protein Synthesis (MPS) response.
            </p>
          </div>

          {/* Diet Filter Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setDietFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                dietFilter === 'all'
                  ? 'bg-[#0F6E5F] text-white border-[#0F6E5F]'
                  : 'bg-[#FAFAF8] dark:bg-[#1E201F] text-[#1A1D1B] dark:text-[#E8ECE9] border-[#E5E7EB] dark:border-[#2A2E2C]'
              }`}
            >
              All (100)
            </button>
            <button
              onClick={() => setDietFilter('vegetarian')}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                dietFilter === 'vegetarian'
                  ? 'bg-[#16A34A] text-white border-[#16A34A]'
                  : 'bg-[#FAFAF8] dark:bg-[#1E201F] text-emerald-800 dark:text-emerald-300 border-[#E5E7EB] dark:border-[#2A2E2C]'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Vegetarian Only (50)</span>
            </button>
            <button
              onClick={() => setDietFilter('non_vegetarian')}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                dietFilter === 'non_vegetarian'
                  ? 'bg-[#0F6E5F] text-white border-[#0F6E5F]'
                  : 'bg-[#FAFAF8] dark:bg-[#1E201F] text-[#1A1D1B] dark:text-[#E8ECE9] border-[#E5E7EB] dark:border-[#2A2E2C]'
              }`}
            >
              Omnivore (50)
            </button>
          </div>
        </div>

        {/* Search and Meal Type Filter */}
        <div className="mt-5 pt-4 border-t border-[#E5E7EB] dark:border-[#242826] space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search recipes by name, ingredient (paneer, tofu, lentils, whey, chicken, eggs), or cuisine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] text-xs sm:text-sm text-[#1A1D1B] dark:text-[#E8ECE9] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F6E5F]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-[#1A1D1B] dark:hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sorting and Tier Filter */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2] font-semibold">Quality:</span>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none"
                >
                  <option value="All">All Tiers</option>
                  <option value="S-Tier">S-Tier (Top MPS Bioavailability)</option>
                  <option value="A-Tier">A-Tier (High Protein)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2] font-semibold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none"
                >
                  <option value="protein_efficiency">🎯 Protein-to-Calorie Ratio (Top Rated)</option>
                  <option value="anabolic">⚡ Anabolic Score (Highest First)</option>
                  <option value="protein">🥩 Protein Content (Highest First)</option>
                  <option value="calories">🔥 Lowest Calories (Deficit Friendly)</option>
                  <option value="time">⏱️ Quickest Prep Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Meal type chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {mealTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedMealType === type
                    ? 'bg-[#0F6E5F] text-white shadow-2xs'
                    : 'bg-[#F3F4F6] dark:bg-[#1F2221] text-[#6B7280] dark:text-[#9EA8A2] hover:bg-gray-200 dark:hover:bg-[#282C2A]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipes count */}
      <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9EA8A2]">
        <div>
          Showing <span className="font-bold text-[#0F6E5F] dark:text-[#5FD1B8]">{filteredRecipes.length}</span> curated recipes
        </div>
        <div>
          Database: <span className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">{RECIPES_DATABASE.length} Total</span>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.map((recipe) => {
          const isLogged = loggedIds[recipe.id];
          const isVeg = recipe.dietCategory === 'vegetarian';
          const rank = recipe.proteinQualityRank || 'S-Tier';
          const score = recipe.anabolicScore || 9.7;

          return (
            <div
              key={recipe.id}
              className="bg-white dark:bg-[#161817] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] hover:border-[#0F6E5F]/50 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Anabolic Quality Rank Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      rank === 'S-Tier'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    }`}>
                      <Award className="w-3 h-3" />
                      {rank} • {score}/10
                    </span>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isVeg
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                    }`}>
                      {isVeg ? '🌱 Vegetarian' : '🍗 Omnivore'}
                    </span>

                    {/* Protein-to-Calorie Ratio Badge */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-[#0F6E5F] dark:text-[#5FD1B8] border border-teal-500/20">
                      🎯 {Math.round((recipe.proteinG * 4 / recipe.totalCalories) * 100)}% Protein Cal
                    </span>
                  </div>

                  <span className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {recipe.prepTimeMin + (recipe.cookTimeMin || 0)}m
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm sm:text-base text-[#1A1D1B] dark:text-[#E8ECE9] leading-snug">
                  {recipe.recipeName}
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-1 line-clamp-2">
                  {recipe.description}
                </p>

                {/* Anabolic Efficiency Callout */}
                {recipe.anabolicEfficiency && (
                  <div className="mt-2.5 p-2 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-[11px] text-[#374151] dark:text-[#D1D5DB]">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                      ⚡ MPS & Muscle Protein Quality:
                    </span>
                    <p className="line-clamp-2">{recipe.anabolicEfficiency}</p>
                  </div>
                )}

                {/* Key Ingredients */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#242826] text-[11px] text-[#4B5563] dark:text-[#9CA3AF]">
                  <div className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">Key Ingredients:</div>
                  <div className="line-clamp-2">
                    {recipe.ingredients.map((i) => `${i.item} (${i.amount})`).join(' • ')}
                  </div>
                </div>

                {/* Nutrition Cues */}
                {recipe.chefScienceTip && (
                  <div className="mt-2 text-[11px] text-[#0F6E5F] dark:text-[#5FD1B8] font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 shrink-0 text-[#E8912D]" />
                    <span className="line-clamp-1">{recipe.chefScienceTip}</span>
                  </div>
                )}
              </div>

              {/* Macros & Actions */}
              <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-[#242826]">
                <div className="grid grid-cols-4 text-center text-xs pb-3">
                  <div>
                    <div className="text-[10px] text-[#6B7280] uppercase">Cal</div>
                    <div className="font-bold text-[#E8912D]">{recipe.totalCalories}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#6B7280] uppercase">Prot</div>
                    <div className="font-bold text-[#0F6E5F] dark:text-[#5FD1B8]">{recipe.proteinG}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#6B7280] uppercase">Carb</div>
                    <div className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">{recipe.carbsG}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#6B7280] uppercase">Fat</div>
                    <div className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">{recipe.fatG}g</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRecipeForDetails(recipe)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-[#1F2221] hover:bg-gray-200 dark:hover:bg-[#282C2A] text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#0F6E5F] dark:text-[#5FD1B8]" />
                    <span>Guide</span>
                  </button>

                  <button
                    onClick={() => handleLogRecipe(recipe)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                      isLogged
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-[#0F6E5F] text-white hover:bg-[#0D5B4F]'
                    }`}
                  >
                    {isLogged ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Logged</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log to Tracker</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Detailed Modal */}
      {selectedRecipeForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div 
            className="relative w-full max-w-xl bg-white dark:bg-[#181B1A] border border-[#E5E7EB] dark:border-[#2A2E2C] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#E5E7EB] dark:border-[#262A28] bg-[#FAFAF8] dark:bg-[#1E2220] flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    {selectedRecipeForDetails.proteinQualityRank || 'S-Tier'} • Rating: {selectedRecipeForDetails.anabolicScore || 9.7}/10
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#0F6E5F]/10 text-[#0F6E5F] dark:text-[#5FD1B8]">
                    {selectedRecipeForDetails.cuisine}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  {selectedRecipeForDetails.recipeName}
                </h3>
              </div>

              <button
                onClick={() => setSelectedRecipeForDetails(null)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-[#252927] hover:bg-gray-200 dark:hover:bg-[#2F3431] text-[#6B7280] dark:text-[#9EA8A2] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Macros summary */}
              <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-gray-50 dark:bg-[#1D201E] border border-[#E5E7EB] dark:border-[#262A28] text-center">
                <div>
                  <span className="text-[10px] text-[#6B7280] block">Calories</span>
                  <span className="text-sm font-bold text-[#E8912D]">{selectedRecipeForDetails.totalCalories} kcal</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] block">Protein</span>
                  <span className="text-sm font-bold text-[#0F6E5F] dark:text-[#5FD1B8]">{selectedRecipeForDetails.proteinG}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] block">Carbs</span>
                  <span className="text-sm font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">{selectedRecipeForDetails.carbsG}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] block">Fat</span>
                  <span className="text-sm font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">{selectedRecipeForDetails.fatG}g</span>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#0F6E5F]" />
                  <span>Exact Ingredients & Macros Contribution:</span>
                </h4>
                <div className="space-y-1.5 pl-1">
                  {selectedRecipeForDetails.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-[#202422] border border-[#E5E7EB] dark:border-[#2A2E2C]">
                      <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">{ing.item}</span>
                      <span className="text-[#6B7280] dark:text-[#9EA8A2] font-mono">{ing.amount} ({ing.macrosContribution})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step by Step Cooking Instructions */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#0F6E5F]" />
                  <span>Step-by-Step Preparation Guide:</span>
                </h4>
                <ol className="space-y-2 pl-1">
                  {selectedRecipeForDetails.stepByStepInstructions.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-[#0F6E5F]/15 text-[#0F6E5F] dark:text-[#5FD1B8] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Science & Body Comp Benefit */}
              <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[#1A1D1B] dark:text-[#E8ECE9] space-y-1.5">
                <div className="font-bold text-[#0F6E5F] dark:text-[#5FD1B8] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Anabolic Science & Muscle Benefit:</span>
                </div>
                <p className="text-xs text-[#374151] dark:text-[#D1D5DB] leading-relaxed">
                  {selectedRecipeForDetails.bodyCompBenefit || selectedRecipeForDetails.chefScienceTip}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] dark:border-[#262A28] bg-[#FAFAF8] dark:bg-[#1E2220] flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setSelectedRecipeForDetails(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#9EA8A2] hover:bg-gray-200 dark:hover:bg-[#282C2A] transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  handleLogRecipe(selectedRecipeForDetails);
                  setSelectedRecipeForDetails(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Log to Meal Tracker</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
