// Service Worker for Grand Arena Wind Monitor
// Handles Web Push notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.')
  event.waitUntil(clients.claim())
})

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push received:', event)

  let data = {}
  if (event.data) {
    data = event.data.json()
  }

  const options = {
    body: data.body || 'Alertă vânt detectată!',
    icon: '/logo.png',
    badge: '/logo.png',
    image: '/logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/dashboard',
      alertId: data.alertId
    },
    actions: [
      {
        action: 'view',
        title: 'Vezi detalii'
      },
      {
        action: 'dismiss',
        title: 'Închide'
      }
    ],
    requireInteraction: true,
    silent: false
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || '⚠️ Alertă Vânt Grand Arena',
      options
    )
  )
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event)

  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }

        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Handle background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Performing background sync...')
}