import React, { useState } from 'react';
import { 
  Dumbbell, 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  Check, 
  Info, 
  ShieldCheck, 
  Zap, 
  Flame, 
  Activity,
  Layers,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Award,
  Eye,
  Youtube,
  Copy,
  ExternalLink,
  Play
} from 'lucide-react';
import { EXERCISE_LIBRARY, ExerciseLibraryItem, getRecommendedExercises } from '../data/exercises';
import { getExerciseDetailedGuide } from '../lib/exerciseInstructions';
import { getExercisePhoto } from '../lib/exerciseImages';
import { ExerciseQuickViewModal } from './ExerciseQuickViewModal';
import { YouTubeExerciseModal } from './YouTubeExerciseModal';
import { 
  getBiomechanicalClassification, 
  getYouTubeSearchUrl, 
  getStandardizedExerciseSearchTerm 
} from '../lib/biomechanics';
import { EquipmentType, Exercise, UserProfile } from '../types';

interface ExerciseLibraryExplorerProps {
  userProfile: UserProfile;
  currentEquipment: EquipmentType;
  onEquipmentChange: (newEquipment: EquipmentType) => void;
  onAddExerciseToActiveDay?: (exercise: Exercise) => void;
}

export const ExerciseLibraryExplorer: React.FC<ExerciseLibraryExplorerProps> = ({
  userProfile,
  currentEquipment,
  onEquipmentChange,
  onAddExerciseToActiveDay,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'effectiveness' | 'muscle_engagement' | 'name'>('effectiveness');
  const [hasPullUpBar, setHasPullUpBar] = useState<boolean>(userProfile.hasPullUpBar ?? true);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [quickViewExercise, setQuickViewExercise] = useState<ExerciseLibraryItem | null>(null);
  const [youTubeExercise, setYouTubeExercise] = useState<ExerciseLibraryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = [
    'All',
    'Chest',
    'Back',
    'Shoulders',
    'Quads',
    'Hamstrings',
    'Glutes',
    'Biceps',
    'Triceps',
    'Calves',
    'Core',
    'Cardio_Mobility',
  ];

  let filteredExercises = getRecommendedExercises(
    currentEquipment,
    selectedCategory,
    searchQuery,
    userProfile.injuries || [],
    hasPullUpBar
  ).filter((ex) => {
    if (difficultyFilter !== 'All' && ex.difficulty !== difficultyFilter) {
      return false;
    }
    if (tierFilter !== 'All' && (ex.hypertrophyRank || 'S-Tier') !== tierFilter) {
      return false;
    }
    return true;
  });

  // Sort exercises
  filteredExercises.sort((a, b) => {
    if (sortBy === 'effectiveness') {
      const scoreA = a.hypertrophyScore || 9.0;
      const scoreB = b.hypertrophyScore || 9.0;
      return scoreB - scoreA;
    }
    if (sortBy === 'muscle_engagement') {
      const rankA = a.muscle_engagement_rank || (a.hypertrophyScore ? Math.round(a.hypertrophyScore * 10) : 90);
      const rankB = b.muscle_engagement_rank || (b.hypertrophyScore ? Math.round(b.hypertrophyScore * 10) : 90);
      return rankB - rankA;
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const handleAddExercise = (item: ExerciseLibraryItem) => {
    if (onAddExerciseToActiveDay) {
      const newEx: Exercise = {
        id: `custom_${item.id}_${Date.now()}`,
        name: item.name,
        hindiTerminology: item.hindiTerminology,
        targetMuscle: item.targetMuscle,
        secondaryMuscles: item.secondaryMuscles,
        equipment: item.equipment,
        difficulty: item.difficulty,
        muscle_engagement_rank: item.muscle_engagement_rank,
        requiresPullUpBar: item.requiresPullUpBar,
        sets: item.sets,
        reps: item.reps,
        rpeTarget: item.rpeTarget,
        restSeconds: item.restSeconds,
        scienceTip: item.scienceTip,
        emgFocus: item.emgFocus,
        hypertrophyRank: item.hypertrophyRank,
        hypertrophyScore: item.hypertrophyScore,
        effectivenessBadge: item.effectivenessBadge,
        muscleBuildingQuality: item.muscleBuildingQuality,
        injuryAlternative: item.injuryAlternative,
      };
      onAddExerciseToActiveDay(newEx);
      setAddedIds((prev) => ({ ...prev, [item.id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [item.id]: false }));
      }, 2500);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Equipment Selection Banner */}
      <div className="bg-white dark:bg-[#111111] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#F0D060]">
                168 Biomechanical Movement Database
              </span>
              <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Hypertrophy Quality & Effectiveness Ranked</span>
            </div>
            <h2 className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1.5">
              Equipment Profile & Exercise Library
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
              Select your workout environment. All exercises include step-by-step guides with simple language and Hindi cues.
            </p>
          </div>

          {/* Equipment Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
            <button
              onClick={() => onEquipmentChange('full_gym')}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                currentEquipment === 'full_gym'
                  ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-xs'
                  : 'bg-[#FAFAF8] dark:bg-[#1E201F] text-[#1A1D1B] dark:text-[#E8ECE9] border-[#E5E7EB] dark:border-[#2A2416] hover:border-[#D4AF37]'
              }`}
            >
              🏋️ Commercial Gym
            </button>

            <button
              onClick={() => onEquipmentChange('dumbbells_bench')}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                currentEquipment === 'dumbbells_bench'
                  ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-xs'
                  : 'bg-[#FAFAF8] dark:bg-[#1E201F] text-[#1A1D1B] dark:text-[#E8ECE9] border-[#E5E7EB] dark:border-[#2A2416] hover:border-[#D4AF37]'
              }`}
            >
              🏠 DBs & Bench
            </button>

            <button
              onClick={() => onEquipmentChange('pullup_bands')}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                currentEquipment === 'pullup_bands'
                  ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-xs'
                  : 'bg-[#FAFAF8] dark:bg-[#1E201F] text-[#1A1D1B] dark:text-[#E8ECE9] border-[#E5E7EB] dark:border-[#2A2416] hover:border-[#D4AF37]'
              }`}
            >
              🚪 Pull-Up & Bands
            </button>

            <button
              onClick={() => onEquipmentChange('bodyweight_only')}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                currentEquipment === 'bodyweight_only'
                  ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-xs'
                  : 'bg-[#FAFAF8] dark:bg-[#1E201F] text-[#1A1D1B] dark:text-[#E8ECE9] border-[#E5E7EB] dark:border-[#2A2416] hover:border-[#D4AF37]'
              }`}
            >
              🤸 Pure Bodyweight
            </button>
          </div>
        </div>

        {/* Pure Bodyweight: Pull-Up Bar Access Toggle */}
        {currentEquipment === 'bodyweight_only' && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🚪</span>
              <div>
                <h4 className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  Do you have access to a Pull-Up Bar at home?
                </h4>
                <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
                  {hasPullUpBar 
                    ? 'Pull-up bar movements (Chin-ups, Pull-ups, Hanging leg raises) are included.' 
                    : '100% Zero-Equipment mode active — suggesting towel door rows, doorframe lats, table rows & floor movements.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setHasPullUpBar(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  hasPullUpBar
                    ? 'bg-[#D4AF37] text-white shadow-2xs'
                    : 'bg-white dark:bg-[#202422] text-[#6B7280] dark:text-[#9EA8A2] border border-[#E5E7EB] dark:border-[#2A2416]'
                }`}
              >
                ✓ Yes, I have a Bar
              </button>
              <button
                type="button"
                onClick={() => setHasPullUpBar(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !hasPullUpBar
                    ? 'bg-[#D4AF37] text-white shadow-2xs'
                    : 'bg-white dark:bg-[#202422] text-[#6B7280] dark:text-[#9EA8A2] border border-[#E5E7EB] dark:border-[#2A2416]'
                }`}
              >
                ✕ No Bar (Pure Floor/Door)
              </button>
            </div>
          </div>
        )}

        {/* Filter Controls: Search, Category pills, Difficulty, Ranking */}
        <div className="mt-5 pt-4 border-t border-[#E5E7EB] dark:border-[#2A2416] space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search exercise name, Hindi name, target muscle, or equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] text-xs sm:text-sm text-[#1A1D1B] dark:text-[#E8ECE9] placeholder-[#9CA3AF] focus:outline-none focus:border-[#D4AF37]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-[#1A1D1B] dark:hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2] font-semibold">Rank:</span>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none"
                >
                  <option value="All">All Tiers</option>
                  <option value="S-Tier">S-Tier (Top Hypertrophy)</option>
                  <option value="A-Tier">A-Tier (High Activation)</option>
                  <option value="B-Tier">B-Tier (Mobility/Core)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2] font-semibold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none"
                >
                  <option value="effectiveness">⚡ Hypertrophy Effectiveness (Highest First)</option>
                  <option value="muscle_engagement">🎯 Muscle Activation / EMG (Highest First)</option>
                  <option value="name">Alphabetical (A-Z)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2] font-semibold">Level:</span>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Muscle Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#D4AF37] text-white shadow-2xs'
                    : 'bg-[#F3F4F6] dark:bg-[#1F2221] text-[#6B7280] dark:text-[#9EA8A2] hover:bg-gray-200 dark:hover:bg-[#282C2A]'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercises Count Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-[#6B7280] dark:text-[#9EA8A2]">
          Showing <span className="text-[#D4AF37] dark:text-[#F0D060]">{filteredExercises.length}</span> movements matched to your equipment setup
        </div>
        <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">
          Total Library: <span className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">{EXERCISE_LIBRARY.length} exercises</span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#1A1D1B] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-[#F0D060]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExercises.map((item) => {
          const isRecentlyAdded = addedIds[item.id];
          const rank = item.hypertrophyRank || 'S-Tier';
          const score = item.hypertrophyScore || 9.5;
          const photoData = getExercisePhoto(item.id, item.category, item.name);
          const bioClass = getBiomechanicalClassification(item.name, item.targetMuscle, item.equipment);
          const isCopied = copiedId === item.id;
          const cleanName = getStandardizedExerciseSearchTerm(item.name);

          const handleCopy = (e: React.MouseEvent) => {
            e.stopPropagation();
            navigator.clipboard.writeText(`${cleanName} proper form tutorial`);
            setCopiedId(item.id);
            setToastMessage(`Copied "${cleanName}" search query to clipboard!`);
            setTimeout(() => setCopiedId(null), 3000);
            setTimeout(() => setToastMessage(null), 3500);
          };

          const handleOpenYouTube = (e: React.MouseEvent) => {
            e.stopPropagation();
            setYouTubeExercise(item);
          };

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] hover:border-[#D4AF37]/50 transition-all shadow-xs flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Visual Action Demonstration Image Preview with YouTube Launcher */}
                <div 
                  className="relative h-36 w-full rounded-xl overflow-hidden mb-3.5 bg-gray-900 group cursor-pointer"
                  onClick={handleOpenYouTube}
                  title="Click to launch YouTube form video tutorial"
                >
                  <img
                    src={photoData.imageUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs ${
                        rank === 'S-Tier'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-[#A68523]/90 text-white'
                      }`}>
                        <Award className="w-3 h-3" />
                        {rank} • {score}/10
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs ${bioClass.badgeColor}`}>
                        {bioClass.tierLabel}
                      </span>
                    </div>

                    {/* Red YouTube Tag */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/90 backdrop-blur-xs text-white flex items-center gap-1 shadow-xs">
                      <Youtube className="w-3 h-3" />
                      <span>YouTube Form</span>
                    </span>
                  </div>

                  {/* Centered Play Button on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg backdrop-blur-xs">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px]">
                    <span className="font-bold text-amber-300 line-clamp-1">
                      {photoData.simplifiedName}
                    </span>
                    <span className="text-[10px] bg-black/50 px-1.5 py-0.5 rounded text-gray-200">
                      RPE {item.rpeTarget} • {item.restSeconds}s
                    </span>
                  </div>
                </div>

                {/* Biomechanical Hierarchy Pill & Meta Header */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${bioClass.badgeColor}`}>
                    {bioClass.tierLabel}
                  </span>
                  <span className="text-xs font-semibold text-[#D4AF37] dark:text-[#F0D060]">
                    {item.targetMuscle}
                  </span>
                  <span className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                    • {item.equipment}
                  </span>
                </div>

                {/* Title & Hindi Translation */}
                <h3 className="font-bold text-base sm:text-lg text-[#1A1D1B] dark:text-[#E8ECE9] leading-snug">
                  {item.name}
                </h3>
                {item.hindiTerminology && (
                  <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-0.5">
                    🇮🇳 {item.hindiTerminology}
                  </p>
                )}

                {/* Movement Pattern & Biomechanical Classification */}
                <div className="mt-1 flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9EA8A2]">
                  <span className="font-semibold text-[#D4AF37] dark:text-[#F0D060]">{bioClass.movementPattern}</span>
                  <span>•</span>
                  <span>{bioClass.jointType}</span>
                </div>

                {/* Fast Action Buttons: Watch on YouTube & Copy Name */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleOpenYouTube}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    title="Watch exact proper form tutorial on YouTube"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>▶ Watch on YouTube</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#202422] hover:bg-gray-200 dark:hover:bg-[#282E2B] text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
                    title="Copy standardized search query to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="text-[#B8922A] dark:text-[#F0D060] font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                        <span>Copy Name</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Biomechanical Cue */}
                <div className="mt-3 p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] text-xs text-[#4B5563] dark:text-[#9CA3AF] space-y-1">
                  <div className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#E8912D]" />
                    <span>Biomechanical Cue</span>
                  </div>
                  <p className="line-clamp-2">{item.scienceTip}</p>
                </div>
              </div>

              {/* Action Buttons: Quick View & Add to Day */}
              <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-[#2A2416] flex items-center justify-between gap-2">
                <button
                  onClick={() => setQuickViewExercise(item)}
                  className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-[#1F2221] hover:bg-gray-200 dark:hover:bg-[#282C2A] text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#F0D060]" />
                  <span>⚡ Detailed Form Guide</span>
                </button>

                {onAddExerciseToActiveDay && (
                  <button
                    onClick={() => handleAddExercise(item)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                      isRecentlyAdded
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-[#D4AF37] hover:bg-[#A68523] text-white'
                    }`}
                  >
                    {isRecentlyAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* YouTube Tutorial Modal */}
      {youTubeExercise && (
        <YouTubeExerciseModal
          isOpen={!!youTubeExercise}
          exerciseName={youTubeExercise.name}
          targetMuscle={youTubeExercise.targetMuscle}
          equipment={youTubeExercise.equipment}
          onClose={() => setYouTubeExercise(null)}
        />
      )}

      {/* Dedicated Quick View Modal */}
      <ExerciseQuickViewModal
        exercise={quickViewExercise}
        isOpen={!!quickViewExercise}
        onClose={() => setQuickViewExercise(null)}
        onAddToWorkout={onAddExerciseToActiveDay ? (ex) => handleAddExercise(ex as any) : undefined}
        isAdded={quickViewExercise ? !!addedIds[quickViewExercise.id] : false}
      />
    </div>
  );
};
