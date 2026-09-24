import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  ExternalLink, 
  Check, 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  Scale, 
  Lock, 
  Globe, 
  ChefHat, 
  Zap, 
  AlertCircle,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { UserProfile, MealLog, ReverseVisualRecipeMatchResult } from '../types';

interface ReverseVisualRecipeMatcherProps {
  userProfile: UserProfile;
  onSaveToMealLog: (log: MealLog) => void;
}

const SAMPLE_MATCH_ITEMS = [
  {
    title: 'Sabudana Khichdi with Dahi-Peanut Chutney',
    region: 'Maharashtrian / Fasting',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    hint: 'Cooked tapioca pearls with crushed roasted peanuts, boiled potato cubes, and peanut-dahi chutney',
  },
  {
    title: 'Paneer Bhurji & Whole Wheat Phulkas',
    region: 'North Indian Athletic',
    url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80',
    hint: 'Scrambled low-fat paneer with turmeric, tomatoes, onions, and whole wheat phulkas',
  },
  {
    title: 'South Indian Crispy Masala Dosa & Sambar',
    region: 'South Indian',
    url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
    hint: 'Fermented crepe with spiced potato masala and toor dal moringa sambar',
  },
  {
    title: 'Steamed Gujarati Khaman Dhokla',
    region: 'Western Indian',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    hint: 'Steamed fermented gram flour sponge tempered with mustard seeds and curry leaves',
  },
];

