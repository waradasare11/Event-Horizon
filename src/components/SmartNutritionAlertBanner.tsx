import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  ChevronRight, 
  X,
  Dumbbell,
  Flame
} from 'lucide-react';
import { UserProfile, MealLog } from '../types';
import { 
  evaluateNutritionAlert, 
  triggerSmartNutritionNotificationIfOffTarget,
  SmartNutritionAlert 
} from '../lib/smartNutritionAlert';
import { requestNotificationPermission, sendWorkoutNotification } from '../lib/notifications';

interface SmartNutritionAlertBannerProps {
  userProfile: UserProfile;
  mealLogs: MealLog[];
}

export const SmartNutritionAlertBanner: React.FC<SmartNutritionAlertBannerProps> = ({
  userProfile,
  mealLogs,
}) => {
  const [alert, setAlert] = useState<SmartNutritionAlert | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [testSent, setTestSent] = useState<boolean>(false);

  useEffect(() => {
    const calculatedAlert = evaluateNutritionAlert(userProfile, mealLogs);
    setAlert(calculatedAlert);
    setIsDismissed(false);

    // Check and push browser notification if user allowed notifications and off-target
    if (calculatedAlert && calculatedAlert.severity !== 'success') {
      triggerSmartNutritionNotificationIfOffTarget(userProfile, mealLogs).catch(console.warn);
    }
  }, [userProfile, mealLogs]);

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      await sendWorkoutNotification(
        '🔔 Smart Nutrition Alerts Enabled',
        `AROH AI will monitor your daily calories vs protein balance for your ${userProfile.goal} goal.`,
        { sound: true }
      );
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  const handleTestAlert = async () => {
    if (notifPermission !== 'granted') {
      await handleEnableNotifications();
      return;
    }
    const title = alert ? alert.title : '🔔 Smart Nutrition Monitor Active';
    const body = alert 
      ? `${alert.message} Tip: ${alert.actionableTip}`
      : `Tracking active for ${userProfile.dailyCalories} kcal & ${userProfile.dailyProtein}g protein target.`;
    
    await sendWorkoutNotification(title, body, { sound: true });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  if (!alert || isDismissed) {
    // Show notification permission banner if not yet granted
    if (notifPermission !== 'granted') {
      return (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0F6E5F]/10 to-teal-500/10 border border-[#0F6E5F]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-left">
          <div className="flex items-center gap-2 text-[#0F6E5F] dark:text-[#5FD1B8]">
            <BellRing className="w-4 h-4 shrink-0" />
            <span>
              <strong>Smart Nutrition Alerts:</strong> Enable browser notifications to get real-time off-target warnings (e.g. low protein warnings during deficit cuts).
            </span>
          </div>
          <button
            onClick={handleEnableNotifications}
            className="px-3.5 py-1.5 rounded-xl bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white font-bold text-xs shrink-0 transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Enable Push Alerts</span>
          </button>
        </div>
      );
    }
    return null;
  }

  const isWarning = alert.severity === 'warning';
  const isCritical = alert.severity === 'critical';
  const isSuccess = alert.severity === 'success';

  const containerClasses = isCritical || isWarning
    ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
    : isSuccess
    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
    : 'bg-sky-500/10 border-sky-500/30 text-sky-950 dark:text-sky-200';

  const badgeClasses = isCritical || isWarning
    ? 'bg-amber-500 text-white'
    : isSuccess
    ? 'bg-[#0F6E5F] text-white'
    : 'bg-sky-600 text-white';

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border ${containerClasses} shadow-xs space-y-2.5 transition-all text-left animate-in fade-in`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {isWarning || isCritical ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          ) : isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-[#0F6E5F] dark:text-[#5FD1B8] shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9]">
                {alert.title}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${badgeClasses}`}>
                {alert.severity}
              </span>
            </div>
            <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB] mt-1 leading-relaxed">
              {alert.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleTestAlert}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white/80 dark:bg-black/30 border border-current/20 hover:bg-white dark:hover:bg-black/50 transition-all cursor-pointer flex items-center gap-1"
            title="Send test browser notification"
          >
            <Bell className="w-3 h-3" />
            <span className="hidden sm:inline">{testSent ? 'Sent!' : 'Test Alert'}</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actionable Coach Directive */}
      <div className="p-3 rounded-xl bg-white/80 dark:bg-black/25 border border-current/10 text-xs flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-[#0F6E5F] dark:text-[#5FD1B8] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">Actionable Solution: </span>
          <span className="text-[#374151] dark:text-[#E5E7EB]">{alert.actionableTip}</span>
        </div>
      </div>
    </div>
  );
};
