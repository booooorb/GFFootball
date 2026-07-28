import { hashString } from "./core.js";

const AVATAR_COLORS = [
  ["#11243A", "#B7FF3C", "#D6A47B"],
  ["#261A3A", "#9C7CFF", "#8D5524"],
  ["#35182A", "#FF6881", "#F0C7A5"],
  ["#0D3040", "#43D9E6", "#C68642"],
  ["#30320E", "#E6EF55", "#6F3E2A"],
  ["#132E24", "#66E29A", "#E0AC69"],
  ["#342516", "#FFB84A", "#F1C27D"],
  ["#20283D", "#80A7FF", "#5C3422"],
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function playerInitials(name) {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words.at(-1)[0]}`.toUpperCase();
}

export function fallbackAvatar(player) {
  const [background, accent, skin] =
    AVATAR_COLORS[hashString(`${player.name}:${player.theme}`) % AVATAR_COLORS.length];
  const initials = escapeXml(playerInitials(player.name));
  const position = escapeXml(player.position);
  const stripeDirection = hashString(player.name) % 2 ? "0" : "1";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <defs>
        <linearGradient id="light" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="${accent}" stop-opacity=".26"/>
          <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
        </linearGradient>
        <pattern id="kit" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(${stripeDirection === "1" ? 90 : 0})">
          <rect width="11" height="22" fill="${accent}" opacity=".92"/>
          <rect x="11" width="11" height="22" fill="${background}"/>
        </pattern>
      </defs>
      <rect width="240" height="240" fill="${background}"/>
      <circle cx="186" cy="46" r="92" fill="url(#light)"/>
      <path d="M52 240v-40c0-45 28-74 68-74s68 29 68 74v40" fill="url(#kit)"/>
      <path d="M88 139l32 30 32-30 15 8-19 93H92l-19-93z" fill="${background}" opacity=".72"/>
      <circle cx="120" cy="88" r="43" fill="${skin}"/>
      <path d="M78 85c2-43 22-60 45-60 28 0 45 24 42 66-11-3-22-14-27-27-14 14-34 22-60 21z" fill="#080C12" opacity=".88"/>
      <circle cx="105" cy="91" r="3" fill="#080C12"/>
      <circle cx="136" cy="91" r="3" fill="#080C12"/>
      <path d="M108 108q12 8 24 0" fill="none" stroke="#080C12" stroke-width="3" stroke-linecap="round" opacity=".62"/>
      <circle cx="120" cy="188" r="29" fill="${background}" stroke="${accent}" stroke-width="4"/>
      <text x="120" y="195" text-anchor="middle" font-family="Arial Narrow,Arial,sans-serif" font-size="24" font-weight="900" fill="${accent}">${initials}</text>
      <rect x="171" y="194" width="53" height="30" rx="6" fill="${accent}"/>
      <text x="197.5" y="215" text-anchor="middle" font-family="Consolas,monospace" font-size="15" font-weight="800" fill="#080C12">${position}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

export function selectedPortrait(player) {
  if (player.portrait?.useFallback !== false) return null;
  const candidates = player.portrait?.candidates ?? [];
  return candidates[player.portrait.index] ?? null;
}

export function playerImageSource(player) {
  return selectedPortrait(player)?.thumbnail || fallbackAvatar(player);
}
