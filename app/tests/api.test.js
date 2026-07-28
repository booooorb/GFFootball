import test from "node:test";
import assert from "node:assert/strict";

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); },
  };
}

test("automatic portrait lookup checks curated cache before the Worker image API", async () => {
  const storage = memoryStorage();
  const originalWindow = globalThis.window;
  const originalStorage = globalThis.localStorage;
  const originalFetch = globalThis.fetch;
  const requests = [];
  const candidate = {
    thumbnail: "https://images.example/player.jpg",
    title: "Player portrait",
    creator: "Example photographer",
    creatorUrl: "",
    sourceUrl: "https://images.example/source",
    license: "BY-SA",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  };

  globalThis.window = {
    GFF_CONFIG: {
      apiBaseUrl: "https://worker.example",
      turnstileSiteKey: "test-site-key",
    },
  };
  globalThis.localStorage = storage;
  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url: String(url), body: JSON.parse(options.body || "{}") });
    if (String(url).endsWith("/v1/portrait-cache")) {
      return Response.json({ status: "ok", portraits: { player: [] } });
    }
    if (String(url).endsWith("/v1/portraits")) {
      return Response.json({ status: "ok", portraits: { player: [candidate] } });
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const { fetchPortraitCandidates } = await import(`../js/api.js?test=${Date.now()}`);
    const portraits = await fetchPortraitCandidates([
      { id: "player", name: "Example Player", theme: "footballers" },
    ]);

    assert.deepEqual(requests.map(({ url }) => url), [
      "https://worker.example/v1/portrait-cache",
      "https://worker.example/v1/portraits",
    ]);
    assert.deepEqual(portraits.player, [candidate]);
  } finally {
    globalThis.window = originalWindow;
    globalThis.localStorage = originalStorage;
    globalThis.fetch = originalFetch;
  }
});
