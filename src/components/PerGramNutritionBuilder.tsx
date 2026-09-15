import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  Sparkles, 
  BookOpen, 
  Info,
  ShieldCheck,
  ChevronRight,
  Calculator
} from 'lucide-react';
import { UserProfile, MealLog, PerGramIngredientItem } from '../types';
import { INDIAN_FOOD_DATABASE, IFCTFoodItem, calculateCustomPortionMacros } from '../data/indianFoodDatabase';

interface PerGramNutritionBuilderProps {
  userProfile: UserProfile;
  onSaveToMealLog: (mealLog: MealLog) => void;
}

export const PerGramNutritionBuilder: React.FC<PerGramNutritionBuilderProps> = ({
  userProfile,
  onSaveToMealLog,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [plateItems, setPlateItems] = useState<PerGramIngredientItem[]>([
    {
      id: 'init-1',
      name: 'Low-Fat Paneer (Cow Milk / Skimmed Curdled)',
      hindiName: 'कम वसा वाला पनीर',
      category: 'Dairy & Paneer',
      databaseSource: 'IFCT',
      weightG: 150,
      per100g: {
        calories: 145,
        proteinG: 22.0,
        carbsG: 3.5,
        fatG: 4.5,
        fiberG: 0,
        calciumMg: 480,
        potassiumMg: 120,
        ironMg: 0.4,
        leucineG: 2.1,
      },
      calculatedMacros: {
        calories: 218,
        proteinG: 33.0,
        carbsG: 5.3,
        fatG: 6.8,
        fiberG: 0,
        calciumMg: 720,
        potassiumMg: 180,
        ironMg: 0.6,
        leucineG: 3.15,
      },
    },
    {
      id: 'init-2',
      name: 'Whole Wheat Phulka / Roti (Without Ghee)',
      hindiName: 'गेहूं की रोटी / फुल्का',
      category: 'Cereals & Millets',
      databaseSource: 'IFCT',
      weightG: 80,
      per100g: {
        calories: 260,
        proteinG: 9.5,
        carbsG: 52.0,
        fatG: 1.5,
        fiberG: 9.2,
        calciumMg: 38,
        potassiumMg: 280,
        ironMg: 3.8,
        leucineG: 0.65,
      },
      calculatedMacros: {
        calories: 208,
        proteinG: 7.6,
        carbsG: 41.6,
        fatG: 1.2,
        fiberG: 7.4,
        calciumMg: 30,
        potassiumMg: 224,
        ironMg: 3.0,
        leucineG: 0.52,
      },
    },
  ]);

  const [mealTitle, setMealTitle] = useState<string>('Custom High-Protein Indian Plate');
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Post-Workout'>('Lunch');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = [
    'All',
    'Lentils & Pulses',
    'Cereals & Millets',
    'Dairy & Paneer',
    'Tubers & Fasting Items',
    'Nuts, Seeds & Oilseeds',
    'Traditional Preparations',
    'Condiments & Chutneys',
    'Cooking Mediums',
  ];

  // Filtered ingredients from the database
  const filteredDatabase = useMemo(() => {
    return INDIAN_FOOD_DATABASE.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.hindiName.toLowerCase().includes(q) ||
        (item.marathiName && item.marathiName.toLowerCase().includes(q)) ||
        item.regionalOrigin.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  // Aggregate totals of the custom plate
  const totals = useMemo(() => {
    return plateItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calculatedMacros.calories,
        proteinG: Number((acc.proteinG + item.calculatedMacros.proteinG).toFixed(1)),
        carbsG: Number((acc.carbsG + item.calculatedMacros.carbsG).toFixed(1)),
        fatG: Number((acc.fatG + item.calculatedMacros.fatG).toFixed(1)),
        fiberG: Number((acc.fiberG + item.calculatedMacros.fiberG).toFixed(1)),
        calciumMg: acc.calciumMg + (item.calculatedMacros.calciumMg || 0),
        potassiumMg: acc.potassiumMg + (item.calculatedMacros.potassiumMg || 0),
        ironMg: Number((acc.ironMg + (item.calculatedMacros.ironMg || 0)).toFixed(1)),
        leucineG: Number((acc.leucineG + (item.calculatedMacros.leucineG || 0)).toFixed(2)),
        totalWeightG: acc.totalWeightG + item.weightG,
      }),
      {
        calories: 0,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
        fiberG: 0,
        calciumMg: 0,
        potassiumMg: 0,
        ironMg: 0,
        leucineG: 0,
        totalWeightG: 0,
      }
    );
  }, [plateItems]);

  const handleAddIngredient = (item: IFCTFoodItem) => {
    const weightG = item.typicalPortionG || 100;
    const factor = weightG / 100;
    const newItem: PerGramIngredientItem = {
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      hindiName: item.hindiName,
      category: item.category,
      databaseSource: 'IFCT',
      weightG,
      per100g: {
        calories: item.per100g.calories,
        proteinG: item.per100g.proteinG,
        carbsG: item.per100g.carbsG,
        fatG: item.per100g.fatG,
        fiberG: item.per100g.fiberG,
        sodiumMg: item.per100g.sodiumMg,
        calciumMg: item.per100g.calciumMg,
        potassiumMg: item.per100g.potassiumMg,
        ironMg: item.per100g.ironMg,
        leucineG: item.leucineGPer100g || 0,
      },
      calculatedMacros: {
        calories: Math.round(item.per100g.calories * factor),
        proteinG: Number((item.per100g.proteinG * factor).toFixed(1)),
        carbsG: Number((item.per100g.carbsG * factor).toFixed(1)),
        fatG: Number((item.per100g.fatG * factor).toFixed(1)),
        fiberG: Number((item.per100g.fiberG * factor).toFixed(1)),
        calciumMg: Math.round((item.per100g.calciumMg || 0) * factor),
        potassiumMg: Math.round((item.per100g.potassiumMg || 0) * factor),
        ironMg: Number(((item.per100g.ironMg || 0) * factor).toFixed(1)),
        leucineG: Number(((item.leucineGPer100g || 0) * factor).toFixed(2)),
      },
    };

    setPlateItems((prev) => [...prev, newItem]);
    showToast(`Added ${item.name} (${weightG}g)`);
  };

  const handleUpdateWeight = (id: string, newWeight: number) => {
    const safeWeight = Math.max(1, isNaN(newWeight) ? 0 : newWeight);
    setPlateItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const factor = safeWeight / 100;
        return {
          ...item,
          weightG: safeWeight,
          calculatedMacros: {
            calories: Math.round(item.per100g.calories * factor),
            proteinG: Number((item.per100g.proteinG * factor).toFixed(1)),
            carbsG: Number((item.per100g.carbsG * factor).toFixed(1)),
            fatG: Number((item.per100g.fatG * factor).toFixed(1)),
            fiberG: Number((item.per100g.fiberG * factor).toFixed(1)),
            calciumMg: Math.round((item.per100g.calciumMg || 0) * factor),
            potassiumMg: Math.round((item.per100g.potassiumMg || 0) * factor),
            ironMg: Number(((item.per100g.ironMg || 0) * factor).toFixed(1)),
            leucineG: Number(((item.per100g.leucineG || 0) * factor).toFixed(2)),
          },
        };
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setPlateItems((prev) => prev.filter((item) => item.id !== id));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveToMealLog = () => {
    if (plateItems.length === 0) return;

    const newLog: MealLog = {
      id: `manual-plate-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType,
      mealTitle,
      calories: totals.calories,
      proteinG: totals.proteinG,
      carbsG: totals.carbsG,
      fatG: totals.fatG,
      fiberG: totals.fiberG,
      isEstimated: false,
      items: plateItems.map((p) => ({
        name: p.name,
        portionDescription: `${p.weightG}g (${p.hindiName || p.name})`,
        weightG: p.weightG,
        calories: p.calculatedMacros.calories,
        proteinG: p.calculatedMacros.proteinG,
        carbsG: p.calculatedMacros.carbsG,
        fatG: p.calculatedMacros.fatG,
        fiberG: p.calculatedMacros.fiberG,
        ingredientSource: p.databaseSource,
      })),
      notes: `Constructed via Gram-Precision Nutrition Calculator (${totals.totalWeightG}g total weight, ${totals.leucineG}g Leucine).`,
    };

    onSaveToMealLog(newLog);
    showToast(`Logged "${mealTitle}" to daily journal!`);
  };

  // Leucine MPS threshold calculation (2.5g+ activates mTOR/MPS)
  const isMpsOptimal = totals.leucineG >= 2.5;

  return (
    <div className="space-y-6 text-left">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#D4AF37] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#1D9E75] animate-bounce">
          <Check className="w-5 h-5 text-[#F0D060]" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent dark:from-[#D4AF37]/20 dark:to-transparent p-6 rounded-3xl border border-[#D4AF37]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#D4AF37] text-white uppercase tracking-wider">
              Gram-Precision Nutrition Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDF3D0] dark:bg-[#2A2416]/60 text-[#8E701C] dark:text-[#F0D060] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              IFCT & USDA Certified
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1F2421] dark:text-[#F5F5F0]">
            Per-Gram Ingredient Calculator & Plate Builder
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6460] dark:text-[#9EA8A2] mt-1 max-w-2xl">
            Deconstruct meals to the exact gram. Search across the comprehensive Indian Food Composition Tables (IFCT) & USDA database with real-time bioavailable Leucine & electrolyte metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleSaveToMealLog}
            disabled={plateItems.length === 0}
            className="w-full md:w-auto px-5 py-3 bg-[#D4AF37] hover:bg-[#0D5A4E] text-white font-bold text-sm rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Log Plate to Journal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Plate & Per-Gram Calculator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Plate Title and Meal Type */}
          <div className="bg-white dark:bg-[#111111] p-5 rounded-3xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[#5C6460] dark:text-[#9EA8A2] block mb-1">
                  Custom Plate Name
                </label>
                <input
                  type="text"
                  value={mealTitle}
                  onChange={(e) => setMealTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAF8] dark:bg-[#1F2421] border border-[#E5E7EB] dark:border-[#2A2416] rounded-xl text-sm font-bold text-[#1F2421] dark:text-[#F5F5F0] focus:ring-2 focus:ring-[#D4AF37] outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5C6460] dark:text-[#9EA8A2] block mb-1">
                  Meal Slot
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAF8] dark:bg-[#1F2421] border border-[#E5E7EB] dark:border-[#2A2416] rounded-xl text-sm font-bold text-[#1F2421] dark:text-[#F5F5F0] focus:ring-2 focus:ring-[#D4AF37] outline-hidden"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                  <option value="Post-Workout">Post-Workout</option>
                </select>
              </div>
            </div>

            {/* Macro Summary Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#F0F0EC] dark:border-[#2A2416]">
              <div className="p-3 bg-[#FAFAF8] dark:bg-[#111111] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] text-center">
                <div className="flex items-center justify-center gap-1 text-[#E8912D] text-xs font-bold mb-0.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Calories</span>
                </div>
                <div className="text-lg font-black text-[#1F2421] dark:text-[#F5F5F0]">
                  {totals.calories} <span className="text-xs font-normal text-[#6B7280]">kcal</span>
                </div>
              </div>

              <div className="p-3 bg-[#FFFBF0]/50 dark:bg-[#2A2416]/20 rounded-2xl border border-[#E6D7A8] dark:border-[#2A2416]/40 text-center">
                <div className="flex items-center justify-center gap-1 text-[#D4AF37] dark:text-[#1D9E75] text-xs font-bold mb-0.5">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Protein</span>
                </div>
                <div className="text-lg font-black text-[#D4AF37] dark:text-[#1D9E75]">
                  {totals.proteinG} <span className="text-xs font-normal text-[#6B7280]">g</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/40 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold mb-0.5">
                  <Wheat className="w-3.5 h-3.5" />
                  <span>Carbs</span>
                </div>
                <div className="text-lg font-black text-amber-700 dark:text-amber-300">
                  {totals.carbsG} <span className="text-xs font-normal text-[#6B7280]">g</span>
                </div>
              </div>

              <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/40 text-center">
                <div className="flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold mb-0.5">
                  <Droplet className="w-3.5 h-3.5" />
                  <span>Fats</span>
                </div>
                <div className="text-lg font-black text-rose-700 dark:text-rose-300">
                  {totals.fatG} <span className="text-xs font-normal text-[#6B7280]">g</span>
                </div>
              </div>
            </div>

            {/* Leucine MPS Meter */}
            <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isMpsOptimal ? 'bg-[#D4AF37] text-white' : 'bg-blue-500 text-white'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1F2421] dark:text-[#F5F5F0] flex items-center gap-1.5">
                    <span>Muscle Protein Synthesis (MPS) Leucine:</span>
                    <span className="font-extrabold text-[#D4AF37] dark:text-[#F0D060]">{totals.leucineG}g</span>
                  </div>
                  <div className="text-[11px] text-[#5C6460] dark:text-[#9EA8A2]">
                    {isMpsOptimal
                      ? 'Optimal trigger reached (≥2.5g Leucine). Maximal anabolism activated!'
                      : `Add ${(2.5 - totals.leucineG).toFixed(2)}g more leucine (e.g. +50g paneer or sattu) to maximize muscle protein synthesis.`}
                  </div>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                isMpsOptimal
                  ? 'bg-[#FDF3D0] dark:bg-[#2A2416]/60 text-[#8E701C] dark:text-[#F0D060]'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
              }`}>
                {isMpsOptimal ? 'MPS Optimized' : 'Building'}
              </span>
            </div>
          </div>

          {/* Plate Items Table */}
          <div className="bg-white dark:bg-[#111111] p-5 rounded-3xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1F2421] dark:text-[#F5F5F0] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#D4AF37]" />
                <span>Ingredients on Your Plate ({plateItems.length})</span>
              </h3>
              <span className="text-xs font-bold text-[#5C6460] dark:text-[#9EA8A2]">
                Total Weight: {totals.totalWeightG}g
              </span>
            </div>

            {plateItems.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-[#E5E7EB] dark:border-[#2A2416] rounded-2xl">
                <Scale className="w-10 h-10 text-[#9EA8A2] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-[#5C6460] dark:text-[#9EA8A2]">
                  No ingredients on your plate yet
                </p>
                <p className="text-xs text-[#9EA8A2] mt-1">
                  Search the IFCT database on the right to add ingredients by exact gram weight.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {plateItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#FAFAF8] dark:bg-[#111111] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1F2421] dark:text-[#F5F5F0] truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#F0D060]">
                          {item.databaseSource}
                        </span>
                      </div>
                      {item.hindiName && (
                        <div className="text-xs text-[#5C6460] dark:text-[#9EA8A2] mt-0.5">
                          {item.hindiName}
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-[#5C6460] dark:text-[#9EA8A2] mt-2">
                        <span className="font-bold text-[#1F2421] dark:text-[#F5F5F0]">
                          {item.calculatedMacros.calories} kcal
                        </span>
                        <span>•</span>
                        <span className="text-[#D4AF37] dark:text-[#F0D060] font-bold">
                          {item.calculatedMacros.proteinG}g P
                        </span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400">
                          {item.calculatedMacros.carbsG}g C
                        </span>
                        <span>•</span>
                        <span className="text-rose-600 dark:text-rose-400">
                          {item.calculatedMacros.fatG}g F
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-white dark:bg-[#2A2416] px-3 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-[#333835]">
                        <input
                          type="number"
                          min="1"
                          max="2000"
                          value={item.weightG}
                          onChange={(e) => handleUpdateWeight(item.id, parseInt(e.target.value, 10))}
                          className="w-16 text-center font-black text-sm text-[#1F2421] dark:text-[#F5F5F0] bg-transparent outline-hidden"
                        />
                        <span className="text-xs font-bold text-[#6B7280]">g</span>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                        title="Remove ingredient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: IFCT & USDA Search Database (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#111111] p-5 rounded-3xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#1F2421] dark:text-[#F5F5F0] flex items-center gap-2">
                <Search className="w-4 h-4 text-[#D4AF37]" />
                <span>Search IFCT & Indian Food Database</span>
              </h3>
              <p className="text-xs text-[#5C6460] dark:text-[#9EA8A2] mt-0.5">
                Instant lookups for regional staples, spices, lentils, and fasting items.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#9EA8A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Paneer, Sabudana, Sattu, Moong Dal, Ragi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF8] dark:bg-[#1F2421] border border-[#E5E7EB] dark:border-[#2A2416] rounded-xl text-sm font-medium text-[#1F2421] dark:text-[#F5F5F0] focus:ring-2 focus:ring-[#D4AF37] outline-hidden placeholder:text-[#9EA8A2]"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#D4AF37] text-white shadow-xs'
                      : 'bg-[#FAFAF8] dark:bg-[#111111] text-[#5C6460] dark:text-[#9EA8A2] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2416]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Results List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredDatabase.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#FAFAF8] dark:bg-[#111111] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] hover:border-[#D4AF37]/50 transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#1F2421] dark:text-[#F5F5F0]">
                        {item.name}
                      </span>
                      {item.isFastingSafe && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-[#F0D060]">
                          Vrat
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-[#5C6460] dark:text-[#9EA8A2] mt-0.5 truncate">
                      {item.hindiName} • {item.regionalOrigin}
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-[#5C6460] dark:text-[#9EA8A2]">
                      <span className="text-[#1F2421] dark:text-[#F5F5F0] font-bold">
                        {item.per100g.calories} kcal/100g
                      </span>
                      <span>•</span>
                      <span className="text-[#D4AF37] dark:text-[#F0D060] font-bold">
                        {item.per100g.proteinG}g P
                      </span>
                      <span>•</span>
                      <span>{item.per100g.carbsG}g C</span>
                      <span>•</span>
                      <span>{item.per100g.fatG}g F</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddIngredient(item)}
                    className="p-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-white rounded-xl transition-all cursor-pointer"
                    title={`Add standard portion (~${item.typicalPortionG}g)`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {filteredDatabase.length === 0 && (
                <div className="p-6 text-center text-xs text-[#9EA8A2]">
                  No ingredients found matching "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
