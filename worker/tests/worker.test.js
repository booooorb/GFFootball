import test from "node:test";
import assert from "node:assert/strict";

import {
  FORMATION_POSITIONS,
  INITIAL_SQUAD_SIZE,
  MARKET_PACK_SIZE,
  SOURCE_PROMPT,
  buildDeveloperPrompt,
  extractGeminiOutput,
  mapSerpApiImageResults,
  mergeDeveloperGameData,
  marketPositionsForPack,
  positionPlanForPack,
  scoreOpenverseResult,
  validateModelPack,
  validateTeamPackRequest,
} from "../src/index.js";
import worker from "../src/index.js";

function validRequest() {
  return {
    theme: "Studio Ghibli characters",
    formationId: "4-3-3",
    excludedNames: ["Existing Player"],
    anonymousUserId: "anonymous-user-123",
    turnstileToken: "token",
    clientVersion: 4,
  };
}

function validPack(formationId = "4-3-3") {
  return validPackForPositions(FORMATION_POSITIONS[formationId]);
}

function validPackForPositions(positions) {
  return {
    status: "ok",
    players: positions.map((position, index) => ({
      name: `Character ${index + 1}`,
      position,
    })),
  };
}

function memoryKv(initialValue = null) {
  return {
    value: initialValue,
    gets: 0,
    puts: 0,
    async get() {
      this.gets += 1;
      return this.value;
    },
    async put(_key, value) {
      this.puts += 1;
      this.value = value;
    },
  };
}

function mapKv(initialValues = {}) {
  const values = new Map(Object.entries(initialValues));
  return {
    values,
    gets: [],
    puts: [],
    async get(key, type) {
      this.gets.push({ key, type });
      const value = values.get(key);
      if (value == null) return null;
      if (type === "json") return typeof value === "string" ? JSON.parse(value) : value;
      return value;
    },
    async put(key, value, options) {
      this.puts.push({ key, value, options });
      values.set(key, value);
    },
  };
}

test("generator contract supports every playable formation", () => {
  assert.deepEqual(Object.keys(FORMATION_POSITIONS), [
    "4-3-3",
    "4-4-2",
    "3-5-2",
    "4-5-1",
    "4-2-3-1",
    "3-4-2-1",
    "5-4-1",
  ]);
  assert.ok(Object.values(FORMATION_POSITIONS).every((positions) => positions.length === 11));
});

test("team-pack requests are normalized and bounded", () => {
  const value = validateTeamPackRequest({
    ...validRequest(),
    theme: "  Studio   Ghibli characters  ",
    excludedNames: Array.from({ length: 120 }, (_, index) => `Name ${index}`),
  });

  assert.equal(value.theme, "Studio Ghibli characters");
  assert.equal(value.clientVersion, 4);
  assert.equal(value.initialSquad, false);
  assert.equal(value.excludedNames.length, 110);
  assert.equal(
    validateTeamPackRequest({ ...validRequest(), clientVersion: undefined }).clientVersion,
    1,
  );
  assert.throws(
    () => validateTeamPackRequest({ ...validRequest(), theme: "x" }),
    /between 2 and 80/i,
  );
  assert.throws(
    () => validateTeamPackRequest({ ...validRequest(), formationId: "2-2-6" }),
    /supported formation/i,
  );
  assert.throws(
    () => validateTeamPackRequest({
      ...validRequest(),
      initialSquad: true,
    }),
    /empty club/i,
  );
});

test("model pack validation enforces uniqueness, exclusions, and exact positions", () => {
  const pack = validPack();
  assert.equal(validateModelPack(pack, "4-3-3").valid, true);

  const duplicate = structuredClone(pack);
  duplicate.players[1].name = duplicate.players[0].name;
  assert.equal(validateModelPack(duplicate, "4-3-3").valid, false);

  assert.equal(validateModelPack(pack, "4-3-3", ["Character 4"]).valid, false);

  const wrongPosition = structuredClone(pack);
  wrongPosition.players[0].position = "ST";
  assert.equal(validateModelPack(wrongPosition, "4-3-3").valid, false);
});

