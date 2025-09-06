// Amplifi Service Worker - Enabling Offline Support
// Updated to fix CSS conflicts and improve cache management
const CACHE_NAME = 'amplifi-v11';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/youtube-style.css',
    '/assets/js/app.js',
    '/assets/js/core-features.js',
    '/assets/js/dashboard-functions.js',
    '/assets/js/stripe-service.js',
    '/assets/js/amplifi-features.js',
    '/favicon.svg',
    '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('🔧 Amplifi Service Worker v2 installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Opened cache:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ All resources cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Cache installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Amplifi Service Worker v2 activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activated, old caches cleaned');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const request = event.request;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (!request.url.startsWith(self.location.origin)) {
        return;
    }
    
    // Skip service worker requests
    if (request.url.includes('sw.js')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    console.log('💾 Serving from cache:', request.url);
                    return response;
                }
                
                // Fetch from network if not cached
                return fetch(request)
                    .then((response) => {
                        // Check if response is valid
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone response for caching
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                                console.log('💾 Cached new resource:', request.url);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Return offline fallback for HTML requests
                        if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                        
                        // Return offline fallback for CSS requests
                        if (request.url.includes('.css')) {
                            return caches.match('/assets/css/youtube-style.css');
                        }
                        
                        // Return offline fallback for other requests
                        return new Response('Offline content not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Sync offline data when connection is restored
        console.log('🔄 Syncing offline data...');
        
        // Get all clients
        const clients = await self.clients.matchAll();
        
        // Notify clients about sync completion
        clients.forEach((client) => {
            client.postMessage({
                type: 'background-sync-complete',
                timestamp: new Date().toISOString()
            });
        });
        
        console.log('✅ Background sync completed');
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('🔔 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New content available on Amplifi!',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/favicon.svg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/favicon.svg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Amplifi', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                if (clientList.length > 0) {
                    clientList[0].focus();
                } else {
                    clients.openWindow('/');
                }
            })
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    console.log('📨 Message received in Service Worker:', event.data);
    
    if (event.data && event.data.type === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'cache-urls') {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    }
    
    if (event.data && event.data.type === 'clear-cache') {
        event.waitUntil(
            caches.delete(CACHE_NAME).then(() => {
                console.log('🗑️ Cache cleared as requested');
                return caches.open(CACHE_NAME).then((cache) => {
                    return cache.addAll(urlsToCache);
                });
            })
        );
    }
});

console.log('✅ Amplifi Service Worker v2 loaded successfully');
