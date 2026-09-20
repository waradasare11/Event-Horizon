import React, { useState, useMemo, useEffect } from 'react';
import { 
  RAW_EXERCISE_REGISTRY, 
  RegistryExerciseEntry, 
  CoachingChannelGuide 
} from '../data/ExerciseRegistry';
import { UserProfile, WorkoutCompletionLog } from '../types';
import { 
  inferTargetMuscle, 
  getExerciseProgressionRecommendation, 
  ExerciseProgressionRecommendation 
} from '../lib/exerciseInference';
import { 
  Search, 
  Star, 
  Filter, 
  Dumbbell, 
  ExternalLink, 
  Info, 
  ShieldAlert, 
  Plus, 
  Check, 
  Flame, 
  Play, 
  Sparkles, 
  Target, 
  ChevronRight,
  X,
  Layers,
  Heart,
  BookOpen,
  Clock,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

interface ExerciseLibraryViewProps {
  userProfile: UserProfile;
  workoutLogs: WorkoutCompletionLog[];
  onQuickLogExercise?: (
    exerciseName: string, 
    sets: { reps: number; weightKg: number; rpe?: number }[],
    targetMuscle?: string
  ) => void;
}

const FAVORITES_KEY_PREFIX = 'aroh_favorite_exercises_';

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({
  userProfile,
  workoutLogs,
  onQuickLogExercise,
}) => {
  const userEmail = userProfile.email || 'guest';
  const storageKey = `${FAVORITES_KEY_PREFIX}${userEmail.trim().toLowerCase()}`;

  // Favorites state persisted locally per user
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : ['ex-bench-press', 'ex-incline-db-press', 'ex-barbell-squat'];
    } catch {
      return ['ex-bench-press', 'ex-incline-db-press', 'ex-barbell-squat'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(favoriteIds));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage', e);
    }
  }, [favoriteIds, storageKey]);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Selected exercise for full detail modal
  const [selectedExercise, setSelectedExercise] = useState<RegistryExerciseEntry | null>(null);

  // Quick log modal state with automatic progression recommendations
  const [quickLogExercise, setQuickLogExercise] = useState<RegistryExerciseEntry | null>(null);
  const [activeProgression, setActiveProgression] = useState<ExerciseProgressionRecommendation | null>(null);
  const [logWeight, setLogWeight] = useState<number>(userProfile.weightKg || 60);
  const [logReps, setLogReps] = useState<number>(10);
  const [logSetsCount, setLogSetsCount] = useState<number>(3);
  const [logRpe, setLogRpe] = useState<number>(8);
  const [quickLogSuccess, setQuickLogSuccess] = useState<boolean>(false);

  const categories = useMemo(() => {
    const cats = new Set(RAW_EXERCISE_REGISTRY.map((e) => e.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const tiers = ['All', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
  const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs & Core'] as const;
  const EQUIPMENT_TYPES = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Smith Machine'] as const;

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenQuickLog = (exercise: RegistryExerciseEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const rec = getExerciseProgressionRecommendation(
      exercise.formalName,
      exercise.aliases,
      workoutLogs,
      userProfile.weightKg
    );
    setActiveProgression(rec);
    setQuickLogExercise(exercise);
    setLogWeight(rec.recommendedWeightKg);
    setLogReps(rec.recommendedReps);
    setLogSetsCount(rec.recommendedSets);
    setLogRpe(rec.lastPerformed?.rpe || 8);
  };

  // Filtered exercises with muscle group, equipment, category, tier, favorites and search
  const filteredExercises = useMemo(() => {
    return RAW_EXERCISE_REGISTRY.filter((ex) => {
      // Category filter
      if (selectedCategory !== 'All' && ex.category !== selectedCategory) {
        return false;
      }
      // Tier filter
      if (selectedTier !== 'All' && ex.biomechanicalTier !== selectedTier) {
        return false;
      }
      // Muscle Group filter
      if (selectedMuscleGroup !== 'All') {
        const tm = (ex.targetMuscle || '').toLowerCase();
        const cat = ex.category;
        if (selectedMuscleGroup === 'Chest') {
          if (!tm.includes('pec') && !tm.includes('chest') && cat !== 'Chest') return false;
        } else if (selectedMuscleGroup === 'Back') {
          if (!tm.includes('lat') && !tm.includes('back') && !tm.includes('trap') && !tm.includes('rhomboid') && cat !== 'Back') return false;
        } else if (selectedMuscleGroup === 'Legs') {
          if (cat !== 'Quads' && cat !== 'Hamstrings' && cat !== 'Glutes' && cat !== 'Calves' && !tm.includes('quad') && !tm.includes('hamstring') && !tm.includes('glute') && !tm.includes('calf') && !tm.includes('leg')) return false;
        } else if (selectedMuscleGroup === 'Shoulders') {
          if (cat !== 'Shoulders' && !tm.includes('deltoid') && !tm.includes('shoulder')) return false;
        } else if (selectedMuscleGroup === 'Arms') {
          if (cat !== 'Biceps' && cat !== 'Triceps' && !tm.includes('bicep') && !tm.includes('tricep') && !tm.includes('brachii')) return false;
        } else if (selectedMuscleGroup === 'Abs & Core') {
          if (cat !== 'Core' && !tm.includes('ab') && !tm.includes('core') && !tm.includes('oblique')) return false;
        }
      }
      // Equipment filter
      if (selectedEquipment !== 'All') {
        const eq = (ex.equipment || '').toLowerCase();
        const targetEq = selectedEquipment.toLowerCase();
        if (targetEq === 'machine') {
          if (!eq.includes('machine') && !eq.includes('pin-loaded') && !eq.includes('plate-loaded')) return false;
        } else if (targetEq === 'bodyweight') {
          if (!eq.includes('bodyweight') && !eq.includes('calisthenics') && !eq.includes('pull-up bar') && !eq.includes('dip bar')) return false;
        } else {
          if (!eq.includes(targetEq)) return false;
        }
      }
      // Favorites filter
      if (onlyFavorites && !favoriteIds.includes(ex.id)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesFormal = ex.formalName.toLowerCase().includes(q);
        const matchesAlias = ex.aliases.some((a) => a.toLowerCase().includes(q));
        const matchesMuscle = ex.targetMuscle.toLowerCase().includes(q) || 
                              ex.secondaryMuscles.some((m) => m.toLowerCase().includes(q));
        const matchesPattern = ex.movementPattern.toLowerCase().includes(q);
        const matchesEquipment = ex.equipment.toLowerCase().includes(q);
        if (!matchesFormal && !matchesAlias && !matchesMuscle && !matchesPattern && !matchesEquipment) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedTier, selectedMuscleGroup, selectedEquipment, onlyFavorites, favoriteIds, searchQuery]);

  const handleExecuteQuickLog = () => {
    if (!quickLogExercise) return;
    const sets = Array.from({ length: logSetsCount }).map(() => ({
      reps: logReps,
      weightKg: logWeight,
      rpe: logRpe,
    }));

    // Automatically infer target muscle using standard naming conventions
    const inferredMuscle = inferTargetMuscle(quickLogExercise.formalName, quickLogExercise.targetMuscle);

    if (onQuickLogExercise) {
      onQuickLogExercise(quickLogExercise.formalName, sets, inferredMuscle);
    }
    setQuickLogSuccess(true);
    setTimeout(() => {
      setQuickLogSuccess(false);
      setQuickLogExercise(null);
      setActiveProgression(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cosmic Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F1E] via-[#10172A] to-[#1E1B4B] border border-[#3B82F6]/30 p-6 sm:p-8 text-white shadow-2xl shadow-[#3B82F6]/40">
        {/* Ambient Nebula Glows */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#3B82F6]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#3B82F6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/40 text-[#60A5FA] text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>AROH Curated Movement Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-['Space_Grotesk',sans-serif]">
              Evidence-Based <span className="bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#1D4ED8] bg-clip-text text-transparent">Exercise Library</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore gold-standard movements classified by biomechanical tiers, hypertrophy mechanics, and safety alternatives. Favorite your go-to lifts for instant single-tap session logging.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-[#0F1528]/80 border border-slate-700/60 text-center">
              <div className="text-xl sm:text-2xl font-black text-[#60A5FA] font-['Space_Grotesk',sans-serif]">
                {RAW_EXERCISE_REGISTRY.length}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Exercises</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0F1528]/80 border border-slate-700/60 text-center">
              <div className="text-xl sm:text-2xl font-black text-[#60A5FA] font-['Space_Grotesk',sans-serif]">
                {favoriteIds.length}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Favorited</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0F1528]/80 border border-slate-700/60 text-center">
              <div className="text-xl sm:text-2xl font-black text-[#60A5FA] font-['Space_Grotesk',sans-serif]">
                4
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Bio-Tiers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Filters & Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D1222] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by exercise name, target muscle (e.g. Pectoralis, Hamstrings), or equipment..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080B14] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#3B82F6]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Favorites Filter Toggle */}
          <button
            type="button"
            onClick={() => setOnlyFavorites((prev) => !prev)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              onlyFavorites
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-sm'
                : 'bg-slate-100 dark:bg-[#141C34] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1C2748]'
            }`}
          >
            <Star className={`w-4 h-4 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            <span>Favorited ({favoriteIds.length})</span>
          </button>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#141C34] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1B2544]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Muscle Groups Chips Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Muscle Group:</span>
          {MUSCLE_GROUPS.map((mg) => (
            <button
              key={mg}
              onClick={() => setSelectedMuscleGroup(mg)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedMuscleGroup === mg
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#141C34] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1B2544]'
              }`}
            >
              {mg}
            </button>
          ))}
        </div>

        {/* Equipment Type Chips Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Equipment:</span>
          {EQUIPMENT_TYPES.map((eq) => (
            <button
              key={eq}
              onClick={() => setSelectedEquipment(eq)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedEquipment === eq
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#141C34] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1B2544]'
              }`}
            >
              {eq}
            </button>
          ))}
        </div>

        {/* Tiers Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Biomechanical Tier:</span>
          {tiers.map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTier === tier
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#141C34] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1B2544]'
              }`}
            >
              {tier === 'All' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-3 bg-white dark:bg-[#0D1222] rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-base font-bold text-slate-800 dark:text-slate-200">No exercises found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No movements match your selected filter criteria or search query. Try broadening your keywords or clearing filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedTier('All');
                setSelectedMuscleGroup('All');
                setSelectedEquipment('All');
                setOnlyFavorites(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#3B82F6] text-white text-xs font-bold transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredExercises.map((exercise) => {
            const isFav = favoriteIds.includes(exercise.id);
            const rec = getExerciseProgressionRecommendation(
              exercise.formalName,
              exercise.aliases,
              workoutLogs,
              userProfile.weightKg
            );

            return (
              <div
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 hover:border-[#3B82F6]/50 hover:shadow-xl hover:shadow-[#3B82F6]/20 transition-all cursor-pointer"
              >
                <div>
                  {/* Top Bar: Category, Tier & Favorite Button */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#1D4ED8] dark:text-[#3B82F6] border border-[#3B82F6]/20">
                        {exercise.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#1D4ED8] dark:text-[#60A5FA] border border-[#3B82F6]/20">
                        {exercise.biomechanicalTier}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(exercise.id, e)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isFav 
                          ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' 
                          : 'text-slate-400 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={isFav ? 'Remove from favorites' : 'Favorite this exercise for faster logging'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Exercise Title & Movement Pattern */}
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#3B82F6] transition-colors line-clamp-1 font-['Space_Grotesk',sans-serif]">
                    {exercise.formalName}
                  </h3>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{exercise.targetMuscle}</span>
                    {exercise.movementPattern && ` • ${exercise.movementPattern}`}
                  </div>

                  {/* Equipment Tag */}
                  <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{exercise.equipment}</span>
                  </div>

                  {/* Last Performed Badge */}
                  {rec.lastPerformed ? (
                    <div className="mt-2.5 flex items-center justify-between gap-1 text-[11px] font-bold text-[#1D4ED8] dark:text-[#60A5FA] bg-[#3B82F6]/10 px-2.5 py-1 rounded-lg border border-[#3B82F6]/25">
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                        <span className="truncate">
                          Last: {rec.lastPerformed.formattedDate} ({rec.lastPerformed.weightKg}kg × {rec.lastPerformed.reps})
                        </span>
                      </div>
                      <span className="shrink-0 text-[10px] text-[#1D4ED8] dark:text-[#60A5FA] font-extrabold bg-[#3B82F6]/20 px-1.5 py-0.5 rounded">
                        Vol: {rec.lastPerformed.volumeKg.toLocaleString()}kg
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-400 bg-slate-50 dark:bg-[#080B14] px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Not yet logged</span>
                    </div>
                  )}

                  {/* Progression Overload Chip */}
                  <div className="mt-2 flex items-center justify-between gap-1.5 p-2 rounded-xl bg-[#3B82F6]/10 dark:bg-[#2A2416]/30 border border-[#3B82F6]/20 text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#1D4ED8] dark:text-[#60A5FA] font-bold truncate">
                      <TrendingUp className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                      <span className="truncate">{rec.progressionNote}</span>
                    </div>
                    <span className="shrink-0 font-black text-[#1D4ED8] dark:text-[#60A5FA] bg-[#3B82F6]/20 px-1.5 py-0.5 rounded text-[10px]">
                      {rec.recommendedWeightKg}kg × {rec.recommendedReps}
                    </span>
                  </div>

                  {/* Execution Keypoint Preview */}
                  {exercise.executionKeypoint && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 italic bg-slate-50 dark:bg-[#080B14] p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      "{exercise.executionKeypoint}"
                    </p>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold group-hover:underline flex items-center gap-1">
                    <span>Biomechanics & Form</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleOpenQuickLog(exercise, e)}
                    className="px-2.5 py-1 rounded-lg bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#1D4ED8] dark:text-[#60A5FA] border border-[#3B82F6]/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Quick log sets for this exercise with progressive overload recommendations"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Quick Log</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comprehensive Detail & Biomechanics Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-[#3B82F6]/40 shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#3B82F6]/15 text-[#1D4ED8] dark:text-[#60A5FA] border border-[#3B82F6]/30">
                    {selectedExercise.category}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#3B82F6]/15 text-[#1D4ED8] dark:text-[#60A5FA] border border-[#3B82F6]/30">
                    {selectedExercise.tierLabel || selectedExercise.biomechanicalTier}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-['Space_Grotesk',sans-serif]">
                  {selectedExercise.formalName}
                </h2>
                {selectedExercise.aliases.length > 0 && (
                  <p className="text-xs text-slate-500">
                    Also known as: {selectedExercise.aliases.join(', ')}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedExercise(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Anatomical Targets & Equipment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D4ED8] dark:text-[#3B82F6] uppercase tracking-wider">
                  <Target className="w-4 h-4" />
                  <span>Primary Target Muscle</span>
                </div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {selectedExercise.targetMuscle}
                </div>
                {selectedExercise.secondaryMuscles.length > 0 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    Secondary: {selectedExercise.secondaryMuscles.join(', ')}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D4ED8] dark:text-[#60A5FA] uppercase tracking-wider">
                  <Dumbbell className="w-4 h-4" />
                  <span>Required Equipment</span>
                </div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {selectedExercise.equipment}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                  Pattern: {selectedExercise.movementPattern}
                </div>
              </div>
            </div>

            {/* Execution Keypoint */}
            {selectedExercise.executionKeypoint && (
              <div className="p-4 rounded-2xl bg-[#3B82F6]/10 dark:bg-[#2A2416]/30 border border-[#3B82F6]/30 space-y-1">
                <div className="text-xs font-bold text-[#1D4ED8] dark:text-[#60A5FA] uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>Biomechanical Execution Cue</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-[#FAF3E0] leading-relaxed">
                  {selectedExercise.executionKeypoint}
                </p>
              </div>
            )}

            {/* Safer Injury Alternative */}
            {selectedExercise.injurySaferAlternative && (
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 space-y-1">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Joint-Safer Alternative</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-amber-100">
                  {selectedExercise.injurySaferAlternative}
                </p>
              </div>
            )}

            {/* Coaching Channels / Video Tutorials */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Scientific Technique & Video Guides:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedExercise.coachingChannels.map((guide) => (
                  <a
                    key={guide.channelId}
                    href={guide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 hover:border-[#3B82F6]/50 hover:bg-slate-100 dark:hover:bg-[#131B32] transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-xs shrink-0">
                        <Play className="w-3.5 h-3.5 fill-rose-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#3B82F6]">
                          {guide.channelName}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {guide.coachName}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#3B82F6] shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => toggleFavorite(selectedExercise.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                  favoriteIds.includes(selectedExercise.id)
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Star className={`w-4 h-4 ${favoriteIds.includes(selectedExercise.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{favoriteIds.includes(selectedExercise.id) ? 'Favorited' : 'Favorite Exercise'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const ex = selectedExercise;
                  setSelectedExercise(null);
                  if (ex) handleOpenQuickLog(ex);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#3B82F6]/25 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log Sets in Workout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Log Sets Modal */}
      {quickLogExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0E1424] border border-[#3B82F6]/40 shadow-2xl p-6 text-slate-900 dark:text-white space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-[#3B82F6] uppercase tracking-wider">Quick Workout Logging</div>
                <h3 className="text-lg font-bold font-['Space_Grotesk',sans-serif]">{quickLogExercise.formalName}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuickLogExercise(null);
                  setActiveProgression(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {quickLogSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/20 text-[#60A5FA] flex items-center justify-center mx-auto border border-[#3B82F6]/40 animate-bounce">
                  <Check className="w-6 h-6" />
                </div>
                <div className="text-base font-bold text-[#60A5FA]">Sets Successfully Logged!</div>
                <div className="text-xs text-slate-400">Recorded into your workout history with auto-inferred target muscle.</div>
              </div>
            ) : (
              <>
                {/* Progression Overload Guidance Banner */}
                {activeProgression && (
                  <div className="p-3.5 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3B82F6] dark:text-[#3B82F6] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span>Recommended Progression</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setLogWeight(activeProgression.recommendedWeightKg);
                          setLogReps(activeProgression.recommendedReps);
                          setLogSetsCount(activeProgression.recommendedSets);
                        }}
                        className="text-[10px] text-[#3B82F6] dark:text-[#60A5FA] font-bold hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset to Target</span>
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-[#FAF3E0]">
                      {activeProgression.progressionNote}
                    </p>
                    {activeProgression.lastPerformed ? (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-[#3B82F6]/20 flex items-center justify-between">
                        <span>Last Session ({activeProgression.lastPerformed.formattedDate}):</span>
                        <span className="font-bold text-[#3B82F6] dark:text-[#60A5FA]">
                          {activeProgression.lastPerformed.weightKg}kg × {activeProgression.lastPerformed.reps} reps (Vol: {activeProgression.lastPerformed.volumeKg.toLocaleString()}kg)
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-[#3B82F6]/20">
                        First logged session for this movement. Starting at baseline overload resistance.
                      </div>
                    )}
                  </div>
                )}

                {/* Inferred Target Muscle Badge */}
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Inferred Target Muscle:</span>
                  <span className="font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-[#141C34] px-2 py-0.5 rounded-md text-[11px]">
                    {inferTargetMuscle(quickLogExercise.formalName, quickLogExercise.targetMuscle)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Sets Count
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={logSetsCount}
                      onChange={(e) => setLogSetsCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080B14] text-center font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Reps Per Set
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={logReps}
                      onChange={(e) => setLogReps(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080B14] text-center font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Load (kg)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={logWeight}
                      onChange={(e) => setLogWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080B14] text-center font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Target RPE (1-10)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={0.5}
                      value={logRpe}
                      onChange={(e) => setLogRpe(Math.min(10, Math.max(1, parseFloat(e.target.value) || 8)))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080B14] text-center font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#080B14] text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Total Calculated Volume:</span>
                  <span className="font-bold text-[#3B82F6]">{(logSetsCount * logReps * logWeight).toLocaleString()} kg</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickLogExercise(null);
                      setActiveProgression(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteQuickLog}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-[#3B82F6]/25 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Confirm & Log
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