test("position plans rotate high-priority names across exact roles", () => {
  for (const [formationId, requiredPositions] of Object.entries(FORMATION_POSITIONS)) {
    const plans = Array.from({ length: 80 }, (_, index) =>
      positionPlanForPack(formationId, `pack-seed-${index}`),
    );

    for (const plan of plans) {
      assert.deepEqual(
        [...plan].sort(),
        [...requiredPositions].sort(),
      );
      assert.ok(plan.slice(0, 6).some((position) =>
        ["LB", "CB", "RB", "LWB", "RWB"].includes(position),
      ));
      assert.ok(plan.slice(0, 6).some((position) =>
        ["CM", "CDM"].includes(position),
      ));
    }

    const highPriorityRoles = new Set(plans.flatMap((plan) => plan.slice(0, 3)));
    for (const role of new Set(requiredPositions)) {
      assert.ok(
        highPriorityRoles.has(role),
        `${role} should reach a top-three priority rank in ${formationId}`,
      );
    }
  }
});

test("market packs accept eleven authentic roles without formation balancing", () => {
  const positions = Array.from({ length: MARKET_PACK_SIZE }, (_, index) => index < 8 ? "ST" : "RW");
  const sampledRoles = marketPositionsForPack("authentic-market");
  assert.equal(sampledRoles.length, MARKET_PACK_SIZE);
  assert.deepEqual(sampledRoles, marketPositionsForPack("authentic-market"));
  const result = validateModelPack(
    validPackForPositions(positions),
    "4-3-3",
    [],
    null,
    MARKET_PACK_SIZE,
  );

  assert.equal(MARKET_PACK_SIZE, 11);
  assert.equal(result.valid, true);
  assert.deepEqual(result.players.map((player) => player.position), positions);
});
test("no-info contains no players and obsolete statuses are rejected", () => {
  assert.deepEqual(
    validateModelPack({ status: "no_info", players: [] }, "4-4-2"),
    { valid: true, status: "no_info", players: [], reason: "" },
  );
  assert.equal(
    validateModelPack(
      { status: "unexpected_status", players: [] },
      "4-4-2",
    ).valid,
    false,
  );
});

test("SerpAPI image mapping returns the first twenty safe unique results", () => {
  const results = Array.from({ length: 24 }, (_, index) => ({
    position: index + 1,
    thumbnail: `https://images.example/thumb-${index}.jpg`,
    original: `https://images.example/original-${index}.jpg`,
    original_width: 800 + index,
    original_height: 1000 + index,
    title: `Portrait ${index + 1}`,
    link: `https://source.example/player-${index}`,
    source: "Example source",
    unsafe: false,
  }));
  results[2].unsafe = true;
  results[4].original = results[3].original;
  results[6].link = "javascript:alert(1)";

  const mapped = mapSerpApiImageResults({ images_results: results });

  assert.equal(mapped.length, 20);
  assert.equal(mapped[0].title, "Portrait 1");
  assert.ok(mapped.every((candidate) => candidate.index >= 0));
  assert.ok(mapped.every((candidate) => candidate.sourceUrl.startsWith("https://")));
  assert.ok(!mapped.some((candidate) => candidate.title === "Portrait 3"));
  assert.ok(!mapped.some((candidate) => candidate.title === "Portrait 5"));
  assert.ok(!mapped.some((candidate) => candidate.title === "Portrait 7"));
});

test("portrait scoring strongly favors exact named results", () => {
  const exact = scoreOpenverseResult(
    {
      title: "Hayao Miyazaki portrait",
      creator: "Example Photographer",
      tags: [{ name: "Studio Ghibli" }],
      width: 900,
      height: 1200,
    },
    "Hayao Miyazaki",
    "Studio Ghibli",
  );
  const unrelated = scoreOpenverseResult(
    {
      title: "Mountain landscape",
      creator: "Someone",
      tags: [{ name: "nature" }],
      width: 1600,
      height: 900,
    },
    "Hayao Miyazaki",
    "Studio Ghibli",
  );

  assert.ok(exact > unrelated + 5);
});

