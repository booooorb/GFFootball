import {
  cacheCuratedPortraits,
  cachedPortraitsForPlayers,
  searchLicensedPortraits,
} from "./portraits.js";

const REQUIRED_API_CONTRACT_VERSION = 5;

const REQUIRED_FORMATION_IDS = Object.freeze([
  "4-3-3", "4-4-2", "3-5-2", "4-5-1", "4-2-3-1", "3-4-2-1", "5-4-1",
]);

const config = Object.freeze({
  apiBaseUrl: String(window.GFF_CONFIG?.apiBaseUrl ?? "").replace(/\/+$/, ""),
  turnstileSiteKey: String(window.GFF_CONFIG?.turnstileSiteKey ?? ""),
});

export class ApiError extends Error {
  constructor(status, message, retryAfterSeconds = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function apiMode() {
  if (config.apiBaseUrl) return "live";
  return "unavailable";
}

export function modeDescription() {
  if (apiMode() === "live") return "Checking the Gemini service…";
  return "AI generation is not connected. Add the deployed Worker URL to config.js.";
}

async function postJson(path, body, { developerToken = "" } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (developerToken) headers.Authorization = `Bearer ${developerToken}`;
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("upstream_error", "The server returned an unreadable response.");
  }

  if (!response.ok || payload.status !== "ok") {
    throw new ApiError(
      payload.status ?? "upstream_error",
      payload.message ?? "The request could not be completed.",
      payload.retryAfterSeconds ?? null,
    );
  }

  return payload;
}

export async function fetchConnectionStatus() {
  if (!config.apiBaseUrl) {
    return {
      connected: false,
      label: "AI offline",
      detail: "Worker URL missing",
    };
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/v1/status`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const payload = await response.json();
    if (!response.ok || payload.status !== "ok" || payload.generator !== "gemini") {
      return {
        connected: false,
        label: "Gemini unavailable",
        detail: payload.message || "Worker is not ready",
      };
    }
    const formationCatalogReady = REQUIRED_FORMATION_IDS.every((formationId) =>
      payload.formationIds?.includes(formationId),
    );
    const contractVersion = Number(payload.apiContractVersion);
    if (
      !Number.isFinite(contractVersion) ||
      contractVersion < REQUIRED_API_CONTRACT_VERSION
    ) {
      return {
        connected: false,
        label: "Worker update needed",
        detail: `Redeploy Worker contract v${REQUIRED_API_CONTRACT_VERSION}`,
      };
    }
    return {
      connected: true,
      label: "Gemini ready",
      detail: formationCatalogReady
        ? `${payload.model} · ${payload.formationIds.length} formations · portraits Commons/Openverse`
        : `${payload.model} · formation compatibility active · portraits Commons/Openverse`,
    };
  } catch {
    return {
      connected: false,
      label: "Gemini unreachable",
      detail: "Could not reach the Worker",
    };
  }
}

export async function fetchPublishedNpcOpponentsFromGameStorage() {
  if (apiMode() !== "live") return { opponents: [], revision: 0, updatedAt: 0 };
  const response = await fetch(`${config.apiBaseUrl}/v1/game-data/published-opponents`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("upstream_error", "The game storage returned an unreadable response.");
  }
  if (!response.ok || payload.status !== "ok") {
    throw new ApiError(
      payload.status ?? "upstream_error",
      payload.message ?? "Published opponents could not be loaded from game storage.",
    );
  }
  return {
    opponents: Array.isArray(payload.opponents) ? payload.opponents : [],
    revision: Math.max(0, Number(payload.revision) || 0),
    updatedAt: Math.max(0, Number(payload.updatedAt) || 0),
  };
}

export async function generateTeamPack(payload) {
  if (apiMode() === "unavailable") {
    throw new ApiError(
      "upstream_error",
      "AI generation is not connected. Deploy the Worker and add its URL to config.js.",
    );
  }
  return postJson("/v1/team-packs", {
    ...payload,
    clientVersion: 4,
  });
}

function portraitRequestPlayers(players) {
  return players.map((player) => ({
    playerId: player.id,
    name: player.name,
    theme: player.theme || "Unknown theme",
  }));
}

export async function fetchCachedPortraitCandidates(players) {
  if (!players.length) return {};
  const portraits = cachedPortraitsForPlayers(players);
  const unresolved = players.filter((player) => !portraits[player.id]?.length);
  if (!unresolved.length || apiMode() !== "live") return portraits;

  try {
    for (let offset = 0; offset < unresolved.length; offset += 50) {
      const batch = unresolved.slice(offset, offset + 50);
      const payload = await postJson("/v1/portrait-cache", {
        players: portraitRequestPlayers(batch),
      });
      for (const player of batch) {
        const candidates = Array.isArray(payload.portraits?.[player.id])
          ? payload.portraits[player.id].slice(0, 2)
          : [];
        portraits[player.id] = candidates;
        if (candidates.length === 2) cacheCuratedPortraits(player.name, candidates);
      }
    }
  } catch (error) {
    console.warn("The curated portrait cache could not be checked.", error);
  }

  return portraits;
}

export async function fetchPortraitCandidates(players) {
  if (!players.length) return {};

  const portraits = await fetchCachedPortraitCandidates(players);
  let unresolved = players.filter((player) => !portraits[player.id]?.length);
  if (!unresolved.length) return portraits;

  // The Worker owns the automatic Openverse lookup and its short-lived result
  // cache. Keep requests in batches accepted by /v1/portraits.
  if (apiMode() === "live") {
    try {
      for (let offset = 0; offset < unresolved.length; offset += 11) {
        const batch = unresolved.slice(offset, offset + 11);
        const payload = await postJson("/v1/portraits", {
          players: portraitRequestPlayers(batch),
        });
        for (const player of batch) {
          portraits[player.id] = Array.isArray(payload.portraits?.[player.id])
            ? payload.portraits[player.id].slice(0, 3)
            : [];
        }
      }
      unresolved = players.filter((player) => !portraits[player.id]?.length);
    } catch (error) {
      console.warn("The Worker portrait search could not be completed.", error);
    }
  }

  // Wikipedia and Wikimedia Commons remain browser-side fallbacks, along with
  // a direct Openverse retry if the Worker search was unavailable or empty.
  if (!unresolved.length) return portraits;
  return {
    ...portraits,
    ...await searchLicensedPortraits(unresolved),
  };
}

function requiredDeveloperToken(value) {
  const token = String(value ?? "").trim();
  if (!token) throw new ApiError("forbidden", "Enter the developer access token.");
  return token;
}

export function loadDeveloperGameData(developerToken) {
  return postJson(
    "/v1/developer/game-data/load",
    {},
    { developerToken: requiredDeveloperToken(developerToken) },
  );
}

export function mergeDeveloperGameData(snapshot, developerToken) {
  return postJson(
    "/v1/developer/game-data/merge",
    { snapshot },
    { developerToken: requiredDeveloperToken(developerToken) },
  );
}

export function saveDeveloperGameData(snapshot, expectedRevision, developerToken) {
  return postJson(
    "/v1/developer/game-data/save",
    { snapshot, expectedRevision },
    { developerToken: requiredDeveloperToken(developerToken) },
  );
}

export async function searchSerpApiImages(name, developerToken) {
  if (apiMode() !== "live") {
    throw new ApiError("upstream_error", "Connect the Worker before using SerpAPI.");
  }
  const token = String(developerToken ?? "").trim();
  if (!token) {
    throw new ApiError("forbidden", "Enter the developer access token.");
  }
  return postJson(
    "/v1/developer/serpapi-images/search",
    { name },
    { developerToken: token },
  );
}

export async function cacheSerpApiImages(searchId, choices, developerToken) {
  if (apiMode() !== "live") {
    throw new ApiError("upstream_error", "Connect the Worker before caching images.");
  }
  const token = String(developerToken ?? "").trim();
  if (!token) {
    throw new ApiError("forbidden", "Enter the developer access token.");
  }
  const payload = await postJson(
    "/v1/developer/serpapi-images/cache",
    { searchId, choices },
    { developerToken: token },
  );
  cacheCuratedPortraits(payload.name, payload.portraits);
  return payload;
}

let turnstileLoader = null;
const turnstileWidgets = new Map();
const turnstileTokens = new Map();

function loadTurnstile() {
  if (
    !config.turnstileSiteKey ||
    config.turnstileSiteKey === "dev-bypass" ||
    apiMode() !== "live"
  ) return Promise.resolve(false);
  if (window.turnstile) return Promise.resolve(true);
  if (turnstileLoader) return turnstileLoader;

  turnstileLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Could not load the anti-bot check."));
    document.head.append(script);
  });

  return turnstileLoader;
}

export async function mountTurnstile(containerId) {
  if (
    !config.turnstileSiteKey ||
    config.turnstileSiteKey === "dev-bypass" ||
    apiMode() !== "live"
  ) return;
  await loadTurnstile();
  if (turnstileWidgets.has(containerId)) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  const widgetId = window.turnstile.render(container, {
    sitekey: config.turnstileSiteKey,
    theme: "light",
    size: "flexible",
    callback: (token) => turnstileTokens.set(containerId, token),
    "expired-callback": () => turnstileTokens.delete(containerId),
    "error-callback": () => turnstileTokens.delete(containerId),
  });
  turnstileWidgets.set(containerId, widgetId);
}

export function turnstileToken(containerId) {
  if (apiMode() !== "live") return "";
  if (config.turnstileSiteKey === "dev-bypass") return "dev-bypass";
  return turnstileTokens.get(containerId) ?? "";
}

export function resetTurnstile(containerId) {
  turnstileTokens.delete(containerId);
  const widgetId = turnstileWidgets.get(containerId);
  if (widgetId !== undefined && window.turnstile) window.turnstile.reset(widgetId);
}
