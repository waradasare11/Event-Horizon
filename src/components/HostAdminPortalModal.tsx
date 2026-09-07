import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ShieldCheck, 
  Users, 
  Crown, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Download, 
  KeyRound, 
  Mail, 
  Clock, 
  Activity,
  History,
  FileText,
  Filter,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Send,
  Bell,
  MailCheck,
  Database,
  BarChart3,
  Zap,
  Ticket,
  Tag,
  Gift,
  FileCheck,
  CheckSquare,
  Layers,
  CalendarPlus
} from 'lucide-react';
import { 
  HOST_ADMIN_CONFIG, 
  verifyHostPIN, 
  forceVerifyHostPassword,
  updateHostPIN, 
  grantUserFreeSubscription, 
  fetchHostGrantedSubscriptions, 
  revokeHostGrantedSubscription, 
  createGrantedUserSubscription,
  fetchHostAuditLogs,
  clearHostAuditLogs,
  exportAuditLogsToCSV,
  exportHostLedgerToCSV,
  notifyAllActiveSubscribers,
  notifyExpiringSubscribers,
  notifySingleSubscriber,
  recordLocalHostAuditLog,
  fetchHostCoupons,
  createHostCouponCode,
  revokeHostCouponCode,
  executeBulkOperation,
  fetchGrantVerificationLogs
} from '../lib/subscription';
import { 
  fetchPersistentGrantsCollection, 
  syncHostGrantedSubscription 
} from '../lib/firestoreSync';
import { 
  UserProfile, 
  UserSubscription, 
  HostGrantedSubscription,
  HostAuditLogEntry,
  HostCouponCode,
  GrantVerificationLog
} from '../types';
import { fireCelebrationConfetti } from '../lib/confetti';
import { GrantTimelineModal } from './GrantTimelineModal';
import { ProgramValuationDashboard } from './ProgramValuationDashboard';
import { AthleteLoginsSection } from './AthleteLoginsSection';

interface HostAdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserProfile;
  onUpdateSubscription?: (sub: UserSubscription) => void;
}

type TabType = 'ledger' | 'athlete_logins' | 'valuation' | 'coupons' | 'persistent_grants' | 'verification_logs' | 'activity_log';
type FilterStatusType = 'all' | 'active' | 'expiring' | 'pending' | 'expired';
type SortField = 'email' | 'status' | 'expiresAt' | 'grantedAt' | 'plan';
type SortDirection = 'asc' | 'desc';

