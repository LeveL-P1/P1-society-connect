// Push notification service worker
// Handles background push events and notification clicks

self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192.png',
      badge: data.badge || '/icons/icon-192.png',
      tag: data.tag || 'default',
      data: { url: data.url || '/dashboard' },
      vibrate: [200, 100, 200],
      requireInteraction: data.tag === 'visitor-approval' || data.tag === 'emergency',
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'Society Manager', options)
    );
  } catch (e) {
    console.error('Push parse error:', e);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
