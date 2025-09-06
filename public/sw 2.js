// Service Worker for Amplifi PWA
// Version: 1.1.0

const CACHE_NAME = 'amplifi-v1.1.0';
const STATIC_CACHE = 'amplifi-static-v1.1.0';
const DYNAMIC_CACHE = 'amplifi-dynamic-v1.1.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/assets/css/styles.css',
    '/assets/js/app.js',
    '/assets/js/adsense-config.js',

    '/assets/js/firebase-loader.js',
    '/amplifi-icon.svg',
    '/amplifi-icon-simple.svg',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Old caches cleaned up');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip Chrome extensions and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Handle different types of requests
    if (url.pathname === '/' || url.pathname === '/index.html') {
        // Main page - serve from cache first, then network
        event.respondWith(serveFromCacheFirst(request, STATIC_CACHE));
    } else if (STATIC_FILES.some(file => url.href.includes(file))) {
        // Static assets - serve from cache first, then network
        event.respondWith(serveFromCacheFirst(request, STATIC_CACHE));
    } else if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/public/')) {
        // App assets - serve from cache first, then network
        event.respondWith(serveFromCacheFirst(request, STATIC_CACHE));
    } else if (url.pathname.includes('firebase') || url.pathname.includes('googleapis')) {
        // Firebase and Google services - network first, then cache
        event.respondWith(serveFromNetworkFirst(request, DYNAMIC_CACHE));
    } else if (url.pathname.includes('adsbygoogle') || url.pathname.includes('googlesyndication')) {
        // AdSense - network only (don't cache ads)
        event.respondWith(fetch(request));
    } else {
        // Other requests - network first, then cache
        event.respondWith(serveFromNetworkFirst(request, DYNAMIC_CACHE));
    }
});

// Cache first strategy
async function serveFromCacheFirst(request, cacheName) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('Service Worker: Serving from cache:', request.url);
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
            console.log('Service Worker: Cached new response:', request.url);
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Error in cache first strategy:', error);
        
        // Return offline page if available
        const offlineResponse = await caches.match('/offline.html');
        if (offlineResponse) {
            return offlineResponse;
        }
        
        // Return a basic offline response
        return new Response('Offline - Please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

// Network first strategy
async function serveFromNetworkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
            console.log('Service Worker: Cached network response:', request.url);
        }
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Network failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page if available
        const offlineResponse = await caches.match('/offline.html');
        if (offlineResponse) {
            return offlineResponse;
        }
        
        // Return a basic offline response
        return new Response('Offline - Please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Handle background sync
async function doBackgroundSync() {
    try {
        // Get pending actions from IndexedDB
        const pendingActions = await getPendingActions();
        
        for (const action of pendingActions) {
            try {
                await processPendingAction(action);
                await removePendingAction(action.id);
                console.log('Service Worker: Processed pending action:', action.id);
            } catch (error) {
                console.error('Service Worker: Error processing pending action:', error);
            }
        }
    } catch (error) {
        console.error('Service Worker: Background sync error:', error);
    }
}

// Get pending actions from IndexedDB
async function getPendingActions() {
    // This would typically use IndexedDB to store pending actions
    // For now, return an empty array
    return [];
}

// Process a pending action
async function processPendingAction(action) {
    switch (action.type) {
        case 'upload':
            // Handle video upload
            break;
        case 'comment':
            // Handle comment posting
            break;
        case 'like':
            // Handle like action
            break;
        default:
            console.log('Service Worker: Unknown action type:', action.type);
    }
}

// Remove a processed pending action
async function removePendingAction(actionId) {
    // This would typically remove from IndexedDB
    console.log('Service Worker: Removed pending action:', actionId);
}

// Push notification handling
self.addEventListener('push', event => {
    console.log('Service Worker: Push notification received');
    
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'New notification from Amplifi',
            icon: data.icon || '/amplifi-icon.svg',
            badge: data.badge || '/amplifi-icon.svg',
            image: data.image,
            tag: data.tag || 'amplifi-notification',
            data: data.data || {},
            actions: data.actions || [],
            requireInteraction: data.requireInteraction || false,
            silent: data.silent || false,
            vibrate: data.vibrate || [200, 100, 200],
            timestamp: data.timestamp || Date.now()
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Amplifi', options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action) {
        // Handle specific action clicks
        handleNotificationAction(event.action, event.notification.data);
    } else {
        // Default click behavior
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle notification actions
function handleNotificationAction(action, data) {
    switch (action) {
        case 'view':
            clients.openWindow(data.url || '/');
            break;
        case 'dismiss':
            // Do nothing, notification already closed
            break;
        default:
            console.log('Service Worker: Unknown notification action:', action);
    }
}

// Message handling from main thread
self.addEventListener('message', event => {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: '1.1.0' });
    }
});

// Error handling
self.addEventListener('error', event => {
    console.error('Service Worker: Error:', event.error);
});

// Unhandled rejection handling
self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker: Unhandled rejection:', event.reason);
});

console.log('Service Worker: Loaded successfully');
