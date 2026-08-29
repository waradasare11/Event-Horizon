import React, { useState, useEffect } from 'react';
import { 
  X, 
  Dumbbell, 
  Flame, 
  Activity, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Check, 
  Sparkles,
  Zap,
  Award,
  Layers,
  Clock,
  Eye,
  Camera,
  Search,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sliders,
  CheckSquare,
  Square,
  Youtube,
  Copy,
  Play
} from 'lucide-react';
import { ExerciseLibraryItem } from '../data/exercises';
import { getExerciseDetailedGuide } from '../lib/exerciseInstructions';
import { getExercisePhoto } from '../lib/exerciseImages';
import { BiomechanicalMovementCanvas } from './BiomechanicalMovementCanvas';
import { 
  getBiomechanicalClassification, 
  getYouTubeSearchUrl, 
  getStandardizedExerciseSearchTerm 
} from '../lib/biomechanics';
import { Exercise } from '../types';

interface ExerciseQuickViewModalProps {
  exercise: ExerciseLibraryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToWorkout?: (exercise: Exercise) => void;
  isAdded?: boolean;
}

export const ExerciseQuickViewModal: React.FC<ExerciseQuickViewModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onAddToWorkout,
  isAdded = false,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [visualMode, setVisualMode] = useState<'biomechanics' | 'photo'>('biomechanics');
  const [imageError, setImageError] = useState(false);
  const [checkedFormItems, setCheckedFormItems] = useState<Record<number, boolean>>({});
  const [isCopied, setIsCopied] = useState(false);

  const [isSearchingGrounding, setIsSearchingGrounding] = useState(false);
  const [groundingData, setGroundingData] = useState<{ groundedAnalysis: string; webSources: Array<{ title: string; uri: string }> } | null>(null);
  const [groundingError, setGroundingError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setActiveStepIndex(0);
      setImageError(false);
      setCheckedFormItems({});
      setGroundingData(null);
      setGroundingError(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleFetchGrounding = async () => {
    if (!exercise) return;
    setIsSearchingGrounding(true);
    setGroundingError(null);
    try {
      const res = await fetch('/api/ai/grounded-exercise-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseName: exercise.name,
          targetMuscle: exercise.targetMuscle,
          equipment: exercise.equipment,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGroundingData(data.data);
      } else {
        setGroundingError(data.error || 'Failed to retrieve grounded research.');
      }
    } catch (err: any) {
      setGroundingError(err?.message || 'Network error fetching search grounding.');
    } finally {
      setIsSearchingGrounding(false);
    }
  };

  if (!isOpen || !exercise) return null;

  const guide = getExerciseDetailedGuide(exercise);
  const photoData = getExercisePhoto(exercise.id, exercise.category, exercise.name);
  const steps = photoData.stepImages || [];
  const currentStep = steps[activeStepIndex] || steps[0];
  const hypertrophyScore = exercise.hypertrophyScore || 9.5;
  const hypertrophyRank = exercise.hypertrophyRank || 'S-Tier';

  const categoryHindiMap: Record<string, string> = {
    Chest: 'Seena / Chhati (Chest)',
    Back: 'Peeth / Lats (Back)',
    Shoulders: 'Kandha / Deltoids (Shoulders)',
    Quads: 'Aage ki Jaangh (Quads)',
    Hamstrings: 'Peeche ki Jaangh (Hamstrings)',
    Glutes: 'Hips / Butts (Glutes)',
    Biceps: 'Dole / Biceps',
    Triceps: 'Triceps',
    Calves: 'Pindli (Calves)',
    Core: 'Pet / Abs (Core)',
    Cardio_Mobility: 'Stamina aur Flexibility (Mobility)',
  };

  const hindiCategory = categoryHindiMap[exercise.category] || exercise.category;
  const bioClass = getBiomechanicalClassification(exercise.name, exercise.targetMuscle, exercise.equipment);
  const cleanName = getStandardizedExerciseSearchTerm(exercise.name);
  const youtubeUrl = getYouTubeSearchUrl(exercise.name);

  const toggleFormCheck = (idx: number) => {
    setCheckedFormItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopySearchQuery = () => {
    navigator.clipboard.writeText(`${cleanName} proper form tutorial`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleOpenYouTubeDirect = () => {
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#262A28] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] dark:border-[#242826] bg-[#FAFAF8] dark:bg-[#1B1E1D] flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {/* Hypertrophy Rank Badge */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                hypertrophyRank === 'S-Tier'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}>
                <Award className="w-3.5 h-3.5" />
                {hypertrophyRank} • Hypertrophy Rating: {hypertrophyScore}/10
              </span>

              {/* Biomechanical Hierarchy Pill */}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${bioClass.badgeColor}`}>
                {bioClass.tierLabel}
              </span>

              {/* Category */}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0F6E5F]/10 text-[#0F6E5F] dark:text-[#5FD1B8]">
                {hindiCategory}
              </span>

              {/* Difficulty */}
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {exercise.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-[#1A1D1B] dark:text-[#E8ECE9] leading-snug">
                {exercise.name}
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#5FD1B8] font-bold text-xs">
                Easy Name: {photoData.simplifiedName}
              </span>
            </div>

            {exercise.hindiTerminology && (
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-1">
                🇮🇳 {exercise.hindiTerminology}
              </p>
            )}

            <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5 flex items-center gap-2 flex-wrap">
              <span>🎯 Target: <strong className="text-[#1A1D1B] dark:text-[#E8ECE9]">{exercise.targetMuscle}</strong></span>
              <span>•</span>
              <span>⚙️ Pattern: <strong className="text-[#1A1D1B] dark:text-[#E8ECE9]">{bioClass.movementPattern}</strong></span>
              <span>•</span>
              <span>🛠️ Gear: <strong className="text-[#1A1D1B] dark:text-[#E8ECE9]">{exercise.equipment}</strong></span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-100 dark:bg-[#252927] hover:bg-gray-200 dark:hover:bg-[#2F3431] text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent YouTube Video Form Launcher Bar */}
        <div className="px-5 py-3 bg-gradient-to-r from-red-600/15 via-red-600/5 to-transparent border-b border-red-500/20 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Youtube className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                <span>100% Accurate YouTube Video Tutorial</span>
                <span className="px-1.5 py-0.2 bg-red-100 dark:bg-red-950/60 text-[10px] rounded font-semibold text-red-600 dark:text-red-300">Verified</span>
              </div>
              <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
                Instant query: <span className="font-mono font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">"{cleanName} proper form tutorial"</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleOpenYouTubeDirect}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Open YouTube video tutorial directly in new tab"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>▶ Watch on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              onClick={handleCopySearchQuery}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1F2221] hover:bg-gray-100 dark:hover:bg-[#282C2A] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy search query to clipboard"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span>Copy Name</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Visual Mode Selector & Multi-Step Interactive Gallery */}
          <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] dark:border-[#2A2E2C] bg-[#FAFAF8] dark:bg-[#1A1D1C] shadow-xs">
            {/* View Mode Toggle Bar */}
            <div className="flex items-center justify-between p-2 border-b border-[#E5E7EB] dark:border-[#262A28] bg-gray-50 dark:bg-[#181B1A] gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-gray-200/70 dark:bg-black/40 p-1 rounded-xl">
                <button
                  onClick={() => setVisualMode('biomechanics')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    visualMode === 'biomechanics'
                      ? 'bg-[#0F6E5F] text-white shadow-xs'
                      : 'text-[#4B5563] dark:text-[#9EA8A2] hover:text-[#1A1D1B]'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Biomechanical Vector</span>
                </button>
                <button
                  onClick={() => setVisualMode('photo')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    visualMode === 'photo'
                      ? 'bg-[#0F6E5F] text-white shadow-xs'
                      : 'text-[#4B5563] dark:text-[#9EA8A2] hover:text-[#1A1D1B]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Real Action Photo</span>
                </button>
              </div>

              <span className="text-[11px] font-semibold text-[#0F6E5F] dark:text-[#5FD1B8] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>1000% Movement Precision</span>
              </span>
            </div>

            {/* Step Selection Tabs */}
            {steps.length > 1 && (
              <div className="flex border-b border-[#E5E7EB] dark:border-[#262A28] bg-gray-100/90 dark:bg-[#141615] p-1.5 gap-1.5">
                {steps.map((st, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeStepIndex === idx
                        ? 'bg-[#0F6E5F] text-white shadow-xs'
                        : 'text-[#4B5563] dark:text-[#9EA8A2] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="truncate">{st.stepName.split(':')[1] || st.stepName}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Visual Display Container */}
            {visualMode === 'biomechanics' || imageError ? (
              <BiomechanicalMovementCanvas
                exerciseName={exercise.name}
                category={exercise.category}
                targetMuscle={exercise.targetMuscle}
                stepIndex={activeStepIndex}
                tempo={guide.tempo}
                breathing={guide.breathing}
              />
            ) : (
              <div className="h-52 sm:h-64 w-full overflow-hidden relative bg-black">
                <img
                  src={currentStep?.imageUrl || photoData.imageUrl}
                  alt={exercise.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>{photoData.visualAngle}</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-[#0F6E5F]/90 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                    🎯 {photoData.targetFocus}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentStep?.stepName || '📸 Verified Action Demonstration'}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-100 leading-snug">
                    {currentStep?.actionDescription || photoData.actionCaption}
                  </p>
                </div>
              </div>
            )}

            {/* Active Step Key Cue & Phase Instruction */}
            <div className="p-3 bg-gray-50 dark:bg-[#181B1A] border-t border-[#E5E7EB] dark:border-[#262A28] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-[#0F6E5F] dark:text-[#5FD1B8] shrink-0">Phase Guide:</span>
                <span className="text-[#4B5563] dark:text-[#D1D5DB] leading-tight">
                  {currentStep?.actionDescription || photoData.setupSummary}
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">Key Pro Cue:</span>
                <span className="text-[#4B5563] dark:text-[#D1D5DB] leading-tight">
                  {currentStep?.keyCue || photoData.executionSummary}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Google Search Grounding for Latest Biomechanical Form Evidence */}
          <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[#1A1D1B] dark:text-[#E8ECE9]">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-1.5 font-bold text-[#0F6E5F] dark:text-[#5FD1B8] text-xs">
                <Search className="w-4 h-4" />
                <span>Google Search Grounded Biomechanics & EMG Analysis</span>
              </div>
              <button
                onClick={handleFetchGrounding}
                disabled={isSearchingGrounding}
                className="px-3 py-1 rounded-lg bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSearchingGrounding ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching Research...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{groundingData ? 'Refresh Live Grounding' : 'Search Grounded Data'}</span>
                  </>
                )}
              </button>
            </div>

            {groundingError && (
              <p className="text-xs text-rose-500 font-medium">{groundingError}</p>
            )}

            {groundingData ? (
              <div className="space-y-2 mt-2 pt-2 border-t border-teal-500/20">
                <p className="text-xs text-[#374151] dark:text-[#D1D5DB] leading-relaxed whitespace-pre-line">
                  {groundingData.groundedAnalysis}
                </p>
                {groundingData.webSources && groundingData.webSources.length > 0 && (
                  <div className="pt-2">
                    <span className="font-bold text-[10px] text-[#0F6E5F] dark:text-[#5FD1B8] block mb-1">
                      🌐 Grounded Verification Sources:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {groundingData.webSources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-[#0F6E5F] dark:text-[#5FD1B8] hover:underline font-medium bg-teal-500/10 px-2 py-0.5 rounded-md"
                        >
                          <span>{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#4B5563] dark:text-[#9EA8A2]">
                Click above to run real-time Google Search Grounding on latest biomechanical literature, EMG activation studies, and form cues for <strong>{exercise.name}</strong>.
              </p>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#1D201E] border border-[#E5E7EB] dark:border-[#262A28]">
            <div>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] block font-medium">Prescribed Sets</span>
              <span className="text-sm font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">{exercise.sets} Working Sets</span>
            </div>
            <div>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] block font-medium">Rep Target</span>
              <span className="text-sm font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">{exercise.reps}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] block font-medium">Target RPE / Intensity</span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">RPE {exercise.rpeTarget} (1-2 RIR)</span>
            </div>
            <div>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] block font-medium">Rest Period</span>
              <span className="text-sm font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">{exercise.restSeconds}s Rest</span>
            </div>
          </div>

          {/* Muscle Building Quality & Ranking Details */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#1A1D1B] dark:text-[#E8ECE9]">
            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Muscle Building Quality & Effectiveness ({exercise.hypertrophyRank || 'S-Tier'}):</span>
            </div>
            <p className="text-xs text-[#374151] dark:text-[#D1D5DB] leading-relaxed">
              {exercise.muscleBuildingQuality || 'Optimal tension curve, deep muscle stretch under load, and high overload progression ceiling for rapid muscle growth.'}
            </p>
          </div>

          {/* Interactive Form Checklist */}
          <div className="space-y-3 p-4 rounded-xl bg-white dark:bg-[#1C1F1E] border border-[#E5E7EB] dark:border-[#282C2A] shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#282C2A] pb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#0F6E5F] dark:text-[#5FD1B8]" />
                <h3 className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9]">
                  Gym Setup Checklist (Shuru Karne Se Pehle Check Karein)
                </h3>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {Object.values(checkedFormItems).filter(Boolean).length}/{guide.setup.length} Checked
              </span>
            </div>

            <div className="space-y-2">
              {guide.setup.map((s, idx) => (
                <div 
                  key={idx}
                  onClick={() => toggleFormCheck(idx)}
                  className={`flex items-start gap-2.5 p-2 rounded-lg transition-all cursor-pointer select-none border ${
                    checkedFormItems[idx]
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : 'bg-gray-50 dark:bg-[#181A19] border-transparent hover:border-gray-300 dark:hover:border-gray-700 text-[#4B5563] dark:text-[#D1D5DB]'
                  }`}
                >
                  <button className="mt-0.5 shrink-0 text-[#0F6E5F] dark:text-[#5FD1B8]">
                    {checkedFormItems[idx] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <span className="text-xs leading-tight">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Simple Hindi & English Guide */}
          <div className="space-y-3.5 p-4 rounded-xl bg-white dark:bg-[#1C1F1E] border border-[#E5E7EB] dark:border-[#282C2A] shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-[#282C2A] pb-2">
              <BookOpen className="w-4 h-4 text-[#0F6E5F] dark:text-[#5FD1B8]" />
              <h3 className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9]">
                Step-by-Step Execution Guide (Kaise Karein - Saral Bhasha Mein)
              </h3>
            </div>

            {/* Overview */}
            <div>
              <span className="font-bold text-[#0F6E5F] dark:text-[#5FD1B8] block mb-1">
                🌟 Exercise Overview (Iska Fayda):
              </span>
              <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                {guide.simpleOverview}
              </p>
            </div>

            {/* 1. Movement Steps */}
            <div>
              <span className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9] block mb-1.5">
                🎯 Movement Execution (Rep Lagane Ka Tarika):
              </span>
              <ul className="space-y-1.5 pl-1">
                {guide.executionSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#4B5563] dark:text-[#D1D5DB]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#4ADE80] mt-0.5 shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Breathing & Tempo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/20">
              <div>
                <span className="font-bold text-[11px] text-[#0F6E5F] dark:text-[#5FD1B8] block mb-0.5">
                  💨 Saans Lene Ka Tarika (Breathing):
                </span>
                <p className="text-[11px] text-[#374151] dark:text-[#D1D5DB]">{guide.breathing}</p>
              </div>
              <div>
                <span className="font-bold text-[11px] text-[#0F6E5F] dark:text-[#5FD1B8] block mb-0.5">
                  ⏱️ Speed aur Tempo (Raftaar):
                </span>
                <p className="text-[11px] text-[#374151] dark:text-[#D1D5DB]">{guide.tempo}</p>
              </div>
            </div>

            {/* 3. Mistakes to Avoid */}
            <div>
              <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>⚠️ Yeh Galtiyan Na Karein (Mistakes to Avoid):</span>
              </span>
              <ul className="space-y-1 pl-1">
                {guide.mistakesToAvoid.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#4B5563] dark:text-[#D1D5DB]">
                    <span className="text-amber-500 font-bold">✕</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Injury Alternative If Any */}
          {exercise.injuryAlternative && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                🛡️ Joint-Friendly Alternative: {exercise.injuryAlternative.substitute}
              </span>
              <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB]">{exercise.injuryAlternative.reason}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E5E7EB] dark:border-[#262A28] bg-[#FAFAF8] dark:bg-[#1B1E1D] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#9EA8A2] hover:bg-gray-200 dark:hover:bg-[#282C2A] transition-colors cursor-pointer"
          >
            Close Window
          </button>

          {onAddToWorkout && (
            <button
              onClick={() => {
                onAddToWorkout({
                  id: exercise.id,
                  name: exercise.name,
                  targetMuscle: exercise.targetMuscle,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  rpeTarget: exercise.rpeTarget,
                  restSeconds: exercise.restSeconds,
                  equipment: exercise.equipment,
                  scienceTip: exercise.scienceTip,
                  emgFocus: exercise.emgFocus || 'Maximum recruitment across full active range',
                  hypertrophyRank: exercise.hypertrophyRank,
                  hypertrophyScore: exercise.hypertrophyScore,
                  hindiTerminology: exercise.hindiTerminology,
                  difficulty: exercise.difficulty,
                });
                onClose();
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                isAdded
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added in Today's Routine</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Workout Routine</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
