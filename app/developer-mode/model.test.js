import test from "node:test";
import assert from "node:assert/strict";

import { FORMATIONS } from "../js/core.js";
import {
  NPC_DRAFT_STATUS,
  NPC_DRAFT_STORAGE_KEY,
  applyGeneratedPack,
  applyPortraitSearch,
  chooseNextSerpApiSelection,
  chooseSerpApiSelection,
  cycleDraftPlayerPortrait,
  changeDraftFormation,
  createNpcDraft,
  formationOptions,
  loadNpcDrafts,
  moveDraftPlayer,
  parseNpcDraftDocument,
  persistNpcDrafts,
  remapGeneratedPackToFormation,
  serializeNpcDraftDocument,
  updateDraftIdentity,
  updateDraftPlayer,
} from "./model.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); },
  };
}


test("SerpAPI results can fill distinct first and second cache choices", () => {
  let selections = { first: null, second: null };
  selections = chooseNextSerpApiSelection(selections, 2, 20);
  assert.deepEqual(selections, { first: 2, second: null });

  selections = chooseNextSerpApiSelection(selections, 5, 20);
  assert.deepEqual(selections, { first: 2, second: 5 });

  selections = chooseSerpApiSelection(selections, "first", 5, 20);
  assert.deepEqual(selections, { first: 5, second: null });

  selections = chooseSerpApiSelection(selections, "second", 7, 20);
  assert.deepEqual(selections, { first: 5, second: 7 });

  assert.deepEqual(
    chooseSerpApiSelection(selections, "second", 99, 20),
    selections,
  );
});
test("every public formation can create an eleven-player NPC draft", () => {
  assert.equal(formationOptions().length, 7);
  for (const formation of formationOptions()) {
    const draft = createNpcDraft({ id: "draft-" + formation.id, formationId: formation.id });
    assert.equal(draft.players.length, 11);
    assert.equal(new Set(draft.players.map((player) => player.slotId)).size, 11);
    assert.deepEqual(
      draft.players.map((player) => player.position).sort(),
      FORMATIONS[formation.id].slots.map((slot) => slot.position).sort(),
    );
    assert.equal(draft.status, NPC_DRAFT_STATUS);
    assert.equal(draft.playable, false);
  }
});

test("team identity and slot-defined player fields remain editable but bounded", () => {
  let draft = createNpcDraft({ id: "editable-team" });
  draft = updateDraftIdentity(draft, { name: "  Neon   Visitors ", icon: "🛰️" });
  draft = updateDraftIdentity(draft, { iconImageTransform: { scale: 9, x: -140, y: 72 } });
  const playerId = draft.players[0].id;
  const occupiedPosition = draft.players[0].position;
  draft = updateDraftPlayer(draft, playerId, {
    name: "  Goal   Unit ",
    position: "ST",
    overall: 120,
  });

  assert.equal(draft.name, "Neon Visitors");
  assert.equal(draft.icon, "🛰️");
  assert.equal(draft.players.find((player) => player.id === playerId).name, "Goal Unit");
  assert.equal(draft.players.find((player) => player.id === playerId).position, occupiedPosition);
  assert.equal(draft.players.find((player) => player.id === playerId).overall, 99);
  assert.deepEqual(draft.iconImageTransform, { scale: 2.5, x: -100, y: 72 });
});

test("team image URLs and uploaded data URLs survive draft normalization", () => {
  const uploaded = "data:image/png;base64,AAAA";
  let draft = createNpcDraft({ id: "image-team", iconImage: uploaded });
  assert.equal(draft.iconImage, uploaded);
  draft = updateDraftIdentity(draft, { iconImage: "https://images.example/logo.png" });
  assert.equal(draft.iconImage, "https://images.example/logo.png");
  draft = updateDraftIdentity(draft, { iconImage: "javascript:alert(1)" });
  assert.equal(draft.iconImage, "");
});

test("formation changes preserve the eleven and redefine main positions from occupied slots", () => {
  let draft = createNpcDraft({ id: "shape-team" });
  const ids = new Set(draft.players.map((player) => player.id));
  draft = changeDraftFormation(draft, "5-4-1");

  assert.equal(draft.formationId, "5-4-1");
  assert.equal(draft.players.length, 11);
  assert.deepEqual(new Set(draft.players.map((player) => player.id)), ids);
  const playerBySlot = new Map(draft.players.map((player) => [player.slotId, player]));
  assert.ok(FORMATIONS["5-4-1"].slots.every((slot) =>
    playerBySlot.get(slot.id)?.position === slot.position
  ));
  assert.equal(draft.playable, false);
});

