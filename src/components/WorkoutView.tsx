import React, { useState } from 'react';
import { Dumbbell, BookOpen, Activity, Sparkles } from 'lucide-react';
import { 
  UserProfile, 
  WorkoutProgram, 
  WorkoutCompletionLog, 
  FormAnalysisResult 
} from '../types';
import { WorkoutProgramView } from './WorkoutProgramView';
import { ExerciseLibraryView } from './ExerciseLibraryView';
import { BiomechanicsFormAnalyzer } from './BiomechanicsFormAnalyzer';

interface WorkoutViewProps {
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
  onQuickLogFromLibrary?: (
    exerciseName: string, 
    sets: { reps: number; weightKg: number; rpe?: number }[],
    targetMuscle?: string
  ) => void;
  formAnalyses: FormAnalysisResult[];
  onSaveFormAnalysis: (analysis: FormAnalysisResult) => void;
  isSubscriptionExpired?: boolean;
  onOpenPaywall?: () => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({
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
  onQuickLogFromLibrary,
  formAnalyses,
  onSaveFormAnalysis,
  isSubscriptionExpired = false,
  onOpenPaywall = () => {},
}) => {
  const [subTab, setSubTab] = useState<'program' | 'library' | 'form'>('program');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-Panel Navigation Control */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-2 rounded-2xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/60 w-full sm:w-auto">
          <button
            onClick={() => setSubTab('program')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              subTab === 'program'
                ? 'bg-white dark:bg-[#1A1D1B] text-[#0F6E5F] dark:text-[#2DD4BF] shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Today's Routine & Plan</span>
          </button>

          <button
            onClick={() => setSubTab('library')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              subTab === 'library'
                ? 'bg-white dark:bg-[#1A1D1B] text-[#0F6E5F] dark:text-[#2DD4BF] shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Exercise Library</span>
          </button>

          <button
            onClick={() => setSubTab('form')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              subTab === 'form'
                ? 'bg-white dark:bg-[#1A1D1B] text-[#0F6E5F] dark:text-[#2DD4BF] shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Posture & Form</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 pr-2">
          <span>{workoutLogs.length} completed sessions</span>
        </div>
      </div>

      {/* Render Active Sub-Panel */}
      {subTab === 'program' && (
        <WorkoutProgramView
          workoutPrograms={workoutPrograms}
          userProfile={userProfile}
          workoutLogs={workoutLogs}
          onClearAllWorkoutLogs={onClearAllWorkoutLogs}
          onDeleteWorkoutLog={onDeleteWorkoutLog}
          onBatchDeleteWorkoutLogs={onBatchDeleteWorkoutLogs}
          onUpdateWorkoutLogNotes={onUpdateWorkoutLogNotes}
          onToggleWorkoutLog={onToggleWorkoutLog}
          onUpdateWorkoutProgram={onUpdateWorkoutProgram}
          onUpdateUserProfile={onUpdateUserProfile}
        />
      )}

      {subTab === 'library' && (
        <ExerciseLibraryView
          userProfile={userProfile}
          workoutLogs={workoutLogs}
          onQuickLogExercise={onQuickLogFromLibrary}
        />
      )}

      {subTab === 'form' && (
        isSubscriptionExpired ? (
          <div className="max-w-xl mx-auto my-8 p-8 rounded-3xl bg-white dark:bg-[#161817] border border-amber-500/30 text-center space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                Pro Feature
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                Biomechanics Form Analyzer Locked
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
              Your 7-day free trial has concluded. Your workout programs, exercise logs, and history are safe. Upgrade to Pro to analyze repetition biomechanics and lift form.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenPaywall}
                className="px-6 py-3 rounded-xl bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white text-xs font-bold shadow-md cursor-pointer transition-colors inline-flex items-center gap-2"
              >
                <span>Upgrade to Pro — ₹89/mo</span>
              </button>
            </div>
          </div>
        ) : (
          <BiomechanicsFormAnalyzer
            userProfile={userProfile}
            formAnalyses={formAnalyses}
            onSaveFormAnalysis={onSaveFormAnalysis}
          />
        )
      )}
    </div>
  );
};
