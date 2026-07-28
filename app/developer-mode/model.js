import {
  ALL_POSITIONS,
  FORMATIONS,
  clamp,
  ratingForPriority,
} from "../js/core.js";

export const NPC_DRAFT_SCHEMA_VERSION = 1;
export const NPC_DRAFT_STORAGE_KEY = "gff-developer-npc-drafts-v1";
export const NPC_DRAFT_STATUS = "draft-only";

const DEFAULT_FORMATION_ID = "4-3-3";
const DEFAULT_TEAM_NAME = "Untitled NPC Team";
const DEFAULT_ICON = "◆";

function identifier(prefix = "npc") {
  const value = globalThis.crypto?.randomUUID?.() ??
    String(Date.now()) + "-" + Math.random().toString(36).slice(2);
  return prefix + "-" + value;
}

function cleanText(value, fallback, maxLength) {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return text.slice(0, maxLength) || fallback;
}

function cleanImage(value) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text.slice(0, 2048);
  if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(text)) return text.slice(0, 1500000);
  return "";
}

function normalizeIconImageTransform(value) {
  return {
    scale: clamp(Number(value?.scale) || 1, 0.5, 2.5),
    x: clamp(Number(value?.x) || 0, -100, 100),
    y: clamp(Number(value?.y) || 0, -100, 100),
  };
}

function formationFor(value) {
  return FORMATIONS[value] ?? FORMATIONS[DEFAULT_FORMATION_ID];
}

function safeOverall(value) {
  return Math.round(clamp(Number(value) || 75, 1, 99));
}

function safePosition(value, fallback = "CM") {
  return ALL_POSITIONS.includes(value) ? value : fallback;
}

function emptyPortrait() {
  return {
    candidates: [],
    index: -1,
    useFallback: true,
    searchedAt: 0,
  };
}

function normalizePortraitCandidate(candidate) {
  if (!candidate || typeof candidate.thumbnail !== "string" || !candidate.thumbnail.trim()) return null;
  return {
    thumbnail: candidate.thumbnail.trim().slice(0, 2048),
    title: cleanText(candidate.title, "Untitled portrait", 200),
    creator: cleanText(candidate.creator, "Unknown creator", 160),
    creatorUrl: typeof candidate.creatorUrl === "string" ? candidate.creatorUrl.slice(0, 2048) : "",
    sourceUrl: typeof candidate.sourceUrl === "string" ? candidate.sourceUrl.slice(0, 2048) : "",
    license: cleanText(candidate.license, "Open license", 80),
    licenseUrl: typeof candidate.licenseUrl === "string" ? candidate.licenseUrl.slice(0, 2048) : "",
  };
}

function normalizePortrait(portrait) {
  const candidates = Array.isArray(portrait?.candidates)
    ? portrait.candidates.map(normalizePortraitCandidate).filter(Boolean).slice(0, 3)
    : [];
  const requestedIndex = Math.max(0, Math.floor(Number(portrait?.index) || 0));
  const index = candidates.length ? Math.min(requestedIndex, candidates.length - 1) : -1;
  return {
    candidates,
    index,
    useFallback: !candidates.length || portrait?.useFallback === true,
    searchedAt: Math.max(0, Number(portrait?.searchedAt) || 0),
  };
}

function normalizedPlayer(player, fallbackSlot, index, draftId) {
  return {
    id: cleanText(player?.id, draftId + "-player-" + (index + 1), 160),
    name: cleanText(player?.name, "Player " + String(index + 1).padStart(2, "0"), 80),
    position: safePosition(player?.position, fallbackSlot.position),
    overall: safeOverall(player?.overall),
    portrait: normalizePortrait(player?.portrait),
    slotId: player && typeof player.slotId === "string"
      ? player.slotId.trim().slice(0, 80)
      : fallbackSlot.id,
  };
}

function assignPlayersToFormation(players, formation, draftId) {
  const pool = players.map((player, index) =>
    normalizedPlayer(player, formation.slots[index] ?? formation.slots[0], index, draftId),
  );
  const used = new Set();

  return formation.slots.map((slot, slotIndex) => {
    let playerIndex = pool.findIndex((player, index) =>
      !used.has(index) && player.slotId === slot.id,
    );
    if (playerIndex < 0) {
      playerIndex = pool.findIndex((player, index) =>
        !used.has(index) && player.position === slot.position,
      );
    }
    if (playerIndex < 0) playerIndex = pool.findIndex((_player, index) => !used.has(index));

    const player = playerIndex >= 0
      ? pool[playerIndex]
      : normalizedPlayer(null, slot, slotIndex, draftId);
    if (playerIndex >= 0) used.add(playerIndex);
    return { ...player, slotId: slot.id, position: slot.position };
  });
}

