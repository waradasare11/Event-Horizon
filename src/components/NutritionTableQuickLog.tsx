import React, { useState, useMemo } from 'react';
import { Plus, Check, Search, Sparkles, Scale, Utensils, Database, ChevronDown, ChevronUp } from 'lucide-react';
import { NUTRITION_TABLE, NutritionRow, scaleToGrams, findFood } from '../data/nutritionTable';
import { MealLog, UserProfile } from '../types';

interface NutritionTableQuickLogProps {
  onSaveMealLog: (meal: MealLog) => void;
  userProfile?: UserProfile;
}

const POPULAR_STAPLES = [
  'Roti / Chapati (Whole Wheat)',
  'Paneer (Raw Indian Cottage Cheese)',
  'Cooked Basmati Rice (Polished)',
  'Moong Dal (Cooked Yellow Lentils)',
  'Whole Boiled Egg (Large)',
  'Chicken Breast (Skinless)',
  'Rolled Oats (Raw)',
  'Plain Curd / Dahi (Cow Milk)',
  'Steamed Idli (Rice & Urad Dal)',
  'Banana (Raw)',
  'Sabudana Khichdi',
  'Soya Chunks (Raw / Dry)',
];

const QUICK_GRAM_PRESETS = [50, 100, 150, 200, 250];

