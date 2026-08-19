import React, { useState } from 'react';
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
  Timer
} from 'lucide-react';
import { WorkoutProgram, Exercise, UserProfile, WorkoutCompletionLog, ExerciseSmartSwapOption } from '../types';
import { ConsistencyStreakTracker } from './ConsistencyStreakTracker';
import { SmartSwapModal } from './SmartSwapModal';
import { RestIntervalTimer } from './RestIntervalTimer';
import confetti from 'canvas-confetti';

interface WorkoutProgramViewProps {
  workoutPrograms: WorkoutProgram[];
  userProfile: UserProfile;
  workoutLogs: WorkoutCompletionLog[];
  onToggleWorkoutLog: (date: string, dayId: string, dayName: string, durationMin: number, exercisesCompleted: number, totalExercises: number, isRestDay?: boolean) => void;
  onUpdateWorkoutProgram?: (updatedProgram: WorkoutProgram) => void;
}

export const WorkoutProgramView: React.FC<WorkoutProgramViewProps> = ({
  workoutPrograms,
  userProfile,
  workoutLogs,
  onToggleWorkoutLog,
  onUpdateWorkoutProgram,
}) => {
  const [localPrograms, setLocalPrograms] = useState<WorkoutProgram[]>(workoutPrograms);
  const currentProgram = localPrograms[0] || workoutPrograms[0];
  
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [activeInjuryMode, setActiveInjuryMode] = useState<boolean>(
    userProfile.injuries && userProfile.injuries.length > 0
  );

  // Automated Rest Timer State
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);
  const [activeRestSeconds, setActiveRestSeconds] = useState<number>(90);
  const [activeRestExerciseName, setActiveRestExerciseName] = useState<string>('Inter-Set Rest Interval');

  // Smart Swap Modal State
  const [smartSwapExercise, setSmartSwapExercise] = useState<Exercise | null>(null);
  const [isSmartSwapOpen, setIsSmartSwapOpen] = useState<boolean>(false);
  const [recentSwapBanner, setRecentSwapBanner] = useState<string | null>(null);

  const activeDay = currentProgram?.days[selectedDayIndex] || currentProgram?.days[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const isTodayLogged = workoutLogs.some((l) => l.date === todayStr);

  const startRestForExercise = (exerciseName: string, restSec: number) => {
    setActiveRestExerciseName(exerciseName);
    setActiveRestSeconds(restSec || 90);
    setIsRestTimerActive(true);
  };

  const toggleExerciseComplete = (exerciseId: string, exName?: string, restSec?: number) => {
    setCompletedExercises((prev) => {
      const willBeCompleted = !prev[exerciseId];
      const nextState = {
        ...prev,
        [exerciseId]: willBeCompleted,
      };

      // If marking as complete, automatically trigger the rest interval timer!
      if (willBeCompleted && exName) {
        startRestForExercise(exName, restSec || 90);
      }

      // Check if all exercises on active day are now complete
      if (activeDay) {
        const allDone = activeDay.exercises.every((ex) => nextState[ex.id]);
        if (allDone) {
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#0F6E5F', '#E8912D', '#16A34A'],
            });
          } catch (e) {}
        }
      }

      return nextState;
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

    setLocalPrograms([updatedProgram]);
    if (onUpdateWorkoutProgram) {
      onUpdateWorkoutProgram(updatedProgram);
    }

    setRecentSwapBanner(`Successfully swapped in "${swap.name}" (${swap.matchPercentage}% EMG match) with joint safety protection!`);
    setTimeout(() => setRecentSwapBanner(null), 6000);
  };

  const dayCompletedCount = activeDay?.exercises.filter((ex) => completedExercises[ex.id]).length || 0;
  const totalDayExercises = activeDay?.exercises.length || 1;
  const dayProgressPercent = Math.round((dayCompletedCount / totalDayExercises) * 100);

  const handleLogActiveDayToStreak = () => {
    if (!activeDay) return;
    onToggleWorkoutLog(
      todayStr,
      activeDay.id,
      activeDay.dayName,
      activeDay.durationMin,
      dayCompletedCount || totalDayExercises,
      totalDayExercises,
      false
    );

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0F6E5F', '#E8912D', '#16A34A'],
      });
    } catch (e) {}
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#161817] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#2DD4BF]">
              EMG & Biomechanics Backed
            </span>
            <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Built With Science Principles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-2">
            {currentProgram?.title || 'Scientific Hypertrophy & Strength Program'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA8A2] mt-1 max-w-2xl">
            {currentProgram?.scientificPhilosophy}
          </p>
        </div>

        {/* Action Controls: Rest Timer & Injury Screening Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              setActiveRestSeconds(90);
              setActiveRestExerciseName('Quick Recovery Interval');
              setIsRestTimerActive(!isRestTimerActive);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#1A1D1B] dark:text-[#E8ECE9] text-xs font-bold hover:bg-[#F9FAFB] dark:hover:bg-[#232726] shadow-2xs transition-all cursor-pointer"
          >
            <Timer className="w-4 h-4 text-[#0F6E5F] dark:text-[#5FD1B8]" />
            <span>{isRestTimerActive ? 'Hide Rest Timer' : 'Rest Timer'}</span>
          </button>

          <div className="bg-[#FAFAF8] dark:bg-[#1A1D1C] p-2.5 sm:p-3 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] flex items-center gap-3 shrink-0">
            <ShieldAlert className={`w-4 h-4 sm:w-5 sm:h-5 ${activeInjuryMode ? 'text-[#E8912D]' : 'text-[#9CA3AF] dark:text-[#6B7280]'}`} />
            <div>
              <div className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">Injury Shield Active</div>
              <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
                {userProfile.injuries?.join(', ') || 'No joint restrictions'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={activeInjuryMode}
              onChange={(e) => setActiveInjuryMode(e.target.checked)}
              className="w-4 h-4 accent-[#0F6E5F] rounded cursor-pointer ml-1"
            />
          </div>
        </div>
      </div>

      {/* AUTOMATED REST INTERVAL TIMER (When Triggered or Enabled) */}
      {isRestTimerActive && (
        <div className="animate-in fade-in slide-in-from-top-3 duration-300">
          <RestIntervalTimer
            initialSeconds={activeRestSeconds}
            exerciseName={activeRestExerciseName}
            onClose={() => setIsRestTimerActive(false)}
          />
        </div>
      )}

      {/* Recent Swap Toast Banner */}
      {recentSwapBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{recentSwapBanner}</span>
          </div>
          <button
            onClick={() => setRecentSwapBanner(null)}
            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* CONSISTENCY STREAK TRACKER */}
      <ConsistencyStreakTracker
        workoutLogs={workoutLogs}
        userProfile={userProfile}
        onToggleWorkoutLog={onToggleWorkoutLog}
      />

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
                  ? 'bg-white dark:bg-[#1A1D1C] border-[#0F6E5F] dark:border-[#2DD4BF] ring-1 ring-[#0F6E5F] dark:ring-[#2DD4BF] shadow-xs'
                  : 'bg-[#FAFAF8] dark:bg-[#161817] border-[#E5E7EB] dark:border-[#242826] hover:bg-white dark:hover:bg-[#1E2220] text-[#6B7280] dark:text-[#9EA8A2]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isSelected ? 'text-[#0F6E5F] dark:text-[#2DD4BF]' : 'text-[#6B7280] dark:text-[#9EA8A2]'}`}>
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
                <span className="font-semibold text-[#0F6E5F] dark:text-[#2DD4BF]">
                  {completedCount}/{day.exercises.length} completed
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Workout Day View */}
      {activeDay && (
        <div className="bg-white dark:bg-[#161817] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs space-y-6 transition-colors">
          {/* Day Progress Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#242826] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#2DD4BF]">
                  {activeDay.dayOfWeek} Session
                </span>
                <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{activeDay.durationMin} minutes
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1">
                {activeDay.dayName}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">Focus: {activeDay.focus}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Session Progress</div>
                <div className="text-sm font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  {dayCompletedCount} of {totalDayExercises} ({dayProgressPercent}%)
                </div>
              </div>
              <div className="w-16 bg-[#F3F4F6] dark:bg-[#2A2E2C] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#0F6E5F] dark:bg-[#2DD4BF] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${dayProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            {activeDay.exercises.map((exercise, idx) => {
              const isCompleted = !!completedExercises[exercise.id];
              const hasInjurySub = activeInjuryMode && exercise.injuryAlternative;

              return (
                <div
                  key={exercise.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-[#FAFAF8] dark:bg-[#1A1D1C]/60 border-[#E5E7EB] dark:border-[#242826] opacity-75'
                      : 'bg-white dark:bg-[#1A1D1C] border-[#E5E7EB] dark:border-[#2A2E2C] hover:border-[#0F6E5F]/50 dark:hover:border-[#2DD4BF]/50 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Exercise Info & Biomechanics */}
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleExerciseComplete(exercise.id, exercise.name, exercise.restSeconds)}
                        className="mt-1 text-[#0F6E5F] dark:text-[#2DD4BF] hover:scale-110 transition-transform shrink-0 cursor-pointer"
                        title={isCompleted ? "Mark Incomplete" : "Mark Set Complete & Auto-Trigger Rest Timer"}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-[#16A34A] dark:text-[#4ADE80] fill-[#16A34A]/10" />
                        ) : (
                          <Circle className="w-6 h-6 text-[#D1D5DB] dark:text-[#4B5563]" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#2DD4BF]">
                            Exercise #{idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9EA8A2]">
                            {exercise.targetMuscle}
                          </span>
                          <span className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">• {exercise.equipment}</span>

                          {/* Smart Swap Trigger Button */}
                          <button
                            onClick={() => handleOpenSmartSwap(exercise)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#0F6E5F]/10 hover:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#2DD4BF] text-[11px] font-bold transition-all ml-auto cursor-pointer"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Smart Swap</span>
                          </button>
                        </div>

                        <h3 className={`text-base sm:text-lg font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1 ${isCompleted ? 'line-through text-[#6B7280] dark:text-[#6B7280]' : ''}`}>
                          {hasInjurySub ? exercise.injuryAlternative?.substitute : exercise.name}
                        </h3>

                        {/* Science Tip & EMG Badge */}
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-[#0F6E5F] dark:text-[#2DD4BF] font-semibold bg-[#0F6E5F]/5 dark:bg-[#0F6E5F]/15 px-2.5 py-1 rounded-md">
                            <Sparkles className="w-3.5 h-3.5 text-[#E8912D]" />
                            <span>EMG Activation: {exercise.emgFocus}</span>
                          </div>
                          <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">
                            <strong className="text-[#374151] dark:text-[#D1D5DB]">Biomechanics Cue:</strong> {exercise.scienceTip}
                          </p>
                        </div>

                        {/* Injury / Swap Substitution Note */}
                        {hasInjurySub && (
                          <div className="mt-2 p-2.5 rounded-lg bg-[#E8912D]/10 dark:bg-[#E8912D]/15 border border-[#E8912D]/20 dark:border-[#E8912D]/30 text-xs text-[#9A5B0F] dark:text-amber-300 flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <strong>Injury Protection Active:</strong> Substituted {exercise.injuryAlternative?.originalExercise} with {exercise.injuryAlternative?.substitute}. Reason: {exercise.injuryAlternative?.reason}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Prescribed Sets / Reps / RPE / Rest & Timer Action */}
                    <div className="flex items-center gap-3 sm:gap-6 bg-[#FAFAF8] dark:bg-[#111312] p-3 rounded-xl border border-[#E5E7EB] dark:border-[#242826] shrink-0 justify-between sm:justify-start">
                      <div className="text-center px-2">
                        <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] uppercase tracking-wider font-semibold">
                          Sets
                        </div>
                        <div className="text-sm sm:text-base font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                          {exercise.sets}
                        </div>
                      </div>
                      <div className="h-6 w-[1px] bg-[#E5E7EB] dark:bg-[#242826]" />
                      <div className="text-center px-2">
                        <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] uppercase tracking-wider font-semibold">
                          Reps
                        </div>
                        <div className="text-sm sm:text-base font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                          {exercise.reps}
                        </div>
                      </div>
                      <div className="h-6 w-[1px] bg-[#E5E7EB] dark:bg-[#242826]" />
                      <div className="text-center px-2">
                        <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] uppercase tracking-wider font-semibold">
                          Target RPE
                        </div>
                        <div className="text-sm sm:text-base font-bold text-[#E8912D]">
                          {exercise.rpeTarget} / 10
                        </div>
                      </div>
                      <div className="h-6 w-[1px] bg-[#E5E7EB] dark:bg-[#242826]" />
                      <button
                        onClick={() => startRestForExercise(exercise.name, exercise.restSeconds)}
                        className="text-center px-2 hover:opacity-80 transition-opacity cursor-pointer group"
                        title="Click to start automated rest countdown for this exercise"
                      >
                        <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] uppercase tracking-wider font-semibold flex items-center justify-center gap-1 group-hover:text-[#0F6E5F] dark:group-hover:text-[#2DD4BF]">
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Rest</span>
                        </div>
                        <div className="text-sm sm:text-base font-bold text-[#0F6E5F] dark:text-[#2DD4BF]">
                          {exercise.restSeconds}s
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Session Complete Bottom CTA */}
          <div className="p-5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#242826] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
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
              className="px-5 py-2.5 rounded-xl bg-[#0F6E5F] text-white text-xs sm:text-sm font-bold hover:bg-[#0D5B4F] transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Lock In Session & Boost Streak</span>
            </button>
          </div>
        </div>
      )}

      {/* Smart Swap Modal */}
      <SmartSwapModal
        isOpen={isSmartSwapOpen}
        onClose={() => setIsSmartSwapOpen(false)}
        currentExercise={smartSwapExercise}
        userProfile={userProfile}
        onApplySwap={handleApplySmartSwap}
      />
    </div>
  );
};
