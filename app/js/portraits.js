const ALLOWED_LICENSES = new Set(["cc0", "pdm", "by", "by-sa"]);
const OPENVERSE_ENDPOINT = "https://api.openverse.org/v1/images/";
const COMMONS_ENDPOINT = "https://commons.wikimedia.org/w/api.php";
const WIKIPEDIA_ENDPOINT = "https://en.wikipedia.org/w/api.php";
const MIN_GENERIC_MATCH_SCORE = 7.5;
export const CURATED_PORTRAIT_STORAGE_KEY = "gff-curated-portrait-cache-v1";
const CURATED_PORTRAIT_CACHE_LIMIT = 250;

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function normalizeCuratedCandidate(candidate) {
  const thumbnail = validHttpUrl(candidate?.thumbnail);
  if (!thumbnail) return null;
  return {
    thumbnail,
    title: String(candidate?.title || "Developer-selected portrait").slice(0, 200),
    creator: String(candidate?.creator || "Source website").slice(0, 160),
    creatorUrl: validHttpUrl(candidate?.creatorUrl),
    sourceUrl: validHttpUrl(candidate?.sourceUrl),
    license: String(candidate?.license || "Source rights apply").slice(0, 80),
    licenseUrl: validHttpUrl(candidate?.licenseUrl || candidate?.sourceUrl),
  };
}

export function loadCuratedPortraitCache(storage = globalThis.localStorage) {
  try {
    const payload = JSON.parse(storage?.getItem(CURATED_PORTRAIT_STORAGE_KEY) ?? "null");
    const entries = payload?.portraits && typeof payload.portraits === "object"
      ? payload.portraits
      : {};
    return Object.fromEntries(
      Object.entries(entries).flatMap(([key, value]) => {
        const candidates = Array.isArray(value?.candidates)
          ? value.candidates.map(normalizeCuratedCandidate).filter(Boolean).slice(0, 2)
          : [];
        return candidates.length
          ? [[key, {
            name: String(value?.name || "").slice(0, 120),
            cachedAt: Math.max(0, Number(value?.cachedAt) || 0),
            candidates,
          }]]
          : [];
      }),
    );
  } catch {
    return {};
  }
}

export function persistCuratedPortraitCache(entries, storage = globalThis.localStorage) {
  const source = entries?.portraits && typeof entries.portraits === "object"
    ? entries.portraits
    : entries;
  const portraits = Object.fromEntries(
    Object.entries(source && typeof source === "object" ? source : {})
      .flatMap(([key, value]) => {
        const candidates = Array.isArray(value?.candidates)
          ? value.candidates.map(normalizeCuratedCandidate).filter(Boolean).slice(0, 2)
          : [];
        return key && candidates.length
          ? [[key, {
            name: String(value?.name || "").slice(0, 120),
            cachedAt: Math.max(0, Number(value?.cachedAt) || 0),
            candidates,
          }]]
          : [];
      })
      .slice(-CURATED_PORTRAIT_CACHE_LIMIT),
  );
  storage?.setItem(CURATED_PORTRAIT_STORAGE_KEY, JSON.stringify({
    schemaVersion: 1,
    updatedAt: Date.now(),
    portraits,
  }));
  return portraits;
}

export function mergeCuratedPortraitCache(entries, storage = globalThis.localStorage) {
  const merged = loadCuratedPortraitCache(storage);
  const incoming = entries?.portraits && typeof entries.portraits === "object"
    ? entries.portraits
    : entries;
  for (const [key, value] of Object.entries(incoming && typeof incoming === "object" ? incoming : {})) {
    const previous = merged[key];
    if (!previous || Number(value?.cachedAt) >= Number(previous.cachedAt)) merged[key] = value;
  }
  return persistCuratedPortraitCache(merged, storage);
}

