/**
 * Service Worker & Notification Service for scheduled workouts.
 * Uses Service Worker Registration, Web Notification API, custom audio synthesizers via Web Audio API,
 * and handles backgrounded tabs gracefully.
 */

let swRegistration: ServiceWorkerRegistration | null = null;

export interface NotificationScheduleCheck {
  isWorkoutDay: boolean;
  dayName: string;
  workoutTitle: string;
  preferredTime: string;
}

/**
 * Register Service Worker for push and background notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = registration;
    console.log('[AROH SW] Service Worker registered successfully with scope:', registration.scope);
    return registration;
  } catch (err) {
    console.warn('[AROH SW] Service Worker registration failed or unsupported in current environment:', err);
    return null;
  }
}

/**
 * Play an uplifting pleasant chime using Web Audio API
 */
export function playWorkoutChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic Chord (E5 -> G#5 -> B5 -> E6)
    const freqs = [659.25, 830.61, 987.77, 1318.51];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.85);
    });
  } catch (err) {
    console.warn('Audio chime playback omitted or unsupported:', err);
  }
}

/**
 * Request Notification permission from the browser
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
    }
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Trigger a browser notification (prioritizing Service Worker so it alerts even if tab is backgrounded)
 */
export async function sendWorkoutNotification(
  title: string,
  body: string,
  options?: { sound?: boolean; icon?: string; tag?: string; data?: any }
): Promise<boolean> {
  if (options?.sound !== false) {
    playWorkoutChime();
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  // 1. Try displaying via Service Worker registration (guarantees display when browser/tab is backgrounded)
  try {
    let reg = swRegistration;
    if (!reg && 'serviceWorker' in navigator) {
      reg = await navigator.serviceWorker.getRegistration();
    }

    if (reg && 'showNotification' in reg) {
      await reg.showNotification(title, {
        body,
        icon: options?.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: options?.tag || 'aroh-workout-reminder',
        renotify: true,
        data: options?.data || { url: '/?tab=workouts' },
      } as any);
      return true;
    }
  } catch (swErr) {
    console.warn('[AROH SW] Fallback to standard Notification API:', swErr);
  }

  // 2. Fallback to standard window Notification instance
  try {
    const notification = new Notification(title, {
      body,
      icon: options?.icon || '/favicon.ico',
      tag: options?.tag || 'peakform-workout-reminder',
      badge: '/favicon.ico',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return true;
  } catch (err) {
    console.warn('Standard Notification instantiation error:', err);
    return false;
  }
}

