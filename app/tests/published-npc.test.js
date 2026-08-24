import test from "node:test";
import assert from "node:assert/strict";

import {
  PUBLISHED_NPC_STATUS,
  PUBLISHED_NPC_STORAGE_KEY,
  loadPublishedNpcOpponents,
  mergePublishedNpcOpponents,
  publishNpcOpponent,
  publishedNpcOpponentForDraft,
  unpublishNpcOpponent,
} from "../js/published-npc.js";

let developerModel = null;
try {
  developerModel = await import("../developer-mode/model.js");
} catch (error) {
  if (error?.code !== "ERR_MODULE_NOT_FOUND") throw error;
}

const developerTest = developerModel ? test : test.skip;
const { createNpcDraft, updateDraftIdentity, updateDraftPlayer } = developerModel ?? {};

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); },
  };
}

developerTest("NPC drafts publish as non-playable league opponents and can be updated", () => {
  const storage = memoryStorage();
  let draft = createNpcDraft({
    id: "nova-draft",
    name: "Nova Eleven",
    formationId: "3-4-2-1",
    theme: "Space legends",
    now: 10,
  });
  draft = updateDraftIdentity(draft, { iconImage: "https://example.com/nova.png", iconImageTransform: { scale: 2.2, x: -44, y: 18 } });
  const firstPlayerId = draft.players[0].id;
  draft = updateDraftPlayer(draft, firstPlayerId, { name: "Captain Nova", overall: 91 });

  const published = publishNpcOpponent(draft, storage, 100);
  assert.equal(published.status, PUBLISHED_NPC_STATUS);
  assert.equal(published.playable, false);
  assert.equal(published.opponent, true);
  assert.equal(published.formationId, "3-4-2-1");
  assert.equal(published.players.length, 11);
  assert.equal(published.iconImage, "https://example.com/nova.png");
  assert.deepEqual(published.iconImageTransform, { scale: 2.2, x: -44, y: 18 });
  assert.equal(published.players[0].name, "Captain Nova");
  assert.equal(new Set(published.players.map((player) => player.slotId)).size, 11);
  assert.ok(storage.getItem(PUBLISHED_NPC_STORAGE_KEY));

  draft = updateDraftPlayer(draft, firstPlayerId, { name: "Captain Supernova" });
  const updated = publishNpcOpponent(draft, storage, 200);
  assert.equal(updated.publishedAt, 100);
  assert.equal(updated.updatedAt, 200);
  assert.equal(updated.players[0].name, "Captain Supernova");
  assert.equal(loadPublishedNpcOpponents(storage).length, 1);
});

developerTest("unpublishing removes the opponent snapshot without touching its source draft", () => {
  const storage = memoryStorage();
  const draft = createNpcDraft({ id: "removable-draft", name: "Temporary XI" });
  publishNpcOpponent(draft, storage, 500);

  assert.equal(unpublishNpcOpponent(draft.id, storage), true);
  assert.equal(publishedNpcOpponentForDraft(draft.id, storage), null);
  assert.equal(draft.status, "draft-only");
  assert.equal(draft.playable, false);
});

test("invalid registry entries are ignored during loading", () => {
  const storage = memoryStorage();
  storage.setItem(PUBLISHED_NPC_STORAGE_KEY, JSON.stringify({
    opponents: [
      { id: "broken", name: "Broken", formationId: "9-9-9", players: [] },
    ],
  }));
  assert.deepEqual(loadPublishedNpcOpponents(storage), []);
});

developerTest("remote opponent restore merges without deleting local published teams", () => {
  const localStorage = memoryStorage();
  const remoteStorage = memoryStorage();
  const localDraft = createNpcDraft({ id: "local-draft", name: "Local XI", now: 10 });
  const remoteDraft = createNpcDraft({ id: "remote-draft", name: "Remote XI", now: 20 });
  publishNpcOpponent(localDraft, localStorage, 100);
  const remote = publishNpcOpponent(remoteDraft, remoteStorage, 200);

  const merged = mergePublishedNpcOpponents([remote], localStorage);

  assert.deepEqual(new Set(merged.map((team) => team.sourceDraftId)), new Set([
    "local-draft",
    "remote-draft",
  ]));
  assert.equal(loadPublishedNpcOpponents(localStorage).length, 2);
});