export function cacheCuratedPortraits(name, candidates, storage = globalThis.localStorage) {
  const key = normalizeText(name);
  const normalized = Array.isArray(candidates)
    ? candidates.map(normalizeCuratedCandidate).filter(Boolean).slice(0, 2)
    : [];
  if (!key || normalized.length !== 2) return false;

  try {
    const current = loadCuratedPortraitCache(storage);
    delete current[key];
    current[key] = {
      name: String(name).trim().replace(/\s+/g, " ").slice(0, 120),
      cachedAt: Date.now(),
      candidates: normalized,
    };
    const portraits = Object.fromEntries(
      Object.entries(current).slice(-CURATED_PORTRAIT_CACHE_LIMIT),
    );
    storage?.setItem(CURATED_PORTRAIT_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      updatedAt: Date.now(),
      portraits,
    }));
    return true;
  } catch {
    return false;
  }
}

export function cachedPortraitsForPlayers(players, storage = globalThis.localStorage) {
  const cache = loadCuratedPortraitCache(storage);
  return Object.fromEntries((Array.isArray(players) ? players : []).map((player) => [
    player.id,
    cache[normalizeText(player.name)]?.candidates ?? [],
  ]));
}

function tagText(result) {
  return Array.isArray(result.tags)
    ? result.tags.map((tag) => tag?.name || tag).filter(Boolean).join(" ")
    : "";
}

function stripMarkup(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:nbsp|amp|quot|#39);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function reusableCommonsLicense(value) {
  const license = normalizeText(value);
  if (!license || /\b(?:nc|nd)\b/.test(license)) return false;
  return (
    license.includes("public domain") ||
    license.includes("cc0") ||
    license.includes("pdm") ||
    license.includes("cc by")
  );
}

function responsePages(payload) {
  const pages = payload?.query?.pages;
  if (Array.isArray(pages)) return pages;
  return pages && typeof pages === "object" ? Object.values(pages) : [];
}

function looksLikeReusablePhoto(title) {
  return (
    /\.(?:avif|jpe?g|png|webp)$/i.test(title) &&
    !/\b(?:autograph|coat of arms|flag|jersey|kit|logo|map|signature|stadium)\b/i
      .test(title)
  );
}

function portraitCandidate(image, metadata, fallbackTitle) {
  const license = stripMarkup(metadata.LicenseShortName?.value);
  const title = String(fallbackTitle ?? "").replace(/^File:/i, "");
  if (
    !image ||
    !reusableCommonsLicense(license) ||
    !looksLikeReusablePhoto(title) ||
    !validHttpUrl(image.thumburl || image.url) ||
    !validHttpUrl(image.descriptionurl)
  ) {
    return null;
  }

  return {
    thumbnail: validHttpUrl(image.thumburl || image.url),
    title: title.slice(0, 200),
    creator: (
      stripMarkup(metadata.Artist?.value) ||
      stripMarkup(metadata.Credit?.value) ||
      "Wikimedia contributor"
    ).slice(0, 160),
    creatorUrl: "",
    sourceUrl: validHttpUrl(image.descriptionurl),
    license: license.toUpperCase(),
    licenseUrl: validHttpUrl(metadata.LicenseUrl?.value),
  };
}

export function scoreOpenverseResult(result, name, theme) {
  const normalizedName = normalizeText(name);
  const nameParts = normalizedName.split(" ").filter((part) => part.length > 1);
  const themeParts = normalizeText(theme).split(" ").filter((part) => part.length > 2);
  const haystack = normalizeText(
    `${result.title ?? ""} ${result.creator ?? ""} ${tagText(result)}`,
  );

  let score = normalizedName && haystack.includes(normalizedName) ? 7 : 0;
  score += nameParts.reduce(
    (sum, part) => sum + (haystack.includes(part) ? 1.4 : 0),
    0,
  );
  score += themeParts
    .slice(0, 4)
    .reduce((sum, part) => sum + (haystack.includes(part) ? 0.35 : 0), 0);

  const width = Number(result.width);
  const height = Number(result.height);
  if (width > 0 && height > 0) {
    const ratio = width / height;
    if (ratio >= 0.55 && ratio <= 1.35) score += 1;
  }
  return score;
}

