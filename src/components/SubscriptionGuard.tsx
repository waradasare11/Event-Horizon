import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Crown, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  QrCode,
  ArrowRight,
  RefreshCw,
  Gift
} from 'lucide-react';
import { UserProfile, UserSubscription } from '../types';
import { 
  computeSubscriptionStatus, 
  HOST_ADMIN_CONFIG, 
  isHostAdmin, 
  checkUserHostGrant, 
  createGrantedUserSubscription, 
  createHostLifetimeSubscription 
} from '../lib/subscription';
import { SubscriptionPaywallModal } from './SubscriptionPaywallModal';
import { AuthGateModal } from './AuthGateModal';
import { OnboardingModal } from './OnboardingModal';

interface SubscriptionGuardProps {
  userProfile: UserProfile;
  onUpdateSubscription: (sub: UserSubscription) => void;
  onSuccessAuth: (email: string, name: string) => void;
  onSaveProfile: (profile: UserProfile) => void;
  onExportData?: () => void;
  children: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  userProfile,
  onUpdateSubscription,
  onSuccessAuth,
  onSaveProfile,
  onExportData,
  children,
}) => {
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isCheckingGrant, setIsCheckingGrant] = useState(false);
  const [grantCheckNotice, setGrantCheckNotice] = useState<string | null>(null);

  // Proactive Grant Check on Mount / Email Change
  useEffect(() => {
    if (!userProfile.email) return;

    const email = userProfile.email.trim().toLowerCase();
    if (isHostAdmin(email)) {
      const hostSub = createHostLifetimeSubscription();
      if (userProfile.subscription?.paymentMethod !== 'HOST_LIFETIME_VIP') {
        onUpdateSubscription(hostSub);
        onSaveProfile({ ...userProfile, subscription: hostSub });
      }
      return;
    }

    checkUserHostGrant(email).then(({ hasGrant, grant }) => {
      if (hasGrant && grant) {
        const grantedSub = createGrantedUserSubscription(grant);
        if (
          userProfile.subscription?.paymentMethod !== 'MANUAL_GRANT' ||
          userProfile.subscription?.status !== 'active'
        ) {
          onUpdateSubscription(grantedSub);
          onSaveProfile({ ...userProfile, subscription: grantedSub });
        }
      }
    }).catch(console.warn);
  }, [userProfile.email]);

  const handleManualGrantCheck = async () => {
    if (!userProfile.email) return;
    setIsCheckingGrant(true);
    setGrantCheckNotice(null);
    try {
      const email = userProfile.email.trim().toLowerCase();
      const { hasGrant, isHost, grant } = await checkUserHostGrant(email);
      if (hasGrant) {
        const sub = isHost ? createHostLifetimeSubscription() : createGrantedUserSubscription(grant || { email });
        onUpdateSubscription(sub);
        onSaveProfile({ ...userProfile, subscription: sub });
        setGrantCheckNotice('🎉 VIP Free Subscription Verified! Unlocking AROH Pro...');
      } else {
        setGrantCheckNotice('No VIP grant found for this Gmail yet. Ask the Host to add your Gmail ID.');
      }
    } catch (err: any) {
      setGrantCheckNotice('Check failed. Please check network connection.');
    } finally {
      setIsCheckingGrant(false);
    }
  };

  // Compute live subscription status and days remaining
  const isHost = isHostAdmin(userProfile.email);
  const activeSub = isHost
    ? createHostLifetimeSubscription()
    : computeSubscriptionStatus(userProfile.subscription, userProfile.email);

  // Step 1: Authentication Check (strictly requires valid signed in email)
  const isAuthenticated = Boolean(userProfile.email && userProfile.email.includes('@'));
  
  // Step 2: Onboarding Completion Check
  const isOnboarded = Boolean(userProfile.isOnboarded);

  // Step 3: Subscription & Access Check
  const isTrialActive = activeSub.status === 'trial' && activeSub.daysRemaining > 0;
  const isPaidActive = (activeSub.status === 'active' && activeSub.daysRemaining > 0) || isHost;
  const hasAccess = isTrialActive || isPaidActive;

  // Step 1 Enforcement: If unauthenticated, render ONLY the AuthGateModal.
  // The dashboard is completely unmounted and zero background content is rendered.
  if (!isAuthenticated) {
    return (
      <AuthGateModal
        isOpen={true}
        onSuccessAuth={onSuccessAuth}
      />
    );
  }

  // Step 2 Enforcement: If authenticated but hasn't completed onboarding questions & plan selection,
  // render ONLY the full-screen interactive Onboarding questionnaire and goal prediction.
  // The dashboard remains completely unmounted.
  if (!isOnboarded) {
    return (
      <OnboardingModal
        isOpen={true}
        onClose={() => {}} // Mandatory gate; cannot dismiss without completing
        userProfile={userProfile}
        onSaveProfile={onSaveProfile}
        onExportData={onExportData}
      />
    );
  }

  // Step 3 Enforcement: If subscription expired, allow read-only access to dashboard logs
  // with a top warning banner and upgrade CTA. Sub-features (Scanner, Coach, AI plans, Form analyzer)
  // are restricted inside their respective components.
  const isExpired = !hasAccess;

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Top Banner for Expired Subscriptions */}
      {isExpired && (
        <div className="sticky top-0 z-50 bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 sm:py-2.5 flex items-center justify-between text-xs font-medium backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-xs">
              Trial expired. Your data is safe. Upgrade to continue using AI scanning and coaching.
            </span>
          </div>
          <button
            onClick={() => setIsPaywallOpen(true)}
            className="ml-3 shrink-0 px-3 py-1 rounded-xl bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            Upgrade — ₹89/mo
          </button>
        </div>
      )}

      {children}

      {/* Subscription Paywall Modal */}
      <SubscriptionPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        userProfile={userProfile}
        onSubscriptionUpdated={(sub) => {
          onUpdateSubscription(sub);
          setIsPaywallOpen(false);
        }}
      />
    </div>
  );
};
