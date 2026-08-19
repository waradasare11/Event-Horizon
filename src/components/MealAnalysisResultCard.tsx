import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRightLeft, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet,
  Info,
  Check
} from 'lucide-react';
import { AIAnalysisResult, FoodItemBreakdown, MealLog, UserProfile } from '../types';
import confetti from 'canvas-confetti';

interface MealAnalysisResultCardProps {
  analysis: AIAnalysisResult;
  imagePreviewUrl: string;
  userProfile: UserProfile;
  onSaveMeal: (mealLog: MealLog) => void;
  onDiscard: () => void;
}

export const MealAnalysisResultCard: React.FC<MealAnalysisResultCardProps> = ({
  analysis,
  imagePreviewUrl,
  userProfile,
  onSaveMeal,
  onDiscard,
}) => {
  // State for editable food items
  const [items, setItems] = useState<FoodItemBreakdown[]>(analysis.items);
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Post-Workout'>('Lunch');
  const [userNotes, setUserNotes] = useState('');
  const [appliedSwaps, setAppliedSwaps] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Recalculate totals dynamically when user edits portion grams or removes an item
  const currentTotalCalories = items.reduce((sum, item) => sum + item.calories, 0);
  const currentTotalProtein = items.reduce((sum, item) => sum + item.proteinG, 0);
  const currentTotalCarbs = items.reduce((sum, item) => sum + item.carbsG, 0);
  const currentTotalFat = items.reduce((sum, item) => sum + item.fatG, 0);
  const currentTotalFiber = analysis.totalFiberG;

  const handleUpdateItemGrams = (index: number, newWeightG: number) => {
    if (newWeightG <= 0) return;
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const ratio = newWeightG / (item.weightG || 1);
        return {
          ...item,
          weightG: Math.round(newWeightG),
          calories: Math.round(item.calories * ratio),
          proteinG: Number((item.proteinG * ratio).toFixed(1)),
          carbsG: Number((item.carbsG * ratio).toFixed(1)),
          fatG: Number((item.fatG * ratio).toFixed(1)),
        };
      })
    );
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplySwap = (originalItemName: string, suggestedSwapName: string, calorieDiff: string) => {
    if (appliedSwaps.includes(originalItemName)) return;

    setAppliedSwaps((prev) => [...prev, originalItemName]);
    // Replace original item in list with the suggested swap item
    setItems((prev) =>
      prev.map((item) => {
        if (item.name.toLowerCase().includes(originalItemName.toLowerCase()) || originalItemName.toLowerCase().includes(item.name.toLowerCase())) {
          return {
            ...item,
            name: `${suggestedSwapName} (AI Smart Swap)`,
            portionDescription: 'Optimized portion',
            calories: Math.max(20, item.calories - 100),
            proteinG: Math.round(item.proteinG * 1.2),
            fatG: Math.max(1, Math.round(item.fatG * 0.5)),
          };
        }
        return item;
      })
    );
  };

  const handleSaveToLog = () => {
    const newLog: MealLog = {
      id: 'meal_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType,
      photoUrl: imagePreviewUrl,
      isEstimated: true,
      mealTitle: analysis.mealTitle,
      calories: currentTotalCalories,
      proteinG: Number(currentTotalProtein.toFixed(1)),
      carbsG: Number(currentTotalCarbs.toFixed(1)),
      fatG: Number(currentTotalFat.toFixed(1)),
      fiberG: currentTotalFiber,
      sodiumMg: analysis.totalSodiumMg || Math.round(currentTotalCalories * 1.1),
      calciumMg: analysis.totalCalciumMg || Math.round(currentTotalProtein * 12),
      potassiumMg: analysis.totalPotassiumMg || Math.round(currentTotalCarbs * 8),
      items,
      analysis,
      userNotes: userNotes.trim() || `Analyzed via PeakForm Gemini Vision AI. Goal Alignment: ${analysis.goalAlignmentScore}/100.`,
    };

    onSaveMeal(newLog);
    setIsSaved(true);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#0F6E5F', '#E8912D', '#16A34A'],
      });
    } catch (e) {
      // Ignored if confetti fails
    }
  };

  // Color logic for Goal Alignment Score
  const score = analysis.goalAlignmentScore || 85;
  const scoreColor = score >= 80 ? 'text-[#16A34A] bg-[#16A34A]/10 border-[#16A34A]/30' : score >= 60 ? 'text-[#E8912D] bg-[#E8912D]/10 border-[#E8912D]/30' : 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/30';

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden transition-all animate-in fade-in duration-300">
      {/* Top Banner with Meal Title & Confidence */}
      <div className="p-5 sm:p-6 border-b border-[#E5E7EB] bg-gradient-to-r from-[#FAFAF8] to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt="Meal preview"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-[#E5E7EB] shrink-0 shadow-xs"
              />
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0F6E5F]/10 text-[#0F6E5F]">
                  Gemini Vision AI Analysis
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563]">
                  Confidence: {analysis.confidence}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1A1D1B] mt-1">
                {analysis.mealTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1 line-clamp-2">
                {analysis.summaryDescription}
              </p>
            </div>
          </div>

          {/* Goal Alignment Meter */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-[#E5E7EB]">
            <div className="text-left sm:text-right">
              <span className="text-xs text-[#6B7280] font-medium block">Goal Alignment</span>
              <span className="text-xs font-semibold text-[#1A1D1B]">{analysis.goalFitVerdict}</span>
            </div>
            <div className={`mt-1 px-3 py-1 rounded-xl border font-bold text-base sm:text-lg flex items-center gap-1.5 ${scoreColor}`}>
              <Sparkles className="w-4 h-4" />
              <span>{score}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Macronutrient Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 sm:p-6 bg-[#FAFAF8]/50 border-b border-[#E5E7EB]">
        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] text-left">
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <Flame className="w-4 h-4 text-[#E8912D]" />
            <span>Calories</span>
          </div>
          <div className="text-xl font-bold text-[#1A1D1B] mt-1">
            {currentTotalCalories} <span className="text-xs font-normal text-[#6B7280]">kcal</span>
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">
            {Math.round((currentTotalCalories / userProfile.dailyCalories) * 100)}% of daily target
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] text-left">
          <div className="flex items-center gap-2 text-xs text-[#0F6E5F]">
            <Dumbbell className="w-4 h-4 text-[#0F6E5F]" />
            <span>Protein</span>
          </div>
          <div className="text-xl font-bold text-[#1A1D1B] mt-1">
            {currentTotalProtein.toFixed(0)} <span className="text-xs font-normal text-[#6B7280]">g</span>
          </div>
          <div className="text-[11px] text-[#0F6E5F] font-medium mt-0.5">
            {Math.round((currentTotalProtein / userProfile.dailyProtein) * 100)}% of daily target
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] text-left">
          <div className="flex items-center gap-2 text-xs text-[#3B82F6]">
            <Wheat className="w-4 h-4 text-[#3B82F6]" />
            <span>Carbs</span>
          </div>
          <div className="text-xl font-bold text-[#1A1D1B] mt-1">
            {currentTotalCarbs.toFixed(0)} <span className="text-xs font-normal text-[#6B7280]">g</span>
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">
            Fiber: {currentTotalFiber}g
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] text-left">
          <div className="flex items-center gap-2 text-xs text-[#F59E0B]">
            <Droplet className="w-4 h-4 text-[#F59E0B]" />
            <span>Fats</span>
          </div>
          <div className="text-xl font-bold text-[#1A1D1B] mt-1">
            {currentTotalFat.toFixed(0)} <span className="text-xs font-normal text-[#6B7280]">g</span>
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">
            {Math.round((currentTotalFat / (userProfile.dailyFat || 60)) * 100)}% of daily target
          </div>
        </div>
      </div>

      {/* Main Content: Detected Food Items (Editable) & AI Improvements */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Detected Ingredients Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-[#1A1D1B]">
                Identified Food Items
              </h3>
              <span className="text-[11px] bg-[#F3F4F6] text-[#4B5563] px-2 py-0.5 rounded-md flex items-center gap-1">
                <Edit3 className="w-3 h-3 text-[#0F6E5F]" />
                Tap portion to fine-tune
              </span>
            </div>
            <span className="text-xs text-[#6B7280]">{items.length} items detected</span>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB] hover:border-[#0F6E5F]/50 transition-all text-sm gap-2"
              >
                <div className="flex-1">
                  <div className="font-semibold text-[#1A1D1B]">{item.name}</div>
                  <div className="text-xs text-[#6B7280]">{item.portionDescription}</div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-between sm:justify-end">
                  {/* Grams Input */}
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-[#E5E7EB]">
                    <span className="text-xs text-[#6B7280]">Weight:</span>
                    <input
                      type="number"
                      value={item.weightG}
                      onChange={(e) => handleUpdateItemGrams(idx, Number(e.target.value))}
                      className="w-16 text-center text-xs font-semibold text-[#1A1D1B] focus:outline-none focus:ring-1 focus:ring-[#0F6E5F] rounded"
                      min={5}
                      step={5}
                    />
                    <span className="text-xs text-[#6B7280]">g</span>
                  </div>

                  {/* Macros breakdown */}
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="text-[#E8912D]">{item.calories} kcal</span>
                    <span className="text-[#6B7280]">•</span>
                    <span className="text-[#0F6E5F]">{item.proteinG}g P</span>
                    <span className="text-[#6B7280]">•</span>
                    <span className="text-[#3B82F6]">{item.carbsG}g C</span>
                    <span className="text-[#6B7280]">•</span>
                    <span className="text-[#F59E0B]">{item.fatG}g F</span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-[#9CA3AF] hover:text-[#DC2626] rounded-md transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Goal Improvement Tips & Smart Swaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Evidence-Based Optimization Tips */}
          <div className="p-4 rounded-xl bg-[#0F6E5F]/5 border border-[#0F6E5F]/20 text-left">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0F6E5F] mb-2.5">
              <Sparkles className="w-4 h-4 text-[#E8912D]" />
              <span>Evidence-Based Goal Optimization</span>
            </div>
            <ul className="space-y-2 text-xs text-[#374151]">
              {analysis.goalImprovementTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F6E5F] shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            {analysis.scientificTakeaway && (
              <div className="mt-3 pt-3 border-t border-[#0F6E5F]/15 flex items-start gap-1.5 text-[11px] text-[#4B5563]">
                <Info className="w-3.5 h-3.5 text-[#0F6E5F] shrink-0 mt-0.5" />
                <span><strong>Science note:</strong> {analysis.scientificTakeaway}</span>
              </div>
            )}
          </div>

          {/* Smart Food Swaps */}
          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] text-left">
            <div className="flex items-center gap-2 font-bold text-sm text-[#1A1D1B] mb-2.5">
              <ArrowRightLeft className="w-4 h-4 text-[#E8912D]" />
              <span>AI Smart Swaps (Tap to Apply)</span>
            </div>
            <div className="space-y-2">
              {analysis.smartSwaps.map((swap, idx) => {
                const isApplied = appliedSwaps.includes(swap.originalItem);
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] flex flex-col justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-[#1A1D1B]">
                        <span className="line-through text-[#9CA3AF]">{swap.originalItem}</span>
                        <span>→</span>
                        <span className="text-[#0F6E5F]">{swap.suggestedSwap}</span>
                        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E8912D]/10 text-[#E8912D]">
                          {swap.calorieDifference}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">{swap.benefitReason}</p>
                    </div>

                    <button
                      disabled={isApplied}
                      onClick={() => handleApplySwap(swap.originalItem, swap.suggestedSwap, swap.calorieDifference)}
                      className={`self-end px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                        isApplied
                          ? 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30'
                          : 'bg-[#0F6E5F] text-white hover:bg-[#0D5B4F]'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <span>Apply Swap</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Meal Logging Controls */}
        <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1A1D1B]">Meal Type:</span>
              <div className="flex items-center gap-1 overflow-x-auto">
                {(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Post-Workout'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      mealType === type
                        ? 'bg-[#0F6E5F] text-white shadow-xs'
                        : 'bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">
              Personal Notes or Prep Method (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Cooked with olive oil spray, ate half avocado on side"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white focus:outline-none focus:ring-1 focus:ring-[#0F6E5F]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onDiscard}
              className="px-4 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#1A1D1B] transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSaveToLog}
              disabled={isSaved}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F6E5F] text-white text-xs sm:text-sm font-semibold hover:bg-[#0D5B4F] transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-[#E8912D]" />
              <span>{isSaved ? 'Saved to Tracker!' : 'Log Meal to Daily Tracker'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
