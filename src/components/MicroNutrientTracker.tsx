import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  Wheat, 
  Zap, 
  Bone, 
  Heart, 
  Plus, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Flame,
  Droplet
} from 'lucide-react';
import { UserProfile, MealLog } from '../types';

interface MicroNutrientTrackerProps {
  userProfile: UserProfile;
  mealLogs: MealLog[];
  onSaveToMealLog: (log: MealLog) => void;
}

interface MicroNutrientConfig {
  id: 'fiber' | 'sodium' | 'calcium' | 'potassium';
  name: string;
  unit: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  progressColor: string;
  recommendedTarget: number;
  minThreshold: number;
  maxSafeLimit?: number;
  consumed: number;
  scientificRole: string;
  deficiencyRisk: string;
  topWholeFoodSources: { food: string; portion: string; amount: number; unit: string }[];
}

export const MicroNutrientTracker: React.FC<MicroNutrientTrackerProps> = ({
  userProfile,
  mealLogs,
  onSaveToMealLog,
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [addedBoosters, setAddedBoosters] = useState<string[]>([]);
  const [showScienceGuide, setShowScienceGuide] = useState<boolean>(false);

  // 1. Calculate Recommended Targets Based on Scientific Standards (ISSN, DGA, ACSM)
  const isFemale = userProfile.sex === 'female';
  
  // Fiber: 14g per 1,000 kcal or 25g (F) / 38g (M) baseline
  const recommendedFiber = isFemale 
    ? Math.max(25, Math.round((userProfile.dailyCalories / 1000) * 14)) 
    : Math.max(38, Math.round((userProfile.dailyCalories / 1000) * 14));
  const minFiberThreshold = isFemale ? 22 : 30;

  // Sodium: 1,500mg minimum baseline, 2,300mg standard target (up to 3,000mg for heavy sweaters/lifters)
  const recommendedSodium = 2300;
  const minSodiumThreshold = 1500;
  const maxSodiumThreshold = 3400;

  // Calcium: 1,000mg/day (1,200mg if older adult)
  const recommendedCalcium = userProfile.age > 50 && isFemale ? 1200 : 1000;
  const minCalciumThreshold = 900;

  // Potassium: 2,600mg (F) / 3,400mg (M)
  const recommendedPotassium = isFemale ? 2600 : 3400;
  const minPotassiumThreshold = 2200;

  // 2. Sum Consumed Micro-Nutrients from today's meal logs
  const totalFiberConsumed = Number(
    mealLogs.reduce((sum, log) => {
      if (typeof log.fiberG === 'number' && log.fiberG > 0) return sum + log.fiberG;
      // Fallback estimate if not logged
      return sum + Math.max(2, Math.round((log.carbsG || 0) * 0.1));
    }, 0).toFixed(1)
  );

  const totalSodiumConsumed = Math.round(
    mealLogs.reduce((sum, log) => {
      if (typeof log.sodiumMg === 'number' && log.sodiumMg > 0) return sum + log.sodiumMg;
      // Estimate ~1.1mg sodium per kcal of mixed food
      return sum + Math.round((log.calories || 0) * 1.1);
    }, 0)
  );

  const totalCalciumConsumed = Math.round(
    mealLogs.reduce((sum, log) => {
      if (typeof log.calciumMg === 'number' && log.calciumMg > 0) return sum + log.calciumMg;
      // Estimate ~12mg calcium per gram of protein + 60mg baseline
      return sum + Math.round((log.proteinG || 0) * 11 + 50);
    }, 0)
  );

  const totalPotassiumConsumed = Math.round(
    mealLogs.reduce((sum, log) => {
      if (typeof log.potassiumMg === 'number' && log.potassiumMg > 0) return sum + log.potassiumMg;
      return sum + Math.round((log.carbsG || 0) * 7 + (log.proteinG || 0) * 6 + 70);
    }, 0)
  );

  // 3. Define micro-nutrient metadata
  const micronutrients: MicroNutrientConfig[] = [
    {
      id: 'fiber',
      name: 'Dietary Fiber',
      unit: 'g',
      icon: Wheat,
      color: 'text-[#16A34A]',
      bgColor: 'bg-[#16A34A]/10',
      borderColor: 'border-[#16A34A]/30',
      progressColor: 'bg-[#16A34A]',
      recommendedTarget: recommendedFiber,
      minThreshold: minFiberThreshold,
      consumed: totalFiberConsumed,
      scientificRole: 'Regulates gastric emptying, triggers satiety hormones (GLP-1, PYY), and ferments into short-chain fatty acids (SCFAs) in the colon.',
      deficiencyRisk: 'Suboptimal fiber accelerates hunger rebound in a deficit, causes glycemic instability, and impairs bowel motility and lipid clearance.',
      topWholeFoodSources: [
        { food: 'Chia Seeds', portion: '2 tbsp (28g)', amount: 10, unit: 'g' },
        { food: 'Black Beans / Lentils', portion: '1 cup cooked', amount: 15, unit: 'g' },
        { food: 'Raspberries / Blackberries', portion: '1 cup (125g)', amount: 8, unit: 'g' },
        { food: 'Cooked Broccoli / Brussels Sprouts', portion: '1.5 cups', amount: 6, unit: 'g' },
        { food: 'Rolled Oats', portion: '1 cup cooked', amount: 5, unit: 'g' },
      ],
    },
    {
      id: 'sodium',
      name: 'Sodium (Electrolyte)',
      unit: 'mg',
      icon: Zap,
      color: 'text-[#E8912D]',
      bgColor: 'bg-[#E8912D]/10',
      borderColor: 'border-[#E8912D]/30',
      progressColor: 'bg-[#E8912D]',
      recommendedTarget: recommendedSodium,
      minThreshold: minSodiumThreshold,
      maxSafeLimit: maxSodiumThreshold,
      consumed: totalSodiumConsumed,
      scientificRole: 'Essential for neuromuscular action potentials, extracellular osmolarity, blood volume maintenance, and sodium-potassium ATPase pumps during heavy lifting.',
      deficiencyRisk: 'Intake below 1,500mg drops plasma volume, triggers exercise-induced muscle cramps, induces brain fog, and reduces peak rate of force development (RFD).',
      topWholeFoodSources: [
        { food: 'Natural Pink / Sea Salt', portion: '1/2 tsp (2.5g)', amount: 1150, unit: 'mg' },
        { food: 'Electrolyte Hydration Drink', portion: '500 ml serving', amount: 500, unit: 'mg' },
        { food: 'Organic Bone Broth', portion: '1 cup (240ml)', amount: 600, unit: 'mg' },
        { food: 'Cottage Cheese', portion: '1 cup (225g)', amount: 700, unit: 'mg' },
        { food: 'Pickled Cucumbers / Olives', portion: '50g serving', amount: 450, unit: 'mg' },
      ],
    },
    {
      id: 'calcium',
      name: 'Calcium (Mineral)',
      unit: 'mg',
      icon: Bone,
      color: 'text-[#3B82F6]',
      bgColor: 'bg-[#3B82F6]/10',
      borderColor: 'border-[#3B82F6]/30',
      progressColor: 'bg-[#3B82F6]',
      recommendedTarget: recommendedCalcium,
      minThreshold: minCalciumThreshold,
      consumed: totalCalciumConsumed,
      scientificRole: 'Required for sarcoplasmic reticulum Ca2+ release binding to troponin C, initiating muscular contraction, plus bone mineral density (BMD).',
      deficiencyRisk: 'Chronic low calcium forces the parathyroid gland to resorb bone calcium to sustain serum levels, accelerating bone micro-fracture risk during heavy loading.',
      topWholeFoodSources: [
        { food: 'Plain Greek Yogurt / Skyr', portion: '1 cup (240g)', amount: 300, unit: 'mg' },
        { food: 'Fortified Almond / Dairy Milk', portion: '1 glass (250ml)', amount: 350, unit: 'mg' },
        { food: 'Calcium-Set Tofu', portion: '150g block', amount: 430, unit: 'mg' },
        { food: 'Canned Sardines (with bones)', portion: '1 can (100g)', amount: 380, unit: 'mg' },
        { food: 'Cooked Collard Greens / Kale', portion: '1 cup cooked', amount: 260, unit: 'mg' },
      ],
    },
    {
      id: 'potassium',
      name: 'Potassium (Electrolyte)',
      unit: 'mg',
      icon: Heart,
      color: 'text-[#8B5CF6]',
      bgColor: 'bg-[#8B5CF6]/10',
      borderColor: 'border-[#8B5CF6]/30',
      progressColor: 'bg-[#8B5CF6]',
      recommendedTarget: recommendedPotassium,
      minThreshold: minPotassiumThreshold,
      consumed: totalPotassiumConsumed,
      scientificRole: 'Principal intracellular cation; counterbalances sodium, drives glycogen storage in muscle cells, and modulates vascular endothelial tone.',
      deficiencyRisk: 'Low potassium impedes muscular glycogen re-synthesis, impairs cardiac rhythm stability under high cardiovascular load, and causes early muscular fatigue.',
      topWholeFoodSources: [
        { food: 'Medium Avocado', portion: '1 whole (150g)', amount: 730, unit: 'mg' },
        { food: 'Baked Potato (with skin)', portion: '1 medium (170g)', amount: 900, unit: 'mg' },
        { food: 'Fresh Spinach', portion: '1 cup cooked', amount: 840, unit: 'mg' },
        { food: 'Coconut Water', portion: '330 ml carton', amount: 600, unit: 'mg' },
        { food: 'Large Banana', portion: '1 item (135g)', amount: 450, unit: 'mg' },
      ],
    },
  ];

  // 4. Identify warnings
  const activeWarnings = micronutrients.filter((m) => {
    if (mealLogs.length === 0) return false;
    return m.consumed < m.minThreshold;
  });

  const highSodiumWarning = totalSodiumConsumed > (maxSodiumThreshold || 3400);

  // Quick Booster Logger
  const handleQuickAddBooster = (item: { food: string; portion: string; amount: number; unit: string }, microId: string) => {
    const boosterId = `${microId}_${item.food}_${Date.now()}`;
    setAddedBoosters((prev) => [...prev, item.food]);

    let extraFiber = 0;
    let extraSodium = 0;
    let extraCalcium = 0;
    let extraPotassium = 0;
    let approxCalories = 80;
    let approxProtein = 4;
    let approxCarbs = 8;
    let approxFat = 2;

    if (microId === 'fiber') {
      extraFiber = item.amount;
      approxCalories = Math.round(item.amount * 4 + 40);
      approxCarbs = Math.round(item.amount * 1.3);
    } else if (microId === 'sodium') {
      extraSodium = item.amount;
      approxCalories = 10;
      approxProtein = 1;
      approxCarbs = 0;
      approxFat = 0;
    } else if (microId === 'calcium') {
      extraCalcium = item.amount;
      approxCalories = 110;
      approxProtein = 12;
      approxCarbs = 6;
      approxFat = 2;
    } else if (microId === 'potassium') {
      extraPotassium = item.amount;
      approxCalories = 120;
      approxCarbs = 20;
      approxProtein = 2;
    }

    const boosterLog: MealLog = {
      id: 'booster_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType: 'Snack',
      mealTitle: `${item.food} (Micro Booster)`,
      isEstimated: true,
      calories: approxCalories,
      proteinG: approxProtein,
      carbsG: approxCarbs,
      fatG: approxFat,
      fiberG: extraFiber,
      sodiumMg: extraSodium,
      calciumMg: extraCalcium,
      potassiumMg: extraPotassium,
      items: [
        {
          name: item.food,
          portionDescription: item.portion,
          weightG: 50,
          calories: approxCalories,
          proteinG: approxProtein,
          carbsG: approxCarbs,
          fatG: approxFat,
        },
      ],
      userNotes: `Added via AROH Micro-Nutrient Optimizer for ${item.amount}${item.unit} ${microId}.`,
    };

    onSaveToMealLog(boosterLog);
  };

  return (
    <div className="bg-white dark:bg-[#111622] p-5 sm:p-7 rounded-3xl border border-[#E5E7EB] dark:border-[#232B3E] shadow-xs space-y-6 text-left">
      {/* Header with Title and Evidence Standards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] dark:border-[#232B3E] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15 text-[#D4AF37] dark:text-[#D4AF37] border border-transparent dark:border-[#D4AF37]/20">
              Micronutrient & Electrolyte Tracking
            </span>
            <span className="text-xs text-[#6B7280] dark:text-slate-400">
              ISSN & Dietary Guidelines for Americans
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1A1D1B] dark:text-white mt-1">
            Essential Micro-Nutrient Dashboard & Threshold Warnings
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
            Monitors your daily Fiber, Sodium, Calcium, and Potassium to safeguard metabolic health, neuromuscular power, and bone density.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowScienceGuide(!showScienceGuide)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAFAF8] dark:bg-[#182032] border border-[#E5E7EB] dark:border-[#232B3E] text-xs font-semibold text-[#4B5563] dark:text-slate-300 hover:text-[#1A1D1B] dark:hover:text-white hover:border-[#D4AF37] dark:hover:border-[#D4AF37]/50 transition-all self-start sm:self-auto"
        >
          <Info className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#D4AF37]" />
          <span>{showScienceGuide ? 'Hide Science Notes' : 'Why These Micros Matter'}</span>
        </button>
      </div>

      {/* SCIENTIFIC EDUCATION ACCORDION */}
      {showScienceGuide && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAFAF8] dark:bg-[#161D2B] border border-[#E5E7EB] dark:border-[#232B3E] text-xs leading-relaxed text-[#374151] dark:text-slate-300 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-bold text-[#D4AF37] dark:text-[#D4AF37]">
            <Sparkles className="w-4 h-4 text-[#E8912D]" />
            <span>The Sports Science of Micronutrient Sufficiency</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-white dark:bg-[#111622] rounded-xl border border-[#E5E7EB] dark:border-[#232B3E]">
              <div className="font-bold text-[#16A34A] dark:text-[#F0D060] flex items-center gap-1.5 mb-1">
                <Wheat className="w-4 h-4" />
                <span>Fiber (14g / 1,000 kcal)</span>
              </div>
              <p className="text-[11px] text-[#6B7280] dark:text-slate-400">
                Critical in caloric deficits to slow gastric transit, blunt ghrelin (hunger hormone), and promote colonic bacterial diversity.
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-[#111622] rounded-xl border border-[#E5E7EB] dark:border-[#232B3E]">
              <div className="font-bold text-[#E8912D] dark:text-amber-400 flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4" />
                <span>Sodium (1,500–2,300mg)</span>
              </div>
              <p className="text-[11px] text-[#6B7280] dark:text-slate-400">
                Athletes lose 800–1,500mg sodium per hour of heavy sweating. Sub-1,500mg intake causes rapid muscular fatigue and drops in blood pressure.
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-[#111622] rounded-xl border border-[#E5E7EB] dark:border-[#232B3E]">
              <div className="font-bold text-[#3B82F6] dark:text-blue-400 flex items-center gap-1.5 mb-1">
                <Bone className="w-4 h-4" />
                <span>Calcium (1,000mg)</span>
              </div>
              <p className="text-[11px] text-[#6B7280] dark:text-slate-400">
                Calcium ions regulate muscle tension development. Without sufficient dietary calcium, bones undergo resorption to maintain blood homeostasis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE THRESHOLD DEFICIENCY WARNING BANNERS */}
      {mealLogs.length > 0 && (activeWarnings.length > 0 || highSodiumWarning) && (
        <div className="space-y-2.5">
          {activeWarnings.map((warning) => (
            <div
              key={warning.id}
              className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                      ⚠️ Suboptimal {warning.name} Alert
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                      {warning.consumed}{warning.unit} / {warning.recommendedTarget}{warning.unit} Target
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                    {warning.deficiencyRisk}
                  </p>
                </div>
              </div>

              {/* Quick booster suggestions */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setExpandedCard(expandedCard === warning.id ? null : warning.id)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 dark:bg-amber-700 text-white text-xs font-bold hover:bg-amber-700 dark:hover:bg-amber-600 transition-all flex items-center gap-1 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Fix with Whole Foods</span>
                </button>
              </div>
            </div>
          ))}

          {highSodiumWarning && (
            <div className="p-4 rounded-2xl bg-orange-50/90 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-left flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-extrabold text-orange-900 dark:text-orange-200">
                  ⚡ Elevated Sodium Alert ({totalSodiumConsumed} mg)
                </div>
                <p className="text-xs text-orange-800 dark:text-orange-300 mt-0.5">
                  Your sodium intake is above 3,400mg today. Unless doing ultra-endurance training in hot weather, balance your fluid homeostasis by drinking extra water and eating potassium-rich foods (e.g. avocado, spinach, potatoes).
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ALL MICRONUTRIENTS MET BANNER (IF ZERO WARNINGS AND LOGS EXIST) */}
      {mealLogs.length > 0 && activeWarnings.length === 0 && !highSodiumWarning && (
        <div className="p-4 rounded-2xl bg-[#FFFBF0]/90 dark:bg-[#2A2416]/40 border border-[#E6D7A8] dark:border-[#2A2416]/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 text-[#A68523] dark:text-[#F0D060] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#B8922A] dark:text-[#F0D060]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#6A5312] dark:text-[#F0D060]">
              Optimal Micronutrient & Electrolyte Sufficiency Achieved! 🎉
            </div>
            <p className="text-[11px] text-[#A68523] dark:text-[#F0D060] mt-0.5">
              Your Fiber, Sodium, Calcium, and Potassium levels all meet or exceed scientifically recommended athletic thresholds today.
            </p>
          </div>
        </div>
      )}

      {/* MICRONUTRIENT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {micronutrients.map((micro) => {
          const Icon = micro.icon;
          const pct = Math.min(100, Math.round((micro.consumed / micro.recommendedTarget) * 100));
          const isDeficient = mealLogs.length > 0 && micro.consumed < micro.minThreshold;
          const isExpanded = expandedCard === micro.id;

          return (
            <div
              key={micro.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isDeficient
                  ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/50 ring-1 ring-amber-300/50 dark:ring-amber-500/30'
                  : 'bg-[#FAFAF8] dark:bg-[#151C2C] border-[#E5E7EB] dark:border-[#232B3E] hover:border-[#D4AF37] dark:hover:border-[#D4AF37]/50'
              }`}
            >
              <div>
                {/* Top Label & Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${micro.bgColor} ${micro.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1A1D1B] dark:text-white">{micro.name}</div>
                      <div className="text-[10px] text-[#6B7280] dark:text-slate-400">
                        Min Threshold: {micro.minThreshold} {micro.unit}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Display */}
                <div className="mt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-[#1A1D1B] dark:text-white">
                      {micro.consumed} <span className="text-xs font-medium text-[#6B7280] dark:text-slate-400">{micro.unit}</span>
                    </span>
                    <span className="text-xs font-bold text-[#6B7280] dark:text-slate-400">
                      / {micro.recommendedTarget} {micro.unit}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#E5E7EB] dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isDeficient ? 'bg-amber-500' : micro.progressColor
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between text-[11px] mt-2">
                    <span className={`font-semibold ${isDeficient ? 'text-amber-700 dark:text-amber-400' : 'text-[#D4AF37] dark:text-[#D4AF37]'}`}>
                      {isDeficient ? '⚠️ Below Threshold' : pct >= 100 ? '✅ Target Satisfied' : `${pct}% of Target`}
                    </span>
                    <span className="text-[#6B7280] dark:text-slate-400">
                      {micro.consumed >= micro.recommendedTarget ? 'Optimal' : `${(micro.recommendedTarget - micro.consumed).toFixed(0)}${micro.unit} needed`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expandable Food Sources Toggle */}
              <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-[#232B3E]">
                <button
                  type="button"
                  onClick={() => setExpandedCard(isExpanded ? null : micro.id)}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-[#D4AF37] dark:text-[#D4AF37] hover:underline"
                >
                  <span>Top Food Boosters</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="mt-2 space-y-1.5 animate-in fade-in duration-200">
                    {micro.topWholeFoodSources.map((item, idx) => {
                      const isAdded = addedBoosters.includes(item.food);
                      return (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-white dark:bg-[#182032] border border-[#E5E7EB] dark:border-[#232B3E] flex items-center justify-between gap-1 text-[11px]"
                        >
                          <div className="overflow-hidden">
                            <div className="font-semibold text-[#1A1D1B] dark:text-white truncate">{item.food}</div>
                            <div className="text-[10px] text-[#6B7280] dark:text-slate-400">
                              {item.portion} • +{item.amount}{item.unit}
                            </div>
                          </div>
                          <button
                            onClick={() => handleQuickAddBooster(item, micro.id)}
                            disabled={isAdded}
                            className={`px-2 py-1 rounded-lg font-bold text-[10px] flex items-center gap-0.5 transition-all shrink-0 ${
                              isAdded
                                ? 'bg-[#FDF3D0] dark:bg-[#2A2416]/60 text-[#8E701C] dark:text-[#F0D060]'
                                : 'bg-[#D4AF37] dark:bg-[#A68523] text-white hover:bg-[#A68523] dark:hover:bg-[#D4AF37]'
                            }`}
                            title={`Log ${item.food} to today's meal log`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