test("the model receives the supplied source prompt with the theme inserted", () => {
  assert.match(SOURCE_PROMPT, /\[INSERT THEME HERE\]/);
  const prompt = buildDeveloperPrompt("Studio Ghibli characters");
  assert.match(prompt, /associated with "Studio Ghibli characters"/);
  assert.match(prompt, /single list with no other text/);
  assert.match(prompt, /NO INFO/);
  assert.doesNotMatch(prompt, /breach/i);
  assert.match(prompt, /exactly 11 unique names/i);
  assert.match(prompt, /positions are unrestricted and may repeat/i);
  assert.doesNotMatch(prompt, /positionByPriority/);
});

test("Gemini output extraction parses JSON and rejects safety blocks", () => {
  const pack = validPack();
  assert.deepEqual(
    extractGeminiOutput({
      candidates: [{
        finishReason: "STOP",
        content: { parts: [{ text: JSON.stringify(pack) }] },
      }],
    }),
    pack,
  );

  assert.throws(
    () => extractGeminiOutput({
      promptFeedback: { blockReason: "SAFETY" },
    }),
    /blocked the prompt/i,
  );
  assert.throws(
    () => extractGeminiOutput({
      candidates: [{
        finishReason: "PROHIBITED_CONTENT",
        content: { parts: [] },
      }],
    }),
    /blocked the response/i,
  );
});

test("status endpoint reports whether the Gemini connection is configured", async () => {
  const request = new Request("https://worker.example/v1/status", {
    headers: { Origin: "https://booooorb.github.io" },
  });
  const response = await worker.fetch(request, {
    GEMINI_API_KEY: "configured-for-test",
    ENVIRONMENT: "production",
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.status, "ok");
  assert.equal(payload.generator, "gemini");
  assert.equal(payload.model, "gemini-3.5-flash-lite");
  assert.deepEqual(payload.fallbackModels, ["gemini-3.1-flash-lite"]);
  assert.equal(payload.apiContractVersion, 6);
  assert.equal(payload.developerGameStorage, false);
  assert.equal(payload.packSize, MARKET_PACK_SIZE);
  assert.equal(payload.marketPackSize, MARKET_PACK_SIZE);
  assert.equal(payload.initialSquadSize, INITIAL_SQUAD_SIZE);
  assert.deepEqual(payload.formationIds, Object.keys(FORMATION_POSITIONS));
  assert.equal(payload.billingMode, "free-tier-project-required");
});

test("status endpoint allows loopback development origins on any port", async () => {
  const response = await worker.fetch(
    new Request("https://worker.example/v1/status", {
      headers: { Origin: "http://localhost:5500" },
    }),
    {
      GEMINI_API_KEY: "configured-for-test",
      ENVIRONMENT: "production",
    },
  );

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("Access-Control-Allow-Origin"),
    "http://localhost:5500",
  );

  const blocked = await worker.fetch(
    new Request("https://worker.example/v1/status", {
      headers: { Origin: "https://untrusted.example" },
    }),
    {
      GEMINI_API_KEY: "configured-for-test",
      ENVIRONMENT: "production",
    },
  );
  assert.equal(blocked.status, 403);
});

