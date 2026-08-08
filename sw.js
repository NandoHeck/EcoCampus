/* =============================================================================
   EcoCampus — Service Worker
   Estratégias:
   - App shell (HTML/CSS/JS/ícones): cache-first (com precache no install).
   - Navegação (páginas HTML): network-first + fallback ao cache + offline.html.
   - API (GET /api/*): network-first + fallback cache (permite ver dados offline
     que já foram carregados alguma vez).
   - Fontes/CDN externos (Google Fonts, Iconify): stale-while-revalidate.
   - Mutações (POST/PUT/DELETE): NUNCA cacheadas — sempre passam direto.
============================================================================= */

const VERSION = 'v1.0.0';
const SHELL_CACHE = `ecocampus-shell-${VERSION}`;
const RUNTIME_CACHE = `ecocampus-runtime-${VERSION}`;
const API_CACHE = `ecocampus-api-${VERSION}`;

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/pages/login.html',
  '/pages/cadastro.html',
  '/pages/dashboard.html',
  '/pages/anuncios.html',
  '/pages/anuncio.html',
  '/pages/criar-anuncio.html',
  '/pages/editar-anuncio.html',
  '/pages/perfil.html',
  '/pages/favoritos.html',
  '/pages/404.html',
  '/offline.html',
  '/css/style.css',
  '/css/pages.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/api.js',
  '/js/auth.js',
  '/js/storage.js',
  '/js/ui.js',
  '/js/pages/landing.js',
  '/js/pages/auth.js',
  '/js/pages/dashboard.js',
  '/js/pages/anuncios.js',
  '/js/pages/anuncio.js',
  '/js/pages/criar-anuncio.js',
  '/js/pages/editar-anuncio.js',
  '/js/pages/perfil.js',
  '/js/pages/favoritos.js',
  '/manifest.webmanifest',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/apple-touch-icon.png'
];

// -----------------------------------------------------------------------------
// INSTALL — precache do shell
// -----------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // Adiciona um por um; ignora falhas isoladas (ex.: rota renomeada)
      Promise.all(
        SHELL_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn('[SW] precache falhou:', url, err.message))
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// -----------------------------------------------------------------------------
// ACTIVATE — limpa caches antigos + assume controle imediato
// -----------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  const validCaches = new Set([SHELL_CACHE, RUNTIME_CACHE, API_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => (validCaches.has(k) ? null : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});

// -----------------------------------------------------------------------------
// MESSAGE — permite `postMessage({type:'SKIP_WAITING'})` do cliente
// -----------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// -----------------------------------------------------------------------------
// FETCH — roteamento por tipo de request
// -----------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Só interceptamos GET. Mutações passam direto e nunca são cacheadas.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nunca cachear extensões do navegador / dev-tools
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Requests com Range (streams de vídeo, etc.) — deixa passar
  if (request.headers.has('range')) return;

  const isSameOrigin = url.origin === self.location.origin;
  const isApi = url.pathname.startsWith('/api/');
  const isNavigation = request.mode === 'navigate';
  const isExternal = !isSameOrigin;

  if (isNavigation) {
    event.respondWith(handleNavigation(request));
    return;
  }
  if (isApi) {
    event.respondWith(handleApi(request));
    return;
  }
  if (isSameOrigin) {
    event.respondWith(handleShell(request));
    return;
  }
  if (isExternal) {
    event.respondWith(handleExternal(request));
    return;
  }
});

// -----------------------------------------------------------------------------
// Strategies
// -----------------------------------------------------------------------------

// Navegação: network-first, cache fallback, offline.html como último recurso
async function handleNavigation(request) {
  try {
    const fresh = await fetch(request);
    // guarda cópia atualizada
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, fresh.clone()).catch(() => {});
    return fresh;
  } catch (_e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match('/offline.html');
    if (offline) return offline;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

// API: network-first, mas guarda cópia GET para leitura offline
async function handleApi(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone()).catch(() => {});
    return fresh;
  } catch (_e) {
    const cached = await cache.match(request);
    if (cached) {
      // Adiciona header para o cliente saber que veio de cache
      const headers = new Headers(cached.headers);
      headers.set('X-EcoCampus-Cache', 'HIT');
      return new Response(cached.body, { status: cached.status, statusText: cached.statusText, headers });
    }
    return new Response(
      JSON.stringify({ error: { code: 'OFFLINE', message: 'Sem conexão e sem dados em cache.' } }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Shell (CSS/JS/img same-origin): cache-first
async function handleShell(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok && fresh.type === 'basic') {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch (_e) {
    return caches.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

// Recursos externos (Google Fonts, Iconify): stale-while-revalidate
async function handleExternal(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone()).catch(() => {});
      return res;
    })
    .catch(() => cached);
  return cached || networkFetch;
}
