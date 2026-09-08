/**
 * Automated Push Notification Service for Scheduled Workouts
 * Utilizes the browser Web Notification API to alert athletes
 * when a workout is scheduled for the day but hasn't been logged by 6:00 PM.
 */

import { UserProfile, WorkoutCompletionLog, WorkoutProgram } from '../types';

const STORAGE_KEY_LAST_REMINDER = 'peakform_last_6pm_reminder_date';
const STORAGE_KEY_NOTIF_PREFS = 'peakform_workout_push_notif_prefs';

export interface PushNotificationPrefs {
  enabled: boolean;
  reminderHour: number; // default: 18 (6:00 PM)
  reminderMinute: number; // default: 0
  sound: boolean;
}

export function getStoredPushNotificationPrefs(): PushNotificationPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIF_PREFS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return {
    enabled: true,
    reminderHour: 18, // 6 PM
    reminderMinute: 0,
    sound: true,
  };
}

export function saveStoredPushNotificationPrefs(prefs: PushNotificationPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIF_PREFS, JSON.stringify(prefs));
  } catch (e) {
    // ignore
  }
}

/**
 * Request permission for Web Notification API
 */
export async function requestPushNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Web Notification API is not supported in this browser.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn('Error requesting notification permission', e);
    return 'denied';
  }
}

/**
 * Returns current permission status
 */
export function getPushNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Check and trigger automated 6 PM workout reminder if scheduled today but not yet logged
 */
export function checkAndTrigger6PMWorkoutReminder(params: {
  userProfile: UserProfile;
  workoutLogs: WorkoutCompletionLog[];
  workoutPrograms?: WorkoutProgram[];
  forceTest?: boolean;
}): { triggered: boolean; reason?: string } {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { triggered: false, reason: 'Notification API not available' };
  }

  if (Notification.permission !== 'granted' && !params.forceTest) {
    return { triggered: false, reason: 'Notification permission not granted' };
  }

  const prefs = getStoredPushNotificationPrefs();
  if (!prefs.enabled && !params.forceTest) {
    return { triggered: false, reason: 'Notifications disabled in preferences' };
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDayName = dayNamesShort[now.getDay()];

  // Check if reminder was already delivered today
  const lastReminderDate = localStorage.getItem(STORAGE_KEY_LAST_REMINDER);
  if (lastReminderDate === todayStr && !params.forceTest) {
    return { triggered: false, reason: 'Reminder already delivered today' };
  }

  // Check if current time is >= 6:00 PM (or configured reminderHour)
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isPastReminderTime = currentHour > prefs.reminderHour || (currentHour === prefs.reminderHour && currentMinute >= prefs.reminderMinute);

  if (!isPastReminderTime && !params.forceTest) {
    return { triggered: false, reason: `Current time (${currentHour}:${currentMinute}) is before 6:00 PM (${prefs.reminderHour}:00)` };
  }

  // Determine if today is a scheduled training day
  const selectedDays = params.userProfile.selectedDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const isScheduledToday = selectedDays.includes(todayDayName) || (params.userProfile.trainingDaysPerWeek || 4) >= 4;

  if (!isScheduledToday && !params.forceTest) {
    return { triggered: false, reason: 'Today is a scheduled rest day' };
  }

  // Check if user has already logged a workout today
  const hasLoggedToday = params.workoutLogs.some((log) => log.date === todayStr && !log.isRestDay);
  if (hasLoggedToday && !params.forceTest) {
    return { triggered: false, reason: 'Workout already completed and logged for today' };
  }

  // Fire Web Notification!
  try {
    const athleteName = params.userProfile.name || 'Athlete';
    const notification = new Notification('🏋️ AROH: 6:00 PM Workout Reminder', {
      body: `Hey ${athleteName}, it's past 6:00 PM and today's workout hasn't been logged yet! Don't break your streak—get your session in now.`,
      icon: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=128&auto=format&fit=crop&q=80',
      badge: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=128&auto=format&fit=crop&q=80',
      tag: 'aroh-6pm-workout-reminder',
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    localStorage.setItem(STORAGE_KEY_LAST_REMINDER, todayStr);
    return { triggered: true, reason: 'Push notification triggered successfully' };
  } catch (err: any) {
    console.warn('Failed to dispatch notification:', err);
    return { triggered: false, reason: err.message };
  }
}
