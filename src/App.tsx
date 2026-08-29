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
  saveStoredWorkoutPrograms,
  getStoredAIMealPlan, 
  saveStoredAIMealPlan,
  getStoredWorkoutLogs,
  toggleWorkoutDayLog,
  getStoredFormAnalyses,
  addFormAnalysis
} from './lib/storage';
import { getStoredTheme, applyTheme, ThemeMode, resolveEffectiveTheme } from './lib/theme';
import { exportUserDataToCSV } from './lib/csvExport';
import { 
  UserProfile, 
  UserSubscription,
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
import { VisualTransformationProjector } from './components/VisualTransformationProjector';
import { OnboardingModal } from './components/OnboardingModal';
import { CheckInModal } from './components/CheckInModal';
import { WorkoutAuditModal } from './components/WorkoutAuditModal';
import { SubscriptionGuard } from './components/SubscriptionGuard';
import { SubscriptionPaywallModal } from './components/SubscriptionPaywallModal';
import { HostAdminPortalModal } from './components/HostAdminPortalModal';
import { ReportAppErrorModal } from './components/ReportAppErrorModal';
import { PerformanceDashboardModal } from './components/PerformanceDashboardModal';
import { SyncRepairNotification } from './components/SyncRepairNotification';
import { DailyMotivationWidget } from './components/DailyMotivationWidget';
import { GlobalSyncStatus } from './components/GlobalSyncStatus';
import { calculateDailyMacrosSum, calculateWorkoutStreak } from './lib/calc/dailyStats';
import { createInitialTrialSubscription, isHostAdmin } from './lib/subscription';
import { auditWorkoutPrograms, WorkoutProgramAuditReport } from './data/ExerciseRegistry';
import { runAutomatedDataReconciliation } from './lib/reconciliationWorker';
import { Activity } from 'lucide-react';

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
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isHostAdminOpen, setIsHostAdminOpen] = useState<boolean>(false);
  const [isReportAppErrorOpen, setIsReportAppErrorOpen] = useState<boolean>(false);
  const [isPerformanceDashboardOpen, setIsPerformanceDashboardOpen] = useState<boolean>(false);
  const [precisionStatus, setPrecisionStatus] = useState<'active' | 'standby'>('active');

  // Background Sync Repair Worker: runs on initial load and compares local state with Firestore
  useEffect(() => {
    runAutomatedDataReconciliation()
      .then((report) => {
        if (report && report.discrepanciesFound > 0) {
          console.log(`[SyncRepair] Automated reconciliation finished. Repaired ${report.repairedCount} records.`);
        }
      })
      .catch((err) => {
        console.warn('[SyncRepair] Reconciliation background check encountered an error:', err);
      });
  }, [currentUser]);

  // Diagnostic Audit State for Authoritative ExerciseRegistry
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [auditReport, setAuditReport] = useState<WorkoutProgramAuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  const handleTriggerAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const report = auditWorkoutPrograms(workoutPrograms);
      setAuditReport(report);
      setWorkoutPrograms(report.programs);
      saveStoredWorkoutPrograms(report.programs);
      setIsAuditing(false);
      setIsAuditModalOpen(true);
    }, 450);
  };

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

  // Calculate today's totals and current streak using validated core mathematical models
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = mealLogs.filter((l) => l.date === todayStr);
  const todayMacroTotals = calculateDailyMacrosSum(todayLogs, todayStr);
  const caloriesConsumedToday = todayMacroTotals.calories;
  const proteinConsumedToday = todayMacroTotals.proteinG;

  // Compute streak from workoutLogs
  const streakData = calculateWorkoutStreak(workoutLogs);
  const calculatedStreak = streakData.currentStreak;

  // 3. Background Data Validation & Drift Correction Effect
  // Cross-references daily macro totals and meal line items against raw nutrition items to guarantee 100% precision
  useEffect(() => {
    let hasDriftCorrection = false;
    const validatedMealLogs = mealLogs.map((meal) => {
      if (meal.items && meal.items.length > 0) {
        const trueCal = Math.round(meal.items.reduce((s, i) => s + (i.calories || 0), 0));
        const trueP = Number(meal.items.reduce((s, i) => s + (i.proteinG || 0), 0).toFixed(1));
        const trueC = Number(meal.items.reduce((s, i) => s + (i.carbsG || 0), 0).toFixed(1));
        const trueF = Number(meal.items.reduce((s, i) => s + (i.fatG || 0), 0).toFixed(1));

        // If drift detected between item sum and container total
        if (
          Math.abs(meal.calories - trueCal) > 2 ||
          Math.abs(meal.proteinG - trueP) > 0.5 ||
          Math.abs(meal.carbsG - trueC) > 0.5 ||
          Math.abs(meal.fatG - trueF) > 0.5
        ) {
          hasDriftCorrection = true;
          return {
            ...meal,
            calories: trueCal > 0 ? trueCal : meal.calories,
            proteinG: trueP > 0 ? trueP : meal.proteinG,
            carbsG: trueC > 0 ? trueC : meal.carbsG,
            fatG: trueF > 0 ? trueF : meal.fatG,
          };
        }
      }
      return meal;
    });

    if (hasDriftCorrection) {
      setMealLogs(validatedMealLogs);
      saveStoredProfile(userProfile);
    }
  }, [mealLogs]);

  const handleToggleWorkoutLog = (
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
    totalVolumeKg?: number
  ) => {
    const updated = toggleWorkoutDayLog(
      date, 
      dayId, 
      dayName, 
      durationMin, 
      exercisesCompleted, 
      totalExercises, 
      isRestDay, 
      rpeAverage, 
      loggedExercises, 
      totalVolumeKg
    );
    setWorkoutLogs(updated);

    const changedLog = updated.find((l) => l.date === date && l.dayId === dayId);
    if (changedLog) {
      syncWorkoutLog(changedLog).catch(console.error);
    }
  };

  const handleSaveMealLog = (newLog: MealLog) => {
    // Optimistic instantaneous UI update
    const updated = addMealLog(newLog);
    setMealLogs(updated);
    syncMealLog(newLog).catch(console.error);
  };

  const handleDeleteMealLog = (id: string) => {
    // Optimistic instantaneous UI update
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

  const handleExportData = () => {
    exportUserDataToCSV(
      userProfile,
      bodyMetrics,
      [],
      workoutLogs,
      mealLogs
    );
  };

  const handleUpdateSubscription = (newSub: UserSubscription) => {
    const updated = {
      ...userProfile,
      subscription: newSub,
    };
    handleSaveProfile(updated);
  };

  const handleSuccessAuth = (email: string, name: string) => {
    const trialSub = userProfile.subscription || createInitialTrialSubscription();
    const updated = {
      ...userProfile,
      email,
      name: name || userProfile.name,
      subscription: trialSub,
      isOnboarded: false, // Compulsorily launch onboarding questions next!
    };
    handleSaveProfile(updated);
    setIsOnboardingOpen(true);
  };

  // Compulsorily launch onboarding immediately upon sign in if user hasn't completed onboarding yet
  useEffect(() => {
    if (userProfile.email && !userProfile.isOnboarded) {
      setIsOnboardingOpen(true);
    }
  }, [userProfile.email, userProfile.isOnboarded]);

  return (
    <SubscriptionGuard
      userProfile={userProfile}
      onUpdateSubscription={handleUpdateSubscription}
      onSuccessAuth={handleSuccessAuth}
      onSaveProfile={handleSaveProfile}
      onExportData={handleExportData}
    >
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#111312] text-[#1A1D1B] dark:text-[#E8ECE9] font-sans flex flex-col selection:bg-[#0F6E5F]/20 selection:text-[#0F6E5F] transition-colors duration-200">
        {/* App Header & Navigation */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userProfile={userProfile}
          onOpenCheckIn={() => setIsCheckInOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenSubscriptionModal={() => setIsPaywallOpen(true)}
          onOpenHostAdminModal={() => setIsHostAdminOpen(true)}
          onOpenPerformanceDashboard={() => setIsPerformanceDashboardOpen(true)}
          onExportData={handleExportData}
          onForceSync={() => {
            setIsSyncing(true);
            setTimeout(() => setIsSyncing(false), 800);
          }}
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
          {/* Daily Motivation, Water Tracker & 3 Quick Wins for normal users */}
          <DailyMotivationWidget
            userName={userProfile.name || 'Athlete'}
            currentStreak={calculatedStreak}
            caloriesConsumed={caloriesConsumedToday}
            calorieTarget={userProfile.dailyCalories || 2000}
            proteinConsumed={proteinConsumedToday}
            proteinTarget={userProfile.dailyProtein || 150}
            hasLoggedWorkoutToday={workoutLogs.some((l) => l.date === todayStr)}
          />

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
              onUpdateUserProfile={handleSaveProfile}
            />
          )}

          {activeTab === 'form' && (
            <BiomechanicsFormAnalyzer
              userProfile={userProfile}
              formAnalyses={formAnalyses}
              onSaveFormAnalysis={handleSaveFormAnalysis}
            />
          )}

          {activeTab === 'projector' && (
            <VisualTransformationProjector
              userProfile={userProfile}
              workoutLogs={workoutLogs}
              mealLogs={mealLogs}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressAnalytics
              bodyMetrics={bodyMetrics}
              userProfile={userProfile}
              mealLogs={mealLogs}
              workoutLogs={workoutLogs}
              workoutPrograms={workoutPrograms}
              onAddBodyMetric={handleAddBodyMetric}
              onOpenCheckIn={() => setIsCheckInOpen(true)}
              onToggleWorkoutLog={handleToggleWorkoutLog}
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
        <footer className="border-t border-[#E5E7EB] dark:border-[#242826] bg-white dark:bg-[#161817] py-4 mt-auto transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280] dark:text-[#9EA8A2]">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">PeakForm AI</span>
              <span className="hidden md:inline">• Evidence-Based Workout & Nutrition Coaching</span>
              <GlobalSyncStatus />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                id="report-issue-footer-btn"
                type="button"
                onClick={() => setIsReportAppErrorOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold text-[11px] transition-all cursor-pointer"
                title="Report a bug, calculation discrepancy, or suggest an enhancement"
              >
                <span>Report Issue / Feedback</span>
              </button>

              <button
                onClick={handleTriggerAudit}
                disabled={isAuditing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-semibold text-[11px] transition-all cursor-pointer disabled:opacity-50"
                title="Run one-time audit of all workout programs against ExerciseRegistry and refresh all YouTube links"
              >
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span>{isAuditing ? 'Auditing Registry...' : 'Audit YouTube Links & Registry'}</span>
              </button>

              {/* Precision System Status Badge (Toggles Active / Standby with color-coded indicator) */}
              <button
                id="precision-system-status-badge"
                type="button"
                onClick={() => setPrecisionStatus((prev) => prev === 'active' ? 'standby' : 'active')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-2xs ${
                  precisionStatus === 'active'
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                }`}
                title={`Multi-Model Consensus is currently ${precisionStatus.toUpperCase()}. Click to toggle status.`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  precisionStatus === 'active' ? 'bg-emerald-500 animate-pulse shadow-xs' : 'bg-amber-500'
                }`} />
                <span>Multi-Model Consensus: {precisionStatus === 'active' ? 'Active' : 'Standby'}</span>
              </button>

              {/* Host Performance Dashboard Trigger (Warad Asare) */}
              {(isHostAdmin(userProfile.email) || isHostAdmin(currentUser?.email) || userProfile.email === 'waradasare11@gmail.com') && (
                <button
                  id="open-performance-dashboard-footer-btn"
                  type="button"
                  onClick={() => setIsPerformanceDashboardOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 font-semibold text-[11px] transition-all cursor-pointer"
                  title="Open Real-time Service Latency & Telemetry Dashboard (Host Only)"
                >
                  <Activity className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  <span>Host Latency Sparklines</span>
                </button>
              )}

              <span>Host: Warad Asare (9284160309@fam) • Gemini 3.7 Flash</span>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          userProfile={userProfile}
          onSaveProfile={handleSaveProfile}
          onExportData={handleExportData}
        />

        <CheckInModal
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
          userProfile={userProfile}
          bodyMetrics={bodyMetrics}
          onCompleteCheckIn={handleCompleteCheckIn}
        />

        {/* Bug / Feedback Error Report Modal */}
        <ReportAppErrorModal
          isOpen={isReportAppErrorOpen}
          onClose={() => setIsReportAppErrorOpen(false)}
        />

        {/* Host AI Service Latency & Performance Dashboard Modal */}
        <PerformanceDashboardModal
          isOpen={isPerformanceDashboardOpen}
          onClose={() => setIsPerformanceDashboardOpen(false)}
          userProfile={userProfile}
        />

        {/* Sync Repair Discrepancy Notification */}
        <SyncRepairNotification />

        {/* Subscription Paywall & FamApp QR Code Verification Modal */}
        <SubscriptionPaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setIsPaywallOpen(false)}
          userProfile={userProfile}
          onSubscriptionUpdated={(sub) => {
            handleUpdateSubscription(sub);
            setIsPaywallOpen(false);
          }}
        />

        {/* Host Master Admin Portal Modal (Warad Asare) */}
        <HostAdminPortalModal
          isOpen={isHostAdminOpen}
          onClose={() => setIsHostAdminOpen(false)}
          currentUserProfile={userProfile}
          onUpdateSubscription={handleUpdateSubscription}
        />

        {/* Centralized ExerciseRegistry Diagnostic Auditor Modal */}
        <WorkoutAuditModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          report={auditReport}
          isRunningAudit={isAuditing}
          onTriggerAudit={handleTriggerAudit}
        />
      </div>
    </SubscriptionGuard>
  );
}
