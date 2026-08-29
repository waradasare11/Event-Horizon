import React from 'react';
import { 
  Camera, 
  Utensils, 
  Dumbbell, 
  TrendingUp, 
  Bot, 
  Sparkles, 
  RefreshCw, 
  UserCheck, 
  Globe, 
  Flame, 
  Activity, 
  LogIn, 
  LogOut,
  Cloud,
  CheckCircle2,
  Download,
  Crown,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { UserProfile } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { ThemeMode } from '../lib/theme';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { isHostAdmin, computeSubscriptionStatus } from '../lib/subscription';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
  onOpenCheckIn: () => void;
  onOpenOnboarding: () => void;
  onOpenSubscriptionModal?: () => void;
  onOpenHostAdminModal?: () => void;
  onOpenPerformanceDashboard?: () => void;
  onExportData?: () => void;
  onForceSync?: () => void;
  caloriesConsumedToday: number;
  proteinConsumedToday: number;
  currentStreak?: number;
  theme?: ThemeMode;
  effectiveTheme?: 'light' | 'dark';
  onThemeChange?: (theme: ThemeMode) => void;
  currentUser?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  onOpenCheckIn,
  onOpenOnboarding,
  onOpenSubscriptionModal,
  onOpenHostAdminModal,
  onOpenPerformanceDashboard,
  onExportData,
  onForceSync,
  caloriesConsumedToday,
  proteinConsumedToday,
  currentStreak = 14,
  theme = 'system',
  effectiveTheme = 'light',
  onThemeChange = () => {},
  currentUser = null,
  onSignIn = () => {},
  onSignOut = () => {},
  isSyncing = false,
}) => {
  const caloriePercent = Math.min(100, Math.round((caloriesConsumedToday / (userProfile.dailyCalories || 2000)) * 100));
  const proteinPercent = Math.min(100, Math.round((proteinConsumedToday / (userProfile.dailyProtein || 150)) * 100));

  const isHost = isHostAdmin(userProfile.email) || isHostAdmin(currentUser?.email);
  const activeSub = computeSubscriptionStatus(userProfile.subscription);

  const navItems = [
    { id: 'scan', label: 'Meal Scanner', icon: Camera },
    { id: 'nutrition', label: 'Meals & Food', icon: Utensils },
    { id: 'workouts', label: 'Workout Plans', icon: Dumbbell },
    { id: 'form', label: 'Posture & Form', icon: Activity },
    { id: 'projector', label: 'Body Preview', icon: Sparkles },
    { id: 'progress', label: 'My Progress', icon: TrendingUp },
    { id: 'research', label: 'Fitness Guides', icon: Globe },
    { id: 'coach', label: 'Ask AI Coach', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF8]/95 dark:bg-[#111312]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#242826] transition-colors">
      {/* Top Banner / User Quick Metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#0F6E5F] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 text-[#E8912D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-[#1A1D1B] dark:text-[#E8ECE9]">PeakForm</span>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#0F6E5F]/10 text-[#0F6E5F] dark:bg-[#0F6E5F]/20 dark:text-[#2DD4BF]">
                  AI
                </span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] hidden sm:block">
                Evidence-Based Fitness & Nutrition
              </p>
            </div>
          </div>

          {/* Daily Quick Summary Widget */}
          <div className="hidden lg:flex items-center gap-6 bg-white dark:bg-[#1A1D1C] px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] shadow-xs">
            <div className="text-left">
              <div className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9EA8A2]">
                <span>Daily Calories</span>
                <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  {caloriesConsumedToday} / {userProfile.dailyCalories} kcal
                </span>
              </div>
              <div className="w-28 bg-[#F3F4F6] dark:bg-[#2A2E2C] rounded-full h-2 mt-1 overflow-hidden">
                <div
                  className="bg-[#0F6E5F] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
            </div>

            <div className="h-7 w-[1px] bg-[#E5E7EB] dark:bg-[#2A2E2C]" />

            <div className="text-left">
              <div className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9EA8A2]">
                <span>Protein</span>
                <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  {proteinConsumedToday}g / {userProfile.dailyProtein}g
                </span>
              </div>
              <div className="w-24 bg-[#F3F4F6] dark:bg-[#2A2E2C] rounded-full h-2 mt-1 overflow-hidden">
                <div
                  className="bg-[#E8912D] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons, Auth, & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Persistent Firestore Sync & Drift Status Indicator */}
            <SyncStatusIndicator
              isSyncing={isSyncing}
              currentUser={currentUser}
              onForceSync={onForceSync}
            />

            {/* Theme Toggle Button */}
            <ThemeToggle
              theme={theme}
              effectiveTheme={effectiveTheme}
              onThemeChange={onThemeChange}
            />

            {/* Subscription Pro Status & Upgrade Trigger */}
            <button
              onClick={onOpenSubscriptionModal}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shadow-2xs cursor-pointer ${
                activeSub.status === 'active'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-300 hover:bg-amber-500/25'
              }`}
              title="View PeakForm AI Pro Subscription, QR Payment & Active Tier"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>
                {activeSub.status === 'active' 
                  ? `${activeSub.daysRemaining}d Pro` 
                  : `${activeSub.daysRemaining}d Trial`}
              </span>
            </button>

            {/* Host Master Admin Portal Button (Warad Asare) */}
            {isHost && (
              <>
                <button
                  onClick={onOpenHostAdminModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all cursor-pointer"
                  title="Host Admin Portal (Warad Asare) - View Verified Payments Ledger & Revenue"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-200" />
                  <span className="hidden sm:inline">Host Ledger</span>
                </button>

                {onOpenPerformanceDashboard && (
                  <button
                    onClick={onOpenPerformanceDashboard}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all cursor-pointer"
                    title="Host Latency & Service Telemetry Sparklines (Warad Asare)"
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-200" />
                    <span className="hidden sm:inline">Latency Telemetry</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => setActiveTab('workouts')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/30 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 hover:scale-105 transition-all shadow-2xs cursor-pointer"
              title="View Training Consistency Streak & 28-Day Matrix"
            >
              <Flame className="w-3.5 h-3.5 text-[#E8912D] fill-[#E8912D]" />
              <span>{currentStreak}d Streak</span>
            </button>

            <button
              onClick={onOpenCheckIn}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#1A1D1B] dark:text-[#E8ECE9] hover:bg-[#F9FAFB] dark:hover:bg-[#232726] hover:border-[#0F6E5F] transition-all shadow-xs cursor-pointer"
              title="Record weekly body weight and trigger AI plan adjustments"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#0F6E5F] dark:text-[#2DD4BF]" />
              <span className="hidden sm:inline">Weekly</span> Check-In
            </button>

            <button
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#0F6E5F] text-white hover:bg-[#0D5B4F] transition-all shadow-xs cursor-pointer"
              title="Update profile stats, goal, injuries, or preferences"
            >
              <UserCheck className="w-3.5 h-3.5 text-white" />
              <span>Profile</span>
            </button>

            {onExportData && (
              <button
                onClick={onExportData}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#1A1D1B] dark:text-[#E8ECE9] hover:bg-[#F9FAFB] dark:hover:bg-[#232726] hover:border-[#0F6E5F] transition-all shadow-xs cursor-pointer"
                title="Export user logs to CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#0F6E5F] dark:text-[#2DD4BF]" />
                <span>Export CSV</span>
              </button>
            )}

            {/* Google Sign-in / Cloud Sync status */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-[#E5E7EB] dark:border-[#242826]">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-[#0F6E5F]/30 object-cover"
                    title={`Signed in as ${currentUser.email || currentUser.displayName}`}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0F6E5F] text-white font-bold text-xs flex items-center justify-center">
                    {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={onSignOut}
                  className="p-2 rounded-lg text-[#6B7280] dark:text-[#9EA8A2] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Sign out of Firebase"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-white dark:bg-[#1A1D1C] border border-[#0F6E5F]/40 text-[#0F6E5F] dark:text-[#5FD1B8] hover:bg-[#0F6E5F]/5 transition-all shadow-xs cursor-pointer"
                title="Sign in with Google to sync workouts, meals & analyses across devices"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Google</span> Sign In
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-[#E5E7EB]/60 dark:border-[#242826] pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0F6E5F] text-white shadow-xs'
                    : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9] hover:bg-white dark:hover:bg-[#1A1D1C]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B7280] dark:text-[#9EA8A2]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};


