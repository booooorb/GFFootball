import test from "node:test";
import assert from "node:assert/strict";

import {
  FORMATIONS,
  SEASON_LENGTH,
  MAX_RESALE_VALUE_MILLIONS,
  MAX_SEASON_OPPONENTS,
  MAX_SEASON_TEAMS,
  MAX_SIGNING_PRICE_MILLIONS,
  MIN_SIGNING_PRICE_MILLIONS,
  RATING_MODEL_VERSION,
  SCOUTING_COST_MILLIONS,
  STARTING_BALANCE_MILLIONS,
  USER_CLUB_ID,
  applyMatchToSave,
  ballonDorAllTime,
  currentBallonDorRace,
  assignPlayerToSlot,
  autoPickLineup,
  chargeScoutingFee,
  compatibilityPenalty,
  createDefaultSave,
  clubNameForSave,
  isLineupComplete,
  normalizeClubProfile,
  leagueStandings,
  marketValueMillions,
  normalizeCardEvents,
  normalizeMarketPackPlayers,
  playerCardTier,
  playerSeasonPerformance,
  playerSeasonStats,
  prepareInitialSquad,
  prepareTransferMarket,
  revealTransferCard,
  previewOpponent,
  previewSeasonOpponent,
  ratingForPriority,
  ratingsForPack,
  reconcilePlayerPrimaryPosition,
  refitLineup,
  resalePlacementMultiplier,
  scoringSegmentsForCards,
  seasonPrizeForPlacement,
  seasonBallonDorRanking,
  seasonClubForm,
  seasonRecentFixtures,
  statisticLeaderboards,
  sellPlayer,
  signingPriceMillions,
  signTransfer,
  simulateMatch,
  syncSeasonOpponents,
  teamPlacementForResale,
} from "../js/core.js";
import { loadSave } from "../js/storage.js";

function makeSave(overall = 82, anonymousUserId = "test-manager-0001") {
  const save = createDefaultSave();
  save.anonymousUserId = anonymousUserId;
  save.formationId = "4-3-3";
  save.collection = FORMATIONS["4-3-3"].slots.map((slot, index) => ({
    id: `player-${index}`,
    name: `Player ${index}`,
    theme: "Test",
    position: slot.position,
    overall,
    priorityRank: index + 1,
    portrait: { candidates: [], index: -1, useFallback: true },
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
  }));
  save.lineup = autoPickLineup(save.collection, save.formationId);
  return save;
}

test("player cards map every rating to a complete material tier", () => {
  assert.equal(playerCardTier(74).id, "silver");
  assert.equal(playerCardTier(75).id, "gold");
  assert.equal(playerCardTier(84).id, "gold");
  assert.equal(playerCardTier(85).id, "shiny-gold");
  assert.equal(playerCardTier(89).id, "shiny-gold");
  assert.equal(playerCardTier(90).id, "chroma");
  assert.equal(playerCardTier(100).label, "Chroma Chromium Gold");
});

test("formation catalog includes all seven playable tactical shapes", () => {
  assert.deepEqual(Object.keys(FORMATIONS), [
    "4-3-3",
    "4-4-2",
    "3-5-2",
    "4-5-1",
    "4-2-3-1",
    "3-4-2-1",
    "5-4-1",
  ]);
  assert.ok(Object.values(FORMATIONS).every((formation) => formation.slots.length === 11));
});

test("club identity is normalized and propagated through manager data", () => {
  const save = makeSave();
  save.clubProfile = normalizeClubProfile({
    name: "  Neon   Rovers  ",
    icon: "bolt",
  });

  assert.deepEqual(save.clubProfile, { name: "Neon Rovers", icon: "bolt" });
  assert.equal(clubNameForSave(save), "Neon Rovers");
  assert.equal(leagueStandings(save).find((club) => club.isUser).name, "Neon Rovers");

  const match = simulateMatch(save);
  assert.equal(match.clubName, "Neon Rovers");

  save.season.matches = [match];
  const leaders = statisticLeaderboards(save, "goals");
  assert.ok(leaders.seasonClub.every((player) => player.club === "Neon Rovers"));
  assert.ok(
    leaders.seasonAllClubs
      .filter((player) => leaders.seasonClub.some((clubPlayer) => clubPlayer.id === player.id))
      .every((player) => player.club === "Neon Rovers"),
  );

  assert.deepEqual(normalizeClubProfile({ name: " ", icon: "invalid" }), {
    name: "Prompt League XI",
    icon: "shield",
  });
});

test("priority ratings are deterministic, bounded, and favor early names", () => {
  const values = Array.from({ length: 11 }, (_, index) =>
    ratingForPriority(index + 1, "batch-one"),
  );

  assert.deepEqual(
    values,
    Array.from({ length: 11 }, (_, index) => ratingForPriority(index + 1, "batch-one")),
  );
  assert.ok(values.every((value) => value >= 75 && value <= 90));
  assert.ok(values[0] > values.at(-1));
  assert.ok(values.slice(0, 3).reduce((sum, value) => sum + value, 0) >
    values.slice(-3).reduce((sum, value) => sum + value, 0));
});

