import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Droplets, 
  Volume2, 
  CheckCircle2, 
  Flame, 
  RefreshCw, 
  Trophy, 
  Heart, 
  Plus, 
  Bell, 
  BellRing, 
  TrendingUp, 
  Zap, 
  Apple, 
  Coffee, 
  Egg, 
  Check,
  ChevronLeft,
  ChevronRight,
  Utensils
} from 'lucide-react';
import { fireCelebrationConfetti } from '../lib/confetti';
import { MealLog, UserProfile, FavoriteMealPreset } from '../types';

interface DailyMotivationWidgetProps {
  userName?: string;
  currentStreak?: number;
  caloriesConsumed?: number;
  calorieTarget?: number;
  proteinConsumed?: number;
  proteinTarget?: number;
  hasLoggedWorkoutToday?: boolean;
  mealLogs?: MealLog[];
  userProfile?: UserProfile;
  onQuickAddMeal?: (meal: MealLog) => void;
}

const MOTIVATIONAL_TIPS = [
  {
    quote: "Consistency always beats intensity. Small daily steps lead to life-changing results.",
    tip: "Drink a tall glass of water before each meal to stay energized and aid digestion.",
    author: "AROH AI Coach"
  },
  {
    quote: "You don't have to be extreme, just consistent. Every healthy meal is a victory.",
    tip: "Aim for 20-30g of protein in your main meals to stay full and build lean muscle.",
    author: "AROH AI Coach"
  },
  {
    quote: "Focus on how you feel after your workout: energized, strong, and accomplished.",
    tip: "A 10-minute walk after lunch can improve your digestion and daily energy levels.",
    author: "AROH AI Coach"
  },
  {
    quote: "Great things take time. Trust the process and celebrate today's progress!",
    tip: "Prioritize 7-8 hours of quality sleep tonight—your body repairs and rebuilds while resting.",
    author: "AROH AI Coach"
  },
  {
    quote: "Discipline is choosing between what you want now and what you want most.",
    tip: "Keep a water bottle near your desk to hit your daily hydration goal effortlessly.",
    author: "AROH AI Coach"
  }
];

const PRESET_SNACKS = [
  {
    id: 'apple',
    name: 'Crisp Apple (1 Medium)',
    icon: '🍎',
    calories: 80,
    proteinG: 0.5,
    carbsG: 22,
    fatG: 0.2,
    category: 'Fruit',
  },
  {
    id: 'whey_shake',
    name: 'Whey Protein Shake (1 Scoop)',
    icon: '🥤',
    calories: 130,
    proteinG: 25,
    carbsG: 3,
    fatG: 1.5,
    category: 'Protein',
  },
  {
    id: 'boiled_eggs',
    name: '2 Hard-Boiled Eggs',
    icon: '🥚',
    calories: 140,
    proteinG: 12,
    carbsG: 1,
    fatG: 10,
    category: 'Protein',
  },
  {
    id: 'greek_yogurt',
    name: 'Greek Yogurt (150g)',
    icon: '🥣',
    calories: 100,
    proteinG: 15,
    carbsG: 6,
    fatG: 0,
    category: 'Dairy',
  },
  {
    id: 'banana',
    name: 'Medium Banana',
    icon: '🍌',
    calories: 105,
    proteinG: 1.3,
    carbsG: 27,
    fatG: 0.3,
    category: 'Fruit',
  },
  {
    id: 'almonds',
    name: 'Handful Almonds (25g)',
    icon: '🥜',
    calories: 145,
    proteinG: 5,
    carbsG: 5,
    fatG: 12,
    category: 'Nuts',
  },
];

