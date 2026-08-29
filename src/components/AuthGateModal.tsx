import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Dumbbell, 
  Flame, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Mail, 
  UserCheck, 
  Calendar,
  AlertCircle,
  Crown,
  QrCode,
  IndianRupee,
  Check
} from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { UserProfile } from '../types';
import { createInitialTrialSubscription, HOST_ADMIN_CONFIG, SUBSCRIPTION_PLANS } from '../lib/subscription';
import { fireCelebrationConfetti } from '../lib/confetti';

interface AuthGateModalProps {
  isOpen: boolean;
  onSuccessAuth: (userEmail: string, userName: string) => void;
  onClose?: () => void;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  onSuccessAuth,
  onClose,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      const user = await signInWithGoogle();
      if (user) {
        fireCelebrationConfetti();
        onSuccessAuth(user.email || 'athlete@peakform.ai', user.displayName || 'PeakForm Athlete');
      }
    } catch (err: any) {
      console.warn('Google popup error, falling back to direct sign-in:', err);
      // If popup was blocked or sandbox environment prevents popup, allow smooth fallback
      setAuthError('Google popup was closed or restricted by browser. You can enter your name and email below to sign in instantly with full 7-day trial!');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    const cleanName = nameInput.trim() || 'PeakForm Athlete';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Please provide a valid email address to initialize your account and 7-day trial.');
      return;
    }

    fireCelebrationConfetti();
    onSuccessAuth(cleanEmail, cleanName);
  };

  const handleQuickDemoAccess = () => {
    fireCelebrationConfetti();
    onSuccessAuth('athlete.demo@peakform.ai', 'Champion Athlete');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#161817] rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E5E7EB] dark:border-[#242826] overflow-hidden text-left my-6 transition-colors relative flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-[#0F6E5F] via-[#0D5B4F] to-[#083D34] p-6 sm:p-7 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-emerald-200 border border-white/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>1-Week Free Subscription Included on Sign In</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to PeakForm AI
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed max-w-xl">
            Sign in to start your <strong>1-Week Free Trial</strong>. Complete your profile to calculate your personalized <strong>Goal Timeline Prediction</strong>, meal plans, and workout progression.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* Subscription Plans Showcase */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Subscription Plans & Pricing (Post 1-Week Free Trial)</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                1st Week: ₹0 Free
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* 1 Week Free */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-left relative space-y-1">
                <div className="inline-block px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase">
                  Included Free
                </div>
                <div className="text-xs font-black text-gray-900 dark:text-white">1-Week Trial</div>
                <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">₹0</div>
                <div className="text-[10px] text-gray-500">7 Days Full Access</div>
              </div>

              {/* 1 Month */}
              <div className="p-3 rounded-2xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] text-left space-y-1">
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">1 Month</div>
                <div className="text-base font-black text-gray-900 dark:text-white">₹89</div>
                <div className="text-[10px] text-gray-500">₹89 / month</div>
              </div>

              {/* 3 Months */}
              <div className="p-3 rounded-2xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] text-left space-y-1">
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">3 Months</div>
                <div className="text-base font-black text-gray-900 dark:text-white">₹239</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Save 11% (~₹79/mo)</div>
              </div>

              {/* 1 Year */}
              <div className="p-3 rounded-2xl bg-[#0F6E5F]/10 border-2 border-[#0F6E5F]/40 text-left relative space-y-1">
                <div className="inline-block px-1.5 py-0.5 rounded-full bg-[#0F6E5F] text-white text-[9px] font-black uppercase">
                  Popular
                </div>
                <div className="text-xs font-black text-gray-900 dark:text-white">1 Year (12 Mo)</div>
                <div className="text-base font-black text-[#0F6E5F] dark:text-[#2DD4BF]">₹919</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Save 14% (~₹76/mo)</div>
              </div>

              {/* 2 Years */}
              <div className="p-3 rounded-2xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] text-left space-y-1">
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">2 Years (24 Mo)</div>
                <div className="text-base font-black text-gray-900 dark:text-white">₹1820</div>
                <div className="text-[10px] text-gray-500">₹75.8 / month</div>
              </div>

              {/* 3 Years */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-left relative space-y-1">
                <div className="inline-block px-1.5 py-0.5 rounded-full bg-amber-600 text-white text-[9px] font-black uppercase">
                  Best Value
                </div>
                <div className="text-xs font-black text-gray-900 dark:text-white">3 Years (36 Mo)</div>
                <div className="text-base font-black text-amber-600 dark:text-amber-400">₹2700</div>
                <div className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">₹75.0 / month</div>
              </div>
            </div>
          </div>

          {/* Host Payment & QR Details */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 flex items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#0F6E5F] dark:text-[#2DD4BF]" />
                <span>Host: {HOST_ADMIN_CONFIG.name}</span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                Official FamApp UPI: <strong className="text-[#0F6E5F] dark:text-[#2DD4BF] font-mono">{HOST_ADMIN_CONFIG.upiId}</strong> • 100% Anti-Scam UTR Verification
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1D1C] border border-gray-200 dark:border-gray-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              ✓ Verified Host
            </div>
          </div>

          {/* Error Message if any */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google One-Tap Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={isSigningIn}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#1A1D1B] dark:bg-white text-white dark:text-[#1A1D1B] hover:bg-black dark:hover:bg-gray-100 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSigningIn ? 'Connecting to Google...' : 'Continue with Google (Instant 1-Week Free Trial)'}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-[1px] bg-[#E5E7EB] dark:bg-[#242826]" />
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase">Or Sign In with Email</span>
            <div className="flex-1 h-[1px] bg-[#E5E7EB] dark:bg-[#242826]" />
          </div>

          {/* Direct Email Form */}
          <form onSubmit={handleDirectLogin} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Warad Asare / Athlete"
                  className="w-full text-xs p-3 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-white dark:bg-[#1A1D1C] text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-hidden focus:ring-2 focus:ring-[#0F6E5F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="athlete@example.com"
                  className="w-full text-xs p-3 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-white dark:bg-[#1A1D1C] text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-hidden focus:ring-2 focus:ring-[#0F6E5F]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>Sign In & Start 1-Week Free Subscription</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant Demo Sandbox Shortcut */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleQuickDemoAccess}
              className="text-xs text-[#0F6E5F] dark:text-[#2DD4BF] hover:underline font-semibold cursor-pointer"
            >
              ⚡ Instant 1-Click Demo Athlete Sign-in (Auto-Grant 7-Day Trial)
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="px-6 py-3.5 bg-[#FAFAF8] dark:bg-[#111312] border-t border-[#E5E7EB] dark:border-[#242826] text-[11px] text-[#6B7280] dark:text-[#9EA8A2] flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Session • Host: Warad Asare (waradasare11@gmail.com)</span>
          </span>
          <span className="font-semibold text-[#0F6E5F] dark:text-[#2DD4BF]">PeakForm AI v2.4</span>
        </div>
      </div>
    </div>
  );
};