export const ReverseVisualRecipeMatcher: React.FC<ReverseVisualRecipeMatcherProps> = ({
  userProfile,
  onSaveToMealLog,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dishHint, setDishHint] = useState<string>('');
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchResult, setMatchResult] = useState<ReverseVisualRecipeMatchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      executeMatch(dataUrl, dishHint);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sample: typeof SAMPLE_MATCH_ITEMS[0]) => {
    try {
      setIsMatching(true);
      setErrorMessage(null);
      setDishHint(sample.hint);

      const res = await fetch(sample.url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        executeMatch(base64, sample.hint);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error('Failed to load sample image', err);
      setErrorMessage('Failed to load sample image. Please upload a photo directly.');
      setIsMatching(false);
    }
  };

  const executeMatch = async (imageBase64: string, hint?: string) => {
    try {
      setIsMatching(true);
      setErrorMessage(null);
      setMatchResult(null);

      const res = await fetch('/api/ai/visual-web-recipe-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: 'image/jpeg',
          dishNameHint: hint || dishHint || 'Indian / Global Dish',
          userProfile,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'Visual recipe match failed');
      }

      setMatchResult(data.data);
    } catch (err: any) {
      console.error('Error during visual recipe match:', err);
      setErrorMessage(err.message || 'Visual web match failed. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  const handleLogMatchedRecipe = () => {
    if (!matchResult) return;

    const log: MealLog = {
      id: `visual-match-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType: 'Lunch',
      mealTitle: matchResult.matchedDishName,
      calories: matchResult.macros.calories,
      proteinG: matchResult.macros.proteinG,
      carbsG: matchResult.macros.carbsG,
      fatG: matchResult.macros.fatG,
      fiberG: matchResult.macros.fiberG,
      photoUrl: selectedImage || undefined,
      isEstimated: false,
      items: matchResult.deconstructedIngredients.map((ing) => ({
        name: ing.name,
        portionDescription: `${ing.weightG}g (${ing.hindiName || ing.name})`,
        weightG: ing.weightG,
        calories: ing.calories,
        proteinG: ing.proteinG,
        carbsG: ing.carbsG,
        fatG: ing.fatG,
        ingredientSource: ing.source,
      })),
      notes: `Matched via Google Grounded Visual Search (${matchResult.confidenceScore}% confidence). ${matchResult.spiceBlendProfile.name}.`,
    };

    onSaveToMealLog(log);
    setToastMessage(`Logged "${matchResult.matchedDishName}" to daily journal!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
              Google Grounded Visual Search
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDF3D0] dark:bg-[#2A2416]/60 text-[#8E701C] dark:text-[#F0D060] flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              Pan-Indian & Global Recipes
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1F2421] dark:text-[#F5F5F0]">
            Photo-Based Reverse Web Recipe Matcher
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6460] dark:text-[#9EA8A2] mt-1 max-w-2xl">
            Upload or snap a photo of any plate. Computer vision analyzes live culinary databases to identify the authentic regional recipe, calculate exact per-gram IFCT ingredients, and optimize cooking fat.
          </p>
        </div>
      </div>

      {/* Main Grid: Upload & Photo Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#111111] p-5 rounded-3xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs space-y-4">
            <div className="relative aspect-4/3 w-full bg-[#1A1D1B] rounded-2xl overflow-hidden border border-[#E5E7EB] dark:border-[#2A2416] flex items-center justify-center">
              {isMatching ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <RefreshCw className="w-10 h-10 text-[#D4AF37] animate-spin" />
                  <div className="text-white font-bold text-sm">
                    Searching Web & IFCT Tables...
                  </div>
                  <p className="text-xs text-stone-400 max-w-xs">
                    Cross-referencing photo features against pan-Indian regional recipe databases.
                  </p>
                </div>
              ) : selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Selected meal"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <ChefHat className="w-12 h-12 text-[#D4AF37] mx-auto opacity-60" />
                  <div className="text-white font-bold text-sm">No photo selected</div>
                  <p className="text-xs text-stone-400">
                    Upload a plate photo or tap a regional sample below.
                  </p>
                </div>
              )}
            </div>

            {/* Optional Hint Input */}
            <div>
              <label className="text-xs font-bold text-[#5C6460] dark:text-[#9EA8A2] block mb-1">
                Optional Dish Hint / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Sabudana khichdi with peanut chutney, or Dal Makhani"
                value={dishHint}
                onChange={(e) => setDishHint(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAFAF8] dark:bg-[#1F2421] border border-[#E5E7EB] dark:border-[#2A2416] rounded-xl text-xs font-medium text-[#1F2421] dark:text-[#F5F5F0] focus:ring-2 focus:ring-[#D4AF37] outline-hidden"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isMatching}
                className="flex-1 px-4 py-3 bg-[#D4AF37] hover:bg-[#0D5A4E] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Dish Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {selectedImage && (
                <button
                  onClick={() => executeMatch(selectedImage, dishHint)}
                  disabled={isMatching}
                  className="px-4 py-3 bg-[#E8912D] hover:bg-[#D97D1A] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>Re-Match</span>
                </button>
              )}
            </div>

            {/* Sample Indian Dishes */}
            <div className="pt-2 border-t border-[#F0F0EC] dark:border-[#2A2416]">
              <div className="text-xs font-bold text-[#5C6460] dark:text-[#9EA8A2] mb-2">
                Or Test-Drive Authentic Regional Presets:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_MATCH_ITEMS.map((sample) => (
                  <button
                    key={sample.title}
                    onClick={() => handleSelectSample(sample)}
                    disabled={isMatching}
                    className="p-2.5 bg-[#FAFAF8] dark:bg-[#111111] hover:bg-[#FFFBF0] dark:hover:bg-[#D4AF37]/20 border border-[#E5E7EB] dark:border-[#2A2416] rounded-xl text-left transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="font-bold text-[11px] text-[#1F2421] dark:text-[#F5F5F0] truncate">
                      {sample.title}
                    </div>
                    <div className="text-[10px] text-[#D4AF37] dark:text-[#F0D060] mt-0.5">
                      {sample.region}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Web Match & Grounded Intelligence Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {matchResult ? (
            <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs space-y-5">
              {/* Header Title & Match Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F0EC] dark:border-[#2A2416] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#F0D060] uppercase tracking-wider">
                      {matchResult.regionalOrigin}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF3D0] dark:bg-[#2A2416]/60 text-[#8E701C] dark:text-[#F0D060] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {matchResult.confidenceScore}% Visual Match
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#1F2421] dark:text-[#F5F5F0] mt-1">
                    {matchResult.matchedDishName}
                  </h3>
                </div>

                <button
                  onClick={handleLogMatchedRecipe}
                  className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#0D5A4E] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>Log to Daily Journal</span>
                </button>
              </div>

              {/* Macro Dashboard */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#FAFAF8] dark:bg-[#111111] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] text-center">
                  <div className="text-xs font-bold text-[#E8912D]">Calories</div>
                  <div className="text-lg font-black text-[#1F2421] dark:text-[#F5F5F0]">
                    {matchResult.macros.calories} <span className="text-xs font-normal text-[#6B7280]">kcal</span>
                  </div>
                </div>

                <div className="p-3 bg-[#FFFBF0]/50 dark:bg-[#2A2416]/20 rounded-2xl border border-[#E6D7A8] dark:border-[#2A2416]/40 text-center">
                  <div className="text-xs font-bold text-[#D4AF37] dark:text-[#1D9E75]">Protein</div>
                  <div className="text-lg font-black text-[#D4AF37] dark:text-[#1D9E75]">
                    {matchResult.macros.proteinG} <span className="text-xs font-normal text-[#6B7280]">g</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/40 text-center">
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400">Carbs</div>
                  <div className="text-lg font-black text-amber-700 dark:text-amber-300">
                    {matchResult.macros.carbsG} <span className="text-xs font-normal text-[#6B7280]">g</span>
                  </div>
                </div>

                <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/40 text-center">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400">Fats</div>
                  <div className="text-lg font-black text-rose-700 dark:text-rose-300">
                    {matchResult.macros.fatG} <span className="text-xs font-normal text-[#6B7280]">g</span>
                  </div>
                </div>
              </div>

              {/* Description & Cooking Technique */}
              <div className="p-4 bg-[#FAFAF8] dark:bg-[#111111] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] space-y-2">
                <div className="text-xs font-bold text-[#1F2421] dark:text-[#F5F5F0] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Authentic Recipe & Cooking Technique</span>
                </div>
                <p className="text-xs text-[#5C6460] dark:text-[#9EA8A2] leading-relaxed">
                  {matchResult.authenticDescription}
                </p>
                <div className="text-[11px] font-semibold text-[#D4AF37] dark:text-[#F0D060]">
                  Technique: {matchResult.preparationTechnique}
                </div>
              </div>

              {/* Deconstructed Ingredients Table (Per-Gram IFCT Precision) */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#1F2421] dark:text-[#F5F5F0] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Deconstructed Ingredients ({matchResult.deconstructedIngredients.length})</span>
                  </span>
                  <span className="text-[11px] text-[#6B7280]">
                    Portion: ~{matchResult.detectedServingG}g
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {matchResult.deconstructedIngredients.map((ing, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-[#FAFAF8] dark:bg-[#111111] rounded-xl border border-[#E5E7EB] dark:border-[#2A2416] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#1F2421] dark:text-[#F5F5F0]">
                          {ing.name}
                        </span>
                        {ing.hindiName && (
                          <span className="text-[#6B7280] dark:text-[#9EA8A2] ml-1.5 text-[11px]">
                            ({ing.hindiName})
                          </span>
                        )}
                        <div className="text-[10px] text-[#D4AF37] dark:text-[#F0D060]">
                          {ing.source}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-[#1F2421] dark:text-[#F5F5F0]">
                          {ing.weightG}g
                        </span>
                        <div className="text-[10px] text-[#6B7280]">
                          {ing.calories} kcal • {ing.proteinG}g P
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spice Bioactive & Fat Savings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-1">
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>{matchResult.spiceBlendProfile.name}</span>
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">
                    {matchResult.spiceBlendProfile.bioactiveCompounds}
                  </div>
                </div>

                <div className="p-3.5 bg-[#FFFBF0]/50 dark:bg-[#2A2416]/20 rounded-2xl border border-[#E6D7A8] dark:border-[#2A2416]/40 space-y-1">
                  <div className="text-xs font-bold text-[#8E701C] dark:text-[#F0D060] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Tadka Cooking Fat Savings</span>
                  </div>
                  <div className="text-[11px] text-[#A68523] dark:text-[#F0D060]">
                    Saves <strong>{matchResult.traditionalFatAdjustment.calorieSavings} kcal</strong> by tempering with {matchResult.traditionalFatAdjustment.fitnessOptimizedFatG}g fat instead of standard {matchResult.traditionalFatAdjustment.standardGheeOrOilG}g.
                  </div>
                </div>
              </div>

              {/* Dietary Lock & Web Grounding Citations */}
              <div className="pt-3 border-t border-[#F0F0EC] dark:border-[#2A2416] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-[#8E701C] dark:text-[#F0D060] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Dietary Classification: {matchResult.dietaryClassification}</span>
                </div>

                {matchResult.matchedWebSources && matchResult.matchedWebSources.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-[#6B7280]">Sources:</span>
                    {matchResult.matchedWebSources.slice(0, 2).map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-[#D4AF37] dark:text-[#F0D060] hover:underline bg-[#FAFAF8] dark:bg-[#111111] px-2 py-0.5 rounded-md border border-[#E5E7EB] dark:border-[#2A2416]"
                      >
                        <span className="truncate max-w-[120px]">{src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 bg-white dark:bg-[#111111] rounded-3xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs text-center space-y-3">
              <Search className="w-12 h-12 text-[#D4AF37] mx-auto opacity-40" />
              <h3 className="text-base font-bold text-[#1F2421] dark:text-[#F5F5F0]">
                Awaiting Photo for Web Recipe Search
              </h3>
              <p className="text-xs text-[#5C6460] dark:text-[#9EA8A2] max-w-md mx-auto">
                Select an image on the left or choose a preset to initiate Google Search grounding across thousands of regional recipes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
