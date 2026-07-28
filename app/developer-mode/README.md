# Developer Mode

Developer Mode is an optional, local-only NPC team authoring workspace.

## Isolation contract

- `index.js` injects the tab and UI at runtime.
- `styles.css` contains every Developer Mode selector.
- `model.js` owns the draft schema, editing operations, import/export, and the separate localStorage key.
- `model.test.js` verifies the isolated draft behavior.
- Public game code contains one guarded dynamic import. If this folder is removed, that import is ignored and the public game continues without a Developer tab.

## Draft boundary

NPC drafts are saved under `gff-developer-npc-drafts-v1`. They remain `status: "draft-only"` and `playable: false`; ordinary editing never touches the public club save, finances, standings, fixtures, or player collection.

The explicit **Publish opponent** action is the sole bridge out of the draft store. It writes a non-playable snapshot to `gff.published-npc-opponents.v1` through `js/published-npc.js`. The public game snapshots those opponents into a season before its first match. Editing or removing a published draft cannot rewrite a season already underway; the change applies to the next season.

Generated queries use the existing team-pack API and public anti-bot/rate-limit contract, but the returned eleven is written only to the Developer Mode draft store. All names, preferred roles, formation slots, ratings, team names, and icons remain editable.


## Pitch editing and portraits

- Drag any pitch player onto another player to swap their formation slots. The operation only changes slot assignment; names, ratings, roles, and portrait metadata remain attached to the player.
- New formations first use their exact Worker formation contract. If the configured live Worker is one deployment behind, Developer Mode performs a one-time 4-3-3 compatibility retry and remaps all eleven players into the requested local shape.
- Generated teams automatically search the existing licensed browser-image providers after their names are created. Searches can also be run for the full XI or the selected player.
- Each saved portrait keeps its creator, source, and license metadata. The inspector exposes attribution and lets the author cycle through up to three candidates.
- Browser portrait results are still draft assets only. If the API is unavailable or has no licensed match, the deterministic local fallback avatar remains visible.
- Every player inspector has a **SerpAPI Image Generation** action. Opening it
  is quota-free; submitting the exact `[PLAYER NAME] Portrait` query uses one
  SerpAPI request and displays the first 20 Google Images results.
- The author must choose two distinct results: a first choice and a second
  choice. Saving downloads both raster images into Worker KV and records the
  name-keyed choice in local storage. Future uses of that name check this
  curated cache before Wikipedia, Wikimedia Commons, or Openverse.
- SerpAPI does not grant image usage rights. Verify each linked source before caching it.


## Publishing opponents

- Publish creates an AI-controlled opponent snapshot with the draft’s name, icon, theme, formation, eleven slot assignments, ratings, and portrait attribution.
- Update replaces the future opponent snapshot while preserving its original publication date.
- Remove from league deletes the future snapshot without deleting the source draft.
- Published opponents are never selectable as the user club and never enter the user player collection.