test("team packs use Gemini structured output and preserve the supplied prompt", async () => {
  const originalFetch = globalThis.fetch;
  let capturedBody;
  const rateLimitKv = memoryKv();

  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /generativelanguage\.googleapis\.com/);
    assert.match(String(url), /gemini-3\.5-flash-lite:generateContent$/);
    assert.equal(options.headers["x-goog-api-key"], "gemini-test-key");
    capturedBody = JSON.parse(options.body);
    const modelInput = JSON.parse(capturedBody.contents[0].parts[0].text);
    return new Response(JSON.stringify({
      candidates: [{
        finishReason: "STOP",
        content: {
          parts: [{
            text: JSON.stringify(validPackForPositions(modelInput.requiredPositions.length ? modelInput.requiredPositions : Array.from({ length: modelInput.requestedCount }, (_, index) => index < 7 ? "ST" : "RW"))),
          }],
        },
      }],
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const request = new Request("https://worker.example/v1/team-packs", {
      method: "POST",
      headers: {
        Origin: "http://localhost:8000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...validRequest(),
        turnstileToken: "dev-bypass",
      }),
    });
    const response = await worker.fetch(request, {
      GEMINI_API_KEY: "gemini-test-key",
      TURNSTILE_SECRET: "dev-bypass",
      ENVIRONMENT: "development",
      RATE_LIMIT: rateLimitKv,
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, "ok");
    assert.equal(payload.model, "gemini-3.5-flash-lite");
    assert.equal(payload.packType, "market");
    assert.equal(payload.players.length, MARKET_PACK_SIZE);
    const modelInput = JSON.parse(capturedBody.contents[0].parts[0].text);
    assert.deepEqual(modelInput.requiredPositions, []);
    assert.equal(payload.players.filter((player) => player.position === "ST").length, 7);
    assert.equal(payload.players.filter((player) => player.position === "RW").length, 4);
    assert.match(
      capturedBody.systemInstruction.parts[0].text,
      /associated with "Studio Ghibli characters"/,
    );
    assert.equal(
      capturedBody.generationConfig.responseMimeType,
      "application/json",
    );
    assert.equal(
      capturedBody.generationConfig.responseJsonSchema.properties.status.type,
      "string",
    );
    assert.equal(
      capturedBody.generationConfig.responseJsonSchema.properties.players.minItems,
      MARKET_PACK_SIZE,
    );
    assert.equal(modelInput.requestedCount, MARKET_PACK_SIZE);
    assert.deepEqual(
      capturedBody.generationConfig.responseJsonSchema.properties.status.enum,
      ["ok", "no_info"],
    );
    assert.equal(rateLimitKv.gets, 0);
    assert.equal(rateLimitKv.puts, 0);
    assert.equal(payload.remainingToday, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("team generation falls back to the secondary free-tier model", async () => {
  const originalFetch = globalThis.fetch;
  const requestedModels = [];

  globalThis.fetch = async (url, options) => {
    requestedModels.push(String(url));
    if (String(url).includes("gemini-3.5-flash-lite")) {
      return Response.json(
        { error: { status: "UNAVAILABLE" } },
        { status: 503 },
      );
    }
    const modelInput = JSON.parse(
      JSON.parse(options.body).contents[0].parts[0].text,
    );
    return Response.json({
      candidates: [{
        finishReason: "STOP",
        content: {
          parts: [{
            text: JSON.stringify(validPackForPositions(modelInput.requiredPositions.length ? modelInput.requiredPositions : Array.from({ length: modelInput.requestedCount }, (_, index) => index < 7 ? "ST" : "RW"))),
          }],
        },
      }],
    });
  };

  try {
    const response = await worker.fetch(
      new Request("https://worker.example/v1/team-packs", {
        method: "POST",
        headers: {
          Origin: "http://localhost:8000",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validRequest(),
          turnstileToken: "dev-bypass",
        }),
      }),
      {
        GEMINI_API_KEY: "gemini-test-key",
        TURNSTILE_SECRET: "dev-bypass",
        ENVIRONMENT: "development",
      },
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.model, "gemini-3.1-flash-lite");
    assert.equal(requestedModels.length, 2);
    assert.match(requestedModels[0], /gemini-3\.5-flash-lite/);
    assert.match(requestedModels[1], /gemini-3\.1-flash-lite/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("an initial-squad request returns all eleven formation players", async () => {
  const originalFetch = globalThis.fetch;
  let capturedBody;

  globalThis.fetch = async (_url, options) => {
    capturedBody = JSON.parse(options.body);
    const modelInput = JSON.parse(capturedBody.contents[0].parts[0].text);
    return new Response(JSON.stringify({
      candidates: [{
        finishReason: "STOP",
        content: {
          parts: [{
            text: JSON.stringify(validPackForPositions(modelInput.requiredPositions.length ? modelInput.requiredPositions : Array.from({ length: modelInput.requestedCount }, (_, index) => index < 7 ? "ST" : "RW"))),
          }],
        },
      }],
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const request = new Request("https://worker.example/v1/team-packs", {
      method: "POST",
      headers: {
        Origin: "http://localhost:8000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...validRequest(),
        initialSquad: true,
        excludedNames: [],
        turnstileToken: "dev-bypass",
      }),
    });
    const response = await worker.fetch(request, {
      GEMINI_API_KEY: "gemini-test-key",
      TURNSTILE_SECRET: "dev-bypass",
      ENVIRONMENT: "development",
      RATE_LIMIT: memoryKv(),
    });
    const payload = await response.json();
    const modelInput = JSON.parse(capturedBody.contents[0].parts[0].text);

    assert.equal(response.status, 200);
    assert.equal(payload.packType, "initial_squad");
    assert.equal(payload.players.length, INITIAL_SQUAD_SIZE);
    assert.equal(modelInput.requestedCount, INITIAL_SQUAD_SIZE);
    assert.deepEqual(
      [...payload.players.map((player) => player.position)].sort(),
      [...FORMATION_POSITIONS["4-3-3"]].sort(),
    );
    assert.equal(
      capturedBody.generationConfig.responseJsonSchema.properties.players.minItems,
      INITIAL_SQUAD_SIZE,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("the public quota counts successful packs but not failed Gemini attempts", async () => {
  const originalFetch = globalThis.fetch;
  const rateLimitKv = memoryKv();
  const makeRequest = () => new Request("https://worker.example/v1/team-packs", {
    method: "POST",
    headers: {
      Origin: "https://booooorb.github.io",
      "Content-Type": "application/json",
      "CF-Connecting-IP": "203.0.113.10",
    },
    body: JSON.stringify(validRequest()),
  });
  const env = {
    GEMINI_API_KEY: "gemini-test-key",
    TURNSTILE_SECRET: "turnstile-test-key",
    ENVIRONMENT: "production",
    RATE_LIMIT: rateLimitKv,
  };

  try {
    globalThis.fetch = async (url) => {
      if (String(url).includes("siteverify")) {
        return Response.json({ success: true });
      }
      return new Response(JSON.stringify({
        error: { status: "UNAVAILABLE" },
      }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    };

    const failedResponse = await worker.fetch(makeRequest(), env);
    assert.equal(failedResponse.status, 502);
    assert.equal(rateLimitKv.value, null);
    assert.equal(rateLimitKv.puts, 0);

    globalThis.fetch = async (url, options) => {
      if (String(url).includes("siteverify")) {
        return Response.json({ success: true });
      }
      const modelInput = JSON.parse(
        JSON.parse(options.body).contents[0].parts[0].text,
      );
      return Response.json({
        candidates: [{
          finishReason: "STOP",
          content: {
            parts: [{
              text: JSON.stringify(validPackForPositions(modelInput.requiredPositions.length ? modelInput.requiredPositions : Array.from({ length: modelInput.requestedCount }, (_, index) => index < 7 ? "ST" : "RW"))),
            }],
          },
        }],
      });
    };

    const successfulResponse = await worker.fetch(makeRequest(), env);
    const payload = await successfulResponse.json();
    assert.equal(successfulResponse.status, 200);
    assert.equal(rateLimitKv.value, "1");
    assert.equal(rateLimitKv.puts, 1);
    assert.equal(payload.remainingToday, 5);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Gemini refusals and free-quota errors use public API statuses", async () => {
  const originalFetch = globalThis.fetch;
  const makeRequest = () => new Request("https://worker.example/v1/team-packs", {
    method: "POST",
    headers: {
      Origin: "http://localhost:8000",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...validRequest(),
      turnstileToken: "dev-bypass",
    }),
  });
  const env = {
    GEMINI_API_KEY: "gemini-test-key",
    TURNSTILE_SECRET: "dev-bypass",
    ENVIRONMENT: "development",
  };

  try {
    globalThis.fetch = async () => new Response(JSON.stringify({
      promptFeedback: { blockReason: "SAFETY" },
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    const blockedResponse = await worker.fetch(makeRequest(), env);
    const blockedPayload = await blockedResponse.json();
    assert.equal(blockedResponse.status, 400);
    assert.equal(blockedPayload.status, "invalid_theme");
    assert.match(blockedPayload.message, /re-enter/i);

    globalThis.fetch = async () => new Response(JSON.stringify({
      error: { status: "RESOURCE_EXHAUSTED" },
    }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "45",
      },
    });
    const quotaResponse = await worker.fetch(makeRequest(), env);
    const quotaPayload = await quotaResponse.json();
    assert.equal(quotaResponse.status, 429);
    assert.equal(quotaPayload.status, "rate_limited");
    assert.equal(quotaPayload.retryAfterSeconds, 45);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("non-list Gemini output asks the player to re-enter the theme", async () => {
  const originalFetch = globalThis.fetch;
  let attempts = 0;
  const request = new Request("https://worker.example/v1/team-packs", {
    method: "POST",
    headers: {
      Origin: "http://localhost:8000",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...validRequest(),
      turnstileToken: "dev-bypass",
    }),
  });

  try {
    globalThis.fetch = async () => {
      attempts += 1;
      return Response.json({
        candidates: [{
          finishReason: "STOP",
          content: { parts: [{ text: "This is prose, not a player list." }] },
        }],
      });
    };

    const response = await worker.fetch(request, {
      GEMINI_API_KEY: "gemini-test-key",
      TURNSTILE_SECRET: "dev-bypass",
      ENVIRONMENT: "development",
    });
    const payload = await response.json();

    assert.equal(attempts, 2);
    assert.equal(response.status, 400);
    assert.equal(payload.status, "invalid_theme");
    assert.match(payload.message, /re-enter/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("developer game data merge preserves every local and server entity", () => {
  const current = {
    capturedAt: 100,
    drafts: [
      { id: "shared", name: "Older server draft", updatedAt: 10 },
      { id: "server-only", name: "Server only", updatedAt: 20 },
    ],
    publishedOpponents: [
      { sourceDraftId: "server-team", name: "Server team", updatedAt: 20 },
    ],
    portraitCache: {
      shared: { name: "Shared", cachedAt: 30, candidates: [{ thumbnail: "https://example.com/server.jpg" }] },
    },
  };
  const incoming = {
    capturedAt: 200,
    drafts: [
      { id: "shared", name: "Newer browser draft", updatedAt: 40 },
      { id: "browser-only", name: "Browser only", updatedAt: 30 },
    ],
    publishedOpponents: [
      { sourceDraftId: "browser-team", name: "Browser team", updatedAt: 30 },
    ],
    portraitCache: {
      shared: { name: "Shared", cachedAt: 10, candidates: [{ thumbnail: "https://example.com/old.jpg" }] },
      browser: { name: "Browser", cachedAt: 40, candidates: [{ thumbnail: "https://example.com/browser.jpg" }] },
    },
  };

  const merged = mergeDeveloperGameData(current, incoming);

  assert.deepEqual(new Set(merged.drafts.map((draft) => draft.id)), new Set([
    "shared",
    "server-only",
    "browser-only",
  ]));
  assert.equal(merged.drafts.find((draft) => draft.id === "shared").name, "Newer browser draft");
  assert.deepEqual(new Set(merged.publishedOpponents.map((team) => team.sourceDraftId)), new Set([
    "server-team",
    "browser-team",
  ]));
  assert.equal(merged.portraitCache.shared.cachedAt, 30);
  assert.ok(merged.portraitCache.browser);

  const bulk = mergeDeveloperGameData({}, {
    drafts: Array.from({ length: 140 }, (_, index) => ({ id: `draft-${index}`, updatedAt: index })),
    publishedOpponents: Array.from({ length: 80 }, (_, index) => ({ sourceDraftId: `team-${index}`, updatedAt: index })),
    portraitCache: Object.fromEntries(Array.from({ length: 520 }, (_, index) => [
      `portrait-${index}`,
      { cachedAt: index, candidates: [] },
    ])),
  });
  assert.equal(bulk.drafts.length, 140);
  assert.equal(bulk.publishedOpponents.length, 80);
  assert.equal(Object.keys(bulk.portraitCache).length, 520);
});

test("developer game storage backs up, merges, restores, and resolves stale saves", async () => {
  const portraitKv = mapKv();
  const env = {
    DEVELOPER_MODE_TOKEN: "dev-secret",
    ENVIRONMENT: "production",
    PORTRAIT_CACHE: portraitKv,
  };
  const headers = {
    Origin: "http://localhost:8000",
    "Content-Type": "application/json",
    Authorization: "Bearer dev-secret",
  };
  const browserSnapshot = {
    capturedAt: 100,
    drafts: [{ id: "browser-draft", name: "Browser Draft", updatedAt: 100 }],
    publishedOpponents: [{ sourceDraftId: "browser-draft", name: "Browser XI", updatedAt: 100 }],
    portraitCache: {
      browser: {
        name: "Browser Player",
        cachedAt: 100,
        candidates: [{ thumbnail: "https://example.com/browser.jpg" }],
      },
    },
  };

  const mergeResponse = await worker.fetch(new Request(
    "https://worker.example/v1/developer/game-data/merge",
    { method: "POST", headers, body: JSON.stringify({ snapshot: browserSnapshot }) },
  ), env);
  const merged = await mergeResponse.json();

  assert.equal(mergeResponse.status, 200);
  assert.equal(merged.mode, "merged");
  assert.equal(merged.revision, 1);
  assert.deepEqual(merged.counts, {
    drafts: 1,
    publishedOpponents: 1,
    portraitCacheEntries: 1,
  });
  assert.ok(portraitKv.values.has("developer:game-data:v1"));
  assert.equal(
    [...portraitKv.values.keys()].filter((key) => key.includes("game-data-backup")).length,
    2,
  );

  const loadResponse = await worker.fetch(new Request(
    "https://worker.example/v1/developer/game-data/load",
    { method: "POST", headers, body: "{}" },
  ), env);
  const loaded = await loadResponse.json();
  assert.equal(loadResponse.status, 200);
  assert.equal(loaded.snapshot.drafts[0].id, "browser-draft");

  const saveResponse = await worker.fetch(new Request(
    "https://worker.example/v1/developer/game-data/save",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        expectedRevision: 1,
        snapshot: {
          ...loaded.snapshot,
          drafts: [...loaded.snapshot.drafts, { id: "saved-draft", updatedAt: 200 }],
        },
      }),
    },
  ), env);
  const saved = await saveResponse.json();
  assert.equal(saveResponse.status, 200);
  assert.equal(saved.mode, "saved");
  assert.equal(saved.revision, 2);

  const staleSaveResponse = await worker.fetch(new Request(
    "https://worker.example/v1/developer/game-data/save",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        expectedRevision: 1,
        snapshot: {
          capturedAt: 300,
          drafts: [{ id: "stale-client-draft", updatedAt: 300 }],
          publishedOpponents: [],
          portraitCache: {},
        },
      }),
    },
  ), env);
  const staleSaved = await staleSaveResponse.json();
  assert.equal(staleSaveResponse.status, 200);
  assert.equal(staleSaved.mode, "merged-conflict");
  assert.deepEqual(new Set(staleSaved.snapshot.drafts.map((draft) => draft.id)), new Set([
    "browser-draft",
    "saved-draft",
    "stale-client-draft",
  ]));

  const publicResponse = await worker.fetch(new Request(
    "https://worker.example/v1/game-data/published-opponents",
    { headers: { Origin: "https://booooorb.github.io" } },
  ), env);
  const publicPayload = await publicResponse.json();
  assert.equal(publicResponse.status, 200);
  assert.equal(publicPayload.opponents[0].sourceDraftId, "browser-draft");

  const unauthorized = await worker.fetch(new Request(
    "https://worker.example/v1/developer/game-data/load",
    {
      method: "POST",
      headers: { Origin: "http://localhost:8000", "Content-Type": "application/json" },
      body: "{}",
    },
  ), env);
  assert.equal(unauthorized.status, 403);
});

