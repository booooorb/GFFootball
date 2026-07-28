import { ALL_POSITIONS, FORMATIONS, clamp } from "./core.js";

export const PUBLISHED_NPC_STORAGE_KEY = "gff.published-npc-opponents.v1";
export const PUBLISHED_NPC_SCHEMA_VERSION = 1;
export const PUBLISHED_NPC_EVENT = "gff:published-npc-opponents-changed";
export const PUBLISHED_NPC_STATUS = "published-opponent";

function cleanText(value, fallback, maxLength) {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return text.slice(0, maxLength) || fallback;
}

function safeUrl(value) {
  const text = typeof value === "string" ? value.trim() : "";
  if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(text)) return text.slice(0, 1500000);
  try {
    const url = new URL(text);
    return ["http:", "https:"].includes(url.protocol) ? url.href.slice(0, 2048) : "";
  } catch {
    return "";
  }
}

function normalizeIconImageTransform(value) {
  return {
    scale: clamp(Number(value?.scale) || 1, 0.5, 2.5),
    x: clamp(Number(value?.x) || 0, -100, 100),
    y: clamp(Number(value?.y) || 0, -100, 100),
  };
}

function normalizePortraitCandidate(candidate) {
  const thumbnail = safeUrl(candidate?.thumbnail);
  if (!thumbnail) return null;
  return {
    thumbnail,
    title: cleanText(candidate?.title, "Untitled portrait", 200),
    creator: cleanText(candidate?.creator, "Unknown creator", 160),
    creatorUrl: safeUrl(candidate?.creatorUrl),
    sourceUrl: safeUrl(candidate?.sourceUrl),
    license: cleanText(candidate?.license, "Open license", 80),
    licenseUrl: safeUrl(candidate?.licenseUrl),
  };
}

function normalizePortrait(portrait) {
  const candidates = Array.isArray(portrait?.candidates)
    ? portrait.candidates.map(normalizePortraitCandidate).filter(Boolean).slice(0, 3)
    : [];
  const index = candidates.length
    ? Math.min(Math.max(0, Math.floor(Number(portrait?.index) || 0)), candidates.length - 1)
    : -1;
  return {
    candidates,
    index,
    useFallback: !candidates.length || portrait?.useFallback === true,
    searchedAt: Math.max(0, Number(portrait?.searchedAt) || 0),
  };
}

function normalizedPlayers(value, formation, teamId, theme) {
  const source = Array.isArray(value?.players) ? value.players.slice(0, 11) : [];
  if (source.length !== 11) return [];
  const unused = [...source];
  return formation.slots.map((slot, index) => {
    let playerIndex = unused.findIndex((player) => player?.slotId === slot.id);
    if (playerIndex < 0) playerIndex = unused.findIndex((player) => player?.position === slot.position);
    if (playerIndex < 0) playerIndex = 0;
    const player = unused.splice(playerIndex, 1)[0];
    const sourcePlayerId = cleanText(player?.sourcePlayerId ?? player?.id, "player-" + (index + 1), 160);
    const position = ALL_POSITIONS.includes(player?.position) ? player.position : slot.position;
    return {
      id: teamId + ":" + sourcePlayerId,
      sourcePlayerId,
      name: cleanText(player?.name, "Opponent " + (index + 1), 80),
      theme,
      position,
      overall: Math.round(clamp(Number(player?.overall) || 75, 1, 99)),
      slotId: slot.id,
      portrait: normalizePortrait(player?.portrait),
    };
  });
}

export function normalizePublishedNpcOpponent(value) {
  const formation = FORMATIONS[value?.formationId];
  if (!formation) return null;
  const sourceDraftId = cleanText(value?.sourceDraftId ?? value?.id, "", 160);
  if (!sourceDraftId) return null;
  const id = "published-npc:" + sourceDraftId;
  const theme = cleanText(value?.theme, "NPC opponent", 80);
  const players = normalizedPlayers(value, formation, id, theme);
  if (players.length !== 11 || new Set(players.map((player) => player.slotId)).size !== 11) return null;
  const publishedAt = Math.max(0, Number(value?.publishedAt) || Date.now());
  return {
    schemaVersion: PUBLISHED_NPC_SCHEMA_VERSION,
    status: PUBLISHED_NPC_STATUS,
    playable: false,
    opponent: true,
    id,
    sourceDraftId,
    name: cleanText(value?.name, "Untitled NPC Team", 60),
    icon: cleanText(value?.icon, "◆", 240),
    iconImage: safeUrl(value?.iconImage),
    iconImageTransform: normalizeIconImageTransform(value?.iconImageTransform),
    theme,
    formationId: formation.id,
    players,
    publishedAt,
    updatedAt: Math.max(publishedAt, Number(value?.updatedAt) || publishedAt),
  };
}

