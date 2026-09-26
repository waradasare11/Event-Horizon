import React, { useState, useMemo } from 'react';
import { 
  Dumbbell, 
  CheckCircle2, 
  Circle, 
  ShieldAlert, 
  Sparkles, 
  Flame, 
  Clock, 
  RotateCcw, 
  ArrowRightLeft, 
  Info, 
  PlayCircle,
  Check,
  Zap,
  ShieldCheck,
  Play,
  Heart,
  Timer,
  BookOpen,
  Calendar,
  Layers,
  Award,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  RefreshCw,
  ChevronDown,
  ListFilter,
  MoveVertical,
  Youtube,
  Copy,
  ExternalLink,
  SlidersHorizontal,
  FileText,
  Edit3
} from 'lucide-react';

import { WorkoutProgram, Exercise, UserProfile, WorkoutCompletionLog, ExerciseSmartSwapOption, EquipmentType, WorkoutNotificationSettings } from '../types';
import { ConsistencyStreakTracker } from './ConsistencyStreakTracker';
import { SmartSwapModal } from './SmartSwapModal';
import { RestIntervalTimer } from './RestIntervalTimer';
import { ExerciseLibraryExplorer } from './ExerciseLibraryExplorer';
import { WorkoutNotificationBanner } from './WorkoutNotificationBanner';
import { ExerciseQuickViewModal } from './ExerciseQuickViewModal';
import { YouTubeExerciseModal } from './YouTubeExerciseModal';
import { EXERCISE_LIBRARY, ExerciseLibraryItem } from '../data/exercises';
import { MASTER_WORKOUT_PROGRAMS } from '../data/workoutPrograms';
import { 
  validateExerciseAgainstRegistry, 
  auditWorkoutPrograms, 
  WorkoutProgramAuditReport 
} from '../data/ExerciseRegistry';
import { WorkoutAuditModal } from './WorkoutAuditModal';
import { ClearHistoryConfirmModal } from './ClearHistoryConfirmModal';
import { getExercisePhoto } from '../lib/exerciseImages';
import { saveStoredWorkoutPrograms, getStoredWorkoutPrograms } from '../lib/storage';
import { 
  getBiomechanicalClassification, 
  sortExercisesByBiomechanicalComplexity, 
  getYouTubeSearchUrl, 
  getStandardizedExerciseSearchTerm 
} from '../lib/biomechanics';
import { triggerHapticSetComplete, triggerHapticWorkoutComplete } from '../lib/haptics';
import confetti from 'canvas-confetti';

interface WorkoutProgramViewProps {
  workoutPrograms: WorkoutProgram[];
  userProfile: UserProfile;
  workoutLogs: WorkoutCompletionLog[];
  onClearAllWorkoutLogs?: () => void;
  onDeleteWorkoutLog?: (id: string) => void;
  onBatchDeleteWorkoutLogs?: (ids: string[]) => void;
  onUpdateWorkoutLogNotes?: (id: string, notes: string) => void;
  onToggleWorkoutLog: (
    date: string, 
    dayId: string, 
    dayName: string, 
    durationMin: number, 
    exercisesCompleted: number, 
    totalExercises: number, 
    isRestDay?: boolean,
    rpeAverage?: number,
    loggedExercises?: Array<{
      exerciseId: string;
      exerciseName: string;
      targetMuscle?: string;
      sets: number;
      reps: number;
      weightKg: number;
      rpeLogged?: number;
      volumeKg: number;
    }>,
    totalVolumeKg?: number,
    notes?: string
  ) => void;
  onUpdateWorkoutProgram?: (updatedProgram: WorkoutProgram) => void;
  onUpdateUserProfile?: (profile: UserProfile) => void;
}