test("pack ratings include a modest standout in every position group", () => {
  const players = [
    ["Lead Striker", "ST"],
    ["Star Keeper", "GK"],
    ["Famous Ten", "CAM"],
    ["Left Star", "LW"],
    ["Right Star", "RW"],
    ["Central One", "CM"],
    ["Central Two", "CM"],
    ["Left Back", "LB"],
    ["Centre Back One", "CB"],
    ["Centre Back Two", "CB"],
    ["Right Back", "RB"],
  ].map(([name, position], index) => ({
    name,
    position,
    priorityRank: index + 1,
  }));

  const ratings = ratingsForPack(players, "position-spread-pack");
  const maxima = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  const categoryFor = (position) => {
    if (position === "GK") return "GK";
    if (["LB", "CB", "RB", "LWB", "RWB"].includes(position)) return "DEF";
    if (["LM", "CM", "CAM", "RM"].includes(position)) return "MID";
    return "FWD";
  };

  players.forEach((player, index) => {
    const category = categoryFor(player.position);
    maxima[category] = Math.max(maxima[category], ratings[index]);
  });

  assert.deepEqual(ratings, ratingsForPack(players, "position-spread-pack"));
  assert.ok(ratings.every((rating) => rating >= 75 && rating <= 90));
  assert.ok(maxima.GK >= 81);
  assert.ok(maxima.DEF >= 83);
  assert.ok(maxima.MID >= 82);
  assert.ok(maxima.FWD >= 82);
});

test("an eleven-player market keeps authentic roles and lets the manager reveal three free transfers", () => {
  const pack = {
    batchId: "market-pack-one",
    theme: "Test market",
    players: Array.from({ length: 11 }, (_, index) => ({
      id: `market-${index}`,
      name: `Market Player ${index}`,
      position: index < 6 ? "ST" : "RW",
      priorityRank: index + 1,
    })),
  };

  let market = prepareTransferMarket(pack);
  assert.equal(market.players.length, 11);
  assert.equal(market.players.filter((player) => player.position === "ST").length, 6);
  assert.equal(market.players.filter((player) => player.isFreeTransfer).length, 0);
  assert.ok(market.players.every((player) => player.isRevealed === false));

  market = revealTransferCard(market, "market-0");
  market = revealTransferCard(market, "market-4");
  assert.equal(market.freeRevealsUsed, 2);
  assert.equal(market.players.filter((player) => player.isRevealed).length, 2);

  market = revealTransferCard(market, "market-10");
  assert.equal(market.freeRevealsUsed, 3);
  assert.equal(market.packOpened, true);
  assert.equal(market.players.filter((player) => player.isFreeTransfer).length, 3);
  assert.equal(market.players.filter((player) => !player.isFreeTransfer).length, 8);
  assert.ok(market.players.every((player) => player.isRevealed));
  assert.ok(market.players.filter((player) => player.isFreeTransfer).every(
    (player) => player.askingPriceMillions === 0,
  ));
  assert.ok(market.players.filter((player) => !player.isFreeTransfer).every(
    (player) => player.askingPriceMillions >= MIN_SIGNING_PRICE_MILLIONS && player.askingPriceMillions <= MAX_SIGNING_PRICE_MILLIONS,
  ));
});
test("the first eleven are prepared as a complete free starting squad", () => {
  const formationId = "4-3-3";
  const pack = {
    batchId: "initial-squad",
    theme: "Founding theme",
    formationId,
    players: FORMATIONS[formationId].slots.map((slot, index) => ({
      id: `founder-${index}`,
      name: `Founder ${index}`,
      position: slot.position,
      priorityRank: index + 1,
    })),
  };
  const players = prepareInitialSquad(pack, 1);
  const lineup = autoPickLineup(players, formationId);

  assert.equal(players.length, 11);
  assert.equal(isLineupComplete(players, lineup, formationId), true);
  assert.ok(players.every((player) =>
    player.acquisition.feeMillions === 0 &&
    player.acquisition.type === "initial_squad",
  ));
  assert.throws(
    () => prepareInitialSquad({ ...pack, players: pack.players.slice(0, 10) }, 1),
    /must contain 11/i,
  );
});

test("market normalization preserves both 10- and 11-player packs and their generated roles", () => {
  const players = Array.from({ length: 11 }, (_, index) => ({
    id: `role-${index}`,
    name: `Role Player ${index}`,
    position: index < 8 ? "CAM" : "ST",
  }));
  const normalized = normalizeMarketPackPlayers(players);

  assert.equal(normalized.length, 11);
  assert.equal(normalized.filter((player) => player.position === "CAM").length, 8);
  assert.deepEqual(normalized, players);
  assert.deepEqual(normalizeMarketPackPlayers(players.slice(0, 10)), players.slice(0, 10));
});
test("signings span €20m–€220m while resale is capped and performance-led", () => {
  const low = { id: "low", overall: 75, position: "ST", stats: {} };
  const high = { id: "high", overall: 90, position: "ST", stats: {} };
  const proven = {
    id: "proven",
    overall: 90,
    position: "ST",
    stats: { appearances: 24, goals: 16, assists: 7 },
  };
  const season = {
    matches: [{
      ratings: [{ playerId: "low", goals: 4, assists: 3, saves: 0, tackles: 0 }],
    }],
  };

  assert.equal(signingPriceMillions(low), MIN_SIGNING_PRICE_MILLIONS);
  assert.equal(signingPriceMillions(high), MAX_SIGNING_PRICE_MILLIONS);
  assert.equal(marketValueMillions(low, { matches: [], finalPosition: 1 }), 1);
  assert.equal(marketValueMillions(high, { matches: [], finalPosition: 1 }), 10);
  assert.equal(marketValueMillions({ id: "ceiling", overall: 99 }, {
    finalPosition: 1,
    matches: [{ ratings: [{ playerId: "ceiling", goals: 10, assists: 10 }] }],
  }), MAX_RESALE_VALUE_MILLIONS);
  assert.ok(
    marketValueMillions(high, { matches: [], finalPosition: 1 }) >
      marketValueMillions(low, { matches: [], finalPosition: 1 }),
  );
  assert.ok(
    marketValueMillions(low, { ...season, finalPosition: 1 }) >
      marketValueMillions(low, { matches: [], finalPosition: 1 }) * 10,
  );
  assert.ok(
    marketValueMillions(proven, { matches: [], finalPosition: 1 }) >= 180,
  );
});

