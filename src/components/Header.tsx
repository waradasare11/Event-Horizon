import React from 'react';
import { 
  Sun,
  Utensils, 
  Dumbbell, 
  TrendingUp, 
  Bot, 
  Settings,
  Flame, 
  LogIn, 
  LogOut,
  Crown,
  UserCheck
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
  onOpenSettings: () => void;
  onOpenCheckIn?: () => void;
  onOpenOnboarding?: () => void;
  onOpenSubscriptionModal?: () => void;
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
  onForceSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  onOpenSettings,
  onOpenCheckIn,
  onOpenOnboarding,
  onOpenSubscriptionModal,
  caloriesConsumedToday,
  proteinConsumedToday,
  currentStreak = 0,
  theme = 'system',
  effectiveTheme = 'light',
  onThemeChange = () => {},
  currentUser = null,
  onSignIn = () => {},
  onSignOut = () => {},
  isSyncing = false,
  onForceSync = () => {},
}) => {
  const caloriePercent = Math.min(100, Math.round((caloriesConsumedToday / (userProfile.dailyCalories || 2000)) * 100));
  const proteinPercent = Math.min(100, Math.round((proteinConsumedToday / (userProfile.dailyProtein || 150)) * 100));

  const isHost = isHostAdmin(userProfile.email) || isHostAdmin(currentUser?.email);
  const userEmail = userProfile.email || currentUser?.email || undefined;
  const activeSub = computeSubscriptionStatus(userProfile.subscription, userEmail);

  // 5 Focused Tabs
  const navItems = [
    { id: 'today', label: 'Today', icon: Sun },
    { id: 'food', label: 'Food', icon: Utensils },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'coach', label: 'Coach', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0B0F1E]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 shrink-0 cursor-pointer" 
            onClick={() => setActiveTab('today')}
          >
            <ArohLogo size="md" />
          </div>

          {/* Daily Quick Summary Widget (Visible on lg+ screens) */}
          <div className="hidden lg:flex items-center gap-6 bg-slate-50 dark:bg-[#0E1424] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-left">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Today's Energy</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {caloriesConsumedToday} / {userProfile.dailyCalories || 2000} kcal
                </span>
              </div>
              <div className="w-28 bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-1 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
            </div>

            <div className="h-7 w-[1px] bg-slate-200 dark:bg-slate-800" />

            <div className="text-left">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Protein</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {proteinConsumedToday}g / {userProfile.dailyProtein || 150}g
                </span>
              </div>
              <div className="w-24 bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-1 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons & Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Sync Indicator */}
            <SyncStatusIndicator
              isSyncing={isSyncing}
              currentUser={currentUser}
              onForceSync={onForceSync}
            />

            {/* Theme Toggle */}
            <ThemeToggle
              theme={theme}
              effectiveTheme={effectiveTheme}
              onThemeChange={onThemeChange}
            />

            {/* Subscription Status Badge */}
            {(() => {
              const badgeConfig = (() => {
                if (activeSub.status === 'trial' || activeSub.isTrialActive) {
                  const days = Math.max(0, activeSub.daysRemaining ?? 0);
                  return {
                    label: `Trial · ${days} ${days === 1 ? 'day' : 'days'}`,
                    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25 hover:bg-blue-500/20',
                    dot: 'bg-blue-500',
                  };
                }
                if (activeSub.status === 'active') {
                  return {
                    label: 'Pro',
                    className: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25',
                    dot: 'bg-cyan-400',
                  };
                }
                return {
                  label: 'Expired — view only',
                  className: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 hover:bg-rose-500/20',
                  dot: 'bg-rose-500',
                };
              })();

              return (
                <button
                  type="button"
                  onClick={onOpenSubscriptionModal}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${badgeConfig.className}`}
                  title="Subscription status — Click to view plans"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dot}`} />
                  <span>{badgeConfig.label}</span>
                </button>
              );
            })()}

            {/* Streak Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400"
              title="Current training consistency streak"
            >
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{currentStreak}d</span>
            </div>

            {/* Settings Gear Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="Settings, Tools & Account"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Avatar / Sign-In */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 dark:border-slate-800">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-cyan-500/40 object-cover cursor-pointer"
                    onClick={onOpenSettings}
                    title={`Signed in as ${currentUser.email || currentUser.displayName}`}
                  />
                ) : (
                  <button
                    onClick={onOpenSettings}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs"
                  >
                    {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 transition-all cursor-pointer shadow-sm font-sans"
                title="Sign in with Google"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Tab Navigation (Hidden on mobile where BottomTabBar is active) */}
        <div className="hidden md:flex space-x-1 border-t border-slate-200/60 dark:border-slate-800/80 pt-2 pb-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20 font-sans'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161F38]'
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
