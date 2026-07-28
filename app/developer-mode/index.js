import { FORMATIONS } from "../js/core.js";
import {
  apiMode,
  cacheSerpApiImages,
  fetchPortraitCandidates,
  generateTeamPack,
  mergeDeveloperGameData,
  modeDescription,
  mountTurnstile,
  resetTurnstile,
  saveDeveloperGameData,
  searchSerpApiImages,
  turnstileToken,
} from "../js/api.js";
import { playerImageSource, selectedPortrait } from "../js/avatar.js";
import {
  loadCuratedPortraitCache,
  mergeCuratedPortraitCache,
} from "../js/portraits.js";
import {
  loadPublishedNpcOpponents,
  publishNpcOpponent,
  publishedNpcOpponentForDraft,
  persistPublishedNpcOpponents,
  unpublishNpcOpponent,
} from "../js/published-npc.js";
import {
  applyGeneratedPack,
  applyPortraitSearch,
  chooseNextSerpApiSelection,
  chooseSerpApiSelection,
  changeDraftFormation,
  cycleDraftPlayerPortrait,
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

const SCREEN_ID = "developer-mode-screen";
const STYLE_ID = "developer-mode-styles";
const TURNSTILE_ID = "developer-mode-turnstile";
const AUTHOR_ID_KEY = "gff-developer-author-id-v1";

const LEGACY_LIVE_FORMATION = "4-3-3";

async function generateDraftPack(payload) {
  try {
    return await generateTeamPack(payload);
  } catch (error) {
    const unsupportedFormation =
      payload.formationId !== LEGACY_LIVE_FORMATION &&
      /supported formation/i.test(String(error?.message ?? ""));
    if (!unsupportedFormation) throw error;

    const compatibilityPack = await generateTeamPack({
      ...payload,
      formationId: LEGACY_LIVE_FORMATION,
    });
    return remapGeneratedPackToFormation(compatibilityPack, payload.formationId);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeImageUrl(value) {
  try {
    const url = new URL(String(value));
    if (["http:", "https:"].includes(url.protocol)) return url.href;
    if (url.protocol === "data:" && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(String(value))) return String(value).slice(0, 1500000);
    return "";
  } catch {
    return "";
  }
}

function iconMarkup(icon, className = "") {
  const imageUrl = safeImageUrl(icon);
  if (imageUrl) {
    return '<img class="' + escapeHtml(className) + '" src="' + escapeHtml(imageUrl) + '" alt="" />';
  }
  return '<span class="' + escapeHtml(className) + '" aria-hidden="true">' +
    escapeHtml(String(icon || "◆").slice(0, 4)) + "</span>";
}

function anonymousDeveloperId() {
  let value = localStorage.getItem(AUTHOR_ID_KEY);
  if (!value) {
    value = "npc-author-" + (globalThis.crypto?.randomUUID?.() ?? Date.now());
    localStorage.setItem(AUTHOR_ID_KEY, value);
  }
  return value;
}

function installStylesheet() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./styles.css", import.meta.url).href;
  document.head.append(link);
}

function shellMarkup() {
  return [
    '<header class="manager-window-header developer-mode-header">',
    '  <div class="manager-game-brand" aria-label="GFFootball">',
    '    <span class="manager-game-brand__crest">GF</span><strong>GFFootball</strong>',
    '  </div>',
    '  <nav class="manager-window-nav developer-window-nav has-developer-mode" aria-label="Manager windows">',
    '    <button data-dev-target="tactics" type="button">Tactics</button>',
    '    <button data-dev-target="transfers" type="button">Transfers</button>',
    '    <button data-dev-target="season" type="button">Season</button>',
    '    <button data-dev-target="stats" type="button">Stats</button>',
    '    <button class="is-active" type="button" aria-current="page">Developer</button>',
    '  </nav>',
    '  <div class="manager-header-end">',
    '    <span class="developer-private-badge"><i></i> Draft lab</span>',
    '    <div class="manager-team-summary developer-public-club" aria-label="Current playable club">',
    '      <span class="manager-team-icon" id="developer-public-club-icon" aria-hidden="true">◆</span>',
    '      <span><small>Playable club</small><strong id="developer-public-club-name">Prompt League XI</strong></span>',
    '    </div>',
    '    <button class="icon-button manager-team-settings" data-dev-club-settings type="button" aria-label="Edit playable club">⚙</button>',
    '    <span class="manager-window-header__spacer" aria-hidden="true"></span>',
    '  </div>',
    '</header>',
    '<div class="developer-shell">',
    '  <aside class="developer-draft-rail" aria-label="NPC team drafts">',
    '    <header><div><p class="eyebrow">Private workspace</p><h1>NPC drafts</h1></div>',
    '      <button class="developer-square-button" data-dev-action="new" type="button" aria-label="New NPC team">＋</button></header>',
    '    <div class="developer-draft-list" id="developer-draft-list"></div>',
    '    <footer>',
    '      <button type="button" data-dev-action="export">Export selected</button>',
    '      <button type="button" data-dev-action="import">Import JSON</button>',
    '      <input id="developer-import-input" type="file" accept="application/json,.json" hidden />',
    '    </footer>',
    '  </aside>',
    '  <main class="developer-editor">',
    '    <header class="developer-team-bar">',
    '      <label><span>Team name</span><input id="developer-team-name" maxlength="60" autocomplete="off" /></label>',
    '      <label class="developer-team-icon-field"><span>Icon, URL, or uploaded image</span><input id="developer-team-icon" maxlength="240" autocomplete="off" /><span class="developer-team-icon-actions"><button type="button" data-dev-action="upload-team-icon">Upload</button><button type="button" data-dev-action="open-team-image-search">Find logo</button><input id="developer-team-icon-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden /></span><details class="developer-team-icon-fit"><summary>Fit logo</summary><span class="developer-team-icon-fit-body"><span class="developer-team-icon-preview" id="developer-team-icon-preview" aria-hidden="true"></span><span class="developer-team-icon-sliders"><span><span>Zoom <output id="developer-team-icon-scale-output">100%</output></span><input id="developer-team-icon-scale" type="range" min="0.5" max="2.5" step="0.05" value="1" data-dev-team-fit="scale" /></span><span><span>Horizontal <output id="developer-team-icon-x-output">0%</output></span><input id="developer-team-icon-x" type="range" min="-100" max="100" step="1" value="0" data-dev-team-fit="x" /></span><span><span>Vertical <output id="developer-team-icon-y-output">0%</output></span><input id="developer-team-icon-y" type="range" min="-100" max="100" step="1" value="0" data-dev-team-fit="y" /></span></span></span></details></label>',
    '      <label><span>Formation</span><select id="developer-formation"></select></label>',
    '      <div class="developer-save-actions">',
    '        <span id="developer-save-state" role="status">Saved locally</span>',
    '        <button class="developer-cloud-data-button" id="developer-cloud-data-button" type="button" data-dev-action="open-cloud-data">Cloud data</button>',
    '        <button type="button" data-dev-action="save">Save draft</button>',
    '        <button class="developer-publish-button" id="developer-publish-button" type="button" data-dev-action="open-publish">Publish</button>',
    '        <button class="is-danger" type="button" data-dev-action="delete">Delete</button>',
    '      </div>',
    '    </header>',
    '    <div class="developer-editor-body">',
    '      <section class="developer-pitch-stage" aria-labelledby="developer-pitch-title">',
    '        <form class="developer-generation-bar" id="developer-generation-form">',
    '          <div><p class="eyebrow">Generative query</p><h2 id="developer-pitch-title">NPC team foundry</h2></div>',
    '          <label><span class="visually-hidden">NPC team theme</span><input id="developer-theme" minlength="2" maxlength="80" placeholder="1990s space-opera characters" required /></label>',
    '          <button class="button button--primary" id="developer-generate" type="submit"><span>Generate XI</span></button>',
    '        </form>',
    '        <div class="developer-generation-meta">',
    '          <div class="turnstile-slot" id="' + TURNSTILE_ID + '"></div>',
    '          <button class="developer-portrait-search" data-dev-action="search-all-images" id="developer-search-all-images" type="button"><span>Search XI portraits</span></button>',
    '          <p id="developer-generation-status" role="status">Generation uses the configured AI quota; drafts save locally first and can be protected in game storage.</p>',
    '        </div>',
    '        <div class="developer-pitch" id="developer-pitch" aria-label="Editable NPC starting eleven"></div>',
    '      </section>',
    '      <aside class="developer-player-inspector" id="developer-player-inspector" aria-label="Selected NPC player"></aside>',
    '    </div>',
    '  </main>',
    '</div>',
    '<dialog class="developer-publish-dialog" id="developer-publish-dialog" aria-labelledby="developer-publish-title">',
    '  <div class="developer-publish-dialog__shell">',
    '    <header><div><p class="eyebrow">League opponent</p><h2 id="developer-publish-title">Publish NPC team</h2></div>',
    '      <button class="developer-publish-close" data-dev-action="close-publish" type="button" aria-label="Close publish dialog">×</button></header>',
    '    <div class="developer-publish-summary">',
    '      <span id="developer-publish-icon" aria-hidden="true">◆</span>',
    '      <div><strong id="developer-publish-name">NPC Team</strong><small id="developer-publish-meta">4–3–3 · 11 players</small></div>',
    '      <b id="developer-publish-overall">75</b>',
    '    </div>',
    '    <p>This snapshot becomes an AI-controlled league opponent. A season can hold 31 opponents plus your club; active schedules remain unchanged until next season.</p>',
    '    <footer>',
    '      <button class="button developer-unpublish-button" id="developer-unpublish-button" data-dev-action="unpublish" type="button" hidden>Remove from league</button>',
    '      <span></span>',
    '      <button class="button" data-dev-action="close-publish" type="button">Cancel</button>',
    '      <button class="button button--primary" id="developer-confirm-publish" data-dev-action="confirm-publish" type="button">Publish opponent</button>',
    '    </footer>',
    '  </div>',
    '</dialog>',
    '<dialog class="developer-serp-dialog" id="developer-serp-dialog" aria-labelledby="developer-serp-title">',
    '  <div class="developer-serp-dialog__shell">',
    '    <header><div><p class="eyebrow">Curated image cache</p><h2 id="developer-serp-title">SerpAPI portraits</h2></div>',
    '      <button class="developer-serp-close" data-dev-action="close-serpapi" type="button" aria-label="Close image results">&times;</button></header>',
    '    <div class="developer-serp-toolbar">',
    '      <label class="developer-serp-query-field"><span>Search query</span><input id="developer-serp-query" maxlength="160" placeholder="[CHARACTER] Portrait" autocomplete="off" required /></label>',
    '      <form id="developer-serp-search-form">',
    '        <label><span>Developer access token</span><input id="developer-serp-token" type="password" autocomplete="current-password" required /></label>',
    '        <button class="button button--primary" id="developer-serp-search" type="submit"><span>Run search &middot; 1 API request</span></button>',
    '      </form>',
    '      <p id="developer-serp-status" role="status">Opening this picker does not use the SerpAPI quota.</p>',
    '    </div>',
    '    <div class="developer-serp-results" id="developer-serp-results" aria-live="polite">',
    '      <p class="developer-serp-empty">Run the singular player search when you are ready.</p>',
    '    </div>',
    '    <footer>',
    '      <p><strong>Choose exactly two.</strong> First choice is shown by default; second choice remains available as the alternate. Verify source usage rights before caching.</p>',
    '      <button class="button button--primary" id="developer-serp-cache" data-dev-action="cache-serpapi-images" type="button" disabled>Cache first + second choices</button>',
    '    </footer>',
    '  </div>',
    '</dialog>',
    '<dialog class="developer-team-image-dialog" id="developer-team-image-dialog" aria-labelledby="developer-team-image-title">',
    '  <div class="developer-team-image-dialog__shell">',
    '    <header><div><p class="eyebrow">Licensed team imagery</p><h2 id="developer-team-image-title">Find a team logo</h2></div>',
    '      <button class="developer-serp-close" data-dev-action="close-team-image-search" type="button" aria-label="Close team image search">&times;</button></header>',
    '    <div class="developer-team-image-toolbar">',
    '      <label><span>Search query</span><input id="developer-team-image-query" maxlength="160" placeholder="[TEAM NAME] Logo" autocomplete="off" required /></label>',
    '      <button class="button button--primary" id="developer-team-image-search" data-dev-action="search-team-image" type="button">Search Openverse / Wikimedia</button>',
    '      <p id="developer-team-image-status" role="status">Searches reusable Openverse and Wikimedia Commons results.</p>',
    '    </div>',
    '    <div class="developer-team-image-results" id="developer-team-image-results" aria-live="polite"><p class="developer-serp-empty">Search for a logo to choose a result.</p></div>',
    '    <footer><button class="button" data-dev-action="close-team-image-search" type="button">Close</button></footer>',
    '  </div>',
    '</dialog>',
    '<dialog class="developer-cloud-data-dialog" id="developer-cloud-data-dialog" aria-labelledby="developer-cloud-data-title">',
    '  <div class="developer-cloud-data-dialog__shell">',
    '    <header><div><p class="eyebrow">Durable game storage</p><h2 id="developer-cloud-data-title">Protect developer data</h2></div><button class="developer-serp-close" data-dev-action="close-cloud-data" type="button" aria-label="Close cloud data">&times;</button></header>',
    '    <div class="developer-cloud-data-copy"><p>Copies NPC drafts, published opponents, team images, and portrait-cache metadata into the game Worker. Local data is never deleted.</p><div><span><strong id="developer-cloud-draft-count">0</strong> drafts</span><span><strong id="developer-cloud-opponent-count">0</strong> opponents</span><span><strong id="developer-cloud-portrait-count">0</strong> cached names</span></div></div>',
    '    <label class="developer-cloud-token"><span>Developer access token</span><input id="developer-cloud-token" type="password" autocomplete="current-password" required /></label>',
    '    <p class="developer-cloud-data-status" id="developer-cloud-data-status" role="status">First sync downloads a local JSON backup, then creates immutable server backups before merging.</p>',
    '    <footer><button class="button" data-dev-action="download-cloud-backup" type="button">Download local backup</button><span></span><button class="button" data-dev-action="close-cloud-data" type="button">Cancel</button><button class="button button--primary" id="developer-cloud-connect" data-dev-action="connect-cloud-data" type="button">Migrate / restore</button></footer>',
    '  </div>',
    '</dialog>'
  ].join("\n");
}

function publicNavigationButton(target) {
  return [...document.querySelectorAll('[data-open-manager-window="' + target + '"]')]
    .find((button) => !button.closest("#" + SCREEN_ID));
}

export function mountDeveloperMode() {
  if (document.getElementById(SCREEN_ID)) return;
  installStylesheet();

  const screen = document.createElement("section");
  screen.id = SCREEN_ID;
  screen.className = "manager-screen developer-mode-screen";
  screen.hidden = true;
  screen.setAttribute("aria-label", "Developer Mode NPC team foundry");
  screen.innerHTML = shellMarkup();
  document.body.append(screen);

  const elements = {
    draftList: screen.querySelector("#developer-draft-list"),
    teamName: screen.querySelector("#developer-team-name"),
    teamIcon: screen.querySelector("#developer-team-icon"),
    teamIconPreview: screen.querySelector("#developer-team-icon-preview"),
    teamIconScale: screen.querySelector("#developer-team-icon-scale"),
    teamIconScaleOutput: screen.querySelector("#developer-team-icon-scale-output"),
    teamIconX: screen.querySelector("#developer-team-icon-x"),
    teamIconXOutput: screen.querySelector("#developer-team-icon-x-output"),
    teamIconY: screen.querySelector("#developer-team-icon-y"),
    teamIconYOutput: screen.querySelector("#developer-team-icon-y-output"),
    formation: screen.querySelector("#developer-formation"),
    saveState: screen.querySelector("#developer-save-state"),
    publishButton: screen.querySelector("#developer-publish-button"),
    publishDialog: screen.querySelector("#developer-publish-dialog"),
    publishIcon: screen.querySelector("#developer-publish-icon"),
    publishName: screen.querySelector("#developer-publish-name"),
    publishMeta: screen.querySelector("#developer-publish-meta"),
    publishOverall: screen.querySelector("#developer-publish-overall"),
    confirmPublishButton: screen.querySelector("#developer-confirm-publish"),
    unpublishButton: screen.querySelector("#developer-unpublish-button"),
    theme: screen.querySelector("#developer-theme"),
    generationForm: screen.querySelector("#developer-generation-form"),
    generateButton: screen.querySelector("#developer-generate"),
    generationStatus: screen.querySelector("#developer-generation-status"),
    imageSearchButton: screen.querySelector("#developer-search-all-images"),
    pitch: screen.querySelector("#developer-pitch"),
    inspector: screen.querySelector("#developer-player-inspector"),
    importInput: screen.querySelector("#developer-import-input"),
    publicClubName: screen.querySelector("#developer-public-club-name"),
    publicClubIcon: screen.querySelector("#developer-public-club-icon"),
    serpDialog: screen.querySelector("#developer-serp-dialog"),
    cloudDataButton: screen.querySelector("#developer-cloud-data-button"),
    cloudDataDialog: screen.querySelector("#developer-cloud-data-dialog"),
    cloudDataToken: screen.querySelector("#developer-cloud-token"),
    cloudDataStatus: screen.querySelector("#developer-cloud-data-status"),
    cloudConnectButton: screen.querySelector("#developer-cloud-connect"),
    cloudDraftCount: screen.querySelector("#developer-cloud-draft-count"),
    cloudOpponentCount: screen.querySelector("#developer-cloud-opponent-count"),
    cloudPortraitCount: screen.querySelector("#developer-cloud-portrait-count"),
    teamIconFile: screen.querySelector("#developer-team-icon-file"),
    teamImageDialog: screen.querySelector("#developer-team-image-dialog"),
    teamImageQuery: screen.querySelector("#developer-team-image-query"),
    teamImageSearchButton: screen.querySelector("#developer-team-image-search"),
    teamImageStatus: screen.querySelector("#developer-team-image-status"),
    teamImageResults: screen.querySelector("#developer-team-image-results"),
    serpQuery: screen.querySelector("#developer-serp-query"),
    serpSearchForm: screen.querySelector("#developer-serp-search-form"),
    serpSearchButton: screen.querySelector("#developer-serp-search"),
    serpToken: screen.querySelector("#developer-serp-token"),
    serpStatus: screen.querySelector("#developer-serp-status"),
    serpResults: screen.querySelector("#developer-serp-results"),
    serpCacheButton: screen.querySelector("#developer-serp-cache"),
  };

  let drafts = loadNpcDrafts();
  if (!drafts.length) drafts = persistNpcDrafts([createNpcDraft()]);
  let selectedDraftId = drafts[0].id;
  let selectedPlayerId = drafts[0].players[0].id;
  let deleteArmed = false;
  let deleteTimer = null;
  let portraitSearchBusy = false;
  let draggedPlayerId = null;
  let serpSearchBusy = false;
  let serpSearchSession = null;
  let serpDeveloperToken = "";
  let developerDataToken = "";
  let developerDataRevision = 0;
  let developerDataConnected = false;
  let developerDataSaveTimer = null;
  let developerDataSavePromise = Promise.resolve();
  let cloudMigrationPrompted = false;
  let teamImageSearchSession = null;
  let teamImageSearchBusy = false;
  let serpSelections = { first: null, second: null };

  function currentDraft() {
    return drafts.find((draft) => draft.id === selectedDraftId) ?? drafts[0] ?? null;
  }


  function publishedForDraft(draftId) {
    return publishedNpcOpponentForDraft(draftId);
  }

  function openPublishDialog() {
    const draft = currentDraft();
    if (!draft) return;
    persist("Draft saved before publishing");
    const existing = publishedForDraft(draft.id);
    const averageOverall = Math.round(
      draft.players.reduce((sum, player) => sum + player.overall, 0) / draft.players.length,
    );
    elements.publishIcon.innerHTML = iconMarkup(draft.iconImage || draft.icon, "developer-publish-icon-image");
    elements.publishName.textContent = draft.name;
    elements.publishMeta.textContent = FORMATIONS[draft.formationId].label + " · 11 players · " + draft.theme;
    elements.publishOverall.textContent = averageOverall;
    elements.confirmPublishButton.textContent = existing ? "Update opponent" : "Publish opponent";
    elements.unpublishButton.hidden = !existing;
    if (!elements.publishDialog.open) elements.publishDialog.showModal();
  }

  function publishCurrentDraft() {
    const draft = currentDraft();
    if (!draft) return;
    const existed = Boolean(publishedForDraft(draft.id));
    publishNpcOpponent(draft);
    elements.publishDialog.close();
    elements.saveState.textContent = existed ? "League opponent updated" : "Published to league";
    elements.saveState.dataset.tone = "saved";
    queueDeveloperDataSave();
    renderAll();
  }

  function unpublishCurrentDraft() {
    const draft = currentDraft();
    if (!draft) return;
    unpublishNpcOpponent(draft.id);
    elements.publishDialog.close();
    elements.saveState.textContent = "Removed from future league schedules";
    elements.saveState.dataset.tone = "warning";
    queueDeveloperDataSave();
    renderAll();
  }

  function replaceCurrent(nextDraft) {
    drafts = drafts.map((draft) => draft.id === selectedDraftId ? nextDraft : draft);
  }

  function developerDataSnapshot() {
    return {
      schemaVersion: 1,
      capturedAt: Date.now(),
      drafts,
      publishedOpponents: loadPublishedNpcOpponents(),
      portraitCache: loadCuratedPortraitCache(),
    };
  }

  function setCloudDataStatus(message, tone = "") {
    elements.cloudDataStatus.textContent = message;
    if (tone) elements.cloudDataStatus.dataset.tone = tone;
    else delete elements.cloudDataStatus.dataset.tone;
  }

  function updateCloudDataButton() {
    elements.cloudDataButton.textContent = developerDataConnected ? "Cloud synced" : "Protect data";
    elements.cloudDataButton.classList.toggle("is-connected", developerDataConnected);
  }

  function updateCloudDataCounts(snapshot = developerDataSnapshot()) {
    elements.cloudDraftCount.textContent = snapshot.drafts.length;
    elements.cloudOpponentCount.textContent = snapshot.publishedOpponents.length;
    elements.cloudPortraitCount.textContent = Object.keys(snapshot.portraitCache).length;
  }

  function downloadDeveloperDataBackup(snapshot = developerDataSnapshot()) {
    const payload = JSON.stringify({
      backupType: "prompt-league-developer-data",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      snapshot,
    }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "prompt-league-developer-data-backup-" +
      new Date().toISOString().replace(/[:.]/g, "-") + ".json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function applyDeveloperDataSnapshot(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.drafts) || !Array.isArray(snapshot.publishedOpponents)) {
      throw new Error("The durable game-data response is invalid.");
    }
    drafts = persistNpcDrafts(snapshot.drafts);
    persistPublishedNpcOpponents(snapshot.publishedOpponents);
    mergeCuratedPortraitCache(snapshot.portraitCache ?? {});
    if (!drafts.length) drafts = persistNpcDrafts([createNpcDraft()]);
    selectedDraftId = drafts.some((draft) => draft.id === selectedDraftId)
      ? selectedDraftId
      : drafts[0].id;
    selectedPlayerId = currentDraft()?.players.some((player) => player.id === selectedPlayerId)
      ? selectedPlayerId
      : currentDraft()?.players[0]?.id ?? null;
  }

  function openCloudDataDialog() {
    const snapshot = developerDataSnapshot();
    updateCloudDataCounts(snapshot);
    elements.cloudDataToken.value = developerDataToken || serpDeveloperToken;
    setCloudDataStatus(
      developerDataConnected
        ? "Connected. New Developer Mode changes are saved to durable game storage automatically."
        : "First sync downloads a local JSON backup, then creates immutable server backups before merging.",
      developerDataConnected ? "success" : "",
    );
    if (!elements.cloudDataDialog.open) elements.cloudDataDialog.showModal();
    elements.cloudDataToken.focus();
  }

  async function connectDeveloperData() {
    if (elements.cloudConnectButton.disabled) return;
    const token = elements.cloudDataToken.value.trim();
    if (!token) {
      setCloudDataStatus("Enter the developer access token.", "error");
      elements.cloudDataToken.focus();
      return;
    }
    const localSnapshot = developerDataSnapshot();
    downloadDeveloperDataBackup(localSnapshot);
    elements.cloudConnectButton.disabled = true;
    elements.cloudConnectButton.textContent = "Backing up and merging…";
    setCloudDataStatus("Creating immutable backups before merging local and game data…", "working");
    try {
      const result = await mergeDeveloperGameData(localSnapshot, token);
      const merged = result?.snapshot;
      if (
        !merged ||
        merged.drafts.length < localSnapshot.drafts.length ||
        merged.publishedOpponents.length < localSnapshot.publishedOpponents.length ||
        Object.keys(merged.portraitCache ?? {}).length < Object.keys(localSnapshot.portraitCache).length
      ) {
        throw new Error("Server verification failed; the local browser copy was left unchanged.");
      }
      applyDeveloperDataSnapshot(merged);
      developerDataToken = token;
      serpDeveloperToken = token;
      developerDataRevision = Math.max(0, Number(result.revision) || 0);
      developerDataConnected = true;
      updateCloudDataButton();
      updateCloudDataCounts(merged);
      renderAll();
      setCloudDataStatus(
        "Verified in durable game storage. Local data remains as an additional backup.",
        "success",
      );
    } catch (error) {
      developerDataConnected = false;
      updateCloudDataButton();
      setCloudDataStatus(error.message || "The cloud migration failed. Local data was not changed.", "error");
    } finally {
      elements.cloudConnectButton.disabled = false;
      elements.cloudConnectButton.textContent = developerDataConnected ? "Sync again" : "Migrate / restore";
    }
  }

  function queueDeveloperDataSave() {
    if (!developerDataConnected || !developerDataToken) return;
    clearTimeout(developerDataSaveTimer);
    developerDataSaveTimer = setTimeout(() => {
      const snapshot = developerDataSnapshot();
      developerDataSavePromise = developerDataSavePromise
        .then(async () => {
          const result = await saveDeveloperGameData(
            snapshot,
            developerDataRevision,
            developerDataToken,
          );
          developerDataRevision = Math.max(developerDataRevision, Number(result.revision) || 0);
          if (result.mode === "merged-conflict") applyDeveloperDataSnapshot(result.snapshot);
          elements.saveState.textContent = "Saved to game storage";
          elements.saveState.dataset.tone = "saved";
          updateCloudDataButton();
        })
        .catch((error) => {
          elements.saveState.textContent = error.message || "Cloud save failed; local copy kept";
          elements.saveState.dataset.tone = "warning";
        });
    }, 700);
  }

  function persist(message = "Saved locally") {
    drafts = persistNpcDrafts(drafts);
    elements.saveState.textContent = message;
    elements.saveState.dataset.tone = "saved";
    queueDeveloperDataSave();
  }

  function setGenerationStatus(message, tone = "") {
    elements.generationStatus.textContent = message;
    elements.generationStatus.dataset.tone = tone;
  }

  function setSerpStatus(message, tone = "") {
    elements.serpStatus.textContent = message;
    elements.serpStatus.dataset.tone = tone;
  }

  function renderSerpResults() {
    const results = serpSearchSession?.results ?? [];
    elements.serpCacheButton.disabled =
      serpSearchBusy || serpSelections.first == null || serpSelections.second == null;
    if (!results.length) {
      elements.serpResults.innerHTML = '<p class="developer-serp-empty">Run the singular player search when you are ready.</p>';
      return;
    }

    elements.serpResults.innerHTML = results.map((result, index) => {
      const first = serpSelections.first === index;
      const second = serpSelections.second === index;
      const sourceUrl = safeImageUrl(result.sourceUrl);
      const dimensions = result.width && result.height
        ? result.width + " x " + result.height
        : "Size unavailable";
      return [
        '<article class="developer-serp-result' + (first ? " is-first" : "") + (second ? " is-second" : "") + '">',
        '  <button class="developer-serp-result__image" data-serp-next-index="' + index + '" type="button" aria-label="Choose image ' + (index + 1) + ' as the next cache priority"><span>' + (index + 1) + '</span><img src="' + escapeHtml(result.thumbnail) + '" alt="" loading="lazy" referrerpolicy="no-referrer" /></button>',
        '  <div class="developer-serp-result__meta"><strong>' + escapeHtml(result.title) + '</strong>',
        '    <small>' + escapeHtml(result.source) + ' | ' + escapeHtml(dimensions) + '</small>',
        sourceUrl ? '    <a href="' + escapeHtml(sourceUrl) + '" target="_blank" rel="noopener noreferrer">Open source (new tab)</a>' : '',
        '  </div>',
        '  <div class="developer-serp-result__choices" aria-label="Cache priority">',
        '    <button class="' + (first ? "is-selected" : "") + '" data-dev-action="choose-serpapi-image" data-serp-choice="first" data-serp-index="' + index + '" type="button" aria-pressed="' + first + '">1st choice</button>',
        '    <button class="' + (second ? "is-selected" : "") + '" data-dev-action="choose-serpapi-image" data-serp-choice="second" data-serp-index="' + index + '" type="button" aria-pressed="' + second + '">2nd choice</button>',
        '  </div>',
        '</article>',
      ].join("\n");
    }).join("");
  }

  function setTeamImageStatus(message, tone = "") {
    elements.teamImageStatus.textContent = message;
    if (tone) elements.teamImageStatus.dataset.tone = tone;
    else delete elements.teamImageStatus.dataset.tone;
  }

  function openTeamImageSearch() {
    const draft = currentDraft();
    if (!draft) return;
    teamImageSearchSession = {
      draftId: draft.id,
      name: draft.name,
      queryTemplate: "[TEAM NAME] Logo",
      query: draft.name + " Logo",
      results: [],
    };
    elements.teamImageQuery.value = "[TEAM NAME] Logo";
    setTeamImageStatus("Searches reusable Openverse and Wikimedia Commons results.");
    renderTeamImageResults();
    if (!elements.teamImageDialog.open) elements.teamImageDialog.showModal();
    elements.teamImageQuery.focus();
  }

  function renderTeamImageResults() {
    const results = teamImageSearchSession?.results ?? [];
    if (!results.length) {
      elements.teamImageResults.innerHTML = '<p class="developer-serp-empty">Search for a logo to choose a result.</p>';
      return;
    }
    elements.teamImageResults.innerHTML = results.map((result, index) => {
      const sourceUrl = safeImageUrl(result.sourceUrl);
      return [
        '<article class="developer-team-image-result">',
        '  <img src="' + escapeHtml(result.thumbnail) + '" alt="" loading="lazy" referrerpolicy="no-referrer" />',
        '  <div><strong>' + escapeHtml(result.title || "Untitled logo") + '</strong><small>' + escapeHtml(result.creator || result.source || "Open license") + ' · ' + escapeHtml(result.license || "Open license") + '</small>',
        sourceUrl ? '    <a href="' + escapeHtml(sourceUrl) + '" target="_blank" rel="noopener noreferrer">Open source</a>' : '',
        '  </div>',
        '  <button class="button button--primary" type="button" data-team-image-index="' + index + '">Use logo</button>',
        '</article>',
      ].join("\n");
    }).join("");
  }

  async function searchTeamImageResults() {
    if (teamImageSearchBusy || !teamImageSearchSession) return;
    const queryTemplate = elements.teamImageQuery.value.trim().replace(/\s+/g, " ");
    if (queryTemplate.length < 2 || queryTemplate.length > 160) {
      setTeamImageStatus("Enter a search query between 2 and 160 characters.", "error");
      elements.teamImageQuery.focus();
      return;
    }
    const query = queryTemplate.replace(/\[TEAM NAME\]/gi, teamImageSearchSession.name).trim();
    if (query.length < 2 || query.length > 160) {
      setTeamImageStatus("That query is too long after inserting the team name.", "error");
      return;
    }
    teamImageSearchSession = { ...teamImageSearchSession, queryTemplate, query, results: [] };
    teamImageSearchBusy = true;
    elements.teamImageSearchButton.disabled = true;
    elements.teamImageSearchButton.textContent = "Searching…";
    setTeamImageStatus('Searching Openverse / Wikimedia for "' + query + '"…', "working");
    renderTeamImageResults();
    try {
      const portraits = await fetchPortraitCandidates([{
        id: "team-logo",
        name: query,
        theme: "Team logo",
      }]);
      if (!teamImageSearchSession) return;
      const results = Array.isArray(portraits["team-logo"]) ? portraits["team-logo"].slice(0, 12) : [];
      teamImageSearchSession = { ...teamImageSearchSession, results };
      renderTeamImageResults();
      setTeamImageStatus(results.length ? results.length + " reusable results found." : "No reusable results found.", results.length ? "success" : "error");
    } catch (error) {
      setTeamImageStatus(error.message || "Licensed image search failed.", "error");
    } finally {
      teamImageSearchBusy = false;
      elements.teamImageSearchButton.disabled = false;
      elements.teamImageSearchButton.textContent = "Search Openverse / Wikimedia";
    }
  }

  function selectTeamImage(index) {
    const result = teamImageSearchSession?.results?.[index];
    const draft = currentDraft();
    if (!result || !draft || !safeImageUrl(result.thumbnail)) return;
    replaceCurrent(updateDraftIdentity(draft, { iconImage: result.thumbnail }));
    persist("Team logo selected");
    elements.teamImageDialog.close();
    renderAll();
  }

  function readTeamImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\/(png|jpe?g|webp|gif)$/i.test(file.type)) {
        reject(new Error("Choose a PNG, JPEG, WebP, or GIF image."));
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        reject(new Error("Team images must be smaller than 8 MB."));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("The team image could not be read."));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("The selected file is not a readable image."));
        image.onload = () => {
          const scale = Math.min(1, 320 / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
          canvas.height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/webp", 0.84));
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  function openSerpApiPicker() {
    const draft = currentDraft();
    const player = draft?.players.find((item) => item.id === selectedPlayerId);
    if (!player) return;
    serpSearchSession = {
      draftId: draft.id,
      playerId: player.id,
      name: player.name,
      queryTemplate: "[CHARACTER] Portrait",
      query: player.name + " Portrait",
      searchId: "",
      results: [],
    };
    serpSelections = { first: null, second: null };
    elements.serpQuery.value = "[CHARACTER] Portrait";
    elements.serpToken.value = serpDeveloperToken;
    setSerpStatus("Opening this picker does not use the SerpAPI quota.");
    renderSerpResults();
    elements.serpDialog.showModal();
    elements.serpToken.focus();
  }

  function chooseSerpApiImage(choice, index) {
    const resultCount = serpSearchSession?.results.length ?? 0;
    serpSelections = chooseSerpApiSelection(
      serpSelections,
      choice,
      index,
      resultCount,
    );
    renderSerpResults();
    updateSerpSelectionStatus();
  }

  function chooseNextSerpApiImage(index) {
    const resultCount = serpSearchSession?.results.length ?? 0;
    serpSelections = chooseNextSerpApiSelection(
      serpSelections,
      index,
      resultCount,
    );
    renderSerpResults();
    updateSerpSelectionStatus();
  }

  function updateSerpSelectionStatus() {
    const remaining = serpSelections.first == null || serpSelections.second == null;
    setSerpStatus(
      remaining ? "Choose the other cache priority." : "Both cache choices are ready to save.",
      remaining ? "" : "success",
    );
  }

  async function cacheSelectedSerpApiImages() {
    if (
      serpSearchBusy ||
      !serpSearchSession?.searchId ||
      serpSelections.first == null ||
      serpSelections.second == null
    ) return;

    const session = { ...serpSearchSession };
    const choices = [serpSelections.first, serpSelections.second];
    serpSearchBusy = true;
    elements.serpSearchButton.disabled = true;
    elements.serpCacheButton.disabled = true;
    setSerpStatus("Downloading and caching both selected images...", "working");

    try {
      const payload = await cacheSerpApiImages(
        session.searchId,
        choices,
        serpDeveloperToken,
      );
      const targetDraft = drafts.find((draft) => draft.id === session.draftId);
      const targetPlayer = targetDraft?.players.find((player) => player.id === session.playerId);
      if (!targetDraft || !targetPlayer || targetPlayer.name !== session.name) {
        throw new Error("The player changed after this search. The global cache was saved; reopen the player to apply it.");
      }

      const updatedDraft = applyPortraitSearch(targetDraft, {
        [session.playerId]: payload.portraits,
      });
      drafts = drafts.map((draft) => draft.id === session.draftId ? updatedDraft : draft);
      drafts = persistNpcDrafts(drafts);
      queueDeveloperDataSave();
      if (selectedDraftId === session.draftId) renderAll();
      setGenerationStatus(session.name + " now uses the curated SerpAPI cache.", "success");
      elements.serpDialog.close();
    } catch (error) {
      setSerpStatus(error.message || "The selected images could not be cached.", "error");
    } finally {
      serpSearchBusy = false;
      elements.serpSearchButton.disabled = false;
      renderSerpResults();
    }
  }

  async function refreshDraftPortraits(players, label = "Searching licensed portraits…") {
    if (portraitSearchBusy || !players?.length) return;
    const targetDraftId = selectedDraftId;
    const targetDraft = drafts.find((draft) => draft.id === targetDraftId);
    if (!targetDraft) return;

    portraitSearchBusy = true;
    screen.classList.add("is-searching-portraits");
    elements.imageSearchButton.disabled = true;
    setGenerationStatus(label, "working");

    try {
      const requestedPlayers = players.map((player) => ({
        id: player.id,
        name: player.name,
        theme: targetDraft.theme,
      }));
      const portraits = await fetchPortraitCandidates(requestedPlayers);
      const updatedDraft = applyPortraitSearch(targetDraft, portraits);
      drafts = drafts.map((draft) => draft.id === targetDraftId ? updatedDraft : draft);
      drafts = persistNpcDrafts(drafts);
      queueDeveloperDataSave();
      const found = requestedPlayers.filter((player) =>
        Array.isArray(portraits[player.id]) && portraits[player.id].length > 0,
      ).length;
      if (selectedDraftId === targetDraftId) renderAll();
      setGenerationStatus(
        found
          ? found + " licensed portrait" + (found === 1 ? "" : "s") + " found."
          : "No reusable portraits matched. Fallback artwork remains in place.",
        found ? "success" : "muted",
      );
    } catch (error) {
      setGenerationStatus(error.message || "Portrait search is temporarily unavailable.", "error");
    } finally {
      portraitSearchBusy = false;
      screen.classList.remove("is-searching-portraits");
      elements.imageSearchButton.disabled = false;
    }
  }

  function syncPublicClub() {
    const publicName = [...document.querySelectorAll("[data-club-name]")]
      .find((node) => !node.closest("#" + SCREEN_ID));
    const publicIcon = [...document.querySelectorAll("[data-club-icon]")]
      .find((node) => !node.closest("#" + SCREEN_ID));
    elements.publicClubName.textContent = publicName?.textContent || "Prompt League XI";
    elements.publicClubIcon.textContent = publicIcon?.textContent || "◆";
    elements.publicClubIcon.dataset.icon = publicIcon?.dataset.icon || "shield";
  }

  function renderDraftList() {
    const publishedDraftIds = new Set(loadPublishedNpcOpponents().map((team) => team.sourceDraftId));
    elements.draftList.innerHTML = drafts.map((draft) => {
      const active = draft.id === selectedDraftId;
      return '<button class="developer-draft-item' + (active ? " is-active" : "") +
        '" type="button" data-dev-draft-id="' + escapeHtml(draft.id) + '"' +
        (active ? ' aria-current="true"' : "") + '>' +
        iconMarkup(draft.iconImage || draft.icon, "developer-draft-icon") +
        '<span><strong>' + escapeHtml(draft.name) + '</strong><small>' +
        escapeHtml(FORMATIONS[draft.formationId].label) + ' · ' +
        escapeHtml(draft.theme) + '</small></span><b class="' + (publishedDraftIds.has(draft.id) ? 'is-published' : '') + '">' +
        (publishedDraftIds.has(draft.id) ? 'LIVE' : '11') + '</b></button>';
    }).join("");
  }

  function renderFormationOptions() {
    const draft = currentDraft();
    elements.formation.innerHTML = formationOptions().map((formation) =>
      '<option value="' + escapeHtml(formation.id) + '"' +
      (formation.id === draft.formationId ? " selected" : "") + '>' +
      escapeHtml(formation.label) + "</option>",
    ).join("");
  }

  function renderPitch() {
    const draft = currentDraft();
    const formation = FORMATIONS[draft.formationId];
    const playersBySlot = new Map(draft.players.map((player) => [player.slotId, player]));
    elements.pitch.innerHTML = formation.slots.map((slot) => {
      const player = playersBySlot.get(slot.id);
      if (!player) return "";
      const avatar = playerImageSource({ ...player, theme: draft.theme });
      const selected = player.id === selectedPlayerId;
      return '<button class="developer-pitch-player' + (selected ? " is-selected" : "") +
        '" type="button" draggable="true" aria-grabbed="false" title="Drag onto another player to swap slots"' +
        ' data-dev-player-id="' + escapeHtml(player.id) + '" data-dev-slot-id="' + escapeHtml(slot.id) + '"' +
        ' style="--dev-x:' + slot.x + '%;--dev-y:' + slot.y + '%">' +
        '<span class="developer-pitch-player__rating">' + player.overall + '</span>' +
        '<span class="developer-pitch-player__position">' + escapeHtml(player.position) + '</span>' +
        '<img src="' + escapeHtml(avatar) + '" alt="" draggable="false" />' +
        '<strong>' + escapeHtml(player.name) + '</strong>' +
        '<small>Main position</small></button>';
    }).join("");
  }

  function renderInspector() {
    const draft = currentDraft();
    const player = draft.players.find((item) => item.id === selectedPlayerId) ?? draft.players[0];
    if (!player) {
      elements.inspector.innerHTML = '<p class="developer-empty">Select a player on the formation board.</p>';
      return;
    }
    selectedPlayerId = player.id;
    const formation = FORMATIONS[draft.formationId];
    const slotOptions = formation.slots.map((slot, index) =>
      '<option value="' + escapeHtml(slot.id) + '"' + (slot.id === player.slotId ? " selected" : "") +
      '>' + escapeHtml(slot.position) + ' · slot ' + (index + 1) + "</option>",
    ).join("");
    const draftIsPublished = Boolean(publishedForDraft(draft.id));
    const portrait = selectedPortrait(player);
    const portraitSource = safeImageUrl(portrait?.sourceUrl);
    const portraitCredit = portrait
      ? '<p class="developer-portrait-credit">' +
        (portraitSource
          ? '<a href="' + escapeHtml(portraitSource) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(portrait.creator) + '</a>'
          : '<span>' + escapeHtml(portrait.creator) + '</span>') +
        '<small>' + escapeHtml(portrait.license) + ' · result ' + (player.portrait.index + 1) + '/' + player.portrait.candidates.length + '</small></p>'
      : '<p class="developer-portrait-credit is-fallback"><span>Generated fallback artwork</span><small>Search for a reusable portrait</small></p>';
    const cyclePortraitButton = player.portrait.candidates.length > 1
      ? '<button type="button" data-dev-action="cycle-selected-image">Next result</button>'
      : "";
    elements.inspector.innerHTML = [
      '<header><p class="eyebrow">Player editor</p><h2>' + escapeHtml(player.name) + '</h2>',
      '<span>' + player.overall + '</span></header>',
      '<div class="developer-inspector-avatar"><img src="' +
        escapeHtml(playerImageSource({ ...player, theme: draft.theme })) + '" alt="" draggable="false" /></div>',
      portraitCredit,
      '<div class="developer-portrait-actions"><button type="button" data-dev-action="search-selected-image"><span>Search open portrait</span></button>' + cyclePortraitButton +
        '<button class="developer-serp-trigger" type="button" data-dev-action="serpapi-selected-image"><span>SerpAPI Image Generation</span></button></div>',
      '<label><span>Player name</span><input data-dev-player-field="name" maxlength="80" value="' +
        escapeHtml(player.name) + '" /></label>',
      '<div class="developer-inspector-row">',
      '  <label><span>Main position</span><output class="developer-position-output">' + escapeHtml(player.position) + '</output><small>Defined by the occupied formation slot</small></label>',
      '  <label><span>Overall rating</span><input data-dev-player-field="overall" type="number" min="1" max="99" value="' + player.overall + '" /></label>',
      '</div>',
      '<label><span>Position / formation slot</span><select data-dev-player-field="slotId">' + slotOptions + '</select></label>',
      '<p class="developer-draft-notice' + (draftIsPublished ? ' is-published' : '') + '"><strong>' +
        (draftIsPublished ? 'Published opponent.' : 'Draft only.') + '</strong> ' +
        (draftIsPublished ? 'Use Update opponent to push draft edits into future league schedules.' : 'Publish this team when it is ready to join league simulation.') + '</p>'
    ].join("\n");
  }

  function renderTeamIconFit() {
    const draft = currentDraft();
    if (!draft) return;
    const transform = draft.iconImageTransform ?? { scale: 1, x: 0, y: 0 };
    elements.teamIconScale.value = String(transform.scale);
    elements.teamIconX.value = String(transform.x);
    elements.teamIconY.value = String(transform.y);
    elements.teamIconScaleOutput.textContent = Math.round(transform.scale * 100) + "%";
    elements.teamIconXOutput.textContent = Math.round(transform.x) + "%";
    elements.teamIconYOutput.textContent = Math.round(transform.y) + "%";
    elements.teamIconPreview.style.setProperty("--icon-scale", String(transform.scale));
    elements.teamIconPreview.style.setProperty("--icon-x", (transform.x * 0.35) + "px");
    elements.teamIconPreview.style.setProperty("--icon-y", (transform.y * 0.35) + "px");
    elements.teamIconPreview.innerHTML = iconMarkup(draft.iconImage || draft.icon, "developer-team-icon-preview-media");
  }

  function renderEditor() {
    const draft = currentDraft();
    if (!draft) return;
    elements.teamName.value = draft.name;
    elements.teamIcon.value = draft.icon;
    renderTeamIconFit();
    elements.theme.value = draft.theme === "Manual draft" ? "" : draft.theme;
    const published = Boolean(publishedForDraft(draft.id));
    elements.publishButton.textContent = published ? "Update league" : "Publish";
    elements.publishButton.classList.toggle("is-published", published);
    renderFormationOptions();
    renderPitch();
    renderInspector();
  }

  function renderAll() {
    renderDraftList();
    renderEditor();
    syncPublicClub();
  }

  function openDeveloperMode() {
    document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
    screen.hidden = false;
    deleteArmed = false;
    renderAll();
    updateCloudDataButton();
    if (apiMode() === "live" && !cloudMigrationPrompted && !developerDataConnected) {
      cloudMigrationPrompted = true;
      setTimeout(() => openCloudDataDialog(), 0);
    }
    if (apiMode() === "live") {
      mountTurnstile(TURNSTILE_ID).catch((error) => {
        setGenerationStatus(error.message || "The anti-bot check could not load.", "error");
      });
    } else {
      elements.generateButton.disabled = true;
      setGenerationStatus(modeDescription() + " Manual editing remains available.", "muted");
    }
  }

  function leaveDeveloperMode(target = "tactics") {
    screen.hidden = true;
    if (target === "tactics") return;
    publicNavigationButton(target)?.click();
  }

  document.querySelectorAll(".manager-window-nav").forEach((nav) => {
    if (nav.closest("#" + SCREEN_ID) || nav.querySelector("[data-open-developer-mode]")) return;
    nav.classList.add("has-developer-mode");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.openDeveloperMode = "";
    button.textContent = "Developer";
    nav.append(button);
  });

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest("[data-open-developer-mode]")
      : null;
    if (!target) return;
    event.preventDefault();
    openDeveloperMode();
  }, { capture: true });

  screen.addEventListener("click", (event) => {
    const targetButton = event.target.closest("[data-dev-target]");
    if (targetButton) {
      leaveDeveloperMode(targetButton.dataset.devTarget);
      return;
    }

    const draftButton = event.target.closest("[data-dev-draft-id]");
    if (draftButton) {
      selectedDraftId = draftButton.dataset.devDraftId;
      selectedPlayerId = currentDraft()?.players[0]?.id ?? null;
      deleteArmed = false;
      renderAll();
      return;
    }

    const playerButton = event.target.closest("[data-dev-player-id]");
    if (playerButton) {
      selectedPlayerId = playerButton.dataset.devPlayerId;
      renderPitch();
      renderInspector();
      return;
    }

    const settingsButton = event.target.closest("[data-dev-club-settings]");
    if (settingsButton) {
      [...document.querySelectorAll("[data-open-club-settings]")]
        .find((button) => !button.closest("#" + SCREEN_ID))?.click();
      return;
    }

    const actionButton = event.target.closest("[data-dev-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.devAction;

    if (action === "open-cloud-data") {
      openCloudDataDialog();
      return;
    }

    if (action === "close-cloud-data") {
      elements.cloudDataDialog.close();
      return;
    }

    if (action === "download-cloud-backup") {
      downloadDeveloperDataBackup();
      setCloudDataStatus("Local JSON backup downloaded. Nothing was removed.", "success");
      return;
    }

    if (action === "connect-cloud-data") {
      void connectDeveloperData();
      return;
    }

    if (action === "open-publish") {
      openPublishDialog();
      return;
    }

    if (action === "close-publish") {
      elements.publishDialog.close();
      return;
    }

    if (action === "confirm-publish") {
      publishCurrentDraft();
      return;
    }

    if (action === "unpublish") {
      unpublishCurrentDraft();
      return;
    }

    if (action === "upload-team-icon") {
      elements.teamIconFile.click();
      return;
    }

    if (action === "open-team-image-search") {
      openTeamImageSearch();
      return;
    }

    if (action === "close-team-image-search") {
      elements.teamImageDialog.close();
      return;
    }

    if (action === "search-team-image") {
      void searchTeamImageResults();
      return;
    }

    if (action === "close-serpapi") {
      elements.serpDialog.close();
      return;
    }

    if (action === "serpapi-selected-image") {
      openSerpApiPicker();
      return;
    }


    if (action === "search-all-images") {
      void refreshDraftPortraits(currentDraft().players, "Searching licensed portraits for the full XI…");
      return;
    }

    if (action === "search-selected-image") {
      const player = currentDraft().players.find((item) => item.id === selectedPlayerId);
      if (player) void refreshDraftPortraits([player], "Searching licensed portraits for " + player.name + "…");
      return;
    }

    if (action === "cycle-selected-image") {
      replaceCurrent(cycleDraftPlayerPortrait(currentDraft(), selectedPlayerId));
      persist("Portrait result changed");
      renderPitch();
      renderInspector();
      return;
    }

    if (action === "new") {
      const draft = createNpcDraft({ name: "New NPC Team" });
      drafts = persistNpcDrafts([draft, ...drafts]);
      queueDeveloperDataSave();
      selectedDraftId = draft.id;
      selectedPlayerId = draft.players[0].id;
      deleteArmed = false;
      renderAll();
      elements.teamName.select();
      return;
    }

    if (action === "save") {
      persist("Saved locally · " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      renderDraftList();
      return;
    }

    if (action === "delete") {
      if (!deleteArmed) {
        deleteArmed = true;
        actionButton.textContent = "Confirm delete";
        elements.saveState.textContent = "Click again to delete this draft";
        elements.saveState.dataset.tone = "warning";
        clearTimeout(deleteTimer);
        deleteTimer = setTimeout(() => {
          deleteArmed = false;
          actionButton.textContent = "Delete";
          elements.saveState.textContent = "Draft kept";
        }, 4000);
        return;
      }
      clearTimeout(deleteTimer);
      unpublishNpcOpponent(selectedDraftId);
      drafts = drafts.filter((draft) => draft.id !== selectedDraftId);
      if (!drafts.length) drafts = [createNpcDraft()];
      drafts = persistNpcDrafts(drafts);
      queueDeveloperDataSave();
      selectedDraftId = drafts[0].id;
      selectedPlayerId = drafts[0].players[0].id;
      deleteArmed = false;
      renderAll();
      return;
    }

    if (action === "export") {
      const draft = currentDraft();
      const blob = new Blob([serializeNpcDraftDocument([draft])], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-npc-draft.json";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      elements.saveState.textContent = "Draft exported";
      return;
    }

    if (action === "import") elements.importInput.click();
  });


  elements.serpResults.addEventListener("click", (event) => {
    const choiceButton = event.target.closest("[data-serp-choice]");
    if (choiceButton) {
      event.stopPropagation();
      chooseSerpApiImage(
        choiceButton.dataset.serpChoice,
        Number(choiceButton.dataset.serpIndex),
      );
      return;
    }

    const imageButton = event.target.closest("[data-serp-next-index]");
    if (!imageButton) return;
    event.stopPropagation();
    chooseNextSerpApiImage(Number(imageButton.dataset.serpNextIndex));
  });

  elements.teamImageResults.addEventListener("click", (event) => {
    const resultButton = event.target.closest("[data-team-image-index]");
    if (!resultButton) return;
    selectTeamImage(Number(resultButton.dataset.teamImageIndex));
  });

  elements.teamIconFile.addEventListener("change", async () => {
    const file = elements.teamIconFile.files?.[0];
    if (!file) return;
    try {
      const iconImage = await readTeamImageFile(file);
      replaceCurrent(updateDraftIdentity(currentDraft(), { iconImage }));
      persist("Uploaded team logo");
      renderAll();
    } catch (error) {
      elements.saveState.textContent = error.message || "The team image could not be uploaded.";
      elements.saveState.dataset.tone = "warning";
    } finally {
      elements.teamIconFile.value = "";
    }
  });

  elements.serpCacheButton.addEventListener("click", (event) => {
    event.stopPropagation();
    void cacheSelectedSerpApiImages();
  });
  screen.addEventListener("dragstart", (event) => {
    const playerButton = event.target.closest("[data-dev-player-id]");
    if (!playerButton) return;
    draggedPlayerId = playerButton.dataset.devPlayerId;
    selectedPlayerId = draggedPlayerId;
    playerButton.classList.add("is-dragging");
    playerButton.setAttribute("aria-grabbed", "true");
    elements.pitch.classList.add("is-drag-active");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedPlayerId);
  });

  screen.addEventListener("dragover", (event) => {
    const targetButton = event.target.closest("[data-dev-player-id]");
    if (!draggedPlayerId || !targetButton || targetButton.dataset.devPlayerId === draggedPlayerId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    screen.querySelectorAll(".developer-pitch-player.is-drop-target").forEach((button) => {
      if (button !== targetButton) button.classList.remove("is-drop-target");
    });
    targetButton.classList.add("is-drop-target");
  });

  screen.addEventListener("dragleave", (event) => {
    const targetButton = event.target.closest("[data-dev-player-id]");
    if (targetButton && !targetButton.contains(event.relatedTarget)) {
      targetButton.classList.remove("is-drop-target");
    }
  });

  screen.addEventListener("drop", (event) => {
    const targetButton = event.target.closest("[data-dev-player-id]");
    if (!draggedPlayerId || !targetButton || targetButton.dataset.devPlayerId === draggedPlayerId) return;
    event.preventDefault();
    const draft = currentDraft();
    const targetPlayer = draft.players.find((player) => player.id === targetButton.dataset.devPlayerId);
    const sourcePlayer = draft.players.find((player) => player.id === draggedPlayerId);
    if (!targetPlayer || !sourcePlayer) return;
    replaceCurrent(moveDraftPlayer(draft, sourcePlayer.id, targetPlayer.slotId));
    selectedPlayerId = sourcePlayer.id;
    persist(sourcePlayer.name + " and " + targetPlayer.name + " switched slots");
    draggedPlayerId = null;
    renderAll();
    setGenerationStatus("Player slots switched. Main positions now match the occupied slots.", "success");
  });

  screen.addEventListener("dragend", () => {
    draggedPlayerId = null;
    elements.pitch.classList.remove("is-drag-active");
    screen.querySelectorAll(".developer-pitch-player").forEach((button) => {
      button.classList.remove("is-dragging", "is-drop-target");
      button.setAttribute("aria-grabbed", "false");
    });
  });

  function iconTransformFromControls() {
    return {
      scale: Number(elements.teamIconScale.value),
      x: Number(elements.teamIconX.value),
      y: Number(elements.teamIconY.value),
    };
  }

  function applyTeamIconTransform({ persistChanges = false } = {}) {
    const draft = currentDraft();
    if (!draft) return;
    replaceCurrent(updateDraftIdentity(draft, { iconImageTransform: iconTransformFromControls() }));
    if (persistChanges) persist("Team logo fit saved");
    renderTeamIconFit();
  }

  screen.addEventListener("input", (event) => {
    if (!event.target.dataset.devTeamFit) return;
    applyTeamIconTransform();
  });

  screen.addEventListener("change", (event) => {
    const draft = currentDraft();
    if (!draft) return;

    if (event.target.dataset.devTeamFit) {
      applyTeamIconTransform({ persistChanges: true });
      renderAll();
      return;
    }

    if (event.target === elements.teamName || event.target === elements.teamIcon) {
      replaceCurrent(updateDraftIdentity(draft, {
        name: elements.teamName.value,
        icon: elements.teamIcon.value,
        iconImage: event.target === elements.teamIcon ? "" : draft.iconImage,
      }));
      persist();
      renderAll();
      return;
    }

    if (event.target === elements.formation) {
      replaceCurrent(changeDraftFormation(draft, elements.formation.value));
      selectedPlayerId = currentDraft().players.find((player) => player.id === selectedPlayerId)?.id ??
        currentDraft().players[0].id;
      persist();
      renderAll();
      return;
    }

    const field = event.target.dataset.devPlayerField;
    if (!field) return;
    if (field === "slotId") {
      replaceCurrent(moveDraftPlayer(draft, selectedPlayerId, event.target.value));
    } else {
      replaceCurrent(updateDraftPlayer(draft, selectedPlayerId, { [field]: event.target.value }));
    }
    persist();
    renderAll();
  });

  elements.serpSearchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (serpSearchBusy || !serpSearchSession) return;
    const token = elements.serpToken.value.trim();
    if (!token) {
      setSerpStatus("Enter the developer access token.", "error");
      elements.serpToken.focus();
      return;
    }

    const queryTemplate = elements.serpQuery.value.trim().replace(/\s+/g, " ");
    if (queryTemplate.length < 2 || queryTemplate.length > 160) {
      setSerpStatus("Enter a search query between 2 and 160 characters.", "error");
      elements.serpQuery.focus();
      return;
    }
    const query = queryTemplate.replace(/\[CHARACTER\]/gi, serpSearchSession.name).trim();
    if (query.length < 2 || query.length > 160) {
      setSerpStatus("That query is too long after inserting the player name.", "error");
      elements.serpQuery.focus();
      return;
    }

    const session = { ...serpSearchSession, queryTemplate, query };
    serpSearchSession = session;
    serpDeveloperToken = token;
    serpSearchBusy = true;
    serpSelections = { first: null, second: null };
    elements.serpSearchButton.disabled = true;
    elements.serpSearchButton.querySelector("span").textContent = "Searching SerpAPI...";
    setSerpStatus('Using 1 SerpAPI request for "' + session.query + '"...', "working");
    renderSerpResults();

    try {
      const payload = await searchSerpApiImages(session.query, token);
      if (
        !serpSearchSession ||
        serpSearchSession.playerId !== session.playerId ||
        serpSearchSession.name !== session.name
      ) return;
      serpSearchSession = {
        ...serpSearchSession,
        searchId: payload.searchId,
        results: Array.isArray(payload.results) ? payload.results.slice(0, 20) : [],
      };
      renderSerpResults();
      setSerpStatus(serpSearchSession.results.length + " results - choose first and second images.", "success");
    } catch (error) {
      setSerpStatus(error.message || "SerpAPI search failed.", "error");
    } finally {
      serpSearchBusy = false;
      elements.serpSearchButton.disabled = false;
      elements.serpSearchButton.querySelector("span").textContent = "Run search - 1 API request";
      renderSerpResults();
    }
  });

  elements.generationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const draft = currentDraft();
    const theme = elements.theme.value.trim().replace(/\s+/g, " ");
    if (theme.length < 2 || theme.length > 80) {
      setGenerationStatus("Enter a generative query between 2 and 80 characters.", "error");
      return;
    }
    if (apiMode() !== "live") {
      setGenerationStatus(modeDescription() + " Manual editing remains available.", "error");
      return;
    }
    const token = turnstileToken(TURNSTILE_ID);
    if (!token) {
      setGenerationStatus("Complete the anti-bot check before generating.", "error");
      return;
    }

    elements.generateButton.disabled = true;
    elements.generateButton.classList.add("is-loading");
    elements.generateButton.querySelector("span").textContent = "Generating XI…";
    setGenerationStatus("Building an eleven-player draft for " + FORMATIONS[draft.formationId].label + "…", "working");

    try {
      const pack = await generateDraftPack({
        theme,
        formationId: draft.formationId,
        initialSquad: true,
        excludedNames: [],
        anonymousUserId: anonymousDeveloperId(),
        turnstileToken: token,
      });
      replaceCurrent(applyGeneratedPack(draft, pack));
      selectedPlayerId = currentDraft().players[0].id;
      persist("Generated XI saved locally");
      renderAll();
      await refreshDraftPortraits(
        currentDraft().players,
        "Names generated. Searching licensed portrait APIs…",
      );
    } catch (error) {
      setGenerationStatus(error.message || "The NPC draft generator is unavailable.", "error");
    } finally {
      resetTurnstile(TURNSTILE_ID);
      elements.generateButton.disabled = false;
      elements.generateButton.classList.remove("is-loading");
      elements.generateButton.querySelector("span").textContent = "Generate XI";
    }
  });

  elements.importInput.addEventListener("change", async () => {
    const file = elements.importInput.files?.[0];
    if (!file) return;
    try {
      const imported = parseNpcDraftDocument(await file.text());
      const byId = new Map(drafts.map((draft) => [draft.id, draft]));
      imported.forEach((draft) => byId.set(draft.id, draft));
      drafts = persistNpcDrafts([...byId.values()]);
      queueDeveloperDataSave();
      selectedDraftId = imported[0].id;
      selectedPlayerId = imported[0].players[0].id;
      renderAll();
      elements.saveState.textContent = imported.length + " draft" + (imported.length === 1 ? "" : "s") + " imported";
    } catch (error) {
      elements.saveState.textContent = error.message || "That draft file could not be imported.";
      elements.saveState.dataset.tone = "warning";
    } finally {
      elements.importInput.value = "";
    }
  });

  renderAll();
}