export function mapOpenverseResults(payload, player) {
  return (Array.isArray(payload?.results) ? payload.results : [])
    .filter((result) =>
      result.mature !== true &&
      ALLOWED_LICENSES.has(String(result.license).toLowerCase()) &&
      validHttpUrl(result.thumbnail) &&
      validHttpUrl(result.foreign_landing_url || result.url),
    )
    .map((result) => ({
      result,
      score: scoreOpenverseResult(result, player.name, player.theme),
    }))
    .filter(({ score }) => score >= MIN_GENERIC_MATCH_SCORE)
    .sort((left, right) => right.score - left.score)
    .filter(
      ({ result }, index, list) =>
        list.findIndex(
          ({ result: candidate }) => candidate.thumbnail === result.thumbnail,
        ) === index,
    )
    .slice(0, 3)
    .map(({ result }) => ({
      thumbnail: validHttpUrl(result.thumbnail),
      title: String(result.title || "Untitled").slice(0, 200),
      creator: String(result.creator || "Unknown creator").slice(0, 160),
      creatorUrl: validHttpUrl(result.creator_url),
      sourceUrl: validHttpUrl(result.foreign_landing_url || result.url),
      license: String(result.license || "Open license").toUpperCase(),
      licenseUrl: validHttpUrl(result.license_url),
    }));
}

export function mapCommonsResults(payload, player) {
  const results = responsePages(payload);

  return results
    .map((page) => {
      const image = page?.imageinfo?.[0];
      const metadata = image?.extmetadata ?? {};
      const license = stripMarkup(metadata.LicenseShortName?.value);
      const title = String(page?.title ?? "").replace(/^File:/i, "");
      const descriptiveText = [
        title,
        stripMarkup(metadata.ObjectName?.value),
        stripMarkup(metadata.ImageDescription?.value),
        stripMarkup(metadata.Categories?.value),
      ].join(" ");
      const fileLooksLikePhoto = looksLikeReusablePhoto(title);

      return {
        page,
        image,
        metadata,
        license,
        title,
        fileLooksLikePhoto,
        score: scoreOpenverseResult(
          {
            title: descriptiveText,
            creator: stripMarkup(metadata.Artist?.value),
            width: image?.width,
            height: image?.height,
          },
          player.name,
          player.theme,
        ),
      };
    })
    .filter(({ image, license, fileLooksLikePhoto, score }) =>
      image &&
      reusableCommonsLicense(license) &&
      fileLooksLikePhoto &&
      score >= MIN_GENERIC_MATCH_SCORE &&
      validHttpUrl(image.thumburl || image.url) &&
      validHttpUrl(image.descriptionurl),
    )
    .sort((left, right) => right.score - left.score)
    .filter(
      ({ image }, index, list) =>
        list.findIndex(
          ({ image: candidate }) =>
            (candidate.thumburl || candidate.url) === (image.thumburl || image.url),
        ) === index,
    )
    .slice(0, 3)
    .map(({ image, metadata, title }) => portraitCandidate(image, metadata, title))
    .filter(Boolean);
}

export function selectWikipediaArticle(payload, player) {
  const pages = responsePages(payload).sort(
    (left, right) => Number(left.index ?? 999) - Number(right.index ?? 999),
  );
  const normalizedName = normalizeText(player.name);
  const exact = pages.find((page) => normalizeText(page.title) === normalizedName);
  if (exact) return exact.pageimage ? exact : null;

  return pages.find((page) => {
    const title = normalizeText(page.title);
    return (
      page.pageimage &&
      title.includes(normalizedName) &&
      !/\b(?:career|list|rivalry|discography|filmography)\b/.test(title)
    );
  }) ?? null;
}

