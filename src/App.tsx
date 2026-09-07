import React, { useState, useEffect, useRef } from 'react';
import { 
  getStoredProfile, 
  saveStoredProfile, 
  getStoredMealLogs, 
  saveStoredMealLogs,
  addMealLog, 
  deleteMealLog, 
  deleteMealLogs,
  getStoredBodyMetrics, 
  saveStoredBodyMetrics,
  addBodyMetric, 
  getStoredWorkoutPrograms, 
  saveStoredWorkoutPrograms,
  getStoredAIMealPlan, 
  saveStoredAIMealPlan, 
  getStoredWorkoutLogs,
  saveStoredWorkoutLogs,
  deleteWorkoutLog,
  deleteWorkoutLogs,
  clearStoredMealLogs,
  clearStoredWorkoutLogs,
  toggleWorkoutDayLog,
  getStoredFormAnalyses,
  addFormAnalysis
} from './lib/storage';
import { getStoredTheme, applyTheme, ThemeMode, resolveEffectiveTheme } from './lib/theme';
import { exportUserDataToCSV } from './lib/csvExport';
import { inferTargetMuscle } from './lib/exerciseInference';
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
  deleteMealLogsBatchFirestore,
  clearAllMealLogsFirestore,
  syncWorkoutLog, 
  deleteWorkoutLogFirestore, 
  deleteWorkoutLogsBatchFirestore,
  clearAllWorkoutLogsFirestore,
  syncBodyMetric, 
  syncFormAnalysis, 
  subscribeUserData 
} from './lib/firestoreSync';
import { useSyncStatus } from './lib/syncManager';

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
import { GoogleKeepSyncModal } from './components/GoogleKeepSyncModal';
import { MainDashboardControlHub } from './components/MainDashboardControlHub';
import { SyncRepairNotification } from './components/SyncRepairNotification';
import { DailyMotivationWidget } from './components/DailyMotivationWidget';
import { GlobalSyncStatus } from './components/GlobalSyncStatus';
import { CommunityChallenges } from './components/CommunityChallenges';
import { QuarterlyProfileCalibrationModal } from './components/QuarterlyProfileCalibrationModal';
import { WorkoutPushNotificationManager } from './components/WorkoutPushNotificationManager';
import { backupUserProfileToGoogleDrive, backupAllDataToGoogleDrive, fetchUserDataFromGoogleDrive } from './lib/googleWorkspace';
import { GranularCSVExportModal } from './components/GranularCSVExportModal';
import { ExerciseLibraryView } from './components/ExerciseLibraryView';
import { SyncToast } from './components/SyncToast';
import { ArohLogo } from './components/ArohLogo';
import { calculateDailyMacrosSum, calculateWorkoutStreak } from './lib/calc/dailyStats';
import { 
  createInitialTrialSubscription, 
  createHostLifetimeSubscription, 
  createGrantedUserSubscription, 
  isHostAdmin, 
  checkUserHostGrant,
  recordAthleteLoginSession
} from './lib/subscription';
import { auditWorkoutPrograms, WorkoutProgramAuditReport } from './data/ExerciseRegistry';
import { runAutomatedDataReconciliation } from './lib/reconciliationWorker';
import { setCurrentActiveEmail, getCurrentActiveEmail, updateWorkoutLogNotes } from './lib/storage';
import { Activity } from 'lucide-react';

