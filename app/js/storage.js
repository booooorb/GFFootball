import {
  ALL_POSITIONS,
  FORMATIONS,
  MAX_SEASON_OPPONENTS,
  MAX_SIGNING_PRICE_MILLIONS,
  MIN_SIGNING_PRICE_MILLIONS,
  RATING_MODEL_VERSION,
  SEASON_LENGTH,
  SAVE_KEY,
  SAVE_VERSION,
  STARTING_BALANCE_MILLIONS,
  compatibilityPenalty,
  createDefaultSave,
  createDefaultSeason,
  createEmptyTransferMarket,
  normalizeClubProfile,
  normalizeStatistics,
  ratingsForPack,
  reconcileLineupPlayerPositions,
  reconcilePlayerPrimaryPosition,
  signingPriceMillions,
} from "./core.js";

function validPlayer(player) {
  return Boolean(
    player &&
    typeof player.id === "string" &&
    typeof player.name === "string" &&
    ALL_POSITIONS.includes(player.position) &&
    Number.isFinite(player.overall),
  );
}

function migratePlayer(player) {
  return reconcilePlayerPrimaryPosition({
    ...player,
    theme: typeof player.theme === "string" ? player.theme : "Unknown theme",
    portrait: {
      candidates: Array.isArray(player.portrait?.candidates) ? player.portrait.candidates : [],
      index: Number.isInteger(player.portrait?.index) ? player.portrait.index : -1,
      useFallback: player.portrait?.useFallback !== false,
      searchedAt: Number.isFinite(player.portrait?.searchedAt)
        ? player.portrait.searchedAt
        : 0,
    },
    stats: {
      appearances: Number(player.stats?.appearances) || 0,
      goals: Number(player.stats?.goals) || 0,
      assists: Number(player.stats?.assists) || 0,
      saves: Number(player.stats?.saves) || 0,
      tackles: Number(player.stats?.tackles) || 0,
      yellowCards: Number(player.stats?.yellowCards) || 0,
      redCards: Number(player.stats?.redCards) || 0,
      ratingTotal: Number(player.stats?.ratingTotal) || 0,
    },
  });
}

function migrateMarketPlayer(player) {
  const migrated = migratePlayer(player);
  const isFreeTransfer = player.isFreeTransfer === true;
  return {
    ...migrated,
    isRevealed: player.isRevealed !== false,
    isFreeTransfer,
    askingPriceMillions: isFreeTransfer
      ? 0
      : Math.max(
        MIN_SIGNING_PRICE_MILLIONS,
        Math.min(
          MAX_SIGNING_PRICE_MILLIONS,
          Math.round(Number(player.askingPriceMillions) ||
            signingPriceMillions(migrated)),
        ),
      ),
  };
}