test("slot assignment swaps players and makes each occupied slot their main position", () => {
  const draft = createNpcDraft({ id: "swap-team" });
  const first = draft.players[0];
  const second = draft.players[1];
  const firstSlotPosition = FORMATIONS[draft.formationId].slots.find((slot) => slot.id === first.slotId).position;
  const secondSlotPosition = FORMATIONS[draft.formationId].slots.find((slot) => slot.id === second.slotId).position;
  const moved = moveDraftPlayer(draft, first.id, second.slotId);
  const movedFirst = moved.players.find((player) => player.id === first.id);
  const movedSecond = moved.players.find((player) => player.id === second.id);

  assert.equal(movedFirst.slotId, second.slotId);
  assert.equal(movedFirst.position, secondSlotPosition);
  assert.equal(movedSecond.slotId, first.slotId);
  assert.equal(movedSecond.position, firstSlotPosition);
  assert.equal(new Set(moved.players.map((player) => player.id)).size, 11);
});

test("generated queries populate the selected formation with editable ratings", () => {
  const draft = createNpcDraft({ id: "generated-team", formationId: "4-2-3-1" });
  const players = FORMATIONS["4-2-3-1"].slots.map((slot, index) => ({
    id: "generated-" + index,
    name: "Character " + (index + 1),
    position: slot.position,
    priorityRank: index + 1,
  }));
  const generated = applyGeneratedPack(draft, {
    batchId: "batch-one",
    theme: "Orbital legends",
    players: players.reverse(),
  });

  assert.equal(generated.theme, "Orbital legends");
  assert.equal(generated.players.length, 11);
  assert.ok(generated.players.every((player) => player.overall >= 75 && player.overall <= 90));
  assert.deepEqual(
    generated.players.map((player) => player.position).sort(),
    FORMATIONS["4-2-3-1"].slots.map((slot) => slot.position).sort(),
  );
  const playerBySlot = new Map(generated.players.map((player) => [player.slotId, player]));
  assert.ok(
    FORMATIONS["4-2-3-1"].slots.every((slot) =>
      playerBySlot.get(slot.id)?.position === slot.position,
    ),
  );
});

test("draft persistence and export stay in the isolated non-playable schema", () => {
  const storage = memoryStorage();
  const draft = createNpcDraft({ id: "saved-team", name: "Archive XI" });
  persistNpcDrafts([draft], storage);
  assert.ok(storage.getItem(NPC_DRAFT_STORAGE_KEY));
  assert.equal(loadNpcDrafts(storage)[0].name, "Archive XI");

  const document = serializeNpcDraftDocument([draft]);
  const parsed = JSON.parse(document);
  assert.equal(parsed.playable, false);
  assert.equal(parsed.status, NPC_DRAFT_STATUS);
  assert.equal(parseNpcDraftDocument(document)[0].name, "Archive XI");
});


test("licensed portrait results preserve attribution, cycle, and reset after a rename", () => {
  let draft = createNpcDraft({ id: "portrait-team" });
  const playerId = draft.players[0].id;
  const candidates = [
    {
      thumbnail: "https://images.example/one.jpg",
      title: "Portrait one",
      creator: "Photographer One",
      creatorUrl: "https://example.test/creator-one",
      sourceUrl: "https://example.test/source-one",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    },
    {
      thumbnail: "https://images.example/two.jpg",
      title: "Portrait two",
      creator: "Photographer Two",
      sourceUrl: "https://example.test/source-two",
      license: "Public domain",
    },
  ];

  draft = applyPortraitSearch(draft, { [playerId]: candidates }, 123456);
  let player = draft.players.find((entry) => entry.id === playerId);
  assert.equal(player.portrait.candidates.length, 2);
  assert.equal(player.portrait.index, 0);
  assert.equal(player.portrait.useFallback, false);
  assert.equal(player.portrait.candidates[0].creator, "Photographer One");
  assert.equal(player.portrait.searchedAt, 123456);

  draft = cycleDraftPlayerPortrait(draft, playerId);
  player = draft.players.find((entry) => entry.id === playerId);
  assert.equal(player.portrait.index, 1);

  draft = updateDraftPlayer(draft, playerId, { name: "Renamed Character" });
  player = draft.players.find((entry) => entry.id === playerId);
  assert.deepEqual(player.portrait.candidates, []);
  assert.equal(player.portrait.useFallback, true);
});


test("legacy Worker packs are remapped into every new formation without losing players", () => {
  const legacyPack = {
    batchId: "legacy-live-worker",
    theme: "Compatibility XI",
    formationId: "4-3-3",
    players: FORMATIONS["4-3-3"].slots.map((slot, index) => ({
      id: "legacy-player-" + index,
      name: "Legacy Player " + (index + 1),
      position: slot.position,
      priorityRank: index + 1,
    })),
  };

  for (const formationId of ["4-5-1", "4-2-3-1", "3-4-2-1", "5-4-1"]) {
    const remapped = remapGeneratedPackToFormation(legacyPack, formationId);
    assert.equal(remapped.formationId, formationId);
    assert.equal(remapped.players.length, 11);
    assert.deepEqual(
      remapped.players.map((player) => player.position),
      FORMATIONS[formationId].slots.map((slot) => slot.position),
    );
    assert.deepEqual(
      remapped.players.map((player) => player.id),
      legacyPack.players.map((player) => player.id),
    );
  }
});
