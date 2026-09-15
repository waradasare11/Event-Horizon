import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckSquare, 
  Dumbbell, 
  Utensils, 
  ShoppingCart, 
  Sparkles, 
  ArrowUpRight,
  Share2,
  FileText
} from 'lucide-react';
import { UserProfile, MealLog, WorkoutProgram, ShoppingListItem } from '../types';

interface GoogleKeepSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  mealLogs?: MealLog[];
  workoutPrograms?: WorkoutProgram[];
  shoppingList?: ShoppingListItem[];
  initialCategory?: 'shopping' | 'nutrition' | 'workout' | 'coaching';
}

export const GoogleKeepSyncModal: React.FC<GoogleKeepSyncModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  mealLogs = [],
  workoutPrograms = [],
  shoppingList = [],
  initialCategory = 'shopping',
}) => {
  const [activeCategory, setActiveCategory] = useState<'shopping' | 'nutrition' | 'workout' | 'coaching'>(initialCategory);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Generate note content based on active category
  const generateKeepNote = () => {
    const todayStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    switch (activeCategory) {
      case 'shopping': {
        const title = `🛒 AROH Grocery Checklist - ${todayStr}`;
        let itemsText = '';
        if (shoppingList.length > 0) {
          itemsText = shoppingList
            .map((item) => `☐ ${item.name} (${item.amount}) [${item.category || 'Pantry'}]`)
            .join('\n');
        } else {
          // Default recommended macro grocery list
          itemsText = [
            '☐ Chicken Breast / Paneer (High Protein source)',
            '☐ Eggs / Tofu (Micronutrients & Leucine)',
            '☐ Greek Yogurt / Low-fat Curd (Probiotics & Casein)',
            '☐ Rolled Oats / Brown Rice (Complex Carbs)',
            '☐ Spinach / Broccoli / Mixed Greens (Fiber & Nitrates)',
            '☐ Bananas & Berries (Glycogen replenishment)',
            '☐ Almonds / Walnuts / Olive Oil (Healthy Fats)',
            '☐ Whey Protein Isolate (Post-Workout Recovery)',
          ].join('\n');
        }
        return {
          title,
          content: `${title}\n\n${itemsText}\n\nGenerated with AROH AI for ${userProfile.name || 'Athlete'}.`,
        };
      }

      case 'nutrition': {
        const title = `🥗 Daily Nutrition Protocol & Macro Targets - ${todayStr}`;
        const targetCalories = userProfile.dailyCalories || 2200;
        const targetProtein = userProfile.dailyProtein || 140;
        const targetCarbs = userProfile.dailyCarbs || 220;
        const targetFat = userProfile.dailyFat || 65;

        const loggedMealsSummary =
          mealLogs.length > 0
            ? mealLogs
                .map((m) => `☐ ${m.mealTitle} - ${m.calories} kcal (${m.proteinG}g P, ${m.carbsG}g C, ${m.fatG}g F)`)
                .join('\n')
            : '☐ Breakfast: High-protein meal (35g+ Protein)\n☐ Lunch: Balanced macros & fibrous greens\n☐ Pre-Workout: Fast carbs + Hydration\n☐ Dinner: Lean protein + complex carbs\n☐ Hydration: Drink 3.5L pure water today';

        return {
          title,
          content: `${title}\n\n🎯 DAILY TARGETS:\n• Calories: ${targetCalories} kcal\n• Protein: ${targetProtein}g\n• Carbs: ${targetCarbs}g\n• Healthy Fats: ${targetFat}g\n• Water Target: 3.5 Liters\n\n🍽️ MEAL LOG CHECKLIST:\n${loggedMealsSummary}\n\nNotes: Log all meals in AROH camera scanner for instant 95%+ precision vision cross-validation.`,
        };
      }

      case 'workout': {
        const title = `🏋️ AROH Training Protocol - ${todayStr}`;
        const currentProgram = workoutPrograms[0];
        const activeDay = currentProgram?.days[0];

        let exerciseList = '';
        if (activeDay && activeDay.exercises.length > 0) {
          exerciseList = activeDay.exercises
            .map((ex) => `☐ ${ex.name} - ${ex.sets} sets × ${ex.reps} reps (Target RPE: ${ex.rpeTarget || 8})`)
            .join('\n');
        } else {
          exerciseList = [
            '☐ Barbell Back Squat - 4 sets × 6-8 reps (RPE 8)',
            '☐ Romanian Deadlift - 3 sets × 8-10 reps (RPE 8)',
            '☐ Walking Dumbbell Lunges - 3 sets × 12 reps/leg',
            '☐ Standing Calf Raises - 4 sets × 15 reps (Pause at peak)',
            '☐ Hanging Leg Raises - 3 sets × 15 reps (Core control)',
          ].join('\n');
        }

        return {
          title,
          content: `${title}\n\nSplit: ${activeDay?.dayName || 'Hypertrophy Power Phase'}\nFocus: Progressive Overload & Biomechanical Form\n\nEXERCISE CHECKLIST:\n${exerciseList}\n\nRecovery Mandate: Rest 2-3 minutes between heavy sets. Hydrate with electrolyte water.`,
        };
      }

      case 'coaching': {
        const title = `⚡ AROH AI Coaching Directives - ${todayStr}`;
        return {
          title,
          content: `${title}\n\n🎯 ATHLETE PROFILE:\n• Name: ${userProfile.name || 'Athlete'}\n• Fitness Goal: ${(userProfile.goal || 'Hypertrophy').toUpperCase()}\n• Current Weight: ${userProfile.weightKg || 70} kg\n\n📋 DAILY COACHING DIRECTIVES:\n☐ Complete today's planned lifting session with controlled tempo (2s eccentric)\n☐ Hit minimum ${userProfile.dailyProtein || 140}g protein across at least 3 feeding windows\n☐ Reach 8,000+ daily steps for active recovery and non-exercise thermogenesis (NEAT)\n☐ Sleep 7.5 - 8.5 hours in a cool, dark room for optimal GH (growth hormone) pulse\n☐ Drink 500ml water immediately upon waking\n\n"Consistency is the ultimate performance enhancer." - AROH AI Coach`,
        };
      }
    }
  };

  const currentNote = generateKeepNote();

  const handleCopyAndLaunchKeep = async () => {
    try {
      await navigator.clipboard.writeText(currentNote.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      
      // Direct deep-link to Google Keep in new tab
      window.open('https://keep.google.com/', '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error('Failed to copy note to clipboard', e);
    }
  };

  const handleCopyOnly = async () => {
    try {
      await navigator.clipboard.writeText(currentNote.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy note', e);
    }
  };

  return (
    <div
      id="google-keep-sync-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="google-keep-sync-modal-content"
        className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-amber-300 dark:border-amber-700/50 p-6 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          id="google-keep-modal-close-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close Google Keep modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
            {/* Google Keep Icon Styled */}
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="google-keep-modal-title" className="text-lg font-bold text-zinc-900 dark:text-white">
                Google Keep Integration
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Direct Sync
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Export interactive checklists directly to Google Keep with 1-click
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('shopping')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'shopping'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Grocery Checklist</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('nutrition')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'nutrition'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Macro Protocol</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('workout')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'workout'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Training Routine</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('coaching')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'coaching'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coach Directives</span>
          </button>
        </div>

        {/* Note Preview Box */}
        <div className="flex-1 overflow-y-auto mb-5">
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-left">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-200/60 dark:border-amber-800/40">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Google Keep Note Preview (Ready to Paste)
              </span>
              <button
                type="button"
                onClick={handleCopyOnly}
                className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-[#B8922A]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto pr-1">
              {currentNote.content}
            </pre>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <a
            href="https://keep.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors order-2 sm:order-1"
          >
            <span>Open keep.google.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
            <button
              id="google-keep-copy-btn"
              type="button"
              onClick={handleCopyOnly}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              id="google-keep-launch-btn"
              type="button"
              onClick={handleCopyAndLaunchKeep}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Copy & Open in Keep</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
