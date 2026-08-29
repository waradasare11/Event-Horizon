import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Volume2, 
  VolumeX, 
  Settings, 
  X,
  Play,
  Calendar
} from 'lucide-react';
import { UserProfile, WorkoutProgram, WorkoutNotificationSettings } from '../types';
import { requestNotificationPermission, sendWorkoutNotification, playWorkoutChime } from '../lib/notifications';

interface WorkoutNotificationBannerProps {
  userProfile: UserProfile;
  currentProgram: WorkoutProgram;
  onUpdateNotificationSettings: (settings: WorkoutNotificationSettings) => void;
}

export const WorkoutNotificationBanner: React.FC<WorkoutNotificationBannerProps> = ({
  userProfile,
  currentProgram,
  onUpdateNotificationSettings,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [testSent, setTestSent] = useState<boolean>(false);

  const defaultSettings: WorkoutNotificationSettings = {
    enabled: true,
    reminderLeadTimeMin: 30,
    customReminderTime: '07:30',
    soundEnabled: true,
  };

  const currentSettings = userProfile.notificationSettings || defaultSettings;

  // Determine today's day of week
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'short' }); // e.g. "Mon"
  const isScheduledToday = (userProfile.selectedDays || []).includes(todayDayName);
  const todayWorkoutDay = currentProgram?.days.find(
    (d) => d.dayOfWeek.toLowerCase().includes(todayDayName.toLowerCase()) || d.dayName.toLowerCase().includes(todayDayName.toLowerCase())
  ) || currentProgram?.days[0];

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
    if (perm === 'granted') {
      const updated: WorkoutNotificationSettings = {
        ...currentSettings,
        enabled: true,
      };
      onUpdateNotificationSettings(updated);
      // Trigger a celebratory welcoming notification
      sendWorkoutNotification(
        '🔥 PeakForm Workout Notifications Active!',
        `You are set up to receive reminders for scheduled sessions like ${todayWorkoutDay?.dayName || 'your next workout'}.`,
        { sound: currentSettings.soundEnabled }
      );
    }
  };

  const handleSendTestNotification = () => {
    setTestSent(true);
    sendWorkoutNotification(
      '🏋️ PeakForm: Time for Your Scheduled Workout!',
      `Today's Focus: ${todayWorkoutDay?.dayName || 'Scientific Hypertrophy Session'} (${todayWorkoutDay?.focus || 'Push Strength'}). Lace up!`,
      { sound: currentSettings.soundEnabled }
    );
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleToggleSound = () => {
    const updated: WorkoutNotificationSettings = {
      ...currentSettings,
      soundEnabled: !currentSettings.soundEnabled,
    };
    onUpdateNotificationSettings(updated);
    if (!currentSettings.soundEnabled) {
      playWorkoutChime();
    }
  };

  const handleToggleEnabled = () => {
    const updated: WorkoutNotificationSettings = {
      ...currentSettings,
      enabled: !currentSettings.enabled,
    };
    onUpdateNotificationSettings(updated);
  };

  return (
    <div className="text-left space-y-3">
      {/* Primary Notification Bar */}
      <div className="bg-gradient-to-r from-[#0F6E5F]/10 via-[#0F6E5F]/5 to-emerald-500/10 dark:from-[#0F6E5F]/20 dark:via-[#161817] dark:to-emerald-950/30 border border-[#0F6E5F]/30 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0F6E5F] text-white shrink-0 shadow-2xs">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-[#1A1D1B] dark:text-[#E8ECE9]">
                Workout Schedule Notifications
              </h3>
              {permission === 'granted' && currentSettings.enabled ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] dark:text-[#4ADE80] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {permission === 'denied' ? 'Permission Denied in Browser' : 'Ready to Enable'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
              {isScheduledToday
                ? `Today (${todayDayName}) is a training day: ${todayWorkoutDay?.dayName || 'Scheduled Session'}. Consistency reminders keep you on track.`
                : `Next training days: ${(userProfile.selectedDays || ['Mon', 'Wed', 'Fri']).join(', ')}. Reminders will trigger automatically.`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {permission !== 'granted' ? (
            <button
              onClick={handleEnableNotifications}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F6E5F] text-white text-xs font-bold hover:bg-[#0D5B4F] transition-all shadow-xs cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Browser Alerts</span>
            </button>
          ) : (
            <button
              onClick={handleSendTestNotification}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#1A1D1B] dark:text-[#E8ECE9] text-xs font-semibold hover:bg-gray-100 dark:hover:bg-[#282C2A] transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 text-[#0F6E5F] dark:text-[#5FD1B8]" />
              <span>{testSent ? 'Chime Sent!' : 'Test Alert & Audio'}</span>
            </button>
          )}

          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-xl bg-white dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-[#E8ECE9] hover:bg-gray-100 dark:hover:bg-[#282C2A] transition-all cursor-pointer"
            title="Notification Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#242826] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#0F6E5F] dark:text-[#5FD1B8]" />
                <h3 className="font-bold text-base text-[#1A1D1B] dark:text-[#E8ECE9]">
                  Workout Notification Settings
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-[#6B7280] hover:text-[#1A1D1B] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Enable toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C]">
                <div>
                  <div className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">Workout Day Reminders</div>
                  <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Notify on scheduled program days</div>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.enabled}
                  onChange={handleToggleEnabled}
                  className="w-4 h-4 accent-[#0F6E5F] rounded cursor-pointer"
                />
              </div>

              {/* Sound toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C]">
                <div>
                  <div className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">Synthesized Harmonic Chime</div>
                  <div className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">Play Web Audio tone with reminder</div>
                </div>
                <button
                  onClick={handleToggleSound}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    currentSettings.soundEnabled
                      ? 'bg-[#0F6E5F]/10 border-[#0F6E5F] text-[#0F6E5F] dark:text-[#5FD1B8]'
                      : 'bg-gray-100 dark:bg-[#242826] border-[#E5E7EB] dark:border-[#2A2E2C] text-[#9CA3AF]'
                  }`}
                >
                  {currentSettings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              {/* Reminder Lead Time */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] block">
                  Lead Time Before Preferred Training Time
                </label>
                <select
                  value={currentSettings.reminderLeadTimeMin}
                  onChange={(e) => {
                    onUpdateNotificationSettings({
                      ...currentSettings,
                      reminderLeadTimeMin: Number(e.target.value),
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none"
                >
                  <option value={15}>15 minutes before session</option>
                  <option value={30}>30 minutes before session (Recommended)</option>
                  <option value={60}>1 hour before session</option>
                  <option value={120}>2 hours before session</option>
                </select>
              </div>

              {/* Target days display */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300">
                <div className="font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Configured Training Days:</span>
                </div>
                <div className="mt-1 font-mono">
                  {(userProfile.selectedDays || ['Mon', 'Wed', 'Fri']).join(' • ')}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#242826] flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 rounded-xl bg-[#0F6E5F] text-white text-xs font-bold hover:bg-[#0D5B4F] transition-all cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
