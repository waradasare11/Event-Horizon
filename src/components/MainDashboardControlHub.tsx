import React from 'react';
import {
  Flame,
  RefreshCw,
  UserCheck,
  Crown,
  ShieldCheck,
  Activity,
  Download,
  LogOut,
  LogIn,
  Sparkles,
  Calendar,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { UserProfile, MealLog, WorkoutLog, BodyMetric } from '../types';
import { User } from 'firebase/auth';
import { isHostAdmin, computeSubscriptionStatus, getPlanDisplayBadge } from '../lib/subscription';
import { CloudSyncWidget } from './CloudSyncWidget';

interface MainDashboardControlHubProps {
  userProfile: UserProfile;
  currentStreak: number;
  currentUser: User | null;
  mealLogs?: MealLog[];
  workoutLogs?: WorkoutLog[];
  bodyMetrics?: BodyMetric[];
  onOpenCheckIn: () => void;
  onOpenOnboarding: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenHostAdminModal?: () => void;
  onOpenPerformanceDashboard?: () => void;
  onExportData?: () => void;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onSelectTab?: (tab: string) => void;
}

export const MainDashboardControlHub: React.FC<MainDashboardControlHubProps> = ({
  userProfile,
  currentStreak,
  currentUser,
  mealLogs = [],
  workoutLogs = [],
  bodyMetrics = [],
  onOpenCheckIn,
  onOpenOnboarding,
  onOpenSubscriptionModal,
  onOpenHostAdminModal,
  onOpenPerformanceDashboard,
  onExportData,
  onSignIn,
  onSignOut,
  onSelectTab,
}) => {
  const isHost = isHostAdmin(userProfile.email) || isHostAdmin(currentUser?.email);
  const activeSub = computeSubscriptionStatus(userProfile.subscription, userProfile.email || currentUser?.email || undefined);

  return (
    <section
      id="main-dashboard-control-hub"
      aria-label="Dashboard Quick Actions"
      className="mb-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden w-full"
    >
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left: User Welcome & Current Physique Target */}
        <div className="flex items-center gap-3.5 min-w-0 w-full xl:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-cyan-500/20 shrink-0">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={userProfile.name || 'User Avatar'}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover border border-cyan-400/40"
              />
            ) : (
              (userProfile.name || currentUser?.displayName || currentUser?.email || 'A').charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate font-['Space_Grotesk',sans-serif]">
                {userProfile.name || currentUser?.displayName || 'Peak Athlete'}
              </h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                activeSub.status === 'active'
                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30'
                  : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-400/30'
              }`}>
                <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{isHost ? 'VIP Host Lifetime Free' : getPlanDisplayBadge(activeSub, false)}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
              <span>Goal: <strong className="text-slate-800 dark:text-slate-200 capitalize">{userProfile.goal.replace('_', ' ')}</strong></span>
              <span>•</span>
              <span>Target: <strong className="text-cyan-600 dark:text-cyan-400">{userProfile.targetWeightKg} kg</strong></span>
              {userProfile.targetDate && (
                <>
                  <span>•</span>
                  <span>Deadline: <strong className="text-slate-800 dark:text-slate-200">{new Date(userProfile.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls Grid */}
        <div className="w-full xl:w-auto grid grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5">
          {/* 1. Streak Tracker Action */}
          <button
            id="dashboard-streak-btn"
            onClick={() => onSelectTab?.('workouts')}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500/15 to-purple-500/15 dark:from-cyan-500/20 dark:to-purple-500/20 border border-cyan-400/30 dark:border-cyan-400/40 text-cyan-800 dark:text-cyan-300 hover:scale-[1.02] active:scale-95 transition-all shadow-2xs cursor-pointer whitespace-nowrap"
            title="View Training Consistency Streak & 28-Day Consistency Matrix"
          >
            <Flame className="w-4 h-4 text-cyan-400 fill-cyan-400 shrink-0" />
            <span>{currentStreak}d Streak</span>
          </button>

          {/* 2. Weekly Check-In Action */}
          <button
            id="dashboard-weekly-checkin-btn"
            onClick={onOpenCheckIn}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-[#141C34] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1C2748] hover:border-cyan-500 active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
            title="Log weekly body weight and trigger automated AI macro plan recalibration"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 shrink-0" />
            <span>Weekly Check-In</span>
          </button>

          {/* 3. User Profile & Goal Setting Action */}
          <button
            id="dashboard-profile-btn"
            onClick={onOpenOnboarding}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:opacity-95 active:scale-95 transition-all shadow-md shadow-cyan-500/20 cursor-pointer whitespace-nowrap"
            title="Edit body stats, metabolic targets, diet framework, or lifestyle variables"
          >
            <UserCheck className="w-3.5 h-3.5 text-white shrink-0" />
            <span>Profile &amp; Goals</span>
          </button>

          {/* 4. Pro Subscription Upgrade / Details */}
          <button
            id="dashboard-subscription-btn"
            onClick={onOpenSubscriptionModal}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-[#141C34] border border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
            title="View Pro Subscription Plan, QR Instant Payment & Benefits"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            <span>Pro Plan</span>
          </button>

          {/* 5. Host Master Admin Ledger (For Warad Asare / Host) */}
          {isHost && (
            <>
              {onOpenHostAdminModal && (
                <button
                  id="dashboard-host-admin-btn"
                  onClick={onOpenHostAdminModal}
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-black rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-xs transition-all cursor-pointer whitespace-nowrap"
                  title="Host Admin Portal (Warad Asare) - Verified Payment Ledger"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-200 shrink-0" />
                  <span>Host Ledger</span>
                </button>
              )}
              {onOpenPerformanceDashboard && (
                <button
                  id="dashboard-latency-btn"
                  onClick={onOpenPerformanceDashboard}
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-black rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white shadow-xs transition-all cursor-pointer whitespace-nowrap"
                  title="Host Service Latency & Telemetry Monitor"
                >
                  <Activity className="w-3.5 h-3.5 text-teal-200 shrink-0" />
                  <span>AI Latency</span>
                </button>
              )}
            </>
          )}

          {/* 6. Export CSV Action */}
          {onExportData && (
            <button
              id="dashboard-export-csv-btn"
              onClick={onExportData}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#1E2220] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9] hover:bg-[#F9FAFB] dark:hover:bg-[#282D2A] active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
              title="Export all nutrition, workout and weigh-in records to CSV"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Export CSV</span>
            </button>
          )}

          {/* 7. Sign In / Sign Out Action */}
          {currentUser ? (
            <button
              id="dashboard-signout-btn"
              onClick={onSignOut}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-950/40 active:scale-95 transition-all cursor-pointer shadow-xs whitespace-nowrap"
              title={`Sign out (${currentUser.email})`}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Log Out</span>
            </button>
          ) : (
            <button
              id="dashboard-signin-btn"
              onClick={onSignIn}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-[#1E2220] border border-[#0F6E5F]/50 text-[#0F6E5F] dark:text-[#2DD4BF] hover:bg-[#0F6E5F]/10 active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
              title="Sign in with Google to sync workouts and meals to cloud database"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span>Google Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Cloud Sync Section (Google Drive, Calendar, Tasks) */}
      <CloudSyncWidget
        userProfile={userProfile}
        mealLogs={mealLogs}
        workoutLogs={workoutLogs}
        bodyMetrics={bodyMetrics}
      />
    </section>
  );
};
