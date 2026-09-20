import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Crown,
  AlertCircle
} from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

interface AuthGateModalProps {
  isOpen: boolean;
  onSuccessAuth: (userEmail: string, userName: string) => void;
  onClose?: () => void;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  onSuccessAuth,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      const user = await signInWithGoogle();
      if (user && user.email) {
        onSuccessAuth(user.email, user.displayName || 'AROH Athlete');
      } else {
        setAuthError('Sign in requires a valid Google account with an email address.');
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setAuthError(err?.message || 'Google sign-in was closed or interrupted. Please click below to try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0E1424] rounded-3xl max-w-xl w-full shadow-2xl border border-[#E5E7EB] dark:border-[#1E293B] overflow-hidden text-left my-6 transition-colors relative flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-[#00D4FF] via-[#0369A1] to-[#083D34] p-6 sm:p-7 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-[#38BDF8] border border-white/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>1-Week Free Subscription Included on Sign In</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to AROH
          </h2>
          <p className="text-xs sm:text-sm text-[#F8FAFC]/90 mt-1 leading-relaxed max-w-xl">
            Sign in with your verified Google account to start your <strong>1-Week Free Trial</strong>. Complete your profile to calculate your personalized <strong>Goal Timeline Prediction</strong>, meal plans, and workout progression.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* Subscription Plans Showcase */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-cyan-400" />
                <span>Subscription Plans & Pricing (Post 1-Week Free Trial)</span>
              </label>
              <span className="text-[11px] font-bold text-[#0284C7] dark:text-[#38BDF8]">
                1st Week: ₹0 Free
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* 1 Week Free */}
              <div className="p-3 rounded-2xl bg-[#00D4FF]/10 border-2 border-[#00D4FF]/40 text-left relative space-y-1">
                <div className="inline-block px-1.5 py-0.5 rounded-full bg-[#0369A1] text-white text-[9px] font-black uppercase">
                  Included Free
                </div>
                <div className="text-xs font-black text-gray-900 dark:text-white">1-Week Trial</div>
                <div className="text-base font-extrabold text-[#0284C7] dark:text-[#38BDF8]">₹0</div>
                <div className="text-[10px] text-gray-500">7 Days Full Access</div>
              </div>

              {/* 1 Month */}
              <div className="p-3 rounded-2xl bg-[#FAFAF8] dark:bg-[#0E1424] border border-[#E5E7EB] dark:border-[#1E293B] text-left space-y-1">
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">1 Month</div>
                <div className="text-base font-black text-gray-900 dark:text-white">₹89</div>
                <div className="text-[10px] text-gray-500">₹89 / month</div>
              </div>

              {/* 3 Months */}
              <div className="p-3 rounded-2xl bg-[#FAFAF8] dark:bg-[#0E1424] border border-[#E5E7EB] dark:border-[#1E293B] text-left space-y-1">
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">3 Months</div>
                <div className="text-base font-black text-gray-900 dark:text-white">₹239</div>
                <div className="text-[10px] text-[#0284C7] dark:text-[#38BDF8] font-semibold">Save 11% (~₹79/mo)</div>
              </div>

              {/* 1 Year */}
              <div className="p-3 rounded-2xl bg-[#00D4FF]/10 border-2 border-[#00D4FF]/40 text-left relative space-y-1">
                <div className="inline-block px-1.5 py-0.5 rounded-full bg-[#00D4FF] text-white text-[9px] font-black uppercase">
                  Popular
                </div>
                <div className="text-xs font-black text-gray-900 dark:text-white">1 Year (12 Mo)</div>
                <div className="text-base font-black text-[#00D4FF] dark:text-[#38BDF8]">₹919</div>
                <div className="text-[10px] text-[#0284C7] dark:text-[#38BDF8] font-semibold">Save 14% (~₹76/mo)</div>
              </div>

              {/* 2 Years */}
              <div className="p-3 rounded-2xl bg-[#FAFAF8] dark:bg-[#0E1424] border border-[#E5E7EB] dark:border-[#1E293B] text-left space-y-1">
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">2 Years (24 Mo)</div>
                <div className="text-base font-black text-gray-900 dark:text-white">₹1820</div>
                <div className="text-[10px] text-gray-500">₹75.8 / month</div>
              </div>

              {/* 3 Years */}
              <div className="p-3 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/40 text-left relative space-y-1">
                <div className="inline-block px-1.5 py-0.5 rounded-full bg-amber-600 text-white text-[9px] font-black uppercase">
                  Best Value
                </div>
                <div className="text-xs font-black text-gray-900 dark:text-white">3 Years (36 Mo)</div>
                <div className="text-base font-black text-amber-600 dark:text-cyan-400">₹2700</div>
                <div className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">₹75.0 / month</div>
              </div>
            </div>
          </div>

          {/* Error Message if any */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google One-Tap Sign In */}
          <div className="pt-2">
            <button
              onClick={handleGoogleLogin}
              disabled={isSigningIn}
              className="w-full py-4 px-4 rounded-2xl bg-[#1A1D1B] dark:bg-white text-white dark:text-[#1A1D1B] hover:bg-black dark:hover:bg-gray-100 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-md cursor-pointer disabled:opacity-50"
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
            <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 mt-2.5">
              Secure authentication powered by Google Identity (Email & Profile only). Optional Google Drive backup can be connected anytime from Settings.
            </p>
          </div>
        </div>

        {/* Security Footer & Compliance Links */}
        <div className="px-6 py-3.5 bg-[#FAFAF8] dark:bg-[#0B0F1E] border-t border-[#E5E7EB] dark:border-[#1E293B] text-[11px] text-[#6B7280] dark:text-[#9EA8A2] flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>Encrypted Session • DPDP Act, 2023 Compliant</span>
          </span>
          <div className="flex items-center gap-2 font-medium">
            <a href="/privacy" className="hover:text-[#00D4FF] dark:hover:text-[#38BDF8] underline">Privacy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-[#00D4FF] dark:hover:text-[#38BDF8] underline">Terms</a>
            <span>•</span>
            <a href="/disclaimer" className="hover:text-amber-600 dark:hover:text-cyan-400 underline">Disclaimer</a>
            <span>•</span>
            <a href="/refund" className="hover:text-[#00D4FF] dark:hover:text-[#38BDF8] underline">Refunds</a>
          </div>
        </div>
      </div>
    </div>
  );
};