const FREQUENTLY_EATEN_MEALS_DEFAULT: FavoriteMealPreset[] = [
  {
    id: 'whey_protein_shake',
    name: 'Protein Shake',
    calories: 180,
    proteinG: 30,
    carbsG: 4,
    fatG: 2,
    fiberG: 1,
    icon: '🥤',
    category: 'Snack',
  },
  {
    id: 'oatmeal_berries',
    name: 'Oatmeal & Berries',
    calories: 320,
    proteinG: 12,
    carbsG: 54,
    fatG: 6,
    fiberG: 8,
    icon: '🥣',
    category: 'Breakfast',
  },
  {
    id: 'boiled_eggs_toast',
    name: '3 Eggs & Toast',
    calories: 280,
    proteinG: 20,
    carbsG: 18,
    fatG: 12,
    fiberG: 2,
    icon: '🥚',
    category: 'Breakfast',
  },
  {
    id: 'grilled_chicken_rice',
    name: 'Chicken & Brown Rice',
    calories: 480,
    proteinG: 45,
    carbsG: 48,
    fatG: 8,
    fiberG: 4,
    icon: '🍗',
    category: 'Lunch',
  },
  {
    id: 'paneer_tikka_bowl',
    name: 'Paneer Rice Bowl',
    calories: 450,
    proteinG: 24,
    carbsG: 44,
    fatG: 18,
    fiberG: 5,
    icon: '🧀',
    category: 'Lunch',
  },
  {
    id: 'greek_yogurt_almonds',
    name: 'Greek Yogurt & Almonds',
    calories: 220,
    proteinG: 18,
    carbsG: 14,
    fatG: 8,
    fiberG: 3,
    icon: '🥛',
    category: 'Snack',
  },
  {
    id: 'peanut_butter_toast',
    name: 'PB Banana Toast',
    calories: 310,
    proteinG: 11,
    carbsG: 42,
    fatG: 13,
    fiberG: 4,
    icon: '🥪',
    category: 'Breakfast',
  },
  {
    id: 'dal_tadka_roti',
    name: 'Dal Tadka & 2 Rotis',
    calories: 380,
    proteinG: 16,
    carbsG: 58,
    fatG: 9,
    fiberG: 8,
    icon: '🫘',
    category: 'Dinner',
  },
  {
    id: 'tofu_quinoa_stirfry',
    name: 'Tofu Quinoa Stir-Fry',
    calories: 340,
    proteinG: 22,
    carbsG: 28,
    fatG: 14,
    fiberG: 6,
    icon: '🥗',
    category: 'Dinner',
  },
];

