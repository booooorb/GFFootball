import {
  COLLECTION_LIMIT,
  FORMATIONS,
  SCOUTING_COST_MILLIONS,
  SEASON_LENGTH,
  USER_CLUB_ID,
  applyMatchToSave,
  autoPickLineup,
  assignPlayerToSlot,
  ballonDorAllTime,
  chargeScoutingFee,
  compatibilityPenalty,
  createDefaultSave,
  createDefaultSeason,
  createEmptyTransferMarket,
  currentBallonDorRace,
  effectiveOverall,
  isLineupComplete,
  leagueStandings,
  lineupEntries,
  marketValueMillions,
  normalizeClubProfile,
  normalizeMarketPackPlayers,
  normalizeName,
  playerCardTier,
  playerSeasonPerformance,
  positionCategory,
  prepareInitialSquad,
  prepareTransferMarket,
  revealTransferCard,
  previewOpponent,
  previewSeasonOpponent,
  reconcileLineupPlayerPositions,
  refitLineup,
  seasonAward,
  seasonClubForm,
  seasonRecentFixtures,
  sellPlayer,
  signTransfer,
  simulateMatch,
  statisticLeaderboards,
  syncSeasonOpponents,
} from "./core.js";
import {
  ApiError,
  apiMode,
  fetchCachedPortraitCandidates,
  fetchConnectionStatus,
  fetchPortraitCandidates,
  fetchPublishedNpcOpponentsFromGameStorage,
  generateTeamPack,
  modeDescription,
  mountTurnstile,
  resetTurnstile,
  turnstileToken,
} from "./api.js";
import { fallbackAvatar, playerImageSource, playerInitials, selectedPortrait } from "./avatar.js";
import { clearSave, loadSave, persistSave } from "./storage.js";
import {
  PUBLISHED_NPC_EVENT,
  loadPublishedNpcOpponents,
  mergePublishedNpcOpponents,
} from "./published-npc.js";

const elements = {
  setupScreen: document.querySelector("#setup-screen"),
  managerScreen: document.querySelector("#manager-screen"),
  seasonChip: document.querySelector("#season-chip"),
  apiStatus: document.querySelector("#api-status"),
  apiStatusLabel: document.querySelector("#api-status-label"),
  apiStatusDetail: document.querySelector("#api-status-detail"),
  clubBalance: document.querySelector("#club-balance"),
  clubNameNodes: [...document.querySelectorAll("[data-club-name]")],
  clubIconNodes: [...document.querySelectorAll("[data-club-icon]")],
  clubSettingsButtons: [...document.querySelectorAll("[data-open-club-settings]")],
  clubSettingsDialog: document.querySelector("#club-settings-dialog"),
  clubSettingsForm: document.querySelector("#club-settings-form"),
  clubNameInput: document.querySelector("#club-name-input"),
  generationButtons: [...document.querySelectorAll("[data-generation-button]")],
  firstForm: document.querySelector("#first-theme-form"),
  firstTheme: document.querySelector("#first-theme"),
  setupModeNote: document.querySelector("#setup-mode-note"),
  setupError: document.querySelector("#setup-error"),
  themeForm: document.querySelector("#theme-form"),
  themeInput: document.querySelector("#theme"),
  managerError: document.querySelector("#manager-error"),
  formationSelect: document.querySelector("#formation-select"),
  formationPickerTrigger: document.querySelector("#formation-picker-trigger"),
  formationPickerValue: document.querySelector("#formation-picker-value"),
  formationPickerMenu: document.querySelector("#formation-picker-menu"),
  fixPositionsButton: document.querySelector("#fix-positions-button"),
  autoPickButton: document.querySelector("#auto-pick-button"),
  openMatchdayButton: document.querySelector("#open-matchday-button"),
  managerWindowButtons: [...document.querySelectorAll("[data-open-manager-window]")],
  transferCounts: [...document.querySelectorAll("[data-transfer-count]")],
  pitch: document.querySelector("#football-pitch"),
  lineupStatus: document.querySelector("#lineup-status"),
  selectionHint: document.querySelector("#selection-hint"),
  selectedPlayerSellButton: document.querySelector("#selected-player-sell-button"),
  selectedPlayerInspector: document.querySelector("#selected-player-inspector"),
  collectionList: document.querySelector("#collection-list"),
  collectionTitle: document.querySelector("#collection-title"),
  playerSearch: document.querySelector("#player-search"),
  positionFilter: document.querySelector("#position-filter"),
  playerSort: document.querySelector("#player-sort"),
  matchdayDialog: document.querySelector("#matchday-dialog"),
  matchdaySeasonSummary: document.querySelector("#matchday-season-summary"),
  simulateButton: document.querySelector("#simulate-button"),
  matchHelp: document.querySelector("#match-help"),
  fixtureWeek: document.querySelector("#fixture-week"),
  nextOpponent: document.querySelector("#next-opponent"),
  matchdayClub: document.querySelector(".matchday__club"),
  opponentPreview: document.querySelector("#opponent-preview"),
  opponentPreviewIcon: document.querySelector("#opponent-preview-icon"),
  opponentPreviewName: document.querySelector("#opponent-preview-name"),
  opponentPreviewMeta: document.querySelector("#opponent-preview-meta"),
  opponentPreviewRating: document.querySelector("#opponent-preview-rating"),
  opponentPreviewAttack: document.querySelector("#opponent-preview-attack"),
  opponentPreviewControl: document.querySelector("#opponent-preview-control"),
  opponentPreviewDefence: document.querySelector("#opponent-preview-defence"),
  opponentPreviewPitch: document.querySelector("#opponent-preview-pitch"),
  fixtureList: document.querySelector("#fixture-list"),
  leagueRound: document.querySelector("#league-round"),
  leagueTableBody: document.querySelector("#league-table-body"),
  seasonOpponentPreview: document.querySelector("#season-opponent-preview"),
  seasonOpponentPreviewIcon: document.querySelector("#season-opponent-preview-icon"),
  seasonOpponentPreviewName: document.querySelector("#season-opponent-preview-name"),
  seasonOpponentPreviewMeta: document.querySelector("#season-opponent-preview-meta"),
  seasonOpponentPreviewRating: document.querySelector("#season-opponent-preview-rating"),
  seasonOpponentPreviewAttack: document.querySelector("#season-opponent-preview-attack"),
  seasonOpponentPreviewControl: document.querySelector("#season-opponent-preview-control"),
  seasonOpponentPreviewDefence: document.querySelector("#season-opponent-preview-defence"),
  seasonOpponentPreviewPitch: document.querySelector("#season-opponent-preview-pitch"),
  seasonRecentFixtures: document.querySelector("#season-recent-fixtures"),
  seasonHistoryList: document.querySelector("#season-history-list"),
  seasonBroadcastSummary: document.querySelector("#season-broadcast-summary"),
  seasonNextButton: document.querySelector("#season-next-button"),
  seasonNextOpponentName: document.querySelector("#season-next-opponent-name"),
  seasonOpenMatchdayButton: document.querySelector("#season-open-matchday-button"),
  resetButton: document.querySelector("#reset-button"),
  creditsButton: document.querySelector("#credits-button"),
  creditsList: document.querySelector("#credits-list"),
  packDialog: document.querySelector("#pack-dialog"),
  transferLoading: document.querySelector("#transfer-loading"),
  transferLoadingMessage: document.querySelector("#transfer-loading-message"),
  seasonDialog: document.querySelector("#season-dialog"),
  statsDialog: document.querySelector("#stats-dialog"),
  statsMetricButtons: [...document.querySelectorAll("[data-stats-metric]")],
  statsLeaderboardGrid: document.querySelector(".stats-window__grid"),
  statsBallonView: document.querySelector("#stats-ballon-view"),
  statsSeasonClub: document.querySelector("#stats-season-club"),
  statsSeasonAll: document.querySelector("#stats-season-all"),
  statsAllTimeClub: document.querySelector("#stats-alltime-club"),
  statsAllTimeAll: document.querySelector("#stats-alltime-all"),
  statsBallonRace: document.querySelector("#stats-ballon-race"),
  statsBallonAllTime: document.querySelector("#stats-ballon-alltime"),
  statsFeature: document.querySelector("#stats-feature"),
  statsSeasonSnapshot: document.querySelector("#stats-season-snapshot"),
  statsRecordStrip: document.querySelector("#stats-record-strip"),
  sellDialog: document.querySelector("#sell-dialog"),
  sellDialogPlayer: document.querySelector("#sell-dialog-player"),
  sellPlayerPhoto: document.querySelector("#sell-player-photo"),
  sellPlayerName: document.querySelector("#sell-player-name"),
  sellPlayerMeta: document.querySelector("#sell-player-meta"),
  sellPlayerValue: document.querySelector("#sell-player-value"),
  sellDialogMessage: document.querySelector("#sell-dialog-message"),
  confirmSaleButton: document.querySelector("#confirm-sale-button"),
  packTitle: document.querySelector("#pack-title"),
  packSummary: document.querySelector("#pack-summary"),
  packGrid: document.querySelector("#pack-grid"),
  packOpeningDialog: document.querySelector("#pack-opening-dialog"),
  packOpeningGrid: document.querySelector("#pack-opening-grid"),
  packOpeningStatus: document.querySelector("#pack-opening-status"),
  packOpeningContinue: document.querySelector("#pack-opening-continue"),
  resultDialog: document.querySelector("#result-dialog"),
  resultWeek: document.querySelector("#result-week"),
  scoreboard: document.querySelector("#scoreboard"),
  performanceMapTitle: document.querySelector("#performance-map-title"),
  performanceMapMeta: document.querySelector("#performance-map-meta"),
  resultTeamButtons: [...document.querySelectorAll("[data-result-team]")],
  resultPitch: document.querySelector("#result-pitch"),
  matchStatList: document.querySelector("#match-stat-list"),
  matchStatTeamLabels: document.querySelector("#match-stat-team-labels"),
  eventTimeline: document.querySelector("#event-timeline"),
  seasonAward: document.querySelector("#season-award"),
  creditsDialog: document.querySelector("#credits-dialog"),
  loadingOverlay: document.querySelector("#loading-overlay"),
  loadingMessage: document.querySelector("#loading-message"),
  toast: document.querySelector("#toast"),
  recordWins: document.querySelector("#record-wins"),
  recordDraws: document.querySelector("#record-draws"),
  recordLosses: document.querySelector("#record-losses"),
  recordGf: document.querySelector("#record-gf"),
  recordGa: document.querySelector("#record-ga"),
  topbarPhase: document.querySelector("#topbar-phase"),
  topbarNext: document.querySelector("#topbar-next"),
};

let state = syncSeasonOpponents(loadSave(), loadPublishedNpcOpponents());
let selectedPlayerId = null;
let pendingSalePlayerId = null;
let selectedStatsMetric = "goals";
let selectedSeasonOpponentId = null;
let selectedResultTeam = "user";
let currentResultMatch = null;
let toastTimer = null;
let connectionReady = false;
let portraitRefreshStarted = false;
let animatedMarketBatchId = "";
let packAnimationTimer = null;
let activePlayerDragGhost = null;
let activeDraggedPlayerId = null;
let pointerDragSession = null;
let suppressPlayerClick = false;
const PORTRAIT_LOOKUP_VERSION_KEY = "gff-portrait-lookup-version";
const PORTRAIT_LOOKUP_VERSION = 2;

function clearPlayerDragImage() {
  activePlayerDragGhost?.remove();
  activePlayerDragGhost = null;
}

function setPlayerDragImage(event, sourceElement) {
  if (!event.dataTransfer || !sourceElement) return;
  clearPlayerDragImage();
  const rect = sourceElement.getBoundingClientRect();
  const stage = document.createElement("div");
  stage.className = "player-drag-ghost-stage football-pitch";
  stage.style.setProperty("--drag-card-width", `${Math.max(72, rect.width)}px`);
  stage.style.setProperty("--drag-card-height", `${Math.max(96, rect.height)}px`);
  const ghost = sourceElement.cloneNode(true);
  ghost.classList.add("player-drag-ghost");
  ghost.classList.remove(
    "is-selected",
    "is-compatible",
    "is-emergency-compatible",
    "is-ideal-position",
    "is-drop-target",
    "is-drag-source",
  );
  ghost.removeAttribute("id");
  ghost.removeAttribute("draggable");
  stage.append(ghost);
  document.body.append(stage);
  event.dataTransfer.setDragImage(
    ghost,
    Math.round(Math.max(72, rect.width) / 2),
    Math.round(Math.max(96, rect.height) / 2),
  );
  activePlayerDragGhost = stage;
}

function createPointerDragGhost(sourceElement, event) {
  const rect = sourceElement.getBoundingClientRect();
  const ghost = sourceElement.cloneNode(true);
  ghost.classList.add("pointer-player-drag-ghost");
  ghost.classList.remove("is-selected", "is-compatible", "is-emergency-compatible", "is-ideal-position", "is-drop-target", "is-drag-source");
  ghost.removeAttribute("id");
  ghost.removeAttribute("draggable");
  ghost.style.setProperty("--pointer-ghost-width", `${rect.width}px`);
  ghost.style.setProperty("--pointer-ghost-height", `${rect.height}px`);
  document.body.append(ghost);
  ghost.style.setProperty("left", `${event.clientX - (rect.width / 2)}px`, "important");
  ghost.style.setProperty("top", `${event.clientY - (rect.height / 2)}px`, "important");
  return ghost;
}

