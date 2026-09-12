import React, { useState } from 'react';
import { Dumbbell, BookOpen, Activity } from 'lucide-react';
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
        <BiomechanicsFormAnalyzer
          userProfile={userProfile}
          formAnalyses={formAnalyses}
          onSaveFormAnalysis={onSaveFormAnalysis}
        />
      )}
    </div>
  );
};