export function publishedNpcOpponentFromDraft(draft, now = Date.now()) {
  const published = normalizePublishedNpcOpponent({
    ...draft,
    sourceDraftId: draft?.id,
    publishedAt: now,
    updatedAt: now,
  });
  if (!published) throw new Error("A publishable opponent needs a valid formation and exactly eleven players.");
  return published;
}

export function normalizePublishedNpcOpponents(values) {
  if (!Array.isArray(values)) return [];
  const byDraft = new Map();
  for (const value of values) {
    const team = normalizePublishedNpcOpponent(value);
    if (team) byDraft.set(team.sourceDraftId, team);
  }
  return [...byDraft.values()].sort((left, right) => left.publishedAt - right.publishedAt);
}

export function loadPublishedNpcOpponents(storage = globalThis.localStorage) {
  try {
    const payload = JSON.parse(storage?.getItem(PUBLISHED_NPC_STORAGE_KEY) ?? "null");
    return normalizePublishedNpcOpponents(payload?.opponents ?? payload);
  } catch {
    return [];
  }
}

export function mergePublishedNpcOpponents(opponents, storage = globalThis.localStorage) {
  const current = loadPublishedNpcOpponents(storage);
  const incoming = normalizePublishedNpcOpponents(opponents);
  const merged = new Map(current.map((team) => [team.sourceDraftId, team]));
  for (const team of incoming) {
    const previous = merged.get(team.sourceDraftId);
    if (!previous || Number(team.updatedAt) >= Number(previous.updatedAt)) {
      merged.set(team.sourceDraftId, team);
    }
  }
  return persistPublishedNpcOpponents([...merged.values()], storage);
}

function announce(opponents) {
  if (typeof globalThis.dispatchEvent !== "function" || typeof globalThis.CustomEvent !== "function") return;
  globalThis.dispatchEvent(new CustomEvent(PUBLISHED_NPC_EVENT, {
    detail: { opponents },
  }));
}

export function persistPublishedNpcOpponents(opponents, storage = globalThis.localStorage) {
  const normalized = normalizePublishedNpcOpponents(opponents);
  storage?.setItem(PUBLISHED_NPC_STORAGE_KEY, JSON.stringify({
    schemaVersion: PUBLISHED_NPC_SCHEMA_VERSION,
    status: PUBLISHED_NPC_STATUS,
    playable: false,
    updatedAt: Date.now(),
    opponents: normalized,
  }));
  announce(normalized);
  return normalized;
}

export function publishNpcOpponent(draft, storage = globalThis.localStorage, now = Date.now()) {
  const existing = loadPublishedNpcOpponents(storage);
  const previous = existing.find((team) => team.sourceDraftId === draft?.id);
  const published = publishedNpcOpponentFromDraft(draft, now);
  if (previous) published.publishedAt = previous.publishedAt;
  published.updatedAt = now;
  return persistPublishedNpcOpponents([
    ...existing.filter((team) => team.sourceDraftId !== published.sourceDraftId),
    published,
  ], storage).find((team) => team.sourceDraftId === published.sourceDraftId);
}

export function unpublishNpcOpponent(sourceDraftId, storage = globalThis.localStorage) {
  const existing = loadPublishedNpcOpponents(storage);
  const remaining = existing.filter((team) => team.sourceDraftId !== sourceDraftId);
  persistPublishedNpcOpponents(remaining, storage);
  return remaining.length !== existing.length;
}

export function publishedNpcOpponentForDraft(sourceDraftId, storage = globalThis.localStorage) {
  return loadPublishedNpcOpponents(storage).find((team) => team.sourceDraftId === sourceDraftId) ?? null;
}