function updatePointerDropTarget(event) {
  elements.pitch.querySelectorAll(".is-drop-target").forEach((slot) => slot.classList.remove("is-drop-target"));
  elements.collectionList.classList.remove("is-bench-drop-target");
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const slot = target?.closest("[data-slot-id]");
  if (slot) slot.classList.add("is-drop-target");
  else if (target && elements.collectionList.contains(target)) elements.collectionList.classList.add("is-bench-drop-target");
}

function beginPointerPlayerDrag(event, sourceElement, playerId) {
  if (event.button !== 0 || !playerId) return;
  pointerDragSession = {
    playerId,
    sourceElement,
    startX: event.clientX,
    startY: event.clientY,
    dragging: false,
    ghost: null,
  };
}

function finishPointerPlayerDrag(event) {
  const session = pointerDragSession;
  if (!session) return;
  pointerDragSession = null;
  if (!session.dragging) return;
  suppressPlayerClick = true;
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const targetSlot = target?.closest("[data-slot-id]");
  const droppedOnBench = Boolean(target && elements.collectionList.contains(target));
  session.ghost?.remove();
  if (targetSlot) {
    assignSelectedToSlot(targetSlot.dataset.slotId, session.playerId);
  } else if (droppedOnBench) {
    const lineupEntry = Object.entries(state.lineup).find(([, assignedId]) => assignedId === session.playerId);
    if (lineupEntry) {
      const nextLineup = { ...state.lineup };
      delete nextLineup[lineupEntry[0]];
      state.lineup = nextLineup;
      selectedPlayerId = session.playerId;
      persistSave(state);
      render();
      showToast(`${playerById(session.playerId)?.name ?? "Player"} moved to the bench.`);
    }
  }
  clearDragTargets();
  window.setTimeout(() => { suppressPlayerClick = false; }, 0);
}

function cancelPointerPlayerDrag() {
  pointerDragSession?.ghost?.remove();
  pointerDragSession = null;
  if (activeDraggedPlayerId) clearDragTargets();
}

const CLUB_ICON_GLYPHS = Object.freeze({
  shield: "◆",
  star: "★",
  bolt: "ϟ",
  crown: "♛",
});

function clubInitials(name) {
  return String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "XI";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    if (["http:", "https:", "data:"].includes(url.protocol)) return url.href;
  } catch {
    // Fall through to an empty URL.
  }
  return "";
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 3300);
}
async function restorePublishedOpponentsFromGameStorage() {
  try {
    const result = await fetchPublishedNpcOpponentsFromGameStorage();
    if (result.opponents.length) mergePublishedNpcOpponents(result.opponents);
  } catch (error) {
    console.warn("Published NPC opponents remain available from the local backup only.", error);
  }
}

window.addEventListener(PUBLISHED_NPC_EVENT, (event) => {
  const previousOpponents = state.season.opponents ?? [];
  const previousIds = previousOpponents.map((club) => club.id).join("|");
  const previousPresentation = JSON.stringify(previousOpponents.map((club) => ({
    id: club.id,
    icon: club.icon,
    iconImage: club.iconImage,
    iconImageTransform: club.iconImageTransform,
  })));
  const published = event.detail?.opponents ?? loadPublishedNpcOpponents();
  const next = syncSeasonOpponents(state, published);
  const nextIds = (next.season.opponents ?? []).map((club) => club.id).join("|");
  const nextPresentation = JSON.stringify((next.season.opponents ?? []).map((club) => ({
    id: club.id,
    icon: club.icon,
    iconImage: club.iconImage,
    iconImageTransform: club.iconImageTransform,
  })));
  const changed = previousIds !== nextIds || previousPresentation !== nextPresentation;
  state = next;
  if (changed) {
    persistSave(state);
    render();
  }
  showToast(previousIds !== nextIds
    ? "Published opponents added to the current pre-season schedule."
    : changed
      ? "Opponent logo presentation updated."
      : "Published opponent changes will apply when the next season begins.");
});


function showLoading(message) {
  const insideTransferWindow = elements.packDialog.open;
  elements.loadingMessage.textContent = message;
  elements.transferLoadingMessage.textContent = message;
  elements.loadingOverlay.hidden = insideTransferWindow;
  elements.transferLoading.hidden = !insideTransferWindow;
  elements.packDialog.setAttribute("aria-busy", String(insideTransferWindow));
}

function hideLoading() {
  elements.loadingOverlay.hidden = true;
  elements.transferLoading.hidden = true;
  elements.packDialog.removeAttribute("aria-busy");
}

function applyConnectionStatus(status) {
  connectionReady = status.connected;
  elements.apiStatus.classList.toggle("is-online", status.connected);
  elements.apiStatus.classList.toggle("is-offline", !status.connected);
  elements.apiStatus.classList.remove("is-checking");
  elements.apiStatusLabel.textContent = status.label;
  elements.apiStatusDetail.textContent = status.detail;
  elements.setupModeNote.textContent = status.connected
    ? `Connected to ${status.detail}. Scouting costs ${formatMoney(SCOUTING_COST_MILLIONS)} in-game per successful report; failures are free.`
    : `${status.detail}. Player generation is disabled until the AI service is connected.`;
  updateGenerationButtons();
}

function updateGenerationButtons() {
  const affordable = state.finances.balanceMillions >= SCOUTING_COST_MILLIONS;
  elements.generationButtons.forEach((button) => {
    button.disabled = !connectionReady || !affordable;
    button.title = affordable
      ? ""
      : `You need ${formatMoney(SCOUTING_COST_MILLIONS)} to scout a market.`;
  });
}

async function refreshConnectionStatus() {
  applyConnectionStatus(await fetchConnectionStatus());
}

function saveAndRender() {
  if (!persistSave(state)) {
    showToast("Browser storage is full. Sell a few players before continuing.");
  }
  render();
}

function currentFormation() {
  return FORMATIONS[state.formationId];
}

function playerById(playerId) {
  return state.collection.find((player) => player.id === playerId) ??
    state.transferMarket?.players?.find((player) => player.id === playerId);
}

function selectedPlayer() {
  return playerById(selectedPlayerId);
}

function starterIds() {
  return new Set(Object.values(state.lineup));
}

function averageRating(player) {
  if (!player.stats.appearances) return "—";
  return (player.stats.ratingTotal / player.stats.appearances).toFixed(1);
}

function formatMoney(value) {
  return `€${Math.max(0, Math.round(Number(value) || 0))}m`;
}

function hydrateImageFallbacks(container) {
  container.querySelectorAll("img[data-player-id]").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        const player = playerById(image.dataset.playerId);
        if (player) {
          player.portrait.useFallback = true;
          player.portrait.index = -1;
          persistSave(state);
          image.src = fallbackAvatar(player);
        }
      },
      { once: true },
    );
  });
}

async function refreshMissingPortraits() {
  if (portraitRefreshStarted || !state.collection.length) return;
  portraitRefreshStarted = true;
  const forceRetry = Number(localStorage.getItem(PORTRAIT_LOOKUP_VERSION_KEY) || 0) <
    PORTRAIT_LOOKUP_VERSION;

  const cachedPortraits = await fetchCachedPortraitCandidates(state.collection);
  let curatedCount = 0;
  for (const player of state.collection) {
    const candidates = Array.isArray(cachedPortraits[player.id])
      ? cachedPortraits[player.id]
      : [];
    if (candidates.length !== 2) continue;
    const currentSource = player.portrait.candidates?.[0]?.thumbnail || "";
    player.portrait.candidates = candidates;
    player.portrait.index = 0;
    player.portrait.useFallback = false;
    player.portrait.searchedAt = Date.now();
    curatedCount += Number(currentSource !== candidates[0].thumbnail);
  }

  const retryBefore = Date.now() - 24 * 60 * 60 * 1000;
  const missing = state.collection
    .filter((player) =>
      !player.portrait.candidates?.length &&
      (forceRetry || Number(player.portrait.searchedAt || 0) < retryBefore),
    )
    .slice(0, 11);
  let portraitCount = 0;
  if (missing.length) {
    const portraits = await fetchPortraitCandidates(missing);
    const searchedAt = Date.now();
    for (const player of missing) {
      const candidates = Array.isArray(portraits[player.id]) ? portraits[player.id] : [];
      player.portrait.candidates = candidates;
      player.portrait.index = candidates.length ? 0 : -1;
      player.portrait.useFallback = !candidates.length;
      player.portrait.searchedAt = searchedAt;
      portraitCount += Number(candidates.length > 0);
    }
  }
  localStorage.setItem(PORTRAIT_LOOKUP_VERSION_KEY, String(PORTRAIT_LOOKUP_VERSION));

  if (!curatedCount && !missing.length) return;
  persistSave(state);
  render();
  if (curatedCount) {
    showToast(`${curatedCount} cached player portrait${curatedCount === 1 ? "" : "s"} applied.`);
  } else if (portraitCount) {
    showToast(`${portraitCount} licensed player image${portraitCount === 1 ? "" : "s"} found.`);
  }
}

function renderSeasonHeader() {
  const balanceLabel = formatMoney(state.finances.balanceMillions);
  const pointsLabel = `${state.season.points} pts`;
  const hasPlacement = state.collection.length > 0 && state.season.matches.length > 0;
  const placement = hasPlacement
    ? leagueStandings(state).find((club) => club.isUser)?.position ?? null
    : null;
  const placementLabel = placement ? `#${placement}` : "—";
  const clubProfile = normalizeClubProfile(state.clubProfile);
  state.clubProfile = clubProfile;
  const clubIcon = CLUB_ICON_GLYPHS[clubProfile.icon] ?? CLUB_ICON_GLYPHS.shield;
  elements.clubNameNodes.forEach((node) => {
    node.textContent = clubProfile.name;
  });
  elements.clubIconNodes.forEach((node) => {
    node.textContent = clubIcon;
    node.dataset.icon = clubProfile.icon;
  });
  if (elements.matchdayClub) elements.matchdayClub.textContent = clubInitials(clubProfile.name);
  document.querySelectorAll("[data-club-balance]").forEach((node) => {
    node.textContent = balanceLabel;
  });
  document.querySelectorAll("[data-season-points]").forEach((node) => {
    node.textContent = pointsLabel;
  });
  document.querySelectorAll("[data-season-placement]").forEach((node) => {
    node.textContent = placementLabel;
  });
  updateGenerationButtons();
  elements.matchdaySeasonSummary.innerHTML = `
    <span><small>Season</small><strong>${state.season.number}</strong></span>
    <span><small>Week</small><strong>${Math.min(state.season.week + 1, SEASON_LENGTH)} / ${SEASON_LENGTH}</strong></span>
    <span><small>Points</small><strong>${state.season.points}</strong></span>
    <span><small>Balance</small><strong>${formatMoney(state.finances.balanceMillions)}</strong></span>
  `;
  if (elements.seasonBroadcastSummary) {
    const table = state.collection.length ? leagueStandings(state) : [];
    const userRow = table.find((club) => club.isUser);
    const form = userRow ? seasonClubForm(state, USER_CLUB_ID, 5) : [];
    elements.seasonBroadcastSummary.innerHTML = `
      <span><small>Place</small><strong>${userRow ? `${userRow.position}${userRow.position === 1 ? "st" : userRow.position === 2 ? "nd" : userRow.position === 3 ? "rd" : "th"}` : "—"}</strong></span>
      <span><small>Points</small><strong>${state.season.points}</strong></span>
      <span><small>Goal difference</small><strong>${state.season.goalsFor - state.season.goalsAgainst > 0 ? "+" : ""}${state.season.goalsFor - state.season.goalsAgainst}</strong></span>
      <span class="season-broadcast-summary__form"><small>Form</small><b>${form.length ? form.map((entry) => `<i class="is-${entry.result.toLowerCase()}">${entry.result}</i>`).join("") : "—"}</b></span>
    `;
  }
  if (elements.seasonNextOpponentName && state.collection.length) {
    elements.seasonNextOpponentName.textContent = previewOpponent(state).name;
  }

  if (!state.collection.length) {
    elements.topbarPhase.textContent = "World tournament 2026";
    elements.topbarNext.textContent = "Build your world XI";
  } else if (state.season.complete) {
    elements.topbarPhase.textContent = `Season ${state.season.number} complete`;
    elements.topbarNext.textContent = "A new season is ready";
  } else {
    elements.topbarPhase.textContent = `Season ${state.season.number} · Week ${state.season.week + 1}`;
    elements.topbarNext.textContent = `Next: ${previewOpponent(state).name}`;
  }
  const seasonLabel = !state.collection.length
    ? "Pre-season"
    : state.season.complete
      ? `Season ${state.season.number} complete`
      : `Week ${state.season.week + 1} / ${SEASON_LENGTH}`;
  const seasonLabelNode = elements.seasonChip.querySelector("[data-season-label]");
  if (seasonLabelNode) seasonLabelNode.textContent = seasonLabel;

  elements.recordWins.textContent = state.season.wins;
  elements.recordDraws.textContent = state.season.draws;
  elements.recordLosses.textContent = state.season.losses;
  elements.recordGf.textContent = state.season.goalsFor;
  elements.recordGa.textContent = state.season.goalsAgainst;
}