export const DailyMotivationWidget: React.FC<DailyMotivationWidgetProps> = ({
  userName = 'Athlete',
  currentStreak = 1,
  caloriesConsumed = 0,
  calorieTarget = 2000,
  proteinConsumed = 0,
  proteinTarget = 150,
  hasLoggedWorkoutToday = false,
  mealLogs = [],
  userProfile,
  onQuickAddMeal,
}) => {
  const frequentMealsScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollFrequentMeals = (direction: 'left' | 'right') => {
    if (frequentMealsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      frequentMealsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Combine user profile favorite meals with defaults
  const frequentMealsList = useMemo(() => {
    const userFavorites = userProfile?.favoriteMeals || [];
    const combined = [...userFavorites, ...FREQUENTLY_EATEN_MEALS_DEFAULT];
    // deduplicate by name
    const seen = new Set<string>();
    return combined.filter(m => {
      const key = m.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [userProfile?.favoriteMeals]);

  const handleQuickAddFrequentMeal = (meal: FavoriteMealPreset) => {
    if (onQuickAddMeal) {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const hoursStr = String(now.getHours()).padStart(2, '0');
      const minsStr = String(now.getMinutes()).padStart(2, '0');
      const newMealLog: MealLog = {
        id: `frequent_meal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        mealTitle: meal.name,
        mealType: meal.category && ['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(meal.category) ? (meal.category as any) : 'Snack',
        date: todayStr,
        time: `${hoursStr}:${minsStr}`,
        isEstimated: false,
        calories: meal.calories,
        proteinG: meal.proteinG,
        carbsG: meal.carbsG,
        fatG: meal.fatG,
        fiberG: meal.fiberG || 2,
        items: [
          {
            name: meal.name,
            portionDescription: '1 standard meal serving',
            weightG: 200,
            calories: meal.calories,
            proteinG: meal.proteinG,
            carbsG: meal.carbsG,
            fatG: meal.fatG,
            confidenceScorePct: 99,
          },
        ],
        notes: `Quick logged from frequently eaten meals strip.`,
      };

      onQuickAddMeal(newMealLog);
      setLastAddedSnack(`${meal.name} (${meal.calories} kcal • ${meal.proteinG}g P)`);
      fireCelebrationConfetti();
      setTimeout(() => setLastAddedSnack(null), 3500);
    }
  };
  // Daily Water Tracker state
  const todayKey = `water_intake_${new Date().toISOString().split('T')[0]}`;
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    const saved = localStorage.getItem(todayKey);
    return saved ? parseInt(saved, 10) : 3;
  });

  const [quoteIndex, setQuoteIndex] = useState<number>(() => Math.floor(Math.random() * MOTIVATIONAL_TIPS.length));
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [lastAddedSnack, setLastAddedSnack] = useState<string | null>(null);

  // 'Remind me to train' notification settings
  const [remindWorkout, setRemindWorkout] = useState<boolean>(() => {
    let legacy = localStorage.getItem('peakform_remind_workout');
    if (legacy !== null) {
      localStorage.setItem('aroh_remind_workout', legacy);
      localStorage.removeItem('peakform_remind_workout');
    }
    return localStorage.getItem('aroh_remind_workout') === 'true';
  });
  const [workoutReminderTime, setWorkoutReminderTime] = useState<string>(() => {
    let legacy = localStorage.getItem('peakform_workout_reminder_time');
    if (legacy !== null) {
      localStorage.setItem('aroh_workout_reminder_time', legacy);
      localStorage.removeItem('peakform_workout_reminder_time');
    }
    return localStorage.getItem('aroh_workout_reminder_time') || '18:00';
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });
  const [reminderTestStatus, setReminderTestStatus] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(todayKey, waterGlasses.toString());
  }, [waterGlasses, todayKey]);

  useEffect(() => {
    localStorage.setItem('aroh_remind_workout', remindWorkout ? 'true' : 'false');
  }, [remindWorkout]);

  useEffect(() => {
    localStorage.setItem('aroh_workout_reminder_time', workoutReminderTime);
  }, [workoutReminderTime]);

  const addGlass = () => {
    if (waterGlasses < 12) {
      const next = waterGlasses + 1;
      setWaterGlasses(next);
      if (next === 8) {
        fireCelebrationConfetti();
      }
    }
  };

  const removeGlass = () => {
    if (waterGlasses > 0) {
      setWaterGlasses(waterGlasses - 1);
    }
  };

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_TIPS.length);
  };

  const currentTip = MOTIVATIONAL_TIPS[quoteIndex];

  // Text-to-speech audio coach cue
  const speakMotivation = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `Hello ${userName}! Here is your daily motivation: ${currentTip.quote} Quick tip: ${currentTip.tip}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Workout notification toggle handler
  const handleToggleReminder = async () => {
    if (!remindWorkout) {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          setRemindWorkout(true);
          try {
            new Notification('🔔 AROH Workout Reminder Activated', {
              body: `We will remind you to train daily at ${workoutReminderTime}. Stay relentless!`,
              icon: '/favicon.ico',
            });
          } catch (e) {}
        } else {
          alert('Please allow browser notifications in your browser settings to receive training reminders.');
        }
      } else {
        setRemindWorkout(true);
      }
    } else {
      setRemindWorkout(false);
    }
  };

  const handleTestNotification = () => {
    setReminderTestStatus('Triggering test reminder...');
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('💪 AROH: Time to Crush Your Workout!', {
          body: `Hey ${userName}, it's ${workoutReminderTime}! Your training session is ready. Let's make today count!`,
          icon: '/favicon.ico',
        });
        setReminderTestStatus('Notification sent successfully!');
      } catch (e) {
        setReminderTestStatus('Notification fired.');
      }
    } else {
      alert(`[AROH Reminder Preview]: Time to train! Daily workout scheduled for ${workoutReminderTime}.`);
      setReminderTestStatus('Alert preview displayed.');
    }
    setTimeout(() => setReminderTestStatus(null), 3000);
  };

  // Quick Add pre-configured snack handler
  const handleLogPresetSnack = (snack: typeof PRESET_SNACKS[0]) => {
    if (onQuickAddMeal) {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const hoursStr = String(now.getHours()).padStart(2, '0');
      const minsStr = String(now.getMinutes()).padStart(2, '0');
      const newMealLog: MealLog = {
        id: `snack_quick_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        mealTitle: snack.name,
        mealType: 'Snack',
        date: todayStr,
        time: `${hoursStr}:${minsStr}`,
        isEstimated: false,
        calories: snack.calories,
        proteinG: snack.proteinG,
        carbsG: snack.carbsG,
        fatG: snack.fatG,
        fiberG: 1.5,
        items: [
          {
            name: snack.name,
            portionDescription: '1 serving',
            weightG: 100,
            calories: snack.calories,
            proteinG: snack.proteinG,
            carbsG: snack.carbsG,
            fatG: snack.fatG,
            confidenceScorePct: 98,
          },
        ],
        notes: `Quick logged via Daily Motivation Widget preset.`,
      };

      onQuickAddMeal(newMealLog);
      setLastAddedSnack(snack.name);
      fireCelebrationConfetti();
      setTimeout(() => setLastAddedSnack(null), 3000);
    }
  };

  // 1. Math for Radial Progress Bar
  const safeCalorieTarget = Math.max(1, calorieTarget);
  const calPercent = Math.min(100, Math.round((caloriesConsumed / safeCalorieTarget) * 100));
  const calRemaining = Math.max(0, safeCalorieTarget - caloriesConsumed);

  const safeProteinTarget = Math.max(1, proteinTarget);
  const proPercent = Math.min(100, Math.round((proteinConsumed / safeProteinTarget) * 100));
  const proRemaining = Math.max(0, safeProteinTarget - proteinConsumed);

  // SVG Radial Geometry (Dual concentric circles)
  const calRadius = 42;
  const calCircumference = 2 * Math.PI * calRadius;
  const calStrokeDashoffset = calCircumference - (Math.min(100, calPercent) / 100) * calCircumference;

  const proRadius = 31;
  const proCircumference = 2 * Math.PI * proRadius;
  const proStrokeDashoffset = proCircumference - (Math.min(100, proPercent) / 100) * proCircumference;

  const hasLoggedMeal = caloriesConsumed > 0;
  const isWaterGoalMet = waterGlasses >= 8;

  return (
    <div className="mb-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-purple-500/10 dark:from-cyan-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 border border-cyan-500/25 p-5 sm:p-6 text-left space-y-5 shadow-sm transition-all">
      
      {/* Top Banner: Greeting, Streak & Audio Coach */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
            <Heart className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                Welcome back, {userName}!
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-black">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {currentStreak} Day Streak
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              "{currentTip.quote}"
            </p>
          </div>
        </div>

        {/* Action buttons: Audio Coach & Refresh Quote */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={speakMotivation}
            disabled={isPlayingAudio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1D1C] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 hover:border-[#0F6E5F] transition-all cursor-pointer shadow-2xs"
            title="Listen to daily coach motivation"
          >
            <Volume2 className={`w-3.5 h-3.5 text-[#0F6E5F] dark:text-[#2DD4BF] ${isPlayingAudio ? 'animate-pulse text-amber-500' : ''}`} />
            <span>{isPlayingAudio ? 'Speaking...' : 'Audio Coach'}</span>
          </button>

          <button
            type="button"
            onClick={handleNextQuote}
            className="p-2 rounded-xl bg-white dark:bg-[#1A1D1C] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-[#0F6E5F] transition-all cursor-pointer"
            title="Next motivation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Stats Grid: Radial Target Progress + Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
        
        {/* Module 1: Radial Progress Bar (Remaining Calorie & Protein Targets) */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-white dark:bg-[#161817] border border-emerald-500/20 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>Target Radial Balance</span>
            </div>
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
              Remaining Targets
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* SVG Concentric Dual Radial Meter */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background tracks */}
                <circle
                  cx="50"
                  cy="50"
                  r={calRadius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-100 dark:text-[#252826]"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={proRadius}
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-gray-100 dark:text-[#252826]"
                />

                {/* Outer Progress: Calories (Emerald/Teal) */}
                <circle
                  cx="50"
                  cy="50"
                  r={calRadius}
                  stroke="url(#calGrad)"
                  strokeWidth="8"
                  strokeDasharray={calCircumference}
                  strokeDashoffset={calStrokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />

                {/* Inner Progress: Protein (Amber/Orange) */}
                <circle
                  cx="50"
                  cy="50"
                  r={proRadius}
                  stroke="url(#proGrad)"
                  strokeWidth="6"
                  strokeDasharray={proCircumference}
                  strokeDashoffset={proStrokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />

                <defs>
                  <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#0F6E5F" />
                  </linearGradient>
                  <linearGradient id="proGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center icon / percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xs font-black text-gray-900 dark:text-white leading-none">
                  {calPercent}%
                </span>
                <span className="text-[9px] text-gray-400 font-bold leading-none mt-0.5">
                  kcal
                </span>
              </div>
            </div>

            {/* Target Breakdown Readout */}
            <div className="flex-1 space-y-2 text-xs">
              {/* Calorie Stats */}
              <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Calories</span>
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    {caloriesConsumed} / {safeCalorieTarget} kcal
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                    {calRemaining} left
                  </span>
                  <div className="text-[9px] text-emerald-600/80 font-bold">
                    {calPercent}% done
                  </div>
                </div>
              </div>

              {/* Protein Stats */}
              <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                    <span>Protein</span>
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    {proteinConsumed} / {safeProteinTarget}g
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-amber-700 dark:text-amber-300">
                    {proRemaining}g left
                  </span>
                  <div className="text-[9px] text-amber-600/80 font-bold">
                    {proPercent}% done
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module 3: Quick Add Snacks & Workout Reminder Controls */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-white dark:bg-[#161817] border border-emerald-500/20 shadow-xs flex flex-col justify-between space-y-3">
          {/* Quick Add Snack Launcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Apple className="w-4 h-4 text-red-500" />
                <span>Quick Add Snack</span>
              </span>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                className="text-[11px] font-extrabold text-[#0F6E5F] dark:text-[#2DD4BF] hover:underline cursor-pointer flex items-center gap-0.5"
              >
                {isQuickAddOpen ? 'Close' : 'Presets +'}
              </button>
            </div>

            {lastAddedSnack && (
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 mb-2 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Logged {lastAddedSnack}!</span>
              </div>
            )}

            {/* Quick 1-Click Common Snack Chips */}
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_SNACKS.slice(0, 4).map((snack) => (
                <button
                  key={snack.id}
                  type="button"
                  onClick={() => handleLogPresetSnack(snack)}
                  className="p-1.5 rounded-xl bg-gray-50 dark:bg-[#1F2220] hover:bg-emerald-500/15 border border-gray-200 dark:border-gray-800 hover:border-emerald-500/30 text-left text-[11px] transition-all cursor-pointer flex items-center gap-1.5 group"
                  title={`${snack.name} • ${snack.calories} kcal, ${snack.proteinG}g P`}
                >
                  <span className="text-sm shrink-0">{snack.icon}</span>
                  <div className="truncate">
                    <div className="font-bold text-gray-900 dark:text-white truncate">
                      {snack.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-gray-500 group-hover:text-emerald-600">
                      {snack.calories} kcal
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 'Remind Me to Train' Toggle & Workout Scheduler */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer">
                {remindWorkout ? (
                  <BellRing className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                ) : (
                  <Bell className="w-3.5 h-3.5 text-gray-400" />
                )}
                <span>Remind me to train</span>
              </label>

              {/* Native styled toggle */}
              <button
                type="button"
                onClick={handleToggleReminder}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  remindWorkout ? 'bg-[#0F6E5F]' : 'bg-gray-300 dark:bg-gray-700'
                }`}
                title="Toggle workout browser notifications"
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                    remindWorkout ? 'right-0.75' : 'left-0.75'
                  }`}
                />
              </button>
            </div>

            {remindWorkout && (
              <div className="flex items-center justify-between gap-2 pt-1 animate-in fade-in">
                <input
                  type="time"
                  value={workoutReminderTime}
                  onChange={(e) => setWorkoutReminderTime(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-gray-50 dark:bg-[#1A1D1C] border border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-800 dark:text-gray-200 outline-hidden"
                  title="Select preferred daily workout time"
                />

                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 hover:text-[#0F6E5F] underline cursor-pointer"
                >
                  Test Alert
                </button>
              </div>
            )}

            {reminderTestStatus && (
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {reminderTestStatus}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Horizontal Scroll of Quick Add Frequently Eaten Meals */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#161817] border border-emerald-500/20 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Zap className="w-4 h-4 fill-amber-500" />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span>Frequently Eaten Meals</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#0F6E5F]/10 text-[#0F6E5F] dark:text-[#5FD1B8]">
                  One-Tap Quick Add
                </span>
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Tap any meal to log instantly into today's nutrition diary
              </p>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollFrequentMeals('left')}
              className="p-1.5 rounded-xl bg-gray-100 dark:bg-[#252826] hover:bg-gray-200 dark:hover:bg-[#2E3230] text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollFrequentMeals('right')}
              className="p-1.5 rounded-xl bg-gray-100 dark:bg-[#252826] hover:bg-gray-200 dark:hover:bg-[#2E3230] text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrolling Strip */}
        <div
          ref={frequentMealsScrollRef}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 pt-1 scroll-smooth"
        >
          {frequentMealsList.map((meal) => (
            <button
              key={meal.id}
              type="button"
              onClick={() => handleQuickAddFrequentMeal(meal)}
              className="shrink-0 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#1A1D1C] hover:bg-emerald-50 dark:hover:bg-[#0F6E5F]/15 border border-gray-200 dark:border-gray-800 hover:border-emerald-500/50 transition-all cursor-pointer text-left group shadow-2xs hover:scale-102 hover:shadow-xs active:scale-98"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {meal.icon || '🍽️'}
              </span>
              <div className="space-y-0.5">
                <div className="text-xs font-black text-gray-900 dark:text-white group-hover:text-[#0F6E5F] dark:group-hover:text-[#5FD1B8] whitespace-nowrap">
                  {meal.name}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                    {meal.calories} kcal
                  </span>
                  <span>•</span>
                  <span className="text-amber-700 dark:text-amber-400 font-extrabold">
                    {meal.proteinG}g Protein
                  </span>
                </div>
              </div>
              <span className="p-1 rounded-lg bg-emerald-500/10 text-[#0F6E5F] dark:text-[#5FD1B8] opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Quick Add Presets Drawer */}
      {isQuickAddOpen && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161817] border border-emerald-500/30 shadow-md space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Full One-Click Healthy Snack Menu</span>
            </span>
            <span className="text-[11px] text-gray-500">Tap any item to instantly add to today's log</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {PRESET_SNACKS.map((snack) => (
              <button
                key={snack.id}
                type="button"
                onClick={() => handleLogPresetSnack(snack)}
                className="p-3 rounded-2xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-gray-200 dark:border-gray-800 hover:border-emerald-500 hover:bg-emerald-500/5 text-center space-y-1 transition-all cursor-pointer group"
              >
                <div className="text-2xl">{snack.icon}</div>
                <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {snack.name}
                </div>
                <div className="text-[11px] font-black text-[#0F6E5F] dark:text-[#2DD4BF]">
                  {snack.calories} kcal
                </div>
                <div className="text-[10px] text-gray-500">
                  {snack.proteinG}g Protein
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Row: Hydration Tracker + Today's Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-emerald-500/15">
        
        {/* Interactive Hydration Tracker */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161817] border border-emerald-500/20 flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900 dark:text-white">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>Daily Water Tracker</span>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {waterGlasses} / 8 Glasses ({Math.round(waterGlasses * 0.25 * 10) / 10}L)
            </span>
          </div>

          {/* Water Glasses visual dots */}
          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: 8 }).map((_, idx) => {
              const filled = idx < waterGlasses;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setWaterGlasses(idx + 1)}
                  className={`h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    filled
                      ? 'bg-blue-500 text-white shadow-xs scale-105'
                      : 'bg-gray-100 dark:bg-[#252826] text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-950/40'
                  }`}
                  title={`Glass ${idx + 1}`}
                >
                  <Droplets className={`w-3.5 h-3.5 ${filled ? 'fill-white' : ''}`} />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[11px] text-gray-500">
              {isWaterGoalMet ? 'Hydration goal achieved!' : 'Aim for 8 glasses daily to stay energized'}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={removeGlass}
                disabled={waterGlasses === 0}
                className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-[#252826] text-gray-700 dark:text-gray-300 text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                -1
              </button>
              <button
                type="button"
                onClick={addGlass}
                className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                +1 Glass
              </button>
            </div>
          </div>
        </div>

        {/* Daily Simple Win Checklist */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161817] border border-emerald-500/20 flex flex-col justify-between space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-extrabold text-gray-900 dark:text-white">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Today's 3 Simple Wins</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {[isWaterGoalMet, hasLoggedMeal, hasLoggedWorkoutToday].filter(Boolean).length} / 3 Completed
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            {/* Win 1 */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-[#1A1D1C] border border-gray-100 dark:border-gray-800">
              <span className="text-gray-800 dark:text-gray-200">1. Drink 8 glasses of water</span>
              {isWaterGoalMet ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20 shrink-0" />
              ) : (
                <span className="text-[10px] text-gray-400 font-bold">{waterGlasses}/8</span>
              )}
            </div>

            {/* Win 2 */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-[#1A1D1C] border border-gray-100 dark:border-gray-800">
              <span className="text-gray-800 dark:text-gray-200">2. Log meals & hit protein goal</span>
              {hasLoggedMeal ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20 shrink-0" />
              ) : (
                <span className="text-[10px] text-amber-600 font-bold">Log with Quick Add or Scan</span>
              )}
            </div>

            {/* Win 3 */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-[#1A1D1C] border border-gray-100 dark:border-gray-800">
              <span className="text-gray-800 dark:text-gray-200">3. Complete daily workout or walk</span>
              {hasLoggedWorkoutToday ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20 shrink-0" />
              ) : (
                <span className="text-[10px] text-gray-400 font-bold">
                  {remindWorkout ? `Reminder set for ${workoutReminderTime}` : 'Pending'}
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
