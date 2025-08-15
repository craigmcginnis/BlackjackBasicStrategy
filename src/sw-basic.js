// Basic placeholder service worker for offline caching (to be enhanced later)
const CACHE = 'bj-trainer-precache-v1';
const PRECACHE_URLS = [
	'/',
	'/index.html',
	'/favicon.ico'
];
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
	);
});
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
	);
});
self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;
	event.respondWith(
		caches.match(event.request).then(
			(cached) =>
				cached ||
				fetch(event.request).then((resp) => {
					const copy = resp.clone();
					caches.open(CACHE).then((cache) => cache.put(event.request, copy));
					return resp;
				})
		)
	);
});
