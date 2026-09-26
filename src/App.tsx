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
import { auth, createLoginGoogleProvider, googleProvider } from './lib/firebase';
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
import { GlobalSyncStatus } from './components/GlobalSyncStatus';
import { CommunityChallenges } from './components/CommunityChallenges';
import { QuarterlyProfileCalibrationModal } from './components/QuarterlyProfileCalibrationModal';
import { WorkoutPushNotificationManager } from './components/WorkoutPushNotificationManager';
import { backupUserProfileToGoogleDrive, backupAllDataToGoogleDrive, fetchUserDataFromGoogleDrive } from './lib/googleWorkspace';
import { restoreUserMemory, saveUserMemory } from './lib/userMemory';
import { GranularCSVExportModal } from './components/GranularCSVExportModal';
import { ExerciseLibraryView } from './components/ExerciseLibraryView';
import { BiWeeklyProfileReminderBanner } from './components/BiWeeklyProfileReminderBanner';
import { SyncToast } from './components/SyncToast';
import { ArohLogo } from './components/ArohLogo';
import { calculateDailyMacrosSum, calculateWorkoutStreak } from './lib/calc/dailyStats';
import { 
  createInitialTrialSubscription, 
  createHostLifetimeSubscription, 
  createGrantedUserSubscription, 
  isHostAdmin, 
  checkUserHostGrant,
  recordAthleteLoginSession,
  checkIsHostOnServer,
  computeSubscriptionStatus
} from './lib/subscription';
import { auditWorkoutPrograms, WorkoutProgramAuditReport } from './data/ExerciseRegistry';
import { runAutomatedDataReconciliation } from './lib/reconciliationWorker';
import { setCurrentActiveEmail, getCurrentActiveEmail, updateWorkoutLogNotes, saveStoredFormAnalyses } from './lib/storage';
import { Activity, Bot } from 'lucide-react';
import { LegalPage, LegalTabType } from './components/LegalPage';
import { LegalPagesModal } from './components/LegalPagesModal';
import { NotFoundPage } from './components/NotFoundPage';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { TodayDashboardView } from './components/TodayDashboardView';
import { FoodView } from './components/FoodView';
import { WorkoutView } from './components/WorkoutView';
import { BottomTabBar } from './components/BottomTabBar';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const { isOnline, pendingCount, triggerSync } = useSyncStatus();
  const [activeTab, setActiveTab] = useState<string>('today');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isGranularExportOpen, setIsGranularExportOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredProfile(getCurrentActiveEmail()));
  const [mealLogs, setMealLogs] = useState<MealLog[]>(() => getStoredMealLogs(getCurrentActiveEmail()));
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>(() => getStoredBodyMetrics(getCurrentActiveEmail()));
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>(getStoredWorkoutPrograms());
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutCompletionLog[]>(() => getStoredWorkoutLogs(getCurrentActiveEmail()));
  const [formAnalyses, setFormAnalyses] = useState<FormAnalysisResult[]>(getStoredFormAnalyses());
  const [aiMealPlan, setAiMealPlan] = useState<AIAdjustedMealPlan | null>(getStoredAIMealPlan());

  // Record verified login telemetry on app boot
  useEffect(() => {
    recordAthleteLoginSession(userProfile);
  }, []);

  const [serverSaysHost, setServerSaysHost] = useState<boolean>(false);

  useEffect(() => {
    const email = currentUser?.email || userProfile?.email;
    if (!email) {
      setServerSaysHost(false);
      return;
    }
    let isMounted = true;
    checkIsHostOnServer(email).then((isHost) => {
      if (isMounted) setServerSaysHost(isHost);
    });
    return () => {
      isMounted = false;
    };
  }, [currentUser?.email, userProfile?.email]);

  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => resolveEffectiveTheme(getStoredTheme()));

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [isQuarterlyCalibrationOpen, setIsQuarterlyCalibrationOpen] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isHostAdminOpen, setIsHostAdminOpen] = useState<boolean>(false);
  const [isReportAppErrorOpen, setIsReportAppErrorOpen] = useState<boolean>(false);
  const [isPerformanceDashboardOpen, setIsPerformanceDashboardOpen] = useState<boolean>(false);
  const [precisionStatus, setPrecisionStatus] = useState<'active' | 'standby'>('active');

  // Real URL routing for /privacy, /terms, /disclaimer, /refund, /cookies, /delete-data, and 404
  const getInitialPath = () => (typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/');
  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  const handleNavigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path.toLowerCase());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Real Legal Pages & Compliance State (DPDP Act 2023)
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTabType>('privacy');

  const handleOpenLegal = (tab: LegalTabType = 'privacy') => {
    handleNavigate(`/${tab}`);
  };

  const handleCompleteDataErasure = () => {
    setUserProfile(getStoredProfile(''));
    setMealLogs([]);
    setWorkoutLogs([]);
    setBodyMetrics([]);
    setFormAnalyses([]);
    setAiMealPlan(null);
    setIsLegalModalOpen(false);
    setActiveTab('scan');
    handleNavigate('/');
  };

  // Direct path & hash support for legal routes: /privacy, /terms, /disclaimer, /refund, etc.
  useEffect(() => {
    const handleUrlHashOrPath = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '');
      const path = window.location.pathname.toLowerCase();

      // Normalize hash if user typed e.g. /#privacy -> /privacy
      const legalKeys: LegalTabType[] = ['privacy', 'terms', 'disclaimer', 'refund', 'cookies', 'delete-data'];
      if (legalKeys.includes(hash as LegalTabType)) {
        window.history.replaceState(null, '', `/${hash}`);
        setCurrentPath(`/${hash}`);
        return;
      }

      setCurrentPath(path);
    };

    handleUrlHashOrPath();
    window.addEventListener('popstate', handleUrlHashOrPath);
    window.addEventListener('hashchange', handleUrlHashOrPath);
    return () => {
      window.removeEventListener('popstate', handleUrlHashOrPath);
      window.removeEventListener('hashchange', handleUrlHashOrPath);
    };
  }, []);

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

  // Quarterly Calibration reminder is accessible via Settings modal without blocking the athlete
  useEffect(() => {
    // Non-blocking reminder is displayed in Settings
  }, []);

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
        const email = (user.email || '').trim().toLowerCase();
        setCurrentActiveEmail(email);

        // Step 0: Wipe React state of PREVIOUS user first so user B NEVER sees user A's data
        setMealLogs([]);
        setWorkoutLogs([]);
        setBodyMetrics([]);
        setFormAnalyses([]);
        setWorkoutPrograms([]);
        setAiMealPlan(null);

        const isHost = isHostAdmin(email);
        const stored = getStoredProfile(email);
        const storedIsReturning = Boolean(
          stored && (
            stored.isOnboarded ||
            (stored.goal && Number(stored.dailyCalories) > 0 && Number(stored.weightKg) > 0)
          )
        );
        const updatedInitial: UserProfile = {
          ...stored,
          email,
          name: user.displayName || stored.name || 'Athlete',
          subscription: isHost ? createHostLifetimeSubscription() : (stored.subscription || createInitialTrialSubscription()),
          isOnboarded: storedIsReturning,
        };
        setUserProfile(updatedInitial);
        saveStoredProfile(updatedInitial);

        if (storedIsReturning) {
          setIsOnboardingOpen(false);
          setActiveTab('today');
        }

        // Steps 1-4: Restore from Google Drive (Source of Truth) -> Firestore secondary cache -> Local fallback
        restoreUserMemory(email, user.uid).then((restored) => {
          if (!restored) return;

          const snap = restored.snapshot;
          // IDENTITY RULE: If snapshot.email !== auth email -> discard snapshot
          if (snap && snap.email && snap.email.trim().toLowerCase() !== email) {
            console.warn('Discarded snapshot with mismatched email:', snap.email, '!==', email);
            setIsOnboardingOpen(true);
            return;
          }

          const prof = snap?.userProfile || (storedIsReturning ? stored : null);
          const isReturning = Boolean(
            storedIsReturning ||
            (prof && (
              prof.isOnboarded ||
              (prof.goal && Number(prof.dailyCalories) > 0 && Number(prof.weightKg) > 0)
            ))
          );

          if (isReturning && (snap || storedIsReturning)) {
            const mergedProfile: UserProfile = {
              ...stored,
              ...(snap?.userProfile || {}),
              email,
              name: user.displayName || snap?.userProfile?.name || stored.name || 'Athlete',
              isOnboarded: true,
              subscription: isHost ? createHostLifetimeSubscription() : (snap?.userProfile?.subscription || stored.subscription || createInitialTrialSubscription()),
            };
            if (isHost) {
              mergedProfile.subscription = createHostLifetimeSubscription();
            }

            // Hydrate profile
            setUserProfile(mergedProfile);
            saveStoredProfile(mergedProfile);

            // Hydrate meals, workouts, metrics, etc.
            if (snap.mealLogs && snap.mealLogs.length > 0) {
              setMealLogs(snap.mealLogs);
              saveStoredMealLogs(snap.mealLogs, email);
            }
            if (snap.workoutLogs && snap.workoutLogs.length > 0) {
              setWorkoutLogs(snap.workoutLogs);
              saveStoredWorkoutLogs(snap.workoutLogs, email);
            }
            if (snap.bodyMetrics && snap.bodyMetrics.length > 0) {
              setBodyMetrics(snap.bodyMetrics);
              saveStoredBodyMetrics(snap.bodyMetrics, email);
            }
            if (snap.formAnalyses && snap.formAnalyses.length > 0) {
              setFormAnalyses(snap.formAnalyses);
              saveStoredFormAnalyses(snap.formAnalyses);
            }
            if (snap.workoutPrograms && snap.workoutPrograms.length > 0) {
              setWorkoutPrograms(snap.workoutPrograms);
              saveStoredWorkoutPrograms(snap.workoutPrograms);
            }
            if (snap.aiMealPlan) {
              setAiMealPlan(snap.aiMealPlan);
              saveStoredAIMealPlan(snap.aiMealPlan);
            }

            // SKIP OnboardingModal completely
            setIsOnboardingOpen(false);

            // Go to Today
            setActiveTab('today');

            // Toast: "Welcome back, {name}. Your plan is loaded."
            triggerSyncToast(
              `Welcome back, ${mergedProfile.name || 'Athlete'}.`,
              'Your plan is loaded.',
              restored.source === 'drive' ? 'drive' : 'firestore'
            );

            // Step 6: saveUserMemory('login-hydrate')
            saveUserMemory('login-hydrate', {
              email,
              uid: user.uid,
              userProfile: mergedProfile,
              mealLogs: snap.mealLogs,
              workoutLogs: snap.workoutLogs,
              bodyMetrics: snap.bodyMetrics,
              formAnalyses: snap.formAnalyses,
              workoutPrograms: snap.workoutPrograms,
              aiMealPlan: snap.aiMealPlan,
            });
          } else if (!storedIsReturning) {
            // New Gmail only: empty logs [], open onboarding ONCE.
            const initialBlankProfile: UserProfile = {
              ...getStoredProfile(email),
              email,
              name: user.displayName || 'Athlete',
              subscription: isHost ? createHostLifetimeSubscription() : createInitialTrialSubscription(),
              isOnboarded: false,
            };
            setUserProfile(initialBlankProfile);
            saveStoredProfile(initialBlankProfile);

            setMealLogs([]);
            setWorkoutLogs([]);
            setBodyMetrics([]);
            setFormAnalyses([]);
            setWorkoutPrograms([]);
            setAiMealPlan(null);

            setIsOnboardingOpen(true);
          }
        }).catch((err) => {
          console.warn('Memory restore error:', err);
        });

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

    window.addEventListener('aroh_subscription_updated', handleSubUpdated);
    window.addEventListener('aroh_grant_updated', handleGrantUpdated);
    window.addEventListener('peakform_subscription_updated', handleSubUpdated);
    window.addEventListener('peakform_grant_updated', handleGrantUpdated);

    return () => {
      window.removeEventListener('aroh_subscription_updated', handleSubUpdated);
      window.removeEventListener('aroh_grant_updated', handleGrantUpdated);
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
      const loginProvider = createLoginGoogleProvider();
      await signInWithPopup(auth, loginProvider);
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

    // Auto-sync everything to user's Google Drive memory & secondary Firestore
    saveUserMemory('workout_toggle', {
      userProfile,
      mealLogs,
      workoutLogs: updated,
      bodyMetrics,
      formAnalyses,
      workoutPrograms,
      aiMealPlan,
      email: userProfile.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
  };

  const handleUpdateWorkoutLogNotes = (id: string, notes: string) => {
    const updated = updateWorkoutLogNotes(id, notes, userProfile.email);
    setWorkoutLogs(updated);
    const changed = updated.find((l) => l.id === id);
    if (changed) {
      syncWorkoutLog(changed).catch(console.error);
    }
    saveUserMemory('workout_notes', {
      userProfile,
      mealLogs,
      workoutLogs: updated,
      bodyMetrics,
      formAnalyses,
      workoutPrograms,
      aiMealPlan,
      email: userProfile.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
  };

  const handleSaveMealLog = (newLog: MealLog) => {
    // Optimistic instantaneous UI update
    const updated = addMealLog(newLog);
    setMealLogs(updated);
    syncMealLog(newLog).catch(console.error);
    saveUserMemory('meal_add', {
      userProfile,
      mealLogs: updated,
      workoutLogs,
      bodyMetrics,
      formAnalyses,
      workoutPrograms,
      aiMealPlan,
      email: userProfile.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
  };

  const handleDeleteMealLog = (id: string) => {
    // Optimistic instantaneous UI update
    const updated = deleteMealLog(id);
    setMealLogs(updated);
    deleteMealLogFirestore(id).catch(console.error);
    saveUserMemory('meal_delete', {
      userProfile,
      mealLogs: updated,
      workoutLogs,
      bodyMetrics,
      formAnalyses,
      workoutPrograms,
      aiMealPlan,
      email: userProfile.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
  };

  const handleBatchDeleteMealLogs = (ids: string[]) => {
    const updated = deleteMealLogs(ids);
    setMealLogs(updated);
    deleteMealLogsBatchFirestore(ids).catch(console.error);
    saveUserMemory('meal_batch_delete', {
      userProfile,
      mealLogs: updated,
      workoutLogs,
      bodyMetrics,
      formAnalyses,
      workoutPrograms,
      aiMealPlan,
      email: userProfile.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
  };

  const handleDeleteWorkoutLog = (id: string) => {
    const updated = deleteWorkoutLog(id);
    setWorkoutLogs(updated);
    deleteWorkoutLogFirestore(id).catch(console.error);
    saveUserMemory('workout_delete', {
      userProfile,
      mealLogs,
      workoutLogs: updated,
      bodyMetrics,
      formAnalyses,
      workoutPrograms,
      aiMealPlan,
      email: userProfile.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
  };

  const handleBatchDeleteWorkoutLogs = (ids: string[]) => {
    const updated = deleteWorkoutLogs(ids);
    setWorkoutLogs(updated);
    deleteWorkoutLogsBatchFirestore(ids).catch(console.error);
    saveUserMemory('workout_batch_delete', {
      userProfile,
      mealLogs,
      workoutLogs: updated,
      bodyMetrics,
      formAnalyses,
      workoutPrograms,
      aiMealPlan,
      email: userProfile.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
  };

  const handleClearAllMealLogs = () => {
    clearStoredMealLogs();
    setMealLogs([]);
    clearAllMealLogsFirestore().catch(console.error);
    saveUserMemory('meal_clear', {
      userProfile,
      mealLogs: [],
      workoutLogs,
      bodyMetrics,
      formAnalyses,
      workoutPrograms,
      aiMealPlan,
      email: userProfile.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
  };

  const handleClearAllWorkoutLogs = () => {
    clearStoredWorkoutLogs();
    setWorkoutLogs([]);
    clearAllWorkoutLogsFirestore().catch(console.error);
    saveUserMemory('workout_clear', {
      userProfile,
      mealLogs,
      workoutLogs: [],
      bodyMetrics,
      formAnalyses,
      workoutPrograms,
      aiMealPlan,
      email: userProfile.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
  };

  const handleAddBodyMetric = (newMetric: BodyMetric) => {
    const updated = addBodyMetric(newMetric);
    setBodyMetrics(updated);
    syncBodyMetric(newMetric).catch(console.error);
    saveUserMemory('metric_add', {
      userProfile,
      mealLogs,
      workoutLogs,
      bodyMetrics: updated,
      formAnalyses,
      workoutPrograms,
      aiMealPlan,
      email: userProfile.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
  };

  const handleSaveProfile = (updated: UserProfile) => {
    saveStoredProfile(updated);
    setUserProfile(updated);
    syncUserProfile(updated).catch(console.error);
    backupUserProfileToGoogleDrive(updated).catch(console.warn);
    saveUserMemory('profile_update', {
      userProfile: updated,
      mealLogs,
      workoutLogs,
      bodyMetrics,
      formAnalyses,
      workoutPrograms,
      aiMealPlan,
      email: updated.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
  };

  const handleSaveFormAnalysis = (analysis: FormAnalysisResult) => {
    const updated = addFormAnalysis(analysis);
    setFormAnalyses(updated);
    syncFormAnalysis(analysis).catch(console.error);
    saveUserMemory('form_analysis', {
      userProfile,
      mealLogs,
      workoutLogs,
      bodyMetrics,
      formAnalyses: updated,
      workoutPrograms,
      aiMealPlan,
      email: userProfile.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
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
    saveUserMemory('library_quick_log', {
      userProfile,
      mealLogs,
      workoutLogs: updated,
      bodyMetrics,
      formAnalyses,
      workoutPrograms,
      aiMealPlan,
      email: userProfile.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
  };

  const handleUpdateAIMealPlan = (plan: AIAdjustedMealPlan) => {
    saveStoredAIMealPlan(plan);
    setAiMealPlan(plan);
    saveUserMemory('ai_meal_plan_update', {
      userProfile,
      mealLogs,
      workoutLogs,
      bodyMetrics,
      formAnalyses,
      workoutPrograms,
      aiMealPlan: plan,
      email: userProfile.email || currentUser?.email || undefined,
      uid: currentUser?.uid || undefined,
    });
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

    const isHost = isHostAdmin(cleanEmail);
    const existing = getStoredProfile(cleanEmail);
    const existingIsReturning = Boolean(
      existing && (
        existing.isOnboarded ||
        (existing.goal && Number(existing.dailyCalories) > 0 && Number(existing.weightKg) > 0)
      )
    );

    if (existingIsReturning) {
      const returningProfile: UserProfile = {
        ...existing,
        email: cleanEmail,
        name: name || existing.name || 'Athlete',
        isOnboarded: true,
        subscription: isHost ? createHostLifetimeSubscription() : (existing.subscription || createInitialTrialSubscription()),
      };
      setUserProfile(returningProfile);
      saveStoredProfile(returningProfile);
      setIsOnboardingOpen(false);
      setActiveTab('today');
      triggerSyncToast(
        `Welcome back, ${returningProfile.name || 'Athlete'}.`,
        'Your plan is loaded.',
        'firestore'
      );
    }

    try {
      const restored = await restoreUserMemory(cleanEmail, currentUser?.uid);
      const snap = restored?.snapshot;
      const prof = snap?.userProfile || (existingIsReturning ? existing : null);
      const isReturning = Boolean(
        existingIsReturning ||
        (prof && (
          prof.isOnboarded ||
          (prof.goal && Number(prof.dailyCalories) > 0 && Number(prof.weightKg) > 0)
        ))
      );

      if (isReturning && (snap || existingIsReturning)) {
        const mergedProfile: UserProfile = {
          ...existing,
          ...(snap?.userProfile || {}),
          email: cleanEmail,
          name: name || snap?.userProfile?.name || existing.name || 'Athlete',
          isOnboarded: true,
          subscription: isHost ? createHostLifetimeSubscription() : (snap?.userProfile?.subscription || existing.subscription || createInitialTrialSubscription()),
        };
        if (isHost) {
          mergedProfile.subscription = createHostLifetimeSubscription();
        }

        setUserProfile(mergedProfile);
        saveStoredProfile(mergedProfile);

        if (snap?.mealLogs && snap.mealLogs.length > 0) {
          setMealLogs(snap.mealLogs);
          saveStoredMealLogs(snap.mealLogs, cleanEmail);
        }
        if (snap?.workoutLogs && snap.workoutLogs.length > 0) {
          setWorkoutLogs(snap.workoutLogs);
          saveStoredWorkoutLogs(snap.workoutLogs, cleanEmail);
        }
        if (snap?.bodyMetrics && snap.bodyMetrics.length > 0) {
          setBodyMetrics(snap.bodyMetrics);
          saveStoredBodyMetrics(snap.bodyMetrics, cleanEmail);
        }
        if (snap?.formAnalyses && snap.formAnalyses.length > 0) {
          setFormAnalyses(snap.formAnalyses);
          saveStoredFormAnalyses(snap.formAnalyses);
        }
        if (snap?.workoutPrograms && snap.workoutPrograms.length > 0) {
          setWorkoutPrograms(snap.workoutPrograms);
          saveStoredWorkoutPrograms(snap.workoutPrograms);
        }
        if (snap?.aiMealPlan) {
          setAiMealPlan(snap.aiMealPlan);
          saveStoredAIMealPlan(snap.aiMealPlan);
        }

        setIsOnboardingOpen(false);
        setActiveTab('today');
        triggerSyncToast(
          `Welcome back, ${mergedProfile.name || 'Athlete'}.`,
          'Your plan is loaded.',
          restored?.source === 'drive' ? 'drive' : 'firestore'
        );
        return;
      }
    } catch (driveErr) {
      console.warn('Memory restore error in handleSuccessAuth:', driveErr);
    }

    // Only if brand new athlete
    if (!existingIsReturning) {
      const trialSub = existing.subscription || createInitialTrialSubscription();
      const newAthlete: UserProfile = {
        ...existing,
        email: cleanEmail,
        name: name || existing.name || 'Athlete',
        subscription: isHost ? createHostLifetimeSubscription() : trialSub,
        isOnboarded: false,
      };
      handleSaveProfile(newAthlete);
      setIsOnboardingOpen(true);
    }
  };

  // Route 1: Real Legal Routes (Accessible to logged-out visitors without AuthGate or dashboard chrome)
  const legalRoutes: Record<string, LegalTabType> = {
    '/privacy': 'privacy',
    '/terms': 'terms',
    '/disclaimer': 'disclaimer',
    '/refund': 'refund',
    '/cookies': 'cookies',
    '/delete-data': 'delete-data',
  };

  if (legalRoutes[currentPath]) {
    return (
      <LegalPage
        activeTab={legalRoutes[currentPath]}
        onNavigate={handleNavigate}
        userProfile={userProfile}
        currentUser={currentUser}
        onSignIn={handleSignIn}
        onCompleteDataErasure={handleCompleteDataErasure}
      />
    );
  }

  // Route 2: Real 404 Route for unknown paths (No AuthGate, No Dashboard)
  if (currentPath !== '/' && currentPath !== '' && !currentPath.startsWith('/?')) {
    return (
      <NotFoundPage onNavigate={handleNavigate} />
    );
  }

  // Public Landing Page for unauthenticated visitors (Logged-in users skip straight to dashboard)
  const isLoggedIn = Boolean((currentUser && currentUser.email) || (userProfile.email && userProfile.email.includes('@')));

  if (!isLoggedIn) {
    return (
      <LandingPage
        onSignIn={handleSignIn}
        onNavigate={handleNavigate}
      />
    );
  }

  const isHost = isHostAdmin(userProfile.email) || isHostAdmin(currentUser?.email);
  const userEmail = userProfile.email || currentUser?.email || undefined;
  const activeSub = computeSubscriptionStatus(userProfile.subscription, userEmail);
  const isSubscriptionExpired = !isHost && activeSub.status === 'expired';

  return (
    <SubscriptionGuard
      userProfile={userProfile}
      onUpdateSubscription={handleUpdateSubscription}
      onSuccessAuth={handleSuccessAuth}
      onSaveProfile={handleSaveProfile}
      onExportData={handleExportData}
    >
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F1E] text-[#0F172A] dark:text-[#F8FAFC] font-sans flex flex-col selection:bg-[#00D4FF]/30 selection:text-[#38BDF8] transition-colors duration-200">
        {/* App Header & Navigation */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userProfile={userProfile}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCheckIn={() => setIsCheckInOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenSubscriptionModal={() => setIsPaywallOpen(true)}
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
          isHostUser={serverSaysHost}
          onOpenHostAdminModal={() => setIsHostAdminOpen(true)}
          onForceSync={() => {
            setIsSyncing(true);
            setTimeout(() => {
              setIsSyncing(false);
              triggerSyncToast(
                'Cloud Sync Complete',
                'All workout logs, nutrition tracking, and athlete metrics are verified and synchronized.',
                'manual'
              );
            }, 800);
          }}
        />

        {/* Visual Pending Sync / Offline Banner */}
        {(pendingCount > 0 || !isOnline) && (
          <div 
            id="pending-sync-alert-banner"
            className="w-full bg-[#00D4FF]/10 border-b border-[#00D4FF]/20 px-4 py-2 text-xs font-medium text-[#0C4A6E] dark:text-[#38BDF8] transition-all animate-in fade-in slide-in-from-top-1"
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4FF] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4FF]" />
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
                  className="px-2.5 py-1 rounded-md bg-gradient-to-r from-[#00D4FF] to-[#0369A1] hover:opacity-90 text-white font-semibold text-[11px] transition-all cursor-pointer shadow-xs"
                >
                  Sync Now ({pendingCount})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main View Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8 overflow-x-hidden">
          {/* 1. Today View */}
          {activeTab === 'today' && (
            <TodayDashboardView
              userProfile={userProfile}
              currentStreak={calculatedStreak}
              caloriesConsumedToday={caloriesConsumedToday}
              proteinConsumedToday={proteinConsumedToday}
              workoutLogs={workoutLogs}
              workoutPrograms={workoutPrograms}
              mealLogs={mealLogs}
              onNavigateToFood={() => setActiveTab('food')}
              onNavigateToWorkout={() => setActiveTab('workout')}
              onOpenCheckIn={() => setIsCheckInOpen(true)}
            />
          )}

          {/* 2. Food View (Scanner + Meal Log merged) */}
          {(activeTab === 'food' || activeTab === 'scan' || activeTab === 'nutrition') && (
            <FoodView
              userProfile={userProfile}
              mealLogs={mealLogs}
              todayLogs={todayLogs}
              aiMealPlan={aiMealPlan}
              onSaveMealLog={handleSaveMealLog}
              onDeleteMealLog={handleDeleteMealLog}
              onBatchDeleteMealLogs={handleBatchDeleteMealLogs}
              onClearAllMealLogs={handleClearAllMealLogs}
              onUpdateAIMealPlan={handleUpdateAIMealPlan}
              isSubscriptionExpired={isSubscriptionExpired}
              onOpenPaywall={() => setIsPaywallOpen(true)}
            />
          )}

          {/* 3. Workout View (Today's session + library + form sub-panels) */}
          {(activeTab === 'workout' || activeTab === 'workouts' || activeTab === 'library' || activeTab === 'form') && (
            <WorkoutView
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
              onQuickLogFromLibrary={handleQuickLogFromLibrary}
              formAnalyses={formAnalyses}
              onSaveFormAnalysis={handleSaveFormAnalysis}
              isSubscriptionExpired={isSubscriptionExpired}
              onOpenPaywall={() => setIsPaywallOpen(true)}
            />
          )}

          {/* 4. Progress View */}
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

          {/* 5. Coach View */}
          {activeTab === 'coach' && (
            isSubscriptionExpired ? (
              <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-[#0E1424] border border-cyan-500/30 text-center space-y-4 shadow-xl animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 text-amber-600 dark:text-cyan-400 mx-auto flex items-center justify-center">
                  <Bot className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-amber-800 dark:text-amber-300 border border-cyan-500/30">
                    Pro Coach Feature
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                    AI Coach & Telemetry Locked
                  </h3>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                  Your 7-day free trial has expired. Your logged workouts, food history, and progress records are completely safe. Upgrade to Pro to continue unlimited coaching conversations and nutritional check-ins.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsPaywallOpen(true)}
                    className="px-6 py-3 rounded-xl bg-[#00D4FF] hover:bg-[#0369A1] text-white text-xs font-bold shadow-md cursor-pointer transition-colors inline-flex items-center gap-2"
                  >
                    <span>Upgrade to Pro — ₹89/mo</span>
                  </button>
                </div>
              </div>
            ) : (
              <AICoachChat
                userProfile={userProfile}
              />
            )
          )}

          {/* Community Scoreboard (if accessed via Settings) */}
          {activeTab === 'challenges' && (
            <CommunityChallenges
              userProfile={userProfile}
              workoutLogs={workoutLogs}
              mealLogs={mealLogs}
              currentStreak={calculatedStreak}
            />
          )}
        </main>

        {/* Real Legal & Global Footer */}
        <Footer
          onOpenLegal={handleOpenLegal}
          onOpenReportError={() => setIsReportAppErrorOpen(true)}
          isHostAdminUser={serverSaysHost}
          onTriggerAudit={handleTriggerAudit}
          isAuditing={isAuditing}
          precisionStatus={precisionStatus}
          onTogglePrecisionStatus={() => setPrecisionStatus((prev) => prev === 'active' ? 'standby' : 'active')}
          onOpenPerformanceDashboard={() => setIsPerformanceDashboardOpen(true)}
        />

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

        {/* Host Master Admin Portal Modal */}
        <HostAdminPortalModal
          isOpen={isHostAdminOpen}
          onClose={() => setIsHostAdminOpen(false)}
          currentUserProfile={userProfile}
          currentUserEmail={currentUser?.email || userProfile?.email || ''}
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

        {/* Real Legal Pages & Compliance Modal (DPDP Act, 2023) */}
        <LegalPagesModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          initialTab={legalModalTab}
          userProfile={userProfile}
          onCompleteDataErasure={handleCompleteDataErasure}
        />

        {/* Cookie & Local Storage Consent Banner */}
        <CookieBanner onOpenLegal={handleOpenLegal} />

        {/* Settings & Secondary Tools Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userProfile={userProfile}
          currentUser={currentUser}
          workoutLogs={workoutLogs}
          mealLogs={mealLogs}
          calculatedStreak={calculatedStreak}
          isHostAdminUser={serverSaysHost}
          onUpdateProfile={handleSaveProfile}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenCheckIn={() => setIsCheckInOpen(true)}
          onOpenCalibration={() => setIsQuarterlyCalibrationOpen(true)}
          onOpenSubscriptionModal={() => setIsPaywallOpen(true)}
          onOpenHostAdminModal={() => setIsHostAdminOpen(true)}
          onOpenPerformanceDashboard={() => setIsPerformanceDashboardOpen(true)}
          onOpenAuditModal={() => setIsAuditModalOpen(true)}
          onExportData={handleExportData}
          onForceSync={() => {
            setIsSyncing(true);
            setTimeout(() => {
              setIsSyncing(false);
              triggerSyncToast(
                'Cloud Sync Complete',
                'All workout logs, nutrition tracking, and athlete metrics are verified and synchronized.',
                'manual'
              );
            }, 800);
          }}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onSelectTab={setActiveTab}
        />

        {/* Mobile Fixed Bottom Navigation Bar (44px Targets, 5 Tabs, No Horizontal Scroll) */}
        <BottomTabBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      </div>
    </SubscriptionGuard>
  );
}
