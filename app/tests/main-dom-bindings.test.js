import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("every main UI element reference is declared in the DOM binding map", async () => {
  const [source, html] = await Promise.all([
    readFile(new URL("../js/main.js", import.meta.url), "utf8"),
    readFile(new URL("../index.html", import.meta.url), "utf8"),
  ]);
  const declaration = source.match(/const elements = \{([\s\S]*?)\r?\n\};/)?.[1] ?? "";
  const declared = new Set(
    [...declaration.matchAll(/^\s{2}([A-Za-z]\w*):/gm)].map((match) => match[1]),
  );
  const used = new Set(
    [...source.matchAll(/\belements\.([A-Za-z]\w*)/g)].map((match) => match[1]),
  );
  const missing = [...used].filter((name) => !declared.has(name)).sort();

  assert.deepEqual(missing, []);

  const htmlIds = new Set(
    [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]),
  );
  const boundIds = new Set(
    [...declaration.matchAll(/querySelector\("#([^"]+)"\)/g)].map((match) => match[1]),
  );
  const missingIds = [...boundIds].filter((id) => !htmlIds.has(id)).sort();

  assert.deepEqual(missingIds, []);
});

test("Transfers is composed from the shared Season window and has no legacy window hooks", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const transferDialog = html.match(/<dialog[^>]+id="pack-dialog"[\s\S]*?<\/dialog>/)?.[0] ?? "";

  assert.match(transferDialog, /class="[^"]*season-window[^"]*transfers-rebuild/);
  assert.match(transferDialog, /class="[^"]*season-window__shell[^"]*transfers-rebuild__shell/);
  assert.match(transferDialog, /class="season-window__topbar manager-window-header"/);
  assert.match(transferDialog, /class="season-window__heading-grid manager-grid"/);
  assert.match(transferDialog, /class="season-window__commandbar tactics-commandbar(?: [^"]+)?"/);
  assert.match(transferDialog, /class="season-window__body transfers-rebuild__body"/);
  assert.match(transferDialog, /class="season-window__standings transfers-rebuild__workspace"/);
  assert.doesNotMatch(transferDialog, /transfer-window__|\btransfer-row\b|\bshortlist-row\b|class="[^"]*\bpack-grid\b/);
});

test("Transfers renders the market as a compact card menu", async () => {
  const [mainSource, transferStyles] = await Promise.all([
    readFile(new URL("../js/main.js", import.meta.url), "utf8"),
    readFile(new URL("../transfers.css", import.meta.url), "utf8"),
  ]);

  assert.match(mainSource, /class="transfer-card-menu" role="list"/);
  assert.match(mainSource, /class="transfer-menu-card /);
  assert.match(mainSource, /class="transfer-menu-card__portrait"/);
  assert.match(mainSource, /class="transfer-menu-card__body"/);
  assert.match(mainSource, /class="pitch-slot transfer-player-card /);
  assert.match(mainSource, /class="pitch-player-rating"/);
  assert.match(mainSource, /Buy player/);
  assert.doesNotMatch(mainSource, /Need \$\{formatMoney\(priceMillions - state\.finances\.balanceMillions\)\} more/);
  assert.doesNotMatch(mainSource, /class="transfers-table__head"/);
  assert.match(transferStyles, /transfer-player-card-stage > \.pitch-slot\.transfer-player-card/);
  assert.doesNotMatch(transferStyles, /transfer-player-card[^\{]*\{[^}]*\b(?:border|border-radius|background|box-shadow|clip-path)\s*:/s);
  assert.doesNotMatch(transferStyles, /transfer-player-card \.pitch-player-(?:rating|position|name|portrait|poster|photo)/);
  assert.doesNotMatch(transferStyles, /template-1-blank|--transfer-card-frame/);
});

test("Transfers uses the former shortlist panel for the complete scouting workflow", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const transferDialog = html.match(/<dialog[^>]+id="pack-dialog"[\s\S]*?<\/dialog>/)?.[0] ?? "";

  assert.match(transferDialog, /transfers-rebuild__scouting/);
  assert.match(transferDialog, /id="theme-form"/);
  assert.match(transferDialog, /id="manager-turnstile"/);
  assert.match(transferDialog, /id="manager-error"/);
  assert.match(transferDialog, /transfer-scouting-title">Scouting<\/h3>[\s\S]*?<strong>€20M<\/strong>/);
  assert.match(transferDialog, /Scout market[\s\S]*?€20M/);
  assert.doesNotMatch(transferDialog, /Recruitment desk|Generate a themed transfer market|Charged when a new market is generated/);
  assert.doesNotMatch(transferDialog, /Shortlist|transfer-shortlist-list/);
});

test("manager windows slide in navigation order with reduced-motion support", async () => {
  const [mainSource, hostStyles] = await Promise.all([
    readFile(new URL("../js/main.js", import.meta.url), "utf8"),
    readFile(new URL("../host-city.css", import.meta.url), "utf8"),
  ]);

  assert.match(mainSource, /const order = \{ tactics: 0, transfers: 1, season: 2, stats: 3 \}/);
  assert.match(mainSource, /order\[targetWindow\] > order\[currentWindow\] \? "forward" : "backward"/);
  assert.doesNotMatch(mainSource, /document\.startViewTransition/);
  assert.match(mainSource, /activeManagerWindowAnimation\?\.cancel\(\)/);
  assert.match(mainSource, /incomingLayer\.animate/);
  assert.match(hostStyles, /\.manager-slide-layer/);
  assert.doesNotMatch(hostStyles, /view-transition-name:/);
  assert.match(mainSource, /slideDirection === "forward" \? "100vw" : "-100vw"/);
  assert.match(mainSource, /prefers-reduced-motion: reduce/);
});
