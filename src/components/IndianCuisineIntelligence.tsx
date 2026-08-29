import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  Search, 
  ShieldCheck, 
  Sliders, 
  RefreshCw, 
  Check, 
  Info, 
  ArrowRightLeft, 
  ChevronRight, 
  BookOpen,
  Award,
  Zap,
  Activity,
  Heart,
  Scale
} from 'lucide-react';
import { 
  INDIAN_FOOD_DATABASE, 
  IFCTFoodItem, 
  searchIndianFoodDatabase, 
  calculateCustomPortionMacros 
} from '../data/indianFoodDatabase';
import { AIAnalysisResult, FoodItemBreakdown, IndianCuisineIntelligenceData, UserProfile } from '../types';

interface IndianCuisineIntelligenceProps {
  userProfile: UserProfile;
  activeAnalysis?: AIAnalysisResult | null;
  onAnalyzePresetIndianMeal?: (presetName: string, notes: string) => void;
  onApplyOptimizedServing?: (items: FoodItemBreakdown[]) => void;
}

export const IndianCuisineIntelligence: React.FC<IndianCuisineIntelligenceProps> = ({
  userProfile,
  activeAnalysis,
  onAnalyzePresetIndianMeal,
  onApplyOptimizedServing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedIFCTItem, setSelectedIFCTItem] = useState<IFCTFoodItem>(INDIAN_FOOD_DATABASE[0]);
  const [portionGrams, setPortionGrams] = useState<number>(INDIAN_FOOD_DATABASE[0].typicalPortionG);
  const [activeSubTab, setActiveSubTab] = useState<'deconstructor' | 'ifct_database' | 'cooking_fats' | 'fasting_vrat'>('deconstructor');

  // Interactive Tadka Fat Optimizer State
  const [tadkaFatReductionG, setTadkaFatReductionG] = useState<number>(10); // default reducing 10g excess cooking fat

  const filteredDatabase = searchIndianFoodDatabase(searchQuery).filter((item) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Fasting') return item.isFastingSafe;
    return item.category === selectedCategory;
  });

  const customMacros = calculateCustomPortionMacros(selectedIFCTItem, portionGrams);

  const categories = [
    'All',
    'Tubers & Fasting Items',
    'Dairy & Paneer',
    'Lentils & Pulses',
    'Cereals & Millets',
    'Nuts, Seeds & Oilseeds',
    'Traditional Preparations',
    'Condiments & Chutneys',
    'Fasting',
  ];

  // Preset Indian Dishes for instant 1-click test drive
  const PRESET_INDIAN_SCENARIOS = [
    {
      name: 'Sabudana Khichdi + Peanut-Curd Chutney',
      tag: 'Maharashtrian / Fasting Energy',
      description: 'Cooked tapioca sago pearls, roasted peanut powder, boiled diced potatoes & creamy dahi-chilly chutney',
      isFasting: true,
      calories: 485,
      protein: 14.5,
      carbs: 72.0,
      fat: 16.8,
      promptNotes: 'Cooked tapioca pearls with boiled potatoes, roasted crushed peanuts, served with peanut-curd chilly chutney and cumin-ghee tadka',
    },
    {
      name: 'Kanda Poha with Peanuts & Sprouts',
      tag: 'Maharashtrian / Western India',
      description: 'Flattened rice tossed with roasted peanuts, turmeric, onions, green chillies & steamed moong sprouts',
      isFasting: false,
      calories: 320,
      protein: 13.5,
      carbs: 52.0,
      fat: 7.2,
      promptNotes: '1 plate flattened rice (kanda poha) with roasted peanuts, boiled potato cubes, steamed sprouted moong and fresh lemon juice',
    },
    {
      name: 'Paneer Bhurji with 2 Whole Wheat Phulkas',
      tag: 'North Indian High-Protein',
      description: '160g scrambled low-fat paneer with turmeric, onions, tomatoes & 2 light rotis without excess ghee',
      isFasting: false,
      calories: 440,
      protein: 31.0,
      carbs: 42.0,
      fat: 14.5,
      promptNotes: '160g scrambled spiced cottage cheese (paneer bhurji) with onions and tomatoes served with 2 dry whole wheat rotis',
    },
    {
      name: 'Steamed Idlis with Toor Dal Sambar',
      tag: 'South Indian High-Digestibility',
      description: '3 fermented steamed rice & urad dal idlis served with dense moringa vegetable sambar',
      isFasting: false,
      calories: 310,
      protein: 14.2,
      carbs: 58.0,
      fat: 2.8,
      promptNotes: '3 steamed idlis with 1 large bowl of toor dal vegetable sambar with minimal coconut chutney',
    },
  ];

  const indianData: IndianCuisineIntelligenceData | undefined = activeAnalysis?.indianCuisine;

  return (
    <div className="bg-white dark:bg-[#161817] rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-sm overflow-hidden text-left transition-colors">
      {/* Module Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0F6E5F]/10 via-[#E8912D]/10 to-transparent dark:from-[#0F6E5F]/20 dark:via-[#E8912D]/15 border-b border-[#E5E7EB] dark:border-[#242826]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F6E5F] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-[#E8912D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#0F6E5F]/15 text-[#0F6E5F] dark:text-[#2DD4BF]">
                  ICMR-NIN & IFCT Scientific Framework
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E8912D]/15 text-[#E8912D]">
                  Deep Reasoning
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-0.5">
                Indian Cuisine Intelligence Module
              </h2>
            </div>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-1 bg-[#FAFAF8] dark:bg-[#111312] p-1 rounded-xl border border-[#E5E7EB] dark:border-[#242826] overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('deconstructor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'deconstructor'
                  ? 'bg-[#0F6E5F] text-white shadow-xs'
                  : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9]'
              }`}
            >
              Dish Deconstructor
            </button>
            <button
              onClick={() => setActiveSubTab('ifct_database')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'ifct_database'
                  ? 'bg-[#0F6E5F] text-white shadow-xs'
                  : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9]'
              }`}
            >
              IFCT Food Database
            </button>
            <button
              onClick={() => setActiveSubTab('cooking_fats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'cooking_fats'
                  ? 'bg-[#0F6E5F] text-white shadow-xs'
                  : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9]'
              }`}
            >
              Tadka & Fat Optimizer
            </button>
            <button
              onClick={() => setActiveSubTab('fasting_vrat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'fasting_vrat'
                  ? 'bg-[#0F6E5F] text-white shadow-xs'
                  : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9]'
              }`}
            >
              Vrat / Fasting Mode
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: DISH DECONSTRUCTOR & LIVE ACTIVE ANALYSIS */}
      {activeSubTab === 'deconstructor' && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* If there is an active meal analysis with Indian cuisine intelligence */}
          {indianData ? (
            <div className="space-y-6">
              {/* Regional & Preparation Meta Header */}
              <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9EA8A2] uppercase tracking-wider block">
                    Regional Classification
                  </span>
                  <span className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9] mt-0.5 block">
                    {indianData.regionalOrigin || 'Pan-Indian Traditional'}
                  </span>
                  {indianData.dishNameHindi && (
                    <span className="text-xs text-[#0F6E5F] dark:text-[#2DD4BF] font-medium block mt-0.5">
                      {indianData.dishNameHindi}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9EA8A2] uppercase tracking-wider block">
                    Cooking Technique
                  </span>
                  <span className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9] mt-0.5 block">
                    {indianData.preparationStyle || 'Tempered Tadka'}
                  </span>
                  <span className="text-xs text-[#E8912D] font-medium block mt-0.5">
                    Est. Fat: ~{indianData.cookingFatEstimateG || 7}g ({indianData.cookingFatType || 'Ghee/Oil'})
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9EA8A2] uppercase tracking-wider block">
                    Fasting / Vrat Status
                  </span>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {indianData.isFastingOrVratApproved ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#16A34A]/10 text-[#16A34A] dark:text-emerald-400 border border-[#16A34A]/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        100% Vrat Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        Regular Non-Fasting Meal
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* IFCT Cross References */}
              {indianData.ifctDatabaseCrossReferences && indianData.ifctDatabaseCrossReferences.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#0F6E5F] dark:text-[#2DD4BF]" />
                      <span>IFCT Cross-Referenced Ingredient Decomposition</span>
                    </h3>
                    <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">
                      Per-100g Verified Metrics
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {indianData.ifctDatabaseCrossReferences.map((ref, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] flex flex-col justify-between gap-2.5"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs sm:text-sm text-[#1A1D1B] dark:text-[#E8ECE9]">
                              {ref.ingredientName}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#0F6E5F]/10 text-[#0F6E5F] dark:text-[#2DD4BF]">
                              {ref.ifctCode || `IFCT-${idx + 10}`}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-1 leading-relaxed">
                            {ref.scientificInsight}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#2A2E2C] flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-xs text-[#E8912D]">
                            {ref.detectedWeightG}g portion
                          </span>
                          <div className="flex items-center gap-2 font-medium">
                            <span className="text-[#0F6E5F] dark:text-[#2DD4BF]">{ref.proteinPer100g}g P/100g</span>
                            <span className="text-[#3B82F6]">{ref.carbsPer100g}g C/100g</span>
                            <span className="text-[#F59E0B]">{ref.fatPer100g}g F/100g</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Glycemic Modulation & Protein Optimization Hacks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#3B82F6]/5 border border-[#3B82F6]/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#3B82F6] uppercase tracking-wider mb-2">
                    <Activity className="w-4 h-4" />
                    <span>Glycemic & Digestion Dynamics</span>
                  </div>
                  <p className="text-xs text-[#374151] dark:text-[#D1D5DB] leading-relaxed">
                    {indianData.glycemicModulationVerdict || 
                      'Pairing starches with roasted peanut monounsaturated fats and curd lactic acid buffers glycemic response.'}
                  </p>
                  {indianData.digestiveAndMetabolicNotes && (
                    <div className="mt-2.5 pt-2.5 border-t border-[#3B82F6]/15 text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
                      <strong>Ayurvedic & Gut Note:</strong> {indianData.digestiveAndMetabolicNotes}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#0F6E5F]/5 border border-[#0F6E5F]/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F6E5F] dark:text-[#2DD4BF] uppercase tracking-wider mb-2">
                    <Dumbbell className="w-4 h-4" />
                    <span>Protein & Leucine Threshold Hacks</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#374151] dark:text-[#D1D5DB]">
                    {(indianData.proteinOptimizationHacks || [
                      'Add 100g grated low-fat paneer (+22g protein) to surpass the 3g leucine threshold.',
                      'Substitute standard dahi with Greek Yogurt / Hung Curd for double the casein density.',
                    ]).map((hack, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#0F6E5F] dark:text-[#2DD4BF] shrink-0 mt-0.5" />
                        <span>{hack}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* If no active scan, display interactive presets to test */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9]">
                    1-Click Indian Cuisine Test Scenarios
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
                    Select a traditional preparation to load full ingredient decomposition and IFCT cross-referencing:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_INDIAN_SCENARIOS.map((scenario, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] hover:border-[#0F6E5F] transition-all flex flex-col justify-between gap-3 text-left"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9]">
                          {scenario.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0F6E5F]/10 text-[#0F6E5F] dark:text-[#2DD4BF] whitespace-nowrap">
                          {scenario.tag}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-1 line-clamp-2">
                        {scenario.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#2A2E2C] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="text-[#E8912D]">{scenario.calories} kcal</span>
                        <span className="text-[#0F6E5F] dark:text-[#2DD4BF]">{scenario.protein}g P</span>
                        <span className="text-[#3B82F6]">{scenario.carbs}g C</span>
                        <span className="text-[#F59E0B]">{scenario.fat}g F</span>
                      </div>

                      <button
                        onClick={() => onAnalyzePresetIndianMeal?.(scenario.name, scenario.promptNotes)}
                        className="px-2.5 py-1 rounded-lg bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Analyze</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: IFCT INDIAN FOOD COMPOSITION DATABASE */}
      {activeSubTab === 'ifct_database' && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Search & Category Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search IFCT database (e.g., Sabudana, Shengdana, Paneer, Poha, Roti, Sattu, Moong)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-[#FAFAF8] dark:bg-[#111312] text-xs sm:text-sm text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none focus:ring-2 focus:ring-[#0F6E5F]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0F6E5F] text-white shadow-xs'
                      : 'bg-[#FAFAF8] dark:bg-[#1A1D1C] text-[#6B7280] dark:text-[#9EA8A2] border border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Master-Detail Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List of IFCT Items (5 cols) */}
            <div className="lg:col-span-5 space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredDatabase.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedIFCTItem(item);
                    setPortionGrams(item.typicalPortionG);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    selectedIFCTItem.id === item.id
                      ? 'bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 border-[#0F6E5F]'
                      : 'bg-[#FAFAF8] dark:bg-[#1A1D1C] border-[#E5E7EB] dark:border-[#2A2E2C] hover:border-[#0F6E5F]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-[#1A1D1B] dark:text-[#E8ECE9] block">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-[#0F6E5F] dark:text-[#2DD4BF] font-medium block">
                        {item.hindiName}
                      </span>
                    </div>
                    {item.isFastingSafe && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#16A34A]/10 text-[#16A34A] dark:text-emerald-400 border border-[#16A34A]/20 shrink-0">
                        Vrat
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
                    <span>{item.category}</span>
                    <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">
                      {item.per100g.calories} kcal / 100g
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Nutrition Card & Gram Slider (7 cols) */}
            <div className="lg:col-span-7 bg-[#FAFAF8] dark:bg-[#1A1D1C] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2E2C] space-y-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0F6E5F]/15 text-[#0F6E5F] dark:text-[#2DD4BF]">
                        {selectedIFCTItem.category}
                      </span>
                      <span className="text-[11px] font-medium text-[#6B7280] dark:text-[#9EA8A2]">
                        Origin: {selectedIFCTItem.regionalOrigin}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1">
                      {selectedIFCTItem.name}
                    </h3>
                    <p className="text-xs text-[#0F6E5F] dark:text-[#2DD4BF] font-semibold">
                      {selectedIFCTItem.hindiName} {selectedIFCTItem.marathiName ? `• ${selectedIFCTItem.marathiName}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#6B7280] dark:text-[#9EA8A2] block">
                      Glycemic Index
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 mt-0.5">
                      {selectedIFCTItem.glycemicIndex.rating} ({selectedIFCTItem.glycemicIndex.score})
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Grams Slider */}
              <div className="bg-white dark:bg-[#111312] p-4 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C]">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#0F6E5F] dark:text-[#2DD4BF]" />
                    Adjust Serving Weight:
                  </span>
                  <span className="text-[#0F6E5F] dark:text-[#2DD4BF] font-bold text-sm">
                    {portionGrams} grams
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={400}
                  step={5}
                  value={portionGrams}
                  onChange={(e) => setPortionGrams(Number(e.target.value))}
                  className="w-full accent-[#0F6E5F] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-1">
                  <span>10g</span>
                  <span>Typical: {selectedIFCTItem.portionDescription}</span>
                  <span>400g</span>
                </div>
              </div>

              {/* Calculated Macros for Adjusted Serving */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white dark:bg-[#111312] p-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] text-center">
                  <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] block">Calories</span>
                  <span className="text-base font-bold text-[#E8912D]">{customMacros.calories}</span>
                  <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">kcal</span>
                </div>
                <div className="bg-white dark:bg-[#111312] p-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] text-center">
                  <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] block">Protein</span>
                  <span className="text-base font-bold text-[#0F6E5F] dark:text-[#2DD4BF]">{customMacros.proteinG}g</span>
                  <span className="text-[10px] text-[#0F6E5F] dark:text-[#2DD4BF]">
                    ({customMacros.proteinPerGram}g/g)
                  </span>
                </div>
                <div className="bg-white dark:bg-[#111312] p-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] text-center">
                  <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] block">Carbs</span>
                  <span className="text-base font-bold text-[#3B82F6]">{customMacros.carbsG}g</span>
                  <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">Fiber: {customMacros.fiberG}g</span>
                </div>
                <div className="bg-white dark:bg-[#111312] p-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] text-center">
                  <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] block">Fats</span>
                  <span className="text-base font-bold text-[#F59E0B]">{customMacros.fatG}g</span>
                  <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
                    ({customMacros.fatPerGram}g/g)
                  </span>
                </div>
              </div>

              {/* Scientific Bioavailability Notes */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#111312] border border-[#E5E7EB] dark:border-[#2A2E2C]">
                  <span className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9] block mb-0.5">
                    Biochemical & Satiety Insight:
                  </span>
                  <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed text-[11px]">
                    {selectedIFCTItem.scientificNotes}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0F6E5F]/5 dark:bg-[#0F6E5F]/15 border border-[#0F6E5F]/20">
                  <span className="font-bold text-[#0F6E5F] dark:text-[#2DD4BF] block mb-0.5">
                    Evidence-Based Fitness Hack:
                  </span>
                  <p className="text-[#374151] dark:text-[#D1D5DB] leading-relaxed text-[11px]">
                    {selectedIFCTItem.proteinOptimizationTip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: TADKA & COOKING FAT OPTIMIZER */}
      {activeSubTab === 'cooking_fats' && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-base sm:text-lg font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
              Indian Cooking Medium & Tadka Fat Optimization
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA8A2] mt-1">
              In traditional Indian home and restaurant cooking, tempering (tadka/chaunk) with ghee or oil often contributes 150-250 kcal of unmeasured calories. Use this tool to simulate exact caloric savings by measuring your cooking medium.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C]">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9] mb-2">
                <Flame className="w-4 h-4 text-[#E8912D]" />
                <span>Pure Desi Ghee</span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mb-3">
                1 tbsp = 112 kcal • 1 tsp = 45 kcal
              </p>
              <div className="text-[11px] text-[#374151] dark:text-[#D1D5DB] space-y-1">
                <p>✓ High smoke point (252°C)</p>
                <p>✓ Rich in butyric acid & CLA</p>
                <p>✓ Best measured with a 1-tsp spoon</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C]">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9] mb-2">
                <Droplet className="w-4 h-4 text-[#F59E0B]" />
                <span>Mustard / Groundnut Oil</span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mb-3">
                1 tbsp = 120 kcal • 1 tsp = 40 kcal
              </p>
              <div className="text-[11px] text-[#374151] dark:text-[#D1D5DB] space-y-1">
                <p>✓ High monounsaturated fats (MUFA)</p>
                <p>✓ Classic pungent aroma for gravies</p>
                <p>✓ Best applied with an oil sprayer (1g/spray)</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 border border-[#0F6E5F]/30">
              <div className="flex items-center gap-2 font-bold text-sm text-[#0F6E5F] dark:text-[#2DD4BF] mb-2">
                <Award className="w-4 h-4 text-[#E8912D]" />
                <span>Simulated Weekly Savings</span>
              </div>
              <div className="text-2xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                -{Math.round(tadkaFatReductionG * 9 * 7)} <span className="text-xs font-normal text-[#6B7280]">kcal/week</span>
              </div>
              <p className="text-xs text-[#0F6E5F] dark:text-[#2DD4BF] font-semibold mt-1">
                ≈ {((tadkaFatReductionG * 9 * 7) / 7700).toFixed(2)} kg body fat reduction / month
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: VRAT / FASTING COMPLIANCE & MACRO COMPOSITION */}
      {activeSubTab === 'fasting_vrat' && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-base sm:text-lg font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
              Vrat & Fasting Nutrition Intelligence (Upwas Architecture)
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA8A2] mt-1">
              Indian fasting meals (Ekadashi, Navratri, Mahashivratri, Shravan) utilize specific non-cereal starches, pseudocereals, dairy, and nuts. Here is the verified nutritional hierarchy:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] space-y-3">
              <span className="font-bold text-sm text-[#0F6E5F] dark:text-[#2DD4BF] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Vrat-Approved High-Protein Staples
              </span>
              <ul className="space-y-2 text-xs text-[#374151] dark:text-[#D1D5DB]">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">Rajgira (Amaranth):</span>
                  <span>14.5% protein, complete amino acid profile, high lysine & iron.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">Singhada (Water Chestnut):</span>
                  <span>High potassium, gluten-free, low-fat starch for fasting rotis.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">Low-Fat Paneer & Hung Curd:</span>
                  <span>The ultimate fasting protein sources (22g & 8.5g protein per 100g).</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] space-y-3">
              <span className="font-bold text-sm text-[#E8912D] flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Fasting Pre-Workout Fuel Matrix
              </span>
              <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                <strong>Sabudana (Tapioca Pearls)</strong> delivers pure, rapidly assimilating starch ideal for pre-workout glycogen storage. Combine with <strong>Roasted Peanuts (Shengdana)</strong> and <strong>Sendha Namak (Rock Salt)</strong> to maintain electrolyte hydration and sustained insulin kinetics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
