export const SAVE_KEY = "gff.save.v1";
export const SAVE_VERSION = 1;
export const RATING_MODEL_VERSION = 2;
export const COLLECTION_LIMIT = 110;
export const SEASON_LENGTH = 10;
export const DEFAULT_SEASON_OPPONENTS = 7;
export const MAX_SEASON_TEAMS = 32;
export const MAX_SEASON_OPPONENTS = MAX_SEASON_TEAMS - 1;
export const MARKET_PACK_SIZE = 10;
export const FREE_TRANSFER_COUNT = 3;
export const STARTING_BALANCE_MILLIONS = 120;
export const SCOUTING_COST_MILLIONS = 20;
export const MIN_SIGNING_PRICE_MILLIONS = 20;
export const MAX_SIGNING_PRICE_MILLIONS = 220;
export const MAX_RESALE_VALUE_MILLIONS = 250;
export const USER_CLUB_ID = "prompt-league-xi";
export const USER_CLUB_NAME = "Prompt League XI";
export const CLUB_ICON_PRESETS = ["shield", "star", "bolt", "crown"];

export const FORMATIONS = {
  "4-3-3": {
    id: "4-3-3",
    label: "4–3–3",
    attackModifier: 1.06,
    defenceRisk: 1.03,
    slots: [
      { id: "433-gk", position: "GK", x: 50, y: 89 },
      { id: "433-lb", position: "LB", x: 16, y: 70 },
      { id: "433-lcb", position: "CB", x: 38, y: 74 },
      { id: "433-rcb", position: "CB", x: 62, y: 74 },
      { id: "433-rb", position: "RB", x: 84, y: 70 },
      { id: "433-lcm", position: "CM", x: 28, y: 50 },
      { id: "433-rcm", position: "CDM", x: 68, y: 56 },
      { id: "433-cam", position: "CAM", x: 50, y: 39 },
      { id: "433-lw", position: "LW", x: 18, y: 17 },
      { id: "433-st", position: "ST", x: 50, y: 12 },
      { id: "433-rw", position: "RW", x: 82, y: 17 },
    ],
  },
  "4-4-2": {
    id: "4-4-2",
    label: "4–4–2",
    attackModifier: 1,
    defenceRisk: 1,
    slots: [
      { id: "442-gk", position: "GK", x: 50, y: 89 },
      { id: "442-lb", position: "LB", x: 16, y: 70 },
      { id: "442-lcb", position: "CB", x: 38, y: 74 },
      { id: "442-rcb", position: "CB", x: 62, y: 74 },
      { id: "442-rb", position: "RB", x: 84, y: 70 },
      { id: "442-lm", position: "LM", x: 16, y: 46 },
      { id: "442-lcm", position: "CM", x: 39, y: 50 },
      { id: "442-rcm", position: "CDM", x: 61, y: 54 },
      { id: "442-rm", position: "RM", x: 84, y: 46 },
      { id: "442-lst", position: "ST", x: 38, y: 18 },
      { id: "442-rst", position: "ST", x: 62, y: 18 },
    ],
  },
  "3-5-2": {
    id: "3-5-2",
    label: "3–5–2",
    attackModifier: 1.03,
    defenceRisk: 1.06,
    slots: [
      { id: "352-gk", position: "GK", x: 50, y: 89 },
      { id: "352-lcb", position: "CB", x: 24, y: 72 },
      { id: "352-cb", position: "CB", x: 50, y: 76 },
      { id: "352-rcb", position: "CB", x: 76, y: 72 },
      { id: "352-lwb", position: "LWB", x: 12, y: 49 },
      { id: "352-lcm", position: "CM", x: 35, y: 52 },
      { id: "352-cam", position: "CAM", x: 50, y: 37 },
      { id: "352-rcm", position: "CDM", x: 65, y: 55 },
      { id: "352-rwb", position: "RWB", x: 88, y: 49 },
      { id: "352-lst", position: "ST", x: 38, y: 17 },
      { id: "352-rst", position: "ST", x: 62, y: 17 },
    ],
  },
  "4-5-1": {
    id: "4-5-1",
    label: "4–5–1",
    attackModifier: 0.98,
    defenceRisk: 0.96,
    slots: [
      { id: "451-gk", position: "GK", x: 50, y: 89 },
      { id: "451-lb", position: "LB", x: 16, y: 70 },
      { id: "451-lcb", position: "CB", x: 38, y: 74 },
      { id: "451-rcb", position: "CB", x: 62, y: 74 },
      { id: "451-rb", position: "RB", x: 84, y: 70 },
      { id: "451-lw", position: "LW", x: 14, y: 45 },
      { id: "451-lcm", position: "CM", x: 34, y: 51 },
      { id: "451-cdm", position: "CDM", x: 50, y: 58 },
      { id: "451-rcm", position: "CM", x: 66, y: 51 },
      { id: "451-rm", position: "RM", x: 86, y: 45 },
      { id: "451-st", position: "ST", x: 50, y: 15 },
    ],
  },
  "4-2-3-1": {
    id: "4-2-3-1",
    label: "4–2–3–1",
    attackModifier: 1.02,
    defenceRisk: 0.98,
    slots: [
      { id: "4231-gk", position: "GK", x: 50, y: 89 },
      { id: "4231-lb", position: "LB", x: 16, y: 70 },
      { id: "4231-lcb", position: "CB", x: 38, y: 74 },
      { id: "4231-rcb", position: "CB", x: 62, y: 74 },
      { id: "4231-rb", position: "RB", x: 84, y: 70 },
      { id: "4231-lcdm", position: "CDM", x: 38, y: 55 },
      { id: "4231-rcdm", position: "CDM", x: 62, y: 55 },
      { id: "4231-lw", position: "LW", x: 18, y: 31 },
      { id: "4231-cam", position: "CAM", x: 50, y: 34 },
      { id: "4231-rw", position: "RW", x: 82, y: 31 },
      { id: "4231-st", position: "ST", x: 50, y: 12 },
    ],
  },
  "3-4-2-1": {
    id: "3-4-2-1",
    label: "3–4–2–1",
    attackModifier: 1.08,
    defenceRisk: 1.08,
    slots: [
      { id: "3421-gk", position: "GK", x: 50, y: 89 },
      { id: "3421-lcb", position: "CB", x: 24, y: 72 },
      { id: "3421-cb", position: "CB", x: 50, y: 76 },
      { id: "3421-rcb", position: "CB", x: 76, y: 72 },
      { id: "3421-lm", position: "LM", x: 13, y: 48 },
      { id: "3421-lcm", position: "CM", x: 38, y: 53 },
      { id: "3421-rcm", position: "CM", x: 62, y: 53 },
      { id: "3421-rm", position: "RM", x: 87, y: 48 },
      { id: "3421-lw", position: "LW", x: 27, y: 25 },
      { id: "3421-rw", position: "RW", x: 73, y: 25 },
      { id: "3421-st", position: "ST", x: 50, y: 10 },
    ],
  },
  "5-4-1": {
    id: "5-4-1",
    label: "5–4–1",
    attackModifier: 0.94,
    defenceRisk: 0.9,
    slots: [
      { id: "541-gk", position: "GK", x: 50, y: 89 },
      { id: "541-lwb", position: "LWB", x: 10, y: 66 },
      { id: "541-lcb", position: "CB", x: 30, y: 73 },
      { id: "541-cb", position: "CB", x: 50, y: 76 },
      { id: "541-rcb", position: "CB", x: 70, y: 73 },
      { id: "541-rwb", position: "RWB", x: 90, y: 66 },
      { id: "541-lm", position: "LM", x: 18, y: 43 },
      { id: "541-lcm", position: "CM", x: 40, y: 49 },
      { id: "541-rcm", position: "CM", x: 60, y: 49 },
      { id: "541-rw", position: "RW", x: 82, y: 43 },
      { id: "541-st", position: "ST", x: 50, y: 14 },
    ],
  }
};

export const ALL_POSITIONS = [
  "GK",
  "LB",
  "CB",
  "RB",
  "LWB",
  "RWB",
  "LM",
  "CM",
  "CDM",
  "CAM",
  "RM",
  "LW",
  "ST",
  "RW",
];

const POSITION_ROLE_OPTIONS = Object.freeze({
  CB: ["CB", "CDM", "LB", "RB"],
  CDM: ["CDM", "CM", "CAM"],
  LM: ["LM", "LB", "CM", "LW"],
  CM: ["CM", "CAM", "CDM", "LM", "RM"],
  RM: ["RM", "RB", "CM", "RW"],
  CAM: ["CAM", "CDM", "CM", "LM", "RM"],
  LW: ["LW", "LB", "ST"],
  RW: ["RW", "RB", "ST"],
  ST: ["ST", "LW", "RW"],
  GK: ["GK"],
  LB: ["LB", "LW", "LM", "CB"],
  RB: ["RB", "RW", "RM", "CB"],
});

function canonicalRole(position) {
  if (position === "LWB") return "LB";
  if (position === "RWB") return "RB";
  return position;
}

const CLUB_NAMES = [
  "Copper Rovers",
  "Moss Athletic",
  "Northstar Eleven",
  "Paper Town FC",
  "Velvet United",
  "Moonlight Borough",
  "Sunday Wanderers",
  "Juniper City",
  "Static Albion",
  "The Margins",
  "Lantern Sporting",
  "Old Type FC",
  "Glacier Union",
  "Meridian FC",
  "Signal City",
  "Harbor Athletic",
  "Solstice Rovers",
  "Archive Town",
  "Cobalt Borough",
  "Orchard Eleven",
  "Relay Sporting",
  "Ashwood United",
  "Quartz FC",
  "Night Train Athletic",
  "Redline City",
  "Meadow Rangers",
  "Atlas Borough",
  "Echo Rovers",
  "Crownside FC",
  "Rainfall United",
  "Halcyon Athletic",
  "Cinema City",
];

const RIVAL_SURNAMES = [
  "Alder",
  "Bell",
  "Costa",
  "Doyle",
  "Evans",
  "Frost",
  "Gray",
  "Hale",
  "Ibarra",
  "Jones",
  "Khan",
  "Lowe",
  "Marin",
  "Nash",
  "Okafor",
  "Park",
  "Quinn",
  "Reed",
  "Silva",
  "Tran",
  "Usman",
  "Vale",
  "Wells",
  "Xu",
  "Young",
  "Zoric",
];

