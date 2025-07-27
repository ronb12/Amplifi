// Enhanced Service Worker for Seamless PWA Experience
const CACHE_NAME = 'amplifi-cache-v1.0.48'; // Incremented version for full cache refresh
const STATIC_CACHE = 'amplifi-static-v2.2';
const DYNAMIC_CACHE = 'amplifi-dynamic-v2.2';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/feed.html',
    '/upload.html',
    '/dashboard.html',
    '/messages.html',
    '/live.html',
    '/profile.html',
    '/settings.html',
    '/privacy-settings.html',
    '/search.html',
    '/bookmarks.html',
    '/styles.css',
    '/enhanced-buttons.css',
    '/app.js',
    '/js/feed.js',
    '/js/landing.js',
    '/js/utils.js',
    '/firebaseConfig.js',
    '/manifest.json',
    '/icons/icon.svg',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/default-avatar.svg',
    '/default-banner.svg',
    '/hero-image.svg'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    self.skipWaiting(); // Forces new service worker to activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle different types of requests
    if (url.pathname.startsWith('/api/')) {
        // API requests - network first, cache fallback
        event.respondWith(handleApiRequest(request));
    } else if (url.pathname.includes('.html') || url.pathname === '/') {
        // HTML pages - cache first, network fallback
        event.respondWith(handleHtmlRequest(request));
    } else if (url.pathname.includes('.css') || url.pathname.includes('.js')) {
        // Static assets - cache first, network fallback
        event.respondWith(handleStaticRequest(request));
    } else if (url.pathname.includes('.png') || url.pathname.includes('.jpg') || url.pathname.includes('.svg')) {
        // Images - cache first, network fallback
        event.respondWith(handleImageRequest(request));
    } else {
        // Default - network first, cache fallback
        event.respondWith(handleDefaultRequest(request));
    }
});

// Handle API requests
async function handleApiRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache successful API responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Try to serve from cache if network fails
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Handle HTML requests
async function handleHtmlRequest(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        // Update cache in background
        fetch(request).then(response => {
            if (response.ok) {
                caches.open(STATIC_CACHE).then(cache => {
                    cache.put(request, response);
                });
            }
        }).catch(() => {});
        return cachedResponse;
    }
    return fetch(request);
}

// Handle static asset requests
async function handleStaticRequest(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return new Response('Offline - Static asset not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Handle image requests
async function handleImageRequest(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        // Return a placeholder image or default avatar
        return caches.match('/default-avatar.svg');
    }
}

// Handle default requests
async function handleDefaultRequest(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync-posts') {
        event.waitUntil(syncOfflinePosts());
    } else if (event.tag === 'background-sync-likes') {
        event.waitUntil(syncOfflineLikes());
    } else if (event.tag === 'background-sync-comments') {
        event.waitUntil(syncOfflineComments());
    } else if (event.tag === 'background-sync-profile') {
        event.waitUntil(syncOfflineProfile());
    }
});