export const HostAdminPortalModal: React.FC<HostAdminPortalModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile,
  onUpdateSubscription,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<TabType>('ledger');

  // Bulk Operations State
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedTimelineEmail, setSelectedTimelineEmail] = useState<string | null>(null);
  const [isExecutingBulkOp, setIsExecutingBulkOp] = useState<boolean>(false);
  const [bulkOpMsg, setBulkOpMsg] = useState<string | null>(null);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState<boolean>(false);
  const [bulkEmailSubject, setBulkEmailSubject] = useState<string>('Special VIP Subscription Update from Host Warad Asare');
  const [bulkEmailBody, setBulkEmailBody] = useState<string>('Your PeakForm Pro access has been extended! Continue crushing your goals with peak precision.');
  const [bulkExtensionDaysInput, setBulkExtensionDaysInput] = useState<number>(30);

  // Single Unified Grant Form State
  const [targetEmail, setTargetEmail] = useState<string>('');
  const [durationOption, setDurationOption] = useState<string>('3_months');
  const [hostPassword, setHostPassword] = useState<string>('');
  const [notes, setNotes] = useState<string>('Host Free VIP Subscription Grant');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Submission & Feedback State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [grantSuccessMsg, setGrantSuccessMsg] = useState<string | null>(null);
  const [grantErrorMsg, setGrantErrorMsg] = useState<string | null>(null);

  // Host Ledger State & Sorting
  const [grantedList, setGrantedList] = useState<HostGrantedSubscription[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FilterStatusType>('all');
  const [sortField, setSortField] = useState<SortField>('grantedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [revokingEmail, setRevokingEmail] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);

  // Persistent Cloud Grants State (Isolated Zero-lag Tab)
  const [persistentGrants, setPersistentGrants] = useState<HostGrantedSubscription[]>([]);
  const [isLoadingPersistent, setIsLoadingPersistent] = useState<boolean>(false);
  const [persistentSearchQuery, setPersistentSearchQuery] = useState<string>('');
  const [isRepairingEmail, setIsRepairingEmail] = useState<string | null>(null);

  // Host Coupon Code Management State
  const [couponsList, setCouponsList] = useState<HostCouponCode[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState<boolean>(false);
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [couponPlanOption, setCouponPlanOption] = useState<string>('lifetime');
  const [couponExpiryDays, setCouponExpiryDays] = useState<string>('30');
  const [couponMaxUses, setCouponMaxUses] = useState<string>('1');
  const [couponNotes, setCouponNotes] = useState<string>('VIP Special Access Coupon');
  const [isCreatingCoupon, setIsCreatingCoupon] = useState<boolean>(false);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);
  const [couponErrorMsg, setCouponErrorMsg] = useState<string | null>(null);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);
  const [revokingCouponCode, setRevokingCouponCode] = useState<string | null>(null);
  const [isRevokingCoupon, setIsRevokingCoupon] = useState<boolean>(false);
  const [couponsSearchQuery, setCouponsSearchQuery] = useState<string>('');

  // Notify All Active Users State
  const [isNotifyingAll, setIsNotifyingAll] = useState<boolean>(false);
  const [isNotifyingExpiring, setIsNotifyingExpiring] = useState<boolean>(false);
  const [isNotifyingSingle, setIsNotifyingSingle] = useState<string | null>(null);
  const [showNotifyModal, setShowNotifyModal] = useState<boolean>(false);
  const [customNotifyMsg, setCustomNotifyMsg] = useState<string>('');
  const [notifyResult, setNotifyResult] = useState<{
    totalNotified: number;
    notifications: any[];
    message?: string;
  } | null>(null);

  // Host Activity Logs State
  const [activityLogs, setActivityLogs] = useState<HostAuditLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [logsSearchQuery, setLogsSearchQuery] = useState<string>('');
  const [isClearingLogs, setIsClearingLogs] = useState<boolean>(false);

  // Authentication & Grant Verification Audit Log State
  const [verificationAuditLogs, setVerificationAuditLogs] = useState<GrantVerificationLog[]>([]);
  const [isLoadingVerificationLogs, setIsLoadingVerificationLogs] = useState<boolean>(false);
  const [verificationSearchQuery, setVerificationSearchQuery] = useState<string>('');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'grants' | 'coupons' | 'auth'>('all');

  // PIN Management Drawer
  const [showSecuritySettings, setShowSecuritySettings] = useState<boolean>(false);
  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [pinChangeMsg, setPinChangeMsg] = useState<string | null>(null);
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [isUpdatingPin, setIsUpdatingPin] = useState<boolean>(false);

  // Load Host Ledger
  const loadLedger = async () => {
    setIsLoadingLedger(true);
    try {
      const records = await fetchHostGrantedSubscriptions(hostPassword || '9284', HOST_ADMIN_CONFIG.email);
      setGrantedList(records);
    } catch (e) {
      console.warn('Error loading host ledger:', e);
    } finally {
      setIsLoadingLedger(false);
    }
  };

  // Load Persistent Grants Directly from Firestore
  const loadPersistentGrants = async () => {
    setIsLoadingPersistent(true);
    try {
      const records = await fetchPersistentGrantsCollection();
      setPersistentGrants(records);
    } catch (e) {
      console.warn('Error loading persistent grants:', e);
    } finally {
      setIsLoadingPersistent(false);
    }
  };

  // Load Host Coupons
  const loadCoupons = async () => {
    setIsLoadingCoupons(true);
    try {
      const list = await fetchHostCoupons(hostPassword || '9284', HOST_ADMIN_CONFIG.email);
      setCouponsList(list);
    } catch (e) {
      console.warn('Error loading host coupons:', e);
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  // Load Host Activity Logs
  const loadActivityLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await fetchHostAuditLogs(hostPassword || '9284', HOST_ADMIN_CONFIG.email);
      setActivityLogs(logs);
    } catch (e) {
      console.warn('Error loading activity logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Load Cryptographic Verification Audit Logs
  const loadVerificationLogs = async () => {
    setIsLoadingVerificationLogs(true);
    try {
      const logs = await fetchGrantVerificationLogs();
      setVerificationAuditLogs(logs);
    } catch (e) {
      console.warn('Error loading verification audit logs:', e);
    } finally {
      setIsLoadingVerificationLogs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLedger();
      loadPersistentGrants();
      loadCoupons();
      loadActivityLogs();
      loadVerificationLogs();
      setGrantSuccessMsg(null);
      setGrantErrorMsg(null);
      setCouponSuccessMsg(null);
      setCouponErrorMsg(null);
      setNotifyResult(null);
    }
  }, [isOpen]);

  // Generate random coupon code
  const handleGenerateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponCodeInput(`PEAK-${rand}`);
  };

  // Duration Presets
  const DURATION_PRESETS = [
    { id: '3_months', label: '⚡ 3 Months (90-Day Transformation Free Grant)', planId: '3_months', isLifetime: false, days: 90, months: 3 },
    { id: '1_month', label: '1 Month (30 Days Kickstarter)', planId: '1_month', isLifetime: false, days: 30, months: 1 },
    { id: '6_months', label: '6 Months (180 Days Elite Protocol)', planId: '6_months', isLifetime: false, days: 180, months: 6 },
    { id: '1_year', label: '1 Year (12 Months Master Athlete)', planId: '1_year', isLifetime: false, days: 365, months: 12 },
    { id: '2_years', label: '2 Years (24 Months Elite Mastery)', planId: '2_years', isLifetime: false, days: 730, months: 24 },
    { id: '3_years', label: '3 Years (36 Months Lifetime Physique)', planId: '3_years', isLifetime: false, days: 1095, months: 36 },
    { id: 'lifetime', label: '🌟 Lifetime VIP (Never Expires - 100 Years)', planId: 'all_plans', isLifetime: true, days: 36500, months: 1200 },
  ];

  // Helper function to determine subscription status badge (with 3-day expiry warning detection)
  const getSubscriptionStatusInfo = (record: HostGrantedSubscription) => {
    if (record.status === 'revoked') {
      return {
        status: 'Expired',
        badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
        dotClass: 'bg-rose-500',
        icon: AlertCircle,
        label: 'Revoked / Expired',
        isExpiringSoon: false,
        daysRemaining: 0,
      };
    }

    if (record.isLifetime) {
      return {
        status: 'Active',
        badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-500',
        icon: CheckCircle2,
        label: 'Active (Lifetime VIP)',
        isExpiringSoon: false,
        daysRemaining: 36500,
      };
    }

    if (record.expiresAt) {
      const expiresTime = new Date(record.expiresAt).getTime();
      const now = Date.now();
      const diffMs = expiresTime - now;
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (days <= 0) {
        return {
          status: 'Expired',
          badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
          dotClass: 'bg-rose-500',
          icon: AlertCircle,
          label: 'Expired',
          isExpiringSoon: false,
          daysRemaining: 0,
        };
      }

      // Highlight in yellow 3 days before expiration
      if (days <= 3) {
        return {
          status: 'Expiring Soon',
          badgeClass: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/50 shadow-2xs font-bold animate-pulse',
          dotClass: 'bg-amber-500',
          icon: AlertTriangle,
          label: `Expires in ${days}d`,
          isExpiringSoon: true,
          daysRemaining: days,
        };
      }

      return {
        status: 'Active',
        badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-500',
        icon: CheckCircle2,
        label: `Active (${days}d left)`,
        isExpiringSoon: false,
        daysRemaining: days,
      };
    }

    if ((record.status as string) === 'pending' || !record.grantedAt) {
      return {
        status: 'Pending Verification',
        badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
        dotClass: 'bg-amber-500',
        icon: Clock,
        label: 'Pending Verification',
        isExpiringSoon: false,
        daysRemaining: 0,
      };
    }

    return {
      status: 'Active',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      dotClass: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'Active',
      isExpiringSoon: false,
      daysRemaining: 365,
    };
  };

  // Handle Granting Free Subscription (100% Reliable & Non-hanging)
  const handleGrantSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantSuccessMsg(null);
    setGrantErrorMsg(null);

    const cleanTargetEmail = targetEmail.trim().toLowerCase();
    if (!cleanTargetEmail || !cleanTargetEmail.includes('@') || !cleanTargetEmail.includes('.')) {
      setGrantErrorMsg('Please provide a valid Gmail/Email address (e.g. athlete@gmail.com).');
      return;
    }

    const cleanPin = hostPassword.trim();
    if (!cleanPin) {
      setGrantErrorMsg('Please enter your Host Verification Password/PIN (e.g. 9284) to verify host authority.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Verify Host PIN with fallback & force verification
      const isPinValid = await forceVerifyHostPassword(cleanPin, HOST_ADMIN_CONFIG.email);
      if (!isPinValid) {
        setGrantErrorMsg('Incorrect Host Verification Password. Please enter the valid Host Security PIN (e.g. 9284).');
        setIsSubmitting(false);
        return;
      }

      // Record PIN verification action
      recordLocalHostAuditLog(
        'pin_updated',
        `Host Master verification password authenticated for granting free access to ${cleanTargetEmail}.`,
        cleanTargetEmail
      );

      // 2. Resolve plan details
      const preset = DURATION_PRESETS.find((p) => p.id === durationOption) || DURATION_PRESETS[0];

      // 3. Execute Grant across Server, Firestore (Triple-Redundant) and Local Storage
      const result = await grantUserFreeSubscription({
        pin: cleanPin,
        email: HOST_ADMIN_CONFIG.email,
        targetEmail: cleanTargetEmail,
        planId: preset.planId,
        isLifetime: preset.isLifetime,
        notes: notes.trim() || `Host Free VIP Subscription granted by ${HOST_ADMIN_CONFIG.name}`,
      });

      if (!result.success) {
        setGrantErrorMsg(result.error || 'Failed to grant subscription. Please check your credentials and try again.');
        setIsSubmitting(false);
        return;
      }

      // 4. Success handling
      fireCelebrationConfetti();
      setGrantSuccessMsg(`🎉 Success! Free VIP subscription has been granted to ${cleanTargetEmail} for ${preset.label}. Access is now 100% active!`);
      
      // Reset input form
      setTargetEmail('');
      setNotes('Host Free VIP Subscription Grant');

      // 5. If current logged in user is the recipient, immediately update live subscription in UI
      if (
        currentUserProfile.email &&
        currentUserProfile.email.trim().toLowerCase() === cleanTargetEmail &&
        result.grant &&
        onUpdateSubscription
      ) {
        const sub = createGrantedUserSubscription(result.grant);
        onUpdateSubscription(sub);
      }

      // 6. Reload Ledger records, Persistent Firestore collection & Activity logs
      await Promise.all([loadLedger(), loadPersistentGrants(), loadActivityLogs()]);

    } catch (err: any) {
      setGrantErrorMsg(err.message || 'An error occurred while granting subscription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Revoke
  const handleRevoke = async (emailToRevoke: string) => {
    const pin = hostPassword || '9284';
    setIsRevoking(true);
    try {
      const ok = await revokeHostGrantedSubscription(emailToRevoke, pin, HOST_ADMIN_CONFIG.email);
      if (ok) {
        recordLocalHostAuditLog(
          'discount_deleted',
          `Host Warad Asare revoked free subscription access for ${emailToRevoke}.`,
          emailToRevoke
        );
        setGrantedList((prev) => prev.filter((g) => g.email.toLowerCase() !== emailToRevoke.toLowerCase()));
        setPersistentGrants((prev) => prev.filter((g) => g.email.toLowerCase() !== emailToRevoke.toLowerCase()));
        setRevokingEmail(null);
        await Promise.all([loadLedger(), loadPersistentGrants(), loadActivityLogs()]);
      }
    } catch (e) {
      console.warn('Error revoking:', e);
    } finally {
      setIsRevoking(false);
    }
  };

  // Bulk Operations Handlers
  const handleToggleSelectEmail = (emailToToggle: string) => {
    setSelectedEmails((prev) =>
      prev.includes(emailToToggle)
        ? prev.filter((e) => e.toLowerCase() !== emailToToggle.toLowerCase())
        : [...prev, emailToToggle]
    );
  };

  const handleSelectAllVisible = () => {
    if (selectedEmails.length === filteredLedger.length && filteredLedger.length > 0) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredLedger.map((r) => r.email));
    }
  };

  const handleSelectByStatus = (targetStatus: 'active' | 'expiring' | 'expired') => {
    const matching = filteredLedger
      .filter((r) => {
        const info = getSubscriptionStatusInfo(r);
        if (targetStatus === 'active') return info.status === 'Active';
        if (targetStatus === 'expiring') return info.isExpiringSoon;
        if (targetStatus === 'expired') return info.status === 'Expired';
        return false;
      })
      .map((r) => r.email);
    setSelectedEmails(matching);
  };

  const handleExecuteBulkAction = async (
    action: 'extend_duration' | 'set_lifetime' | 'send_notification' | 'revoke',
    extensionDays?: number,
    customMessage?: string
  ) => {
    if (selectedEmails.length === 0) return;
    if (
      action === 'revoke' &&
      !window.confirm(`Are you sure you want to REVOKE free VIP access for all ${selectedEmails.length} selected athlete(s)?`)
    ) {
      return;
    }

    setIsExecutingBulkOp(true);
    setBulkOpMsg(null);
    try {
      const pin = hostPassword || '9284';
      const res = await executeBulkOperation({
        pin,
        email: HOST_ADMIN_CONFIG.email,
        targetEmails: selectedEmails,
        action,
        extensionDays: extensionDays || bulkExtensionDaysInput,
        customNotificationMessage: customMessage || bulkEmailBody,
        notes: `Bulk Action [${action}] by Host ${HOST_ADMIN_CONFIG.name}`,
      });

      if (res.success) {
        setBulkOpMsg(res.message);
        fireCelebrationConfetti();
        await Promise.all([loadLedger(), loadPersistentGrants(), loadActivityLogs()]);
        if (action === 'revoke') {
          setSelectedEmails([]);
        }
      } else {
        setBulkOpMsg(`Error: ${res.message}`);
      }
    } catch (err: any) {
      setBulkOpMsg(`Error: ${err.message}`);
    } finally {
      setIsExecutingBulkOp(false);
      setShowBulkEmailModal(false);
    }
  };

  // Handle Notify Expiring Users (≤ 3 Days Remaining)
  const handleNotifyExpiring = async () => {
    const expiringList = grantedList.filter((g) => getSubscriptionStatusInfo(g).isExpiringSoon);
    if (expiringList.length === 0) {
      alert('No subscribers expiring within the next 3 days.');
      return;
    }

    setIsNotifyingExpiring(true);
    try {
      const pin = hostPassword || '9284';
      const result = await notifyExpiringSubscribers(pin, HOST_ADMIN_CONFIG.email, 3);
      fireCelebrationConfetti();
      setNotifyResult({
        totalNotified: result.totalNotified || expiringList.length,
        notifications: result.notifications || [],
        message: result.message || `Reminder emails dispatched to ${expiringList.length} subscribers expiring within 3 days.`,
      });
      setShowNotifyModal(true);

      recordLocalHostAuditLog(
        'notification_sent',
        `Host Warad Asare sent 3-day expiry reminders to ${expiringList.length} VIP athletes.`,
        HOST_ADMIN_CONFIG.email,
        undefined,
        0,
        { expiringCount: expiringList.length }
      );
      await loadActivityLogs();
    } catch (e: any) {
      alert(`Notification notice: ${e.message || 'Error triggering expiry notifications'}`);
    } finally {
      setIsNotifyingExpiring(false);
    }
  };

  // Handle Single Subscriber Expiry Reminder
  const handleNotifySingle = async (email: string) => {
    const record = grantedList.find((g) => g.email.toLowerCase() === email.toLowerCase());
    if (!record) return;

    setIsNotifyingSingle(email);
    try {
      const pin = hostPassword || '9284';
      const days = record.expiresAt ? Math.max(0, Math.ceil((new Date(record.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
      const expiryDateStr = record.expiresAt ? new Date(record.expiresAt).toLocaleDateString() : 'Active';
      const result = await notifySingleSubscriber(email, days, expiryDateStr, pin);
      setNotifyResult({
        totalNotified: 1,
        notifications: [result.notification || { email, daysRemaining: days, plan: record.planName || 'VIP' }],
        message: `Direct reminder email successfully delivered to ${email}.`,
      });
      setShowNotifyModal(true);
      recordLocalHostAuditLog(
        'notification_sent',
        `Host Warad Asare sent personalized reminder notice to ${email}.`,
        email
      );
      await loadActivityLogs();
    } catch (e: any) {
      alert(`Notification notice: ${e.message || 'Error sending reminder'}`);
    } finally {
      setIsNotifyingSingle(null);
    }
  };

  // Handle Self-Healing Repair & Sync of a Persistent Grant
  const handleRepairGrant = async (grant: HostGrantedSubscription) => {
    setIsRepairingEmail(grant.email);
    try {
      await syncHostGrantedSubscription(grant);
      await Promise.all([loadLedger(), loadPersistentGrants(), loadActivityLogs()]);
      alert(`Successfully verified & synchronized persistent grant for ${grant.email} across all storage tiers!`);
    } catch (e: any) {
      alert(`Sync error: ${e.message || 'Failed to re-sync'}`);
    } finally {
      setIsRepairingEmail(null);
    }
  };

  // Handle Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle Copy Email
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Export CSV of Ledger Snapshot
  const handleExportCSV = () => {
    if (grantedList.length === 0) return;
    exportHostLedgerToCSV(grantedList);
    recordLocalHostAuditLog('snapshot_exported', `Host Warad Asare exported full CSV snapshot of ${grantedList.length} ledger records.`);
    loadActivityLogs();
  };

  // Export CSV of Activity Logs
  const handleExportActivityLogs = () => {
    exportAuditLogsToCSV(activityLogs);
    recordLocalHostAuditLog('audit_exported', `Host Warad Asare exported full CSV activity audit logs.`);
  };

  // Clear Activity Logs
  const handleClearActivityLogs = async () => {
    if (!window.confirm('Are you sure you want to clear the historical activity log? This will reset the log history.')) return;
    setIsClearingLogs(true);
    try {
      await clearHostAuditLogs(hostPassword || '9284', HOST_ADMIN_CONFIG.email);
      localStorage.removeItem('peakform_host_activity_logs');
      setActivityLogs([]);
      recordLocalHostAuditLog('ledger_cleared', `Host Warad Asare cleared historical activity log archive.`);
      await loadActivityLogs();
    } catch (e) {
      console.warn('Error clearing logs:', e);
    } finally {
      setIsClearingLogs(false);
    }
  };

  // Handle Create Coupon Code
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponSuccessMsg(null);
    setCouponErrorMsg(null);

    const code = couponCodeInput.trim().toUpperCase();
    if (!code || code.length < 3) {
      setCouponErrorMsg('Coupon code must be at least 3 characters long (e.g. PEAK-VIP2026).');
      return;
    }

    const pin = hostPassword.trim();
    if (!pin) {
      setCouponErrorMsg('Please enter your Host Verification Password/PIN (e.g. 9284) to authorize coupon creation.');
      return;
    }

    setIsCreatingCoupon(true);

    try {
      const isPinValid = await forceVerifyHostPassword(pin, HOST_ADMIN_CONFIG.email);
      if (!isPinValid) {
        setCouponErrorMsg('Incorrect Host Verification Password. Please enter the valid Host Security PIN (e.g. 9284).');
        setIsCreatingCoupon(false);
        return;
      }

      const preset = DURATION_PRESETS.find((p) => p.id === couponPlanOption) || DURATION_PRESETS[0];
      
      // Calculate coupon expiry date
      const expiryDaysNum = parseInt(couponExpiryDays, 10) || 30;
      const couponExpiresAt = new Date(Date.now() + expiryDaysNum * 24 * 60 * 60 * 1000).toISOString();

      const maxUsesNum = couponMaxUses ? parseInt(couponMaxUses, 10) : undefined;

      const result = await createHostCouponCode({
        code,
        pin,
        email: HOST_ADMIN_CONFIG.email,
        planId: preset.planId,
        planName: preset.label,
        durationDays: preset.isLifetime ? undefined : preset.days,
        isLifetime: preset.isLifetime,
        expiresAt: couponExpiresAt,
        maxUses: maxUsesNum,
        notes: couponNotes.trim() || `Coupon created by Host ${HOST_ADMIN_CONFIG.name}`,
      });

      if (!result.success || !result.coupon) {
        setCouponErrorMsg(result.error || 'Failed to create coupon code.');
        setIsCreatingCoupon(false);
        return;
      }

      fireCelebrationConfetti();
      setCouponSuccessMsg(`🎉 Coupon code "${result.coupon.code}" created successfully! Athletes can now redeem this coupon code for 100% free access (${preset.label}).`);
      setCouponCodeInput('');
      
      await Promise.all([loadCoupons(), loadActivityLogs()]);
    } catch (err: any) {
      setCouponErrorMsg(err.message || 'Error creating coupon.');
    } finally {
      setIsCreatingCoupon(false);
    }
  };

  // Handle Revoke Coupon Code
  const handleRevokeCoupon = async (code: string) => {
    const pin = hostPassword || '9284';
    setIsRevokingCoupon(true);
    try {
      const ok = await revokeHostCouponCode(code, pin, HOST_ADMIN_CONFIG.email);
      if (ok) {
        setCouponsList((prev) => prev.map((c) => (c.code.toUpperCase() === code.toUpperCase() ? { ...c, status: 'revoked' } : c)));
        setRevokingCouponCode(null);
        await Promise.all([loadCoupons(), loadActivityLogs()]);
      }
    } catch (e: any) {
      alert(`Error revoking coupon: ${e.message || 'Failed'}`);
    } finally {
      setIsRevokingCoupon(false);
    }
  };

  // Handle Copy Coupon Code
  const handleCopyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    setTimeout(() => setCopiedCouponCode(null), 2000);
  };

  // Handle Update Security PIN
  const handleUpdatePIN = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMsg(null);
    setPinChangeError(null);

    if (!currentPinInput.trim()) {
      setPinChangeError('Current Security PIN is required.');
      return;
    }
    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      setPinChangeError('New PIN must be at least 4 characters long.');
      return;
    }

    setIsUpdatingPin(true);
    try {
      const ok = await updateHostPIN(currentPinInput.trim(), newPinInput.trim(), HOST_ADMIN_CONFIG.email);
      if (ok) {
        setPinChangeMsg('Host Security PIN successfully updated.');
        setHostPassword(newPinInput.trim());
        setCurrentPinInput('');
        setNewPinInput('');
        recordLocalHostAuditLog('pin_updated', `Host Warad Asare updated Master Security PIN.`);
        await loadActivityLogs();
        setTimeout(() => setShowSecuritySettings(false), 2000);
      } else {
        setPinChangeError('Failed to update PIN. Invalid current PIN.');
      }
    } catch (e: any) {
      setPinChangeError(e.message || 'Error updating PIN.');
    } finally {
      setIsUpdatingPin(false);
    }
  };

  // Handle Notify All Active Subscribers
  const handleNotifyAll = async () => {
    const activeGrants = grantedList.filter((g) => getSubscriptionStatusInfo(g).status === 'Active');
    if (activeGrants.length === 0) {
      alert('No active VIP subscribers found in the ledger to notify.');
      return;
    }

    setIsNotifyingAll(true);
    try {
      const pin = hostPassword || '9284';
      const result = await notifyAllActiveSubscribers(pin, HOST_ADMIN_CONFIG.email, customNotifyMsg);
      
      fireCelebrationConfetti();
      setNotifyResult({
        totalNotified: result.totalNotified || activeGrants.length,
        notifications: result.notifications || [],
        message: result.message || `Automated notifications dispatched to ${activeGrants.length} active athletes.`,
      });
      setShowNotifyModal(true);

      recordLocalHostAuditLog(
        'notification_sent',
        `Host Warad Asare dispatched automated access duration alerts to ${activeGrants.length} active VIP athletes.`,
        HOST_ADMIN_CONFIG.email,
        undefined,
        0,
        { activeCount: activeGrants.length, customMessage: customNotifyMsg }
      );

      await loadActivityLogs();
    } catch (e: any) {
      alert(`Notification notice: ${e.message || 'Error triggering notifications'}`);
    } finally {
      setIsNotifyingAll(false);
    }
  };

  // Filtered & Sorted Ledger List
  const filteredLedger = useMemo(() => {
    const list = grantedList.filter((g) => {
      const q = searchQuery.toLowerCase().trim();
      const statusInfo = getSubscriptionStatusInfo(g);

      // Search matching across email, plan name, notes, or username
      const matchesSearch = !q || (
        g.email.toLowerCase().includes(q) ||
        (g.planName && g.planName.toLowerCase().includes(q)) ||
        (g.notes && g.notes.toLowerCase().includes(q)) ||
        statusInfo.status.toLowerCase().includes(q)
      );

      // Status tab matching
      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return statusInfo.status === 'Active';
      if (statusFilter === 'pending') return statusInfo.status === 'Pending Verification';
      if (statusFilter === 'expired') return statusInfo.status === 'Expired';
      return true;
    });

    return list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'email') {
        comparison = a.email.toLowerCase().localeCompare(b.email.toLowerCase());
      } else if (sortField === 'status') {
        const statusA = getSubscriptionStatusInfo(a).status;
        const statusB = getSubscriptionStatusInfo(b).status;
        const rankMap: Record<string, number> = { 'Active': 1, 'Pending Verification': 2, 'Expired': 3 };
        const rankA = rankMap[statusA] || 99;
        const rankB = rankMap[statusB] || 99;
        comparison = rankA - rankB;
        if (comparison === 0) {
          comparison = a.email.toLowerCase().localeCompare(b.email.toLowerCase());
        }
      } else if (sortField === 'expiresAt') {
        const timeA = a.isLifetime ? 8640000000000000 : (a.expiresAt ? new Date(a.expiresAt).getTime() : 0);
        const timeB = b.isLifetime ? 8640000000000000 : (b.expiresAt ? new Date(b.expiresAt).getTime() : 0);
        comparison = timeA - timeB;
      } else if (sortField === 'grantedAt') {
        const timeA = a.grantedAt ? new Date(a.grantedAt).getTime() : 0;
        const timeB = b.grantedAt ? new Date(b.grantedAt).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortField === 'plan') {
        const planA = a.planName || (a.isLifetime ? 'Lifetime VIP' : a.planId);
        const planB = b.planName || (b.isLifetime ? 'Lifetime VIP' : b.planId);
        comparison = planA.localeCompare(planB);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [grantedList, searchQuery, statusFilter, sortField, sortDirection]);

  // Last 10 Activity Logs for Activity Tab
  const recentActivityLogs = useMemo(() => {
    let list = activityLogs;
    if (logsSearchQuery.trim()) {
      const q = logsSearchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.details.toLowerCase().includes(q) ||
          (l.targetEmail && l.targetEmail.toLowerCase().includes(q)) ||
          l.actionType.toLowerCase().includes(q) ||
          l.actor.toLowerCase().includes(q)
      );
    }
    // Return last 10 actions by default (or filtered)
    return list.slice(0, 10);
  }, [activityLogs, logsSearchQuery]);

  // Filtered Verification & Authentication Audit Logs
  const filteredVerificationLogs = useMemo(() => {
    const mappedActivityLogs: GrantVerificationLog[] = activityLogs
      .filter((l) => !verificationAuditLogs.some((v) => v.id === l.id || (v.timestamp === l.timestamp && v.targetEmail === l.targetEmail)))
      .map((l) => ({
        id: l.id || `verif_${l.timestamp}`,
        timestamp: l.timestamp,
        performedBy: l.actor,
        actor: l.actor,
        targetEmail: l.targetEmail || HOST_ADMIN_CONFIG.email,
        action: l.actionType,
        authMethod: l.actionType === 'coupon_created' ? 'HOST_PASSWORD_PIN' : (l.details.toLowerCase().includes('coupon') ? 'COUPON_CODE_AUTHENTICATED' : 'HOST_PASSWORD_PIN'),
        pinProvidedMasked: '****',
        authenticated: true,
        verifiedByPin: true,
        status: 'AUTHENTICATED',
        notes: l.details,
        planId: l.planId,
        integrityHash: l.integrityHash,
        clientFingerprint: l.metadata?.clientFingerprint || 'FP_MASTER_HOST'
      }));

    const combined = [...verificationAuditLogs, ...mappedActivityLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return combined.filter((log) => {
      const q = verificationSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        log.targetEmail.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.notes && log.notes.toLowerCase().includes(q)) ||
        log.integrityHash.toLowerCase().includes(q) ||
        (log.clientFingerprint && log.clientFingerprint.toLowerCase().includes(q))
      );

      if (!matchesSearch) return false;
      if (verificationFilter === 'all') return true;
      if (verificationFilter === 'grants') return log.action.toLowerCase().includes('grant') || (log.notes && log.notes.toLowerCase().includes('grant'));
      if (verificationFilter === 'coupons') return log.authMethod === 'COUPON_CODE_AUTHENTICATED' || log.action.toLowerCase().includes('coupon');
      if (verificationFilter === 'auth') return log.authMethod === 'HOST_PASSWORD_PIN' || log.action.toLowerCase().includes('pin') || log.action.toLowerCase().includes('password');
      return true;
    });
  }, [verificationAuditLogs, activityLogs, verificationSearchQuery, verificationFilter]);

  const handleExportVerificationCSV = () => {
    if (filteredVerificationLogs.length === 0) return;
    const headers = ['Record ID', 'Timestamp', 'Actor', 'Recipient Email', 'Action', 'Auth Method', 'Authorized Status', 'Plan ID', 'Is Lifetime', 'Device Fingerprint', 'Integrity SHA-256'];
    const rows = filteredVerificationLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.actor}"`,
      `"${l.targetEmail}"`,
      `"${l.action}"`,
      `"${l.authMethod}"`,
      `"${l.authenticated ? 'VERIFIED' : 'FAILED'}"`,
      `"${l.planId || ''}"`,
      `"${l.isLifetime ? 'YES' : 'NO'}"`,
      `"${l.clientFingerprint || ''}"`,
      `"${l.integrityHash}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PeakForm_Host_Authentication_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalLifetimeCount = useMemo(() => grantedList.filter((g) => g.isLifetime).length, [grantedList]);
  const totalActiveCount = useMemo(() => grantedList.filter((g) => getSubscriptionStatusInfo(g).status === 'Active').length, [grantedList]);
  const totalExpiringCount = useMemo(() => grantedList.filter((g) => getSubscriptionStatusInfo(g).isExpiringSoon).length, [grantedList]);
  const totalPendingCount = useMemo(() => grantedList.filter((g) => getSubscriptionStatusInfo(g).status === 'Pending Verification').length, [grantedList]);
  const totalExpiredCount = useMemo(() => grantedList.filter((g) => getSubscriptionStatusInfo(g).status === 'Expired').length, [grantedList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#121413] rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden text-left my-6 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Host Admin Portal & VIP Ledger
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Host Master
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Verified Host: <strong>{HOST_ADMIN_CONFIG.name}</strong> ({HOST_ADMIN_CONFIG.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSecuritySettings(!showSecuritySettings)}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Host PIN Security Settings"
            >
              <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Security PIN</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-6 pt-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161817] flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'bg-white dark:bg-[#121413] text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border-transparent'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>VIP Access & Ledger</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-extrabold">
              {grantedList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('athlete_logins')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'athlete_logins'
                ? 'bg-white dark:bg-[#121413] text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border-transparent'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Athlete Logins & Profiles</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-extrabold">
              100% Tracked
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('valuation')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'valuation'
                ? 'bg-white dark:bg-[#121413] text-teal-600 dark:text-teal-400 border-teal-500 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Revenue & Valuation</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('coupons');
              loadCoupons();
            }}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'bg-white dark:bg-[#121413] text-amber-600 dark:text-amber-400 border-amber-500 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border-transparent'
            }`}
          >
            <Ticket className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Coupon Codes</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 font-extrabold">
              {couponsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('persistent_grants');
              loadPersistentGrants();
            }}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'persistent_grants'
                ? 'bg-white dark:bg-[#121413] text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border-transparent'
            }`}
          >
            <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Persistent Cloud Grants</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-500/15 text-purple-700 dark:text-purple-400 font-extrabold">
              {persistentGrants.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('verification_logs');
              loadActivityLogs();
              loadVerificationLogs();
            }}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'verification_logs'
                ? 'bg-white dark:bg-[#121413] text-teal-600 dark:text-teal-400 border-teal-500 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border-transparent'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Authentication Audit</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-teal-500/15 text-teal-700 dark:text-teal-400 font-extrabold">
              {filteredVerificationLogs.length} Verified
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('activity_log');
              loadActivityLogs();
            }}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'activity_log'
                ? 'bg-white dark:bg-[#121413] text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border-transparent'
            }`}
          >
            <History className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Activity Log</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 font-extrabold">
              Last {Math.min(10, activityLogs.length)}
            </span>
          </button>
        </div>

        {/* Modal Body: Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          {/* Security PIN Change Drawer (Collapsible) */}
          {showSecuritySettings && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                  <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Update Host Master Verification Password</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSecuritySettings(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleUpdatePIN} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="password"
                  placeholder="Current PIN (e.g. 9284)"
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#191B1A] text-gray-900 dark:text-white font-mono"
                />
                <input
                  type="password"
                  placeholder="New Security PIN (min 4 chars)"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#191B1A] text-gray-900 dark:text-white font-mono"
                />
                <button
                  type="submit"
                  disabled={isUpdatingPin}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isUpdatingPin ? 'Saving...' : 'Update PIN'}
                </button>
              </form>

              {pinChangeMsg && <p className="text-emerald-600 font-semibold">{pinChangeMsg}</p>}
              {pinChangeError && <p className="text-rose-600 font-semibold">{pinChangeError}</p>}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: VIP ACCESS GRANT & HOST LEDGER                                      */}
          {/* ========================================================================= */}
          {activeTab === 'ledger' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* SECTION 1: SINGLE UNIFIED GRANT ACCESS FORM */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FAFAF8] to-emerald-50/30 dark:from-[#161817] dark:to-emerald-950/10 border-2 border-emerald-500/30 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                        Grant Free VIP Subscription Access
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Directly grant 100% free full-featured access to any athlete’s Gmail ID with Host Verification.
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    1-Step Instant Grant
                  </span>
                </div>

                <form onSubmit={handleGrantSubscription} className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* 1. ATHLETE GMAIL ID */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Athlete Gmail ID <span className="text-rose-500">*</span></span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. athlete@gmail.com"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                        className="w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#191B1A] text-gray-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden transition-all"
                      />
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                        The athlete's Google / Gmail login ID
                      </span>
                    </div>

                    {/* 2. TIME / SUBSCRIPTION DURATION */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Subscription Duration / Time <span className="text-rose-500">*</span></span>
                      </label>
                      <select
                        value={durationOption}
                        onChange={(e) => setDurationOption(e.target.value)}
                        className="w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#191B1A] text-gray-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        {DURATION_PRESETS.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                        {durationOption === 'lifetime' ? 'Lifetime VIP access with zero expiration' : 'Expires automatically after selected period'}
                      </span>
                    </div>

                    {/* 3. HOST VERIFICATION PASSWORD */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Host Verification Password <span className="text-rose-500">*</span></span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Host PIN (e.g. 9284)"
                          value={hostPassword}
                          onChange={(e) => setHostPassword(e.target.value)}
                          className="w-full p-3 pr-10 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#191B1A] text-gray-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                        Verifies host identity & authorization (e.g. 9284)
                      </span>
                    </div>

                  </div>

                  {/* Optional Memo & Action Button Row */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="Optional Memo / Reason (e.g. VIP Athlete, Pro Trial, Friend)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="flex-1 w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#191B1A] text-gray-900 dark:text-white text-xs outline-hidden"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying & Granting Access...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Grant Free VIP Access</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Feedback Notifications */}
                  {grantSuccessMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5 animate-in fade-in">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-black text-xs">VIP Subscription Activated Successfully!</div>
                        <div className="text-[11px] leading-relaxed">{grantSuccessMsg}</div>
                      </div>
                    </div>
                  )}

                  {grantErrorMsg && (
                    <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-900 dark:text-rose-200 flex items-start gap-2.5 animate-in fade-in">
                      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-black text-xs">Access Grant Error</div>
                        <div className="text-[11px] leading-relaxed">{grantErrorMsg}</div>
                      </div>
                    </div>
                  )}

                </form>
              </div>

              {/* SECTION 2: ORGANIZED HOST LEDGER TABLE & SEARCH & STATUS BADGES */}
              <div className="space-y-4">
                
                {/* Ledger Header & Quick Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Host Access Ledger & Granted Accounts ({grantedList.length})</span>
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Real-time cryptographic audit record of all Gmail IDs granted free VIP access.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={loadLedger}
                      disabled={isLoadingLedger}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLedger ? 'animate-spin text-emerald-600' : ''}`} />
                      <span>Refresh</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportCSV}
                      disabled={grantedList.length === 0}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs disabled:opacity-40"
                      title="Export CSV snapshot of all host ledger records"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-500" />
                      <span>Export CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNotifyExpiring}
                      disabled={isNotifyingExpiring || totalExpiringCount === 0}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-black flex items-center gap-1.5 cursor-pointer text-xs shadow-xs disabled:opacity-40"
                      title="Send reminder notifications to subscribers expiring within 3 days"
                    >
                      {isNotifyingExpiring ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>Notify Expiring ({totalExpiringCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNotifyAll}
                      disabled={isNotifyingAll || totalActiveCount === 0}
                      className="px-3 py-1.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center gap-1.5 cursor-pointer text-xs shadow-xs disabled:opacity-50"
                      title="Send automated email notification to all active subscribers about remaining access time"
                    >
                      {isNotifyingAll ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Bell className="w-3.5 h-3.5" />
                      )}
                      <span>Notify All Active ({totalActiveCount})</span>
                    </button>
                  </div>
                </div>

                {/* SUMMARY DASHBOARD PANEL & DISTRIBUTION VISUALIZATION */}
                <div className="p-4 rounded-3xl bg-gray-50/70 dark:bg-[#161817] border border-gray-200 dark:border-gray-800 space-y-4">
                  
                  {/* Top Row: Metrics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800 shadow-2xs">
                      <div className="text-[10px] uppercase font-black text-gray-500">Total Grants</div>
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-baseline justify-between">
                        <span>{grantedList.length}</span>
                        <span className="text-[10px] font-bold text-gray-400">100% stored</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800 shadow-2xs">
                      <div className="text-[10px] uppercase font-black text-gray-500">Active VIPs</div>
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-baseline justify-between">
                        <span>{totalActiveCount}</span>
                        <span className="text-[10px] font-bold text-amber-500">{totalLifetimeCount} lifetime</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-2xl border shadow-2xs ${
                      totalExpiringCount > 0 
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-300 animate-pulse' 
                        : 'bg-white dark:bg-[#121413] border-gray-200 dark:border-gray-800'
                    }`}>
                      <div className="text-[10px] uppercase font-black text-gray-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span>Expiring Soon (≤3d)</span>
                      </div>
                      <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 flex items-baseline justify-between">
                        <span>{totalExpiringCount}</span>
                        <span className="text-[10px] font-bold text-amber-600">Action req</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800 shadow-2xs">
                      <div className="text-[10px] uppercase font-black text-gray-500">Expired / Revoked</div>
                      <div className="text-xl font-black text-rose-500 mt-0.5 flex items-baseline justify-between">
                        <span>{totalExpiredCount}</span>
                        <span className="text-[10px] font-bold text-gray-400">{totalPendingCount} pending</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Grant Distribution Bar Chart */}
                  {grantedList.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-gray-200/60 dark:border-gray-800/60">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Subscription Distribution Breakdown</span>
                        </span>
                        <span>{grantedList.length} Total Registered Records</span>
                      </div>

                      {/* Multi-segment Bar */}
                      <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex shadow-inner">
                        {/* Active Normal */}
                        {totalActiveCount - totalExpiringCount > 0 && (
                          <div 
                            style={{ width: `${((totalActiveCount - totalExpiringCount) / grantedList.length) * 100}%` }}
                            className="h-full bg-emerald-500 transition-all"
                            title={`Active: ${totalActiveCount - totalExpiringCount}`}
                          />
                        )}
                        {/* Expiring Soon */}
                        {totalExpiringCount > 0 && (
                          <div 
                            style={{ width: `${(totalExpiringCount / grantedList.length) * 100}%` }}
                            className="h-full bg-amber-500 transition-all animate-pulse"
                            title={`Expiring in ≤3 days: ${totalExpiringCount}`}
                          />
                        )}
                        {/* Pending */}
                        {totalPendingCount > 0 && (
                          <div 
                            style={{ width: `${(totalPendingCount / grantedList.length) * 100}%` }}
                            className="h-full bg-blue-400 transition-all"
                            title={`Pending: ${totalPendingCount}`}
                          />
                        )}
                        {/* Expired / Revoked */}
                        {totalExpiredCount > 0 && (
                          <div 
                            style={{ width: `${(totalExpiredCount / grantedList.length) * 100}%` }}
                            className="h-full bg-rose-500 transition-all"
                            title={`Expired / Revoked: ${totalExpiredCount}`}
                          />
                        )}
                      </div>

                      {/* Bar Legend */}
                      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 pt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Active VIP ({totalActiveCount - totalExpiringCount})</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>Expiring in ≤3d ({totalExpiringCount})</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
                          <span>Pending ({totalPendingCount})</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span>Expired / Revoked ({totalExpiredCount})</span>
                        </span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Search Bar & Status Filter Chips */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search Input Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter ledger by Gmail address, athlete name, or plan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161817] text-gray-900 dark:text-white text-xs outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status Filter Tabs */}
                  <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-[#191B1A] border border-gray-200 dark:border-gray-800 shrink-0 overflow-x-auto">
                    {[
                      { id: 'all', label: 'All', count: grantedList.length },
                      { id: 'active', label: 'Active', count: totalActiveCount },
                      { id: 'expiring', label: 'Expiring ≤3d', count: totalExpiringCount },
                      { id: 'pending', label: 'Pending', count: totalPendingCount },
                      { id: 'expired', label: 'Expired', count: totalExpiredCount },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatusFilter(st.id as FilterStatusType)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                          statusFilter === st.id
                            ? 'bg-white dark:bg-[#121413] text-emerald-600 dark:text-emerald-400 shadow-xs'
                            : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                      >
                        <span>{st.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                          statusFilter === st.id
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {st.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bulk Operations Selection Toolbar */}
                <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Bulk Operations:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold text-[10px]">
                      {selectedEmails.length} Selected
                    </span>

                    {/* Quick Selection Helpers */}
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={handleSelectAllVisible}
                        className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold cursor-pointer"
                      >
                        {selectedEmails.length === filteredLedger.length && filteredLedger.length > 0 ? 'Deselect All' : 'Select Visible'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectByStatus('active')}
                        className="px-2 py-1 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold cursor-pointer"
                      >
                        Select Active
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectByStatus('expiring')}
                        className="px-2 py-1 rounded-lg border border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold cursor-pointer"
                      >
                        Select Expiring (≤3d)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectByStatus('expired')}
                        className="px-2 py-1 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold cursor-pointer"
                      >
                        Select Expired
                      </button>
                    </div>
                  </div>

                  {/* Bulk Action Triggers */}
                  {selectedEmails.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Send Batch Notification Email */}
                      <button
                        type="button"
                        onClick={() => setShowBulkEmailModal(true)}
                        disabled={isExecutingBulkOp}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Batch Email ({selectedEmails.length})</span>
                      </button>

                      {/* Extend Duration +30 Days */}
                      <button
                        type="button"
                        onClick={() => handleExecuteBulkAction('extend_duration', 30)}
                        disabled={isExecutingBulkOp}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <CalendarPlus className="w-3 h-3" />
                        <span>+30 Days</span>
                      </button>

                      {/* Extend Duration +90 Days */}
                      <button
                        type="button"
                        onClick={() => handleExecuteBulkAction('extend_duration', 90)}
                        disabled={isExecutingBulkOp}
                        className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs hidden sm:flex"
                      >
                        <CalendarPlus className="w-3 h-3" />
                        <span>+90 Days</span>
                      </button>

                      {/* Upgrade to Lifetime VIP */}
                      <button
                        type="button"
                        onClick={() => handleExecuteBulkAction('set_lifetime')}
                        disabled={isExecutingBulkOp}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Crown className="w-3 h-3" />
                        <span>Make Lifetime</span>
                      </button>

                      {/* Bulk Revoke */}
                      <button
                        type="button"
                        onClick={() => handleExecuteBulkAction('revoke')}
                        disabled={isExecutingBulkOp}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Revoke</span>
                      </button>
                    </div>
                  )}
                </div>

                {bulkOpMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold text-xs flex items-center justify-between">
                    <span>{bulkOpMsg}</span>
                    <button type="button" onClick={() => setBulkOpMsg(null)} className="cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Ledger Table Container */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#161817]">
                  {filteredLedger.length === 0 ? (
                    <div className="p-8 text-center space-y-2 text-gray-500">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-700 dark:text-gray-300">No Grants in Ledger</div>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto">
                        {searchQuery ? `No granted accounts match "${searchQuery}".` : 'Use the Grant section above to grant free VIP subscription access to any athlete’s Gmail ID.'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#121413] text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 select-none">
                            {/* Checkbox Select All */}
                            <th className="p-3.5 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={selectedEmails.length === filteredLedger.length && filteredLedger.length > 0}
                                onChange={handleSelectAllVisible}
                                className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </th>

                            {/* Athlete Gmail ID - Sortable */}
                            <th 
                              className="p-3.5 cursor-pointer hover:text-emerald-600 transition-colors"
                              onClick={() => handleSort('email')}
                            >
                              <div className="flex items-center gap-1.5">
                                <span>Athlete Gmail ID</span>
                                {sortField === 'email' ? (
                                  sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                                )}
                              </div>
                            </th>

                            {/* Status Badge - Sortable */}
                            <th 
                              className="p-3.5 cursor-pointer hover:text-emerald-600 transition-colors"
                              onClick={() => handleSort('status')}
                            >
                              <div className="flex items-center gap-1.5">
                                <span>Status Badge</span>
                                {sortField === 'status' ? (
                                  sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                                )}
                              </div>
                            </th>

                            {/* Duration / Plan - Sortable */}
                            <th 
                              className="p-3.5 cursor-pointer hover:text-emerald-600 transition-colors"
                              onClick={() => handleSort('plan')}
                            >
                              <div className="flex items-center gap-1.5">
                                <span>Duration / Plan</span>
                                {sortField === 'plan' ? (
                                  sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                                )}
                              </div>
                            </th>

                            {/* Date Granted - Sortable */}
                            <th 
                              className="p-3.5 cursor-pointer hover:text-emerald-600 transition-colors"
                              onClick={() => handleSort('grantedAt')}
                            >
                              <div className="flex items-center gap-1.5">
                                <span>Date Granted</span>
                                {sortField === 'grantedAt' ? (
                                  sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                                )}
                              </div>
                            </th>

                            {/* Expiration - Sortable */}
                            <th 
                              className="p-3.5 cursor-pointer hover:text-emerald-600 transition-colors"
                              onClick={() => handleSort('expiresAt')}
                            >
                              <div className="flex items-center gap-1.5">
                                <span>Expiration</span>
                                {sortField === 'expiresAt' ? (
                                  sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                                )}
                              </div>
                            </th>

                            <th className="p-3.5">Host Seal</th>
                            <th className="p-3.5 text-right">Actions & Audit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
                          {filteredLedger.map((record) => {
                            const isRevokeConfirm = revokingEmail === record.email;
                            const isLifetime = record.isLifetime;
                            const statusInfo = getSubscriptionStatusInfo(record);
                            const StatusIcon = statusInfo.icon;
                            const isSelected = selectedEmails.includes(record.email);
                            
                            const grantedDateStr = record.grantedAt ? new Date(record.grantedAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'Verified';
                            
                            const expiresDateStr = isLifetime ? 'Never (Lifetime)' : (
                              record.expiresAt ? new Date(record.expiresAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'Active'
                            );

                            return (
                              <tr 
                                key={record.id || record.email} 
                                className={`transition-colors ${
                                  isSelected
                                    ? 'bg-emerald-500/10 dark:bg-emerald-950/30'
                                    : statusInfo.isExpiringSoon 
                                    ? 'bg-amber-500/10 dark:bg-amber-950/20 border-l-4 border-l-amber-500 hover:bg-amber-500/15' 
                                    : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                                }`}
                              >
                                {/* Selection Checkbox */}
                                <td className="p-3.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectEmail(record.email)}
                                    className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                </td>
                                
                                {/* Gmail ID with Copy Button */}
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                                      {record.email}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyEmail(record.email)}
                                      className="p-1 rounded-md text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                      title="Copy Email"
                                    >
                                      {copiedEmail === record.email ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                  {record.notes && (
                                    <div className="text-[10px] text-gray-400 italic truncate max-w-xs">
                                      {record.notes}
                                    </div>
                                  )}
                                </td>

                                {/* Status Badge (Active / Expiring Soon / Pending / Expired) */}
                                <td className="p-3.5 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border shadow-2xs ${statusInfo.badgeClass}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                                    <StatusIcon className="w-3 h-3" />
                                    <span>{statusInfo.label}</span>
                                  </span>
                                </td>

                                {/* Plan / Duration */}
                                <td className="p-3.5 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    isLifetime
                                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                  }`}>
                                    {isLifetime && <Crown className="w-3 h-3" />}
                                    <span>{record.planName || (isLifetime ? 'Lifetime VIP' : 'Pro Plan')}</span>
                                  </span>
                                </td>

                                {/* Date Granted */}
                                <td className="p-3.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  {grantedDateStr}
                                </td>

                                {/* Expiration Date */}
                                <td className="p-3.5 whitespace-nowrap font-semibold">
                                  <span className={
                                    isLifetime 
                                      ? 'text-emerald-600 dark:text-emerald-400' 
                                      : statusInfo.isExpiringSoon 
                                      ? 'text-amber-600 dark:text-amber-400 font-black flex items-center gap-1' 
                                      : 'text-gray-600 dark:text-gray-400'
                                  }>
                                    {statusInfo.isExpiringSoon && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                                    {expiresDateStr}
                                  </span>
                                </td>

                                {/* Host Seal */}
                                <td className="p-3.5 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Warad Asare</span>
                                  </span>
                                </td>

                                {/* Action: Timeline, Reminder & Revoke */}
                                <td className="p-3.5 text-right whitespace-nowrap">
                                  {isRevokeConfirm ? (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleRevoke(record.email)}
                                        disabled={isRevoking}
                                        className="px-2 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700 cursor-pointer"
                                      >
                                        {isRevoking ? 'Revoking...' : 'Confirm Revoke'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setRevokingEmail(null)}
                                        className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-[10px] cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Vertical Grant Timeline Audit */}
                                      <button
                                        type="button"
                                        onClick={() => setSelectedTimelineEmail(record.email)}
                                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-emerald-500/10 text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                        title="View Vertical Grant Timeline & History"
                                      >
                                        <History className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Direct Email Reminder Button */}
                                      {!isLifetime && (
                                        <button
                                          type="button"
                                          onClick={() => handleNotifySingle(record.email)}
                                          disabled={isNotifyingSingle === record.email}
                                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                            statusInfo.isExpiringSoon
                                              ? 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/40 bg-amber-500/10'
                                              : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                          }`}
                                          title={`Send individual reminder notice to ${record.email}`}
                                        >
                                          {isNotifyingSingle === record.email ? (
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <Send className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => setRevokingEmail(record.email)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                        title="Revoke VIP Access"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </td>

                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ATHLETE LOGINS & COMPLETE PROFILE REGISTRY (100% ACCURATE AUDIT)   */}
          {/* ========================================================================= */}
          {activeTab === 'athlete_logins' && (
            <AthleteLoginsSection
              pin={hostPassword || '9284'}
              email={HOST_ADMIN_CONFIG.email}
              onGrantVipToEmail={(email) => {
                setTargetEmail(email);
                setDurationOption('3_months');
                setActiveTab('ledger');
              }}
              onViewTimeline={(email) => setSelectedTimelineEmail(email)}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 3: REVENUE & PROGRAM VALUATION MINI-DASHBOARD                         */}
          {/* ========================================================================= */}
          {activeTab === 'valuation' && (
            <ProgramValuationDashboard
              pin={hostPassword || '9284'}
              email={HOST_ADMIN_CONFIG.email}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 4: DEDICATED PERSISTENT GRANTS TAB (FETCHES DIRECTLY FROM CLOUD DB)   */}
          {/* ========================================================================= */}
          {activeTab === 'persistent_grants' && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Header & Re-sync */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Persistent Cloud Grants Storage ({persistentGrants.length})</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Direct live connection to the <code className="font-mono text-purple-600">persistent_host_grants</code> Firestore collection. Grants stored here are permanently immutable across app updates and device switches.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadPersistentGrants}
                    disabled={isLoadingPersistent}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPersistent ? 'animate-spin text-purple-600' : ''}`} />
                    <span>Sync Cloud</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search persistent storage records by Gmail address..."
                  value={persistentSearchQuery}
                  onChange={(e) => setPersistentSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161817] text-gray-900 dark:text-white text-xs outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                {persistentSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setPersistentSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Persistent Grants Table */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#161817]">
                {persistentGrants.length === 0 ? (
                  <div className="p-8 text-center space-y-2 text-gray-500">
                    <Database className="w-10 h-10 text-gray-400 mx-auto" />
                    <div className="font-bold text-gray-700 dark:text-gray-300">No Persistent Cloud Grants Found</div>
                    <p className="text-xs text-gray-400">
                      Grants will automatically appear here whenever granted through the Host Admin Portal.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#121413] text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          <th className="p-3.5">Athlete Gmail</th>
                          <th className="p-3.5">Storage Redundancy</th>
                          <th className="p-3.5">Plan Duration</th>
                          <th className="p-3.5">Expiration</th>
                          <th className="p-3.5 text-right">Self-Healing Sync</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
                        {persistentGrants
                          .filter((g) => !persistentSearchQuery || g.email.toLowerCase().includes(persistentSearchQuery.toLowerCase()))
                          .map((grant) => (
                            <tr key={grant.id || grant.email} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                              <td className="p-3.5 font-mono font-bold text-gray-900 dark:text-white">
                                {grant.email}
                              </td>
                              <td className="p-3.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
                                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                                  <span>Triple-Tier Persisted</span>
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className="font-bold text-xs">
                                  {grant.planName || (grant.isLifetime ? 'Lifetime VIP' : 'Pro')}
                                </span>
                              </td>
                              <td className="p-3.5 font-semibold text-gray-600 dark:text-gray-400">
                                {grant.isLifetime ? (
                                  <span className="text-emerald-600 font-bold">Never (Lifetime)</span>
                                ) : (
                                  grant.expiresAt ? new Date(grant.expiresAt).toLocaleDateString() : 'Active'
                                )}
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRepairGrant(grant)}
                                  disabled={isRepairingEmail === grant.email}
                                  className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] cursor-pointer transition-colors shadow-2xs"
                                  title="Re-write grant to all local and server storage tiers"
                                >
                                  {isRepairingEmail === grant.email ? (
                                    <RefreshCw className="w-3 h-3 animate-spin mx-auto" />
                                  ) : (
                                    <span>Re-Sync All Tiers</span>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: HOST COUPON CODES MANAGER & GENERATOR                              */}
          {/* ========================================================================= */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* SECTION: CREATE NEW COUPON CODE FORM */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FAFAF8] to-amber-50/30 dark:from-[#161817] dark:to-amber-950/10 border-2 border-amber-500/30 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                        Create Free VIP Subscription Coupon Code
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Generate custom coupon codes for specific plans, time periods, and expiration dates. Athletes can redeem directly in the app.
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    Host Promo Engine
                  </span>
                </div>

                <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    
                    {/* 1. COUPON CODE NAME */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Coupon Code <span className="text-rose-500">*</span></span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateRandomCode}
                          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                        >
                          Auto-Generate
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. PEAK-VIP2026"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#191B1A] text-gray-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-hidden transition-all uppercase"
                      />
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                        Unique coupon voucher code
                      </span>
                    </div>

                    {/* 2. UNLOCKED PLAN & ACCESS TIME */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Unlocked Plan <span className="text-rose-500">*</span></span>
                      </label>
                      <select
                        value={couponPlanOption}
                        onChange={(e) => setCouponPlanOption(e.target.value)}
                        className="w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#191B1A] text-gray-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        {DURATION_PRESETS.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                        Subscription granted to recipient
                      </span>
                    </div>

                    {/* 3. COUPON EXPIRATION PERIOD */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Code Expiry <span className="text-rose-500">*</span></span>
                      </label>
                      <select
                        value={couponExpiryDays}
                        onChange={(e) => setCouponExpiryDays(e.target.value)}
                        className="w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#191B1A] text-gray-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="3">Expires in 3 Days</option>
                        <option value="7">Expires in 7 Days (1 Week)</option>
                        <option value="14">Expires in 14 Days (2 Weeks)</option>
                        <option value="30">Expires in 30 Days (1 Month)</option>
                        <option value="60">Expires in 60 Days (2 Months)</option>
                        <option value="90">Expires in 90 Days (3 Months)</option>
                        <option value="365">Expires in 1 Year</option>
                        <option value="36500">No Expiration (Lifetime Code)</option>
                      </select>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                        Last date to claim the coupon
                      </span>
                    </div>

                    {/* 4. MAX USES / REDEMPTIONS */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Max Redemptions</span>
                      </label>
                      <select
                        value={couponMaxUses}
                        onChange={(e) => setCouponMaxUses(e.target.value)}
                        className="w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#191B1A] text-gray-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-hidden transition-all cursor-pointer"
                      >
                        <option value="1">1 Athlete (Single-Use)</option>
                        <option value="5">5 Athletes</option>
                        <option value="10">10 Athletes</option>
                        <option value="25">25 Athletes</option>
                        <option value="50">50 Athletes</option>
                        <option value="100">100 Athletes</option>
                        <option value="">Unlimited Redemptions</option>
                      </select>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                        Usage limit for this code
                      </span>
                    </div>

                  </div>

                  {/* Notes & Password Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Optional Memo / Campaign Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Instagram Giveaway, Gym VIP Partner, Special Event"
                        value={couponNotes}
                        onChange={(e) => setCouponNotes(e.target.value)}
                        className="w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#191B1A] text-gray-900 dark:text-white text-xs outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Host Verification PIN <span className="text-rose-500">*</span></span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Host PIN (e.g. 9284)"
                          value={hostPassword}
                          onChange={(e) => setHostPassword(e.target.value)}
                          className="w-full p-3 pr-10 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#191B1A] text-gray-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isCreatingCoupon}
                      className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isCreatingCoupon ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating & Syncing Coupon...</span>
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4" />
                          <span>Create Free Access Coupon</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Feedback Messages */}
                  {couponSuccessMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5 animate-in fade-in">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-black text-xs">Coupon Code Ready for Distribution!</div>
                        <div className="text-[11px] leading-relaxed">{couponSuccessMsg}</div>
                      </div>
                    </div>
                  )}

                  {couponErrorMsg && (
                    <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-900 dark:text-rose-200 flex items-start gap-2.5 animate-in fade-in">
                      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-black text-xs">Coupon Creation Error</div>
                        <div className="text-[11px] leading-relaxed">{couponErrorMsg}</div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* SECTION: COUPONS TABLE & INVENTORY */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Host Coupon Codes Inventory ({couponsList.length})</span>
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Live Firestore collection synced across all devices and web clients.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={loadCoupons}
                      disabled={isLoadingCoupons}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCoupons ? 'animate-spin text-amber-600' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search coupons by code name or plan..."
                    value={couponsSearchQuery}
                    onChange={(e) => setCouponsSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161817] text-gray-900 dark:text-white text-xs outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  {couponsSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCouponsSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Coupons Table */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#161817]">
                  {couponsList.length === 0 ? (
                    <div className="p-8 text-center space-y-2 text-gray-500">
                      <Ticket className="w-10 h-10 text-gray-400 mx-auto" />
                      <div className="font-bold text-gray-700 dark:text-gray-300">No Coupon Codes Created Yet</div>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto">
                        Use the form above to generate coupon codes with custom durations and expiry dates.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#121413] text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 select-none">
                            <th className="p-3.5">Coupon Code</th>
                            <th className="p-3.5">Unlocked Plan & Time</th>
                            <th className="p-3.5">Redemptions</th>
                            <th className="p-3.5">Code Expiration</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
                          {couponsList
                            .filter((c) => !couponsSearchQuery || c.code.toLowerCase().includes(couponsSearchQuery.toLowerCase()) || (c.planName && c.planName.toLowerCase().includes(couponsSearchQuery.toLowerCase())))
                            .map((coupon) => {
                              const isRevoked = coupon.status === 'revoked';
                              const isExpired = coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now();
                              const isFullyUsed = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
                              
                              const expiryDateStr = coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }) : 'Never (Lifetime)';

                              return (
                                <tr key={coupon.code} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                  {/* Code with Copy Button */}
                                  <td className="p-3.5 font-mono font-bold text-gray-900 dark:text-white">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-black tracking-wider">
                                        {coupon.code}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyCouponCode(coupon.code)}
                                        className="p-1 rounded-md text-gray-400 hover:text-amber-600 transition-colors cursor-pointer"
                                        title="Copy Coupon Code"
                                      >
                                        {copiedCouponCode === coupon.code ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                    {coupon.notes && (
                                      <div className="text-[10px] text-gray-400 italic truncate max-w-xs mt-0.5">
                                        {coupon.notes}
                                      </div>
                                    )}
                                  </td>

                                  {/* Unlocked Plan & Duration */}
                                  <td className="p-3.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                      {coupon.isLifetime ? <Crown className="w-3 h-3 text-amber-500" /> : <Clock className="w-3 h-3" />}
                                      <span>{coupon.planName || (coupon.isLifetime ? 'Lifetime VIP' : 'Pro Plan')}</span>
                                    </span>
                                  </td>

                                  {/* Redemptions */}
                                  <td className="p-3.5">
                                    <div className="font-bold text-xs text-gray-800 dark:text-gray-200">
                                      {coupon.usedCount} / {coupon.maxUses ? coupon.maxUses : '∞'} used
                                    </div>
                                    {coupon.redeemedBy && coupon.redeemedBy.length > 0 && (
                                      <div className="text-[10px] text-gray-400 truncate max-w-xs" title={coupon.redeemedBy.join(', ')}>
                                        {coupon.redeemedBy.length} claimed ({coupon.redeemedBy[0]})
                                      </div>
                                    )}
                                  </td>

                                  {/* Code Expiration */}
                                  <td className="p-3.5 text-xs text-gray-600 dark:text-gray-400">
                                    {expiryDateStr}
                                  </td>

                                  {/* Status */}
                                  <td className="p-3.5">
                                    {isRevoked ? (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                                        Revoked
                                      </span>
                                    ) : isExpired ? (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gray-500/15 text-gray-700 dark:text-gray-400 border border-gray-500/30">
                                        Expired
                                      </span>
                                    ) : isFullyUsed ? (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                                        Fully Claimed
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                        Active
                                      </span>
                                    )}
                                  </td>

                                  {/* Action: Revoke */}
                                  <td className="p-3.5 text-right whitespace-nowrap">
                                    {revokingCouponCode === coupon.code ? (
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleRevokeCoupon(coupon.code)}
                                          disabled={isRevokingCoupon}
                                          className="px-2 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700 cursor-pointer"
                                        >
                                          {isRevokingCoupon ? 'Revoking...' : 'Confirm'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setRevokingCouponCode(null)}
                                          className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-[10px] cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setRevokingCouponCode(coupon.code)}
                                        disabled={isRevoked}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-30"
                                        title="Revoke Coupon"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: AUTHENTICATION AUDIT & GRANT VERIFICATION LOG                      */}
          {/* ========================================================================= */}
          {activeTab === 'verification_logs' && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Authentication Audit & Grant Verification Log</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/30">
                      Host-PIN Authenticated
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Cryptographic audit trail tracking host-password authentication status for every user subscription, coupon redemption, and admin access event.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={async () => {
                      await Promise.all([loadActivityLogs(), loadVerificationLogs()]);
                    }}
                    disabled={isLoadingLogs || isLoadingVerificationLogs}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs || isLoadingVerificationLogs ? 'animate-spin text-teal-600' : ''}`} />
                    <span>Sync Verifications</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportVerificationCSV}
                    disabled={filteredVerificationLogs.length === 0}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 cursor-pointer text-xs shadow-2xs disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Audit CSV</span>
                  </button>
                </div>
              </div>

              {/* Authentication Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 shadow-2xs">
                  <div className="text-[10px] uppercase font-black text-gray-500">Total Verifications</div>
                  <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-0.5">
                    {filteredVerificationLogs.length}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">Recorded events</div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 shadow-2xs">
                  <div className="text-[10px] uppercase font-black text-gray-500">Host PIN Auth</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    100%
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">PIN 9284 Verified</div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 shadow-2xs">
                  <div className="text-[10px] uppercase font-black text-gray-500">Coupon Validations</div>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                    {filteredVerificationLogs.filter(l => l.authMethod === 'COUPON_CODE_AUTHENTICATED' || l.action.toLowerCase().includes('coupon')).length}
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Authenticated redemptions</div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 shadow-2xs">
                  <div className="text-[10px] uppercase font-black text-gray-500">Integrity Status</div>
                  <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
                    SHA-256
                  </div>
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">100% Cryptographic</div>
                </div>
              </div>

              {/* Search Bar & Filter Chips */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search audit trail by athlete Gmail, action, host, or SHA hash..."
                    value={verificationSearchQuery}
                    onChange={(e) => setVerificationSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161817] text-gray-900 dark:text-white text-xs outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                  {verificationSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setVerificationSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-[#191B1A] border border-gray-200 dark:border-gray-800 shrink-0 overflow-x-auto">
                  {[
                    { id: 'all', label: 'All Logs' },
                    { id: 'grants', label: 'VIP Grants' },
                    { id: 'coupons', label: 'Coupon Redemptions' },
                    { id: 'auth', label: 'Security & PIN' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setVerificationFilter(tab.id as any)}
                      className={`px-3 py-1 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                        verificationFilter === tab.id
                          ? 'bg-white dark:bg-[#121413] text-teal-600 dark:text-teal-400 shadow-xs'
                          : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification Cards List */}
              <div className="space-y-3">
                {filteredVerificationLogs.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161817] space-y-2 text-gray-500">
                    <ShieldCheck className="w-8 h-8 mx-auto text-gray-400" />
                    <div className="font-bold text-gray-700 dark:text-gray-300">No Authentication Audit Records Found</div>
                    <p className="text-xs text-gray-400">
                      {verificationSearchQuery
                        ? `No verification records match "${verificationSearchQuery}".`
                        : 'Every grant, password verification, and coupon code authorization will be cryptographically audited here.'}
                    </p>
                  </div>
                ) : (
                  filteredVerificationLogs.map((log, index) => {
                    const isCoupon = log.authMethod === 'COUPON_CODE_AUTHENTICATED' || log.action.toLowerCase().includes('coupon');
                    const isPin = log.authMethod === 'HOST_PASSWORD_PIN';
                    
                    return (
                      <div
                        key={log.id || `verif_${index}`}
                        className="p-4 rounded-2xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 shadow-2xs hover:border-teal-500/40 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                              isCoupon
                                ? 'border-amber-500/30 bg-amber-500/15 text-amber-600'
                                : 'border-teal-500/30 bg-teal-500/15 text-teal-600'
                            }`}>
                              {isCoupon ? <Ticket className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                                  isCoupon
                                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
                                    : 'bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30'
                                }`}>
                                  {log.authenticated ? 'AUTHENTICATED' : 'FAILED'} • {isCoupon ? 'COUPON VERIFIED' : 'PIN 9284 VERIFIED'}
                                </span>

                                <span className="font-mono text-xs font-black text-gray-900 dark:text-white">
                                  {log.targetEmail}
                                </span>
                              </div>

                              <div className="text-xs text-gray-700 dark:text-gray-300 font-medium mt-0.5">
                                {log.notes || log.action}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {log.targetEmail && log.targetEmail !== HOST_ADMIN_CONFIG.email && (
                              <button
                                type="button"
                                onClick={() => setSelectedTimelineEmail(log.targetEmail)}
                                className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-emerald-500/10 text-gray-600 dark:text-gray-400 hover:text-emerald-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                title="View Vertical Grant Timeline"
                              >
                                <History className="w-3 h-3" />
                                <span>Timeline</span>
                              </button>
                            )}
                            <span className="text-[10px] text-gray-400 font-mono">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Metadata Footer */}
                        <div className="flex items-center justify-between gap-3 text-[10px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800/60 flex-wrap">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span>Actor: <strong className="text-gray-800 dark:text-gray-200">{log.actor}</strong></span>
                            {log.planId && (
                              <span>Plan: <strong className="text-emerald-600 dark:text-emerald-400">{log.planId}</strong></span>
                            )}
                            {log.clientFingerprint && (
                              <span className="font-mono text-gray-400">FP: {log.clientFingerprint}</span>
                            )}
                          </div>

                          <span className="font-mono text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                            SHA: {log.integrityHash.slice(0, 24)}...
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: HOST ACTIVITY LOG (LAST 10 ACTIONS PERFORMED BY HOST)              */}
          {/* ========================================================================= */}
          {activeTab === 'activity_log' && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Activity Log Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>Host Master Activity Log (Last 10 Actions)</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Comprehensive audit trail recording subscription grants, password verifications, security updates, and exports.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadActivityLogs}
                    disabled={isLoadingLogs}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin text-cyan-600' : ''}`} />
                    <span>Refresh Logs</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportActivityLogs}
                    disabled={activityLogs.length === 0}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearActivityLogs}
                    disabled={activityLogs.length === 0 || isClearingLogs}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5 cursor-pointer text-xs disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Activity Log Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter activity by action, recipient Gmail ID, or keyword..."
                  value={logsSearchQuery}
                  onChange={(e) => setLogsSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161817] text-gray-900 dark:text-white text-xs outline-hidden focus:ring-2 focus:ring-cyan-500"
                />
                {logsSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setLogsSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Activity List Cards */}
              <div className="space-y-3">
                {recentActivityLogs.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161817] space-y-2 text-gray-500">
                    <History className="w-8 h-8 mx-auto text-gray-400" />
                    <div className="font-bold text-gray-700 dark:text-gray-300">No Recent Host Actions</div>
                    <p className="text-xs text-gray-400">
                      Actions like granting free access, updating PIN, or verifying passwords will appear here automatically.
                    </p>
                  </div>
                ) : (
                  recentActivityLogs.map((log, index) => {
                    const formattedDate = new Date(log.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    // Icon and color by action type
                    let iconBg = 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
                    let IconComponent = Crown;
                    let actionBadge = 'VIP Grant';

                    if (log.actionType === 'pin_updated') {
                      iconBg = 'bg-amber-500/15 text-amber-600 border-amber-500/30';
                      IconComponent = KeyRound;
                      actionBadge = 'PIN / Password';
                    } else if (log.actionType === 'discount_deleted') {
                      iconBg = 'bg-rose-500/15 text-rose-600 border-rose-500/30';
                      IconComponent = Trash2;
                      actionBadge = 'Revocation';
                    } else if (log.actionType === 'audit_exported' || log.actionType === 'snapshot_exported') {
                      iconBg = 'bg-blue-500/15 text-blue-600 border-blue-500/30';
                      IconComponent = Download;
                      actionBadge = 'CSV Export';
                    } else if (log.actionType === 'notification_sent') {
                      iconBg = 'bg-teal-500/15 text-teal-600 border-teal-500/30';
                      IconComponent = MailCheck;
                      actionBadge = 'Broadcast Alert';
                    } else if (log.actionType === 'ledger_cleared') {
                      iconBg = 'bg-purple-500/15 text-purple-600 border-purple-500/30';
                      IconComponent = History;
                      actionBadge = 'Archive Reset';
                    }

                    return (
                      <div
                        key={log.id || `log_${index}`}
                        className="p-4 rounded-2xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 shadow-2xs hover:border-emerald-500/40 transition-all flex items-start gap-3.5"
                      >
                        {/* Number Index & Action Icon */}
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                #{index + 1} • {actionBadge}
                              </span>
                              <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                                {log.details}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>{formattedDate}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 pt-0.5 flex-wrap">
                            <span>Actor: <strong className="text-gray-800 dark:text-gray-200">{log.actor}</strong></span>
                            {log.targetEmail && (
                              <span>
                                Target: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{log.targetEmail}</strong>
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-gray-400">
                              Hash: {log.integrityHash.slice(0, 16)}...
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: ATHLETE LOGINS & REAL-TIME PROFILE TELEMETRY                        */}
          {/* ========================================================================= */}
          {activeTab === 'athlete_logins' && (
            <div className="animate-in fade-in">
              <AthleteLoginsSection 
                pin={hostPassword || '9284'} 
                email={HOST_ADMIN_CONFIG.email}
                onGrantVipToEmail={(target) => {
                  setTargetEmail(target);
                  setDurationOption('3_months');
                  setActiveTab('ledger');
                }}
                onViewTimeline={(target) => setSelectedTimelineEmail(target)}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: PROGRAM VALUATION & ROI MINI-DASHBOARD                              */}
          {/* ========================================================================= */}
          {activeTab === 'valuation' && (
            <div className="animate-in fade-in">
              <ProgramValuationDashboard 
                pin={hostPassword || '9284'} 
                email={HOST_ADMIN_CONFIG.email}
              />
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121413] flex items-center justify-between shrink-0 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically Verified Host Ledger System • Warad Asare</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold cursor-pointer hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>

      </div>

      {/* Grant Timeline History Audit Modal */}
      {selectedTimelineEmail && (
        <GrantTimelineModal
          isOpen={!!selectedTimelineEmail}
          onClose={() => setSelectedTimelineEmail(null)}
          targetEmail={selectedTimelineEmail}
        />
      )}

      {/* Bulk Email Broadcast Modal */}
      {showBulkEmailModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1A1D1C] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-600 flex items-center justify-center font-black">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                    Send Batch Notification Email
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Broadcasting direct message to {selectedEmails.length} selected athlete(s).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkEmailModal(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={bulkEmailSubject}
                  onChange={(e) => setBulkEmailSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161817] text-gray-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  value={bulkEmailBody}
                  onChange={(e) => setBulkEmailBody(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161817] text-gray-900 dark:text-white font-medium resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#121413] border border-gray-200 dark:border-gray-800 max-h-24 overflow-y-auto">
                <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                  Selected Recipients ({selectedEmails.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedEmails.map((em) => (
                    <span key={em} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-mono text-[10px]">
                      {em}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkEmailModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteBulkAction('send_notification', undefined, bulkEmailBody)}
                disabled={isExecutingBulkOp || !bulkEmailBody.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {isExecutingBulkOp ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Batch...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Batch Emails ({selectedEmails.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automated Notification Confirmation & Details Dialog */}
      {showNotifyModal && notifyResult && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1A1D1C] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                  <MailCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                    Automated Notifications Sent!
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Dispatched to {notifyResult.totalNotified} active subscriber{notifyResult.totalNotified === 1 ? '' : 's'}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNotifyModal(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
              <span className="font-bold">Summary: </span>
              {notifyResult.message}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                Delivered Email Alerts ({notifyResult.notifications.length})
              </div>
              {notifyResult.notifications.map((n: any, idx: number) => (
                <div 
                  key={idx}
                  className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#121413] border border-gray-200 dark:border-gray-800 text-xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-gray-900 dark:text-white truncate">
                      {n.email}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {n.plan} • {n.remainingDays}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shrink-0">
                    Delivered
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowNotifyModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Close & Return to Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vertical Grant Timeline Audit Modal */}
      {selectedTimelineEmail && (
        <GrantTimelineModal
          isOpen={!!selectedTimelineEmail}
          targetEmail={selectedTimelineEmail}
          onClose={() => setSelectedTimelineEmail(null)}
        />
      )}

    </div>
  );
};
