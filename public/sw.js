// Amplifi Service Worker

const CACHE_NAME = 'amplifi-v1.0.0';
const STATIC_CACHE = 'amplifi-static-v1.0.0';
const DYNAMIC_CACHE = 'amplifi-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/firebaseConfig.js',
    '/manifest.json',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker installed');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Firebase and external requests
    if (url.hostname.includes('firebase') || 
        url.hostname.includes('googleapis') || 
        url.hostname.includes('stripe') ||
        url.hostname.includes('googlesyndication')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    return response;
                }

                // Fetch from network
                return fetch(request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the response
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (request.destination === 'document') {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
    console.log('Push event received:', event);

    let notificationData = {
        title: 'Amplifi',
        body: 'You have a new notification!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: {
            url: '/'
        }
    };

    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                ...data
            };
        } catch (error) {
            console.error('Error parsing push data:', error);
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            data: notificationData.data,
            actions: [
                {
                    action: 'open',
                    title: 'Open',
                    icon: '/icons/icon-72x72.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/icons/icon-72x72.png'
                }
            ],
            requireInteraction: true,
            tag: 'amplifi-notification'
        })
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        if (event.notification.data && event.notification.data.url) {
                            client.navigate(event.notification.data.url);
                        }
                        return;
                    }
                }

                // Open new window if app is not open
                if (clients.openWindow) {
                    const url = event.notification.data && event.notification.data.url 
                        ? event.notification.data.url 
                        : '/';
                    return clients.openWindow(url);
                }
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Background sync event:', event);

    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Perform background sync tasks
            syncOfflineActions()
        );
    }
});

// Sync offline actions
async function syncOfflineActions() {
    try {
        // Get offline actions from IndexedDB
        const offlineActions = await getOfflineActions();
        
        for (const action of offlineActions) {
            try {
                // Process each offline action
                await processOfflineAction(action);
                
                // Remove processed action
                await removeOfflineAction(action.id);
            } catch (error) {
                console.error('Error processing offline action:', error);
            }
        }
    } catch (error) {
        console.error('Error syncing offline actions:', error);
    }
}

// Get offline actions from IndexedDB
async function getOfflineActions() {
    // This would typically use IndexedDB to store offline actions
    // For now, return empty array
    return [];
}

// Process offline action
async function processOfflineAction(action) {
    // Process different types of offline actions
    switch (action.type) {
        case 'post':
            // Handle offline post creation
            break;
        case 'comment':
            // Handle offline comment creation
            break;
        case 'like':
            // Handle offline like action
            break;
        default:
            console.log('Unknown offline action type:', action.type);
    }
}

// Remove offline action
async function removeOfflineAction(actionId) {
    // Remove action from IndexedDB
    console.log('Removing offline action:', actionId);
}

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker received message:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Error event
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

// Unhandled rejection event
self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
}); 