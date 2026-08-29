import React, { useState, useEffect } from 'react';
import { Sparkles, Droplets, Volume2, CheckCircle2, Flame, RefreshCw, Trophy, Heart } from 'lucide-react';
import { fireCelebrationConfetti } from '../lib/confetti';

interface DailyMotivationWidgetProps {
  userName?: string;
  currentStreak?: number;
  caloriesConsumed?: number;
  calorieTarget?: number;
  proteinConsumed?: number;
  proteinTarget?: number;
  hasLoggedWorkoutToday?: boolean;
}

const MOTIVATIONAL_TIPS = [
  {
    quote: "Consistency always beats intensity. Small daily steps lead to life-changing results.",
    tip: "Drink a tall glass of water before each meal to stay energized and aid digestion.",
    author: "PeakForm Coach"
  },
  {
    quote: "You don't have to be extreme, just consistent. Every healthy meal is a victory.",
    tip: "Aim for 20-30g of protein in your main meals to stay full and build lean muscle.",
    author: "PeakForm Coach"
  },
  {
    quote: "Focus on how you feel after your workout: energized, strong, and accomplished.",
    tip: "A 10-minute walk after lunch can improve your digestion and daily energy levels.",
    author: "PeakForm Coach"
  },
  {
    quote: "Great things take time. Trust the process and celebrate today's progress!",
    tip: "Prioritize 7-8 hours of quality sleep tonight—your body repairs and rebuilds while resting.",
    author: "PeakForm Coach"
  },
  {
    quote: "Discipline is choosing between what you want now and what you want most.",
    tip: "Keep a water bottle near your desk to hit your daily hydration goal effortlessly.",
    author: "PeakForm Coach"
  }
];

export const DailyMotivationWidget: React.FC<DailyMotivationWidgetProps> = ({
  userName = 'Athlete',
  currentStreak = 1,
  caloriesConsumed = 0,
  calorieTarget = 2000,
  proteinConsumed = 0,
  proteinTarget = 150,
  hasLoggedWorkoutToday = false,
}) => {
  // Daily Water Tracker state (stored in localStorage)
  const todayKey = `water_intake_${new Date().toISOString().split('T')[0]}`;
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    const saved = localStorage.getItem(todayKey);
    return saved ? parseInt(saved, 10) : 3;
  });

  const [quoteIndex, setQuoteIndex] = useState<number>(() => Math.floor(Math.random() * MOTIVATIONAL_TIPS.length));
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(todayKey, waterGlasses.toString());
  }, [waterGlasses, todayKey]);

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

  const hasLoggedMeal = caloriesConsumed > 0;
  const isWaterGoalMet = waterGlasses >= 8;

  return (
    <div className="mb-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-cyan-950/20 border border-emerald-500/20 p-5 sm:p-6 text-left space-y-4 shadow-sm transition-all">
      {/* Top Banner: Greeting & Audio Coach */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0F6E5F] text-white flex items-center justify-center shadow-sm shrink-0">
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

      {/* Grid: Hydration Tracker + Today's Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-emerald-500/15">
        
        {/* Interactive Hydration Tracker */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161817] border border-emerald-500/20 flex flex-col justify-between space-y-3">
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
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161817] border border-emerald-500/20 flex flex-col justify-between space-y-2.5">
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
                <span className="text-[10px] text-amber-600 font-bold">Tap Scanner</span>
              )}
            </div>

            {/* Win 3 */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-[#1A1D1C] border border-gray-100 dark:border-gray-800">
              <span className="text-gray-800 dark:text-gray-200">3. Complete daily workout or walk</span>
              {hasLoggedWorkoutToday ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20 shrink-0" />
              ) : (
                <span className="text-[10px] text-gray-400 font-bold">Pending</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
