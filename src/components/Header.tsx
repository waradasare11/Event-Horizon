import React from 'react';
import { 
  Settings,
  Crown
} from 'lucide-react';
import { UserProfile } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { ThemeMode } from '../lib/theme';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { computeSubscriptionStatus } from '../lib/subscription';
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
  caloriesConsumedToday?: number;
  proteinConsumedToday?: number;
  currentStreak?: number;
  theme?: ThemeMode;
  effectiveTheme?: 'light' | 'dark';
  onThemeChange?: (theme: ThemeMode) => void;
  currentUser?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  isSyncing?: boolean;
  onForceSync?: () => void;
  isHostUser?: boolean;
  onOpenHostAdminModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  setActiveTab,
  userProfile,
  onOpenSettings,
  onOpenSubscriptionModal,
  theme = 'system',
  effectiveTheme = 'dark',
  onThemeChange = () => {},
  currentUser = null,
  isSyncing = false,
  onForceSync = () => {},
  isHostUser = false,
  onOpenHostAdminModal,
}) => {
  const userEmail = userProfile.email || currentUser?.email || undefined;
  const activeSub = computeSubscriptionStatus(userProfile.subscription, userEmail);

  // Plan chip label: strictly "Pro" or "Trial" (or "Expired") with blue border
  const planLabel = (() => {
    if (activeSub.status === 'active' || activeSub.isLifetime) {
      return 'Pro';
    }
    if (activeSub.status === 'trial' || activeSub.isTrialActive) {
      return 'Trial';
    }
    return 'Trial';
  })();

  return (
    <header className="sticky top-0 z-30 h-14 max-h-[56px] w-full bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E3A5F] transition-colors">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-3">
        {/* LEFT: ArohLogo size sm. Hide "SMART FITNESS" subtitle on viewports < 1100px. */}
        <div 
          className="flex items-center shrink-0 cursor-pointer" 
          onClick={() => setActiveTab('today')}
        >
          <ArohLogo size="sm" hideSubtitleBelow1100={true} />
        </div>

        {/* CENTER (desktop) / hide on mobile: NOTHING. Do not put kcal in the header. */}
        <div className="hidden md:block flex-1" />

        {/* RIGHT, in this order only:
            1. Tiny sync: green dot + "Saved"
            2. Theme: ONE icon button that cycles light -> dark -> auto.
            3. Plan chip: "Trial" or "Pro" - 28px height, blue border
            4. Gear settings, 44px hit area
            (Optional Host Ledger Crown if isHostUser) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* 1. Tiny Sync */}
          <SyncStatusIndicator
            isSyncing={isSyncing}
            currentUser={currentUser}
            onForceSync={onForceSync}
          />

          {/* 2. Theme Icon Button */}
          <ThemeToggle
            theme={theme}
            effectiveTheme={effectiveTheme}
            onThemeChange={onThemeChange}
          />

          {/* 3. Plan Chip: 28px height, blue border, no second brand color */}
          <button
            type="button"
            onClick={onOpenSubscriptionModal}
            className="h-7 px-2.5 rounded-lg border border-[#3B82F6] dark:border-[#3B82F6]/60 bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA] text-xs font-semibold hover:bg-[#3B82F6]/20 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Subscription status — Click to view plans"
          >
            {planLabel}
          </button>

          {/* Host Ledger Crown Shortcut (Only if whoami isHost) */}
          {isHostUser && onOpenHostAdminModal && (
            <button
              type="button"
              onClick={onOpenHostAdminModal}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-amber-500 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center justify-center"
              title="Host Ledger & Grants"
              aria-label="Host Ledger"
            >
              <Crown className="w-4 h-4 fill-amber-500/20" />
            </button>
          )}

          {/* 4. Gear Settings: 44px hit area */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-[#8BA3C7] hover:text-[#E8F1FF] hover:bg-[#1E3A5F]/40 border border-transparent hover:border-[#1E3A5F] transition-all flex items-center justify-center cursor-pointer"
            title="Settings, Tools & Account"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
