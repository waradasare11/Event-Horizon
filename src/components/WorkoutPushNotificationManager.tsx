import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Zap,
  Volume2
} from 'lucide-react';
import { UserProfile, WorkoutCompletionLog, WorkoutProgram } from '../types';
import { 
  getStoredPushNotificationPrefs, 
  saveStoredPushNotificationPrefs, 
  requestPushNotificationPermission, 
  getPushNotificationPermission,
  checkAndTrigger6PMWorkoutReminder,
  PushNotificationPrefs
} from '../lib/workoutPushNotification';

interface WorkoutPushNotificationManagerProps {
  userProfile: UserProfile;
  workoutLogs: WorkoutCompletionLog[];
  workoutPrograms?: WorkoutProgram[];
}

export const WorkoutPushNotificationManager: React.FC<WorkoutPushNotificationManagerProps> = ({
  userProfile,
  workoutLogs,
  workoutPrograms,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [prefs, setPrefs] = useState<PushNotificationPrefs>(getStoredPushNotificationPrefs);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    setPermission(getPushNotificationPermission());

    // Auto-check on interval (every 60 seconds)
    const interval = setInterval(() => {
      checkAndTrigger6PMWorkoutReminder({
        userProfile,
        workoutLogs,
        workoutPrograms,
      });
    }, 60000);

    // Initial check
    checkAndTrigger6PMWorkoutReminder({
      userProfile,
      workoutLogs,
      workoutPrograms,
    });

    return () => clearInterval(interval);
  }, [userProfile, workoutLogs, workoutPrograms]);

  const handleRequestPermission = async (): Promise<NotificationPermission> => {
    const res = await requestPushNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      const updated = { ...prefs, enabled: true };
      setPrefs(updated);
      saveStoredPushNotificationPrefs(updated);
      setTestResult('🎉 Push notifications enabled! We will alert you at 6:00 PM if today\'s session is pending.');
      setTimeout(() => setTestResult(null), 4000);
    }
    return res;
  };

  const handleToggleEnable = () => {
    const next = !prefs.enabled;
    const updated = { ...prefs, enabled: next };
    setPrefs(updated);
    saveStoredPushNotificationPrefs(updated);
  };

  const handleTimeChange = (hour: number) => {
    const updated = { ...prefs, reminderHour: hour };
    setPrefs(updated);
    saveStoredPushNotificationPrefs(updated);
  };

  const handleSendTest = () => {
    if (permission !== 'granted') {
      handleRequestPermission().then((perm) => {
        if (perm === 'granted') {
          checkAndTrigger6PMWorkoutReminder({
            userProfile,
            workoutLogs,
            workoutPrograms,
            forceTest: true,
          });
          setTestResult('Test 6:00 PM push notification sent! Check your system notification tray.');
          setTimeout(() => setTestResult(null), 5000);
        }
      });
      return;
    }

    const res = checkAndTrigger6PMWorkoutReminder({
      userProfile,
      workoutLogs,
      workoutPrograms,
      forceTest: true,
    });

    if (res.triggered) {
      setTestResult('✅ 6:00 PM push notification dispatched successfully to your device!');
    } else {
      setTestResult(`Notice: ${res.reason || 'Failed to dispatch'}`);
    }
    setTimeout(() => setTestResult(null), 5000);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const hasLoggedToday = workoutLogs.some((l) => l.date === todayStr && !l.isRestDay);

  return (
    <div className="bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#2A2E2C] rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-2">
              Automated 6:00 PM Workout Push Reminder
              {prefs.enabled && permission === 'granted' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  Active
                </span>
              )}
            </h3>
            <p className="text-xs text-[#5A605B] dark:text-[#9CA3AF] mt-0.5">
              Dispatches a browser notification if you have a workout scheduled for today and haven't logged it by 6 PM.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {permission !== 'granted' ? (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 rounded-xl bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              Enable Web Notifications
            </button>
          ) : (
            <button
              onClick={handleToggleEnable}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                prefs.enabled
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {prefs.enabled ? '✓ Reminders Active' : 'Paused'}
            </button>
          )}

          <button
            onClick={handleSendTest}
            className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1E211F] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Test 6 PM Push
          </button>
        </div>
      </div>

      {testResult && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {testResult}
        </div>
      )}

      {/* Settings row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1E211F] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="text-gray-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            Reminder Time
          </div>
          <select
            value={prefs.reminderHour}
            onChange={(e) => handleTimeChange(parseInt(e.target.value))}
            className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161817] font-bold text-gray-900 dark:text-white"
          >
            <option value={17}>5:00 PM (17:00)</option>
            <option value={18}>6:00 PM (18:00 - Standard)</option>
            <option value={19}>7:00 PM (19:00)</option>
            <option value={20}>8:00 PM (20:00)</option>
          </select>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1E211F] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="text-gray-500">Today's Workout Status</div>
          <div className={`font-bold ${hasLoggedToday ? 'text-emerald-600' : 'text-amber-600'}`}>
            {hasLoggedToday ? '✓ Logged & Complete' : '⏳ Pending Log'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1E211F] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="text-gray-500">Browser Permission</div>
          <div className="font-bold capitalize text-gray-800 dark:text-gray-200">
            {permission === 'granted' ? '✅ Permitted' : permission === 'denied' ? '❌ Blocked' : '⚠️ Click Enable'}
          </div>
        </div>
      </div>
    </div>
  );
};
