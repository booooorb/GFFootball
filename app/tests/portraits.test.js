import test from "node:test";
import assert from "node:assert/strict";

import {
  cacheCuratedPortraits,
  cachedPortraitsForPlayers,
  mapCommonsResults,
  loadCuratedPortraitCache,
  mapOpenverseResults,
  mergeCuratedPortraitCache,
  persistCuratedPortraitCache,
  scoreOpenverseResult,
  searchLicensedPortraits,
} from "../js/portraits.js";

const player = {
  id: "messi",
  name: "Lionel Messi",
  theme: "football legends",
};

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); },
  };
}

function result(overrides = {}) {
  return {
    title: "Lionel Messi portrait",
    creator: "Example Photographer",
    creator_url: "https://example.com/creator",
    foreign_landing_url: "https://example.com/source",
    license: "by-sa",
    license_url: "https://creativecommons.org/licenses/by-sa/4.0/",
    mature: false,
    thumbnail: "https://api.openverse.org/example/thumb/",
    width: 900,
    height: 1200,
    tags: [{ name: "football" }],
    ...overrides,
  };
}

test("portrait scoring strongly favors exact named results", () => {
  const exact = scoreOpenverseResult(result(), player.name, player.theme);
  const unrelated = scoreOpenverseResult(
    result({
      title: "Mountain landscape",
      creator: "Someone",
      tags: [{ name: "nature" }],
    }),
    player.name,
    player.theme,
  );
  assert.ok(exact > unrelated + 5);
});

test("Openverse results retain licensed exact matches and reject unsafe entries", () => {
  const candidates = mapOpenverseResults({
    results: [
      result(),
      result({ thumbnail: "https://api.openverse.org/example/thumb/" }),
      result({
        title: "Lionel Messi private image",
        thumbnail: "https://example.com/private.jpg",
        license: "all-rights-reserved",
      }),
      result({
        title: "Lionel Messi mature image",
        thumbnail: "https://example.com/mature.jpg",
        mature: true,
      }),
      result({
        title: "Unrelated mountain",
        creator: "Someone",
        thumbnail: "https://example.com/mountain.jpg",
        tags: [],
      }),
    ],
  }, player);

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].license, "BY-SA");
  assert.equal(candidates[0].sourceUrl, "https://example.com/source");
});

test("Wikimedia Commons results retain attributed reusable photos", () => {
  const candidates = mapCommonsResults({
    query: {
      pages: {
        1: {
          title: "File:Lionel Messi portrait.jpg",
          imageinfo: [{
            width: 900,
            height: 1200,
            thumburl: "https://upload.wikimedia.org/messi.jpg",
            descriptionurl: "https://commons.wikimedia.org/wiki/File:Messi.jpg",
            extmetadata: {
              LicenseShortName: { value: "CC BY-SA 4.0" },
              LicenseUrl: {
                value: "https://creativecommons.org/licenses/by-sa/4.0/",
              },
              Artist: { value: "<a>Example Photographer</a>" },
              ImageDescription: { value: "Lionel Messi before a match" },
            },
          }],
        },
        2: {
          title: "File:Firma de Lionel Messi.svg",
          imageinfo: [{
            width: 500,
            height: 200,
            thumburl: "https://upload.wikimedia.org/signature.png",
            descriptionurl: "https://commons.wikimedia.org/wiki/File:Signature.svg",
            extmetadata: {
              LicenseShortName: { value: "Public domain" },
            },
          }],
        },
      },
    },
  }, player);

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].creator, "Example Photographer");
  assert.equal(candidates[0].license, "CC BY-SA 4.0");
});

test("browser portrait search handles successes and isolated upstream failures", async () => {
  const originalWarn = console.warn;
  const players = [
    player,
    { id: "totoro", name: "Totoro", theme: "Studio Ghibli characters" },
  ];
  const fetchImpl = async (url) => {
    const requestUrl = String(url);
    if (requestUrl.includes("commons.wikimedia.org") && requestUrl.includes("Lionel")) {
      return Response.json({
        query: {
          pages: {
            1: {
              title: "File:Lionel Messi portrait.jpg",
              imageinfo: [{
                width: 900,
                height: 1200,
                thumburl: "https://upload.wikimedia.org/messi.jpg",
                descriptionurl: "https://commons.wikimedia.org/wiki/File:Messi.jpg",
                extmetadata: {
                  LicenseShortName: { value: "CC BY 4.0" },
                  LicenseUrl: {
                    value: "https://creativecommons.org/licenses/by/4.0/",
                  },
                  Artist: { value: "Example Photographer" },
                  ImageDescription: { value: "Lionel Messi portrait" },
                },
              }],
            },
          },
        },
      });
    }
    if (requestUrl.includes("Totoro")) {
      return new Response("rate limited", { status: 429 });
    }
    return Response.json({ results: [] });
  };

  try {
    console.warn = () => {};
    const portraits = await searchLicensedPortraits(players, {
      fetchImpl,
      concurrency: 2,
    });

    assert.equal(portraits.messi.length, 1);
    assert.deepEqual(portraits.totoro, []);
  } finally {
    console.warn = originalWarn;
  }
});

test("curated name cache prevents Wikipedia, Commons, and Openverse requests", async () => {
  const storage = memoryStorage();
  const curated = [
    {
      thumbnail: "https://worker.example/v1/portrait-images/abc/0?v=one",
      title: "First portrait",
      creator: "Source One",
      sourceUrl: "https://source.example/one",
      license: "Source rights apply",
    },
    {
      thumbnail: "https://worker.example/v1/portrait-images/abc/1?v=one",
      title: "Second portrait",
      creator: "Source Two",
      sourceUrl: "https://source.example/two",
      license: "Source rights apply",
    },
  ];

  assert.equal(cacheCuratedPortraits("  LIONEL   Messi ", curated, storage), true);
  assert.equal(cachedPortraitsForPlayers([player], storage).messi.length, 2);

  let requests = 0;
  const portraits = await searchLicensedPortraits([player], {
    storage,
    fetchImpl: async () => {
      requests += 1;
      throw new Error("External image provider should not run.");
    },
  });

  assert.equal(requests, 0);
  assert.deepEqual(portraits.messi, curated.map((candidate) => ({
    ...candidate,
    creatorUrl: "",
    licenseUrl: candidate.sourceUrl,
  })));
});

test("durable portrait cache merges preserve newer local results and add remote names", () => {
  const storage = memoryStorage();
  const candidate = (name) => ({
    thumbnail: `https://worker.example/v1/portrait-images/${name}/0`,
    title: name,
    creator: "Source",
    sourceUrl: `https://source.example/${name}`,
    license: "Source rights apply",
  });
  persistCuratedPortraitCache({
    shared: { name: "Shared", cachedAt: 200, candidates: [candidate("newer-local")] },
    local: { name: "Local", cachedAt: 100, candidates: [candidate("local")] },
  }, storage);

  mergeCuratedPortraitCache({
    shared: { name: "Shared", cachedAt: 50, candidates: [candidate("older-remote")] },
    remote: { name: "Remote", cachedAt: 300, candidates: [candidate("remote")] },
  }, storage);

  const merged = loadCuratedPortraitCache(storage);
  assert.deepEqual(new Set(Object.keys(merged)), new Set(["shared", "local", "remote"]));
  assert.match(merged.shared.candidates[0].thumbnail, /newer-local/);
  assert.match(merged.remote.candidates[0].thumbnail, /remote/);
});