export function mapWikipediaImageInfo(payload) {
  const page = responsePages(payload).find((candidate) => candidate?.imageinfo?.[0]);
  if (!page) return [];
  const image = page.imageinfo[0];
  const candidate = portraitCandidate(
    image,
    image.extmetadata ?? {},
    page.title,
  );
  return candidate ? [candidate] : [];
}

async function searchWikipediaLeadPortrait(player, fetchImpl) {
  const articleQuery = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: player.name,
    gsrnamespace: "0",
    gsrlimit: "5",
    prop: "pageimages|pageterms",
    piprop: "name",
    pilicense: "free",
    wbptterms: "description",
    format: "json",
    formatversion: "2",
    origin: "*",
  });
  const articleResponse = await fetchImpl(`${WIKIPEDIA_ENDPOINT}?${articleQuery}`, {
    headers: { Accept: "application/json" },
  });
  if (!articleResponse.ok) {
    throw new Error(`Wikipedia identity search returned HTTP ${articleResponse.status}.`);
  }

  const article = selectWikipediaArticle(await articleResponse.json(), player);
  if (!article?.pageimage) return [];

  const imageQuery = new URLSearchParams({
    action: "query",
    titles: `File:${article.pageimage}`,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "480",
    format: "json",
    formatversion: "2",
    origin: "*",
  });
  const imageResponse = await fetchImpl(`${WIKIPEDIA_ENDPOINT}?${imageQuery}`, {
    headers: { Accept: "application/json" },
  });
  if (!imageResponse.ok) {
    throw new Error(`Wikipedia image lookup returned HTTP ${imageResponse.status}.`);
  }
  return mapWikipediaImageInfo(await imageResponse.json());
}

async function searchCommonsPortrait(player, fetchImpl) {
  const query = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: player.name,
    gsrnamespace: "6",
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "480",
    format: "json",
    origin: "*",
  });
  const response = await fetchImpl(`${COMMONS_ENDPOINT}?${query}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Wikimedia Commons search returned HTTP ${response.status}.`);
  }
  return mapCommonsResults(await response.json(), player);
}

async function searchOpenversePortrait(player, fetchImpl) {
  const query = new URLSearchParams({
    q: player.name,
    page_size: "30",
    mature: "false",
    license: "cc0,pdm,by,by-sa",
  });
  const response = await fetchImpl(`${OPENVERSE_ENDPOINT}?${query}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Openverse portrait search returned HTTP ${response.status}.`);
  }
  return mapOpenverseResults(await response.json(), player);
}

async function searchLicensedPortrait(player, fetchImpl) {
  try {
    const wikipedia = await searchWikipediaLeadPortrait(player, fetchImpl);
    if (wikipedia.length) return wikipedia;
  } catch (error) {
    console.warn(`Wikipedia portrait lookup failed for ${player.name}.`, error);
  }

  try {
    const commons = await searchCommonsPortrait(player, fetchImpl);
    if (commons.length) return commons;
  } catch (error) {
    console.warn(`Wikimedia Commons search failed for ${player.name}.`, error);
  }

  return searchOpenversePortrait(player, fetchImpl);
}

export async function searchLicensedPortraits(
  players,
  { fetchImpl = globalThis.fetch, concurrency = 3, storage = globalThis.localStorage } = {},
) {
  const portraits = cachedPortraitsForPlayers(players, storage);
  const uncachedPlayers = players.filter((player) => !portraits[player.id]?.length);
  if (!uncachedPlayers.length) return portraits;
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < uncachedPlayers.length) {
      const player = uncachedPlayers[nextIndex];
      nextIndex += 1;
      try {
        portraits[player.id] = await searchLicensedPortrait(player, fetchImpl);
      } catch (error) {
        console.warn(`Portrait search failed for ${player.name}.`, error);
        portraits[player.id] = [];
      }
    }
  }

  const workerCount = Math.min(Math.max(1, concurrency), uncachedPlayers.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return portraits;
}
