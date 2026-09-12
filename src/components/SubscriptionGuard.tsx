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

  // Step 3 Enforcement: If subscription expired, render ONLY the lockscreen paywall.
  // Zero dashboard components are mounted.
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#111312] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#161817] p-8 rounded-3xl max-w-lg w-full border border-gray-200 dark:border-gray-800 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center mx-auto text-amber-500">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
              1-Week Free Trial Expired
            </span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              Renew Your AROH Pro Access
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Your 7-day free trial has concluded. Upgrade to Pro to continue your personalized workout and nutrition coaching.
            </p>
          </div>

          {grantCheckNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              {grantCheckNotice}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-gray-200 dark:border-gray-800 text-xs text-left space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">1 Month:</span>
              <strong className="text-gray-900 dark:text-white">₹89</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">3 Months:</span>
              <strong className="text-gray-900 dark:text-white">₹239 (Save 11%)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">1 Year:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">₹919 (Save 14% • Popular)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">2 Years:</span>
              <strong className="text-gray-900 dark:text-white">₹1820</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">3 Years:</span>
              <strong className="text-amber-600 dark:text-amber-400">₹2700 (Best Lifetime Value)</strong>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setIsPaywallOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan FamApp QR Code & Unlock Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleManualGrantCheck}
              disabled={isCheckingGrant}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-[#202422] hover:bg-emerald-500/10 hover:text-emerald-600 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-gray-200 dark:border-gray-800 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingGrant ? 'animate-spin text-emerald-500' : ''}`} />
              <span>{isCheckingGrant ? 'Verifying Host VIP Grant...' : 'Check Host VIP Free Pass'}</span>
            </button>
          </div>
        </div>

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
  }

  // All 3 conditions satisfied: Authenticated, Onboarded, and Active Subscription / Trial.
  return (
    <>
      {children}
      <SubscriptionPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        userProfile={userProfile}
        onSubscriptionUpdated={(sub) => {
          onUpdateSubscription(sub);
          setIsPaywallOpen(false);
        }}
      />
    </>
  );
};