export const NutritionTableQuickLog: React.FC<NutritionTableQuickLogProps> = ({
  onSaveMealLog,
  userProfile,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<NutritionRow>(() => {
    return NUTRITION_TABLE[0] || null;
  });
  const [weightGrams, setWeightGrams] = useState<number>(100);
  const [mealType, setMealType] = useState<MealLog['mealType']>('Lunch');
  const [justLogged, setJustLogged] = useState(false);

  // Search filter across nutritionTable
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return NUTRITION_TABLE.filter((row) => {
      const matchName = row.name.toLowerCase().includes(q);
      const matchHindi = row.hindiName?.toLowerCase().includes(q);
      const matchAliases = row.aliases?.some((a) => a.toLowerCase().includes(q));
      return matchName || matchHindi || matchAliases;
    }).slice(0, 12);
  }, [searchQuery]);

  // Scaled nutrients from verified table
  const scaled = useMemo(() => {
    if (!selectedFood) {
      return { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 };
    }
    return scaleToGrams(selectedFood, weightGrams);
  }, [selectedFood, weightGrams]);

  const handleSelectFood = (food: NutritionRow) => {
    setSelectedFood(food);
    setSearchQuery('');
  };

  const handleQuickLog = () => {
    if (!selectedFood || weightGrams <= 0) return;

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newLog: MealLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date: dateStr,
      time: timeStr,
      mealType,
      mealTitle: `${selectedFood.name} (${weightGrams}g)`,
      calories: scaled.kcal,
      proteinG: scaled.proteinG,
      carbsG: scaled.carbsG,
      fatG: scaled.fatG,
      fiberG: scaled.fiberG,
      isEstimated: false,
      items: [
        {
          name: selectedFood.name,
          portionDescription: `${weightGrams}g portion`,
          weightG: weightGrams,
          calories: scaled.kcal,
          proteinG: scaled.proteinG,
          carbsG: scaled.carbsG,
          fatG: scaled.fatG,
          fiberG: scaled.fiberG,
          confidenceScorePct: 100,
          ingredientSource: selectedFood.source === 'IFCT' ? 'ICMR-NIN IFCT 2017' : 'USDA FoodData Central',
          verifiedDatabaseName: selectedFood.source === 'IFCT' ? 'ICMR-NIN IFCT 2017' : 'USDA FoodData Central',
        },
      ],
      userNotes: `Logged via verified ${selectedFood.source === 'IFCT' ? 'ICMR-IFCT' : 'USDA'} nutrition table.`,
    };

    onSaveMealLog(newLog);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2200);
  };

  return (
    <div className="bg-white dark:bg-[#0E1424] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden transition-all">
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-gradient-to-r from-blue-50/60 to-white dark:from-[#131B2E] dark:to-[#0E1424] flex items-center justify-between cursor-pointer border-b border-gray-100 dark:border-gray-800/80"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                Quick Log from Verified Database
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                ICMR-IFCT & USDA
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Instant entry with exact nutrient math — no camera required
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label={isOpen ? 'Collapse quick log' : 'Expand quick log'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Quick Staple Chips */}
          <div>
            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>Popular Indian & Global Staples:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_STAPLES.map((title) => {
                const found = findFood(title);
                if (!found) return null;
                const isSelected = selectedFood?.id === found.id;
                return (
                  <button
                    key={found.id}
                    type="button"
                    onClick={() => setSelectedFood(found)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {found.hindiName ? `${found.name.split(' (')[0]} (${found.hindiName})` : found.name.split(' (')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Input for full 100+ database items */}
          <div className="relative">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Or search 100+ foods (e.g. Soya chunks, Rajma, Biryani, Apple)..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Search Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl divide-y divide-gray-100 dark:divide-gray-800">
                {searchResults.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => handleSelectFood(row)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {row.name}
                      </span>
                      {row.hindiName && (
                        <span className="ml-1.5 text-[10px] text-amber-600 dark:text-amber-400">
                          ({row.hindiName})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {row.per100g.kcal} kcal / 100g
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Food & Nutrients Bar */}
          {selectedFood && (
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>{selectedFood.name}</span>
                    {selectedFood.hindiName && (
                      <span className="text-amber-600 dark:text-amber-400 font-normal">
                        ({selectedFood.hindiName})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Source: {selectedFood.source === 'IFCT' ? 'ICMR-NIN IFCT 2017' : 'USDA FoodData Central'} • Category: {selectedFood.category}
                  </div>
                </div>

                {/* Gram Weight Inputs & Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Scale className="w-3 h-3 text-gray-400" />
                    <input
                      type="number"
                      min={5}
                      max={2000}
                      step={5}
                      value={weightGrams}
                      onChange={(e) => setWeightGrams(Math.max(1, Number(e.target.value) || 10))}
                      className="w-14 text-xs font-bold text-gray-900 dark:text-white bg-transparent focus:outline-none text-right"
                    />
                    <span className="text-[11px] text-gray-500">g</span>
                  </div>

                  {QUICK_GRAM_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWeightGrams(preset)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                        weightGrams === preset
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {preset}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Scaled Macro Display */}
              <div className="grid grid-cols-4 gap-2 pt-1 border-t border-gray-200/60 dark:border-gray-800">
                <div className="text-center p-1.5 rounded-lg bg-white dark:bg-gray-800/80">
                  <div className="text-[10px] text-gray-500">Calories</div>
                  <div className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                    {scaled.kcal} <span className="text-[10px] font-normal">kcal</span>
                  </div>
                </div>
                <div className="text-center p-1.5 rounded-lg bg-white dark:bg-gray-800/80">
                  <div className="text-[10px] text-gray-500">Protein</div>
                  <div className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
                    {scaled.proteinG}g
                  </div>
                </div>
                <div className="text-center p-1.5 rounded-lg bg-white dark:bg-gray-800/80">
                  <div className="text-[10px] text-gray-500">Carbs</div>
                  <div className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">
                    {scaled.carbsG}g
                  </div>
                </div>
                <div className="text-center p-1.5 rounded-lg bg-white dark:bg-gray-800/80">
                  <div className="text-[10px] text-gray-500">Fats</div>
                  <div className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400">
                    {scaled.fatG}g
                  </div>
                </div>
              </div>

              {/* Meal Type & Action */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">Meal:</span>
                  {(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Post-Workout'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMealType(type)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                        mealType === type
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleQuickLog}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                    justLogged
                      ? 'bg-green-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {justLogged ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Logged!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Quick Log</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