function pitchPlayerMarkup(player, slot) {
  const source = safeUrl(playerImageSource(player));
  const effective = effectiveOverall(player, slot.position);
  const tier = playerCardTier(effective);
  const seasonStats = playerSeasonPerformance(state.season, player.id);
  const rating = averageRating(player);
  const marketValue = marketValueMillions(player, state);
  const positionLabel = slot.position;

  return `
    <span class="pitch-player-rating">
      <strong>${effective}</strong>
      <small>OVR</small>
    </span>
    <span class="pitch-player-position">${escapeHtml(positionLabel)}</span>
    <span class="pitch-player-tier">${escapeHtml(tier.shortLabel)}</span>
    <span class="pitch-player-portrait">
      <span class="pitch-player-poster" aria-hidden="true"></span>
      <img
        class="pitch-player-photo"
        src="${escapeHtml(source)}"
        alt=""
        data-player-id="${escapeHtml(player.id)}"
        draggable="false"
      />
    </span>
    <span class="pitch-player-name">${escapeHtml(player.name)}</span>
    <span class="pitch-player-value">${formatMoney(marketValue)}</span>
    <span class="pitch-player-stats" aria-label="${seasonStats.goals} season goals, ${seasonStats.assists} season assists, ${rating} average rating, market value ${formatMoney(marketValue)}">
      <span><b>${seasonStats.goals}</b><small>G</small></span>
      <span><b>${seasonStats.assists}</b><small>A</small></span>
      <span><b>${rating}</b><small>AVG</small></span>
    </span>
  `;
}

function offRoleColor(penalty) {
  if (penalty <= 2) return "#bd3540";
  if (penalty <= 5) return "#d93442";
  if (penalty <= 10) return "#e92a3b";
  if (penalty <= 16) return "#f52135";
  if (penalty <= 24) return "#ff122b";
  return "#ff001f";
}

function renderPitch() {
  const formation = currentFormation();
  const player = selectedPlayer();
  elements.pitch.classList.toggle("is-position-previewing", Boolean(player));
  const entries = lineupEntries(state.collection, state.lineup, state.formationId);
  const count = entries.length;
  elements.lineupStatus.textContent = count === 11 ? "READY · 11 / 11" : `${count} / 11`;

  if (player) {
    const saleValue = marketValueMillions(player, state);
    // Keep the screen title stable. The selected player already has a dedicated
    // lower-third inspector; mirroring their (potentially very long) generated
    // name into the command bar caused the title to collide with formation and
    // match controls on wide/short desktop viewports.
    elements.selectionHint.textContent = "Tactics board";
    elements.selectedPlayerSellButton.hidden = false;
    elements.selectedPlayerSellButton.textContent = `Sell ${player.name} · ${formatMoney(saleValue)}`;
  } else {
    elements.selectionHint.textContent = "Tactics board";
    elements.selectedPlayerSellButton.hidden = true;
    elements.selectedPlayerSellButton.textContent = "Sell selected player";
  }

  elements.pitch.innerHTML = formation.slots
    .map((slot) => {
      const perspectiveScale = 0.72 + Math.min(90, Math.max(10, slot.y)) * 0.0028;
      const projectedX = 50 + (slot.x - 50) * perspectiveScale;
      const projectedY = Math.min(87, Math.max(13, slot.y));
      const slotPlayer = playerById(state.lineup[slot.id]);
      const slotCategory = positionCategory(slotPlayer?.position ?? slot.position);
      const slotStats = slotPlayer
        ? playerSeasonPerformance(state.season, slotPlayer.id)
        : null;
      const selectedPenalty = player
        ? compatibilityPenalty(player.position, slot.position)
        : Number.POSITIVE_INFINITY;
      const compatible = Boolean(player && selectedPenalty <= 5);
      const emergencyCompatible = Boolean(player && selectedPenalty > 5);
      const isIdealPosition = Boolean(player && player.position === slot.position);
      const isSelected = slotPlayer?.id === selectedPlayerId;
      const rolePenalty = slotPlayer
        ? compatibilityPenalty(slotPlayer.position, slot.position)
        : 0;
      const isOffRole = rolePenalty > 0;
      const tier = slotPlayer ? playerCardTier(effectiveOverall(slotPlayer, slot.position)) : null;
      const classes = [
        "pitch-slot",
        slotPlayer ? "" : "is-empty",
        tier?.className ?? "",
        compatible ? "is-compatible" : "",
        emergencyCompatible ? "is-emergency-compatible" : "",
        isIdealPosition ? "is-ideal-position" : "",
        isSelected ? "is-selected" : "",
        isOffRole ? "is-off-role" : "",
      ].filter(Boolean).join(" ");

      return `
        <button
          class="${classes}"
          type="button"
          style="--x:${projectedX.toFixed(2)}%;--y:${projectedY}%;--role-penalty:${rolePenalty};--off-role-color:${offRoleColor(rolePenalty)}"
          data-slot-id="${escapeHtml(slot.id)}"
          data-slot-position="${escapeHtml(slot.position)}"
          data-player-id="${escapeHtml(slotPlayer?.id ?? "")}"
          data-card-tier="${escapeHtml(tier?.id ?? "")}"
          data-position-category="${slotCategory}"
          draggable="false"
          aria-label="${
            slotPlayer
              ? `${escapeHtml(slot.position)}: ${escapeHtml(slotPlayer.name)}, effective overall ${effectiveOverall(slotPlayer, slot.position)}, ${tier.label} card, ${slotStats.goals} goals, ${slotStats.assists} assists, ${averageRating(slotPlayer)} average rating`
              : `Empty ${escapeHtml(slot.position)} slot`
          }"
        >
          ${
            slotPlayer
              ? pitchPlayerMarkup(slotPlayer, slot)
              : `<span class="pitch-slot__empty-position">${escapeHtml(slot.position)}</span>
                 <span class="pitch-slot__empty-action">empty slot</span>`
          }
        </button>
      `;
    })
    .join("");

  hydrateImageFallbacks(elements.pitch);
}

function matchesPlayerFilters(player) {
  const query = normalizeName(elements.playerSearch.value);
  const category = elements.positionFilter.value;
  const text = normalizeName(`${player.name} ${player.theme} ${player.position}`);
  if (query && !text.includes(query)) return false;
  if (category && positionCategory(player.position) !== category) return false;
  return true;
}

function collectionPlayerMarkup(player) {
  const selected = selectedPlayerId === player.id;
  const starting = starterIds().has(player.id);
  const tier = playerCardTier(player.overall);
  const seasonStats = playerSeasonPerformance(state.season, player.id);
  const careerSaves = Number(player.stats.saves) || 0;
  const careerTackles = Number(player.stats.tackles) || 0;
  const hasCandidates = Boolean(player.portrait.candidates?.length);
  const portraitLabel = player.portrait.useFallback
    ? hasCandidates ? "Use photo" : "No photo found"
    : "Next photo";
  const marketValue = marketValueMillions(player, state);
  const category = positionCategory(player.position);
  const roleMetric = category === "GK"
    ? [seasonStats.saves, "SV"]
    : category === "DEF"
      ? [seasonStats.tackles, "TK"]
      : [seasonStats.appearances, "APP"];
  const seasonMetrics = [
    [seasonStats.goals, "G"],
    [seasonStats.assists, "A"],
    roleMetric,
    [averageRating(player), "AVG"],
  ]
    .map(([value, label]) => `
      <span class="squad-card__stat"><b>${value}</b><small>${label}</small></span>
    `).join("");

  return `
    <article
      class="collection-player squad-card ${tier.className}${selected ? " is-selected" : ""}${starting ? " is-starting" : ""}"
      data-player-id="${escapeHtml(player.id)}"
      data-membership="${starting ? "starting" : "bench"}"
      data-position-category="${category}"
      data-card-tier="${tier.id}"
      draggable="false"
    >
      <button
        class="squad-card__select"
        type="button"
        aria-pressed="${selected}"
        aria-label="Select ${escapeHtml(player.name)}, ${escapeHtml(player.position)}, overall ${player.overall}, ${escapeHtml(tier.label)} card, ${seasonStats.goals} season goals, ${seasonStats.assists} season assists, market value ${formatMoney(marketValue)}."
      >
        <span class="squad-card__visual">
          <span class="squad-card__poster" aria-hidden="true"></span>
          <img
            class="squad-card__photo"
            src="${escapeHtml(safeUrl(playerImageSource(player)))}"
            alt=""
            data-player-id="${escapeHtml(player.id)}"
            draggable="false"
          />
        </span>
        <span class="squad-card__identity">
          <span class="squad-card__name">${escapeHtml(player.name)}</span>
          <span class="squad-card__tier">${escapeHtml(tier.label)}</span>
          ${starting ? '<span class="squad-card__starter">Starting XI</span>' : ""}
          <span class="squad-card__value"><small>Market</small><strong>${formatMoney(marketValue)}</strong></span>
          <span class="squad-card__stats">${seasonMetrics}</span>
        </span>
        <span class="squad-card__rating">
          <strong>${player.overall}</strong>
          <small>${escapeHtml(player.position)}</small>
        </span>
      </button>
      <details class="player-actions squad-card__actions">
        <summary aria-label="Actions for ${escapeHtml(player.name)}">•••</summary>
        <div class="player-actions__panel">
          <p><b>Career</b> ${player.stats.goals} G · ${player.stats.assists} A · ${careerSaves} Sv · ${careerTackles} Tk</p>
          <button class="mini-button" type="button" data-action="cycle-portrait" data-player-id="${escapeHtml(player.id)}" ${hasCandidates ? "" : "disabled"}>${portraitLabel}</button>
          <button class="mini-button" type="button" data-action="use-avatar" data-player-id="${escapeHtml(player.id)}" ${player.portrait.useFallback ? "disabled" : ""}>Use avatar</button>
          <button class="mini-button mini-button--sale" type="button" data-action="sell" data-player-id="${escapeHtml(player.id)}">Sell ${formatMoney(marketValue)}</button>
        </div>
      </details>
    </article>
  `;
}

function renderCollection() {
  const sortMode = elements.playerSort.value;
  const comparePlayers = (left, right) => {
    if (sortMode === "name") return left.name.localeCompare(right.name);
    if (sortMode === "position") {
      return left.position.localeCompare(right.position) ||
        right.overall - left.overall;
    }
    if (sortMode === "overall") {
      return right.overall - left.overall ||
        left.name.localeCompare(right.name);
    }
    return marketValueMillions(right, state) -
      marketValueMillions(left, state) ||
      right.overall - left.overall ||
      left.name.localeCompare(right.name);
  };
  const starters = starterIds();
  const benchPlayers = state.collection.filter((player) => !starters.has(player.id));
  const visiblePlayers = benchPlayers
    .filter(matchesPlayerFilters)
    .sort(comparePlayers);
  elements.collectionTitle.textContent = `Bench · ${benchPlayers.length} players`;
  elements.collectionList.innerHTML = benchPlayers.length
    ? `<div class="squad-table-heading"><span>Player</span><span>Form</span><span>OVR</span></div><div class="squad-grid">${visiblePlayers.map((player) => collectionPlayerMarkup(player)).join("")}</div>`
    : `<p class="collection-empty">Every available player is in the starting XI. Drag a player off the pitch or sign a transfer to add bench options.</p>`;
  hydrateImageFallbacks(elements.collectionList);
}

function renderSelectedPlayerInspector() {
  if (!elements.selectedPlayerInspector) return;
  const player = selectedPlayer() ?? state.collection.find((candidate) => starterIds().has(candidate.id)) ?? state.collection[0];
  if (!player) {
    elements.selectedPlayerInspector.hidden = true;
    return;
  }
  const seasonStats = playerSeasonPerformance(state.season, player.id);
  const marketValue = marketValueMillions(player, state);
  const role = positionCategory(player.position);
  const roleValue = role === "GK" ? seasonStats.saves : role === "DEF" ? seasonStats.tackles : seasonStats.appearances;
  const roleLabel = role === "GK" ? "SV" : role === "DEF" ? "TK" : "APP";
  elements.selectedPlayerInspector.hidden = false;
  elements.selectedPlayerInspector.innerHTML = `
    <span class="selected-player-inspector__portrait"><img src="${escapeHtml(safeUrl(playerImageSource(player)))}" data-player-id="${escapeHtml(player.id)}" alt="" /></span>
    <span class="selected-player-inspector__identity"><small>Selected player</small><strong>${escapeHtml(player.name)}</strong><b>${escapeHtml(player.position)} · ${player.overall} OVR</b></span>
    <span class="selected-player-inspector__stat"><strong>${seasonStats.goals}</strong><small>Goals</small></span>
    <span class="selected-player-inspector__stat"><strong>${seasonStats.assists}</strong><small>Assists</small></span>
    <span class="selected-player-inspector__stat"><strong>${roleValue}</strong><small>${roleLabel}</small></span>
    <span class="selected-player-inspector__stat"><strong>${averageRating(player)}</strong><small>Avg</small></span>
    <span class="selected-player-inspector__value"><small>Market value</small><strong>${formatMoney(marketValue)}</strong></span>
    <span class="selected-player-inspector__action">Player overview <span aria-hidden="true">›</span></span>
  `;
  hydrateImageFallbacks(elements.selectedPlayerInspector);
}

function renderMarketButton() {
  const players = state.transferMarket?.players ?? [];
  elements.transferCounts.forEach((count) => {
    count.textContent = players.length;
  });
}

function seasonClubIconMarkup(icon, transform = {}) {
  const source = safeUrl(icon);
  if (source) {
    const scale = Math.max(0.5, Math.min(2.5, Number(transform?.scale) || 1));
    const x = Math.max(-100, Math.min(100, Number(transform?.x) || 0)) * 0.35;
    const y = Math.max(-100, Math.min(100, Number(transform?.y) || 0)) * 0.35;
    return '<img src="' + escapeHtml(source) + '" alt="" style="transform:translate(' + x + 'px,' + y + 'px) scale(' + scale + ');" />';
  }
  const key = String(icon || "shield");
  const glyph = CLUB_ICON_GLYPHS[key] ?? (key.slice(0, 2) || "◆");
  return '<span data-icon="' + escapeHtml(key) + '">' + escapeHtml(glyph) + '</span>';
}

