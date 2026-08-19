import React, { useState, useEffect, useRef } from 'react';
import { 
  getStoredProfile, 
  saveStoredProfile, 
  getStoredMealLogs, 
  addMealLog, 
  deleteMealLog, 
  getStoredBodyMetrics, 
  addBodyMetric, 
  getStoredWorkoutPrograms, 
  getStoredAIMealPlan, 
  saveStoredAIMealPlan,
  getStoredWorkoutLogs,
  toggleWorkoutDayLog,
  getStoredFormAnalyses,
  addFormAnalysis
} from './lib/storage';
import { getStoredTheme, applyTheme, ThemeMode, resolveEffectiveTheme } from './lib/theme';
import { 
  UserProfile, 
  MealLog, 
  BodyMetric, 
  WorkoutProgram, 
  AIAdjustedMealPlan, 
  WorkoutCompletionLog, 
  FormAnalysisResult 
} from './types';
import { auth, googleProvider } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { 
  syncUserProfile, 
  syncMealLog, 
  deleteMealLogFirestore, 
  syncWorkoutLog, 
  deleteWorkoutLogFirestore, 
  syncBodyMetric, 
  syncFormAnalysis, 
  subscribeUserData 
} from './lib/firestoreSync';

import { Header } from './components/Header';
import { MealCameraScanner } from './components/MealCameraScanner';
import { NutritionPlanner } from './components/NutritionPlanner';
import { WorkoutProgramView } from './components/WorkoutProgramView';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { AICoachChat } from './components/AICoachChat';
import { ScientificResearchHub } from './components/ScientificResearchHub';
import { BiomechanicsFormAnalyzer } from './components/BiomechanicsFormAnalyzer';
import { OnboardingModal } from './components/OnboardingModal';
import { CheckInModal } from './components/CheckInModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('scan');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [userProfile, setUserProfile] = useState<UserProfile>(getStoredProfile());
  const [mealLogs, setMealLogs] = useState<MealLog[]>(getStoredMealLogs());
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>(getStoredBodyMetrics());
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>(getStoredWorkoutPrograms());
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutCompletionLog[]>(getStoredWorkoutLogs());
  const [formAnalyses, setFormAnalyses] = useState<FormAnalysisResult[]>(getStoredFormAnalyses());
  const [aiMealPlan, setAiMealPlan] = useState<AIAdjustedMealPlan | null>(getStoredAIMealPlan());

  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => resolveEffectiveTheme(getStoredTheme()));

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);

  // 1. Auth Listener & Real-Time Firestore Sync
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Subscribe to real-time Firestore collections
        const unsubs = subscribeUserData(user.uid, {
          onProfile: (remoteProfile) => {
            if (remoteProfile) {
              setUserProfile((prev) => {
                const merged = { ...prev, ...remoteProfile } as UserProfile;
                saveStoredProfile(merged);
                return merged;
              });
            }
          },
          onMealLogs: (remoteMeals) => {
            if (remoteMeals && remoteMeals.length > 0) {
              setMealLogs(remoteMeals);
            }
          },
          onWorkoutLogs: (remoteWorkouts) => {
            if (remoteWorkouts && remoteWorkouts.length > 0) {
              setWorkoutLogs(remoteWorkouts);
            }
          },
          onBodyMetrics: (remoteMetrics) => {
            if (remoteMetrics && remoteMetrics.length > 0) {
              setBodyMetrics(remoteMetrics);
            }
          },
          onFormAnalyses: (remoteAnalyses) => {
            if (remoteAnalyses && remoteAnalyses.length > 0) {
              setFormAnalyses(remoteAnalyses);
            }
          },
        });

        // Push initial local profile to cloud if first login
        syncUserProfile(userProfile).catch(console.error);

        return () => {
          unsubs.forEach((u) => u());
        };
      }
    });

    return () => unsubAuth();
  }, []);

  // 2. Theme listener
  useEffect(() => {
    const applied = applyTheme(theme);
    setEffectiveTheme(applied);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const updated = applyTheme('system');
        setEffectiveTheme(updated);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    const applied = applyTheme(newTheme);
    setEffectiveTheme(applied);
  };

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    }
  };

  // Calculate today's totals and current streak
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = mealLogs.filter((m) => m.date === todayStr);
  const caloriesConsumedToday = todayLogs.reduce((sum, m) => sum + m.calories, 0);
  const proteinConsumedToday = Number(todayLogs.reduce((sum, m) => sum + m.proteinG, 0).toFixed(1));

  // Compute streak from workoutLogs
  let calculatedStreak = 0;
  for (let i = 0; i < 28; i++) {
    const d = new Date();
    d.setDate(new Date().getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const hasLog = workoutLogs.some((l) => l.date === dStr);
    if (hasLog) {
      calculatedStreak++;
    } else if (i === 0) {
      // today not yet logged, check yesterday
      continue;
    } else {
      break;
    }
  }

  const handleToggleWorkoutLog = (
    date: string,
    dayId: string,
    dayName: string,
    durationMin: number,
    exercisesCompleted: number,
    totalExercises: number,
    isRestDay?: boolean
  ) => {
    const updated = toggleWorkoutDayLog(date, dayId, dayName, durationMin, exercisesCompleted, totalExercises, isRestDay);
    setWorkoutLogs(updated);

    const changedLog = updated.find((l) => l.date === date && l.dayId === dayId);
    if (changedLog) {
      syncWorkoutLog(changedLog).catch(console.error);
    }
  };

  const handleSaveMealLog = (newLog: MealLog) => {
    const updated = addMealLog(newLog);
    setMealLogs(updated);
    syncMealLog(newLog).catch(console.error);
  };

  const handleDeleteMealLog = (id: string) => {
    const updated = deleteMealLog(id);
    setMealLogs(updated);
    deleteMealLogFirestore(id).catch(console.error);
  };

  const handleAddBodyMetric = (newMetric: BodyMetric) => {
    const updated = addBodyMetric(newMetric);
    setBodyMetrics(updated);
    syncBodyMetric(newMetric).catch(console.error);
  };

  const handleSaveProfile = (updated: UserProfile) => {
    saveStoredProfile(updated);
    setUserProfile(updated);
    syncUserProfile(updated).catch(console.error);
  };

  const handleSaveFormAnalysis = (analysis: FormAnalysisResult) => {
    const updated = addFormAnalysis(analysis);
    setFormAnalyses(updated);
    syncFormAnalysis(analysis).catch(console.error);
  };

  const handleUpdateAIMealPlan = (plan: AIAdjustedMealPlan) => {
    saveStoredAIMealPlan(plan);
    setAiMealPlan(plan);
  };

  const handleCompleteCheckIn = (updatedProfile: UserProfile, newMetric: BodyMetric) => {
    handleSaveProfile(updatedProfile);
    handleAddBodyMetric(newMetric);
  };

  const handleUpdateWorkoutProgram = (updatedProgram: WorkoutProgram) => {
    const updated = workoutPrograms.map((p) => (p.id === updatedProgram.id ? updatedProgram : p));
    setWorkoutPrograms(updated);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#111312] text-[#1A1D1B] dark:text-[#E8ECE9] font-sans flex flex-col selection:bg-[#0F6E5F]/20 selection:text-[#0F6E5F] transition-colors duration-200">
      {/* App Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        onOpenCheckIn={() => setIsCheckInOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        caloriesConsumedToday={caloriesConsumedToday}
        proteinConsumedToday={proteinConsumedToday}
        currentStreak={calculatedStreak}
        theme={theme}
        effectiveTheme={effectiveTheme}
        onThemeChange={handleThemeChange}
        currentUser={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSyncing={isSyncing}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'scan' && (
          <MealCameraScanner
            userProfile={userProfile}
            mealLogs={mealLogs}
            onSaveMealLog={handleSaveMealLog}
            onDeleteMealLog={handleDeleteMealLog}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionPlanner
            userProfile={userProfile}
            mealLogs={todayLogs}
            aiMealPlan={aiMealPlan}
            onUpdateAIMealPlan={handleUpdateAIMealPlan}
            onSaveToMealLog={handleSaveMealLog}
          />
        )}

        {activeTab === 'workouts' && (
          <WorkoutProgramView
            workoutPrograms={workoutPrograms}
            userProfile={userProfile}
            workoutLogs={workoutLogs}
            onToggleWorkoutLog={handleToggleWorkoutLog}
            onUpdateWorkoutProgram={handleUpdateWorkoutProgram}
          />
        )}

        {activeTab === 'form' && (
          <BiomechanicsFormAnalyzer
            userProfile={userProfile}
            formAnalyses={formAnalyses}
            onSaveFormAnalysis={handleSaveFormAnalysis}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressAnalytics
            bodyMetrics={bodyMetrics}
            userProfile={userProfile}
            mealLogs={mealLogs}
            workoutLogs={workoutLogs}
            onAddBodyMetric={handleAddBodyMetric}
            onOpenCheckIn={() => setIsCheckInOpen(true)}
          />
        )}

        {activeTab === 'research' && (
          <ScientificResearchHub
            userProfile={userProfile}
          />
        )}

        {activeTab === 'coach' && (
          <AICoachChat
            userProfile={userProfile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] dark:border-[#242826] bg-white dark:bg-[#161817] py-6 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280] dark:text-[#9EA8A2]">
          <div>
            <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">PeakForm AI</span> • Evidence-Based Workout & Nutrition Coaching
          </div>
          <div>
            Powered by Gemini 3.7 Flash • Mifflin-St Jeor Energy Engine • Low-Light Gym Mode
          </div>
        </div>
      </footer>

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        userProfile={userProfile}
        bodyMetrics={bodyMetrics}
        onCompleteCheckIn={handleCompleteCheckIn}
      />
    </div>
  );
}
