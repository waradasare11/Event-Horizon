import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Check, 
  Copy, 
  QrCode, 
  Sparkles, 
  Lock, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Crown,
  CreditCard,
  Smartphone,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  SUBSCRIPTION_PLANS, 
  HOST_ADMIN_CONFIG, 
  generateUPILink, 
  getUPIQRCodeUrl, 
  validateUTRNumber, 
  recordPaymentTransaction,
  verifyPaymentWithBackendServer,
  fetchPersonalizedPlans,
  isHostAdmin,
  createHostLifetimeSubscription,
  createGrantedUserSubscription
} from '../lib/subscription';
import { SubscriptionPlanConfig, UserProfile, UserSubscription } from '../types';

interface SubscriptionPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSubscriptionUpdated: (updatedSub: UserSubscription) => void;
}

export const SubscriptionPaywallModal: React.FC<SubscriptionPaywallModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSubscriptionUpdated,
}) => {
  const [plansList, setPlansList] = useState<SubscriptionPlanConfig[]>(SUBSCRIPTION_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanConfig>(
    SUBSCRIPTION_PLANS.find((p) => p.id === '1_year') || SUBSCRIPTION_PLANS[1]
  );
  const [utrInput, setUtrInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      fetchPersonalizedPlans(userProfile.email).then((res) => {
        setPlansList(res.plans);
        const preferred = res.plans.find((p) => p.id === '1_year') || res.plans.find((p) => p.priceINR > 0) || res.plans[0];
        setSelectedPlan(preferred);
      });
    }
  }, [isOpen, userProfile.email]);

  if (!isOpen) return null;

  const isUserHost = isHostAdmin(userProfile.email);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(HOST_ADMIN_CONFIG.upiId);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(selectedPlan.priceINR.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);
    setIsVerifying(true);

    const validation = validateUTRNumber(utrInput);
    if (!validation.isValid) {
      setVerificationError(validation.error || 'Invalid UTR reference number.');
      setIsVerifying(false);
      return;
    }

    try {
      const res = await verifyPaymentWithBackendServer(
        userProfile,
        selectedPlan,
        utrInput
      );

      if (!res.success || !res.subscription) {
        setVerificationError(res.error || 'Payment verification failed against host gateway.');
        setIsVerifying(false);
        return;
      }

      setVerificationSuccess(true);
      setIsVerifying(false);
      onSubscriptionUpdated(res.subscription);
    } catch (err: any) {
      setVerificationError(err.message || 'Verification failed. Please retry.');
      setIsVerifying(false);
    }
  };

  const paidPlans = plansList.filter((p) => p.priceINR > 0);
  const upiDeepLink = generateUPILink(selectedPlan, userProfile.email);
  const qrCodeUrl = getUPIQRCodeUrl(selectedPlan, userProfile.email);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161817] rounded-3xl max-w-3xl w-full shadow-2xl border border-[#E5E7EB] dark:border-[#242826] overflow-hidden text-left my-6 transition-colors relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F6E5F] via-[#0D5B4F] to-[#0A473D] p-6 sm:p-7 text-white flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-emerald-200 border border-white/20">
              <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Official PeakForm AI Pro Subscription</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Unlock Unlimited Master Coaching
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Host & Verified Payee: <strong>{HOST_ADMIN_CONFIG.name}</strong> • Direct Zero-Fee UPI Gateway
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {verificationSuccess ? (
          /* Payment Verified Success State */
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                100% Verified & Authenticated
              </span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                Subscription Activated Successfully!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Thank you for subscribing to <strong>{selectedPlan.name}</strong>! Your payment of ₹{selectedPlan.priceINR} has been logged in our secure ledger.
              </p>
            </div>

            <div className="bg-[#FAFAF8] dark:bg-[#1A1D1C] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 max-w-md mx-auto text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Beneficiary Host:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{HOST_ADMIN_CONFIG.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">UPI ID:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{HOST_ADMIN_CONFIG.upiId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">UTR / Ref Number:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{utrInput}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Plan Duration:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedPlan.durationLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-[#0F6E5F] dark:text-[#2DD4BF] text-sm">₹{selectedPlan.priceINR}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Continue to PeakForm AI Pro
            </button>
          </div>
        ) : (
          /* Subscription Selection & QR Payment Form */
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* 1. Plan Tier Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                1. Select Your Subscription Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {paidPlans.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setVerificationError(null);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#0F6E5F] dark:border-[#2DD4BF] bg-[#0F6E5F]/5 dark:bg-[#2DD4BF]/10 shadow-sm'
                          : 'border-gray-200 dark:border-[#242826] bg-white dark:bg-[#1A1D1C] hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      {plan.bestValue && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase shadow-xs">
                          Best Value
                        </span>
                      )}
                      {plan.popular && !plan.bestValue && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#0F6E5F] text-white text-[10px] font-extrabold uppercase shadow-xs">
                          Most Popular
                        </span>
                      )}

                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {plan.durationLabel}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {plan.name}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-baseline justify-between">
                        <div>
                          <span className="text-xl font-black text-gray-900 dark:text-white">
                            ₹{plan.priceINR}
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 ml-1">
                            total
                          </span>
                        </div>
                        {plan.monthlyEquivalentINR && (
                          <span className="text-[11px] font-bold text-[#0F6E5F] dark:text-[#2DD4BF]">
                            ~₹{Math.round(plan.monthlyEquivalentINR)}/mo
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Free VIP Access Box if Price is ₹0 */}
            {selectedPlan.priceINR === 0 && (
              <div className="bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/15 p-6 rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-500/20 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <Crown className="w-6 h-6 text-amber-300 fill-amber-300" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-md">
                    Host VIP Pass Active
                  </span>
                  <h4 className="text-lg font-black text-gray-900 dark:text-white">
                    100% Free Lifetime Pro Access Granted
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                    Host <strong>Warad Asare</strong> has granted your Gmail ID (<strong>{userProfile.email}</strong>) full VIP membership. No payment, UPI transfer, or UTR entry is required!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setIsVerifying(true);
                    try {
                      const res = await verifyPaymentWithBackendServer(
                        userProfile,
                        selectedPlan,
                        'HOST_LIFETIME_GRANT'
                      );
                      if (res.subscription) {
                        setVerificationSuccess(true);
                        onSubscriptionUpdated(res.subscription);
                      }
                    } catch (e) {
                      const fallbackSub = isUserHost
                        ? createHostLifetimeSubscription()
                        : createGrantedUserSubscription({
                            id: `grant_${Date.now()}`,
                            email: userProfile.email || '',
                            planId: selectedPlan.id as any,
                            planName: selectedPlan.name,
                            isLifetime: true,
                            grantedAt: new Date().toISOString(),
                            expiresAt: '2099-12-31T23:59:59.000Z',
                            grantedBy: 'Warad Asare (Host VIP)',
                          });
                      onSubscriptionUpdated(fallbackSub);
                    } finally {
                      setIsVerifying(false);
                    }
                  }}
                  disabled={isVerifying}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isVerifying ? 'Activating VIP Membership...' : `Activate 100% Free ${selectedPlan.name} Now`}</span>
                </button>
              </div>
            )}

            {/* 2. QR Code & UPI Transfer Details */}
            {selectedPlan.priceINR > 0 && (
              <>
                <div className="bg-[#FAFAF8] dark:bg-[#1A1D1C] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-[#0F6E5F] dark:text-[#2DD4BF]" />
                      <span>2. Scan QR Code or Pay via UPI (Exact Amount: ₹{selectedPlan.priceINR})</span>
                    </label>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      0% Convenience Fee
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Visual QR Code */}
                    <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 shrink-0 text-center">
                      <img
                        src={qrCodeUrl}
                        alt={`UPI QR Code for ₹${selectedPlan.priceINR} to Warad Asare`}
                        referrerPolicy="no-referrer"
                        className="w-44 h-44 object-contain rounded-lg mx-auto"
                      />
                      <div className="mt-1 text-[10px] font-bold text-gray-600">
                        Scan with GPay / PhonePe / Paytm / BHIM
                      </div>
                    </div>

                    {/* Direct Pay Options */}
                    <div className="flex-1 space-y-3 w-full text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-700 space-y-1.5">
                        <div className="text-gray-500 dark:text-gray-400 font-semibold">Verified Host & Payee</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>{HOST_ADMIN_CONFIG.name}</span>
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                      </div>

                      {/* Copy UPI VPA */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-700">
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 font-semibold">Host UPI ID</div>
                          <div className="font-mono font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                            {HOST_ADMIN_CONFIG.upiId}
                          </div>
                        </div>
                        <button
                          onClick={handleCopyUPI}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedUPI ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-gray-500" />
                              <span>Copy UPI</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* 1-Tap Mobile UPI Trigger */}
                      <a
                        href={upiDeepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs transition-all text-xs"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Tap to Pay ₹{selectedPlan.priceINR} in UPI App (Mobile)</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. Anti-Scam UTR Verification Box */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    3. Enter 12-Digit UPI Reference Number (UTR) to Verify
                  </label>
                  
                  <form onSubmit={handleVerifyPayment} className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={12}
                        value={utrInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setUtrInput(val);
                          setVerificationError(null);
                        }}
                        placeholder="e.g. 423985123456 (12 digits)"
                        className="w-full text-sm font-mono tracking-wider p-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1D1C] text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0F6E5F]"
                      />
                      <div className="absolute right-3 top-3.5 text-xs font-semibold text-gray-400">
                        {utrInput.length}/12 digits
                      </div>
                    </div>

                    {verificationError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{verificationError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isVerifying || utrInput.length < 12}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>
                        {isVerifying ? 'Verifying Transaction with Host Gateway...' : `Verify UTR & Activate ${selectedPlan.durationLabel} Pro`}
                      </span>
                    </button>
                  </form>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Anti-Fraud Protection:</strong> Each UTR is cryptographically cross-checked against our ledger to guarantee exact recipient matching to <strong>Warad Asare</strong> (`9284160309@fam`). Submissions with duplicate or falsified references are automatically rejected.
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAFAF8] dark:bg-[#111312] border-t border-[#E5E7EB] dark:border-[#242826] text-[11px] text-[#6B7280] dark:text-[#9EA8A2] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Host Verified: Warad Asare (waradasare11@gmail.com)</span>
          </span>
          <span>100% Anti-Scam Guarantee</span>
        </div>
      </div>
    </div>
  );
};
