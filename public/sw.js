importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
self.__WB_DISABLE_DEV_LOGS = true;
try {
  workbox.setConfig({ debug: false });
} catch (e) {}

// This is your Service Worker, you can put any of your custom Service Worker
// code in this file, above the `precacheAndRoute` line.

// When widget is installed/pinned, push initial state.
self.addEventListener('widgetinstall', (event) => {
  event.waitUntil(updateWidget(event));
});

// When widget is shown, update content to ensure it is up-to-date.
self.addEventListener('widgetresume', (event) => {
  event.waitUntil(updateWidget(event));
});

// When the user clicks an element with an associated Action.Execute,
// handle according to the 'verb' in event.action.
self.addEventListener('widgetclick', (event) => {
  if (event.action == 'updateName') {
    event.waitUntil(updateName(event));
  }
});

// When the widget is uninstalled/unpinned, clean up any unnecessary
// periodic sync or widget-related state.
self.addEventListener('widgetuninstall', (event) => {});

const updateWidget = async (event) => {
  // The widget definition represents the fields specified in the manifest.
  const widgetDefinition = event.widget.definition;

  // Fetch the template and data defined in the manifest to generate the payload.
  const payload = {
    template: JSON.stringify(await (await fetch(widgetDefinition.msAcTemplate)).json()),
    data: JSON.stringify(await (await fetch(widgetDefinition.data)).json()),
  };

  // Push payload to widget.
  await self.widgets.updateByInstanceId(event.instanceId, payload);
};

const updateName = async (event) => {
  const name = event.data.json().name;

  // The widget definition represents the fields specified in the manifest.
  const widgetDefinition = event.widget.definition;

  // Fetch the template and data defined in the manifest to generate the payload.
  const payload = {
    template: JSON.stringify(await (await fetch(widgetDefinition.msAcTemplate)).json()),
    data: JSON.stringify({ name }),
  };

  // Push payload to widget.
  await self.widgets.updateByInstanceId(event.instanceId, payload);
};

// Claim clients immediately so updated SW controls pages ASAP
workbox.core.skipWaiting();
workbox.core.clientsClaim();
workbox.navigationPreload.enable();
workbox.precaching.cleanupOutdatedCaches();

// Show an update flow
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Set a consistent cache naming convention
workbox.core.setCacheNameDetails({ prefix: 'puppyland', suffix: 'v1' });

// Precache manifest entries when available (e.g., via Workbox build). Guarded fallback keeps SW valid in dev.
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
workbox.precaching.precacheAndRoute([
  { url: '/offline.html', revision: '1' },
  { url: '/', revision: '1' },
  { url: '/index.html', revision: '1' },
  { url: '/manifest.json', revision: '1' },
]);

// Offline fallback for navigations
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    // Try the precache first
    const cache = await caches.open(workbox.core.cacheNames.precache);
    const cached = await cache.match('/offline.html');
    if (cached) return cached;
    // Fallback to any cache
    const anyCached = await caches.match('/offline.html');
    if (anyCached) return anyCached;
  }
  return Response.error();
});

// App Shell / HTML: Network-first so we get updates when online, use cache offline
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'html-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      new workbox.expiration.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }),
    ],
  })
);

// JS and CSS: Stale-while-revalidate for fast loads while updating in background
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 }),
    ],
  })
);

// Local static assets under /assets: Cache-first (immutable)
workbox.routing.registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/assets/'),
  new workbox.strategies.CacheFirst({
    cacheName: 'app-assets',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 180,
      }),
    ],
  })
);

// Fonts: Cache-first (immutable), long TTL
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'font',
  new workbox.strategies.CacheFirst({
    cacheName: 'font-cache',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

// Images: Cache-first with limit and expiration
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 300,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

// Map tiles (OpenStreetMap): Cache-first with expiration
workbox.routing.registerRoute(
  ({ url }) => url.hostname.endsWith('.tile.osm.org'),
  new workbox.strategies.CacheFirst({
    cacheName: 'osm-tiles',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 60 * 60 * 24 * 14,
      }),
    ],
  })
);

// Local CSS/JS assets: SWR for quick updates
workbox.routing.registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'local-static-swr',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

// API requests: Prefer network, fall back to cache when offline; keep cache reasonably fresh
workbox.routing.registerRoute(
  ({ url, request }) =>
    url.origin === 'https://mydogapi.azurewebsites.net' && request.method === 'GET',
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 10 }), // 10 minutes
    ],
  })
);

// Queue POST requests while offline, replay when back online
workbox.routing.registerRoute(
  ({ url, request }) =>
    url.origin === 'https://mydogapi.azurewebsites.net' && request.method === 'POST',
  new workbox.strategies.NetworkOnly({
    plugins: [
      new workbox.backgroundSync.BackgroundSyncPlugin('api-post-queue', {
        maxRetentionTime: 60 * 24, // Retry for up to 24 hours
      }),
    ],
  }),
  'POST'
);