function seasonFormMarkup(clubId) {
  const form = seasonClubForm(state, clubId, 5);
  const circles = Array.from({ length: 5 }, (_, index) => {
    const result = form[index]?.result;
    const label = result ? (result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw') + ' · week ' + form[index].week : 'No result';
    return '<span class="league-form-dot' + (result ? ' is-' + result.toLowerCase() : ' is-empty') + '" title="' + label + '" aria-label="' + label + '">' + (result || '·') + '</span>';
  }).join('');
  return '<span class="league-form" aria-label="Last five results">' + circles + '</span>';
}

function renderLeagueTable() {
  const standings = leagueStandings(state);
  const roundLabel = state.season.week
    ? 'After week ' + state.season.week
    : "Pre-season";
  elements.leagueRound.textContent = roundLabel + ' · ' + standings.length + ' clubs';
  elements.leagueTableBody.innerHTML = standings.map((club) => {
    const goalDifference = club.goalDifference > 0
      ? '+' + club.goalDifference
      : String(club.goalDifference);
    const snapshot = state.season.opponents?.find((opponent) => opponent.id === club.id);
    const icon = club.isUser ? normalizeClubProfile(state.clubProfile).icon : (snapshot?.iconImage || snapshot?.icon);
    const iconTransform = club.isUser ? {} : snapshot?.iconImageTransform;
    const clubContent =
      '<span class="league-club-icon" aria-hidden="true">' + seasonClubIconMarkup(icon, iconTransform) + '</span>' +
      '<span class="league-club-copy"><strong>' + escapeHtml(club.name) + '</strong>' +
      (club.isUser ? '<small>You</small>' : '<small>Scout opponent</small>') + '</span>';
    const clubCell = !club.isUser && snapshot
      ? '<button class="league-club-scout ' + (selectedSeasonOpponentId === club.id ? 'is-selected' : '') + '" type="button" data-season-opponent-id="' + escapeHtml(club.id) + '" aria-label="Preview ' + escapeHtml(club.name) + '">' + clubContent + '</button>'
      : '<span class="league-club-static">' + clubContent + '</span>';
    return '<tr class="' + (club.isUser ? 'is-user' : '') + '">' +
      '<td class="league-position">' + club.position + '</td>' +
      '<th scope="row">' + clubCell + '</th>' +
      '<td class="league-form-cell">' + seasonFormMarkup(club.id) + '</td>' +
      '<td>' + club.played + '</td><td>' + club.wins + '</td><td>' + club.draws + '</td>' +
      '<td>' + club.losses + '</td><td>' + goalDifference + '</td><td><strong>' + club.points + '</strong></td>' +
      '</tr>';
  }).join("");

  const selectedOpponent = selectedSeasonOpponentId
    ? previewSeasonOpponent(state, selectedSeasonOpponentId)
    : null;
  renderSeasonOpponentPreview(selectedOpponent);
  renderSeasonRecentFixtures();
}

function renderSeasonOpponentPreview(opponent) {
  if (!opponent) {
    elements.seasonOpponentPreview.hidden = false;
    elements.seasonOpponentPreviewIcon.textContent = "?";
    elements.seasonOpponentPreviewName.textContent = "Select an opponent";
    elements.seasonOpponentPreviewMeta.textContent = "Click a club row to scout its XI";
    elements.seasonOpponentPreviewRating.textContent = "—";
    elements.seasonOpponentPreviewAttack.textContent = "—";
    elements.seasonOpponentPreviewControl.textContent = "—";
    elements.seasonOpponentPreviewDefence.textContent = "—";
    elements.seasonOpponentPreviewPitch.innerHTML = '<p class="season-opponent-preview__empty">Choose any opponent in the league table to inspect their formation, projected XI, OVR, and unit ratings.</p>';
    return;
  }
  const formation = FORMATIONS[opponent.formationId] ?? FORMATIONS["4-4-2"];
  const rosterBySlot = new Map(opponent.roster.map((player) => [player.slotId, player]));
  elements.seasonOpponentPreview.hidden = false;
  elements.seasonOpponentPreviewIcon.innerHTML = opponentIconMarkup(opponent.icon, opponent.iconImageTransform);
  elements.seasonOpponentPreviewName.textContent = opponent.name;
  elements.seasonOpponentPreviewMeta.textContent = formation.label + ' · ' + (opponent.isPublished ? 'Published NPC' : 'Generated opponent');
  elements.seasonOpponentPreviewRating.textContent = Math.round(opponent.strength);
  elements.seasonOpponentPreviewAttack.textContent = Math.round(opponent.attack);
  elements.seasonOpponentPreviewControl.textContent = Math.round(opponent.control);
  elements.seasonOpponentPreviewDefence.textContent = Math.round(opponent.defence);
  elements.seasonOpponentPreviewPitch.dataset.formation = formation.label;
  elements.seasonOpponentPreviewPitch.innerHTML = formation.slots.map((slot, index) => {
    const player = rosterBySlot.get(slot.id) ?? opponent.roster[index];
    if (!player) return "";
    return '<article class="opponent-preview-player" style="--x:' + slot.x + '%;--y:' + slot.y + '%;--order:' + index + '">' +
      '<span><img src="' + escapeHtml(safeUrl(playerImageSource(player))) + '" alt="" data-season-opponent-player-id="' + escapeHtml(player.id) + '" />' +
      '<strong>' + Math.round(player.overall) + '</strong></span><b>' + escapeHtml(player.name) + '</b><small>' + escapeHtml(slot.position) + '</small></article>';
  }).join("");
  elements.seasonOpponentPreviewPitch.querySelectorAll("img[data-season-opponent-player-id]").forEach((image) => {
    image.addEventListener("error", () => {
      const player = opponent.roster.find((candidate) => candidate.id === image.dataset.seasonOpponentPlayerId);
      if (player) image.src = fallbackAvatar(player);
    }, { once: true });
  });
}

function renderSeasonRecentFixtures() {
  const fixtures = seasonRecentFixtures(state, 12);
  if (!fixtures.length) {
    elements.seasonRecentFixtures.innerHTML = '<li class="season-fixture-empty">No completed league fixtures yet.</li>';
    return;
  }
  const iconForClub = (id, name) => {
    if (id === USER_CLUB_ID) return { icon: normalizeClubProfile(state.clubProfile).icon, transform: {} };
    const snapshot = state.season.opponents?.find((club) => club.id === id);
    return { icon: snapshot?.iconImage || snapshot?.icon || clubInitials(name), transform: snapshot?.iconImageTransform };
  };
  elements.seasonRecentFixtures.innerHTML = fixtures.map((fixture) => {
    const homeIcon = iconForClub(fixture.homeId, fixture.homeName);
    const awayIcon = iconForClub(fixture.awayId, fixture.awayName);
    return '<li class="season-fixture-item">' +
      '<span class="season-fixture-week">W' + fixture.week + '</span>' +
      '<span class="season-fixture-team season-fixture-team--home"><span class="season-fixture-icon">' + seasonClubIconMarkup(homeIcon.icon, homeIcon.transform) + '</span><strong>' + escapeHtml(fixture.homeName) + '</strong></span>' +
      '<strong class="season-fixture-score">' + fixture.homeGoals + '–' + fixture.awayGoals + '</strong>' +
      '<span class="season-fixture-team season-fixture-team--away"><span class="season-fixture-icon">' + seasonClubIconMarkup(awayIcon.icon, awayIcon.transform) + '</span><strong>' + escapeHtml(fixture.awayName) + '</strong></span>' +
      '</li>';
  }).join('');
}

function renderFixtures() {
  elements.fixtureList.innerHTML = Array.from({ length: SEASON_LENGTH }, (_, index) => {
    const match = state.season.matches[index];
    if (!match) {
      const opponent = previewOpponent(state, index + 1);
      return `
        <li class="fixture-item is-future">
          <span class="fixture-item__week">Week ${index + 1}</span>
          <strong class="fixture-item__score">—</strong>
          <span class="fixture-item__opponent">${escapeHtml(opponent.name)}</span>
        </li>
      `;
    }

    const outcome = match.userGoals > match.opponentGoals
      ? "W"
      : match.userGoals === match.opponentGoals ? "D" : "L";
    return `
      <li class="fixture-item">
        <span class="fixture-item__week">Week ${index + 1} / ${outcome}</span>
        <strong class="fixture-item__score">${match.userGoals}–${match.opponentGoals}</strong>
        <span class="fixture-item__opponent">${escapeHtml(match.opponent)}</span>
      </li>
    `;
  }).join("");
}

function opponentIconMarkup(icon, transform = {}) {
  const source = safeUrl(icon);
  if (!source) return escapeHtml(String(icon || "◆").slice(0, 3));
  const scale = Math.max(0.5, Math.min(2.5, Number(transform?.scale) || 1));
  const x = Math.max(-100, Math.min(100, Number(transform?.x) || 0)) * 0.35;
  const y = Math.max(-100, Math.min(100, Number(transform?.y) || 0)) * 0.35;
  return `<img src="${escapeHtml(source)}" alt="" style="transform:translate(${x}px,${y}px) scale(${scale});" />`;
}

function renderOpponentPreview(opponent) {
  const formation = FORMATIONS[opponent.formationId] ?? FORMATIONS["4-4-2"];
  const rosterBySlot = new Map(opponent.roster.map((player) => [player.slotId, player]));
  elements.opponentPreview.hidden = false;
  elements.opponentPreviewIcon.innerHTML = opponentIconMarkup(opponent.icon, opponent.iconImageTransform);
  elements.opponentPreviewName.textContent = opponent.name;
  elements.opponentPreviewMeta.textContent = `${formation.label} · ${opponent.isPublished ? "Published NPC" : opponent.theme}`;
  elements.opponentPreviewRating.textContent = Math.round(opponent.strength);
  elements.opponentPreviewAttack.textContent = Math.round(opponent.attack);
  elements.opponentPreviewControl.textContent = Math.round(opponent.control);
  elements.opponentPreviewDefence.textContent = Math.round(opponent.defence);
  elements.opponentPreviewPitch.dataset.formation = formation.label;
  elements.opponentPreviewPitch.innerHTML = formation.slots.map((slot, index) => {
    const player = rosterBySlot.get(slot.id) ?? opponent.roster[index];
    if (!player) return "";
    return `
      <article class="opponent-preview-player" style="--x:${slot.x}%;--y:${slot.y}%;--order:${index}">
        <span><img src="${escapeHtml(safeUrl(playerImageSource(player)))}" alt="" data-opponent-player-id="${escapeHtml(player.id)}" />
          <strong>${Math.round(player.overall)}</strong></span>
        <b>${escapeHtml(player.name)}</b><small>${escapeHtml(slot.position)}</small>
      </article>
    `;
  }).join("");
  elements.opponentPreviewPitch.querySelectorAll("img[data-opponent-player-id]").forEach((image) => {
    image.addEventListener("error", () => {
      const player = opponent.roster.find((candidate) => candidate.id === image.dataset.opponentPlayerId);
      if (player) image.src = fallbackAvatar(player);
    }, { once: true });
  });
}

function renderMatchday() {
  const complete = isLineupComplete(state.collection, state.lineup, state.formationId);
  elements.openMatchdayButton.disabled = false;
  elements.openMatchdayButton.dataset.ready = String(state.season.complete || complete);
  elements.openMatchdayButton.innerHTML = state.season.complete
    ? 'Season complete <span aria-hidden="true">↻</span>'
    : 'Play match <span aria-hidden="true">▶</span>';

  if (state.season.complete) {
    elements.opponentPreview.hidden = true;
    const award = seasonAward(state.season.points);
    elements.fixtureWeek.textContent = `Season ${state.season.number} complete`;
    elements.nextOpponent.textContent = `${award.label}: ${state.season.points} points.`;
    elements.matchHelp.textContent = "Keep your collection and begin a fresh six-match season.";
    elements.simulateButton.disabled = false;
    elements.simulateButton.innerHTML = `Start next season <span aria-hidden="true">↻</span>`;
    return;
  }

  const opponent = previewOpponent(state);
  renderOpponentPreview(opponent);
  elements.fixtureWeek.textContent = `Week ${state.season.week + 1} of ${SEASON_LENGTH}`;
  elements.nextOpponent.textContent = `${opponent.name} · projected ${opponent.strength} OVR`;
  elements.simulateButton.disabled = !complete;
  elements.simulateButton.innerHTML = `Simulate match <span aria-hidden="true">▶</span>`;
  elements.matchHelp.textContent = complete
    ? `${currentFormation().label} confirmed. The tunnel is open.`
    : `Complete your starting XI to play (${lineupEntries(
      state.collection,
      state.lineup,
      state.formationId,
    ).length}/11).`;
}

function statsPlayerIconMarkup(record, extraClass = "") {
  const player = state.collection.find((candidate) => candidate.id === record.id) ?? { ...record, theme: record.theme ?? record.club ?? "Stats", position: record.position ?? "CM" };
  const fallback = fallbackAvatar(player);
  const source = safeUrl(playerImageSource(player)) || fallback;
  return `<span class="stats-player-icon ${extraClass}" aria-label="${escapeHtml(player.name)}"><span class="stats-player-icon__initials" aria-hidden="true">${escapeHtml(playerInitials(player.name))}</span><img src="${escapeHtml(source)}" data-fallback="${escapeHtml(fallback)}" alt="" /></span>`;
}

function statsLeaderboardMarkup(records, metric) {
  const metricLabel = metric === "assists" ? "A" : "G";
  const secondaryMetric = metric === "assists" ? "goals" : "assists";
  const secondaryLabel = metric === "assists" ? "G" : "A";
  if (!records.length) return `<li class="stats-leaderboard__empty">No ${metric} recorded yet.</li>`;
  return records.slice(0, 7).map((record, index) => `
    <li><span class="stats-leaderboard__rank">${String(index + 1).padStart(2, "0")}</span>${statsPlayerIconMarkup(record)}<span class="stats-leaderboard__player"><strong>${escapeHtml(record.name)}</strong><small>${escapeHtml(record.club)} · ${Number(record[secondaryMetric]) || 0} ${secondaryLabel}</small></span><strong class="stats-leaderboard__value">${Number(record[metric]) || 0}<small>${metricLabel}</small></strong></li>
  `).join("");
}

function statsFeatureMarkup(records, metric) {
  const leaders = records.slice(0, 3);
  if (!leaders.length) return `<p class="stats-feature__empty">Play a match to open the leader race.</p>`;
  const ordered = leaders.length === 3 ? [leaders[1], leaders[0], leaders[2]] : leaders;
  return `<header><span>Golden ${metric === "assists" ? "playmaker" : "boot"} race</span><small>This season · all clubs</small></header><div class="stats-feature__podium">${ordered.map((record) => {
    const rank = leaders.indexOf(record) + 1;
    return `<article class="stats-feature__player is-rank-${rank}"><span class="stats-feature__rank">${rank}</span>${statsPlayerIconMarkup(record, "stats-feature__portrait")}<div><strong>${escapeHtml(record.name)}</strong><small>${escapeHtml(record.club)}</small><b>${Number(record[metric]) || 0} ${metric === "assists" ? "assists" : "goals"}</b></div></article>`;
  }).join("")}</div>`;
}

function ballonDorRaceMarkup() {
  const race = currentBallonDorRace(state);
  if (!race.length) return `<p class="stats-empty-copy">Play matches to build the shortlist.</p>`;
  return race.slice(0, 5).map((player, index) => `<article class="ballon-race-entry"><span class="ballon-race-entry__rank">${index + 1}</span>${statsPlayerIconMarkup(player)}<div class="ballon-race-entry__copy"><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(player.club ?? "Club")} · ${player.goalContributions} G+A · #${player.teamPosition} (+ ${player.standingBonus})</small><span class="ballon-race-entry__bar"><i style="width:${player.percentage}%"></i></span></div><b>${player.percentage}%</b></article>`).join("");
}

function ballonDorAllTimeMarkup() {
  const winners = ballonDorAllTime(state);
  if (!winners.length) return `<p class="stats-empty-copy">No Ballon d’Or winners yet.</p>`;
  return winners.slice(0, 5).map((player, index) => `<article class="ballon-winner-entry"><span class="ballon-winner-entry__rank">${String(index + 1).padStart(2, "0")}</span>${statsPlayerIconMarkup(player)}<span><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(player.club ?? "Club")}</small></span><b>${player.wins}×</b></article>`).join("");
}

function renderSeasonHistory() {
  if (!elements.seasonHistoryList) return;
  const history = Array.isArray(state.seasonHistory) ? [...state.seasonHistory].reverse() : [];
  elements.seasonHistoryList.innerHTML = history.length ? history.map((entry) => { const winner = entry.winner; return `<li class="season-history-item"><span class="season-history-item__season">S${entry.number}</span>${winner ? statsPlayerIconMarkup(winner) : ""}<span><strong>${escapeHtml(winner?.name ?? "No winner")}</strong><small>${escapeHtml(entry.clubName ?? "Club season")} · ${entry.finalPosition ?? "—"} place</small></span><b>Ballon d’Or</b></li>`; }).join("") : `<li class="stats-empty-copy">Complete a season to build your archive.</li>`;
}

function renderStatsWindow() {
  const isBallon = selectedStatsMetric === "ballon";
  const metric = selectedStatsMetric === "assists" ? "assists" : "goals";
  const boards = statisticLeaderboards(state, metric);
  elements.statsMetricButtons.forEach((button) => {
    const active = button.dataset.statsMetric === selectedStatsMetric;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  elements.statsLeaderboardGrid.hidden = isBallon;
  elements.statsFeature.hidden = isBallon;
  elements.statsBallonView.hidden = !isBallon;
  if (isBallon) {
    elements.statsBallonRace.innerHTML = ballonDorRaceMarkup();
    elements.statsBallonAllTime.innerHTML = ballonDorAllTimeMarkup();
    return;
  }
  elements.statsSeasonClub.innerHTML = statsLeaderboardMarkup(boards.seasonClub, metric);
  elements.statsSeasonAll.innerHTML = statsLeaderboardMarkup(boards.seasonAllClubs, metric);
  elements.statsAllTimeClub.innerHTML = statsLeaderboardMarkup(boards.allTimeClub, metric);
  elements.statsAllTimeAll.innerHTML = statsLeaderboardMarkup(boards.allTimeAllClubs, metric);
  elements.statsFeature.innerHTML = statsFeatureMarkup(boards.seasonAllClubs, metric);
  const clubSeason = state.collection.map((player) => playerSeasonPerformance(state.season, player.id));
  const seasonGoals = clubSeason.reduce((sum, record) => sum + (Number(record.goals) || 0), 0);
  const seasonAssists = clubSeason.reduce((sum, record) => sum + (Number(record.assists) || 0), 0);
  if (elements.statsSeasonSnapshot) {
    const matches = state.season.matches.length;
    const goalsPerMatch = matches ? (seasonGoals / matches).toFixed(1) : "0.0";
    elements.statsSeasonSnapshot.innerHTML = `<header>Season snapshot</header><div><span><strong>${seasonGoals}</strong><small>Goals</small></span><span><strong>${seasonAssists}</strong><small>Assists</small></span><span><strong>${matches}</strong><small>Matches</small></span><span><strong>${goalsPerMatch}</strong><small>Goals / match</small></span></div>`;
  }
  if (elements.statsRecordStrip) {
    const allTimeLeader = boards.allTimeClub[0];
    elements.statsRecordStrip.innerHTML = `<span>All-time record</span><strong>${Number(allTimeLeader?.[metric]) || 0}</strong><small>${metric}</small><b>${escapeHtml(allTimeLeader?.name || "No record yet")}</b><button type="button" data-stats-metric="ballon">View Ballon dâ€™Or race <span aria-hidden="true">›</span></button>`;
  }
  hydrateImageFallbacks(elements.statsFeature);
}

function renderCredits() {
  const creditedPlayers = state.collection.filter((player) => selectedPortrait(player));
  elements.creditsList.innerHTML = creditedPlayers.length
    ? creditedPlayers.map((player) => {
      const portrait = selectedPortrait(player);
      return `
        <li>
          <strong>${escapeHtml(player.name)}</strong><br />
          “${escapeHtml(portrait.title || "Untitled")}” by
          ${portrait.creatorUrl
            ? `<a href="${escapeHtml(safeUrl(portrait.creatorUrl))}" target="_blank" rel="noreferrer">${escapeHtml(portrait.creator || "Unknown creator")}</a>`
            : escapeHtml(portrait.creator || "Unknown creator")}
          · <a href="${escapeHtml(safeUrl(portrait.licenseUrl || portrait.sourceUrl))}" target="_blank" rel="noreferrer">${escapeHtml(portrait.license || "Open license")}</a>
          · <a href="${escapeHtml(safeUrl(portrait.sourceUrl))}" target="_blank" rel="noreferrer">source</a>
        </li>
      `;
    }).join("")
    : "<li>No external portraits are currently in use. Every visible player uses a local avatar.</li>";
}

function render() {
  const hasManager = state.collection.length > 0 ||
    (state.transferMarket?.players?.length ?? 0) > 0;
  elements.setupScreen.hidden = hasManager;
  elements.managerScreen.hidden = !hasManager;
  if (!connectionReady) elements.setupModeNote.textContent = modeDescription();
  renderSeasonHeader();

  if (!hasManager) {
    mountTurnstile("setup-turnstile").catch((error) => {
      elements.setupError.textContent = error.message;
    });
    return;
  }

  elements.formationSelect.value = state.formationId;
  if (elements.formationPickerValue) elements.formationPickerValue.textContent = state.formationId;
  elements.formationPickerMenu?.querySelectorAll("[data-formation-choice]").forEach((choice) => {
    const active = choice.dataset.formationChoice === state.formationId;
    choice.classList.toggle("is-active", active);
    choice.setAttribute("aria-selected", String(active));
  });
  renderPitch();
  renderCollection();
  renderSelectedPlayerInspector();
  renderMarketButton();
  renderLeagueTable();
  renderFixtures();
  renderMatchday();
  renderStatsWindow();
  renderCredits();
}

function setSelectedPlayer(playerId) {
  selectedPlayerId = selectedPlayerId === playerId ? null : playerId;
  renderPitch();
  renderCollection();
  renderSelectedPlayerInspector();
}

function assignSelectedToSlot(slotId, draggedPlayerId = null) {
  const player = playerById(draggedPlayerId ?? selectedPlayerId);
  if (!player) {
    const existingId = state.lineup[slotId];
    if (existingId) setSelectedPlayer(existingId);
    else showToast("Select a squad player first.");
    return;
  }

  const result = assignPlayerToSlot(
    state.lineup,
    state.formationId,
    player,
    slotId,
    state.collection,
  );

  if (!result.changed) {
    if (result.reason === "swap-incompatible") {
      showToast("Those players cannot exchange roles without leaving the XI.");
    } else if (result.reason !== "already-assigned") {
      showToast(`${player.position} cannot play in that role.`);
    }
    return;
  }

  state.lineup = result.lineup;
  state.collection = reconcileLineupPlayerPositions(
    state.collection,
    state.lineup,
    state.formationId,
  );
  selectedPlayerId = null;
  saveAndRender();
}

function showDragTargets(playerId) {
  const player = playerById(playerId);
  if (!player) return;
  const slots = new Map(currentFormation().slots.map((slot) => [slot.id, slot]));
  elements.pitch.querySelectorAll("[data-slot-id]").forEach((slotElement) => {
    const slot = slots.get(slotElement.dataset.slotId);
    const penalty = slot
      ? compatibilityPenalty(player.position, slot.position)
      : Number.POSITIVE_INFINITY;
    slotElement.classList.toggle("is-compatible", penalty <= 5);
    slotElement.classList.toggle(
      "is-emergency-compatible",
      penalty > 5 && Number.isFinite(penalty),
    );
    slotElement.classList.toggle(
      "is-ideal-position",
      Boolean(slot && player.position === slot.position),
    );
    slotElement.classList.toggle("is-drag-source", slotElement.dataset.playerId === playerId);
  });
  elements.pitch.classList.add("is-dragging-player");
  elements.pitch.dataset.draggedPlayerId = playerId;
}

function clearDragTargets() {
  clearPlayerDragImage();
  activeDraggedPlayerId = null;
  elements.pitch.classList.remove("is-dragging-player");
  delete elements.pitch.dataset.draggedPlayerId;
  elements.pitch.querySelectorAll(".is-drop-target, .is-drag-source, .is-emergency-compatible").forEach((candidate) => {
    candidate.classList.remove("is-drop-target", "is-drag-source", "is-emergency-compatible");
  });
  elements.collectionList.classList.remove("is-bench-drop-target");
  renderPitch();
}

function cyclePortrait(player) {
  const candidates = player.portrait.candidates ?? [];
  if (!candidates.length) {
    showToast("No confident open-image match was found for this player.");
    return;
  }

  if (player.portrait.useFallback) {
    player.portrait.useFallback = false;
    player.portrait.index = 0;
  } else if (player.portrait.index < candidates.length - 1) {
    player.portrait.index += 1;
  } else {
    player.portrait.useFallback = true;
    player.portrait.index = -1;
  }
  saveAndRender();
}

function sellSquadPlayer(player) {
  const valueMillions = marketValueMillions(player, state);
  pendingSalePlayerId = player.id;
  elements.sellDialogPlayer.dataset.positionCategory = positionCategory(player.position);
  elements.sellPlayerPhoto.src = safeUrl(playerImageSource(player));
  elements.sellPlayerPhoto.dataset.playerId = player.id;
  elements.sellPlayerName.textContent = player.name;
  elements.sellPlayerMeta.textContent = `${player.position} · ${player.overall} OVR`;
  elements.sellPlayerValue.textContent = formatMoney(valueMillions);
  elements.sellDialogMessage.textContent = `Sell ${player.name} for ${formatMoney(valueMillions)}?`;
  hydrateImageFallbacks(elements.sellDialog);
  if (!elements.sellDialog.open) elements.sellDialog.showModal();
}

function confirmSquadPlayerSale() {
  const player = playerById(pendingSalePlayerId);
  if (!player) {
    elements.sellDialog.close();
    pendingSalePlayerId = null;
    return;
  }

  const result = sellPlayer(state, player.id);
  if (!result.ok) {
    showToast(result.reason);
    return;
  }

  state = result.save;
  if (selectedPlayerId === player.id) selectedPlayerId = null;
  pendingSalePlayerId = null;
  elements.sellDialog.close();
  saveAndRender();
  showToast(`${player.name} sold for ${formatMoney(result.valueMillions)}.`);
}

function signMarketListing(playerId) {
  const result = signTransfer(state, playerId);
  if (!result.ok) {
    showToast(result.reason);
    return;
  }
  state = result.save;
  selectedPlayerId = result.player.id;
  saveAndRender();
  renderTransferMarketDialog();
  showToast(
    result.costMillions
      ? `${result.player.name} signed for ${formatMoney(result.costMillions)}.`
      : `${result.player.name} joined on a free transfer.`,
  );
}

function errorMessage(error) {
  if (!(error instanceof ApiError)) return "Something went wrong. Please try again.";
  if (error.status === "no_info") {
    return "That theme did not contain enough reliable information for a complete squad. Try a broader theme.";
  }
  if (error.status === "rate_limited") {
    if (!error.retryAfterSeconds) {
      return "The free Gemini quota is currently exhausted. Try again later.";
    }
    const minutes = Math.max(1, Math.ceil(error.retryAfterSeconds / 60));
    return minutes >= 120
      ? `Generation limit reached. Try again in ${Math.ceil(minutes / 60)} hour(s).`
      : `Generation limit reached. Try again in ${minutes} minute(s).`;
  }
  if (error.status === "invalid_theme") return error.message;
  return error.message || "The generator is unavailable right now.";
}

async function handleThemeSubmit({ theme, formationId, turnstileContainer, errorElement }) {
  errorElement.textContent = "";
  const cleanTheme = theme.trim().replace(/\s+/g, " ");
  const firstScout = state.collection.length === 0 &&
    state.themeHistory.length === 0 &&
    (state.transferMarket?.players?.length ?? 0) === 0;

  if (cleanTheme.length < 2 || cleanTheme.length > 80) {
    errorElement.textContent = "Enter a theme between 2 and 80 characters.";
    return;
  }

  if (state.collection.length >= COLLECTION_LIMIT) {
    errorElement.textContent =
      `The squad is capped at ${COLLECTION_LIMIT}. Sell a player before scouting again.`;
    return;
  }

  if (state.finances.balanceMillions < SCOUTING_COST_MILLIONS) {
    errorElement.textContent =
      `Scouting costs ${formatMoney(SCOUTING_COST_MILLIONS)}. Sell a player or earn prize money first.`;
    return;
  }

  const token = turnstileToken(turnstileContainer);
  if (apiMode() === "live" && !token) {
    errorElement.textContent = "Complete the anti-bot check before generating.";
    return;
  }

  showLoading(firstScout ? "Scouting your starting eleven..." : "Scouting eleven transfer targets...");

  try {
    const pack = await generateTeamPack({
      theme: cleanTheme,
      formationId,
      initialSquad: firstScout,
      excludedNames: firstScout
        ? []
        : [
          ...state.collection,
          ...(state.transferMarket?.players ?? []),
        ].map((player) => player.name),
      anonymousUserId: state.anonymousUserId,
      turnstileToken: token,
    });

    let initialPlayers = [];
    let transferMarket = createEmptyTransferMarket();
    if (firstScout) {
      try {
        initialPlayers = prepareInitialSquad(
          { ...pack, formationId },
          state.season.number,
        );
      } catch (error) {
        throw new ApiError(
          "upstream_error",
          `${error.message} Redeploy the fantasy-football Worker and try again.`,
        );
      }
    } else {
      const marketPlayers = normalizeMarketPackPlayers(pack.players);
      if (![10, 11].includes(marketPlayers.length)) {
        throw new ApiError(
          "upstream_error",
          `The Worker returned ${marketPlayers.length} players. A scouting pack must contain 10 or 11 players.`,
        );
      }
      const expectedMarketSize = marketPlayers.length;

      const existing = new Set(state.collection.map((player) => normalizeName(player.name)));
      transferMarket = prepareTransferMarket({
        ...pack,
        players: marketPlayers,
      });
      transferMarket.players = transferMarket.players.filter((player) => {
        const normalized = normalizeName(player.name);
        if (!normalized || existing.has(normalized)) return false;
        existing.add(normalized);
        return true;
      });

      if (transferMarket.players.length !== expectedMarketSize) {
        throw new ApiError(
          "upstream_error",
          "Gemini returned a repeated or already-owned player. Try the theme again.",
        );
      }
    }

    const scoutingCharge = chargeScoutingFee(state);
    if (!scoutingCharge.ok) {
      throw new ApiError("invalid_theme", scoutingCharge.reason);
    }
    state = scoutingCharge.save;
    state.formationId = formationId;
    if (firstScout) {
      state.collection = initialPlayers;
      state.transferMarket = createEmptyTransferMarket();
    } else {
      state.transferMarket = transferMarket;
    }
    state.themeHistory.push(cleanTheme);
    state.themeHistory = state.themeHistory.slice(-25);
    if (firstScout) state.lineup = {};
    persistSave(state);
    render();

    const portraitPlayers = firstScout ? state.collection : state.transferMarket.players;
    if (!firstScout) {
      hideLoading();
      renderTransferMarketDialog({ open: true });
    } else {
      elements.loadingMessage.textContent = "Looking for open portraits...";
    }

    try {
      const portraits = await fetchPortraitCandidates(portraitPlayers);
      for (const player of portraitPlayers) {
        const candidates = Array.isArray(portraits[player.id]) ? portraits[player.id] : [];
        player.portrait.candidates = candidates;
        player.portrait.index = candidates.length ? 0 : -1;
        player.portrait.useFallback = !candidates.length;
        player.portrait.searchedAt = Date.now();
      }
    } catch (portraitError) {
      console.warn("Portrait search failed; keeping generated fallbacks.", portraitError);
      for (const player of portraitPlayers) {
        player.portrait.candidates = [];
        player.portrait.index = -1;
        player.portrait.useFallback = true;
        player.portrait.searchedAt = Date.now();
      }
    }

    persistSave(state);
    render();
    if (firstScout) {
      showToast("Your complete starting XI has joined the club.");
    } else {
      renderTransferMarketDialog({ open: true });
    }
  } catch (error) {
    console.error(error);
    errorElement.textContent = errorMessage(error);
  } finally {
    resetTurnstile(turnstileContainer);
    hideLoading();
  }
}

function openManagerWindow(windowName) {
  const order = { tactics: 0, transfers: 1, season: 2, stats: 3 };
  const currentWindow = elements.packDialog.open
    ? "transfers"
    : elements.seasonDialog.open
      ? "season"
      : elements.statsDialog.open
        ? "stats"
        : "tactics";
  const targetWindow = order[windowName] === undefined ? "tactics" : windowName;
  document.body.style.setProperty("--manager-nav-from", order[currentWindow]);
  document.body.style.setProperty("--manager-nav-to", order[targetWindow]);
  document.body.classList.remove("is-manager-nav-sliding");
  void document.body.offsetWidth;
  document.body.classList.add("is-manager-nav-sliding");

  const switchWindow = () => {
    if (elements.packOpeningDialog.open) elements.packOpeningDialog.close();
    if (elements.packDialog.open) elements.packDialog.close();
    if (elements.seasonDialog.open) elements.seasonDialog.close();
    if (elements.statsDialog.open) elements.statsDialog.close();

    if (targetWindow === "tactics") {
      return;
    }

    if (targetWindow === "transfers") {
      renderTransferMarketDialog({ open: true });
      return;
    }

    if (targetWindow === "season") {
      renderLeagueTable();
      elements.seasonDialog.showModal();
      return;
    }

    if (targetWindow === "stats") {
      renderStatsWindow();
      elements.statsDialog.showModal();
    }
  };

  switchWindow();

  window.setTimeout(() => {
    document.body.classList.remove("is-manager-nav-sliding");
  }, 420);
}

function renderTransferMarketDialog({ open = false } = {}) {
  const market = state.transferMarket ?? createEmptyTransferMarket();
  const players = market.players ?? [];
  const freeCount = players.filter((player) => player.isFreeTransfer).length;
  const revealsUsed = Math.max(freeCount, Number(market.freeRevealsUsed) || 0);
  const picksRemaining = Math.max(0, 3 - revealsUsed);
  elements.packTitle.textContent = market.theme || "Scouting report";
  const portraitCount = players.filter((player) => player.portrait.candidates.length).length;
  elements.packSummary.innerHTML = players.length ? [
    `<span><small>Scout pack</small><strong>${players.length} players</strong></span>`,
    `<span><small>Free picks</small><strong>${revealsUsed} / 3</strong></span>`,
    `<span><small>Club balance</small><strong>${formatMoney(state.finances.balanceMillions)}</strong></span>`,
    `<span><small>Portraits found</small><strong>${portraitCount}</strong></span>`,
  ].join("") : '<p class="market-empty">This scouting list is complete. Enter another theme to open a new market.</p>';

  elements.packGrid.setAttribute("aria-label", picksRemaining
    ? `${players.length} concealed transfer cards. Choose ${picksRemaining} more free ${picksRemaining === 1 ? "transfer" : "transfers"}.`
    : "Scouted transfer targets");

  elements.packGrid.innerHTML = players.length
    ? players.map((player, index) => {
      const isRevealed = player.isRevealed !== false;
      const priceMillions = player.isFreeTransfer ? 0 : player.askingPriceMillions;
      const affordable = state.finances.balanceMillions >= priceMillions && state.collection.length < COLLECTION_LIMIT;
      const projectedResale = marketValueMillions(player, state);
      const tier = playerCardTier(player.overall);
      const tone = ["is-red", "is-mint", "is-blue", "is-violet", "is-orange"][index % 5];
      const availability = state.collection.length >= COLLECTION_LIMIT
        ? "Squad full — sell a player first"
        : state.finances.balanceMillions < priceMillions
          ? `Need ${formatMoney(priceMillions - state.finances.balanceMillions)} more`
          : player.isFreeTransfer ? "Free transfer selected" : "Available to sign";
      const revealLabel = picksRemaining ? `Flip card ${index + 1} for a free transfer` : `Card ${index + 1}`;
      return `
        <article class="pack-player pack-card ${tone} ${tier.className}${isRevealed ? " is-revealed" : " is-concealed"}${player.isFreeTransfer ? " is-free-transfer" : ""}" data-card-tier="${tier.id}" style="--order:${index};--deal-delay:${index * 62}ms;--flip-delay:${index * 48}ms">
          <div class="pack-card__inner">
            <div class="pack-card__back">
              <button class="pack-card__reveal" type="button" data-action="reveal-transfer" data-player-id="${escapeHtml(player.id)}" aria-label="${escapeHtml(revealLabel)}" ${picksRemaining ? "" : "disabled"}>
                <span class="pack-card__number">${String(index + 1).padStart(2, "0")}</span>
                <span class="pack-card__mark" aria-hidden="true">XI</span>
                <strong>Flip for free</strong>
                <small>${picksRemaining} pick${picksRemaining === 1 ? "" : "s"} remaining</small>
              </button>
            </div>
            <div class="pack-card__front">
              <div class="pack-player__visual">
                <span class="pack-player__poster" aria-hidden="true"></span>
                <div class="pack-player__topline"><span><strong>${player.overall}</strong><small>OVR</small></span><b>${escapeHtml(player.position)}</b></div>
                <img class="pack-player-photo" src="${escapeHtml(safeUrl(playerImageSource(player)))}" alt="" data-player-id="${escapeHtml(player.id)}" />
                <span class="pack-player__rarity">${escapeHtml(tier.label)}</span>
                <span class="pack-player__transfer-state">${player.isFreeTransfer ? "Free transfer" : "Scouted target"}</span>
              </div>
              <div class="pack-player__identity"><h3>${escapeHtml(player.name)}</h3><p>${escapeHtml(player.theme)}</p></div>
              <div class="pack-player__finance">
                <span><small>Asking</small><strong>${player.isFreeTransfer ? "Free" : formatMoney(priceMillions)}</strong></span>
                <span><small>Resale</small><strong>${formatMoney(projectedResale)}</strong></span>
              </div>
              <button class="button ${player.isFreeTransfer ? "button--free" : "button--transfer"}" type="button" data-action="sign-transfer" data-player-id="${escapeHtml(player.id)}" ${affordable ? "" : "disabled"}>${player.isFreeTransfer ? "Sign free" : `Buy ${formatMoney(priceMillions)}`}</button>
              <small class="pack-player__availability">${escapeHtml(availability)}</small>
            </div>
          </div>
        </article>
      `;
    }).join("")
    : '<p class="market-empty">No players remain on this scouting list.</p>';
  hydrateImageFallbacks(elements.packGrid);

  if (open) {
    if (players.length && !market.packOpened) {
      renderPackOpening({ open: true });
      return;
    }
    if (!elements.packDialog.open) elements.packDialog.showModal();
    mountTurnstile("manager-turnstile").catch((error) => { elements.managerError.textContent = error.message; });
  }
}

function renderPackOpening({ open = false } = {}) {
  const market = state.transferMarket ?? createEmptyTransferMarket();
  const players = market.players ?? [];
  const used = Math.max(
    Number(market.freeRevealsUsed) || 0,
    players.filter((player) => player.isFreeTransfer).length,
  );
  const remaining = Math.max(0, 3 - used);

  elements.packOpeningGrid.innerHTML = elements.packGrid.innerHTML;
  elements.packOpeningGrid.setAttribute(
    "aria-label",
    remaining
      ? `Choose ${remaining} more free ${remaining === 1 ? "transfer" : "transfers"} from this pack.`
      : "Complete scouting pack",
  );
  elements.packOpeningStatus.textContent = remaining
    ? `Choose ${remaining} free ${remaining === 1 ? "transfer" : "transfers"}`
    : "Three free transfers secured";
  elements.packOpeningContinue.hidden = !market.packOpened;
  if (!market.packOpened) elements.packOpeningContinue.classList.remove("is-ready");
  hydrateImageFallbacks(elements.packOpeningGrid);

  if (!open) return;
  if (elements.packDialog.open) elements.packDialog.close();
  if (!elements.packOpeningDialog.open) elements.packOpeningDialog.showModal();

  if (players.length && market.batchId && animatedMarketBatchId !== market.batchId) {
    animatedMarketBatchId = market.batchId;
    clearTimeout(packAnimationTimer);
    elements.packOpeningDialog.classList.add("is-sealed");
    requestAnimationFrame(() => {
      elements.packOpeningDialog.classList.remove("is-sealed");
      elements.packOpeningGrid.classList.add("is-pack-opening");
    });
    packAnimationTimer = setTimeout(() => {
      elements.packOpeningGrid.classList.remove("is-pack-opening");
    }, 1700);
  }
}

function eventIcon(event) {
  if (event.type === "goal") return "⚽";
  if (event.type === "yellow") return "🟨";
  return "🟥";
}

const MATCH_STAT_ROWS = [
  { key: "possession", label: "Possession", suffix: "%" },
  { key: "shots", label: "Shots" },
  { key: "shotsOnTarget", label: "Shots on target" },
  { key: "expectedGoals", label: "Expected goals", decimals: 1 },
  { key: "corners", label: "Corners" },
  { key: "fouls", label: "Fouls" },
  { key: "offsides", label: "Offsides" },
  { key: "saves", label: "Saves" },
  { key: "yellowCards", label: "Yellow cards" },
  { key: "redCards", label: "Red cards" },
];

function clampPercentage(value) {
  return Math.max(0, Math.min(100, Number(value) || 0)).toFixed(1);
}

function matchStatsMarkup(match) {
  const events = Array.isArray(match.events) ? match.events : [];
  const fallbackCards = (side, type) =>
    events.filter((event) => event.side === side && event.type === type).length;
  const fallback = {
    user: {
      possession: 50,
      shots: match.userGoals,
      shotsOnTarget: match.userGoals,
      expectedGoals: match.userGoals,
      corners: 0,
      fouls: 0,
      offsides: 0,
      saves: 0,
      yellowCards: fallbackCards("user", "yellow"),
      redCards: fallbackCards("user", "red"),
    },
    opponent: {
      possession: 50,
      shots: match.opponentGoals,
      shotsOnTarget: match.opponentGoals,
      expectedGoals: match.opponentGoals,
      corners: 0,
      fouls: 0,
      offsides: 0,
      saves: 0,
      yellowCards: fallbackCards("opponent", "yellow"),
      redCards: fallbackCards("opponent", "red"),
    },
  };
  const stats = match.stats ?? fallback;

  return MATCH_STAT_ROWS.map(({ key, label, suffix = "", decimals = 0 }) => {
    const userValue = Number(stats.user[key]) || 0;
    const opponentValue = Number(stats.opponent[key]) || 0;
    const total = userValue + opponentValue;
    const userShare = key === "possession"
      ? userValue
      : total > 0 ? (userValue / total) * 100 : 50;
    const display = (value) => `${value.toFixed(decimals)}${suffix}`;

    return `
      <div class="match-stat-row">
        <strong>${display(userValue)}</strong>
        <span class="match-stat-comparison">
          <span>${escapeHtml(label)}</span>
          <span class="match-stat-track" aria-hidden="true">
            <i style="width:${clampPercentage(userShare)}%"></i>
          </span>
        </span>
        <strong>${display(opponentValue)}</strong>
      </div>
    `;
  }).join("");
}

function ratingTier(rating) {
  if (rating < 5) return "poor";
  if (rating < 7) return "average";
  if (rating < 8) return "good";
  if (rating < 9) return "excellent";
  return "elite";
}

function performanceEventMarkup(performance) {
  const events = [];
  if (performance.goals) {
    events.push(`<span class="performance-event--goal" title="${performance.goals} goal${performance.goals === 1 ? "" : "s"}">⚽ ${performance.goals}</span>`);
  }
  if (performance.assists) {
    events.push(`<span class="performance-event--assist" title="${performance.assists} assist${performance.assists === 1 ? "" : "s"}">A ${performance.assists}</span>`);
  }
  if (performance.saves) {
    events.push(`<span class="performance-event--save" title="${performance.saves} save${performance.saves === 1 ? "" : "s"}">SV ${performance.saves}</span>`);
  }
  if (performance.yellows || performance.reds) {
    const cards = [
      performance.yellows ? `🟨 ${performance.yellows}` : "",
      performance.reds ? "🟥" : "",
    ].filter(Boolean).join(" ");
    events.push(`<span class="performance-event--card" title="Cards">${cards}</span>`);
  }
  return events.join("");
}

function renderResultPitch(match, side = selectedResultTeam) {
  const opponentView = side === "opponent";
  selectedResultTeam = opponentView ? "opponent" : "user";
  const formationId = opponentView ? match.opponentFormationId : match.formationId;
  const formation = FORMATIONS[formationId] ?? (opponentView ? FORMATIONS["4-4-2"] : currentFormation());
  const ratings = opponentView ? (match.opponentRatings ?? []) : (match.ratings ?? []);
  const roster = opponentView ? (match.opponentRoster ?? []) : state.collection;
  const unusedRatings = [...ratings];
  const teamName = opponentView ? match.opponent : normalizeClubProfile(state.clubProfile).name;

  elements.performanceMapTitle.textContent = teamName;
  const averageRating = ratings.length
    ? ratings.reduce((sum, performance) => sum + performance.rating, 0) / ratings.length
    : 0;
  const goals = opponentView ? match.opponentGoals : match.userGoals;
  elements.performanceMapMeta.textContent = `${formation.label} · ${averageRating ? averageRating.toFixed(1) + " avg" : "no rating"} · ${goals} goal${goals === 1 ? "" : "s"}`;
  elements.resultTeamButtons.forEach((button) => {
    const active = button.dataset.resultTeam === selectedResultTeam;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  elements.resultPitch.dataset.formation = formation.label;
  elements.resultPitch.dataset.team = selectedResultTeam;

  if (!unusedRatings.length) {
    elements.resultPitch.innerHTML = `<p class="performance-pitch__empty">No player ratings were saved for ${escapeHtml(teamName)}.</p>`;
    return;
  }

  elements.resultPitch.innerHTML = formation.slots.map((slot, index) => {
    let ratingIndex = unusedRatings.findIndex((performance) => performance.slotId === slot.id);
    if (ratingIndex < 0) {
      ratingIndex = unusedRatings.findIndex((performance) => performance.position === slot.position);
    }
    if (ratingIndex < 0) return "";

    const performance = unusedRatings.splice(ratingIndex, 1)[0];
    const player = roster.find((candidate) => candidate.id === performance.playerId);
    const photo = player ? safeUrl(playerImageSource(player)) : "";
    const tier = ratingTier(performance.rating);
    const eventSummary = [
      performance.goals ? `${performance.goals} goals` : "",
      performance.assists ? `${performance.assists} assists` : "",
      performance.saves ? `${performance.saves} saves` : "",
      performance.yellows ? `${performance.yellows} yellow cards` : "",
      performance.reds ? "red card" : "",
    ].filter(Boolean).join(", ");

    return `
      <article
        class="performance-player"
        style="--x:${slot.x}%;--y:${slot.y}%;--order:${index}"
        aria-label="${escapeHtml(performance.playerName)}, ${escapeHtml(slot.position)}, rated ${performance.rating.toFixed(1)}${eventSummary ? `, ${escapeHtml(eventSummary)}` : ""}"
      >
        <span class="performance-player__portrait">
          <img src="${escapeHtml(photo)}" alt="" data-result-player-id="${escapeHtml(performance.playerId)}" />
          <strong class="performance-rating performance-rating--${tier}">${performance.rating.toFixed(1)}</strong>
          <span class="performance-events">${performanceEventMarkup(performance)}</span>
        </span>
        <span class="performance-player__name">${escapeHtml(performance.playerName)}</span>
        <small>${escapeHtml(slot.position)}</small>
      </article>
    `;
  }).join("");
  elements.resultPitch.querySelectorAll("img[data-result-player-id]").forEach((image) => {
    image.addEventListener("error", () => {
      const player = roster.find((candidate) => candidate.id === image.dataset.resultPlayerId);
      if (player) image.src = fallbackAvatar(player);
    }, { once: true });
  });
}
function showMatchResult(match) {
  currentResultMatch = match;
  selectedResultTeam = "user";
  elements.resultWeek.textContent = `Week ${match.week} · Full time`;
  elements.scoreboard.innerHTML = `
    <span class="scoreboard__team">${escapeHtml(normalizeClubProfile(state.clubProfile).name)}</span>
    <strong class="scoreboard__score">${match.userGoals}–${match.opponentGoals}</strong>
    <span class="scoreboard__team">${escapeHtml(match.opponent)}</span>
  `;
  renderResultPitch(match);
  elements.matchStatTeamLabels.innerHTML = `
    <strong>${escapeHtml(normalizeClubProfile(state.clubProfile).name)}</strong>
    <span>vs</span>
    <strong>${escapeHtml(match.opponent)}</strong>
  `;
  elements.matchStatList.innerHTML = matchStatsMarkup(match);
  elements.eventTimeline.innerHTML = match.events.length
    ? match.events.map((event) => `
      <li class="event-item">
        <span class="event-item__minute">${event.minute}′</span>
        <span class="event-item__icon" aria-label="${escapeHtml(event.type)}">${eventIcon(event)}</span>
        <span>
          <strong>${escapeHtml(event.playerName)}</strong>
          ${event.type === "goal" && event.assisterName
            ? `<br /><small>assist: ${escapeHtml(event.assisterName)}</small>`
            : ""}
          ${event.type === "red"
            ? `<br /><small>${event.dismissal === "second-yellow" ? "Second yellow · dismissed" : "Straight red · dismissed"}</small>`
            : ""}
          ${event.side === "opponent" ? `<br /><small>${escapeHtml(match.opponent)}</small>` : ""}
        </span>
      </li>
    `).join("")
    : `<li class="event-item"><span>90′</span><span>—</span><span>No major events.</span></li>`;

  if (state.season.complete) {
    const award = seasonAward(state.season.points);
    const ballon = state.season.ballonDor;
    const winner = ballon?.winner;
    elements.seasonAward.hidden = false;
    elements.seasonAward.innerHTML = `
      <span>Season ${state.season.number} · ${state.season.finalPosition}${state.season.finalPosition === 1 ? "st" : state.season.finalPosition === 2 ? "nd" : state.season.finalPosition === 3 ? "rd" : "th"} place</span>
      <strong>${escapeHtml(award.label)}</strong>
      <span>${escapeHtml(award.message)} ${state.season.points} points · ${formatMoney(state.season.prizeMillions)} prize money added.</span>
      ${winner ? `<section class="ballon-dor-presentation"><p class="eyebrow">Ballon d’Or winner</p><div class="ballon-dor-winner">${statsPlayerIconMarkup(winner, "ballon-dor-player-icon")}<span><strong>${escapeHtml(winner.name)}</strong><small>Season ${state.season.number} champion · ${escapeHtml(winner.club ?? "Club")} · ${winner.goals} G · ${winner.assists} A</small></span></div><ol class="ballon-dor-finalists">${(ballon.finalists ?? []).map((finalist) => `<li><span>#${finalist.rank}</span><strong>${escapeHtml(finalist.name)}</strong><small>${finalist.goalContributions} G+A · #${finalist.teamPosition}</small></li>`).join("")}</ol></section>` : ""}
    `;

  } else {
    elements.seasonAward.hidden = true;
    elements.seasonAward.innerHTML = "";
  }

  elements.resultDialog.showModal();
}

elements.firstForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formationId = new FormData(elements.firstForm).get("formation") || "4-3-3";
  handleThemeSubmit({
    theme: elements.firstTheme.value,
    formationId,
    turnstileContainer: "setup-turnstile",
    errorElement: elements.setupError,
  });
});

elements.themeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleThemeSubmit({
    theme: elements.themeInput.value,
    formationId: state.formationId,
    turnstileContainer: "manager-turnstile",
    errorElement: elements.managerError,
  }).then(() => {
    if (!elements.managerError.textContent) elements.themeInput.value = "";
  });
});

function closeFormationPicker() {
  if (!elements.formationPickerMenu || !elements.formationPickerTrigger) return;
  elements.formationPickerMenu.hidden = true;
  elements.formationPickerTrigger.setAttribute("aria-expanded", "false");
}

elements.formationPickerTrigger?.addEventListener("click", () => {
  const willOpen = elements.formationPickerMenu.hidden;
  elements.formationPickerMenu.hidden = !willOpen;
  elements.formationPickerTrigger.setAttribute("aria-expanded", String(willOpen));
});

elements.formationPickerMenu?.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-formation-choice]");
  if (!choice) return;
  elements.formationSelect.value = choice.dataset.formationChoice;
  closeFormationPicker();
  elements.formationSelect.dispatchEvent(new Event("change", { bubbles: true }));
  elements.formationPickerTrigger.focus();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".tactics-formation-picker")) closeFormationPicker();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.formationPickerMenu?.hidden) {
    closeFormationPicker();
    elements.formationPickerTrigger?.focus();
  }
});

