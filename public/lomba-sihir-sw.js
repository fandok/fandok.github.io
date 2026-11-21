// Offline cache for the /lomba-sihir page only (registered with scope "/lomba-sihir").
// Navigations: network first (short timeout), fall back to the cached page.
// Hashed build assets: cache first.
const CACHE = 'lomba-sihir-v1'
const PAGE = '/lomba-sihir'

// The SPA is served via 404.html on GitHub Pages, so a 404 HTML response is still the app.
const isAppHtml = (res) =>
  (res.ok || res.status === 404) && (res.headers.get('content-type') || '').includes('text/html')

async function cachePageAndAssets(res) {
  const cache = await caches.open(CACHE)
  const html = await res.clone().text()
  await cache.put(PAGE, new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } }))
  const urls = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+|\/favicon\.svg)"/g)].map((m) => m[1])
  await Promise.all(urls.map(async (u) => {
    if (await cache.match(u)) return
    const r = await fetch(u)
    if (r.ok) await cache.put(u, r)
  }))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch(PAGE, { cache: 'no-store' })
      .then((res) => { if (isAppHtml(res)) return cachePageAndAssets(res) })
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('lomba-sihir-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  if (req.mode === 'navigate') {
    const net = fetch(req)
    // Clone before the page consumes the body (this reaction is registered first, so it runs first).
    const copy = net.then((res) => res.clone())
    // Refresh the offline copy whenever the network answers, even if it was too slow to use.
    event.waitUntil(copy.then((res) => { if (isAppHtml(res)) return cachePageAndAssets(res) }).catch(() => {}))
    event.respondWith((async () => {
      try {
        // Bad signal at a venue: don't wait forever before showing the cached copy.
        return await Promise.race([net, timeout(4000)])
      } catch {
        const cached = await caches.match(PAGE)
        return cached || net
      }
    })())
    return
  }

  if (url.pathname.startsWith('/assets/') || url.pathname === '/favicon.svg') {
    event.respondWith((async () => {
      const cached = await caches.match(req)
      if (cached) return cached
      const res = await fetch(req)
      if (res.ok) {
        const copy = res.clone()
        event.waitUntil(caches.open(CACHE).then((c) => c.put(req, copy)))
      }
      return res
    })())
  }
})
