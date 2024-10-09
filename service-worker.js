const cacheName = 'diabetes-management-cache-v1';
const assetsToCache = [
    '/',
    '/index.html',
    '/history.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-512x512.png'
];

// Install the service worker and cache all required assets
self.addEventListener('install', event => {
    self.skipWaiting();  // Forces the waiting service worker to activate immediately
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('Caching all assets');
            return cache.addAll(assetsToCache);
        })
    );
});

// Activate the service worker and remove old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [cacheName];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (!cacheWhitelist.includes(cache)) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch assets from the cache if available, otherwise fetch from the network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// Listen for updates and notify users
self.addEventListener('updatefound', () => {
    const newWorker = self.installing;
    newWorker.onstatechange = () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Notify the user about the update
            if (confirm('New version available. Would you like to update?')) {
                window.location.reload();  // Reload the page to update
            }
        }
    };
});