elements.formationSelect.addEventListener("change", () => {
  const previousFormationId = state.formationId;
  const nextFormationId = elements.formationSelect.value;
  state.lineup = refitLineup(
    state.lineup,
    previousFormationId,
    nextFormationId,
    state.collection,
  );
  state.formationId = nextFormationId;
  state.collection = reconcileLineupPlayerPositions(
    state.collection,
    state.lineup,
    state.formationId,
  );
  selectedPlayerId = null;
  saveAndRender();
  const fittedCount = Object.keys(state.lineup).length;
  showToast(`${FORMATIONS[state.formationId].label} selected. ${fittedCount} current players refitted.`);
});

elements.pitch.addEventListener("click", (event) => {
  if (suppressPlayerClick) return;
  const slot = event.target.closest("[data-slot-id]");
  if (!slot) return;
  const playerId = slot.dataset.playerId;
  if (playerId) setSelectedPlayer(playerId);
  else showToast("Drag a player onto this position.");
});

elements.pitch.addEventListener("pointerdown", (event) => {
  const slot = event.target.closest("[data-slot-id]");
  if (!slot?.dataset.playerId) return;
  beginPointerPlayerDrag(event, slot, slot.dataset.playerId);
});

elements.collectionList.addEventListener("pointerdown", (event) => {
  if (event.target.closest(".player-actions, [data-action]")) return;
  const row = event.target.closest(".collection-player");
  if (!row) return;
  beginPointerPlayerDrag(event, row, row.dataset.playerId);
});

