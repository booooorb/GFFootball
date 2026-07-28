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