test("league position heavily suppresses resale values", () => {
  const proven = {
    id: "league-value",
    overall: 90,
    position: "ST",
    stats: { appearances: 24, goals: 16, assists: 7 },
  };
  const firstPlaceValue = marketValueMillions(
    proven,
    { matches: [], finalPosition: 1 },
  );
  const lastPlaceValue = marketValueMillions(
    proven,
    { matches: [], finalPosition: 8 },
  );

  assert.equal(resalePlacementMultiplier(1), 1);
  assert.equal(resalePlacementMultiplier(8), 0.08);
  assert.equal(teamPlacementForResale(createDefaultSave()), 8);
  const completedSave = createDefaultSave();
  completedSave.season.complete = true;
  completedSave.season.finalPosition = 2;
  assert.equal(teamPlacementForResale(completedSave), 2);
  assert.ok(firstPlaceValue > lastPlaceValue * 10);
  assert.ok(lastPlaceValue < 20);
});

test("scouting charges €20m only when the club can afford the report", () => {
  const save = createDefaultSave();
  const charged = chargeScoutingFee(save);

  assert.equal(charged.ok, true);
  assert.equal(charged.costMillions, SCOUTING_COST_MILLIONS);
  assert.equal(
    charged.save.finances.balanceMillions,
    STARTING_BALANCE_MILLIONS - SCOUTING_COST_MILLIONS,
  );
  assert.equal(
    charged.save.finances.totalScoutingSpentMillions,
    SCOUTING_COST_MILLIONS,
  );
  assert.equal(save.finances.balanceMillions, STARTING_BALANCE_MILLIONS);

  save.finances.balanceMillions = SCOUTING_COST_MILLIONS - 1;
  const rejected = chargeScoutingFee(save);
  assert.equal(rejected.ok, false);
  assert.equal(rejected.save, save);
});

test("signing and selling players updates the club balance", () => {
  const save = createDefaultSave();
  const pack = {
    batchId: "transfer-actions",
    theme: "Test market",
    players: ["GK", "LB", "CB", "RB", "CM", "CDM", "CAM", "LW", "ST", "RW", "ST"]
      .map((position, index) => ({
        id: `transfer-${index}`,
        name: `Transfer Player ${index}`,
        position,
        priorityRank: index + 1,
      })),
  };
  save.transferMarket = prepareTransferMarket(pack);
  assert.equal(signTransfer(save, "transfer-3").ok, false);
  save.transferMarket = revealTransferCard(save.transferMarket, "transfer-0");
  save.transferMarket = revealTransferCard(save.transferMarket, "transfer-1");
  save.transferMarket = revealTransferCard(save.transferMarket, "transfer-2");
  save.finances.balanceMillions = 500;
  const startingBalance = save.finances.balanceMillions;
  const free = save.transferMarket.players.find((player) => player.isFreeTransfer);
  const paid = save.transferMarket.players.find((player) => !player.isFreeTransfer);

  const freeResult = signTransfer(save, free.id);
  assert.equal(freeResult.ok, true);
  assert.deepEqual(freeResult.save.lineup, {});
  assert.equal(freeResult.costMillions, 0);
  assert.equal(
    freeResult.save.finances.balanceMillions,
    startingBalance,
  );

  const paidResult = signTransfer(freeResult.save, paid.id);
  assert.equal(paidResult.ok, true);
  assert.equal(
    paidResult.save.finances.balanceMillions,
    startingBalance - paidResult.costMillions,
  );

  const saleSlot = FORMATIONS[paidResult.save.formationId].slots[0].id;
  paidResult.save.lineup[saleSlot] = paid.id;
  const saleResult = sellPlayer(paidResult.save, paid.id);
  assert.equal(saleResult.ok, true);
  assert.equal(saleResult.save.lineup[saleSlot], undefined);
  assert.equal(
    saleResult.save.finances.balanceMillions,
    startingBalance - paidResult.costMillions + saleResult.valueMillions,
  );
  assert.equal(
    saleResult.save.collection.some((player) => player.id === paid.id),
    false,
  );
});

test("league placement prizes are deliberately lean", () => {
  assert.equal(seasonPrizeForPlacement(1), 45);
  assert.equal(seasonPrizeForPlacement(4), 16);
  assert.equal(seasonPrizeForPlacement(8), 2);
});

