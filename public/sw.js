// Cache only the public application shell. API responses and credentials never enter CacheStorage.
const CACHE = 'startup-sim-public-v2'
const SHELL = ['/', '/index.html', '/manifest.json', '/favicon.svg']

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('startup-sim-') && key !== CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', event => {
  const {request} = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      url.pathname.startsWith('/api/') || request.headers.has('Authorization')) return
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => await caches.match('/index.html') || new Response('Offline',{status:503})))
    return
  }
  if (!SHELL.includes(url.pathname) && !url.pathname.startsWith('/assets/') && !url.pathname.startsWith('/audio/')) return
  event.respondWith((async () => {
    const cached = await caches.match(request)
    if (cached) return cached
    const response = await fetch(request)
    if (response.ok && response.type !== 'opaque') {
      const cache = await caches.open(CACHE)
      await cache.put(request,response.clone())
    }
    return response
  })())
})
