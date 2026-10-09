const BUILD_VERSION = "1791561145349922000";
const SHELL_CACHE = `dmf-audiotour-shell-${BUILD_VERSION}`;
const TOUR_CACHE = "dmf-audiotour-offline";
const SCOPE_URL = self.registration.scope;
const ASSET_LIST_URL = new URL("offline-assets.json", SCOPE_URL);
const ENABLED_URL = new URL("offline-enabled.json", SCOPE_URL);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll([
        new URL("manifest.json", SCOPE_URL),
        new URL("pwa-icon.svg", SCOPE_URL),
      ]);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith("dmf-audiotour-shell-") && name !== SHELL_CACHE,
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();

      const tourCache = await caches.open(TOUR_CACHE);
      if (await tourCache.match(ENABLED_URL)) {
        try {
          await downloadAssets(tourCache, await getAssetPaths());
          await tourCache.put(
            ENABLED_URL,
            new Response(JSON.stringify({ version: BUILD_VERSION }), {
              headers: { "Content-Type": "application/json" },
            }),
          );
          await notifyClients({ type: "CACHE_UPDATED" });
        } catch (error) {
          console.error("Could not update the offline audiotour cache.", error);
          await notifyClients({
            type: "CACHE_UPDATE_FAILED",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(TOUR_CACHE);
      if (request.mode === "navigate") {
        try {
          const response = await fetch(request);
          if (await cache.match(ENABLED_URL)) {
            await cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          const cached = await cache.match(request, { ignoreSearch: true });
          if (cached) {
            return cached;
          }
          throw error;
        }
      }

      const cached = await cache.match(request, { ignoreSearch: true });
      return cached || fetch(request);
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "DOWNLOAD_TOUR" || !event.ports[0]) {
    return;
  }

  const port = event.ports[0];
  const task = (async () => {
    try {
      const cache = await caches.open(TOUR_CACHE);
      const assetPaths = await getAssetPaths();
      await downloadAssets(cache, assetPaths, (completed, path) => {
        port.postMessage({
          type: "DOWNLOAD_PROGRESS",
          completed,
          total: assetPaths.length,
          path,
        });
      });
      await cache.put(
        ENABLED_URL,
        new Response(JSON.stringify({ version: BUILD_VERSION }), {
          headers: { "Content-Type": "application/json" },
        }),
      );
      port.postMessage({ type: "DOWNLOAD_COMPLETE", total: assetPaths.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      port.postMessage({ type: "DOWNLOAD_FAILED", message });
      console.error("Could not download the offline audiotour.", error);
    }
  })();

  event.waitUntil(task);
});

async function getAssetPaths() {
  const response = await fetch(ASSET_LIST_URL, { cache: "reload" });
  if (!response.ok) {
    throw new Error(`Assetlijst ophalen mislukt (HTTP ${response.status}).`);
  }
  const paths = await response.json();
  if (!Array.isArray(paths) || paths.some((path) => typeof path !== "string")) {
    throw new Error("De offline-assetlijst heeft een ongeldig formaat.");
  }
  return paths;
}

async function downloadAssets(cache, assetPaths, onProgress) {
  const desiredUrls = new Set([ASSET_LIST_URL.href, ENABLED_URL.href]);
  const listResponse = await fetch(ASSET_LIST_URL, { cache: "reload" });
  if (!listResponse.ok) {
    throw new Error(`Assetlijst ophalen mislukt (HTTP ${listResponse.status}).`);
  }
  await cache.put(ASSET_LIST_URL, listResponse.clone());

  let completed = 0;
  for (const path of assetPaths) {
    const url = new URL(path, SCOPE_URL);
    if (url.origin !== self.location.origin || !url.href.startsWith(SCOPE_URL)) {
      throw new Error(`Ongeldig bestandspad in offline-assetlijst: ${path}`);
    }
    const response = await fetch(url, { cache: "reload" });
    if (!response.ok) {
      throw new Error(`${path} downloaden mislukt (HTTP ${response.status}).`);
    }
    await cache.put(url, response);
    desiredUrls.add(url.href);
    completed += 1;
    if (onProgress) {
      onProgress(completed, path);
    }
  }

  const cachedRequests = await cache.keys();
  await Promise.all(
    cachedRequests
      .filter((request) => !desiredUrls.has(request.url))
      .map((request) => cache.delete(request)),
  );
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });
  clients.forEach((client) => client.postMessage(message));
}