export function formationOptions() {
  return Object.values(FORMATIONS).map(({ id, label }) => ({ id, label }));
}

export function createNpcDraft(options = {}) {
  const formation = formationFor(options.formationId);
  const id = cleanText(options.id, identifier("npc-team"), 160);
  const now = Number(options.now) || Date.now();
  const players = formation.slots.map((slot, index) => ({
    id: id + "-player-" + (index + 1),
    name: "Player " + String(index + 1).padStart(2, "0"),
    position: slot.position,
    overall: 75,
    portrait: emptyPortrait(),
    slotId: slot.id,
  }));

  return {
    schemaVersion: NPC_DRAFT_SCHEMA_VERSION,
    status: NPC_DRAFT_STATUS,
    playable: false,
    id,
    name: cleanText(options.name, DEFAULT_TEAM_NAME, 60),
    icon: cleanText(options.icon, DEFAULT_ICON, 240),
    iconImage: cleanImage(options.iconImage),
    iconImageTransform: normalizeIconImageTransform(options.iconImageTransform),
    theme: cleanText(options.theme, "Manual draft", 80),
    formationId: formation.id,
    players,
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeNpcDraft(value) {
  const fallback = createNpcDraft({
    id: value?.id,
    name: value?.name,
    icon: value?.icon,
    formationId: value?.formationId,
    theme: value?.theme,
    now: value?.createdAt,
  });
  const formation = formationFor(value?.formationId);
  const sourcePlayers = Array.isArray(value?.players) ? value.players.slice(0, 11) : fallback.players;
  return {
    ...fallback,
    id: cleanText(value?.id, fallback.id, 160),
    name: cleanText(value?.name, DEFAULT_TEAM_NAME, 60),
    icon: cleanText(value?.icon, DEFAULT_ICON, 240),
    iconImage: cleanImage(value?.iconImage),
    iconImageTransform: normalizeIconImageTransform(value?.iconImageTransform),
    theme: cleanText(value?.theme, "Manual draft", 80),
    formationId: formation.id,
    players: assignPlayersToFormation(sourcePlayers, formation, fallback.id),
    createdAt: Number(value?.createdAt) || fallback.createdAt,
    updatedAt: Number(value?.updatedAt) || fallback.updatedAt,
    schemaVersion: NPC_DRAFT_SCHEMA_VERSION,
    status: NPC_DRAFT_STATUS,
    playable: false,
  };
}

export function changeDraftFormation(draft, formationId) {
  const nextFormation = formationFor(formationId);
  return normalizeNpcDraft({
    ...draft,
    formationId: nextFormation.id,
    updatedAt: Date.now(),
  });
}

export function updateDraftIdentity(draft, patch = {}) {
  return normalizeNpcDraft({
    ...draft,
    name: patch.name ?? draft.name,
    icon: patch.icon ?? draft.icon,
    iconImage: patch.iconImage ?? draft.iconImage,
    iconImageTransform: patch.iconImageTransform ?? draft.iconImageTransform,
    theme: patch.theme ?? draft.theme,
    updatedAt: Date.now(),
  });
}

export function updateDraftPlayer(draft, playerId, patch = {}) {
  return normalizeNpcDraft({
    ...draft,
    players: draft.players.map((player) => {
      if (player.id !== playerId) return player;
      const nextName = patch.name == null
        ? player.name
        : cleanText(patch.name, player.name, 80);
      return {
        ...player,
        name: nextName,
        position: player.position,
        overall: patch.overall == null ? player.overall : safeOverall(patch.overall),
        portrait: nextName === player.name ? player.portrait : emptyPortrait(),
      };
    }),
    updatedAt: Date.now(),
  });
}

export function moveDraftPlayer(draft, playerId, targetSlotId) {
  const source = draft.players.find((player) => player.id === playerId);
  const target = draft.players.find((player) => player.slotId === targetSlotId);
  if (!source || !target || source.id === target.id) return normalizeNpcDraft(draft);
  return normalizeNpcDraft({
    ...draft,
    players: draft.players.map((player) => {
      if (player.id === source.id) return { ...player, slotId: target.slotId };
      if (player.id === target.id) return { ...player, slotId: source.slotId };
      return player;
    }),
    updatedAt: Date.now(),
  });
}


export function remapGeneratedPackToFormation(pack, formationId) {
  const formation = formationFor(formationId);
  const players = Array.isArray(pack?.players) ? pack.players : [];
  return {
    ...pack,
    formationId: formation.id,
    players: players.map((player, index) => ({
      ...player,
      position: formation.slots[index]?.position ?? player.position,
    })),
  };
}

export function applyGeneratedPack(draft, pack) {
  const formation = formationFor(draft.formationId);
  const source = Array.isArray(pack?.players) ? pack.players.slice(0, 11) : [];
  if (source.length !== 11) throw new Error("The generator must return exactly eleven players.");

  const generated = source.map((player, index) => ({
    id: draft.id + "-generated-" + (player.id || index + 1),
    name: cleanText(player.name, "Generated Player " + (index + 1), 80),
    position: safePosition(player.position, formation.slots[index]?.position),
    overall: ratingForPriority(player.priorityRank ?? index + 1, pack.batchId ?? draft.id),
    slotId: "",
  }));

  return normalizeNpcDraft({
    ...draft,
    theme: cleanText(pack?.theme, draft.theme, 80),
    players: assignPlayersToFormation(generated, formation, draft.id),
    updatedAt: Date.now(),
  });
}

export function applyPortraitSearch(draft, portraits, searchedAt = Date.now()) {
  const portraitMap = portraits && typeof portraits === "object" ? portraits : {};
  return normalizeNpcDraft({
    ...draft,
    players: draft.players.map((player) => {
      if (!Object.prototype.hasOwnProperty.call(portraitMap, player.id)) return player;
      const candidates = Array.isArray(portraitMap[player.id]) ? portraitMap[player.id] : [];
      return {
        ...player,
        portrait: normalizePortrait({
          candidates,
          index: candidates.length ? 0 : -1,
          useFallback: !candidates.length,
          searchedAt,
        }),
      };
    }),
    updatedAt: Date.now(),
  });
}

export function chooseSerpApiSelection(
  selections,
  choice,
  index,
  resultCount,
) {
  const validIndex = (value) =>
    Number.isInteger(value) && value >= 0 && value < resultCount ? value : null;
  const current = {
    first: validIndex(selections?.first),
    second: validIndex(selections?.second),
  };
  if (
    !["first", "second"].includes(choice) ||
    validIndex(index) == null
  ) return current;

  const otherChoice = choice === "first" ? "second" : "first";
  if (current[otherChoice] === index) current[otherChoice] = null;
  current[choice] = index;
  return current;
}

export function chooseNextSerpApiSelection(selections, index, resultCount) {
  const current = chooseSerpApiSelection(
    selections,
    "first",
    -1,
    resultCount,
  );
  if (!Number.isInteger(index) || index < 0 || index >= resultCount) return current;
  if (current.first === index) return { ...current, first: null };
  if (current.second === index) return { ...current, second: null };
  if (current.first == null) {
    return chooseSerpApiSelection(current, "first", index, resultCount);
  }
  return chooseSerpApiSelection(current, "second", index, resultCount);
}

export function cycleDraftPlayerPortrait(draft, playerId) {
  return normalizeNpcDraft({
    ...draft,
    players: draft.players.map((player) => {
      if (player.id !== playerId || player.portrait.candidates.length < 2) return player;
      return {
        ...player,
        portrait: {
          ...player.portrait,
          index: (player.portrait.index + 1) % player.portrait.candidates.length,
          useFallback: false,
        },
      };
    }),
    updatedAt: Date.now(),
  });
}

export function normalizeNpcDrafts(values) {
  if (!Array.isArray(values)) return [];
  const ids = new Set();
  return values.map(normalizeNpcDraft).filter((draft) => {
    if (ids.has(draft.id)) return false;
    ids.add(draft.id);
    return true;
  });
}

export function loadNpcDrafts(storage = globalThis.localStorage) {
  try {
    const payload = JSON.parse(storage?.getItem(NPC_DRAFT_STORAGE_KEY) ?? "null");
    return normalizeNpcDrafts(payload?.drafts ?? payload);
  } catch {
    return [];
  }
}

export function persistNpcDrafts(drafts, storage = globalThis.localStorage) {
  const normalized = normalizeNpcDrafts(drafts);
  storage?.setItem(NPC_DRAFT_STORAGE_KEY, JSON.stringify({
    schemaVersion: NPC_DRAFT_SCHEMA_VERSION,
    status: NPC_DRAFT_STATUS,
    playable: false,
    updatedAt: Date.now(),
    drafts: normalized,
  }));
  return normalized;
}

export function parseNpcDraftDocument(text) {
  const payload = typeof text === "string" ? JSON.parse(text) : text;
  const drafts = normalizeNpcDrafts(payload?.drafts ?? (payload ? [payload] : []));
  if (!drafts.length) throw new Error("No valid NPC team drafts were found.");
  return drafts;
}

export function serializeNpcDraftDocument(drafts) {
  return JSON.stringify({
    schemaVersion: NPC_DRAFT_SCHEMA_VERSION,
    status: NPC_DRAFT_STATUS,
    playable: false,
    exportedAt: new Date().toISOString(),
    drafts: normalizeNpcDrafts(drafts),
  }, null, 2);
}