test("position compatibility follows directional role families with graded penalties", () => {
  assert.equal(compatibilityPenalty("LB", "LB"), 0);
  assert.equal(compatibilityPenalty("LB", "LWB"), 1);
  assert.equal(compatibilityPenalty("CM", "CAM"), 2);
  assert.equal(compatibilityPenalty("CB", "LB"), 2);
  assert.equal(compatibilityPenalty("ST", "LW"), 2);
  assert.equal(compatibilityPenalty("CB", "CDM"), 5);
  assert.equal(compatibilityPenalty("CAM", "CDM"), 5);
  assert.equal(compatibilityPenalty("LB", "LW"), 5);
  assert.equal(compatibilityPenalty("CDM", "CB"), Number.POSITIVE_INFINITY);
  assert.equal(compatibilityPenalty("GK", "ST"), Number.POSITIVE_INFINITY);
});

test("pitch swaps are transactional and never silently remove a starter", () => {
  const save = makeSave();
  const formation = FORMATIONS[save.formationId];
  const cmSlot = formation.slots.find((slot) => slot.position === "CM");
  const camSlot = formation.slots.find((slot) => slot.position === "CAM");
  const cmPlayer = save.collection.find((player) => player.id === save.lineup[cmSlot.id]);
  const camPlayerId = save.lineup[camSlot.id];
  const swapped = assignPlayerToSlot(
    save.lineup,
    save.formationId,
    cmPlayer,
    camSlot.id,
    save.collection,
  );
  assert.equal(swapped.changed, true);
  assert.equal(swapped.lineup[camSlot.id], cmPlayer.id);
  assert.equal(swapped.lineup[cmSlot.id], camPlayerId);
  assert.equal(Object.keys(swapped.lineup).length, 11);

  const cbSlot = formation.slots.find((slot) => slot.position === "CB");
  const cdmSlot = formation.slots.find((slot) => slot.position === "CDM");
  const cbPlayer = save.collection.find((player) => player.id === save.lineup[cbSlot.id]);
  const rejected = assignPlayerToSlot(
    save.lineup,
    save.formationId,
    cbPlayer,
    cdmSlot.id,
    save.collection,
  );
  assert.equal(rejected.changed, false);
  assert.equal(rejected.reason, "swap-incompatible");
  assert.deepEqual(rejected.lineup, save.lineup);
});

test("formation changes refit the current XI without choosing bench players", () => {
  const save = makeSave();
  const startingIds = new Set(Object.values(save.lineup));
  const fitted442 = refitLineup(
    save.lineup,
    "4-3-3",
    "4-4-2",
    save.collection,
  );
  assert.equal(Object.keys(fitted442).length, 11);
  assert.deepEqual(new Set(Object.values(fitted442)), startingIds);
  assert.equal(isLineupComplete(save.collection, fitted442, "4-4-2"), true);

  const onePlayerShort = { ...save.lineup };
  delete onePlayerShort[Object.keys(onePlayerShort)[0]];
  const fittedShort = refitLineup(
    onePlayerShort,
    "4-3-3",
    "4-4-2",
    save.collection,
  );
  assert.equal(Object.keys(fittedShort).length, 10);

  for (const fromFormation of Object.values(FORMATIONS)) {
    const formationPlayers = fromFormation.slots.map((slot, index) => ({
      id: `${fromFormation.id}-refit-${index}`,
      name: `Refit Player ${index}`,
      position: slot.position,
      overall: 82,
    }));
    const fromLineup = autoPickLineup(formationPlayers, fromFormation.id);
    for (const toFormation of Object.values(FORMATIONS)) {
      const fitted = refitLineup(
        fromLineup,
        fromFormation.id,
        toFormation.id,
        formationPlayers,
      );
      assert.equal(Object.keys(fitted).length, 11);
      assert.equal(isLineupComplete(formationPlayers, fitted, toFormation.id), true);
    }
  }
});

test("a stronger current off-position becomes the player's primary role", () => {
  const player = {
    id: "developing-midfielder",
    name: "Developing Midfielder",
    position: "CM",
    overall: 80,
    positionRatings: { CM: 80, CAM: 83, CDM: 75, LM: 78, RM: 78 },
  };
  const promoted = reconcilePlayerPrimaryPosition(player, "CAM");
  assert.equal(promoted.position, "CAM");
  assert.equal(promoted.overall, 83);
  assert.equal(promoted.positionRatings.CAM, 83);

  const unchanged = reconcilePlayerPrimaryPosition(player, "CDM");
  assert.equal(unchanged.position, "CM");
  assert.equal(unchanged.overall, 80);
});

test("auto-pick produces a complete exact-position lineup for every formation pack", () => {
  for (const formation of Object.values(FORMATIONS)) {
    const collection = formation.slots.map((slot, index) => ({
      id: `${formation.id}-${index}`,
      name: `${formation.id} Player ${index}`,
      position: slot.position,
      overall: 80 + (index % 5),
    }));
    const lineup = autoPickLineup(collection, formation.id);
    assert.equal(isLineupComplete(collection, lineup, formation.id), true);
    assert.equal(new Set(Object.values(lineup)).size, 11);
  }
});

