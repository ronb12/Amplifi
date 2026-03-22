const CACHE_NAME = 'amplifi-v21-shell';
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/feed.html',
    '/moments.html',
    '/trending.html',
    '/search.html',
    '/upload.html',
    '/video-editor.html',
    '/schedule.html',
    '/live.html',
    '/library.html',
    '/profile.html',
    '/about.html',
    '/privacy.html',
    '/terms.html',
    '/subscriptions.html',
    '/music-library.html',
    '/creator-dashboard.html',
    '/signin.html',
    '/signup.html',
    '/manifest.json',
    '/favicon.svg',
    '/amplifi-icon.svg',
    '/assets/css/youtube-style.css',
    '/assets/js/app.js',
    '/assets/js/core-features.js',
    '/assets/js/dashboard-functions.js',
    '/assets/js/stripe-payments.js',
    '/assets/js/stripe-service.js',
    '/assets/js/auth-guard.js',
    '/assets/js/auth-system.js',
    '/assets/js/upload.js',
    '/assets/js/live-streaming.js',
    '/assets/js/ai-recommendations.js',
    '/assets/js/amplifi-features.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await Promise.allSettled(CORE_ASSETS.map(async (url) => {
            try {
                const response = await fetch(url, { cache: 'no-cache' });
                if (response.ok) {
                    await cache.put(url, response.clone());
                }
            } catch (error) {
                console.warn('Skipping cache for', url, error);
            }
        }));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)));
        await self.clients.claim();
    })());
});

async function fromNetworkThenCache(request) {
    const response = await fetch(request);
    if (response && response.ok && request.method === 'GET' && request.url.startsWith(self.location.origin)) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
    }
    return response;
}

async function fromCache(request) {
    const cache = await caches.open(CACHE_NAME);
    return cache.match(request);
}

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith((async () => {
        const isNavigation = request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');

        if (isNavigation) {
            try {
                return await fromNetworkThenCache(request);
            } catch (error) {
                return await fromCache(request) || await fromCache('/index.html') || new Response('Offline', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                });
            }
        }

        const cached = await fromCache(request);
        if (cached) {
            return cached;
        }

        try {
            return await fromNetworkThenCache(request);
        } catch (error) {
            return new Response('Offline content not available', {
                status: 503,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }
    })());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'skipWaiting') {
        self.skipWaiting();
    }
});