document.addEventListener("pointermove", (event) => {
  const session = pointerDragSession;
  if (!session) return;
  if (!session.dragging) {
    const distance = Math.hypot(event.clientX - session.startX, event.clientY - session.startY);
    if (distance < 6) return;
    session.dragging = true;
    activeDraggedPlayerId = session.playerId;
    session.ghost = createPointerDragGhost(session.sourceElement, event);
    showDragTargets(session.playerId);
  }
  event.preventDefault();
  const rect = session.ghost.getBoundingClientRect();
  session.ghost.style.setProperty("left", `${event.clientX - (rect.width / 2)}px`, "important");
  session.ghost.style.setProperty("top", `${event.clientY - (rect.height / 2)}px`, "important");
  updatePointerDropTarget(event);
}, { passive: false });

document.addEventListener("pointerup", finishPointerPlayerDrag);
document.addEventListener("pointercancel", cancelPointerPlayerDrag);

elements.pitch.addEventListener("dragstart", (event) => {
  const playerElement = event.target.closest("[data-slot-id]");
  const playerId = playerElement?.dataset.playerId;
  if (!playerId) return;
  activeDraggedPlayerId = playerId;
  event.dataTransfer.setData("text/player-id", playerId);
  event.dataTransfer.effectAllowed = "move";
  setPlayerDragImage(event, playerElement);
  showDragTargets(playerId);
});