// Sync offline posts
async function syncOfflinePosts() {
    try {
        const offlinePosts = await getOfflineData('offline_posts');
        if (offlinePosts && offlinePosts.length > 0) {
            console.log('Syncing', offlinePosts.length, 'offline posts');
            
            for (const post of offlinePosts) {
                await syncPostToServer(post);
            }
            
            // Clear offline posts after successful sync
            await clearOfflineData('offline_posts');
            
            // Notify all clients
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'offline-sync-complete',
                    data: { posts: offlinePosts.length }
                });
            });
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Sync offline likes
async function syncOfflineLikes() {
    try {
        const offlineLikes = await getOfflineData('offline_likes');
        if (offlineLikes && offlineLikes.length > 0) {
            console.log('Syncing', offlineLikes.length, 'offline likes');
            
            for (const like of offlineLikes) {
                await syncLikeToServer(like);
            }
            
            await clearOfflineData('offline_likes');
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Sync offline comments
async function syncOfflineComments() {
    try {
        const offlineComments = await getOfflineData('offline_comments');
        if (offlineComments && offlineComments.length > 0) {
            console.log('Syncing', offlineComments.length, 'offline comments');
            
            for (const comment of offlineComments) {
                await syncCommentToServer(comment);
            }
            
            await clearOfflineData('offline_comments');
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Sync offline profile updates
async function syncOfflineProfile() {
    try {
        const offlineProfile = await getOfflineData('offline_profile');
        if (offlineProfile) {
            console.log('Syncing offline profile updates');
            await syncProfileToServer(offlineProfile);
            await clearOfflineData('offline_profile');
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', event => {
    console.log('Push notification received');
    
    let notificationData = {
        title: 'Amplifi',
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: {
            url: '/notifications.html'
        }
    };

    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = { ...notificationData, ...data };
        } catch (error) {
            console.error('Error parsing push data:', error);
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked');
    
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/notifications.html';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window if app is not open
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Message handling from main app
self.addEventListener('message', event => {
    try {
        console.log('Service Worker received message:', JSON.stringify(event.data));
    } catch (e) {
        console.log('Service Worker received message:', event.data);
    }
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
        // After skipWaiting, tell all clients to reload
        self.clients.matchAll({ type: 'window' }).then(clients => {
            clients.forEach(client => client.postMessage({ type: 'RELOAD_PAGE' }));
        });
    }
    
    if (event.data && event.data.type === 'CACHE_POSTS') {
        event.waitUntil(cachePosts(event.data.posts));
    }
    
    if (event.data && event.data.type === 'SYNC_REQUEST') {
        event.waitUntil(handleSyncRequest(event.data));
    }
});

// Cache posts for offline viewing
async function cachePosts(posts) {
    const cache = await caches.open(DYNAMIC_CACHE);
    for (const post of posts) {
        if (post.mediaUrl) {
            try {
                const response = await fetch(post.mediaUrl);
                if (response.ok) {
                    cache.put(post.mediaUrl, response);
                }
            } catch (error) {
                console.log('Failed to cache post media:', error);
            }
        }
    }
}

// Handle sync requests from main app
async function handleSyncRequest(data) {
    if (data.action === 'post') {
        await storeOfflineData('offline_posts', data.post);
        await self.registration.sync.register('background-sync-posts');
    } else if (data.action === 'like') {
        await storeOfflineData('offline_likes', data.like);
        await self.registration.sync.register('background-sync-likes');
    } else if (data.action === 'comment') {
        await storeOfflineData('offline_comments', data.comment);
        await self.registration.sync.register('background-sync-comments');
    } else if (data.action === 'profile') {
        await storeOfflineData('offline_profile', data.profile);
        await self.registration.sync.register('background-sync-profile');
    }
}

// Helper functions for IndexedDB operations
async function getOfflineData(key) {
    return new Promise((resolve) => {
        const request = indexedDB.open('AmplifiOffline', 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('offlineData')) {
                db.createObjectStore('offlineData', { keyPath: 'key' });
            }
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['offlineData'], 'readonly');
            const store = transaction.objectStore('offlineData');
            const getRequest = store.get(key);
            
            getRequest.onsuccess = () => {
                resolve(getRequest.result ? getRequest.result.value : null);
            };
        };
    });
}

async function storeOfflineData(key, value) {
    return new Promise((resolve) => {
        const request = indexedDB.open('AmplifiOffline', 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('offlineData')) {
                db.createObjectStore('offlineData', { keyPath: 'key' });
            }
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['offlineData'], 'readwrite');
            const store = transaction.objectStore('offlineData');
            
            // Get existing data
            const getRequest = store.get(key);
            getRequest.onsuccess = () => {
                let existingData = getRequest.result ? getRequest.result.value : [];
                if (!Array.isArray(existingData)) {
                    existingData = [];
                }
                
                // Add new data
                existingData.push({
                    ...value,
                    timestamp: Date.now(),
                    id: Date.now() + Math.random()
                });
                
                // Store updated data
                const putRequest = store.put({ key, value: existingData });
                putRequest.onsuccess = () => resolve();
            };
        };
    });
}

async function clearOfflineData(key) {
    return new Promise((resolve) => {
        const request = indexedDB.open('AmplifiOffline', 1);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['offlineData'], 'readwrite');
            const store = transaction.objectStore('offlineData');
            const deleteRequest = store.delete(key);
            deleteRequest.onsuccess = () => resolve();
        };
    });
}

// Server sync functions (placeholder - implement with your backend)
async function syncPostToServer(post) {
    // Implement your server sync logic here
    console.log('Syncing post to server:', post);
    return Promise.resolve();
}

async function syncLikeToServer(like) {
    try {
    console.log('Syncing like to server:', like);
        
        // Try to sync to Firestore directly if possible
        // This is a fallback since we don't have a server API
        return Promise.resolve({ success: true, message: 'Like synced locally' });
    } catch (error) {
        console.error('Error syncing like:', error);
        return Promise.resolve({ success: false, error: error.message });
    }
}

async function syncCommentToServer(comment) {
    try {
    console.log('Syncing comment to server:', comment);
        return Promise.resolve({ success: true, message: 'Comment synced locally' });
    } catch (error) {
        console.error('Error syncing comment:', error);
        return Promise.resolve({ success: false, error: error.message });
    }
}

async function syncProfileToServer(profile) {
    try {
    console.log('Syncing profile to server:', profile);
        return Promise.resolve({ success: true, message: 'Profile synced locally' });
    } catch (error) {
        console.error('Error syncing profile:', error);
        return Promise.resolve({ success: false, error: error.message });
    }
}

console.log('Enhanced Service Worker loaded successfully'); 