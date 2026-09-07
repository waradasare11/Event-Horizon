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
  QrCode,
  Award,
  CheckSquare,
  BookOpen
} from 'lucide-react';
import { UserProfile } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { ThemeMode } from '../lib/theme';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { isHostAdmin, computeSubscriptionStatus, getPlanDisplayBadge } from '../lib/subscription';
import { User } from 'firebase/auth';
import { ArohLogo } from './ArohLogo';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
  onOpenCheckIn: () => void;
  onOpenOnboarding: () => void;
  onOpenSubscriptionModal?: () => void;
  onOpenHostAdminModal?: () => void;
  onOpenPerformanceDashboard?: () => void;
  onOpenKeepSync?: () => void;
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
  onOpenKeepSync,
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
  const userEmail = userProfile.email || currentUser?.email || undefined;
  const activeSub = computeSubscriptionStatus(userProfile.subscription, userEmail);

  const navItems = [
    { id: 'scan', label: 'Meal Scanner', icon: Camera },
    { id: 'nutrition', label: 'Meals & Food', icon: Utensils },
    { id: 'workouts', label: 'Workout Plans', icon: Dumbbell },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'form', label: 'Posture & Form', icon: Activity },
    { id: 'projector', label: 'Body Preview', icon: Sparkles },
    { id: 'progress', label: 'My Progress', icon: TrendingUp },
    { id: 'challenges', label: 'Community', icon: Award },
    { id: 'research', label: 'Fitness Guides', icon: Globe },
    { id: 'coach', label: 'Ask AI Coach', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#080B14]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Banner / User Quick Metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand with Uploaded Logo Asset */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('workouts')}>
            <ArohLogo size="md" />
          </div>

          {/* Daily Quick Summary Widget */}
          <div className="hidden lg:flex items-center gap-6 bg-slate-50 dark:bg-[#0E1424] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-left">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Daily Calories</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {caloriesConsumedToday} / {userProfile.dailyCalories} kcal
                </span>
              </div>
              <div className="w-28 bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-1 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
            </div>

            <div className="h-7 w-[1px] bg-slate-200 dark:bg-slate-800" />

            <div className="text-left">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Protein</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {proteinConsumedToday}g / {userProfile.dailyProtein}g
                </span>
              </div>
              <div className="w-24 bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-1 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-400 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons, Auth, & Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shadow-2xs cursor-pointer ${
                activeSub.status === 'active'
                  ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/25'
                  : 'bg-purple-500/15 border-purple-500/30 text-purple-800 dark:text-purple-300 hover:bg-purple-500/25'
              }`}
              title="View AROH Pro Subscription, QR Payment & Active Tier"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{getPlanDisplayBadge(activeSub, isHost)}</span>
            </button>

            {/* Streak Quick Badge */}
            <button
              onClick={() => setActiveTab('workouts')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500/15 to-purple-500/15 dark:from-cyan-500/20 dark:to-purple-500/20 border border-cyan-400/30 dark:border-cyan-400/40 text-cyan-800 dark:text-cyan-300 hover:scale-105 transition-all shadow-2xs cursor-pointer"
              title="View Training Consistency Streak & 28-Day Matrix"
            >
              <Flame className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              <span>{currentStreak}d</span>
            </button>

            {/* Google Keep Launcher */}
            {onOpenKeepSync && (
              <button
                id="header-google-keep-btn"
                type="button"
                onClick={onOpenKeepSync}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-400/30 hover:bg-purple-500/20 transition-all shadow-xs cursor-pointer"
                title="Sync workout, macros & groceries to Google Keep"
              >
                <CheckSquare className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                <span className="hidden sm:inline">Keep</span>
              </button>
            )}

            {/* Profile Button */}
            <button
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:opacity-95 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              title="Update profile stats, goal, injuries, or preferences"
            >
              <UserCheck className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Profile</span>
            </button>

            {/* Google Sign-in / Cloud Sync status */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 dark:border-slate-800">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-cyan-400/40 object-cover"
                    title={`Signed in as ${currentUser.email || currentUser.displayName}`}
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Sign out of Firebase"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-[#0E1424] border border-cyan-400/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition-all shadow-xs cursor-pointer"
                title="Sign in with Google to sync workouts, meals & analyses across devices"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-200/60 dark:border-slate-800/80 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141C34]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};


