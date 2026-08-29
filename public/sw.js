// PeakForm AI - Service Worker for Background Workout Push & Scheduled Notifications
const CACHE_NAME = 'peakform-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push notifications from server or background triggers
self.addEventListener('push', (event) => {
  let data = {
    title: '🏋️ Time for Your Scheduled Workout!',
    body: 'Your evidence-based training session is ready. Tap to start.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'peakform-workout-reminder',
    data: { url: '/?tab=workouts' },
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'peakform-workout-reminder',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || { url: '/?tab=workouts' },
    actions: [
      { action: 'start', title: '🚀 Start Workout' },
      { action: 'snooze', title: '⏱️ Remind in 15m' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle user clicking on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const targetUrl = event.notification.data?.url || '/?tab=workouts';

  if (action === 'snooze') {
    // Schedule a reminder after 15 minutes
    setTimeout(() => {
      self.registration.showNotification('🔔 Workout Reminder (Snoozed)', {
        body: 'Your 15-minute warmup snooze is up! Let\'s hit your muscle targets.',
        icon: '/favicon.ico',
        tag: 'peakform-workout-snooze',
        requireInteraction: true,
        vibrate: [200, 100, 200],
      });
    }, 15 * 60 * 1000);
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({ type: 'NAVIGATE_TAB', tab: 'workouts' });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle custom background messaging from React app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, actions } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: tag || 'peakform-scheduled-reminder',
      renotify: true,
      vibrate: [200, 100, 200],
      actions: actions || [
        { action: 'start', title: '🚀 Start Workout' },
      ],
      data: { url: '/?tab=workouts' },
    });
  }
});