elements.pitch.addEventListener("dragover", (event) => {
  const slotElement = event.target.closest("[data-slot-id]");
  if (!slotElement) return;
  const playerId = activeDraggedPlayerId || event.dataTransfer.getData("text/player-id") || selectedPlayerId;
  const player = playerById(playerId);
  const slot = currentFormation().slots.find((candidate) => candidate.id === slotElement.dataset.slotId);
  if (player && slot && Number.isFinite(compatibilityPenalty(player.position, slot.position))) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    elements.pitch.querySelectorAll(".is-drop-target").forEach((candidate) => candidate.classList.remove("is-drop-target"));
    slotElement.classList.add("is-drop-target");
  }
});

elements.pitch.addEventListener("dragleave", (event) => {
  const slotElement = event.target.closest("[data-slot-id]");
  if (slotElement && !slotElement.contains(event.relatedTarget)) slotElement.classList.remove("is-drop-target");
});

elements.pitch.addEventListener("dragend", () => {
  clearDragTargets();
});

elements.pitch.addEventListener("drop", (event) => {
  const slotElement = event.target.closest("[data-slot-id]");
  if (!slotElement) return;
  event.preventDefault();
  const playerId = activeDraggedPlayerId || event.dataTransfer.getData("text/player-id");
  assignSelectedToSlot(slotElement.dataset.slotId, playerId);
  clearDragTargets();
});