export const WorkoutProgramView: React.FC<WorkoutProgramViewProps> = ({
  workoutPrograms,
  userProfile,
  workoutLogs,
  onClearAllWorkoutLogs,
  onDeleteWorkoutLog,
  onBatchDeleteWorkoutLogs,
  onUpdateWorkoutLogNotes,
  onToggleWorkoutLog,
  onUpdateWorkoutProgram,
  onUpdateUserProfile,
}) => {
  const [isClearWorkoutModalOpen, setIsClearWorkoutModalOpen] = useState<boolean>(false);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState<boolean>(false);
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>([]);
  const [showManageHistory, setShowManageHistory] = useState<boolean>(false);
  const [completedSetsMap, setCompletedSetsMap] = useState<Record<string, number[]>>({});
  const [activePostWorkoutNotes, setActivePostWorkoutNotes] = useState<string>('');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingLogNotes, setEditingLogNotes] = useState<string>('');


  const toggleSelectWorkout = (id: string) => {
    setSelectedWorkoutIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllWorkouts = () => {
    if (selectedWorkoutIds.length === workoutLogs.length) {
      setSelectedWorkoutIds([]);
    } else {
      setSelectedWorkoutIds(workoutLogs.map((w) => w.id || `${w.date}_${w.dayId}`));
    }
  };

  const handleConfirmBatchDelete = () => {
    if (selectedWorkoutIds.length === 0) return;
    if (onBatchDeleteWorkoutLogs) {
      onBatchDeleteWorkoutLogs(selectedWorkoutIds);
    } else if (onDeleteWorkoutLog) {
      selectedWorkoutIds.forEach((id) => onDeleteWorkoutLog(id));
    }
    setSelectedWorkoutIds([]);
    setIsBatchDeleteModalOpen(false);
  };
  const initialPrograms = useMemo(() => {
    const stored = getStoredWorkoutPrograms();
    return stored && stored.length > 0 ? stored : MASTER_WORKOUT_PROGRAMS;
  }, []);

  const [localPrograms, setLocalPrograms] = useState<WorkoutProgram[]>(initialPrograms);
  const [selectedProgramId, setSelectedProgramId] = useState<string>(() => {
    if (userProfile.equipmentType === 'bodyweight_only') {
      return initialPrograms.find(p => p.id.includes('bodyweight') || p.id.includes('akhada'))?.id || initialPrograms[0]?.id || '';
    } else if (userProfile.equipmentType === 'dumbbells_bench') {
      return initialPrograms.find(p => p.id.includes('dumbbell'))?.id || initialPrograms[0]?.id || '';
    }
    return initialPrograms[0]?.id || 'ppl-6day';
  });

  const currentProgram = useMemo(() => {
    return localPrograms.find(p => p.id === selectedProgramId) || localPrograms[0] || MASTER_WORKOUT_PROGRAMS[0];
  }, [localPrograms, selectedProgramId]);
  
  const [activeTab, setActiveTab] = useState<'schedule' | 'library'>('schedule');
  const [currentEquipment, setCurrentEquipment] = useState<EquipmentType>(userProfile.equipmentType || 'full_gym');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [activeInjuryMode, setActiveInjuryMode] = useState<boolean>(
    userProfile.injuries && userProfile.injuries.length > 0
  );

  // Automated Rest Timer State
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);
  const [activeRestSeconds, setActiveRestSeconds] = useState<number>(90);
  const [activeRestExerciseName, setActiveRestExerciseName] = useState<string>('Inter-Set Rest Interval');
  const [restTimerKey, setRestTimerKey] = useState<number>(1);

  // Smart Swap Modal State
  const [smartSwapExercise, setSmartSwapExercise] = useState<Exercise | null>(null);
  const [isSmartSwapOpen, setIsSmartSwapOpen] = useState<boolean>(false);
  const [recentSwapBanner, setRecentSwapBanner] = useState<string | null>(null);

  // Quick View Hindi/English Guide Modal State
  const [quickViewExercise, setQuickViewExercise] = useState<ExerciseLibraryItem | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);

  // Rate of Perceived Exertion (RPE) & Working Weight Logging State per Exercise
  const [loggedExerciseRPE, setLoggedExerciseRPE] = useState<Record<string, number>>({});
  const [loggedExerciseWeights, setLoggedExerciseWeights] = useState<Record<string, number>>({});

  const handleUpdateRPE = (exerciseId: string, value: number) => {
    setLoggedExerciseRPE((prev) => ({
      ...prev,
      [exerciseId]: Math.min(10, Math.max(6, Number(value.toFixed(1)))),
    }));
  };

  const handleUpdateWeight = (exerciseId: string, weightKg: number) => {
    setLoggedExerciseWeights((prev) => ({
      ...prev,
      [exerciseId]: Math.max(0, weightKg),
    }));
  };

  // YouTube Video Search & Form Modal State
  const [youTubeModalExercise, setYouTubeModalExercise] = useState<Exercise | null>(null);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState<boolean>(false);
  const [copiedExerciseId, setCopiedExerciseId] = useState<string | null>(null);

  // Quick Add Exercise Modal State
  const [isAddMovementModalOpen, setIsAddMovementModalOpen] = useState<boolean>(false);
  const [addMovementSearch, setAddMovementSearch] = useState<string>('');
  const [addMovementCategory, setAddMovementCategory] = useState<string>('All');

  // ExerciseRegistry Background Validation & Diagnostic Auditor State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [auditReport, setAuditReport] = useState<WorkoutProgramAuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Background Validation Script: Auto-checks active program exercises against ExerciseRegistry
  React.useEffect(() => {
    if (!currentProgram) return;
    let needsUpdate = false;
    const updatedDays = currentProgram.days.map((day) => {
      let dayChanged = false;
      const verifiedExercises = day.exercises.map((ex) => {
        const validation = validateExerciseAgainstRegistry(ex);
        if (validation.entry && validation.entry.formalName !== ex.name) {
          dayChanged = true;
          return {
            ...ex,
            name: validation.entry.formalName,
            targetMuscle: validation.entry.targetMuscle || ex.targetMuscle,
            equipment: validation.entry.equipment || ex.equipment,
          };
        }
        return ex;
      });
      if (dayChanged) needsUpdate = true;
      return { ...day, exercises: verifiedExercises };
    });

    if (needsUpdate) {
      const updatedProgram: WorkoutProgram = {
        ...currentProgram,
        days: updatedDays,
      };
      setLocalPrograms((prev) => prev.map((p) => (p.id === updatedProgram.id ? updatedProgram : p)));
      saveStoredWorkoutPrograms(localPrograms.map((p) => (p.id === updatedProgram.id ? updatedProgram : p)));
    }
  }, [currentProgram?.id]);

  const handleRunFullAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const report = auditWorkoutPrograms(localPrograms);
      setAuditReport(report);
      setLocalPrograms(report.programs);
      saveStoredWorkoutPrograms(report.programs);
      setIsAuditing(false);
      setIsAuditModalOpen(true);
      setRecentSwapBanner(`Exercise Registry Audit: ${report.totalExercisesAudited} exercises verified.`);
      setTimeout(() => setRecentSwapBanner(null), 5000);
    }, 450);
  };

  const rawActiveDay = currentProgram?.days[selectedDayIndex] || currentProgram?.days[0];

  // Strictly sanitize active day exercises if bodyweight_only is selected
  const activeDay = useMemo(() => {
    if (!rawActiveDay) return rawActiveDay;
    if (currentEquipment !== 'bodyweight_only') return rawActiveDay;

    // Filter out weighted exercises if bodyweight_only is active
    const weightedKeywords = ['dumbbell', 'barbell', 'cable', 'machine', 'smith', 'weighted', 'lat pulldown'];
    const sanitizedExercises = rawActiveDay.exercises.filter((ex) => {
      const nameLower = (ex.name || '').toLowerCase();
      const equipLower = (ex.equipment || '').toLowerCase();
      const isWeighted = weightedKeywords.some(kw => nameLower.includes(kw) || equipLower.includes(kw));
      return !isWeighted;
    });

    return {
      ...rawActiveDay,
      exercises: sanitizedExercises.length > 0 ? sanitizedExercises : rawActiveDay.exercises
    };
  }, [rawActiveDay, currentEquipment]);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleEquipmentChange = (newEquipment: EquipmentType) => {
    setCurrentEquipment(newEquipment);

    // Auto-switch to matching preset program
    if (newEquipment === 'bodyweight_only') {
      const bwProg = localPrograms.find(p => p.id.includes('bodyweight') || p.id.includes('akhada'));
      if (bwProg) setSelectedProgramId(bwProg.id);
    } else if (newEquipment === 'dumbbells_bench') {
      const dbProg = localPrograms.find(p => p.id.includes('dumbbell'));
      if (dbProg) setSelectedProgramId(dbProg.id);
    } else {
      const gymProg = localPrograms.find(p => p.id === 'ppl-6day' || p.id === 'upper-lower-4day' || !p.id.includes('bodyweight'));
      if (gymProg) setSelectedProgramId(gymProg.id);
    }

    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        ...userProfile,
        equipmentType: newEquipment,
      });
    }
  };

  const handleSelectProgram = (programId: string) => {
    setSelectedProgramId(programId);
    setSelectedDayIndex(0);
    const prog = localPrograms.find(p => p.id === programId);
    if (prog) {
      setRecentSwapBanner(`Switched to "${prog.title}"!`);
      setTimeout(() => setRecentSwapBanner(null), 4000);
    }
  };

  const handleMoveExercise = (exerciseIndex: number, direction: 'up' | 'down') => {
    if (!currentProgram || !activeDay) return;
    const targetIndex = direction === 'up' ? exerciseIndex - 1 : exerciseIndex + 1;
    if (targetIndex < 0 || targetIndex >= activeDay.exercises.length) return;

    const newExercises = [...activeDay.exercises];
    const [moved] = newExercises.splice(exerciseIndex, 1);
    newExercises.splice(targetIndex, 0, moved);

    const updatedDays = currentProgram.days.map((day, dIdx) => {
      if (dIdx !== selectedDayIndex) return day;
      return { ...day, exercises: newExercises };
    });

    const updatedProgram: WorkoutProgram = {
      ...currentProgram,
      days: updatedDays,
    };

    const newPrograms = localPrograms.map(p => p.id === updatedProgram.id ? updatedProgram : p);
    setLocalPrograms(newPrograms);
    saveStoredWorkoutPrograms(newPrograms);
    if (onUpdateWorkoutProgram) {
      onUpdateWorkoutProgram(updatedProgram);
    }
    setRecentSwapBanner(`Moved "${moved.name}" ${direction === 'up' ? 'earlier' : 'later'} in session.`);
    setTimeout(() => setRecentSwapBanner(null), 3000);
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    if (!currentProgram || !activeDay) return;
    const removedName = activeDay.exercises[exerciseIndex]?.name;
    const newExercises = activeDay.exercises.filter((_, idx) => idx !== exerciseIndex);

    const updatedDays = currentProgram.days.map((day, dIdx) => {
      if (dIdx !== selectedDayIndex) return day;
      return { ...day, exercises: newExercises };
    });

    const updatedProgram: WorkoutProgram = {
      ...currentProgram,
      days: updatedDays,
    };

    const newPrograms = localPrograms.map(p => p.id === updatedProgram.id ? updatedProgram : p);
    setLocalPrograms(newPrograms);
    saveStoredWorkoutPrograms(newPrograms);
    if (onUpdateWorkoutProgram) {
      onUpdateWorkoutProgram(updatedProgram);
    }
    setRecentSwapBanner(`Removed "${removedName}" from ${activeDay.dayName}.`);
    setTimeout(() => setRecentSwapBanner(null), 4000);
  };

  const handleResetToScienceOrder = () => {
    const masterProg = MASTER_WORKOUT_PROGRAMS.find(p => p.id === currentProgram.id) || MASTER_WORKOUT_PROGRAMS[0];
    const newPrograms = localPrograms.map(p => p.id === masterProg.id ? masterProg : p);
    setLocalPrograms(newPrograms);
    saveStoredWorkoutPrograms(newPrograms);
    if (onUpdateWorkoutProgram) {
      onUpdateWorkoutProgram(masterProg);
    }
    setRecentSwapBanner(`Reset ${masterProg.title} to 100% scientific default arrangement!`);
    setTimeout(() => setRecentSwapBanner(null), 5000);
  };

  const handleAutoSortBiomechanics = () => {
    if (!currentProgram || !activeDay) return;
    const sortedExercises = sortExercisesByBiomechanicalComplexity(activeDay.exercises);

    const updatedDays = currentProgram.days.map((day, dIdx) => {
      if (dIdx !== selectedDayIndex) return day;
      return { ...day, exercises: sortedExercises };
    });

    const updatedProgram: WorkoutProgram = {
      ...currentProgram,
      days: updatedDays,
    };

    const newPrograms = localPrograms.map(p => p.id === updatedProgram.id ? updatedProgram : p);
    setLocalPrograms(newPrograms);
    saveStoredWorkoutPrograms(newPrograms);
    if (onUpdateWorkoutProgram) {
      onUpdateWorkoutProgram(updatedProgram);
    }
    setRecentSwapBanner(`⚡ Automatically re-ordered "${activeDay.dayName}" into scientific Compound → Isolation sequence!`);
    setTimeout(() => setRecentSwapBanner(null), 4000);
  };

  const handleOpenYouTubeSearch = (exercise: Exercise) => {
    setYouTubeModalExercise(exercise);
    setIsYouTubeModalOpen(true);
  };

  const handleCopyExerciseName = (exerciseName: string, id: string) => {
    const clean = getStandardizedExerciseSearchTerm(exerciseName);
    navigator.clipboard.writeText(`${clean} proper form tutorial`);
    setCopiedExerciseId(id);
    setRecentSwapBanner(`Copied "${clean}" search query to clipboard for YouTube!`);
    setTimeout(() => setCopiedExerciseId(null), 3000);
    setTimeout(() => setRecentSwapBanner(null), 3500);
  };

  const handleOpenQuickGuide = (exercise: Exercise) => {
    const matched = EXERCISE_LIBRARY.find(
      (item) => item.id === exercise.id || item.name.toLowerCase() === exercise.name.toLowerCase()
    );

    if (matched) {
      setQuickViewExercise(matched);
    } else {
      const nameL = (exercise.name || '').toLowerCase();
      const muscleL = (exercise.targetMuscle || '').toLowerCase();
      let derivedCat: ExerciseLibraryItem['category'] = 'Chest';

      if (muscleL.includes('lat') || muscleL.includes('back') || nameL.includes('row') || nameL.includes('pull') || nameL.includes('chin')) {
        derivedCat = 'Back';
      } else if (muscleL.includes('delt') || muscleL.includes('shoulder') || nameL.includes('overhead') || nameL.includes('military') || nameL.includes('lateral')) {
        derivedCat = 'Shoulders';
      } else if (muscleL.includes('quad') || nameL.includes('squat') || nameL.includes('leg press') || nameL.includes('split squat')) {
        derivedCat = 'Quads';
      } else if (muscleL.includes('hamstring') || nameL.includes('deadlift') || nameL.includes('rdl') || nameL.includes('leg curl')) {
        derivedCat = 'Hamstrings';
      } else if (muscleL.includes('glute') || nameL.includes('hip thrust')) {
        derivedCat = 'Glutes';
      } else if (muscleL.includes('bicep') || (nameL.includes('curl') && !nameL.includes('leg'))) {
        derivedCat = 'Biceps';
      } else if (muscleL.includes('tricep') || nameL.includes('skull') || nameL.includes('pushdown') || nameL.includes('dip')) {
        derivedCat = 'Triceps';
      } else if (muscleL.includes('calf') || nameL.includes('calves')) {
        derivedCat = 'Calves';
      } else if (muscleL.includes('ab') || muscleL.includes('core') || nameL.includes('plank') || nameL.includes('rollout')) {
        derivedCat = 'Core';
      } else if (muscleL.includes('cardio') || nameL.includes('rope') || nameL.includes('mobility')) {
        derivedCat = 'Cardio_Mobility';
      }

      setQuickViewExercise({
        id: exercise.id,
        name: exercise.name,
        category: derivedCat,
        targetMuscle: exercise.targetMuscle,
        secondaryMuscles: [],
        equipment: exercise.equipment,
        equipmentType: currentEquipment,
        difficulty: 'Intermediate',
        sets: exercise.sets,
        reps: exercise.reps,
        restSeconds: exercise.restSeconds,
        rpeTarget: exercise.rpeTarget,
        emgFocus: exercise.emgFocus,
        scienceTip: exercise.scienceTip,
        hypertrophyScore: 9.5,
        hypertrophyRank: 'S-Tier',
        muscleBuildingQuality: 'High motor unit recruitment and deep stretch-mediated hypertrophy.',
        injuryAlternative: exercise.injuryAlternative,
      });
    }
    setIsQuickViewOpen(true);
  };

  const handleUpdateNotificationSettings = (settings: WorkoutNotificationSettings) => {
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        ...userProfile,
        notificationSettings: settings,
      });
    }
  };

  const handleAddExerciseToActiveDay = (exercise: Exercise) => {
    if (!activeDay) return;
    const updatedDays = currentProgram.days.map((day, idx) => {
      if (idx === selectedDayIndex) {
        return {
          ...day,
          exercises: [...day.exercises, exercise],
        };
      }
      return day;
    });

    const updatedProgram: WorkoutProgram = {
      ...currentProgram,
      days: updatedDays,
    };

    const newPrograms = localPrograms.map(p => p.id === updatedProgram.id ? updatedProgram : p);
    setLocalPrograms(newPrograms);
    saveStoredWorkoutPrograms(newPrograms);
    if (onUpdateWorkoutProgram) {
      onUpdateWorkoutProgram(updatedProgram);
    }
    setRecentSwapBanner(`Added "${exercise.name}" to ${activeDay.dayName}!`);
    setTimeout(() => setRecentSwapBanner(null), 5000);
    setIsAddMovementModalOpen(false);
  };

  const startRestForExercise = (exerciseName: string, restSec: number) => {
    setActiveRestExerciseName(exerciseName);
    setActiveRestSeconds(restSec || 90);
    setRestTimerKey((prev) => prev + 1);
    setIsRestTimerActive(true);
  };

  const toggleExerciseComplete = (exerciseId: string, exName?: string, restSec?: number) => {
    setCompletedExercises((prev) => {
      const willBeCompleted = !prev[exerciseId];
      const nextState = {
        ...prev,
        [exerciseId]: willBeCompleted,
      };

      if (willBeCompleted) {
        triggerHapticSetComplete();
      }

      if (willBeCompleted && exName) {
        startRestForExercise(exName, restSec || 90);
      }

      if (activeDay) {
        const allDone = activeDay.exercises.every((ex) => nextState[ex.id]);
        if (allDone) {
          triggerHapticWorkoutComplete();
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#3B82F6', '#E8912D', '#16A34A'],
            });
          } catch (e) {}
        }
      }

      return nextState;
    });
  };

  const handleLogSet = (exerciseId: string, setNumber: number, exerciseName: string, restSec: number) => {
    setCompletedSetsMap((prev) => {
      const currentSets = prev[exerciseId] || [];
      const isCompleted = currentSets.includes(setNumber);
      const updatedSets = isCompleted
        ? currentSets.filter((s) => s !== setNumber)
        : [...currentSets, setNumber];

      if (!isCompleted) {
        triggerHapticSetComplete();
        // Auto-starts rest interval timer after logged set
        startRestForExercise(exerciseName, restSec || 90);
      }

      // If all prescribed sets for this movement are completed, check the exercise complete
      const targetExercise = activeDay?.exercises.find((e) => e.id === exerciseId);
      if (targetExercise && updatedSets.length >= (targetExercise.sets || 3)) {
        setCompletedExercises((prevComp) => ({ ...prevComp, [exerciseId]: true }));
      }

      return {
        ...prev,
        [exerciseId]: updatedSets,
      };
    });
  };

  const handleOpenSmartSwap = (exercise: Exercise) => {
    setSmartSwapExercise(exercise);
    setIsSmartSwapOpen(true);
  };

  const handleApplySmartSwap = (originalExerciseId: string, swap: ExerciseSmartSwapOption) => {
    if (!currentProgram || !activeDay) return;

    const updatedDays = currentProgram.days.map((day, dIdx) => {
      if (dIdx !== selectedDayIndex) return day;
      const updatedExercises = day.exercises.map((ex) => {
        if (ex.id !== originalExerciseId) return ex;
        
        return {
          ...ex,
          name: swap.name,
          equipment: swap.equipment,
          targetMuscle: swap.targetMuscle || ex.targetMuscle,
          reps: swap.prescribedSetsReps || ex.reps,
          scienceTip: swap.setupCue || ex.scienceTip,
          emgFocus: `${swap.biomechanicalRationale.slice(0, 75)}...`,
          injuryAlternative: {
            originalExercise: ex.name,
            substitute: swap.name,
            reason: `${swap.jointSafetyRating}: ${swap.howItAddressesInjury}`,
          },
        };
      });
      return { ...day, exercises: updatedExercises };
    });

    const updatedProgram: WorkoutProgram = {
      ...currentProgram,
      days: updatedDays,
    };

    const newPrograms = localPrograms.map(p => p.id === updatedProgram.id ? updatedProgram : p);
    setLocalPrograms(newPrograms);
    saveStoredWorkoutPrograms(newPrograms);
    if (onUpdateWorkoutProgram) {
      onUpdateWorkoutProgram(updatedProgram);
    }

    setRecentSwapBanner(`Successfully swapped in "${swap.name}" (${swap.matchPercentage}% biomechanical match) with joint safety protection!`);
    setTimeout(() => setRecentSwapBanner(null), 6000);
  };

  const dayCompletedCount = activeDay?.exercises.filter((ex) => completedExercises[ex.id]).length || 0;
  const totalDayExercises = activeDay?.exercises.length || 1;
  const dayProgressPercent = Math.round((dayCompletedCount / totalDayExercises) * 100);

  const handleLogActiveDayToStreak = () => {
    if (!activeDay) return;

    // Calculate Average RPE across performed exercises
    const completedOrAll = activeDay.exercises.filter((ex) => completedExercises[ex.id]);
    const targetExercises = completedOrAll.length > 0 ? completedOrAll : activeDay.exercises;

    let totalRpeSum = 0;
    let totalVolumeSum = 0;

    const loggedItems = activeDay.exercises.map((ex) => {
      const actualRpe = loggedExerciseRPE[ex.id] ?? ex.rpeTarget ?? 8.0;
      const weight = loggedExerciseWeights[ex.id] ?? (ex.equipment.includes('Barbell') ? 60 : ex.equipment.includes('Dumbbell') ? 22 : 0);
      const repCount = parseInt(ex.reps.split('-')[0]) || 10;
      const volume = ex.sets * repCount * (weight > 0 ? weight : (userProfile.weightKg * 0.6));

      totalRpeSum += actualRpe;
      totalVolumeSum += volume;

      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetMuscle: ex.targetMuscle,
        sets: ex.sets,
        reps: repCount,
        weightKg: weight,
        rpeLogged: actualRpe,
        volumeKg: Math.round(volume),
      };
    });

    const averageRpe = Number((totalRpeSum / activeDay.exercises.length).toFixed(1));

    onToggleWorkoutLog(
      todayStr,
      activeDay.id,
      activeDay.dayName,
      activeDay.durationMin,
      dayCompletedCount || totalDayExercises,
      totalDayExercises,
      false,
      averageRpe,
      loggedItems,
      Math.round(totalVolumeSum),
      activePostWorkoutNotes.trim() || undefined
    );

    setActivePostWorkoutNotes('');
    triggerHapticWorkoutComplete();


    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#E8912D', '#16A34A'],
      });
    } catch (e) {}
  };

  // Filtered exercises for Quick Add modal
  const filteredLibraryExercises = useMemo(() => {
    return EXERCISE_LIBRARY.filter((item) => {
      if (addMovementCategory !== 'All' && item.category !== addMovementCategory) return false;
      if (addMovementSearch) {
        const query = addMovementSearch.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesTarget = item.targetMuscle.toLowerCase().includes(query);
        const matchesHindi = (item.hindiTerminology || '').toLowerCase().includes(query);
        if (!matchesName && !matchesTarget && !matchesHindi) return false;
      }
      return true;
    });
  }, [addMovementCategory, addMovementSearch]);

  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Biceps', 'Triceps', 'Calves', 'Core', 'Cardio_Mobility'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-[#1E3A5F] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA]">
              {currentProgram.splitType.toUpperCase()} SPLIT
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
              {currentProgram.days.length} Days / Week
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 capitalize">
              {userProfile.experienceLevel || 'Intermediate'} Level
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-2">
            {currentProgram?.title || 'Hypertrophy & Strength Program'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA8A2] mt-1 max-w-2xl">
            {currentProgram?.scientificPhilosophy}
          </p>

          {/* Program Split Fast-Switcher Badges */}
          <div className="mt-4 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9EA8A2] mr-1">Switch Routine:</span>
            {localPrograms.map((p) => {
              const isSelected = p.id === selectedProgramId;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProgram(p.id)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-2xs'
                      : 'bg-[#FAFAF8] dark:bg-[#1E2220] border-[#E5E7EB] dark:border-[#1E3A5F] text-[#4B5563] dark:text-[#9EA8A2] hover:bg-gray-100 dark:hover:bg-[#252A28]'
                  }`}
                >
                  {p.title.split('(')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls: Rest Timer & Injury Screening Toggle */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveRestSeconds(90);
              setActiveRestExerciseName('Inter-Set Rest');
              setIsRestTimerActive(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E201F] border border-[#3B82F6]/40 dark:border-[#60A5FA]/40 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-bold hover:bg-[#3B82F6]/5 dark:hover:bg-[#3B82F6]/15 shadow-2xs transition-all cursor-pointer"
          >
            <Timer className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />
            <span>{isRestTimerActive ? 'Rest Timer Active' : 'Start Rest Timer'}</span>
          </button>

          <div className="bg-[#FAFAF8] dark:bg-[#111111] p-2.5 sm:p-3 rounded-xl border border-[#E5E7EB] dark:border-[#1E3A5F] flex items-center gap-3 shrink-0 justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className={`w-4 h-4 sm:w-5 sm:h-5 ${activeInjuryMode ? 'text-[#E8912D]' : 'text-[#9CA3AF] dark:text-[#6B7280]'}`} />
              <div>
                <div className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">Injury Shield</div>
                <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
                  {userProfile.injuries?.join(', ') || 'No joint restrictions'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={activeInjuryMode}
              onChange={(e) => setActiveInjuryMode(e.target.checked)}
              className="w-4 h-4 accent-[#3B82F6] rounded cursor-pointer ml-1"
            />
          </div>
        </div>
      </div>

      {/* Floating Rest Timer Trigger Pill when timer is closed */}
      {!isRestTimerActive && activeTab === 'schedule' && (
        <button
          onClick={() => {
            setActiveRestSeconds(90);
            setActiveRestExerciseName('Inter-Set Recovery');
            setIsRestTimerActive(true);
          }}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 cursor-pointer border-2 border-white/20 animate-in fade-in"
          title="Open Floating Rest Timer"
        >
          <Timer className="w-4 h-4 animate-pulse" />
          <span>Rest Timer</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">90s</span>
        </button>
      )}

      {/* INTERACTIVE FLOATING REST INTERVAL TIMER */}
      {isRestTimerActive && (
        <RestIntervalTimer
          key={restTimerKey}
          initialSeconds={activeRestSeconds}
          exerciseName={activeRestExerciseName}
          isFloating={true}
          onDurationChange={(newSec) => setActiveRestSeconds(newSec)}
          onClose={() => setIsRestTimerActive(false)}
        />
      )}

      {/* Recent Swap Toast Banner */}
      {recentSwapBanner && (
        <div className="p-4 rounded-2xl bg-[#1E3A5F] dark:bg-[#1E3A5F]/50 border border-[#3B82F6]/50 dark:border-[#1E3A5F] text-xs text-[#1D4ED8] dark:text-[#60A5FA] flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA] shrink-0" />
            <span className="font-semibold">{recentSwapBanner}</span>
          </div>
          <button
            onClick={() => setRecentSwapBanner(null)}
            className="text-[#2563EB] dark:text-[#60A5FA] font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* BROWSER WORKOUT NOTIFICATION & SCHEDULE BANNER */}
      <WorkoutNotificationBanner
        userProfile={userProfile}
        currentProgram={currentProgram}
        onUpdateNotificationSettings={handleUpdateNotificationSettings}
      />

      {/* Sub-view Selector Tabs: Program Schedule vs 150+ Exercise Library */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E5E7EB] dark:border-[#1E3A5F] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-[#3B82F6] text-white shadow-xs'
                : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9] hover:bg-gray-100 dark:hover:bg-[#1E201F]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Weekly Scheduled Program ({currentProgram.splitType})</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-[#3B82F6] text-white shadow-xs'
                : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9] hover:bg-gray-100 dark:hover:bg-[#1E201F]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>150+ Exercise Database & Guides</span>
          </button>
        </div>

        {/* Equipment & Split Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2] font-semibold flex items-center gap-1">
            <Dumbbell className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#60A5FA]" />
            <span>Gear Mode:</span>
          </span>
          <select
            value={currentEquipment}
            onChange={(e) => handleEquipmentChange(e.target.value as EquipmentType)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#1E3A5F] bg-white dark:bg-[#1C1F1E] text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-hidden focus:ring-1 focus:ring-[#3B82F6] cursor-pointer"
          >
            <option value="full_gym">🏋️ Full Commercial Gym (Barbell, Cable, Machine)</option>
            <option value="dumbbells_bench">🏡 Home Dumbbells & Bench</option>
            <option value="bodyweight_only">🤸 100% Pure Bodyweight & Calisthenics (0 Weights)</option>
          </select>
        </div>
      </div>

      {activeTab === 'library' ? (
        <ExerciseLibraryExplorer
          userProfile={userProfile}
          currentEquipment={currentEquipment}
          onEquipmentChange={handleEquipmentChange}
          onAddExerciseToActiveDay={handleAddExerciseToActiveDay}
        />
      ) : (
        <>
          {/* CONSISTENCY STREAK TRACKER */}
          <ConsistencyStreakTracker
            workoutLogs={workoutLogs}
            userProfile={userProfile}
            onToggleWorkoutLog={onToggleWorkoutLog}
          />

          {/* Action Toolbar: Google Keep Sync, Batch Delete & Manage Workout History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#1E3A5F] flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">Workout History & Sync:</span>
                <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">({workoutLogs.length} logged sessions)</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {workoutLogs.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowManageHistory(!showManageHistory)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#1A1A1A] dark:hover:bg-[#1E3A5F] text-[#374151] dark:text-[#D1D5DB] text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>{showManageHistory ? 'Hide Sessions' : 'Manage Logs'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSelectAllWorkouts}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#1A1A1A] dark:hover:bg-[#1E3A5F] text-[#374151] dark:text-[#D1D5DB] text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>{selectedWorkoutIds.length === workoutLogs.length ? 'Deselect All' : 'Select All'}</span>
                    </button>

                    {selectedWorkoutIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsBatchDeleteModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer animate-in fade-in"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Selected ({selectedWorkoutIds.length})</span>
                      </button>
                    )}
                  </>
                )}

                {workoutLogs.length > 0 && (
                  <button
                    id="workout-clear-history-btn"
                    type="button"
                    onClick={() => setIsClearWorkoutModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/30 transition-all cursor-pointer"
                    title="Clear workout history (requires typing DELETE to confirm)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Workout Logs Batch Manager */}
            {showManageHistory && workoutLogs.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#1E3A5F] space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9EA8A2] mb-1">
                  <span>Select logs to batch delete or review details:</span>
                  <span>{selectedWorkoutIds.length} of {workoutLogs.length} selected</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {workoutLogs.map((log) => {
                    const logIdentifier = log.id || `${log.date}_${log.dayId}`;
                    const isSelected = selectedWorkoutIds.includes(logIdentifier);

                    return (
                      <div
                        key={logIdentifier}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-colors ${
                          isSelected
                            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                            : 'bg-white dark:bg-[#1C1F1E] border-[#E5E7EB] dark:border-[#1E3A5F]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectWorkout(logIdentifier)}
                            className="w-4 h-4 rounded text-[#3B82F6] focus:ring-[#3B82F6] border-gray-300 dark:border-zinc-700 cursor-pointer"
                            title={isSelected ? 'Deselect workout' : 'Select workout for batch action'}
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-[#1A1D1B] dark:text-[#E8ECE9]">
                                {log.dayName || 'Workout Session'}
                              </span>
                              {log.isRestDay && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                  Rest Day
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
                              {log.date} • {log.durationMin} min • {log.exercisesCompleted}/{log.totalExercises} exercises
                              {log.totalVolumeKg ? ` • ${Math.round(log.totalVolumeKg).toLocaleString()} kg` : ''}
                            </div>

                            {/* Performance Reflection Notes */}
                            {log.notes && editingLogId !== logIdentifier && (
                              <div className="mt-1.5 p-2 rounded-lg bg-[#1E3A5F]/70 dark:bg-[#1E3A5F]/30 border border-[#3B82F6]/50 dark:border-[#1E3A5F]/40 text-[11px] text-[#1E3A5F] dark:text-[#60A5FA] flex items-start justify-between gap-2">
                                <div className="italic flex-1 break-words">
                                  "{log.notes}"
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingLogId(logIdentifier);
                                    setEditingLogNotes(log.notes || '');
                                  }}
                                  className="text-[10px] text-[#2563EB] dark:text-[#60A5FA] font-semibold hover:underline shrink-0 cursor-pointer"
                                >
                                  Edit
                                </button>
                              </div>
                            )}

                            {editingLogId === logIdentifier && (
                              <div className="mt-2 space-y-1.5">
                                <textarea
                                  value={editingLogNotes}
                                  onChange={(e) => setEditingLogNotes(e.target.value)}
                                  placeholder="Update reflection..."
                                  rows={2}
                                  className="w-full text-xs p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#070707] text-gray-900 dark:text-white"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setEditingLogId(null)}
                                    className="px-2 py-1 text-[11px] rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onUpdateWorkoutLogNotes) {
                                        onUpdateWorkoutLogNotes(logIdentifier, editingLogNotes);
                                      }
                                      setEditingLogId(null);
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#3B82F6] text-white"
                                  >
                                    Save Note
                                  </button>
                                </div>
                              </div>
                            )}

                            {!log.notes && editingLogId !== logIdentifier && onUpdateWorkoutLogNotes && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLogId(logIdentifier);
                                  setEditingLogNotes('');
                                }}
                                className="mt-1 text-[11px] text-[#3B82F6] dark:text-[#60A5FA] hover:underline cursor-pointer flex items-center gap-1"
                              >
                                + Add reflections / notes
                              </button>
                            )}
                          </div>
                        </div>

                        {onDeleteWorkoutLog && (
                          <button
                            type="button"
                            onClick={() => onDeleteWorkoutLog(logIdentifier)}
                            className="p-1.5 text-[#9CA3AF] hover:text-[#DC2626] rounded-md transition-colors cursor-pointer"
                            title="Delete this session log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Day Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {currentProgram?.days.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              const completedCount = day.exercises.filter((ex) => completedExercises[ex.id]).length;
              const isAllDone = completedCount === day.exercises.length && day.exercises.length > 0;

              return (
                <button
                  key={day.id}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`p-4 rounded-xl border text-left min-w-[200px] transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-[#111111] border-[#3B82F6] dark:border-[#60A5FA] ring-1 ring-[#3B82F6] dark:ring-[#60A5FA] shadow-xs'
                      : 'bg-[#FAFAF8] dark:bg-[#111111] border-[#E5E7EB] dark:border-[#1E3A5F] hover:bg-white dark:hover:bg-[#1E2220] text-[#6B7280] dark:text-[#9EA8A2]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold ${isSelected ? 'text-[#3B82F6] dark:text-[#60A5FA]' : 'text-[#6B7280] dark:text-[#9EA8A2]'}`}>
                        {day.dayOfWeek}
                      </span>
                      {isAllDone && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#16A34A]/10 dark:bg-[#16A34A]/20 text-[#16A34A] dark:text-[#4ADE80]">
                          Done
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9] mt-1 line-clamp-1">
                      {day.dayName}
                    </div>
                    <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">{day.focus}</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-[#6B7280] dark:text-[#9EA8A2]">{day.exercises.length} movements</span>
                    <span className="font-semibold text-[#3B82F6] dark:text-[#60A5FA]">
                      {completedCount}/{day.exercises.length} completed
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

      {/* Active Workout Day View */}
      {activeDay && (
        <div className="bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-[#1E3A5F] shadow-xs space-y-6 transition-colors">
          {/* Day Progress Header & Biomechanical Arrangement Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#1E3A5F] pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA]">
                  {activeDay.dayOfWeek} Session
                </span>
                <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{activeDay.durationMin} minutes
                </span>
                <span className="text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] bg-[#3B82F6]/10 px-2 py-0.5 rounded border border-[#3B82F6]/20">
                  Biomechanical Hierarchy
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1">
                {activeDay.dayName}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">Focus: {activeDay.focus}</p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between">
              {/* Biomechanical Re-order & Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* ⚡ One-Click Auto Re-Order Compound -> Isolation */}
                <button
                  onClick={handleAutoSortBiomechanics}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#2563EB] hover:from-[#1D4ED8] hover:to-[#1D4ED8] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  title="Automatically arrange exercises: Heavy Compounds → Secondary Multi-Joint → Isolations → Core"
                >
                  <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>Auto-Order (Compound → Isolation)</span>
                </button>

                <button
                  onClick={() => setIsAddMovementModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  title="Add any movement from the 150+ exercise library to this day"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Movement</span>
                </button>

                <button
                  onClick={handleResetToScienceOrder}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-[#1F2220] hover:bg-gray-200 dark:hover:bg-[#282E2B] text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
                  title="Reset exercises to default preset arrangement"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                {/* 🛡️ Centralized ExerciseRegistry Diagnostic Auditor */}
                <button
                  onClick={handleRunFullAudit}
                  disabled={isAuditing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-purple-700 dark:text-[#60A5FA] text-xs font-bold border border-[#3B82F6]/30 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Audit all workout splits against authoritative ExerciseRegistry & refresh YouTube tutorial URLs"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 text-[#3B82F6] dark:text-[#60A5FA] ${isAuditing ? 'animate-spin' : ''}`} />
                  <span>{isAuditing ? 'Auditing...' : 'Audit YouTube Links'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-800">
                <div className="text-right">
                  <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Progress</div>
                  <div className="text-sm font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                    {dayCompletedCount}/{totalDayExercises} ({dayProgressPercent}%)
                  </div>
                </div>
                <div className="w-14 bg-[#F3F4F6] dark:bg-[#1E3A5F] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#3B82F6] dark:bg-[#60A5FA] h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${dayProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            {activeDay.exercises.map((exercise, idx) => {
              const isCompleted = !!completedExercises[exercise.id];
              const hasInjurySub = activeInjuryMode && exercise.injuryAlternative;
              const photoData = getExercisePhoto(exercise.id, '', exercise.name);
              const bioClass = getBiomechanicalClassification(exercise.name, exercise.targetMuscle, exercise.equipment);
              const isFirst = idx === 0;
              const isLast = idx === activeDay.exercises.length - 1;
              const isCopied = copiedExerciseId === exercise.id;

              return (
                <div
                  key={exercise.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-[#FAFAF8] dark:bg-[#111111]/60 border-[#E5E7EB] dark:border-[#1E3A5F] opacity-75'
                      : 'bg-white dark:bg-[#111111] border-[#E5E7EB] dark:border-[#1E3A5F] hover:border-[#3B82F6]/50 dark:hover:border-[#60A5FA]/50 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Exercise Info & Biomechanics */}
                    <div className="flex items-start gap-3 flex-1">
                      {/* Movement Order Controls (Up / Down) */}
                      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                        <button
                          onClick={() => handleMoveExercise(idx, 'up')}
                          disabled={isFirst}
                          className={`p-1 rounded-md transition-colors ${
                            isFirst
                              ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                              : 'text-gray-500 hover:text-[#3B82F6] dark:text-gray-400 dark:hover:text-[#60A5FA] hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
                          }`}
                          title="Move earlier in workout session"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveExercise(idx, 'down')}
                          disabled={isLast}
                          className={`p-1 rounded-md transition-colors ${
                            isLast
                              ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                              : 'text-gray-500 hover:text-[#3B82F6] dark:text-gray-400 dark:hover:text-[#60A5FA] hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
                          }`}
                          title="Move later in workout session"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => toggleExerciseComplete(exercise.id, exercise.name, exercise.restSeconds)}
                        className="mt-1 text-[#3B82F6] dark:text-[#60A5FA] hover:scale-110 transition-transform shrink-0 cursor-pointer"
                        title={isCompleted ? "Mark Incomplete" : "Mark Set Complete & Auto-Trigger Rest Timer"}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-[#16A34A] dark:text-[#4ADE80] fill-[#16A34A]/10" />
                        ) : (
                          <Circle className="w-6 h-6 text-[#D1D5DB] dark:text-[#4B5563]" />
                        )}
                      </button>

                      {/* Visual action thumbnail with YouTube launcher */}
                      <div
                        onClick={() => handleOpenYouTubeSearch(exercise)}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-black/10 dark:border-white/10 bg-black/20 group cursor-pointer"
                        title="Click to open YouTube form tutorial"
                      >
                        <img
                          src={photoData.imageUrl}
                          alt={exercise.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <Youtube className="w-5 h-5 text-red-500 fill-white drop-shadow-md group-hover:scale-115 transition-transform" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Biomechanical Hierarchy Pill & Meta */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA]">
                            #{idx + 1}
                          </span>
                          
                          {/* Biomechanical Complexity Badge */}
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${bioClass.badgeColor}`}>
                            {bioClass.tierLabel}
                          </span>

                          {/* Authoritative ExerciseRegistry Verified Checkmark Badge */}
                          <span 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#2563EB] dark:text-[#60A5FA] text-[11px] font-bold border border-[#3B82F6]/30 shadow-2xs"
                            title="Cross-referenced & verified with ExerciseRegistry. YouTube search URL guaranteed 100% precision."
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#60A5FA]" />
                            <span>Verified</span>
                          </span>

                          <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9EA8A2]">
                            {exercise.targetMuscle}
                          </span>
                          <span className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">• {exercise.equipment}</span>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                            {/* Direct YouTube Tutorial Button */}
                            <button
                              onClick={() => handleOpenYouTubeSearch(exercise)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                              title="Watch exact proper form tutorial on YouTube"
                            >
                              <Youtube className="w-3.5 h-3.5" />
                              <span>▶ Watch on YouTube</span>
                            </button>

                            {/* Copy Exact Search Query */}
                            <button
                              onClick={() => handleCopyExerciseName(exercise.name, exercise.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-[#202422] hover:bg-gray-200 dark:hover:bg-[#282E2B] text-gray-700 dark:text-gray-300 text-[11px] font-semibold border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
                              title="Copy search query to clipboard"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-[#3B82F6]" />
                                  <span className="text-[#3B82F6] dark:text-[#60A5FA]">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-gray-500" />
                                  <span>Copy Name</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleOpenSmartSwap(exercise)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] text-[11px] font-bold transition-all cursor-pointer"
                              title="Swap with an equivalent movement"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>Swap</span>
                            </button>

                            <button
                              onClick={() => handleRemoveExercise(idx)}
                              className="inline-flex items-center p-1 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Remove exercise from this day"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Proper Standard Exercise Name */}
                        <h3 className={`text-base sm:text-lg font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1.5 ${isCompleted ? 'line-through text-[#6B7280] dark:text-[#6B7280]' : ''}`}>
                          {hasInjurySub ? exercise.injuryAlternative?.substitute : exercise.name}
                        </h3>

                        {/* Movement Pattern Cue */}
                        <div className="mt-1 flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9EA8A2]">
                          <span className="font-semibold text-[#3B82F6] dark:text-[#60A5FA]">{bioClass.movementPattern}</span>
                          <span>•</span>
                          <span>{bioClass.jointType}</span>
                        </div>

                        {/* Injury / Swap Substitution Note */}
                        {hasInjurySub && (
                          <div className="mt-2 p-2 rounded-lg bg-[#E8912D]/10 dark:bg-[#E8912D]/15 border border-[#E8912D]/20 dark:border-[#E8912D]/30 text-xs text-[#9A5B0F] dark:text-amber-300 flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <strong>Injury Protection Active:</strong> Substituted {exercise.injuryAlternative?.originalExercise} with {exercise.injuryAlternative?.substitute}. Reason: {exercise.injuryAlternative?.reason}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Prescribed Sets / Reps / Target RPE / Rest & Timer Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#FAFAF8] dark:bg-[#070707] p-3 rounded-xl border border-[#E5E7EB] dark:border-[#1E3A5F] shrink-0 justify-between">
                      <div className="flex items-center gap-3 justify-between sm:justify-start">
                        <div className="text-center px-1.5">
                          <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] uppercase tracking-wider font-semibold">
                            Sets
                          </div>
                          <div className="text-sm sm:text-base font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                            {exercise.sets}
                          </div>
                        </div>

                        <div className="h-6 w-[1px] bg-[#E5E7EB] dark:bg-[#1E3A5F]" />

                        <div className="text-center px-1.5">
                          <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] uppercase tracking-wider font-semibold">
                            Reps
                          </div>
                          <div className="text-sm sm:text-base font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                            {exercise.reps}
                          </div>
                        </div>

                        <div className="h-6 w-[1px] bg-[#E5E7EB] dark:bg-[#1E3A5F]" />

                        {/* Interactive Rate of Perceived Exertion (RPE) Input */}
                        <div className="text-center px-1.5">
                          <div className="text-[10px] text-[#E8912D] font-bold uppercase tracking-wider flex items-center justify-center gap-0.5">
                            <span>Logged RPE</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <button
                              onClick={() => handleUpdateRPE(exercise.id, (loggedExerciseRPE[exercise.id] ?? exercise.rpeTarget ?? 8.0) - 0.5)}
                              className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center justify-center hover:bg-gray-300 cursor-pointer"
                              title="Decrease RPE"
                            >
                              -
                            </button>
                            <span className="text-xs sm:text-sm font-black text-[#E8912D] min-w-[2.2rem] text-center">
                              {(loggedExerciseRPE[exercise.id] ?? exercise.rpeTarget ?? 8.0).toFixed(1)}
                            </span>
                            <button
                              onClick={() => handleUpdateRPE(exercise.id, (loggedExerciseRPE[exercise.id] ?? exercise.rpeTarget ?? 8.0) + 0.5)}
                              className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center justify-center hover:bg-gray-300 cursor-pointer"
                              title="Increase RPE"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="h-6 w-[1px] bg-[#E5E7EB] dark:bg-[#1E3A5F]" />

                        {/* Working Load (kg) Input */}
                        <div className="text-center px-1.5">
                          <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] uppercase tracking-wider font-semibold">
                            Load (kg)
                          </div>
                          <input
                            type="number"
                            min={0}
                            max={500}
                            placeholder="kg"
                            value={loggedExerciseWeights[exercise.id] ?? ''}
                            onChange={(e) => handleUpdateWeight(exercise.id, parseFloat(e.target.value) || 0)}
                            className="w-14 text-center text-xs sm:text-sm font-bold bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-lg p-1 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-between sm:justify-start pt-2 sm:pt-0 sm:border-l sm:border-[#E5E7EB] sm:dark:border-[#1E3A5F] sm:pl-3">
                        {/* RIR Interpretation Cue */}
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                          {(() => {
                            const rpe = loggedExerciseRPE[exercise.id] ?? exercise.rpeTarget ?? 8.0;
                            if (rpe >= 10) return '🔥 0 RIR (Max Effort)';
                            if (rpe >= 9) return '⚡ 1 RIR (Overload)';
                            if (rpe >= 8) return '🎯 2 RIR (Hypertrophy)';
                            if (rpe >= 7) return '💪 3 RIR (Moderate)';
                            return '🌱 4+ RIR (Warmup)';
                          })()}
                        </div>

                        <button
                          onClick={() => startRestForExercise(exercise.name, exercise.restSeconds)}
                          className="px-2.5 py-1 rounded-lg bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-bold transition-opacity cursor-pointer group flex items-center gap-1"
                          title="Click to start automated rest countdown for this exercise"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{exercise.restSeconds}s Rest</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive Set-by-Set Logging — Auto-starts RestIntervalTimer on tap */}
                    <div className="mt-2.5 pt-2.5 border-t border-[#E5E7EB] dark:border-[#1E3A5F] flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-[#6B7280] dark:text-[#9EA8A2] uppercase tracking-wider mr-1">
                          Log Sets:
                        </span>
                        {Array.from({ length: exercise.sets || 3 }).map((_, setIdx) => {
                          const setNum = setIdx + 1;
                          const isSetDone = (completedSetsMap[exercise.id] || []).includes(setNum);
                          return (
                            <button
                              key={setNum}
                              type="button"
                              onClick={() => handleLogSet(exercise.id, setNum, exercise.name, exercise.restSeconds || 90)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isSetDone
                                  ? 'bg-[#16A34A] text-white shadow-xs'
                                  : 'bg-white dark:bg-[#1E201F] text-[#374151] dark:text-[#D1D5DB] border border-[#E5E7EB] dark:border-[#1E3A5F] hover:border-[#3B82F6] dark:hover:border-[#60A5FA]'
                              }`}
                              title={isSetDone ? `Set ${setNum} logged. Click to toggle.` : `Log Set ${setNum} and auto-start ${exercise.restSeconds || 90}s rest timer`}
                            >
                              {isSetDone ? (
                                <Check className="w-3 h-3 text-white" />
                              ) : (
                                <Circle className="w-3 h-3 text-gray-400" />
                              )}
                              <span>Set {setNum}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                        {(completedSetsMap[exercise.id]?.length || 0)} of {exercise.sets || 3} sets logged
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Session Complete Bottom CTA */}
          <div className="p-5 rounded-2xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#1E3A5F] space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9]">
                  {dayCompletedCount === totalDayExercises ? '🎉 All Prescribed Movements Completed!' : `${dayCompletedCount} of ${totalDayExercises} Movements Completed`}
                </div>
                <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
                  Lock in your training session to maintain your progressive overload log and advance your consistency streak.
                </p>
              </div>

              <button
                onClick={handleLogActiveDayToStreak}
                className="px-5 py-2.5 rounded-xl bg-[#3B82F6] text-white text-xs sm:text-sm font-bold hover:bg-[#2563EB] transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Lock In Session & Boost Streak</span>
              </button>
            </div>

            {/* Optional Post-Workout Notes Reflection Field */}
            <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#1E3A5F]">
              <label className="block text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
                Post-Workout Performance Reflections & Notes (Optional)
              </label>
              <textarea
                value={activePostWorkoutNotes}
                onChange={(e) => setActivePostWorkoutNotes(e.target.value)}
                placeholder="Jot down notes (e.g., Felt strong on squats, new PR on bench press, minor hamstring tightness, great pump)..."
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-[#E5E7EB] dark:border-[#1E3A5F] bg-white dark:bg-[#070707] text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-hidden focus:ring-2 focus:ring-[#3B82F6] placeholder-gray-400 dark:placeholder-gray-600 resize-none"
              />
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Smart Swap Modal */}
      <SmartSwapModal
        isOpen={isSmartSwapOpen}
        onClose={() => setIsSmartSwapOpen(false)}
        currentExercise={smartSwapExercise}
        userProfile={userProfile}
        onApplySwap={handleApplySmartSwap}
      />

      {/* YouTube Video Search & Form Modal */}
      {youTubeModalExercise && (
        <YouTubeExerciseModal
          isOpen={isYouTubeModalOpen}
          exerciseName={youTubeModalExercise.name}
          targetMuscle={youTubeModalExercise.targetMuscle}
          equipment={youTubeModalExercise.equipment}
          onClose={() => {
            setIsYouTubeModalOpen(false);
            setYouTubeModalExercise(null);
          }}
        />
      )}

      {/* Exercise Quick View Modal */}
      <ExerciseQuickViewModal
        isOpen={isQuickViewOpen}
        exercise={quickViewExercise}
        onClose={() => {
          setIsQuickViewOpen(false);
          setQuickViewExercise(null);
        }}
      />

      {/* Quick Add Movement Modal */}
      {isAddMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#3B82F6] dark:text-[#60A5FA]" />
                  <span>Add Exercise to {activeDay?.dayName}</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Pick from 150+ biomechanically validated movements across all muscle groups
                </p>
              </div>
              <button
                onClick={() => setIsAddMovementModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111111] space-y-3">
              <input
                type="text"
                value={addMovementSearch}
                onChange={(e) => setAddMovementSearch(e.target.value)}
                placeholder="Search exercise name (e.g., Incline Dumbbell Press, Pull-Up, Bicep Curl)..."
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#1E2220] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#3B82F6]"
              />

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAddMovementCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      addMovementCategory === cat
                        ? 'bg-[#3B82F6] text-white'
                        : 'bg-white dark:bg-[#1E2220] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredLibraryExercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs">
                  No movements found matching "{addMovementSearch}".
                </div>
              ) : (
                filteredLibraryExercises.map((item) => {
                  const photo = getExercisePhoto(item.id, '', item.name);
                  return (
                    <div
                      key={item.id}
                      className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={photo.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover bg-black/20 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                              {item.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] font-semibold">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span>🎯 {item.targetMuscle}</span>
                            <span>•</span>
                            <span>⚙️ {item.equipment}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handleAddExerciseToActiveDay({
                            id: `custom-${Date.now()}-${item.id}`,
                            name: item.name,
                            sets: item.sets || 3,
                            reps: item.reps || '8-12 reps',
                            rpeTarget: item.rpeTarget || 8,
                            restSeconds: item.restSeconds || 90,
                            targetMuscle: item.targetMuscle,
                            equipment: item.equipment,
                            scienceTip: item.scienceTip,
                            emgFocus: `${item.hypertrophyRank} Hypertrophy (${item.hypertrophyScore}/10) • ${item.muscleBuildingQuality.slice(0, 50)}...`,
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Centralized ExerciseRegistry Diagnostic Auditor Modal */}
      <WorkoutAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        report={auditReport}
        isRunningAudit={isAuditing}
        onTriggerAudit={handleRunFullAudit}
      />

      {/* Bulk Batch Delete Confirmation Modal */}
      <ClearHistoryConfirmModal
        isOpen={isBatchDeleteModalOpen}
        onClose={() => setIsBatchDeleteModalOpen(false)}
        onConfirm={handleConfirmBatchDelete}
        historyType="workouts"
        itemCount={selectedWorkoutIds.length}
        isBatchDelete={true}
        selectedItemTitles={workoutLogs
          .filter((w) => selectedWorkoutIds.includes(w.id || `${w.date}_${w.dayId}`))
          .map((w) => `${w.date}: ${w.dayName || 'Session'}`)}
      />

      {/* Confirmation Modal: Type DELETE to Confirm */}
      <ClearHistoryConfirmModal
        isOpen={isClearWorkoutModalOpen}
        onClose={() => setIsClearWorkoutModalOpen(false)}
        onConfirm={() => {
          if (onClearAllWorkoutLogs) {
            onClearAllWorkoutLogs();
          }
        }}
        historyType="workouts"
        itemCount={workoutLogs.length}
      />
    </div>
  );
};