const RIVAL_FIRST_NAMES = [
  "Alex",
  "Ben",
  "Cami",
  "Dani",
  "Eli",
  "Finn",
  "Gia",
  "Hugo",
  "Imani",
  "Jules",
  "Kai",
  "Luca",
  "Mara",
  "Nico",
  "Owen",
  "Pia",
  "Remy",
  "Sam",
  "Toni",
  "Uma",
  "Vik",
];

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeName(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizeClubProfile(profile) {
  const requestedName = typeof profile?.name === "string"
    ? profile.name.trim().replace(/\s+/g, " ")
    : "";
  const requestedIcon = typeof profile?.icon === "string" ? profile.icon : "";
  return {
    name: requestedName.slice(0, 30) || USER_CLUB_NAME,
    icon: CLUB_ICON_PRESETS.includes(requestedIcon) ? requestedIcon : "shield",
  };
}

export function clubNameForSave(save) {
  return normalizeClubProfile(save?.clubProfile).name;
}

export function hashString(value) {
  let hash = 2166136261;
  const input = String(value);

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createRng(seed) {
  let state = hashString(seed) || 0x6d2b79f5;

  return function random() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function ratingForPriority(priorityRank, seed) {
  const rank = clamp(Number(priorityRank) || 11, 1, 11);
  const weight = (x) => 1 / (5 * (x + 1) ** 2);
  const normalized = (weight(rank) - weight(11)) / (weight(1) - weight(11));
  const curve = Math.sqrt(clamp(normalized, 0, 1));
  const rng = createRng(`${seed}:${rank}`);
  const jitter = (rng() * 3) - 1.5;
  return Math.round(clamp(75 + (15 * curve) + jitter, 75, 90));
}

export function positionCategory(position) {
  if (position === "GK") return "GK";
  if (["LB", "CB", "RB", "LWB", "RWB"].includes(position)) return "DEF";
  if (["LM", "CM", "CDM", "CAM", "RM"].includes(position)) return "MID";
  return "FWD";
}

export function normalizeMarketPackPlayers(players) {
  return Array.isArray(players) ? [...players] : [];
}

const POSITION_STANDOUT_FLOORS = Object.freeze({
  GK: [81, 83],
  DEF: [83, 85],
  MID: [82, 84],
  FWD: [82, 84],
});

export function ratingsForPack(players, batchId) {
  const ratings = players.map((player, index) => {
    const priorityRank = player.priorityRank ?? index + 1;
    return ratingForPriority(priorityRank, `${batchId}:${player.name}`);
  });

  for (const [category, [minimum, maximum]] of Object.entries(POSITION_STANDOUT_FLOORS)) {
    const candidates = players
      .map((player, index) => ({
        index,
        player,
        rating: ratings[index],
        priorityRank: player.priorityRank ?? index + 1,
      }))
      .filter(({ player }) => positionCategory(player.position) === category)
      .sort((left, right) =>
        right.rating - left.rating ||
        left.priorityRank - right.priorityRank ||
        left.player.name.localeCompare(right.player.name),
      );

    if (!candidates.length) continue;
    const standout = candidates[0];
    const rng = createRng(`${batchId}:position-standout:${category}`);
    const floor = minimum + Math.floor(rng() * (maximum - minimum + 1));
    ratings[standout.index] = Math.max(ratings[standout.index], floor);
  }

  return ratings;
}

export function compatibilityPenalty(playerPosition, slotPosition) {
  if (playerPosition === slotPosition) return 0;
  const playerRole = canonicalRole(playerPosition);
  const slotRole = canonicalRole(slotPosition);
  if (playerRole === slotRole) return 1;
  if (!POSITION_ROLE_OPTIONS[playerRole]?.includes(slotRole)) {
    return Number.POSITIVE_INFINITY;
  }

  const isCamCdmSwitch =
    (playerRole === "CAM" && slotRole === "CDM") ||
    (playerRole === "CDM" && slotRole === "CAM");
  return isCamCdmSwitch || positionCategory(playerRole) !== positionCategory(slotRole)
    ? 5
    : 2;
}

export function positionRatingsForPlayer(player) {
  const mainRating = Math.round(Number(player?.overall) || 0);
  const stored = player?.positionRatings && typeof player.positionRatings === "object"
    ? player.positionRatings
    : {};
  const ratings = {};

  for (const position of ALL_POSITIONS) {
    const penalty = compatibilityPenalty(player.position, position);
    if (!Number.isFinite(penalty)) continue;
    const storedRating = Number(stored[position]);
    ratings[position] = Number.isFinite(storedRating)
      ? Math.round(clamp(storedRating, 1, 99))
      : Math.round(clamp(mainRating - penalty, 1, 99));
  }
  ratings[player.position] = mainRating;
  return ratings;
}

export function reconcilePlayerPrimaryPosition(player, currentPosition = null) {
  const positionRatings = positionRatingsForPlayer(player);
  if (
    currentPosition &&
    Number.isFinite(compatibilityPenalty(player.position, currentPosition)) &&
    Number(positionRatings[currentPosition]) > Number(positionRatings[player.position])
  ) {
    const promotedOverall = Number(positionRatings[currentPosition]);
    const promoted = {
      ...player,
      position: currentPosition,
      overall: promotedOverall,
      positionRatings,
    };
    return {
      ...promoted,
      positionRatings: positionRatingsForPlayer(promoted),
    };
  }
  return {
    ...player,
    positionRatings,
  };
}

export function effectiveOverall(player, slotPosition) {
  const penalty = compatibilityPenalty(player.position, slotPosition);
  if (!Number.isFinite(penalty)) return Number.NEGATIVE_INFINITY;
  return positionRatingsForPlayer(player)[slotPosition] ?? player.overall - penalty;
}

export function autoPickLineup(collection, formationId) {
  const formation = FORMATIONS[formationId] ?? FORMATIONS["4-3-3"];
  const remaining = new Set(collection.map((player) => player.id));
  const lineup = {};

  const work = formation.slots
    .map((slot, originalIndex) => ({
      ...slot,
      originalIndex,
      candidateCount: collection.filter((player) =>
        Number.isFinite(compatibilityPenalty(player.position, slot.position)),
      ).length,
    }))
    .sort((left, right) =>
      left.candidateCount - right.candidateCount ||
      left.originalIndex - right.originalIndex,
    );

  for (const slot of work) {
    const candidate = collection
      .filter((player) => remaining.has(player.id))
      .map((player) => ({
        player,
        penalty: compatibilityPenalty(player.position, slot.position),
      }))
      .filter(({ penalty }) => Number.isFinite(penalty))
      .sort((left, right) =>
        left.penalty - right.penalty ||
        right.player.overall - left.player.overall ||
        left.player.name.localeCompare(right.player.name),
      )[0];

    if (candidate) {
      lineup[slot.id] = candidate.player.id;
      remaining.delete(candidate.player.id);
    }
  }

  return lineup;
}

export function assignPlayerToSlot(lineup, formationId, player, targetSlotId, collection) {
  const formation = FORMATIONS[formationId];
  const targetSlot = formation?.slots.find((slot) => slot.id === targetSlotId);
  if (!targetSlot || !Number.isFinite(compatibilityPenalty(player.position, targetSlot.position))) {
    return { lineup, changed: false, reason: "player-incompatible" };
  }

  const next = { ...lineup };
  const previousSlotId = Object.keys(next).find((slotId) => next[slotId] === player.id);
  const displacedPlayerId = next[targetSlotId];

  if (previousSlotId === targetSlotId) {
    return { lineup, changed: false, reason: "already-assigned" };
  }

  if (previousSlotId && displacedPlayerId) {
    const previousSlot = formation.slots.find((slot) => slot.id === previousSlotId);
    const displaced = collection.find((candidate) => candidate.id === displacedPlayerId);
    if (
      !previousSlot ||
      !displaced ||
      !Number.isFinite(compatibilityPenalty(displaced.position, previousSlot.position))
    ) {
      return { lineup, changed: false, reason: "swap-incompatible" };
    }
  }

  next[targetSlotId] = player.id;

  if (previousSlotId && previousSlotId !== targetSlotId) {
    delete next[previousSlotId];
    const displaced = collection.find((candidate) => candidate.id === displacedPlayerId);
    if (displaced) next[previousSlotId] = displaced.id;
  }

  for (const [slotId, playerId] of Object.entries(next)) {
    if (slotId !== targetSlotId && playerId === player.id) delete next[slotId];
  }

  return { lineup: next, changed: true };
}

function bitCount(value) {
  let count = 0;
  let remaining = value;
  while (remaining) {
    remaining &= remaining - 1;
    count += 1;
  }
  return count;
}

export function refitLineup(lineup, fromFormationId, toFormationId, collection) {
  const fromFormation = FORMATIONS[fromFormationId] ?? FORMATIONS["4-3-3"];
  const toFormation = FORMATIONS[toFormationId] ?? FORMATIONS["4-3-3"];
  const playersById = new Map(collection.map((player) => [player.id, player]));
  const currentPlayers = fromFormation.slots
    .map((slot) => {
      const player = playersById.get(lineup?.[slot.id]);
      return player ? { player, previousSlot: slot } : null;
    })
    .filter(Boolean);

  let states = new Map([[0, { cost: 0, assignments: [] }]]);
  for (const entry of currentPlayers) {
    const nextStates = new Map(states);
    for (const [mask, state] of states) {
      toFormation.slots.forEach((slot, slotIndex) => {
        if (mask & (1 << slotIndex)) return;
        const penalty = compatibilityPenalty(entry.player.position, slot.position);
        if (!Number.isFinite(penalty)) return;
        const movement = Math.hypot(
          Number(entry.previousSlot.x) - Number(slot.x),
          Number(entry.previousSlot.y) - Number(slot.y),
        );
        const nextMask = mask | (1 << slotIndex);
        const candidate = {
          cost: state.cost + (penalty * 1000) + movement,
          assignments: [...state.assignments, [slot.id, entry.player.id]],
        };
        const existing = nextStates.get(nextMask);
        if (!existing || candidate.cost < existing.cost) {
          nextStates.set(nextMask, candidate);
        }
      });
    }
    states = nextStates;
  }

  const best = [...states.entries()].sort((left, right) =>
    bitCount(right[0]) - bitCount(left[0]) ||
    left[1].cost - right[1].cost
  )[0]?.[1];
  return Object.fromEntries(best?.assignments ?? []);
}

export function reconcileLineupPlayerPositions(collection, lineup, formationId) {
  const formation = FORMATIONS[formationId] ?? FORMATIONS["4-3-3"];
  const currentPositions = new Map(
    formation.slots
      .filter((slot) => lineup?.[slot.id])
      .map((slot) => [lineup[slot.id], slot.position]),
  );
  return collection.map((player) =>
    reconcilePlayerPrimaryPosition(player, currentPositions.get(player.id) ?? null)
  );
}
export function lineupEntries(collection, lineup, formationId) {
  const formation = FORMATIONS[formationId] ?? FORMATIONS["4-3-3"];
  return formation.slots
    .map((slot) => {
      const player = collection.find((candidate) => candidate.id === lineup[slot.id]);
      return player ? { slot, player, effectiveOverall: effectiveOverall(player, slot.position) } : null;
    })
    .filter(Boolean);
}

export function isLineupComplete(collection, lineup, formationId) {
  return lineupEntries(collection, lineup, formationId).length === 11;
}

export function createDefaultSeason(number = 1) {
  return {
    number,
    week: 0,
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    matches: [],
    opponents: [],
    ballonDor: null,
    complete: false,
    finalPosition: null,
    prizeMillions: 0,
    prizeAwarded: false,
  };
}

export function createEmptyTransferMarket() {
  return {
    batchId: "",
    theme: "",
    generatedAt: 0,
    freeRevealsUsed: 0,
    packOpened: false,
    players: [],
  };
}

export function createDefaultStatistics() {
  return {
    club: {},
    allClubs: {},
  };
}

export function createDefaultSave() {
  return {
    version: SAVE_VERSION,
    anonymousUserId: globalThis.crypto?.randomUUID?.() ?? `anon-${Date.now()}`,
    clubProfile: normalizeClubProfile(),
    collection: [],
    formationId: "4-3-3",
    lineup: {},
    themeHistory: [],
    seasonHistory: [],
    season: createDefaultSeason(),
    finances: {
      balanceMillions: STARTING_BALANCE_MILLIONS,
      totalPrizeMoneyMillions: 0,
      totalSpentMillions: 0,
      totalScoutingSpentMillions: 0,
      totalSalesMillions: 0,
    },
    transferMarket: createEmptyTransferMarket(),
    statistics: createDefaultStatistics(),
  };
}

export function prepareGeneratedPlayers(pack) {
  const ratings = ratingsForPack(pack.players, pack.batchId);
  return pack.players.map((player, index) => {
    const priorityRank = player.priorityRank ?? index + 1;
    return {
      id: player.id,
      name: player.name.trim(),
      theme: pack.theme.trim(),
      position: player.position,
      priorityRank,
      overall: ratings[index],
      positionRatings: positionRatingsForPlayer({
        position: player.position,
        overall: ratings[index],
      }),
      ratingModelVersion: RATING_MODEL_VERSION,
      batchId: pack.batchId,
      portrait: {
        candidates: [],
        index: -1,
        useFallback: true,
        searchedAt: 0,
      },
      stats: {
        appearances: 0,
        goals: 0,
        assists: 0,
        saves: 0,
        tackles: 0,
        yellowCards: 0,
        redCards: 0,
        ratingTotal: 0,
      },
    };
  });
}

export function prepareInitialSquad(pack, seasonNumber = 1) {
  const formation = FORMATIONS[pack?.formationId];
  if (!formation || !Array.isArray(pack?.players)) {
    throw new Error("The starting squad response is invalid.");
  }
  if (pack.players.length !== formation.slots.length) {
    throw new Error(`The starting squad must contain ${formation.slots.length} players.`);
  }

  const names = new Set(pack.players.map((player) => normalizeName(player?.name)));
  if (names.has("") || names.size !== pack.players.length) {
    throw new Error("The starting squad contains duplicate players.");
  }

  const actualPositions = pack.players.map((player) => player.position).sort();
  const requiredPositions = formation.slots.map((slot) => slot.position).sort();
  if (
    actualPositions.length !== requiredPositions.length ||
    actualPositions.some((position, index) => position !== requiredPositions[index])
  ) {
    throw new Error("The starting squad does not cover the selected formation.");
  }

  return prepareGeneratedPlayers(pack).map((player) => ({
    ...player,
    acquisition: {
      feeMillions: 0,
      season: Number(seasonNumber) || 1,
      theme: pack.theme.trim(),
      type: "initial_squad",
    },
  }));
}

export function signingPriceMillions(player) {
  const overall = clamp(Number(player?.overall) || 75, 75, 90);
  const normalizedOverall = (overall - 75) / 15;
  return Math.round(clamp(
    MIN_SIGNING_PRICE_MILLIONS +
      ((MAX_SIGNING_PRICE_MILLIONS - MIN_SIGNING_PRICE_MILLIONS) *
        (normalizedOverall ** 1.6)),
    MIN_SIGNING_PRICE_MILLIONS,
    MAX_SIGNING_PRICE_MILLIONS,
  ));
}

export function resalePlacementMultiplier(placement) {
  return [1, 0.78, 0.62, 0.48, 0.35, 0.24, 0.15, 0.08][clamp(
    Math.round(Number(placement) || 8),
    1,
    8,
  ) - 1];
}

export function teamPlacementForResale(save) {
  const season = save?.season;
  if (!season) return 8;
  if (season.complete && Number.isFinite(Number(season.finalPosition))) {
    return clamp(Math.round(Number(season.finalPosition)), 1, 8);
  }
  if (!Array.isArray(season.matches) || season.matches.length === 0) return 8;
  return leagueStandings(save).find((club) => club.isUser)?.position ?? 8;
}

export function marketValueMillions(player, context) {
  const save = context?.season && Array.isArray(context.season?.matches)
    ? context
    : null;
  const season = save?.season ?? context;
  const placement = save
    ? teamPlacementForResale(save)
    : clamp(Math.round(Number(season?.finalPosition) || 8), 1, 8);
  const overall = clamp(Number(player?.overall) || 75, 75, 90);
  const normalizedOverall = (overall - 75) / 15;
  const overallValue = 25 + (170 * (normalizedOverall ** 1.65));
  const seasonStats = playerSeasonPerformance(season, player?.id);
  const careerStats = player?.stats ?? {};
  const careerAppearances = Number(careerStats.appearances) || 0;
  const category = positionCategory(player?.position);
  const attackingOutput =
    (seasonStats.goals * 12) +
    (seasonStats.assists * 8) +
    ((Number(careerStats.goals) || 0) * 4) +
    ((Number(careerStats.assists) || 0) * 2.5);
  const defensiveOutput = category === "GK"
    ? (seasonStats.saves * 2.2) + ((Number(careerStats.saves) || 0) * 0.65)
    : ["DEF", "MID"].includes(category)
      ? (seasonStats.tackles * 0.9) + ((Number(careerStats.tackles) || 0) * 0.25)
      : seasonStats.tackles * 0.2;
  const totalOutput = attackingOutput + defensiveOutput;
  const outputPerAppearance = Math.max(seasonStats.appearances, careerAppearances)
    ? totalOutput / Math.max(seasonStats.appearances, careerAppearances)
    : 0;
  const performanceMultiplier = seasonStats.appearances === 0 && careerAppearances === 0
    ? 0.05
    : totalOutput === 0
      ? 0.035
      : clamp(
        0.06 + (totalOutput / 105) + (outputPerAppearance / 32),
        0.05,
        1.3,
      );

  return Math.round(clamp(
    overallValue * performanceMultiplier * resalePlacementMultiplier(placement),
    1,
    MAX_RESALE_VALUE_MILLIONS,
  ));
}

export function prepareTransferMarket(pack) {
  const players = prepareGeneratedPlayers(pack);
  return {
    batchId: pack.batchId,
    theme: pack.theme.trim(),
    generatedAt: Date.now(),
    freeRevealsUsed: 0,
    packOpened: false,
    players: players.map((player) => ({
      ...player,
      isRevealed: false,
      isFreeTransfer: false,
      askingPriceMillions: signingPriceMillions(player),
    })),
  };
}

export function revealTransferCard(market, playerId) {
  const next = structuredClone(market ?? createEmptyTransferMarket());
  const used = Math.max(0, Number(next.freeRevealsUsed) || 0);
  const player = next.players?.find((candidate) => candidate.id === playerId);
  if (!player || player.isRevealed || used >= FREE_TRANSFER_COUNT) return next;

  player.isRevealed = true;
  player.isFreeTransfer = true;
  player.askingPriceMillions = 0;
  next.freeRevealsUsed = used + 1;

  if (next.freeRevealsUsed >= FREE_TRANSFER_COUNT) {
    next.packOpened = true;
    next.players.forEach((candidate) => { candidate.isRevealed = true; });
  }
  return next;
}

function ensuredFinances(save) {
  return {
    balanceMillions: Number(save.finances?.balanceMillions) || 0,
    totalPrizeMoneyMillions: Number(save.finances?.totalPrizeMoneyMillions) || 0,
    totalSpentMillions: Number(save.finances?.totalSpentMillions) || 0,
    totalScoutingSpentMillions: Number(save.finances?.totalScoutingSpentMillions) || 0,
    totalSalesMillions: Number(save.finances?.totalSalesMillions) || 0,
  };
}

export function chargeScoutingFee(save) {
  const finances = ensuredFinances(save);
  if (finances.balanceMillions < SCOUTING_COST_MILLIONS) {
    return {
      ok: false,
      reason: `Scouting costs €${SCOUTING_COST_MILLIONS}m. Sell a player or earn prize money first.`,
      save,
    };
  }

  const next = structuredClone(save);
  next.finances = ensuredFinances(next);
  next.finances.balanceMillions -= SCOUTING_COST_MILLIONS;
  next.finances.totalScoutingSpentMillions += SCOUTING_COST_MILLIONS;
  return { ok: true, costMillions: SCOUTING_COST_MILLIONS, save: next };
}

export function signTransfer(save, playerId) {
  const listing = save.transferMarket?.players?.find((player) => player.id === playerId);
  if (!listing) {
    return { ok: false, reason: "That player is no longer on the market.", save };
  }
  if (listing.isRevealed === false) {
    return { ok: false, reason: "Reveal that scouting card before making an offer.", save };
  }
  if (save.collection.length >= COLLECTION_LIMIT) {
    return {
      ok: false,
      reason: `The squad is capped at ${COLLECTION_LIMIT} players. Sell someone first.`,
      save,
    };
  }

  const costMillions = listing.isFreeTransfer
    ? 0
    : clamp(
      Math.round(Number(listing.askingPriceMillions) || 0),
      MIN_SIGNING_PRICE_MILLIONS,
      MAX_SIGNING_PRICE_MILLIONS,
    );
  const finances = ensuredFinances(save);
  if (finances.balanceMillions < costMillions) {
    return {
      ok: false,
      reason: `You need €${costMillions}m to sign ${listing.name}.`,
      save,
    };
  }

  const next = structuredClone(save);
  const signedPlayer = next.transferMarket.players.find((player) => player.id === playerId);
  next.transferMarket.players = next.transferMarket.players.filter((player) => player.id !== playerId);
  next.finances = ensuredFinances(next);
  next.finances.balanceMillions -= costMillions;
  next.finances.totalSpentMillions += costMillions;
  delete signedPlayer.isFreeTransfer;
  delete signedPlayer.isRevealed;
  delete signedPlayer.askingPriceMillions;
  signedPlayer.acquisition = {
    feeMillions: costMillions,
    season: next.season.number,
    theme: next.transferMarket.theme,
  };
  next.collection.push(signedPlayer);

  return {
    ok: true,
    costMillions,
    player: signedPlayer,
    save: next,
  };
}

export function sellPlayer(save, playerId) {
  const player = save.collection.find((candidate) => candidate.id === playerId);
  if (!player) {
    return { ok: false, reason: "That player is no longer in your squad.", save };
  }

  const valueMillions = marketValueMillions(player, save);
  const next = structuredClone(save);
  next.collection = next.collection.filter((candidate) => candidate.id !== playerId);
  next.finances = ensuredFinances(next);
  next.finances.balanceMillions += valueMillions;
  next.finances.totalSalesMillions += valueMillions;
  next.lineup = Object.fromEntries(
    Object.entries(next.lineup ?? {}).filter(([, lineupPlayerId]) => lineupPlayerId !== playerId),
  );

  return {
    ok: true,
    valueMillions,
    player,
    save: next,
  };
}

export function seasonPrizeForPlacement(placement) {
  return [45, 32, 24, 16, 10, 7, 4, 2][clamp(
    Math.round(Number(placement) || 8),
    1,
    8,
  ) - 1];
}

function weightedChoice(items, weightFor, rng) {
  if (!items.length) return null;
  const weights = items.map((item) => Math.max(0, weightFor(item)));
  const total = weights.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return items[Math.floor(rng() * items.length)];

  let cursor = rng() * total;
  for (let index = 0; index < items.length; index += 1) {
    cursor -= weights[index];
    if (cursor <= 0) return items[index];
  }
  return items.at(-1);
}

function samplePoisson(lambda, rng) {
  const threshold = Math.exp(-lambda);
  let product = 1;
  let count = 0;

  do {
    count += 1;
    product *= rng();
  } while (product > threshold && count < 20);

  return count - 1;
}

function average(values, fallback = 78) {
  if (!values.length) return fallback;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function randomMinute(rng) {
  return clamp(Math.floor(rng() * 90) + 1, 1, 90);
}

function generatedSeasonLeagueClubs(save, count = MAX_SEASON_OPPONENTS) {
  const seed = `${save.anonymousUserId}:season-${save.season.number}:league`;
  const rng = createRng(seed);
  const names = [...CLUB_NAMES];

  for (let index = names.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [names[index], names[swapIndex]] = [names[swapIndex], names[index]];
  }

  return names.slice(0, count).map((name, index) => ({
    id: `season-${save.season.number}-club-${index + 1}`,
    name,
    formationId: "4-4-2",
    strength: Math.round(clamp(76.5 + (index * 0.3) + (rng() * 1.5), 76, 86)),
    isPublished: false,
  }));
}

function usablePublishedOpponent(team) {
  return Boolean(
    team &&
    typeof team.id === "string" &&
    typeof team.name === "string" &&
    FORMATIONS[team.formationId] &&
    Array.isArray(team.players) &&
    team.players.length === 11
  );
}

function publishedLeagueClub(team) {
  const formation = FORMATIONS[team.formationId];
  const rosterBySlot = new Map(team.players.map((player) => [player.slotId, player]));
  const roster = formation.slots.map((slot, index) => {
    const player = rosterBySlot.get(slot.id) ?? team.players[index];
    return {
      ...player,
      slotId: slot.id,
      theme: player.theme ?? team.theme ?? "NPC opponent",
      overall: Math.round(clamp(Number(player.overall) || 75, 1, 99)),
    };
  });
  const averageOverall = average(roster.map((player) => player.overall), 78);
  return {
    id: team.id,
    name: team.name,
    icon: team.iconImage || team.icon || "◆",
    iconImageTransform: team.iconImageTransform ?? { scale: 1, x: 0, y: 0 },
    theme: team.theme ?? "NPC opponent",
    formationId: formation.id,
    strength: Math.round(averageOverall),
    roster,
    isPublished: true,
    sourceDraftId: team.sourceDraftId ?? "",
  };
}

function seasonOpponentTarget(publishedCount) {
  let target = Math.max(
    DEFAULT_SEASON_OPPONENTS,
    Math.min(MAX_SEASON_OPPONENTS, Number(publishedCount) || 0),
  );
  if (target % 2 === 0) target = Math.min(MAX_SEASON_OPPONENTS, target + 1);
  return target;
}

export function syncSeasonOpponents(save, publishedOpponents = []) {
  const current = Array.isArray(save?.season?.opponents) ? save.season.opponents : [];
  const seasonStarted = Number(save?.season?.week) > 0 || (save?.season?.matches?.length ?? 0) > 0;
  const published = publishedOpponents
    .filter(usablePublishedOpponent)
    .map(publishedLeagueClub)
    .sort((left, right) => left.id.localeCompare(right.id));

  if (seasonStarted && current.length > 0) {
    const publishedById = new Map(published.map((club) => [club.id, club]));
    let presentationChanged = false;
    const opponents = current.map((club) => {
      const latest = publishedById.get(club.id);
      if (!latest) return club;
      const next = {
        ...club,
        icon: latest.icon,
        iconImageTransform: latest.iconImageTransform,
      };
      if (club.icon !== next.icon || JSON.stringify(club.iconImageTransform ?? {}) !== JSON.stringify(next.iconImageTransform ?? {})) {
        presentationChanged = true;
      }
      return next;
    });
    return presentationChanged
      ? { ...save, season: { ...save.season, opponents } }
      : save;
  }
  const rng = createRng(`${save.anonymousUserId}:season-${save.season.number}:published-opponents`);
  for (let index = published.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [published[index], published[swapIndex]] = [published[swapIndex], published[index]];
  }

  const selected = published.slice(0, MAX_SEASON_OPPONENTS);
  const target = seasonOpponentTarget(selected.length);
  const usedNames = new Set(selected.map((club) => normalizeName(club.name)));
  const generated = generatedSeasonLeagueClubs(save, MAX_SEASON_OPPONENTS)
    .filter((club) => !usedNames.has(normalizeName(club.name)));
  const opponents = [...selected, ...generated].slice(0, target);
  return {
    ...save,
    season: {
      ...save.season,
      opponents,
    },
  };
}

function seasonLeagueClubs(save) {
  const snapshot = Array.isArray(save?.season?.opponents)
    ? save.season.opponents.filter((club) => club && typeof club.id === "string" && typeof club.name === "string")
    : [];
  const validSnapshot =
    snapshot.length >= DEFAULT_SEASON_OPPONENTS &&
    snapshot.length <= MAX_SEASON_OPPONENTS &&
    snapshot.length % 2 === 1;
  return validSnapshot ? snapshot : generatedSeasonLeagueClubs(save, DEFAULT_SEASON_OPPONENTS);
}

function seasonLeagueSchedule(save) {
  const userClub = { id: USER_CLUB_ID, name: clubNameForSave(save), isUser: true };
  const rivals = seasonLeagueClubs(save);
  const rotating = [userClub, ...[...rivals].reverse()];
  const rounds = [];

  for (let round = 0; round < rotating.length - 1; round += 1) {
    const fixtures = [];
    for (let index = 0; index < rotating.length / 2; index += 1) {
      const left = rotating[index];
      const right = rotating[rotating.length - 1 - index];
      fixtures.push((round + index) % 2 === 0 ? [left, right] : [right, left]);
    }
    rounds.push(fixtures);
    rotating.splice(1, 0, rotating.pop());
  }

  return rounds;
}

function scheduledUserOpponent(save, week) {
  const fixtures = seasonLeagueSchedule(save)[week - 1] ?? [];
  const fixture = fixtures.find(([home, away]) =>
    home.id === USER_CLUB_ID || away.id === USER_CLUB_ID,
  );
  if (!fixture) return seasonLeagueClubs(save)[0];
  return fixture.find((club) => club.id !== USER_CLUB_ID);
}

function createOpponent(seed, week, leagueClub = null) {
  const rng = createRng(`${seed}:opponent`);
  const name = leagueClub?.name ?? CLUB_NAMES[Math.floor(rng() * CLUB_NAMES.length)];
  const formation = FORMATIONS[leagueClub?.formationId] ?? FORMATIONS["4-4-2"];
  const baseStrength = leagueClub?.strength ??
    Math.round(clamp(76 + ((week - 1) * 1.25) + (rng() * 3), 76, 86));
  const publishedRoster = Array.isArray(leagueClub?.roster) && leagueClub.roster.length === 11;
  const usedNames = new Set();
  const sourceBySlot = new Map(
    publishedRoster ? leagueClub.roster.map((player) => [player.slotId, player]) : [],
  );

  const roster = formation.slots.map((slot, index) => {
    if (publishedRoster) {
      const player = sourceBySlot.get(slot.id) ?? leagueClub.roster[index];
      return {
        ...player,
        id: String(player.id ?? `${leagueClub.id}:player-${index + 1}`),
        name: String(player.name ?? `Opponent ${index + 1}`),
        theme: player.theme ?? leagueClub.theme ?? "NPC opponent",
        position: ALL_POSITIONS.includes(player.position) ? player.position : slot.position,
        slotId: slot.id,
        overall: Math.round(clamp(Number(player.overall) || baseStrength, 1, 99)),
        portrait: player.portrait ?? { candidates: [], index: -1, useFallback: true, searchedAt: 0 },
      };
    }

    let playerName = "";
    let attempts = 0;
    do {
      const first = RIVAL_FIRST_NAMES[Math.floor(rng() * RIVAL_FIRST_NAMES.length)];
      const last = RIVAL_SURNAMES[Math.floor(rng() * RIVAL_SURNAMES.length)];
      playerName = `${first} ${last}`;
      attempts += 1;
    } while (usedNames.has(playerName) && attempts < 20);
    usedNames.add(playerName);
    return {
      id: `${leagueClub?.id ?? normalizeName(name)}:rival-${index}`,
      name: playerName,
      theme: `${name} squad`,
      position: slot.position,
      slotId: slot.id,
      overall: clamp(Math.round(baseStrength + ((rng() - 0.5) * 6)), 72, 89),
      portrait: { candidates: [], index: -1, useFallback: true, searchedAt: 0 },
    };
  });
  const entries = formation.slots.map((slot, index) => ({
    slot,
    player: roster[index],
    effectiveOverall: effectiveOverall(roster[index], slot.position),
  }));
  const units = unitRatings(entries);
  const strength = publishedRoster
    ? Math.round(average(entries.map((entry) => entry.effectiveOverall), baseStrength))
    : baseStrength;

  return {
    id: leagueClub?.id ?? normalizeName(name),
    name,
    icon: leagueClub?.iconImage || leagueClub?.icon || "◆",
    iconImageTransform: leagueClub?.iconImageTransform ?? { scale: 1, x: 0, y: 0 },
    theme: leagueClub?.theme ?? `${name} squad`,
    formationId: formation.id,
    isPublished: leagueClub?.isPublished === true,
    strength,
    attack: publishedRoster ? units.attack : strength + ((rng() - 0.5) * 3),
    defence: publishedRoster ? units.defence : strength + ((rng() - 0.5) * 3),
    control: publishedRoster ? units.control : strength,
    units,
    roster,
  };
}

export function previewOpponent(save, week = save.season.week + 1) {
  const leagueClub = scheduledUserOpponent(save, week);
  const seed = `${save.anonymousUserId}:season-${save.season.number}:club-${leagueClub.id}`;
  return createOpponent(seed, week, leagueClub);
}

export function previewSeasonOpponent(save, opponentId) {
  const leagueClub = seasonLeagueClubs(save).find((club) => club.id === opponentId);
  if (!leagueClub) return null;
  const seed = `${save.anonymousUserId}:season-${save.season.number}:club-${leagueClub.id}`;
  return createOpponent(seed, save.season.week + 1, leagueClub);
}

function unitRatings(entries) {
  const groups = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const entry of entries) {
    groups[positionCategory(entry.slot.position)].push(entry.effectiveOverall);
  }

  const goalkeeper = average(groups.GK);
  const defenders = average(groups.DEF);
  const midfielders = average(groups.MID);
  const forwards = average(groups.FWD);

  return {
    attack: (forwards * 0.55) + (midfielders * 0.35) + (defenders * 0.1),
    defence: (defenders * 0.45) + (goalkeeper * 0.3) + (midfielders * 0.25),
    control: (midfielders * 0.55) + (defenders * 0.25) + (forwards * 0.2),
  };
}

function cardWeight(player) {
  return {
    GK: 0.25,
    DEF: 2.1,
    MID: 1.55,
    FWD: 0.8,
  }[positionCategory(player.position)];
}

function scorerWeight(player, lineupPosition) {
  const category = positionCategory(lineupPosition ?? player.position);
  const base = { GK: 0.03, DEF: 0.7, MID: 2.4, FWD: 5.2 }[category];
  return base * (player.overall / 80) ** 2;
}

function assisterWeight(player, lineupPosition) {
  const category = positionCategory(lineupPosition ?? player.position);
  const base = { GK: 0.05, DEF: 0.9, MID: 4.1, FWD: 2.7 }[category];
  return base * (player.overall / 80);
}

export function normalizeCardEvents(events = []) {
  const resolved = [];
  const yellowCounts = new Map();
  const dismissed = new Set();
  const cardOrder = { yellow: 0, red: 1 };
  const ordered = [...events].sort((left, right) =>
    left.minute - right.minute ||
    (cardOrder[left.type] ?? 2) - (cardOrder[right.type] ?? 2),
  );

  for (const event of ordered) {
    if (!event?.playerId || dismissed.has(event.playerId)) continue;
    if (event.type === "red") {
      resolved.push(event);
      dismissed.add(event.playerId);
      continue;
    }
    if (event.type !== "yellow") continue;

    const yellowCount = (yellowCounts.get(event.playerId) ?? 0) + 1;
    yellowCounts.set(event.playerId, yellowCount);
    resolved.push(event);
    if (yellowCount >= 2) {
      resolved.push({
        ...event,
        type: "red",
        dismissal: "second-yellow",
      });
      dismissed.add(event.playerId);
    }
  }

  return resolved;
}

function buildCards(players, side, rng) {
  const candidates = [];
  const yellowCount = Math.min(4, samplePoisson(1.35, rng));

  for (let index = 0; index < yellowCount; index += 1) {
    const player = weightedChoice(players, cardWeight, rng);
    if (!player) continue;
    candidates.push({
      minute: randomMinute(rng),
      type: "yellow",
      side,
      playerId: player.id,
      playerName: player.name,
    });
  }

  if (rng() < 0.085) {
    const player = weightedChoice(players, cardWeight, rng);
    if (player) {
      candidates.push({
        minute: clamp(18 + Math.floor(rng() * 70), 1, 90),
        type: "red",
        side,
        playerId: player.id,
        playerName: player.name,
        dismissal: "straight-red",
      });
    }
  }

  return normalizeCardEvents(candidates);
}

const RED_CARD_ATTACK_MULTIPLIER = 0.62;

export function scoringSegmentsForCards(lambda, cardEvents = [], side) {
  const redMinutes = cardEvents
    .filter((event) => event.side === side && event.type === "red")
    .map((event) => clamp(Math.round(Number(event.minute) || 1), 1, 90))
    .sort((left, right) => left - right);
  const segments = [];
  let startMinute = 0;
  let multiplier = 1;

  for (const redMinute of redMinutes) {
    if (redMinute > startMinute) {
      const duration = redMinute - startMinute;
      segments.push({
        startMinute,
        endMinute: redMinute,
        multiplier,
        expectedGoals: lambda * (duration / 90) * multiplier,
      });
    }
    multiplier *= RED_CARD_ATTACK_MULTIPLIER;
    startMinute = Math.max(startMinute, redMinute);
  }

  if (startMinute < 90 || !segments.length) {
    const duration = 90 - startMinute;
    segments.push({
      startMinute,
      endMinute: 90,
      multiplier,
      expectedGoals: lambda * (duration / 90) * multiplier,
    });
  }
  return segments;
}

function goalPlanForMatch(lambda, cardEvents, side, rng) {
  const segments = scoringSegmentsForCards(lambda, cardEvents, side);
  const minutes = [];
  for (const segment of segments) {
    const remainingGoalSlots = 7 - minutes.length;
    if (remainingGoalSlots <= 0) break;
    const count = Math.min(
      remainingGoalSlots,
      samplePoisson(segment.expectedGoals, rng),
    );
    const duration = Math.max(1, segment.endMinute - segment.startMinute);
    for (let index = 0; index < count; index += 1) {
      minutes.push(clamp(
        Math.floor(segment.startMinute + (rng() * duration)) + 1,
        1,
        90,
      ));
    }
  }
  return {
    minutes: minutes.sort((left, right) => left - right),
    expectedGoals: segments.reduce((total, segment) => total + segment.expectedGoals, 0),
  };
}

function availableAtMinute(players, redEvents, side, minute) {
  const dismissed = new Set(
    redEvents
      .filter((event) => event.side === side && event.type === "red" && event.minute < minute)
      .map((event) => event.playerId),
  );
  return players.filter((player) => !dismissed.has(player.id));
}

function makeGoals({
  goalMinutes,
  side,
  players,
  slotByPlayer,
  cardEvents,
  rng,
}) {
  return goalMinutes.map((minute) => {
    const available = availableAtMinute(players, cardEvents, side, minute);
    const scorer = weightedChoice(
      available,
      (player) => scorerWeight(player, slotByPlayer.get(player.id)),
      rng,
    ) ?? players[0];

    const assistPool = available.filter((player) => player.id !== scorer.id);
    const assister = rng() < 0.75
      ? weightedChoice(
        assistPool,
        (player) => assisterWeight(player, slotByPlayer.get(player.id)),
        rng,
      )
      : null;

    return {
      minute,
      type: "goal",
      side,
      playerId: scorer.id,
      playerName: scorer.name,
      assisterId: assister?.id ?? null,
      assisterName: assister?.name ?? null,
    };
  });
}

function playerMatchRatings(entries, events, score, teamStats, rng, side = "user") {
  const resultModifier = score.for > score.against ? 0.35 : score.for === score.against ? 0 : -0.45;

  return entries
    .map(({ player, slot, effectiveOverall: effective }) => {
      const playerEvents = events.filter((event) => event.side === side && event.playerId === player.id);
      const assists = events.filter(
        (event) => event.side === side && event.type === "goal" && event.assisterId === player.id,
      ).length;
      const goals = playerEvents.filter((event) => event.type === "goal").length;
      const yellows = playerEvents.filter((event) => event.type === "yellow").length;
      const reds = playerEvents.filter((event) => event.type === "red").length;
      const category = positionCategory(slot.position);
      const saves = category === "GK"
        ? Math.max(0, Math.round(Number(teamStats?.saves) || 0))
        : 0;
      const tackleBase = category === "DEF"
        ? (rng() * 5) + Math.max(0, (effective - 75) / 10)
        : category === "MID"
          ? (rng() * 4) + Math.max(0, (effective - 80) / 15)
          : category === "FWD"
            ? rng() * 1.6
            : 0;
      const tackles = Math.round(clamp(
        tackleBase,
        0,
        category === "DEF" ? 7 : category === "MID" ? 5 : 2,
      ));
      const cleanSheetBonus = score.against === 0
        ? category === "GK" ? 0.65 : category === "DEF" ? 0.35 : 0
        : 0;
      const concessionPenalty = ["GK", "DEF"].includes(category)
        ? Math.max(0, score.against - 1) * 0.16
        : 0;
      const noise = (rng() * 1.2) - 0.6;
      const rating = clamp(
        6.2 +
        ((effective - 82) / 18) +
        resultModifier +
        cleanSheetBonus -
        concessionPenalty +
        (goals * 1.15) +
        (assists * 0.65) -
        (yellows * 0.3) -
        (reds * 1.55) +
        Math.min(0.6, saves * 0.12) +
        Math.min(0.45, tackles * 0.08) +
        noise,
        4,
        10,
      );

      return {
        playerId: player.id,
        playerName: player.name,
        slotId: slot.id,
        position: slot.position,
        goals,
        assists,
        saves,
        tackles,
        yellows,
        reds,
        rating: Number(rating.toFixed(1)),
      };
    })
    .sort((left, right) => right.rating - left.rating);
}

function cardTotals(events, side) {
  return {
    yellowCards: events.filter((event) => event.side === side && event.type === "yellow").length,
    redCards: events.filter((event) => event.side === side && event.type === "red").length,
  };
}

function buildMatchStatistics({
  userGoals,
  opponentGoals,
  userLambda,
  opponentLambda,
  userControl,
  opponentControl,
  events,
  rng,
}) {
  const possessionNoise = (rng() - 0.5) * 7;
  const userPossession = Math.round(clamp(
    50 + ((userControl - opponentControl) * 0.85) + possessionNoise,
    32,
    68,
  ));
  const opponentPossession = 100 - userPossession;

  const userShotsOnTarget = Math.round(clamp(
    userGoals + samplePoisson(1.8 + (userLambda * 0.75), rng),
    userGoals,
    14,
  ));
  const opponentShotsOnTarget = Math.round(clamp(
    opponentGoals + samplePoisson(1.8 + (opponentLambda * 0.75), rng),
    opponentGoals,
    14,
  ));
  const userShots = Math.round(clamp(
    userShotsOnTarget + samplePoisson(3.4 + (userLambda * 0.9), rng),
    userShotsOnTarget,
    26,
  ));
  const opponentShots = Math.round(clamp(
    opponentShotsOnTarget + samplePoisson(3.4 + (opponentLambda * 0.9), rng),
    opponentShotsOnTarget,
    26,
  ));
  const userCards = cardTotals(events, "user");
  const opponentCards = cardTotals(events, "opponent");

  const user = {
    possession: userPossession,
    shots: userShots,
    shotsOnTarget: userShotsOnTarget,
    expectedGoals: Number(userLambda.toFixed(1)),
    corners: Math.round(clamp(
      samplePoisson(3.1 + (userLambda * 0.8) + Math.max(0, userPossession - 50) * 0.035, rng),
      0,
      15,
    )),
    fouls: Math.max(
      userCards.yellowCards + userCards.redCards,
      6 + samplePoisson(4.6, rng),
    ),
    offsides: Math.round(clamp(samplePoisson(1.25 + (userLambda * 0.25), rng), 0, 7)),
    saves: Math.max(0, opponentShotsOnTarget - opponentGoals),
    ...userCards,
  };
  const opponent = {
    possession: opponentPossession,
    shots: opponentShots,
    shotsOnTarget: opponentShotsOnTarget,
    expectedGoals: Number(opponentLambda.toFixed(1)),
    corners: Math.round(clamp(
      samplePoisson(3.1 + (opponentLambda * 0.8) +
        Math.max(0, opponentPossession - 50) * 0.035, rng),
      0,
      15,
    )),
    fouls: Math.max(
      opponentCards.yellowCards + opponentCards.redCards,
      6 + samplePoisson(4.6, rng),
    ),
    offsides: Math.round(clamp(samplePoisson(1.25 + (opponentLambda * 0.25), rng), 0, 7)),
    saves: Math.max(0, userShotsOnTarget - userGoals),
    ...opponentCards,
  };

  return { user, opponent };
}

function leagueClubRoster(save, club) {
  const seed = `${save.anonymousUserId}:season-${save.season.number}:club-${club.id}`;
  return createOpponent(seed, save.season.number, club).roster;
}

function leagueGoalContributions(save, club, goalCount, seed) {
  const roster = leagueClubRoster(save, club);
  const rng = createRng(`${seed}:contributors:${club.id}`);
  return Array.from({ length: goalCount }, () => {
    const scorer = weightedChoice(
      roster,
      (player) => scorerWeight(player, player.position),
      rng,
    );
    const possibleAssisters = roster.filter((player) => player.id !== scorer.id);
    const assister = rng() > 0.24
      ? weightedChoice(
        possibleAssisters,
        (player) => assisterWeight(player, player.position),
        rng,
      )
      : null;
    return {
      scorerId: scorer.id,
      scorerName: scorer.name,
      scorerPortrait: scorer.portrait,
      scorerPosition: scorer.position,
      scorerTheme: scorer.theme,
      assisterId: assister?.id ?? null,
      assisterName: assister?.name ?? null,
      assisterPortrait: assister?.portrait ?? null,
      assisterPosition: assister?.position ?? null,
      assisterTheme: assister?.theme ?? null,
    };
  });
}

function simulateLeagueFixture(save, home, away, seed) {
  const rng = createRng(seed);
  const homeLambda = clamp(
    1.28 * Math.exp((home.strength - away.strength) / 16) * 1.05,
    0.25,
    3.8,
  );
  const awayLambda = clamp(
    1.2 * Math.exp((away.strength - home.strength) / 16),
    0.25,
    3.8,
  );
  const homeGoals = Math.min(7, samplePoisson(homeLambda, rng));
  const awayGoals = Math.min(7, samplePoisson(awayLambda, rng));

  return {
    homeId: home.id,
    homeName: home.name,
    homeGoals,
    homeContributions: leagueGoalContributions(save, home, homeGoals, seed),
    awayId: away.id,
    awayName: away.name,
    awayGoals,
    awayContributions: leagueGoalContributions(save, away, awayGoals, seed),
  };
}

function leagueResultsForWeek(save, week, userGoals, opponentGoals) {
  const fixtures = seasonLeagueSchedule(save)[week - 1] ?? [];
  const seed = `${save.anonymousUserId}:season-${save.season.number}:week-${week}`;

  return fixtures.map(([home, away], index) => {
    if (home.id === USER_CLUB_ID || away.id === USER_CLUB_ID) {
      const userIsHome = home.id === USER_CLUB_ID;
      return {
        homeId: home.id,
        homeName: home.name,
        homeGoals: userIsHome ? userGoals : opponentGoals,
        awayId: away.id,
        awayName: away.name,
        awayGoals: userIsHome ? opponentGoals : userGoals,
      };
    }
    return simulateLeagueFixture(save, home, away, `${seed}:league-fixture-${index}`);
  });
}

function addStatRecord(bucket, key, {
  id = key,
  name,
  club,
  goals = 0,
  assists = 0,
  portrait = null,
  position = null,
  theme = null,
}) {
  if (!name) return;
  const current = bucket[key] ?? {
    id,
    name,
    club,
    goals: 0,
    assists: 0,
    portrait,
    position,
    theme,
  };
  current.name = name;
  current.club = club;
  if (portrait) current.portrait = portrait;
  if (position) current.position = position;
  if (theme) current.theme = theme;
  current.goals += Number(goals) || 0;
  current.assists += Number(assists) || 0;
  bucket[key] = current;
}

function addLeagueContribution(bucket, clubId, clubName, contribution) {
  const scorerKey = `league:${clubId}:${contribution.scorerId || normalizeName(contribution.scorerName)}`;
  addStatRecord(bucket, scorerKey, {
    id: contribution.scorerId || scorerKey,
    name: contribution.scorerName,
    club: clubName,
    goals: 1,
    portrait: contribution.scorerPortrait,
    position: contribution.scorerPosition,
    theme: contribution.scorerTheme,
  });
  if (!contribution.assisterName) return;
  const assisterKey = `league:${clubId}:${contribution.assisterId || normalizeName(contribution.assisterName)}`;
  addStatRecord(bucket, assisterKey, {
    id: contribution.assisterId || assisterKey,
    name: contribution.assisterName,
    club: clubName,
    assists: 1,
    portrait: contribution.assisterPortrait,
    position: contribution.assisterPosition,
    theme: contribution.assisterTheme,
  });
}

function addMatchToStatisticsBuckets(buckets, match) {
  for (const performance of match.ratings ?? []) {
    const key = `club:${performance.playerId}`;
    const record = {
      id: performance.playerId,
      name: performance.playerName,
      club: match.clubName ?? USER_CLUB_NAME,
      goals: performance.goals,
      assists: performance.assists,
    };
    addStatRecord(buckets.club, key, record);
    addStatRecord(buckets.allClubs, key, record);
  }

  const opponentById = new Map((match.opponentRoster ?? []).map((player) => [player.id, player]));
  for (const event of match.events ?? []) {
    if (event.side !== "opponent" || event.type !== "goal") continue;
    const scorer = opponentById.get(event.playerId);
    const assister = opponentById.get(event.assisterId);
    addLeagueContribution(
      buckets.allClubs,
      match.opponentId || normalizeName(match.opponent),
      match.opponent,
      {
        scorerId: event.playerId,
        scorerName: event.playerName,
        assisterId: event.assisterId,
        assisterName: event.assisterName,
        scorerPortrait: scorer?.portrait,
        scorerPosition: scorer?.position,
        scorerTheme: scorer?.theme,
        assisterPortrait: assister?.portrait,
        assisterPosition: assister?.position,
        assisterTheme: assister?.theme,
      },
    );
  }

  for (const result of match.leagueResults ?? []) {
    if (result.homeId === USER_CLUB_ID || result.awayId === USER_CLUB_ID) continue;
    for (const contribution of result.homeContributions ?? []) {
      addLeagueContribution(
        buckets.allClubs,
        result.homeId,
        result.homeName,
        contribution,
      );
    }
    for (const contribution of result.awayContributions ?? []) {
      addLeagueContribution(
        buckets.allClubs,
        result.awayId,
        result.awayName,
        contribution,
      );
    }
  }
}

function statisticsForMatches(matches = []) {
  const buckets = createDefaultStatistics();
  for (const match of matches) addMatchToStatisticsBuckets(buckets, match);
  return buckets;
}

function normalizeStatBucket(bucket) {
  const normalized = {};
  if (!bucket || typeof bucket !== "object" || Array.isArray(bucket)) return normalized;
  for (const [key, record] of Object.entries(bucket)) {
    if (!record || typeof record.name !== "string") continue;
    normalized[key] = {
      id: typeof record.id === "string" ? record.id : key,
      name: record.name,
      club: typeof record.club === "string" ? record.club : "Unknown club",
      goals: Math.max(0, Number(record.goals) || 0),
      assists: Math.max(0, Number(record.assists) || 0),
      portrait: record.portrait && typeof record.portrait === "object" ? record.portrait : null,
      position: typeof record.position === "string" ? record.position : null,
      theme: typeof record.theme === "string" ? record.theme : null,
    };
  }
  return normalized;
}

export function normalizeStatistics(statistics, collection = [], season = null) {
  const hasArchive = Boolean(
    statistics &&
    statistics.club && typeof statistics.club === "object" &&
    statistics.allClubs && typeof statistics.allClubs === "object",
  );
  const normalized = {
    club: normalizeStatBucket(statistics?.club),
    allClubs: normalizeStatBucket(statistics?.allClubs),
  };
  if (hasArchive) return normalized;

  for (const player of collection) {
    const key = `club:${player.id}`;
    const record = {
      id: player.id,
      name: player.name,
      club: USER_CLUB_NAME,
      goals: player.stats?.goals,
      assists: player.stats?.assists,
    };
    addStatRecord(normalized.club, key, record);
    addStatRecord(normalized.allClubs, key, record);
  }

  const seasonBuckets = statisticsForMatches(season?.matches ?? []);
  for (const [key, record] of Object.entries(seasonBuckets.allClubs)) {
    if (key.startsWith("club:")) continue;
    addStatRecord(normalized.allClubs, key, record);
  }
  return normalized;
}

function rankedStatRecords(bucket, metric) {
  const secondaryMetric = metric === "goals" ? "assists" : "goals";
  return Object.values(bucket)
    .filter((record) => (Number(record[metric]) || 0) > 0)
    .sort((left, right) =>
      (Number(right[metric]) || 0) - (Number(left[metric]) || 0) ||
      (Number(right[secondaryMetric]) || 0) - (Number(left[secondaryMetric]) || 0) ||
      left.name.localeCompare(right.name),
    );
}

function relabelClubStatistics(buckets, clubName) {
  for (const record of Object.values(buckets.club)) record.club = clubName;
  for (const [key, record] of Object.entries(buckets.allClubs)) {
    if (key.startsWith("club:")) record.club = clubName;
  }
}

export function statisticLeaderboards(save, metric = "goals") {
  const selectedMetric = metric === "assists" ? "assists" : "goals";
  const season = statisticsForMatches(save.season?.matches ?? []);
  const allTime = normalizeStatistics(save.statistics, save.collection, save.season);
  const clubName = clubNameForSave(save);
  relabelClubStatistics(season, clubName);
  relabelClubStatistics(allTime, clubName);
  return {
    seasonClub: rankedStatRecords(season.club, selectedMetric),
    seasonAllClubs: rankedStatRecords(season.allClubs, selectedMetric),
    allTimeClub: rankedStatRecords(allTime.club, selectedMetric),
    allTimeAllClubs: rankedStatRecords(allTime.allClubs, selectedMetric),
  };
}

function awardPlayerSnapshot(player, performance, score) {
  return {
    id: player.id,
    name: player.name,
    theme: player.theme,
    club: player.club,
    position: player.position,
    overall: player.overall,
    portrait: player.portrait,
    appearances: performance.appearances,
    goals: performance.goals,
    assists: performance.assists,
    averageRating: performance.appearances ? performance.ratingTotal / performance.appearances : Number(player.overall) || 0,
    score: Math.round(score * 100) / 100,
  };
}

export function seasonBallonDorRanking(save, limit = 3) {
  const seasonStats = statisticsForMatches(save.season?.matches ?? []).allClubs;
  const standings = leagueStandings(save);
  const standingsByClub = new Map(standings.map((club) => [club.name, club]));
  const clubCount = Math.max(standings.length, 2);
  const players = new Map((save.collection ?? []).map((player) => [player.id, { ...player, club: clubNameForSave(save) }]));
  for (const club of seasonLeagueClubs(save)) {
    for (const player of leagueClubRoster(save, club)) {
      if (!players.has(player.id)) players.set(player.id, { ...player, club: club.name });
    }
  }
  return Object.values(seasonStats)
    .filter((record) => (Number(record.goals) || 0) + (Number(record.assists) || 0) > 0)
    .map((record) => {
      const player = players.get(record.id) ?? { id: record.id, name: record.name, theme: record.club, position: "CM", overall: 0, portrait: { candidates: [], index: -1, useFallback: true }, club: record.club };
      const goals = Number(record.goals) || 0;
      const assists = Number(record.assists) || 0;
      const goalContributions = goals + assists;
      const clubStanding = standingsByClub.get(record.club);
      const teamPosition = clubStanding?.position ?? clubCount;
      const standingBonus = Math.round(((clubCount - teamPosition) / (clubCount - 1)) * 24);
      const score = (goalContributions * 10) + standingBonus;
      return {
        id: player.id, name: record.name ?? player.name, theme: player.theme, club: record.club ?? player.club,
        position: player.position, overall: player.overall, portrait: player.portrait, appearances: SEASON_LENGTH,
        goals, assists, goalContributions, averageRating: 0, score, teamPosition, standingBonus,
        scoreBreakdown: { goals, assists, goalContributions, teamPosition, standingBonus },
      };
    })
    .sort((left, right) => right.score - left.score || right.goalContributions - left.goalContributions || right.goals - left.goals || right.assists - left.assists || left.name.localeCompare(right.name))
    .slice(0, Math.max(1, Number(limit) || 3))
    .map((player, index) => ({ ...player, rank: index + 1 }));
}

export function currentBallonDorRace(save) {
  const ranking = seasonBallonDorRanking(save, Number.MAX_SAFE_INTEGER);
  const total = ranking.reduce((sum, player) => sum + Math.max(0, player.score), 0);
  if (!total) return ranking.map((player) => ({ ...player, percentage: 0 }));
  const allocated = ranking.map((player, index) => {
    const exact = (Math.max(0, player.score) / total) * 100;
    return { player, index, percentage: Math.floor(exact), remainder: exact % 1 };
  });
  let remaining = 100 - allocated.reduce((sum, entry) => sum + entry.percentage, 0);
  [...allocated].sort((left, right) => right.remainder - left.remainder || left.index - right.index).forEach((entry) => {
    if (remaining <= 0) return;
    entry.percentage += 1;
    remaining -= 1;
  });
  return allocated.map((entry) => ({ ...entry.player, percentage: entry.percentage }));
}
export function ballonDorAllTime(save) {
  const counts = new Map();
  for (const season of save.seasonHistory ?? []) {
    const winner = season?.winner ?? season?.ballonDor?.winner;
    if (!winner?.id) continue;
    const current = counts.get(winner.id) ?? {
      id: winner.id,
      name: winner.name,
      theme: winner.theme,
      club: winner.club,
      position: winner.position,
      overall: winner.overall,
      portrait: winner.portrait,
      wins: 0,
    };
    current.wins += 1;
    counts.set(winner.id, current);
  }
  return [...counts.values()].sort((left, right) => right.wins - left.wins || left.name.localeCompare(right.name));
}

export function simulateMatch(save) {
  if (save.season.complete || save.season.week >= SEASON_LENGTH) {
    throw new Error("The season is already complete.");
  }

  const entries = lineupEntries(save.collection, save.lineup, save.formationId);
  if (entries.length !== 11) throw new Error("A complete starting XI is required.");

  const week = save.season.week + 1;
  const seed = `${save.anonymousUserId}:season-${save.season.number}:week-${week}`;
  const rng = createRng(`${seed}:match`);
  const opponent = createOpponent(seed, week, scheduledUserOpponent(save, week));
  const formation = FORMATIONS[save.formationId];
  const units = unitRatings(entries);
  const userPlayers = entries.map(({ player }) => player);
  const slotByPlayer = new Map(entries.map(({ player, slot }) => [player.id, slot.position]));
  const rivalSlotByPlayer = new Map(
    opponent.roster.map((player) => [player.id, player.position]),
  );

  const cardEvents = [
    ...buildCards(userPlayers, "user", rng),
    ...buildCards(opponent.roster, "opponent", rng),
  ];

  const userLambda = clamp(
    1.35 *
      Math.exp((units.attack - opponent.defence) / 14) *
      formation.attackModifier,
    0.2,
    4.2,
  );
  const opponentLambda = clamp(
    1.2 *
      Math.exp((opponent.attack - units.defence) / 14) *
      formation.defenceRisk,
    0.2,
    4.2,
  );
  const userGoalPlan = goalPlanForMatch(userLambda, cardEvents, "user", rng);
  const opponentGoalPlan = goalPlanForMatch(opponentLambda, cardEvents, "opponent", rng);
  const userGoals = userGoalPlan.minutes.length;
  const opponentGoals = opponentGoalPlan.minutes.length;

  const goalEvents = [
    ...makeGoals({
      goalMinutes: userGoalPlan.minutes,
      side: "user",
      players: userPlayers,
      slotByPlayer,
      cardEvents,
      rng,
    }),
    ...makeGoals({
      goalMinutes: opponentGoalPlan.minutes,
      side: "opponent",
      players: opponent.roster,
      slotByPlayer: rivalSlotByPlayer,
      cardEvents,
      rng,
    }),
  ];

  const eventOrder = { yellow: 0, red: 1, goal: 2 };
  const events = [...cardEvents, ...goalEvents].sort(
    (left, right) => left.minute - right.minute ||
      (eventOrder[left.type] ?? 9) - (eventOrder[right.type] ?? 9),
  );
  const stats = buildMatchStatistics({
    userGoals,
    opponentGoals,
    userLambda: userGoalPlan.expectedGoals,
    opponentLambda: opponentGoalPlan.expectedGoals,
    userControl: units.control,
    opponentControl: opponent.control,
    events,
    rng,
  });
  const ratings = playerMatchRatings(
    entries,
    events,
    { for: userGoals, against: opponentGoals },
    stats.user,
    rng,
  );
  const opponentFormation = FORMATIONS[opponent.formationId] ?? FORMATIONS["4-4-2"];
  const opponentBySlot = new Map(opponent.roster.map((player) => [player.slotId, player]));
  const opponentEntries = opponentFormation.slots.map((slot, index) => {
    const player = opponentBySlot.get(slot.id) ?? opponent.roster[index];
    return {
      slot,
      player,
      effectiveOverall: effectiveOverall(player, slot.position),
    };
  });
  const opponentRatings = playerMatchRatings(
    opponentEntries,
    events,
    { for: opponentGoals, against: userGoals },
    stats.opponent,
    rng,
    "opponent",
  );

  return {
    id: `season-${save.season.number}-week-${week}`,
    week,
    formationId: save.formationId,
    clubName: clubNameForSave(save),
    opponent: opponent.name,
    opponentId: opponent.id,
    opponentStrength: opponent.strength,
    opponentFormationId: opponent.formationId,
    opponentIcon: opponent.icon,
    opponentTheme: opponent.theme,
    opponentIsPublished: opponent.isPublished,
    opponentUnits: opponent.units,
    opponentRoster: opponent.roster,
    opponentRatings,
    userGoals,
    opponentGoals,
    events,
    stats,
    ratings,
    leagueResults: leagueResultsForWeek(save, week, userGoals, opponentGoals),
    points: userGoals > opponentGoals ? 3 : userGoals === opponentGoals ? 1 : 0,
  };
}

export function applyMatchToSave(save, match) {
  const next = structuredClone(save);
  next.statistics = normalizeStatistics(next.statistics, next.collection, next.season);
  addMatchToStatisticsBuckets(next.statistics, match);
  next.season.week += 1;
  next.season.points += match.points;
  next.season.goalsFor += match.userGoals;
  next.season.goalsAgainst += match.opponentGoals;
  next.season.matches.push(match);

  if (match.userGoals > match.opponentGoals) next.season.wins += 1;
  else if (match.userGoals === match.opponentGoals) next.season.draws += 1;
  else next.season.losses += 1;

  if (next.season.week >= SEASON_LENGTH) next.season.complete = true;

  for (const performance of match.ratings) {
    const player = next.collection.find((candidate) => candidate.id === performance.playerId);
    if (!player) continue;
    player.stats.appearances += 1;
    player.stats.goals += performance.goals;
    player.stats.assists += performance.assists;
    player.stats.saves = (Number(player.stats.saves) || 0) +
      (Number(performance.saves) || 0);
    player.stats.tackles = (Number(player.stats.tackles) || 0) +
      (Number(performance.tackles) || 0);
    player.stats.yellowCards += performance.yellows;
    player.stats.redCards += performance.reds;
    player.stats.ratingTotal += performance.rating;
  }

  if (next.season.complete && !next.season.prizeAwarded) {
    const userRow = leagueStandings(next).find((club) => club.isUser);
    const finalPosition = userRow?.position ?? 8;
    const prizeMillions = seasonPrizeForPlacement(finalPosition);
    next.finances = ensuredFinances(next);
    next.finances.balanceMillions += prizeMillions;
    next.finances.totalPrizeMoneyMillions += prizeMillions;
    next.season.finalPosition = finalPosition;
    next.season.prizeMillions = prizeMillions;
    next.season.prizeAwarded = true;
  }

  if (next.season.complete && !next.season.ballonDor) {
    const finalists = seasonBallonDorRanking(next);
    const winner = finalists[0] ?? null;
    next.season.ballonDor = { winner, finalists };
    next.seasonHistory = [
      ...(Array.isArray(next.seasonHistory) ? next.seasonHistory : []),
      {
        number: next.season.number,
        clubName: clubNameForSave(next),
        finalPosition: next.season.finalPosition,
        winner,
        finalists,
        completedAt: Date.now(),
      },
    ];
  }

  next.collection = reconcileLineupPlayerPositions(
    next.collection,
    next.lineup,
    next.formationId,
  );
  return next;
}

export function leagueStandings(save) {
  const clubs = [
    { id: USER_CLUB_ID, name: clubNameForSave(save), isUser: true },
    ...seasonLeagueClubs(save),
  ];
  const rows = new Map(clubs.map((club) => [club.id, {
    ...club,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  }]));

  const ensureClub = (id, name) => {
    if (!rows.has(id)) {
      rows.set(id, {
        id,
        name,
        isUser: id === USER_CLUB_ID,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    }
    return rows.get(id);
  };

  const applyResult = (result) => {
    const home = ensureClub(result.homeId, result.homeName);
    const away = ensureClub(result.awayId, result.awayName);
    const homeGoals = Number(result.homeGoals) || 0;
    const awayGoals = Number(result.awayGoals) || 0;

    home.played += 1;
    away.played += 1;
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      home.wins += 1;
      away.losses += 1;
      home.points += 3;
    } else if (homeGoals < awayGoals) {
      away.wins += 1;
      home.losses += 1;
      away.points += 3;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
  };

  for (const match of save.season.matches ?? []) {
    if (Array.isArray(match.leagueResults) && match.leagueResults.length) {
      match.leagueResults.forEach(applyResult);
      continue;
    }

    const knownOpponent = clubs.find((club) => club.name === match.opponent);
    applyResult({
      homeId: USER_CLUB_ID,
      homeName: match.clubName ?? clubNameForSave(save),
      homeGoals: match.userGoals,
      awayId: knownOpponent?.id ?? `legacy-${normalizeName(match.opponent)}`,
      awayName: match.opponent,
      awayGoals: match.opponentGoals,
    });
  }

  return [...rows.values()]
    .map((row) => ({
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
    }))
    .sort((left, right) =>
      right.points - left.points ||
      right.goalDifference - left.goalDifference ||
      right.goalsFor - left.goalsFor ||
      left.name.localeCompare(right.name),
    )
    .map((row, index) => ({ ...row, position: index + 1 }));
}

export function seasonRecentFixtures(save, limit = 12) {
  const fixtures = [];
  const clubs = [
    { id: USER_CLUB_ID, name: clubNameForSave(save) },
    ...seasonLeagueClubs(save),
  ];
  for (const [matchIndex, match] of (save.season?.matches ?? []).entries()) {
    const week = Number(match?.week) || matchIndex + 1;
    if (Array.isArray(match?.leagueResults) && match.leagueResults.length) {
      for (const result of match.leagueResults) fixtures.push({ ...result, week });
      continue;
    }
    const knownOpponent = clubs.find((club) => club.name === match?.opponent);
    fixtures.push({
      week,
      homeId: USER_CLUB_ID,
      homeName: match?.clubName ?? clubNameForSave(save),
      homeGoals: Number(match?.userGoals) || 0,
      awayId: knownOpponent?.id ?? ('legacy-' + normalizeName(match?.opponent)),
      awayName: match?.opponent ?? 'Opponent',
      awayGoals: Number(match?.opponentGoals) || 0,
    });
  }
  return fixtures
    .sort((left, right) => right.week - left.week || left.homeName.localeCompare(right.homeName))
    .slice(0, clamp(Math.round(Number(limit) || 12), 1, 64));
}

export function seasonClubForm(save, clubId, limit = 5) {
  return seasonRecentFixtures(save, 64)
    .filter((fixture) => fixture.homeId === clubId || fixture.awayId === clubId)
    .slice(0, clamp(Math.round(Number(limit) || 5), 1, 5))
    .map((fixture) => {
      const isHome = fixture.homeId === clubId;
      const goalsFor = isHome ? fixture.homeGoals : fixture.awayGoals;
      const goalsAgainst = isHome ? fixture.awayGoals : fixture.homeGoals;
      return {
        week: fixture.week,
        result: goalsFor > goalsAgainst ? 'W' : goalsFor < goalsAgainst ? 'L' : 'D',
        opponentId: isHome ? fixture.awayId : fixture.homeId,
        opponentName: isHome ? fixture.awayName : fixture.homeName,
        goalsFor,
        goalsAgainst,
      };
    });
}

export function playerSeasonStats(season, playerId) {
  const totals = { goals: 0, assists: 0 };
  const matches = Array.isArray(season?.matches) ? season.matches : [];

  for (const match of matches) {
    const performance = Array.isArray(match?.ratings)
      ? match.ratings.find((rating) => rating.playerId === playerId)
      : null;
    if (!performance) continue;
    totals.goals += Number(performance.goals) || 0;
    totals.assists += Number(performance.assists) || 0;
  }

  return totals;
}

export function playerSeasonPerformance(season, playerId) {
  const totals = {
    appearances: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    tackles: 0,
  };
  const matches = Array.isArray(season?.matches) ? season.matches : [];

  for (const match of matches) {
    const performance = Array.isArray(match?.ratings)
      ? match.ratings.find((rating) => rating.playerId === playerId)
      : null;
    if (!performance) continue;
    totals.appearances += 1;
    totals.goals += Number(performance.goals) || 0;
    totals.assists += Number(performance.assists) || 0;
    totals.saves += Number(performance.saves) || 0;
    totals.tackles += Number(performance.tackles) || 0;
  }

  return totals;
}

export function seasonAward(points) {
  if (points >= 15) return { label: "Champion", message: "A title-winning prompt experiment." };
  if (points >= 10) return { label: "Contender", message: "In the race from first whistle to last." };
  if (points >= 5) return { label: "Mid-table", message: "Safe, strange, and ready for another theme." };
  return { label: "Rebuild", message: "The notebook stays open. Scout a new idea." };
}