elements.selectedPlayerSellButton.addEventListener("click", () => {
  const player = selectedPlayer();
  if (player) sellSquadPlayer(player);
});

elements.confirmSaleButton.addEventListener("click", confirmSquadPlayerSale);

elements.sellDialog.addEventListener("close", () => {
  pendingSalePlayerId = null;
});

elements.collectionList.addEventListener("click", (event) => {
  if (suppressPlayerClick) return;
  const action = event.target.closest("[data-action]");
  if (action) {
    event.stopPropagation();
    const player = playerById(action.dataset.playerId);
    if (!player) return;
    if (action.dataset.action === "cycle-portrait") cyclePortrait(player);
    if (action.dataset.action === "use-avatar") {
      player.portrait.useFallback = true;
      player.portrait.index = -1;
      saveAndRender();
    }
    if (action.dataset.action === "sell") sellSquadPlayer(player);
    return;
  }

  if (event.target.closest(".player-actions")) return;
  const row = event.target.closest(".collection-player");
  if (row) setSelectedPlayer(row.dataset.playerId);
});

elements.collectionList.addEventListener("dragstart", (event) => {
  const row = event.target.closest(".collection-player");
  if (!row) return;
  activeDraggedPlayerId = row.dataset.playerId;
  event.dataTransfer.setData("text/player-id", row.dataset.playerId);
  event.dataTransfer.effectAllowed = "move";
  setPlayerDragImage(event, row);
  showDragTargets(row.dataset.playerId);
});

elements.collectionList.addEventListener("dragend", () => {
  clearDragTargets();
});

document.addEventListener("dragend", () => {
  if (activeDraggedPlayerId) clearDragTargets();
});

window.addEventListener("blur", () => {
  cancelPointerPlayerDrag();
});

elements.collectionList.addEventListener("dragover", (event) => {
  const playerId = activeDraggedPlayerId || event.dataTransfer.getData("text/player-id") || elements.pitch.dataset.draggedPlayerId;
  if (!playerId) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  elements.collectionList.classList.add("is-bench-drop-target");
});

elements.collectionList.addEventListener("dragleave", (event) => {
  if (!elements.collectionList.contains(event.relatedTarget)) {
    elements.collectionList.classList.remove("is-bench-drop-target");
  }
});

elements.collectionList.addEventListener("drop", (event) => {
  event.preventDefault();
  const playerId = activeDraggedPlayerId || event.dataTransfer.getData("text/player-id") || elements.pitch.dataset.draggedPlayerId;
  if (!playerId) return clearDragTargets();
  const lineupEntry = Object.entries(state.lineup).find(([, assignedId]) => assignedId === playerId);
  if (lineupEntry) {
    const nextLineup = { ...state.lineup };
    delete nextLineup[lineupEntry[0]];
    state.lineup = nextLineup;
    selectedPlayerId = playerId;
    persistSave(state);
    render();
    showToast(`${playerById(playerId)?.name ?? "Player"} moved to the bench.`);
  }
  clearDragTargets();
});

elements.playerSearch.addEventListener("input", renderCollection);
elements.positionFilter.addEventListener("change", renderCollection);
elements.playerSort.addEventListener("change", renderCollection);

elements.openMatchdayButton.addEventListener("click", () => {
  renderMatchday();
  renderFixtures();
  if (!elements.matchdayDialog.open) elements.matchdayDialog.showModal();
});

elements.resultTeamButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!currentResultMatch) return;
    renderResultPitch(currentResultMatch, button.dataset.resultTeam);
  });
});

elements.autoPickButton?.addEventListener("click", () => {
  state.lineup = autoPickLineup(state.collection, state.formationId);
  state.collection = reconcileLineupPlayerPositions(state.collection, state.lineup, state.formationId);
  selectedPlayerId = null;
  saveAndRender();
  showToast("Best available XI selected.");
});

elements.fixPositionsButton?.addEventListener("click", () => {
  const previousLineup = { ...state.lineup };
  state.lineup = refitLineup(
    state.lineup,
    state.formationId,
    state.formationId,
    state.collection,
  );
  selectedPlayerId = null;
  const moved = Object.keys(state.lineup).filter(
    (slotId) => previousLineup[slotId] !== state.lineup[slotId],
  ).length;
  saveAndRender();
  showToast(moved ? `${moved} positions optimized for the current XI.` : "The current XI is already in its best positions.");
});

elements.seasonNextButton?.addEventListener("click", () => {
  elements.seasonDialog.close();
  elements.openMatchdayButton.click();
});

elements.seasonOpenMatchdayButton?.addEventListener("click", () => {
  elements.seasonDialog.close();
  elements.openMatchdayButton.click();
});

elements.statsRecordStrip?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-stats-metric='ballon']");
  if (!button) return;
  selectedStatsMetric = "ballon";
  renderStatsWindow();
});

document.addEventListener("error", (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.matches(".stats-player-icon img") || image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.remove();
}, true);

elements.statsMetricButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedStatsMetric = ["goals", "assists", "ballon"].includes(button.dataset.statsMetric) ? button.dataset.statsMetric : "goals";
    renderStatsWindow();
  });
});

elements.leagueTableBody.addEventListener("click", (event) => {
  const scoutButton = event.target.closest("[data-season-opponent-id]");
  if (!scoutButton) return;
  selectedSeasonOpponentId = scoutButton.dataset.seasonOpponentId;
  renderLeagueTable();
});

elements.managerWindowButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openManagerWindow(button.dataset.openManagerWindow);
  });
});

function handleTransferCardAction(event) {
  const action = event.target.closest("[data-action]");
  if (!action) return;

  if (action.dataset.action === "reveal-transfer") {
    const previousUsed = Number(state.transferMarket?.freeRevealsUsed) || 0;
    state.transferMarket = revealTransferCard(state.transferMarket, action.dataset.playerId);
    if ((Number(state.transferMarket.freeRevealsUsed) || 0) === previousUsed) return;
    persistSave(state);
    renderTransferMarketDialog();
    renderPackOpening();
    const revealedCard = [...elements.packOpeningGrid.querySelectorAll(".pack-card")]
      .find((card) => card.querySelector("[data-player-id]")?.dataset.playerId === action.dataset.playerId);
    revealedCard?.classList.add("is-choice-reveal");
    if (state.transferMarket.packOpened) {
      requestAnimationFrame(() => elements.packOpeningGrid.classList.add("is-final-reveal"));
      setTimeout(() => {
        elements.packOpeningGrid.classList.remove("is-final-reveal");
        elements.packOpeningContinue.classList.add("is-ready");
      }, 1150);
    }
    return;
  }

  if (action.dataset.action === "sign-transfer") {
    signMarketListing(action.dataset.playerId);
  }
}

elements.packGrid.addEventListener("click", handleTransferCardAction);
elements.packOpeningGrid.addEventListener("click", handleTransferCardAction);
elements.packOpeningContinue.addEventListener("click", () => {
  elements.packOpeningContinue.classList.remove("is-ready");
  if (elements.packOpeningDialog.open) elements.packOpeningDialog.close();
  renderTransferMarketDialog({ open: true });
});

elements.simulateButton.addEventListener("click", () => {
  if (elements.matchdayDialog.open) elements.matchdayDialog.close();

  if (state.season.complete) {
    state.season = createDefaultSeason(state.season.number + 1);
    state = syncSeasonOpponents(state, loadPublishedNpcOpponents());
    saveAndRender();
    showToast(
      `Season ${state.season.number} is underway with ${formatMoney(state.finances.balanceMillions)} available.`,
    );
    return;
  }

  try {
    showLoading("Playing ninety minutes...");
    const match = simulateMatch(state);
    state = applyMatchToSave(state, match);
    persistSave(state);
    render();
    setTimeout(() => {
      hideLoading();
      showMatchResult(match);
    }, 520);
  } catch (error) {
    hideLoading();
    showToast(error.message);
  }
});

elements.creditsButton.addEventListener("click", () => {
  renderCredits();
  elements.creditsDialog.showModal();
});


function openClubSettings() {
  const profile = normalizeClubProfile(state.clubProfile);
  elements.clubNameInput.value = profile.name;
  const iconChoice = elements.clubSettingsForm.querySelector(
    `[name="clubIcon"][value="${profile.icon}"]`,
  );
  if (iconChoice) iconChoice.checked = true;
  if (!elements.clubSettingsDialog.open) elements.clubSettingsDialog.showModal();
}

elements.clubSettingsButtons.forEach((button) => {
  button.addEventListener("click", openClubSettings);
});

elements.clubSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(elements.clubSettingsForm);
  state.clubProfile = normalizeClubProfile({
    name: formData.get("clubName"),
    icon: formData.get("clubIcon"),
  });
  elements.clubSettingsDialog.close();
  saveAndRender();
  showToast(`${state.clubProfile.name} identity updated.`);
});

elements.resetButton.addEventListener("click", () => {
  if (!window.confirm(
    "Reset the entire club, transfer balance, collection, and season history?",
  )) return;
  clearSave();
  state = syncSeasonOpponents(createDefaultSave(), loadPublishedNpcOpponents());
  selectedPlayerId = null;
  if (elements.seasonDialog.open) elements.seasonDialog.close();
  if (elements.statsDialog.open) elements.statsDialog.close();
  if (elements.matchdayDialog.open) elements.matchdayDialog.close();
  if (elements.packOpeningDialog.open) elements.packOpeningDialog.close();
  if (elements.packDialog.open) elements.packDialog.close();
  if (elements.clubSettingsDialog.open) elements.clubSettingsDialog.close();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.getElementById(button.dataset.closeDialog);
    if ([elements.packDialog, elements.seasonDialog, elements.statsDialog].includes(dialog)) {
      openManagerWindow("tactics");
    } else {
      dialog?.close();
    }
  });
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

render();
refreshConnectionStatus();
refreshMissingPortraits();
void restorePublishedOpponentsFromGameStorage();

// Developer Mode is an optional module. Removing its folder removes the tab
// without changing the public game path.
void import("../developer-mode/index.js")
  .then(({ mountDeveloperMode }) => mountDeveloperMode())
  .catch((error) => {
    console.info("Optional Developer Mode is not installed.", error?.message ?? "");
  });
