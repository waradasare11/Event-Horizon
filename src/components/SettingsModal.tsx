import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  User, 
  Crown, 
  Calendar, 
  Download, 
  RefreshCw, 
  CheckSquare, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  LogOut, 
  LogIn, 
  Users, 
  BookOpen, 
  ChevronRight,
  Sparkles,
  Award,
  HelpCircle,
  CheckCircle2,
  CloudOff,
  AlertCircle
} from 'lucide-react';
import { UserProfile, WorkoutCompletionLog, MealLog } from '../types';
import { isHostAdmin, checkIsHostOnServer, computeSubscriptionStatus, getPlanDisplayBadge } from '../lib/subscription';
import { HelpArticlesModal } from './HelpArticlesModal';
import { subscribeDriveSyncStatus, getDriveStatus, DriveSyncStatus } from '../lib/userMemory';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  currentUser: any | null;
  workoutLogs: WorkoutCompletionLog[];
  mealLogs: MealLog[];
  calculatedStreak: number;
  isHostAdminUser?: boolean;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onOpenOnboarding: () => void;
  onOpenCheckIn: () => void;
  onOpenCalibration: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenHostAdminModal: () => void;
  onOpenPerformanceDashboard: () => void;
  onOpenKeepSync?: () => void;
  onOpenAuditModal: () => void;
  onExportData: () => void;
  onForceSync: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onSelectTab: (tab: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentUser,
  workoutLogs,
  mealLogs,
  calculatedStreak,
  isHostAdminUser,
  onUpdateProfile,
  onOpenOnboarding,
  onOpenCheckIn,
  onOpenCalibration,
  onOpenSubscriptionModal,
  onOpenHostAdminModal,
  onOpenPerformanceDashboard,
  onOpenKeepSync,
  onOpenAuditModal,
  onExportData,
  onForceSync,
  onSignIn,
  onSignOut,
  onSelectTab,
}) => {
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [defaultHelpArticleId, setDefaultHelpArticleId] = useState<string>('scan');
  const [driveStatus, setDriveStatus] = useState<DriveSyncStatus>(() => getDriveStatus());
  const [serverIsHost, setServerIsHost] = useState<boolean>(false);

  useEffect(() => {
    return subscribeDriveSyncStatus((status) => {
      setDriveStatus(status);
    });
  }, []);

  useEffect(() => {
    const em = userProfile?.email || currentUser?.email;
    if (!em) {
      setServerIsHost(false);
      return;
    }
    let isMounted = true;
    checkIsHostOnServer(em).then((val) => {
      if (isMounted) setServerIsHost(val);
    });
    return () => {
      isMounted = false;
    };
  }, [userProfile?.email, currentUser?.email]);

  if (!isOpen) return null;

  const isHost = Boolean(isHostAdminUser ?? serverIsHost);
  const activeSub = computeSubscriptionStatus(userProfile.subscription, userProfile.email || currentUser?.email);

  // Calibration days since last update
  const lastUpdate = userProfile.lastQuarterlyReviewDate || userProfile.lastProfileUpdateDate;
  const daysSinceUpdate = lastUpdate
    ? Math.floor((Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-[#111111] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings & Tools</h2>
              <p className="text-xs text-gray-500">Preferences, athlete calibration & account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Athlete Profile & Subscription Status Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-black font-extrabold text-sm flex items-center justify-center shadow-xs">
                  {(userProfile.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {userProfile.name || 'AROH Athlete'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {userProfile.email || currentUser?.email || 'Local Athlete Profile'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenSubscriptionModal();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>{getPlanDisplayBadge(activeSub, isHost)}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 border-t border-gray-200 dark:border-gray-700/60">
              <button
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Edit Profile & Targets</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenCheckIn();
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Weekly Check-In</span>
              </button>
            </div>
          </div>

          {/* Quarterly Profile Calibration Card (Non-blocking Reminder) */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                Quarterly Recalibration Reminder
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                {daysSinceUpdate !== null ? `${daysSinceUpdate} days since last update` : 'Never calibrated'}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Every 8–12 weeks, your metabolic rate and training volume adapt. Calibrate your body composition, caloric targets, and program split to avoid plateaus.
            </p>
            <div className="pt-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenCalibration();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-sm font-sans"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recalibrate Plan & Macros</span>
              </button>
            </div>
          </div>

          {/* Data Management & Sync */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Data & Cloud Backups
              </h3>
              {/* Drive status pill: Synced / Saving / Offline / Reconnect */}
              <div className="flex items-center">
                {!currentUser ? (
                  <button
                    onClick={onSignIn}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <LogIn className="w-3 h-3 text-amber-500" />
                    <span>Drive: Sign In</span>
                  </button>
                ) : (typeof navigator !== 'undefined' && !navigator.onLine) || driveStatus.status === 'offline' ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap"
                    title="Offline mode active — changes stored locally and will sync when reconnected"
                  >
                    <CloudOff className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Offline</span>
                  </span>
                ) : driveStatus.status === 'saving' ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 whitespace-nowrap"
                    title="Saving snapshot to Google Drive folder 'AROH AI'"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-500 animate-spin shrink-0" />
                    <span>Saving</span>
                  </span>
                ) : driveStatus.status === 'reconnect_needed' || driveStatus.status === 'error' ? (
                  <button
                    onClick={onSignIn}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 transition-all cursor-pointer whitespace-nowrap animate-pulse"
                    title="Google Drive session expired. Click to reconnect authorization."
                  >
                    <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>Reconnect</span>
                  </button>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 whitespace-nowrap"
                    title="Google Drive folder 'AROH AI' is up to date"
                  >
                    <CheckCircle2 className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>Synced</span>
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onExportData();
                }}
                className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">Export CSV</div>
                    <div className="text-[11px] text-gray-500">Download all meals & workouts</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  onForceSync();
                }}
                className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">Reconcile Cloud Sync</div>
                    <div className="text-[11px] text-gray-500">Verify Firestore & Drive</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Food Row Labels Preference */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Food Display Preference
            </h3>
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">Food Row Labels</div>
                <div className="text-[11px] text-gray-500">Show Hindi names alongside English food rows</div>
              </div>
              <div className="inline-flex rounded-xl bg-gray-200 dark:bg-gray-900 p-1 border border-gray-300 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateProfile) {
                      onUpdateProfile({ ...userProfile, foodLabelLanguage: 'english' });
                    }
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    (userProfile.foodLabelLanguage || 'english') === 'english'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateProfile) {
                      onUpdateProfile({ ...userProfile, foodLabelLanguage: 'english_hindi' });
                    }
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    userProfile.foodLabelLanguage === 'english_hindi'
                      ? 'bg-[#D4AF37] text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  English + Hindi
                </button>
              </div>
            </div>
          </div>

          {/* Help & User Guides: scan, quick log, fix grams, billing, Drive optional backup, export, delete data, parent consent */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Help & Guides</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setDefaultHelpArticleId('scan');
                  setShowHelpModal(true);
                }}
                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                View all articles
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'scan', label: 'Scan Meal', desc: 'Camera scanning' },
                { id: 'quick-log', label: 'Quick Log', desc: 'Instant 10s entry' },
                { id: 'fix-grams', label: 'Fix Grams', desc: 'Accurate portions' },
                { id: 'billing', label: 'Billing Plans', desc: '₹89 / ₹239 / ₹919' },
                { id: 'drive-backup', label: 'Drive Backup', desc: 'AROH AI cloud folder' },
                { id: 'export', label: 'Export Data', desc: 'Download CSV / JSON' },
                { id: 'delete-data', label: 'Delete Data', desc: 'DPDP Act erasure' },
                { id: 'parent-consent', label: 'Parent Consent', desc: 'Under-18 athlete rules' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setDefaultHelpArticleId(item.id);
                    setShowHelpModal(true);
                  }}
                  className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-left hover:bg-amber-500/10 hover:border-amber-500/30 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">{item.desc}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-500 shrink-0 ml-1" />
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenAuditModal();
              }}
              className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-between mt-1 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">Program Diagnostics Auditor</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {/* Admin & Host Portal (Visible to Host Admin) */}
          {isHost && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>Host Administration</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenHostAdminModal();
                  }}
                  className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left hover:bg-amber-500/20 transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-200">Host Admin Portal</div>
                    <div className="text-[11px] text-amber-800/80 dark:text-amber-300/80">User grants & valuations</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenPerformanceDashboard();
                  }}
                  className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left hover:bg-amber-500/20 transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-200">Performance Monitor</div>
                    <div className="text-[11px] text-amber-800/80 dark:text-amber-300/80">FPS, latency & memory telemetry</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600" />
                </button>
              </div>
            </div>
          )}

          {/* Legal Compliance Links */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <a href="/privacy" className="hover:text-amber-500 underline">Privacy Policy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-amber-500 underline">Terms</a>
              <span>•</span>
              <a href="/disclaimer" className="hover:text-amber-500 underline">Disclaimer</a>
              <span>•</span>
              <a href="/refund" className="hover:text-amber-500 underline">Refund Policy</a>
            </div>
            <span className="font-mono text-[10px]">DPDP Act, 2023</span>
          </div>
        </div>

        {/* Footer with Sign Out */}
        <div className="p-4 bg-gray-50 dark:bg-[#070707] border-t border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-gray-500">
            AROH v2.4 • Evidence-Based Coaching
          </div>
          {currentUser ? (
            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onSignIn();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all flex items-center gap-1.5 font-sans shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>

      <HelpArticlesModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        defaultArticleId={defaultHelpArticleId}
      />
    </div>
  );
};
