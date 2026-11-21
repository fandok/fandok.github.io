// Offline cache for the /lomba-sihir page only (registered with scope "/lomba-sihir").
// Navigations: network first (short timeout), fall back to the cached page.
// Hashed build assets: cache first.
const CACHE = 'lomba-sihir-v1'
const PAGE = '/lomba-sihir'
const MATCH = { ignoreVary: true } // hosts may send "Vary: Origin"; hashed assets never change

// The SPA is served via 404.html on GitHub Pages, so a 404 is still the app if it is our HTML.
// Checking for the root div filters out captive-portal and error pages.
async function appHtml(res) {
  if (!(res.ok || res.status === 404)) return null
  if (!(res.headers.get('content-type') || '').includes('text/html')) return null
  const html = await res.clone().text()
  return html.includes('id="root"') ? html : null
}

async function cachePageAndAssets(html) {
  const cache = await caches.open(CACHE)
  const urls = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+|\/favicon\.svg)"/g)].map((m) => m[1])
  // Cache every asset first; only then swap the page, so the cached page never points at missing files.
  await Promise.all(urls.map(async (u) => {
    if (await cache.match(u, MATCH)) return
    const r = await fetch(u)
    if (!r.ok) throw new Error(`asset ${u} ${r.status}`)
    await cache.put(u, r)
  }))
  await cache.put(PAGE, new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } }))
  // Drop assets from older builds.
  const keep = new Set(urls.map((u) => new URL(u, self.location.origin).href))
  for (const req of await cache.keys()) {
    if (new URL(req.url).pathname.startsWith('/assets/') && !keep.has(req.url)) await cache.delete(req)
  }
}

async function refresh(res) {
  const html = await appHtml(res)
  if (html) await cachePageAndAssets(html)
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch(PAGE, { cache: 'no-store' })
      .then(refresh)
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
    event.waitUntil(copy.then(refresh).catch(() => {}))
    event.respondWith((async () => {
      const cached = () => caches.match(PAGE, MATCH)
      try {
        // Bad signal at a venue: don't wait forever before showing the cached copy.
        const res = await Promise.race([net, timeout(4000)])
        if (await appHtml(res)) return res
        return (await cached()) || res
      } catch {
        return (await cached()) || net
      }
    })())
    return
  }

  if (url.pathname.startsWith('/assets/') || url.pathname === '/favicon.svg') {
    event.respondWith((async () => {
      const cached = await caches.match(req, MATCH)
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
