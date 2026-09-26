import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Crown,
  CreditCard,
  Ticket,
  Tag,
  Gift,
  ArrowRight,
  QrCode,
  Copy,
  Check,
  Send
} from 'lucide-react';
import { 
  SUBSCRIPTION_PLANS, 
  fetchPersonalizedPlans,
  isHostAdmin,
  createHostLifetimeSubscription,
  createGrantedUserSubscription,
  checkUserHostGrant,
  redeemHostCouponCode,
  getRazorpayConfig,
  createRazorpayOrder,
  verifyRazorpayPayment,
  RazorpayConfig,
  fetchUpiConfig,
  submitUpiPendingPayment
} from '../lib/subscription';
import { SubscriptionPlanConfig, UserProfile, UserSubscription, UpiConfigResponse } from '../types';
import { fireCelebrationConfetti } from '../lib/confetti';

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
  const allowedPlans = SUBSCRIPTION_PLANS.filter((p) => [89, 239, 919].includes(p.priceINR));
  const [plansList, setPlansList] = useState<SubscriptionPlanConfig[]>(allowedPlans);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanConfig>(
    allowedPlans.find((p) => p.priceINR === 239) || allowedPlans[0]
  );
  const [razorpayConfig, setRazorpayConfig] = useState<RazorpayConfig>({ isLive: false, keyId: null });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);

  const [hasHostGrant, setHasHostGrant] = useState<boolean>(false);
  const [grantDetails, setGrantDetails] = useState<any>(null);

  // Coupon Code Redemption State
  const [showCouponInput, setShowCouponInput] = useState<boolean>(false);
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [isRedeemingCoupon, setIsRedeemingCoupon] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // FamPay / Manual UPI Payment State
  const [upiConfig, setUpiConfig] = useState<UpiConfigResponse | null>(null);
  const [qrLoadError, setQrLoadError] = useState<boolean>(false);
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);
  const [isSubmittingUpiNotice, setIsSubmittingUpiNotice] = useState<boolean>(false);
  const [upiNoticeSuccess, setUpiNoticeSuccess] = useState<string | null>(null);
  const [upiNoticeError, setUpiNoticeError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 1. Fetch Razorpay config
      getRazorpayConfig().then(setRazorpayConfig).catch(() => {
        setRazorpayConfig({ isLive: false, keyId: null });
      });

      // 2. Fetch UPI configuration for FamPay / manual payment
      fetchUpiConfig().then((cfg) => {
        setUpiConfig(cfg);
      }).catch(() => {});

      // 3. Fetch personalized pricing (strictly constrained to ₹89, ₹239, ₹919)
      fetchPersonalizedPlans(userProfile.email).then((res) => {
        const filtered = res.plans.filter((p) => [89, 239, 919].includes(p.priceINR));
        const finalPlans = filtered.length > 0 ? filtered : allowedPlans;
        setPlansList(finalPlans);
        const preferred = finalPlans.find((p) => p.priceINR === 239) || finalPlans[0];
        setSelectedPlan(preferred);
      });

      // 4. Check direct host grant
      if (userProfile.email) {
        checkUserHostGrant(userProfile.email).then(({ hasGrant, grant }) => {
          if (hasGrant) {
            setHasHostGrant(true);
            setGrantDetails(grant);
          }
        }).catch(console.warn);
      }
    }
  }, [isOpen, userProfile.email]);

  if (!isOpen) return null;

  const isUserHost = isHostAdmin(userProfile.email);

  // Razorpay Checkout Trigger
  const handleRazorpayCheckout = async () => {
    if (!razorpayConfig.isLive || !razorpayConfig.keyId) {
      return;
    }
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const orderData = await createRazorpayOrder(
        selectedPlan.id,
        userProfile.email || '',
        userProfile.name || 'AROH Athlete'
      );

      if (!orderData.success || !orderData.order) {
        setPaymentError(orderData.error || 'Unable to initiate Razorpay checkout order.');
        setIsProcessingPayment(false);
        return;
      }

      // Load Razorpay checkout script dynamically if needed
      const loadScript = () => {
        return new Promise<boolean>((resolve) => {
          if ((window as any).Razorpay) return resolve(true);
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const scriptLoaded = await loadScript();
      if (!scriptLoaded) {
        setPaymentError('Unable to load payment gateway SDK. Please check your network connection.');
        setIsProcessingPayment(false);
        return;
      }

      const options = {
        key: razorpayConfig.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'AROH Pro',
        description: `${selectedPlan.name} (${selectedPlan.durationLabel})`,
        order_id: orderData.order.id,
        prefill: {
          name: userProfile.name || '',
          email: userProfile.email || '',
        },
        theme: {
          color: '#3B82F6',
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: selectedPlan.id,
              userEmail: userProfile.email || '',
              userName: userProfile.name || '',
            });

            if (verifyRes.success && verifyRes.subscription) {
              fireCelebrationConfetti();
              setVerificationSuccess(true);
              onSubscriptionUpdated(verifyRes.subscription);
            } else {
              setPaymentError(verifyRes.error || 'Payment signature verification failed.');
            }
          } catch (e: any) {
            setPaymentError(e.message || 'Payment verification failed.');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setPaymentError(err.message || 'Payment initiation error.');
      setIsProcessingPayment(false);
    }
  };

  // Handle Coupon Code Redemption
  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const code = couponCodeInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const email = userProfile.email || '';
    if (!email) {
      setCouponError('Active user email is required to claim coupon.');
      return;
    }

    setIsRedeemingCoupon(true);

    try {
      const res = await redeemHostCouponCode(code, email, userProfile.name || 'AROH Athlete');
      if (!res.success || !res.subscription) {
        setCouponError(res.error || 'Invalid or expired coupon code.');
        setIsRedeemingCoupon(false);
        return;
      }

      fireCelebrationConfetti();
      setCouponSuccess(`Coupon code "${code}" verified & redeemed for ${res.subscription.planName}!`);
      setVerificationSuccess(true);
      onSubscriptionUpdated(res.subscription);
    } catch (err: any) {
      setCouponError(err.message || 'Failed to redeem coupon.');
    } finally {
      setIsRedeemingCoupon(false);
    }
  };

  // Handle "I've paid — notify host" for FamPay / Manual UPI payment
  const handleNotifyHostPaid = async () => {
    setUpiNoticeError(null);
    setUpiNoticeSuccess(null);

    const email = (userProfile.email || '').trim().toLowerCase();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setUpiNoticeError('Valid signed-in athlete email required to notify host.');
      return;
    }

    if (![89, 239, 919].includes(selectedPlan.priceINR)) {
      setUpiNoticeError('Invalid plan price. Please select an official plan.');
      return;
    }

    setIsSubmittingUpiNotice(true);
    try {
      const res = await submitUpiPendingPayment({
        userEmail: email,
        userName: userProfile.name || '',
        planId: selectedPlan.id,
        amountINR: selectedPlan.priceINR,
      });

      if (res.success) {
        setUpiNoticeSuccess('Host notified. Keep your trial. Pro starts after they confirm the payment.');
      } else {
        setUpiNoticeError(res.error || 'Failed to notify host. Please try again.');
      }
    } catch (err: any) {
      setUpiNoticeError(err?.message || 'Failed to submit payment notice.');
    } finally {
      setIsSubmittingUpiNotice(false);
    }
  };

  // FamPay / UPI Manual Payment Block
  const renderUpiPaymentBlock = (isSecondary: boolean) => (
    <div className="bg-[#FAFAF8] dark:bg-[#111111] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <QrCode className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />
          <span>{isSecondary ? 'Or pay with UPI (manual confirm)' : 'Pay with UPI (manual confirm)'}</span>
        </label>
        <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] bg-[#3B82F6]/10 px-2 py-0.5 rounded">
          FamPay / UPI QR
        </span>
      </div>

      {/* Plan Details & Exact Amount */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Plan:</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {selectedPlan.name} ({selectedPlan.durationLabel})
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Exact Amount to Pay:</span>
          <span className="font-black text-[#3B82F6] dark:text-[#60A5FA] text-base">
            ₹{selectedPlan.priceINR}
          </span>
        </div>
        {upiConfig?.vpa && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-gray-500">UPI ID:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white select-all">
                {upiConfig.vpa}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (upiConfig.vpa) {
                  navigator.clipboard.writeText(upiConfig.vpa);
                  setCopiedVpa(true);
                  setTimeout(() => setCopiedVpa(false), 2000);
                }
              }}
              className="px-3 py-2 rounded-xl bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#2563EB] dark:text-[#60A5FA] font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors shrink-0 min-h-[44px] min-w-[44px]"
            >
              {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedVpa ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Large QR */}
      <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#161817] rounded-2xl border border-gray-200 dark:border-gray-700 mx-auto text-center">
        {qrLoadError ? (
          <div className="w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center text-center p-4 text-xs text-gray-500 dark:text-gray-400">
            <QrCode className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="font-bold text-gray-700 dark:text-gray-300">Host has not uploaded a UPI QR yet</p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={upiConfig?.qrUrl || '/upi-qr.png'}
              alt="Pay with UPI"
              onError={() => setQrLoadError(true)}
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl min-w-[44px] min-h-[44px] mx-auto p-1 bg-white cursor-pointer shadow-xs"
            />
          </div>
        )}
      </div>

      {/* Verbatim Copy */}
      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-gray-700 dark:text-gray-300 text-xs space-y-1 leading-relaxed">
        <p className="font-semibold text-gray-900 dark:text-white">
          Pay the exact amount above in FamPay, GPay, PhonePe, or any UPI app.
        </p>
        <p>
          Pro is switched on by the host after the payment appears in FamPay.
        </p>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Do not send a UTR or screenshot here.
        </p>
      </div>

      {/* Error Feedback */}
      {upiNoticeError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{upiNoticeError}</span>
        </div>
      )}

      {/* Success Toast / Feedback */}
      {upiNoticeSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
          <span className="font-semibold leading-relaxed">{upiNoticeSuccess}</span>
        </div>
      )}

      {/* "I've paid — notify host" Button */}
      <button
        type="button"
        onClick={handleNotifyHostPaid}
        disabled={isSubmittingUpiNotice}
        className="w-full py-3.5 px-4 rounded-xl bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
      >
        <Send className="w-4 h-4 text-white" />
        <span>
          {isSubmittingUpiNotice ? 'Notifying Host...' : "I've paid — notify host"}
        </span>
      </button>
    </div>
  );

  const rawPlans = plansList && plansList.length > 0 ? plansList : SUBSCRIPTION_PLANS;
  const displayPlans = rawPlans.filter((p) => [89, 239, 919].includes(p.priceINR));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111111] rounded-3xl max-w-3xl w-full shadow-2xl border border-[#E5E7EB] dark:border-[#1E3A5F] overflow-hidden text-left my-6 transition-colors relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A5F] via-[#1D4ED8] to-[#3B82F6] p-6 sm:p-7 text-white flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-[#60A5FA] border border-white/20">
              <Crown className="w-3.5 h-3.5 text-[#60A5FA] fill-[#60A5FA]" />
              <span>Official AROH Pro Membership</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Unlock Unlimited Master Coaching
            </h2>
            <p className="text-xs sm:text-sm text-[#F4EBD0]/90 max-w-xl">
              Personalized workout logs, precision nutrition tracking, and biochemical AI analysis
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
            <div className="w-20 h-20 mx-auto rounded-full bg-[#3B82F6]/10 border-2 border-[#3B82F6] flex items-center justify-center text-[#3B82F6] shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#3B82F6]/20 text-[#2563EB] dark:text-[#60A5FA] border border-[#3B82F6]/30">
                Verified &amp; Authenticated
              </span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                Subscription Activated Successfully!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Thank you for subscribing to <strong>{selectedPlan.name}</strong>! Your account has full, unrestricted access to all AROH Pro features.
              </p>
            </div>

            <div className="bg-[#FAFAF8] dark:bg-[#111111] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 max-w-md mx-auto text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan Duration:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedPlan.durationLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-bold text-[#3B82F6] dark:text-[#60A5FA]">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-bold text-[#3B82F6] dark:text-[#60A5FA] text-sm">₹{selectedPlan.priceINR}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Continue to AROH Pro
            </button>
          </div>
        ) : (
          /* Subscription Selection & Payment View */
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* 1. Plan Tier Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  1. Select Your Subscription Tier
                </label>
                {hasHostGrant && (
                  <span className="text-xs font-black text-[#3B82F6] dark:text-[#60A5FA] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>VIP Free Pass Available</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {displayPlans.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  const isFree = plan.priceINR === 0;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setPaymentError(null);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? isFree 
                            ? 'border-[#3B82F6] bg-[#3B82F6]/10 shadow-sm'
                            : 'border-[#3B82F6] dark:border-[#60A5FA] bg-[#3B82F6]/5 dark:bg-[#60A5FA]/10 shadow-sm'
                          : 'border-gray-200 dark:border-[#1E3A5F] bg-white dark:bg-[#111111] hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      {isFree && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-black uppercase shadow-xs">
                          100% Free
                        </span>
                      )}
                      {!isFree && plan.bestValue && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#3B82F6] text-white text-[10px] font-extrabold uppercase shadow-xs">
                          Best Value
                        </span>
                      )}
                      {!isFree && plan.popular && !plan.bestValue && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#3B82F6] text-white text-[10px] font-extrabold uppercase shadow-xs">
                          Most Popular
                        </span>
                      )}

                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
                          <span>{plan.durationLabel}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {plan.name}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-baseline justify-between">
                        <div>
                          <span className={`text-xl font-black ${isFree ? 'text-[#3B82F6] dark:text-[#60A5FA]' : 'text-gray-900 dark:text-white'}`}>
                            {isFree ? '₹0 FREE' : `₹${plan.priceINR}`}
                          </span>
                          {!isFree && (
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 ml-1">
                              total
                            </span>
                          )}
                        </div>
                        {plan.monthlyEquivalentINR && !isFree && (
                          <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA]">
                            ~₹{Math.round(plan.monthlyEquivalentINR)}/mo
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Free VIP Access Box ONLY if host grant is verified from server */}
            {hasHostGrant && grantDetails && (
              <div className="bg-gradient-to-br from-[#3B82F6]/15 via-[#3B82F6]/10 to-[#60A5FA]/15 p-6 rounded-2xl border-2 border-[#3B82F6]/40 dark:border-[#3B82F6]/20 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center mx-auto shadow-md">
                  <Crown className="w-6 h-6 text-[#60A5FA] fill-[#60A5FA]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-[#3B82F6] dark:text-[#60A5FA] bg-[#3B82F6]/20 px-2.5 py-1 rounded-md">
                    Host VIP Free Access Unlocked
                  </span>
                  <h4 className="text-lg font-black text-gray-900 dark:text-white">
                    {grantDetails?.isLifetime 
                      ? 'Complimentary Lifetime Pro Access Granted' 
                      : `Complimentary VIP Access Granted (${grantDetails?.planName || selectedPlan.name})`}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                    Administrator has granted your Gmail ID (<strong>{userProfile.email}</strong>) full VIP membership.
                    {grantDetails?.isLifetime 
                      ? ' Lifetime access is active!' 
                      : ` Valid for ${grantDetails?.durationDays || 90} days.`} No payment required!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isUserHost) {
                      const hostSub = createHostLifetimeSubscription();
                      setVerificationSuccess(true);
                      onSubscriptionUpdated(hostSub);
                    } else if (grantDetails) {
                      const grantedSub = createGrantedUserSubscription(grantDetails);
                      setVerificationSuccess(true);
                      onSubscriptionUpdated(grantedSub);
                    }
                  }}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#60A5FA]" />
                  <span>Activate Complimentary VIP Pro Access Now</span>
                </button>
              </div>
            )}

            {/* Promo / Coupon Code Redemption Accordion */}
            <div className="pt-2">
              <div className="rounded-2xl border border-dashed border-[#3B82F6]/40 bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                    <span className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                      Have a VIP Coupon Voucher?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCouponInput(!showCouponInput)}
                    className="text-xs font-extrabold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer"
                  >
                    {showCouponInput ? 'Hide Coupon Box' : 'Enter Code'}
                  </button>
                </div>

                {showCouponInput && (
                  <form onSubmit={handleRedeemCoupon} className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. AROH-PRO2026"
                          value={couponCodeInput}
                          onChange={(e) => {
                            setCouponCodeInput(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-xs font-mono font-bold text-gray-900 dark:text-white uppercase outline-hidden focus:ring-2 focus:ring-[#3B82F6]"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isRedeemingCoupon || !couponCodeInput.trim()}
                        className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isRedeemingCoupon ? (
                          <span>Verifying...</span>
                        ) : (
                          <>
                            <Gift className="w-3.5 h-3.5" />
                            <span>Redeem Free Access</span>
                          </>
                        )}
                      </button>
                    </div>

                    {couponError && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{couponError}</span>
                      </div>
                    )}

                    {couponSuccess && (
                      <div className="p-2.5 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#2563EB] dark:text-[#60A5FA] text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#3B82F6]" />
                        <span>{couponSuccess}</span>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* 2. Razorpay Payment Gateway or Payments Coming Soon */}
            {selectedPlan.priceINR > 0 && (
              <div className="space-y-5">
                {razorpayConfig.isLive ? (
                  <>
                    {/* Razorpay Live Checkout View */}
                    <div className="bg-[#FAFAF8] dark:bg-[#111111] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />
                          <span>2. Complete Checkout via Razorpay</span>
                        </label>
                        <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] bg-[#3B82F6]/10 px-2 py-0.5 rounded">
                          Encrypted 256-Bit SSL
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Selected Plan:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedPlan.name} ({selectedPlan.durationLabel})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Amount Due:</span>
                          <span className="font-bold text-[#3B82F6] dark:text-[#60A5FA] text-sm">₹{selectedPlan.priceINR}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Payment Methods:</span>
                          <span>UPI, Cards, NetBanking, Wallets</span>
                        </div>
                      </div>

                      {paymentError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{paymentError}</span>
                        </div>
                      )}

                      <button
                        onClick={handleRazorpayCheckout}
                        disabled={isProcessingPayment}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4 text-white" />
                        <span>
                          {isProcessingPayment ? 'Connecting to Razorpay...' : `Pay ₹${selectedPlan.priceINR} via Razorpay`}
                        </span>
                      </button>
                    </div>

                    {/* Or pay with UPI (manual confirm) */}
                    {renderUpiPaymentBlock(true)}
                  </>
                ) : (
                  <>
                    {/* Payments Coming Soon Banner (Razorpay not configured) */}
                    <div className="bg-gradient-to-br from-[#00D4FF]/10 via-[#3B82F6]/5 to-[#00D4FF]/10 p-5 rounded-2xl border border-[#00D4FF]/20 text-center space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#00D4FF]/20 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0369A1] dark:text-[#38BDF8] bg-[#00D4FF]/20 px-2.5 py-0.5 rounded-md">
                          Payments coming soon
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white pt-1">
                          Automated Razorpay Gateway Setup in Progress
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                          Automated online checkout is being prepared. You can pay via our official FamPay UPI QR below and notify the host, or continue your trial.
                        </p>
                      </div>
                    </div>

                    {/* Pay with UPI (manual confirm) */}
                    {renderUpiPaymentBlock(false)}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAFAF8] dark:bg-[#070707] border-t border-[#E5E7EB] dark:border-[#1E3A5F] text-[11px] text-[#6B7280] dark:text-[#9EA8A2] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>AROH Pro • Encrypted 256-Bit SSL Checkout</span>
          </span>
          <span>7-Day Risk-Free Guarantee</span>
        </div>
      </div>
    </div>
  );
};