function migratePackRatings(collection) {
  const batches = new Map();

  for (const player of collection) {
    if (player.ratingModelVersion === RATING_MODEL_VERSION) continue;
    const batchId = player.batchId || `legacy:${player.id}`;
    if (!batches.has(batchId)) batches.set(batchId, []);
    batches.get(batchId).push(player);
  }

  for (const [batchId, players] of batches) {
    const ratings = ratingsForPack(players, batchId);
    players.forEach((player, index) => {
      player.overall = ratings[index];
      player.ratingModelVersion = RATING_MODEL_VERSION;
    });
  }

  return collection;
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createDefaultSave();

    const parsed = JSON.parse(raw);
    if (parsed.version !== SAVE_VERSION || !Array.isArray(parsed.collection)) {
      return createDefaultSave();
    }

    const formationId = FORMATIONS[parsed.formationId] ? parsed.formationId : "4-3-3";
    let collection = migratePackRatings(
      parsed.collection.filter(validPlayer).map(migratePlayer),
    );
    const playerIds = new Set(collection.map((player) => player.id));
    const formationSlots = new Set(FORMATIONS[formationId].slots.map((slot) => slot.id));
    let lineup = Object.fromEntries(
      Object.entries(parsed.lineup ?? {}).filter(
        ([slotId, playerId]) => formationSlots.has(slotId) && playerIds.has(playerId),
      ),
    );
    const slotsById = new Map(
      FORMATIONS[formationId].slots.map((slot) => [slot.id, slot]),
    );
    lineup = Object.fromEntries(
      Object.entries(lineup).filter(([slotId, playerId]) => {
        const slot = slotsById.get(slotId);
        const player = collection.find((candidate) => candidate.id === playerId);
        return slot && player &&
          Number.isFinite(compatibilityPenalty(player.position, slot.position));
      }),
    );
    collection = reconcileLineupPlayerPositions(collection, lineup, formationId);

    const season = {
      ...createDefaultSeason(Number(parsed.season?.number) || 1),
      ...(parsed.season ?? {}),
      matches: Array.isArray(parsed.season?.matches) ? parsed.season.matches.slice(0, SEASON_LENGTH) : [],
      opponents: Array.isArray(parsed.season?.opponents)
        ? parsed.season.opponents.filter((club) =>
          club && typeof club.id === "string" && typeof club.name === "string"
        ).slice(0, MAX_SEASON_OPPONENTS)
        : [],
    };
    const defaultMarket = createEmptyTransferMarket();
    const marketPlayers = Array.isArray(parsed.transferMarket?.players)
      ? parsed.transferMarket.players.filter(validPlayer).map(migrateMarketPlayer).slice(0, 10)
      : [];

    return {
      version: SAVE_VERSION,
      anonymousUserId:
        typeof parsed.anonymousUserId === "string"
          ? parsed.anonymousUserId
          : createDefaultSave().anonymousUserId,
      clubProfile: normalizeClubProfile(parsed.clubProfile),
      collection,
      formationId,
      lineup,
      themeHistory: Array.isArray(parsed.themeHistory)
        ? parsed.themeHistory.filter((theme) => typeof theme === "string").slice(-25)
        : [],
      seasonHistory: Array.isArray(parsed.seasonHistory)
        ? parsed.seasonHistory.filter((entry) => entry && entry.winner && typeof entry.winner.id === "string").slice(-25)
        : [],
      season,
      statistics: normalizeStatistics(parsed.statistics, collection, season),
      finances: {
        balanceMillions: Number.isFinite(Number(parsed.finances?.balanceMillions))
          ? Math.max(0, Math.round(Number(parsed.finances.balanceMillions)))
          : STARTING_BALANCE_MILLIONS,
        totalPrizeMoneyMillions: Math.max(
          0,
          Math.round(Number(parsed.finances?.totalPrizeMoneyMillions) || 0),
        ),
        totalSpentMillions: Math.max(
          0,
          Math.round(Number(parsed.finances?.totalSpentMillions) || 0),
        ),
        totalScoutingSpentMillions: Math.max(
          0,
          Math.round(Number(parsed.finances?.totalScoutingSpentMillions) || 0),
        ),
        totalSalesMillions: Math.max(
          0,
          Math.round(Number(parsed.finances?.totalSalesMillions) || 0),
        ),
      },
      transferMarket: {
        ...defaultMarket,
        batchId: typeof parsed.transferMarket?.batchId === "string"
          ? parsed.transferMarket.batchId
          : "",
        theme: typeof parsed.transferMarket?.theme === "string"
          ? parsed.transferMarket.theme
          : "",
        generatedAt: Number(parsed.transferMarket?.generatedAt) || 0,
        freeRevealsUsed: Math.max(0, Math.min(3, Number(parsed.transferMarket?.freeRevealsUsed) || 0)),
        packOpened: parsed.transferMarket?.packOpened === true || marketPlayers.every((player) => player.isRevealed),
        players: marketPlayers,
      },
    };
  } catch (error) {
    console.warn("Could not load Prompt League save.", error);
    return createDefaultSave();
  }
}

export function persistSave(save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch (error) {
    console.error("Could not save Prompt League progress.", error);
    return false;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