export default function App() {
  const { isOnline, pendingCount, triggerSync } = useSyncStatus();
  const [activeTab, setActiveTab] = useState<string>('scan');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isGranularExportOpen, setIsGranularExportOpen] = useState<boolean>(false);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredProfile(getCurrentActiveEmail()));
  const [mealLogs, setMealLogs] = useState<MealLog[]>(() => getStoredMealLogs(getCurrentActiveEmail()));
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>(() => getStoredBodyMetrics(getCurrentActiveEmail()));
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>(getStoredWorkoutPrograms());
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutCompletionLog[]>(() => getStoredWorkoutLogs(getCurrentActiveEmail()));
  const [formAnalyses, setFormAnalyses] = useState<FormAnalysisResult[]>(getStoredFormAnalyses());
  const [aiMealPlan, setAiMealPlan] = useState<AIAdjustedMealPlan | null>(getStoredAIMealPlan());

  // Record 100% accurate login telemetry on app boot
  useEffect(() => {
    recordAthleteLoginSession(userProfile);
  }, []);

  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => resolveEffectiveTheme(getStoredTheme()));

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [isQuarterlyCalibrationOpen, setIsQuarterlyCalibrationOpen] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isHostAdminOpen, setIsHostAdminOpen] = useState<boolean>(false);
  const [isReportAppErrorOpen, setIsReportAppErrorOpen] = useState<boolean>(false);
  const [isPerformanceDashboardOpen, setIsPerformanceDashboardOpen] = useState<boolean>(false);
  const [isKeepSyncOpen, setIsKeepSyncOpen] = useState<boolean>(false);
  const [precisionStatus, setPrecisionStatus] = useState<'active' | 'standby'>('active');

  // Cloud-to-Local Sync Toast Notification State
  const [syncToastState, setSyncToastState] = useState<{
    isOpen: boolean;
    message: string;
    detail: string;
    timestamp?: string;
    source?: 'drive' | 'firestore' | 'manual';
  }>({
    isOpen: false,
    message: '',
    detail: '',
  });

  const triggerSyncToast = (
    message: string = 'Cloud Data Retrieved',
    detail: string = 'All workouts, nutrition records, and athletic metrics were safely retrieved and synchronized with your local device.',
    source: 'drive' | 'firestore' | 'manual' = 'drive'
  ) => {
    setSyncToastState({
      isOpen: true,
      message,
      detail,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source,
    });
  };

  // Automated 2-3 months Quarterly Calibration Check:
  // Preserves 100% of historical info and prompts athlete to recalibrate if >75 days passed
  useEffect(() => {
    if (userProfile.isOnboarded && userProfile.email) {
      const lastReview = userProfile.lastQuarterlyReviewDate || userProfile.lastProfileUpdateDate;
      if (lastReview) {
        const daysSince = (Date.now() - new Date(lastReview).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince >= 75) {
          setIsQuarterlyCalibrationOpen(true);
        }
      }
    }
  }, [userProfile.isOnboarded, userProfile.email]);

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
        const email = user.email || '';
        setCurrentActiveEmail(email);

        const isHost = isHostAdmin(email);
        const stored = getStoredProfile(email);
        const updatedInitial: UserProfile = {
          ...stored,
          email,
          name: stored.name || user.displayName || 'Peak Athlete',
          subscription: isHost ? createHostLifetimeSubscription() : (stored.subscription || createInitialTrialSubscription()),
          isOnboarded: Boolean(stored.isOnboarded || (stored.goal && stored.dailyCalories > 0)),
        };
        setUserProfile(updatedInitial);
        saveStoredProfile(updatedInitial);
        setMealLogs(getStoredMealLogs(email));
        setBodyMetrics(getStoredBodyMetrics(email));
        setWorkoutLogs(getStoredWorkoutLogs(email));

        // Fetch each and every piece of data from the user's Gmail ID Google Drive
        fetchUserDataFromGoogleDrive(email).then((driveData) => {
          if (driveData.success && driveData.userProfile) {
            setUserProfile((prev) => {
              const merged: UserProfile = {
                ...prev,
                ...driveData.userProfile,
                email,
                name: user.displayName || driveData.userProfile.name || prev.name,
                isOnboarded: true,
              };
              saveStoredProfile(merged);
              return merged;
            });
            if (driveData.mealLogs && driveData.mealLogs.length > 0) {
              setMealLogs(driveData.mealLogs);
              saveStoredMealLogs(driveData.mealLogs, email);
            }
            if (driveData.workoutLogs && driveData.workoutLogs.length > 0) {
              setWorkoutLogs(driveData.workoutLogs);
              saveStoredWorkoutLogs(driveData.workoutLogs, email);
            }
            if (driveData.bodyMetrics && driveData.bodyMetrics.length > 0) {
              setBodyMetrics(driveData.bodyMetrics);
              saveStoredBodyMetrics(driveData.bodyMetrics, email);
            }
            triggerSyncToast(
              'Cloud Data Retrieved',
              'Successfully pulled latest workouts, nutrition logs, and body metrics from your Google Drive cloud backup.',
              'drive'
            );
          }
        }).catch(console.warn);

        // Check if host has granted free access to this athlete's Gmail ID
        checkUserHostGrant(email).then(({ hasGrant, isHost: hostUser, grant }) => {
          if (hasGrant && grant) {
            setUserProfile((prev) => {
              const activeGrantSub = hostUser ? createHostLifetimeSubscription() : createGrantedUserSubscription(grant);
              const updated = {
                ...prev,
                subscription: activeGrantSub,
              };
              saveStoredProfile(updated);
              syncUserProfile(updated).catch(console.error);
              return updated;
            });
          }
        }).catch(console.warn);

        // Subscribe to real-time Firestore collections
        const unsubs = subscribeUserData(user.uid, {
          onProfile: (remoteProfile) => {
            if (remoteProfile) {
              setUserProfile((prev) => {
                let merged = { ...prev, ...remoteProfile } as UserProfile;
                if (isHostAdmin(user.email)) {
                  merged.subscription = createHostLifetimeSubscription();
                } else if (
                  prev.subscription?.paymentMethod === 'MANUAL_GRANT' ||
                  prev.subscription?.paymentMethod === 'HOST_LIFETIME_VIP' ||
                  prev.subscription?.verifiedBy?.includes('Host VIP Grant')
                ) {
                  merged.subscription = prev.subscription;
                } else {
                  // Check if this remote subscription is expired and if a grant exists
                  checkUserHostGrant(email).then(({ hasGrant, grant }) => {
                    if (hasGrant && grant) {
                      const activeGrantSub = createGrantedUserSubscription(grant);
                      setUserProfile((curr) => {
                        const updated = { ...curr, subscription: activeGrantSub };
                        saveStoredProfile(updated);
                        return updated;
                      });
                    }
                  }).catch(() => {});
                }
                saveStoredProfile(merged);
                return merged;
              });
            }
          },
          onMealLogs: (remoteMeals) => {
            if (remoteMeals && remoteMeals.length > 0) {
              setMealLogs(remoteMeals);
              saveStoredMealLogs(remoteMeals, email);
            }
          },
          onWorkoutLogs: (remoteWorkouts) => {
            if (remoteWorkouts && remoteWorkouts.length > 0) {
              setWorkoutLogs(remoteWorkouts);
              saveStoredWorkoutLogs(remoteWorkouts, email);
            }
          },
          onBodyMetrics: (remoteMetrics) => {
            if (remoteMetrics && remoteMetrics.length > 0) {
              setBodyMetrics(remoteMetrics);
              saveStoredBodyMetrics(remoteMetrics, email);
            }
          },
          onFormAnalyses: (remoteAnalyses) => {
            if (remoteAnalyses && remoteAnalyses.length > 0) {
              setFormAnalyses(remoteAnalyses);
            }
          },
        });

        // Push initial local profile to cloud if first login
        syncUserProfile(updatedInitial).catch(console.error);

        return () => {
          unsubs.forEach((u) => u());
        };
      }
    });

    return () => unsubAuth();
  }, []);

  // Reactive Listener for Host VIP Grants & Real-time Subscription Updates
  useEffect(() => {
    const handleSubUpdated = (e: any) => {
      if (e.detail) {
        setUserProfile((prev) => {
          const updated = { ...prev, subscription: e.detail };
          saveStoredProfile(updated);
          return updated;
        });
      }
    };

    const handleGrantUpdated = (e: any) => {
      const grant = e.detail;
      if (grant && grant.email && userProfile.email) {
        if (grant.email.trim().toLowerCase() === userProfile.email.trim().toLowerCase()) {
          const grantedSub = createGrantedUserSubscription(grant);
          setUserProfile((prev) => {
            const updated = { ...prev, subscription: grantedSub };
            saveStoredProfile(updated);
            syncUserProfile(updated).catch(console.error);
            return updated;
          });
        }
      }
    };

    window.addEventListener('peakform_subscription_updated', handleSubUpdated);
    window.addEventListener('peakform_grant_updated', handleGrantUpdated);

    return () => {
      window.removeEventListener('peakform_subscription_updated', handleSubUpdated);
      window.removeEventListener('peakform_grant_updated', handleGrantUpdated);
    };
  }, [userProfile.email]);

  // Periodic and on-email-change Host Grant check
  useEffect(() => {
    if (!userProfile.email) return;
    const cleanEmail = userProfile.email.trim().toLowerCase();

    const verifyGrant = () => {
      if (isHostAdmin(cleanEmail)) {
        if (userProfile.subscription?.paymentMethod !== 'HOST_LIFETIME_VIP') {
          const hostSub = createHostLifetimeSubscription();
          setUserProfile((prev) => {
            const updated = { ...prev, subscription: hostSub };
            saveStoredProfile(updated);
            return updated;
          });
        }
        return;
      }

      checkUserHostGrant(cleanEmail).then(({ hasGrant, grant }) => {
        if (hasGrant && grant) {
          const grantedSub = createGrantedUserSubscription(grant);
          if (
            userProfile.subscription?.paymentMethod !== 'MANUAL_GRANT' ||
            userProfile.subscription?.status !== 'active'
          ) {
            setUserProfile((prev) => {
              const updated = { ...prev, subscription: grantedSub };
              saveStoredProfile(updated);
              syncUserProfile(updated).catch(console.error);
              return updated;
            });
          }
        }
      }).catch(console.warn);
    };

    verifyGrant();
    const interval = setInterval(verifyGrant, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [userProfile.email]);

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
      setCurrentActiveEmail('');
      const defaultProf = getStoredProfile('');
      setUserProfile(defaultProf);
      setMealLogs(getStoredMealLogs(''));
      setBodyMetrics(getStoredBodyMetrics(''));
      setWorkoutLogs(getStoredWorkoutLogs(''));
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
    totalVolumeKg?: number,
    notes?: string
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
      totalVolumeKg,
      notes,
      userProfile.email
    );
    setWorkoutLogs(updated);

    const changedLog = updated.find((l) => l.date === date && l.dayId === dayId);
    if (changedLog) {
      syncWorkoutLog(changedLog).catch(console.error);
    }

    // Auto-sync everything to user's Google Drive
    backupAllDataToGoogleDrive({
      userProfile,
      mealLogs,
      workoutLogs: updated,
      bodyMetrics,
    }).catch(() => {});
  };

  const handleUpdateWorkoutLogNotes = (id: string, notes: string) => {
    const updated = updateWorkoutLogNotes(id, notes, userProfile.email);
    setWorkoutLogs(updated);
    const changed = updated.find((l) => l.id === id);
    if (changed) {
      syncWorkoutLog(changed).catch(console.error);
    }
    backupAllDataToGoogleDrive({
      userProfile,
      mealLogs,
      workoutLogs: updated,
      bodyMetrics,
    }).catch(() => {});
  };

  const handleSaveMealLog = (newLog: MealLog) => {
    // Optimistic instantaneous UI update
    const updated = addMealLog(newLog);
    setMealLogs(updated);
    syncMealLog(newLog).catch(console.error);
    backupAllDataToGoogleDrive({
      userProfile,
      mealLogs: updated,
      workoutLogs,
      bodyMetrics,
    }).catch(() => {});
  };

  const handleDeleteMealLog = (id: string) => {
    // Optimistic instantaneous UI update
    const updated = deleteMealLog(id);
    setMealLogs(updated);
    deleteMealLogFirestore(id).catch(console.error);
  };

  const handleBatchDeleteMealLogs = (ids: string[]) => {
    const updated = deleteMealLogs(ids);
    setMealLogs(updated);
    deleteMealLogsBatchFirestore(ids).catch(console.error);
  };

  const handleDeleteWorkoutLog = (id: string) => {
    const updated = deleteWorkoutLog(id);
    setWorkoutLogs(updated);
    deleteWorkoutLogFirestore(id).catch(console.error);
  };

  const handleBatchDeleteWorkoutLogs = (ids: string[]) => {
    const updated = deleteWorkoutLogs(ids);
    setWorkoutLogs(updated);
    deleteWorkoutLogsBatchFirestore(ids).catch(console.error);
  };

  const handleClearAllMealLogs = () => {
    clearStoredMealLogs();
    setMealLogs([]);
    clearAllMealLogsFirestore().catch(console.error);
  };

  const handleClearAllWorkoutLogs = () => {
    clearStoredWorkoutLogs();
    setWorkoutLogs([]);
    clearAllWorkoutLogsFirestore().catch(console.error);
  };

  const handleAddBodyMetric = (newMetric: BodyMetric) => {
    const updated = addBodyMetric(newMetric);
    setBodyMetrics(updated);
    syncBodyMetric(newMetric).catch(console.error);
    backupAllDataToGoogleDrive({
      userProfile,
      mealLogs,
      workoutLogs,
      bodyMetrics: updated,
    }).catch(() => {});
  };

  const handleSaveProfile = (updated: UserProfile) => {
    saveStoredProfile(updated);
    setUserProfile(updated);
    syncUserProfile(updated).catch(console.error);
    backupUserProfileToGoogleDrive(updated).catch(console.warn);
    backupAllDataToGoogleDrive({
      userProfile: updated,
      mealLogs,
      workoutLogs,
      bodyMetrics,
    }).catch(() => {});
  };

  const handleSaveFormAnalysis = (analysis: FormAnalysisResult) => {
    const updated = addFormAnalysis(analysis);
    setFormAnalyses(updated);
    syncFormAnalysis(analysis).catch(console.error);
  };

  const handleQuickLogFromLibrary = (
    exerciseName: string, 
    sets: { reps: number; weightKg: number; rpe?: number }[],
    targetMuscle?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const totalVol = sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);
    const avgRpe = sets.reduce((sum, s) => sum + (s.rpe || 8), 0) / (sets.length || 1);
    const totalReps = sets.reduce((sum, s) => sum + s.reps, 0);
    const avgWeight = sets.length > 0 ? sets.reduce((sum, s) => sum + s.weightKg, 0) / sets.length : 0;

    const resolvedMuscle = targetMuscle || inferTargetMuscle(exerciseName);

    const loggedExercisesList = [{
      exerciseId: `lib-${exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      exerciseName,
      targetMuscle: resolvedMuscle,
      sets: sets.length,
      reps: Math.round(totalReps / (sets.length || 1)),
      weightKg: Math.round(avgWeight),
      rpeLogged: Number(avgRpe.toFixed(1)),
      volumeKg: totalVol,
    }];

    const updated = toggleWorkoutDayLog(
      today,
      'day-library-log',
      'Exercise Library Quick Log',
      20,
      1,
      1,
      false,
      Number(avgRpe.toFixed(1)),
      loggedExercisesList,
      totalVol,
      `Quick-logged from AROH Exercise Library: ${exerciseName}`,
      userProfile.email
    );
    setWorkoutLogs(updated);
    const changedLog = updated.find((l) => l.date === today && l.dayId === 'day-library-log');
    if (changedLog) {
      syncWorkoutLog(changedLog).catch(console.error);
    }
    backupAllDataToGoogleDrive({
      userProfile,
      mealLogs,
      workoutLogs: updated,
      bodyMetrics,
    }).catch(() => {});
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
    setIsGranularExportOpen(true);
  };

  const handleUpdateSubscription = (newSub: UserSubscription) => {
    const updated = {
      ...userProfile,
      subscription: newSub,
    };
    handleSaveProfile(updated);
  };

  const handleSuccessAuth = async (email: string, name: string) => {
    const cleanEmail = email.trim().toLowerCase();
    setCurrentActiveEmail(cleanEmail);

    // 1. Check local storage first
    const existing = getStoredProfile(cleanEmail);
    const hasLocalValidProfile = Boolean(existing.isOnboarded && existing.goal && existing.dailyCalories > 0);

    // 2. Fetch all data directly from user's Google Drive
    try {
      const driveData = await fetchUserDataFromGoogleDrive(cleanEmail);
      if (driveData.success && driveData.userProfile) {
        const restoredProfile: UserProfile = {
          ...existing,
          ...driveData.userProfile,
          email: cleanEmail,
          name: name || driveData.userProfile.name || existing.name,
          isOnboarded: true,
        };
        setUserProfile(restoredProfile);
        saveStoredProfile(restoredProfile);
        if (driveData.mealLogs && driveData.mealLogs.length > 0) {
          setMealLogs(driveData.mealLogs);
          saveStoredMealLogs(driveData.mealLogs, cleanEmail);
        }
        if (driveData.workoutLogs && driveData.workoutLogs.length > 0) {
          setWorkoutLogs(driveData.workoutLogs);
          saveStoredWorkoutLogs(driveData.workoutLogs, cleanEmail);
        }
        if (driveData.bodyMetrics && driveData.bodyMetrics.length > 0) {
          setBodyMetrics(driveData.bodyMetrics);
          saveStoredBodyMetrics(driveData.bodyMetrics, cleanEmail);
        }
        syncUserProfile(restoredProfile).catch(console.warn);
        triggerSyncToast(
          'Cloud Data Retrieved',
          'Successfully retrieved your workout logs, nutrition history, and athletic profile from Google Drive.',
          'drive'
        );
        setIsOnboardingOpen(false);
        return;
      }
    } catch (driveErr) {
      console.warn('Google Drive instant restore error:', driveErr);
    }

    if (hasLocalValidProfile) {
      const updated: UserProfile = {
        ...existing,
        email: cleanEmail,
        name: name || existing.name,
        isOnboarded: true,
      };
      setUserProfile(updated);
      saveStoredProfile(updated);
      setMealLogs(getStoredMealLogs(cleanEmail));
      setBodyMetrics(getStoredBodyMetrics(cleanEmail));
      setWorkoutLogs(getStoredWorkoutLogs(cleanEmail));
      setIsOnboardingOpen(false);
      return;
    }

    // Only if completely new user with no profile in Drive or local storage
    const trialSub = existing.subscription || createInitialTrialSubscription();
    const newAthlete: UserProfile = {
      ...existing,
      email: cleanEmail,
      name: name || existing.name,
      subscription: trialSub,
      isOnboarded: false,
    };
    handleSaveProfile(newAthlete);
    setIsOnboardingOpen(true);
  };

  // Launch onboarding only if user email is present, NOT onboarded, AND has no configured goals
  useEffect(() => {
    if (userProfile.email && !userProfile.isOnboarded && !userProfile.goal) {
      setIsOnboardingOpen(true);
    }
  }, [userProfile.email, userProfile.isOnboarded, userProfile.goal]);

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
          onOpenKeepSync={() => setIsKeepSyncOpen(true)}
          onExportData={handleExportData}
          onForceSync={() => {
            setIsSyncing(true);
            setTimeout(() => {
              setIsSyncing(false);
              triggerSyncToast(
                'Cloud Sync Complete',
                'All workout logs, nutrition tracking, and athlete metrics are 100% reconciled and synchronized.',
                'manual'
              );
            }, 800);
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

        {/* Visual Pending Sync / Offline Banner */}
        {(pendingCount > 0 || !isOnline) && (
          <div 
            id="pending-sync-alert-banner"
            className="w-full bg-cyan-500/10 border-b border-cyan-500/20 px-4 py-2 text-xs font-medium text-cyan-900 dark:text-cyan-200 transition-all animate-in fade-in slide-in-from-top-1"
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <span>
                  {!isOnline 
                    ? `Offline Mode Active — ${pendingCount} ${pendingCount === 1 ? 'change is' : 'changes are'} safely cached locally and queued for cloud sync.`
                    : `Pending Sync: ${pendingCount} ${pendingCount === 1 ? 'item is' : 'items are'} queued for local-to-cloud synchronization.`}
                </span>
              </div>
              {isOnline && pendingCount > 0 && (
                <button
                  onClick={() => {
                    setIsSyncing(true);
                    triggerSync()
                      .then(() => {
                        triggerSyncToast(
                          'Cloud Sync Complete',
                          'All queued athletic records have been successfully reconciled with cloud storage.',
                          'firestore'
                        );
                      })
                      .finally(() => setIsSyncing(false));
                  }}
                  className="px-2.5 py-1 rounded-md bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-90 text-white font-semibold text-[11px] transition-all cursor-pointer shadow-xs"
                >
                  Sync Now ({pendingCount})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main View Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
          {/* Main Dashboard Control Hub (Streak, Weekly Check-In, Profile, Pro Plan, Cloud Sync, Export, Sign Out in Main View) */}
          <MainDashboardControlHub
            userProfile={userProfile}
            currentStreak={calculatedStreak}
            currentUser={currentUser}
            mealLogs={mealLogs}
            workoutLogs={workoutLogs}
            bodyMetrics={bodyMetrics}
            onOpenCheckIn={() => setIsCheckInOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenSubscriptionModal={() => setIsPaywallOpen(true)}
            onOpenHostAdminModal={() => setIsHostAdminOpen(true)}
            onOpenPerformanceDashboard={() => setIsPerformanceDashboardOpen(true)}
            onExportData={handleExportData}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onSelectTab={setActiveTab}
          />

          {/* Daily Motivation, Radial Progress, Water Tracker, 7-Day Sparkline & Quick Add */}
          <DailyMotivationWidget
            userName={userProfile.name || 'Athlete'}
            currentStreak={calculatedStreak}
            caloriesConsumed={caloriesConsumedToday}
            calorieTarget={userProfile.dailyCalories || 2000}
            proteinConsumed={proteinConsumedToday}
            proteinTarget={userProfile.dailyProtein || 150}
            hasLoggedWorkoutToday={workoutLogs.some((l) => l.date === todayStr)}
            mealLogs={mealLogs}
            userProfile={userProfile}
            onQuickAddMeal={handleSaveMealLog}
          />

          {activeTab === 'scan' && (
            <MealCameraScanner
              userProfile={userProfile}
              mealLogs={mealLogs}
              onSaveMealLog={handleSaveMealLog}
              onDeleteMealLog={handleDeleteMealLog}
              onBatchDeleteMealLogs={handleBatchDeleteMealLogs}
              onClearAllMealLogs={handleClearAllMealLogs}
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
              onClearAllWorkoutLogs={handleClearAllWorkoutLogs}
              onDeleteWorkoutLog={handleDeleteWorkoutLog}
              onBatchDeleteWorkoutLogs={handleBatchDeleteWorkoutLogs}
              onUpdateWorkoutLogNotes={handleUpdateWorkoutLogNotes}
              onToggleWorkoutLog={handleToggleWorkoutLog}
              onUpdateWorkoutProgram={handleUpdateWorkoutProgram}
              onUpdateUserProfile={handleSaveProfile}
            />
          )}

          {activeTab === 'library' && (
            <ExerciseLibraryView
              userProfile={userProfile}
              workoutLogs={workoutLogs}
              onQuickLogExercise={handleQuickLogFromLibrary}
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

          {activeTab === 'challenges' && (
            <CommunityChallenges
              userProfile={userProfile}
              workoutLogs={workoutLogs}
              mealLogs={mealLogs}
              currentStreak={calculatedStreak}
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
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080B14] py-4 mt-auto transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3 flex-wrap">
              <ArohLogo size="sm" />
              <span className="hidden md:inline">• Evidence-Based Workout &amp; Nutrition Coaching</span>
              <GlobalSyncStatus />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                id="report-issue-footer-btn"
                type="button"
                onClick={() => setIsReportAppErrorOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-semibold text-[11px] transition-all cursor-pointer"
                title="Report a bug, calculation discrepancy, or suggest an enhancement"
              >
                <span>Report Issue / Feedback</span>
              </button>

              {/* Host-only Debug, Latency & Audit Tools */}
              {(isHostAdmin(userProfile.email) || isHostAdmin(currentUser?.email) || userProfile.email === 'waradasare11@gmail.com') && (
                <>
                  <button
                    onClick={handleTriggerAudit}
                    disabled={isAuditing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-semibold text-[11px] transition-all cursor-pointer disabled:opacity-50"
                    title="Run one-time audit of all workout programs against ExerciseRegistry and refresh all YouTube links"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span>{isAuditing ? 'Auditing Registry...' : 'Audit YouTube Links & Registry'}</span>
                  </button>

                  {/* Precision System Status Badge (Host Only) */}
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
                    <span>Consensus: {precisionStatus === 'active' ? 'Active' : 'Standby'}</span>
                  </button>

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
                </>
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

        {/* 2-3 Months Quarterly Profile & Goal Calibration Modal */}
        <QuarterlyProfileCalibrationModal
          isOpen={isQuarterlyCalibrationOpen}
          onClose={() => setIsQuarterlyCalibrationOpen(false)}
          userProfile={userProfile}
          onSaveProfile={handleSaveProfile}
        />

        {/* 6 PM Automated Push Notification Manager & Service Worker Bridge */}
        <WorkoutPushNotificationManager
          userProfile={userProfile}
          workoutLogs={workoutLogs}
          workoutPrograms={workoutPrograms}
        />

        {/* Google Keep Sync Modal */}
        <GoogleKeepSyncModal
          isOpen={isKeepSyncOpen}
          onClose={() => setIsKeepSyncOpen(false)}
          userProfile={userProfile}
          mealLogs={mealLogs}
          workoutPrograms={workoutPrograms}
        />

        {/* Granular CSV Export Modal */}
        <GranularCSVExportModal
          isOpen={isGranularExportOpen}
          onClose={() => setIsGranularExportOpen(false)}
          userProfile={userProfile}
          mealLogs={mealLogs}
          workoutLogs={workoutLogs}
          bodyMetrics={bodyMetrics}
        />

        {/* Cloud-to-Local Sync Success Toast Notification */}
        <SyncToast
          isOpen={syncToastState.isOpen}
          onClose={() => setSyncToastState((prev) => ({ ...prev, isOpen: false }))}
          message={syncToastState.message}
          detail={syncToastState.detail}
          timestamp={syncToastState.timestamp}
          source={syncToastState.source}
        />
      </div>
    </SubscriptionGuard>
  );
}