test("loading a save keeps newly compatible roles without auto-picking replacements", () => {
  const originalLocalStorage = globalThis.localStorage;
  const save = makeSave();
  save.clubProfile = { name: "  Neon   Rovers  ", icon: "bolt" };
  const cdmSlot = FORMATIONS["4-3-3"].slots.find((slot) => slot.position === "CDM");
  const camSlot = FORMATIONS["4-3-3"].slots.find((slot) => slot.position === "CAM");
  const cdmPlayerId = save.lineup[cdmSlot.id];
  const camPlayerId = save.lineup[camSlot.id];
  save.lineup[cdmSlot.id] = camPlayerId;
  save.lineup[camSlot.id] = cdmPlayerId;
  save.collection.forEach((player) => {
    player.ratingModelVersion = RATING_MODEL_VERSION;
    delete player.stats.saves;
    delete player.stats.tackles;
  });
  save.transferMarket = {
    batchId: "legacy-market",
    theme: "Legacy market",
    generatedAt: 1,
    players: [{
      ...save.collection[0],
      id: "legacy-market-player",
      isFreeTransfer: false,
      askingPriceMillions: 50,
    }],
  };
  delete save.finances.totalScoutingSpentMillions;
  save.season.opponents = [
    {
      id: "published-npc-neon-eleven",
      name: "Neon Eleven",
      formationId: "5-4-1",
      isPublished: true,
      roster: [{ id: "npc-one", name: "NPC One", position: "GK", overall: 88 }],
    },
  ];

  try {
    globalThis.localStorage = {
      getItem: () => JSON.stringify(save),
      setItem: () => {},
      removeItem: () => {},
    };
    const loaded = loadSave();
    assert.equal(loaded.lineup[cdmSlot.id], camPlayerId);
    assert.equal(loaded.lineup[camSlot.id], cdmPlayerId);
    assert.equal(Object.keys(loaded.lineup).length, 11);
    assert.equal(typeof loaded.collection[0].positionRatings, "object");
    assert.equal(loaded.collection[0].stats.saves, 0);
    assert.equal(loaded.collection[0].stats.tackles, 0);
    assert.equal(loaded.finances.totalScoutingSpentMillions, 0);
    assert.deepEqual(loaded.clubProfile, { name: "Neon Rovers", icon: "bolt" });
    assert.equal(loaded.season.opponents.length, 1);
    assert.equal(loaded.season.opponents[0].id, "published-npc-neon-eleven");
    assert.equal(loaded.season.opponents[0].formationId, "5-4-1");
    assert.equal(loaded.season.opponents[0].roster[0].name, "NPC One");
    assert.ok(
      loaded.transferMarket.players[0].askingPriceMillions >=
        MIN_SIGNING_PRICE_MILLIONS,
    );
  } finally {
    if (originalLocalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = originalLocalStorage;
  }
});

test("match simulation is deterministic and produces internally consistent events", () => {
  const save = makeSave();
  const first = simulateMatch(save);
  const second = simulateMatch(save);

  assert.deepEqual(first, second);
  assert.equal(first.events.filter((event) => event.type === "goal" && event.side === "user").length, first.userGoals);
  assert.equal(first.events.filter((event) => event.type === "goal" && event.side === "opponent").length, first.opponentGoals);
  assert.equal(first.ratings.length, 11);
  assert.equal(first.leagueResults.length, 4);
  assert.ok(first.ratings.every((performance) =>
    performance.rating >= 4 && performance.rating <= 10,
  ));
  assert.equal(first.formationId, save.formationId);
  assert.equal(new Set(first.ratings.map((performance) => performance.slotId)).size, 11);
  assert.equal(first.stats.user.possession + first.stats.opponent.possession, 100);
  assert.ok(first.stats.user.shots >= first.stats.user.shotsOnTarget);
  assert.ok(first.stats.opponent.shots >= first.stats.opponent.shotsOnTarget);
  assert.ok(first.stats.user.shotsOnTarget >= first.userGoals);
  assert.ok(first.stats.opponent.shotsOnTarget >= first.opponentGoals);
  assert.equal(
    first.stats.user.yellowCards,
    first.events.filter((event) => event.side === "user" && event.type === "yellow").length,
  );
  assert.equal(
    first.stats.opponent.redCards,
    first.events.filter((event) => event.side === "opponent" && event.type === "red").length,
  );
  assert.ok(first.stats.user.fouls >=
    first.stats.user.yellowCards + first.stats.user.redCards);
  assert.equal(first.stats.user.saves, first.stats.opponent.shotsOnTarget - first.opponentGoals);
  assert.ok(first.ratings.every((performance) =>
    Number.isInteger(performance.saves) &&
    performance.saves >= 0 &&
    Number.isInteger(performance.tackles) &&
    performance.tackles >= 0,
  ));
  assert.equal(
    first.ratings.find((performance) => performance.position === "GK").saves,
    first.stats.user.saves,
  );
  assert.equal(
    first.leagueResults.some((result) =>
      result.homeId === USER_CLUB_ID || result.awayId === USER_CLUB_ID,
    ),
    true,
  );

  for (const goal of first.events.filter((event) => event.type === "goal")) {
    assert.notEqual(goal.playerId, goal.assisterId);
    const earlierRed = first.events.find((event) =>
      event.type === "red" &&
      event.side === goal.side &&
      event.playerId === goal.playerId &&
      event.minute < goal.minute,
    );
    assert.equal(earlierRed, undefined);
  }
});

test("strong squads outperform weak squads across seeded seasons without removing upsets", () => {
  let strongPoints = 0;
  let weakPoints = 0;
  let strongLosses = 0;
  let totalGoals = 0;
  const samples = 250;

  for (let index = 0; index < samples; index += 1) {
    const seed = `monte-carlo-${index}`;
    const strong = simulateMatch(makeSave(90, seed));
    const weak = simulateMatch(makeSave(75, seed));
    strongPoints += strong.points;
    weakPoints += weak.points;
    strongLosses += Number(strong.points === 0);
    totalGoals += strong.userGoals + strong.opponentGoals;
  }

  assert.ok(strongPoints > weakPoints * 1.35);
  assert.ok(strongLosses > 0);
  const averageGoals = totalGoals / samples;
  assert.ok(averageGoals > 1.2 && averageGoals < 6);
});

test("a season completes after ten applied matches and updates career totals", () => {
  let save = makeSave(84, "season-completion");
  const startingBalance = save.finances.balanceMillions;
  for (let week = 0; week < SEASON_LENGTH; week += 1) {
    const match = simulateMatch(save);
    save = applyMatchToSave(save, match);
  }

  assert.equal(save.season.week, SEASON_LENGTH);
  assert.equal(save.season.complete, true);
  assert.equal(save.season.matches.length, SEASON_LENGTH);
  assert.equal(save.collection.reduce((sum, player) => sum + player.stats.appearances, 0), SEASON_LENGTH * 11);
  assert.equal(
    save.collection.reduce((sum, player) => sum + player.stats.saves, 0),
    save.season.matches.reduce(
      (sum, match) => sum + match.ratings.reduce(
        (matchSum, performance) => matchSum + performance.saves,
        0,
      ),
      0,
    ),
  );
  assert.ok(save.collection.reduce((sum, player) => sum + player.stats.tackles, 0) > 0);
  const table = leagueStandings(save);
  const userRow = table.find((club) => club.isUser);
  assert.equal(table.length, 8);
  assert.equal(userRow.played, SEASON_LENGTH);
  assert.equal(userRow.points, save.season.points);
  assert.equal(userRow.goalsFor, save.season.goalsFor);
  assert.equal(save.season.finalPosition, userRow.position);
  assert.equal(save.season.prizeAwarded, true);
  assert.equal(
    save.season.prizeMillions,
    seasonPrizeForPlacement(userRow.position),
  );
  assert.equal(
    save.finances.balanceMillions,
    startingBalance + save.season.prizeMillions,
  );
  assert.deepEqual(
    table.map((club) => club.position),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
  assert.throws(() => simulateMatch(save), /already complete/i);
});

test("season completion records a top-three Ballon d’Or archive", () => {
  let save = makeSave(84, "ballon-dor-test");
  for (let week = 0; week < SEASON_LENGTH; week += 1) save = applyMatchToSave(save, simulateMatch(save));
  assert.equal(save.season.complete, true);
  assert.equal(save.season.ballonDor.finalists.length, 3);
  assert.equal(save.season.ballonDor.winner.rank, 1);
  assert.equal(save.seasonHistory.length, 1);
  assert.equal(ballonDorAllTime(save)[0].wins, 1);
  assert.ok(currentBallonDorRace(save).every((player) => player.percentage >= 0));
});

test("Ballon d’Or scoring uses league-wide goals plus assists only", () => {
  const save = makeSave(84, "award-weighting");
  const [rated, scorer] = save.collection;
  save.season.matches = [{
    ratings: [{ playerId: rated.id, playerName: rated.name, rating: 9.2, goals: 0, assists: 0 }, { playerId: scorer.id, playerName: scorer.name, rating: 7.2, goals: 3, assists: 2 }],
    opponentRatings: [], opponentRoster: [],
    leagueResults: [{ homeId: "npc-test", homeName: "NPC Test", homeGoals: 5, homeContributions: [
      { scorerId: "npc-star", scorerName: "NPC Star", assisterId: "npc-maker", assisterName: "NPC Maker" },
      { scorerId: "npc-star", scorerName: "NPC Star", assisterId: "npc-maker", assisterName: "NPC Maker" },
      { scorerId: "npc-star", scorerName: "NPC Star", assisterId: null, assisterName: null },
      { scorerId: "npc-sidekick", scorerName: "NPC Sidekick", assisterId: "npc-star", assisterName: "NPC Star" },
      { scorerId: "npc-sidekick", scorerName: "NPC Sidekick", assisterId: "npc-star", assisterName: "NPC Star" },
    ], awayId: "npc-other", awayName: "NPC Other", awayGoals: 0, awayContributions: [] }],
  }];
  const ranking = seasonBallonDorRanking(save);
  const npcStar = ranking.find((player) => player.id === "npc-star");
  const clubScorer = ranking.find((player) => player.id === scorer.id);
  assert.equal(ranking[0].id, "npc-star");
  assert.equal(npcStar.goalContributions, 5);
  assert.equal(clubScorer.goalContributions, 5);
  assert.ok(npcStar.standingBonus > clubScorer.standingBonus);
  assert.ok(npcStar.score > clubScorer.score);
  const race = currentBallonDorRace(save);
  assert.equal(race.reduce((sum, player) => sum + player.percentage, 0), 100);
});

test("season recent fixtures and five-match form are derived from completed results", () => {
  const save = makeSave(82, "form-window-manager");
  const match = simulateMatch(save);
  const next = applyMatchToSave(save, match);
  const fixtures = seasonRecentFixtures(next, 12);
  const form = seasonClubForm(next, USER_CLUB_ID, 5);

  assert.equal(fixtures.length, 4);
  assert.equal(form.length, 1);
  assert.ok(["W", "D", "L"].includes(form[0].result));
  assert.equal(fixtures[0].week, 1);
});

test("player season goals and assists are derived from the current season only", () => {
  const season = {
    matches: [
      {
        ratings: [
          { playerId: "player-1", goals: 2, assists: 1, saves: 0, tackles: 3 },
          { playerId: "player-2", goals: 0, assists: 1 },
        ],
      },
      {
        ratings: [
          { playerId: "player-1", goals: 1, assists: 2, saves: 4, tackles: 1 },
        ],
      },
    ],
  };

  assert.deepEqual(
    playerSeasonStats(season, "player-1"),
    { goals: 3, assists: 3 },
  );
  assert.deepEqual(
    playerSeasonStats({ matches: [] }, "player-1"),
    { goals: 0, assists: 0 },
  );
  assert.deepEqual(
    playerSeasonPerformance(season, "player-1"),
    { appearances: 2, goals: 3, assists: 3, saves: 4, tackles: 4 },
  );
});

test("a second yellow creates a dismissal in the same match", () => {
  const events = normalizeCardEvents([
    { minute: 12, type: "yellow", side: "user", playerId: "captain", playerName: "Club Captain" },
    { minute: 58, type: "yellow", side: "user", playerId: "captain", playerName: "Club Captain" },
    { minute: 74, type: "yellow", side: "user", playerId: "captain", playerName: "Club Captain" },
  ]);

  assert.deepEqual(events.map((event) => event.type), ["yellow", "yellow", "red"]);
  assert.equal(events.at(-1).minute, 58);
  assert.equal(events.at(-1).dismissal, "second-yellow");
});

test("red-card scoring reduction starts at the dismissal and stays match-local", () => {
  const beforeAndAfter = scoringSegmentsForCards(1.8, [
    { minute: 30, type: "red", side: "user", playerId: "captain" },
  ], "user");

  assert.equal(beforeAndAfter.length, 2);
  assert.deepEqual(
    beforeAndAfter.map(({ startMinute, endMinute, multiplier }) => ({
      startMinute,
      endMinute,
      multiplier,
    })),
    [
      { startMinute: 0, endMinute: 30, multiplier: 1 },
      { startMinute: 30, endMinute: 90, multiplier: 0.62 },
    ],
  );
  assert.equal(beforeAndAfter[0].expectedGoals, 0.6);
  assert.ok(Math.abs(beforeAndAfter[1].expectedGoals - 0.744) < 1e-9);

  const unaffectedOpponent = scoringSegmentsForCards(1.8, [
    { minute: 30, type: "red", side: "user", playerId: "captain" },
  ], "opponent");
  const nextMatch = scoringSegmentsForCards(1.8, [], "user");
  assert.equal(unaffectedOpponent.length, 1);
  assert.equal(unaffectedOpponent[0].expectedGoals, 1.8);
  assert.equal(nextMatch.length, 1);
  assert.equal(nextMatch[0].multiplier, 1);
  assert.equal(nextMatch[0].expectedGoals, 1.8);
});

test("stats leaderboards separate season, all-time, club, and all-club records", () => {
  let save = makeSave(84, "leaderboard-archive");
  const ratings = save.collection.map((player, index) => ({
    playerId: player.id,
    playerName: player.name,
    position: player.position,
    rating: 7,
    goals: index === 0 ? 2 : 0,
    assists: index === 1 ? 2 : 0,
    saves: 0,
    tackles: 0,
    yellows: 0,
    reds: 0,
  }));
  const match = {
    id: "season-1-week-1",
    week: 1,
    formationId: save.formationId,
    opponent: "Copper Rovers",
    opponentId: "copper-rovers",
    userGoals: 2,
    opponentGoals: 1,
    points: 3,
    ratings,
    events: [
      {
        minute: 25,
        type: "goal",
        side: "opponent",
        playerId: "rival-9",
        playerName: "Alex Alder",
        assisterId: "rival-8",
        assisterName: "Ben Bell",
      },
    ],
    leagueResults: [
      {
        homeId: USER_CLUB_ID,
        homeName: "Prompt League XI",
        homeGoals: 2,
        awayId: "copper-rovers",
        awayName: "Copper Rovers",
        awayGoals: 1,
      },
      {
        homeId: "moss-athletic",
        homeName: "Moss Athletic",
        homeGoals: 3,
        homeContributions: Array.from({ length: 3 }, () => ({
          scorerId: "rival-9",
          scorerName: "Cami Costa",
          assisterId: "rival-10",
          assisterName: "Dani Doyle",
        })),
        awayId: "paper-town",
        awayName: "Paper Town FC",
        awayGoals: 0,
        awayContributions: [],
      },
    ],
  };

  save = applyMatchToSave(save, match);
  const goalBoards = statisticLeaderboards(save, "goals");
  const assistBoards = statisticLeaderboards(save, "assists");
  assert.equal(goalBoards.seasonClub[0].name, "Player 0");
  assert.equal(goalBoards.seasonClub[0].goals, 2);
  assert.equal(goalBoards.seasonAllClubs[0].name, "Cami Costa");
  assert.equal(goalBoards.seasonAllClubs[0].club, "Moss Athletic");
  assert.equal(goalBoards.seasonAllClubs[0].goals, 3);
  assert.equal(assistBoards.seasonClub[0].name, "Player 1");
  assert.equal(assistBoards.seasonClub[0].assists, 2);
  assert.equal(assistBoards.seasonAllClubs[0].name, "Dani Doyle");
  assert.equal(assistBoards.seasonAllClubs[0].assists, 3);

  save.season = {
    ...save.season,
    number: 2,
    week: 0,
    matches: [],
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    complete: false,
  };
  const nextSeasonBoards = statisticLeaderboards(save, "goals");
  assert.equal(nextSeasonBoards.seasonClub.length, 0);
  assert.equal(nextSeasonBoards.allTimeClub[0].name, "Player 0");
  assert.equal(nextSeasonBoards.allTimeAllClubs[0].name, "Cami Costa");
});


test("published NPC opponents are scheduled with their actual formation, roster, and ratings", () => {
  const save = makeSave(82, "published-opponent-manager");
  const formation = FORMATIONS["5-4-1"];
  const published = {
    id: "published-npc:citadel-draft",
    sourceDraftId: "citadel-draft",
    name: "Citadel XI",
    icon: "♜",
    theme: "Fortress characters",
    formationId: formation.id,
    isPublished: true,
    players: formation.slots.map((slot, index) => ({
      id: `citadel-player-${index}`,
      name: `Citadel Player ${index + 1}`,
      theme: "Fortress characters",
      position: slot.position,
      slotId: slot.id,
      overall: 84 + (index % 3),
      portrait: { candidates: [], index: -1, useFallback: true, searchedAt: 0 },
    })),
  };

  const scheduled = syncSeasonOpponents(save, [published]);
  assert.equal(scheduled.season.opponents.length, 7);
  assert.equal(scheduled.season.opponents[0].name, "Citadel XI");
  const opponent = previewOpponent(scheduled, 1);
  const scoutedOpponent = previewSeasonOpponent(scheduled, scheduled.season.opponents[0].id);
  assert.equal(scoutedOpponent.name, "Citadel XI");
  assert.equal(scoutedOpponent.roster.length, 11);
  assert.equal(opponent.name, "Citadel XI");
  assert.equal(opponent.formationId, "5-4-1");
  assert.equal(opponent.roster.length, 11);
  assert.deepEqual(
    opponent.roster.map((player) => player.name),
    published.players.map((player) => player.name),
  );

  const match = simulateMatch(scheduled);
  assert.equal(match.opponent, "Citadel XI");
  assert.equal(match.opponentFormationId, "5-4-1");
  assert.equal(match.opponentRoster.length, 11);
  assert.equal(match.opponentRatings.length, 11);
  assert.ok(match.opponentRatings.every((rating) => rating.rating >= 4 && rating.rating <= 10));
  assert.ok(match.opponentUnits.attack > 0);
  assert.ok(match.opponentUnits.defence > 0);
});

test("season snapshots and fixtures expand safely to a 32-team league", () => {
  const save = makeSave(82, "expanded-league-manager");
  const formation = FORMATIONS["4-3-3"];
  const published = Array.from({ length: 35 }, (_, teamIndex) => ({
    id: `published-npc:club-${teamIndex}`,
    name: `Published Club ${teamIndex + 1}`,
    formationId: formation.id,
    players: formation.slots.map((slot, playerIndex) => ({
      id: `published-${teamIndex}-player-${playerIndex}`,
      name: `Club ${teamIndex + 1} Player ${playerIndex + 1}`,
      position: slot.position,
      slotId: slot.id,
      overall: 78 + (playerIndex % 6),
    })),
  }));

  const scheduled = syncSeasonOpponents(save, published);
  assert.equal(scheduled.season.opponents.length, MAX_SEASON_OPPONENTS);
  assert.equal(new Set(scheduled.season.opponents.map((club) => club.id)).size, MAX_SEASON_OPPONENTS);
  assert.equal(leagueStandings(scheduled).length, MAX_SEASON_TEAMS);

  const match = simulateMatch(scheduled);
  assert.equal(match.leagueResults.length, MAX_SEASON_TEAMS / 2);
  const participants = match.leagueResults.flatMap((result) => [result.homeId, result.awayId]);
  assert.equal(participants.length, MAX_SEASON_TEAMS);
  assert.equal(new Set(participants).size, MAX_SEASON_TEAMS);
});

test("published opponent changes cannot rewrite a season already underway", () => {
  let save = makeSave(82, "stable-season-manager");
  const firstFormation = FORMATIONS["4-5-1"];
  const first = {
    id: "published-npc:first",
    name: "First Published XI",
    formationId: firstFormation.id,
    players: firstFormation.slots.map((slot, index) => ({
      id: `first-${index}`,
      name: `First ${index}`,
      position: slot.position,
      slotId: slot.id,
      overall: 80,
    })),
  };
  save = syncSeasonOpponents(save, [first]);
  const originalIds = save.season.opponents.map((club) => club.id);
  save = applyMatchToSave(save, simulateMatch(save));

  const presentationUpdate = { ...first, iconImage: "https://example.com/first-crest.png", iconImageTransform: { scale: 1.8, x: -32, y: 14 } };
  const resynced = syncSeasonOpponents(save, [presentationUpdate]);
  assert.deepEqual(resynced.season.opponents.map((club) => club.id), originalIds);
  assert.equal(resynced.season.opponents.find((club) => club.id === first.id).icon, "https://example.com/first-crest.png");
  assert.deepEqual(resynced.season.opponents.find((club) => club.id === first.id).iconImageTransform, { scale: 1.8, x: -32, y: 14 });
});
