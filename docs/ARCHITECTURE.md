# Architecture

## Browser application

The game is a static ES-module application in `app/`.

- `index.html` defines manager windows, dialogs, tactics, transfers, season, statistics, results, and settings.
- `styles.css` contains the shared World Cup-inspired visual system and responsive layouts.
- `js/main.js` binds the DOM and coordinates user interactions.
- `js/core.js` owns deterministic game rules, formations, transfers, simulation, standings, and awards.
- `js/storage.js` owns local-save persistence and migration.
- `js/api.js` communicates with the Worker.
- `js/avatar.js`, `js/portraits.js`, and `js/published-npc.js` handle player imagery and NPC data.
- `developer-mode/` is optional and dynamically imported. Removing that folder removes Developer Mode without breaking the public game.

The browser stores the manager's save locally. Player IDs remain the interaction contract across lineups, transfers, portraits, statistics, and match results.

## Cloudflare Worker

The Worker in `worker/` is the only component allowed to access private API keys.

It provides:

- Gemini-backed themed player generation
- Cloudflare Turnstile verification
- Generation rate limiting
- Portrait lookup and caching
- Developer-token-protected SerpAPI image search
- Draft and published NPC-team synchronization
- Health and configuration status

The browser must never receive Gemini, Turnstile secret, SerpAPI, or Developer Mode tokens.

## Data flow

```text
Manager action
    |
    v
Static browser app ---- local save
    |
    | HTTPS
    v
Cloudflare Worker ---- KV rate limits / portrait cache / developer game data
    |
    +---- Gemini API
    +---- Turnstile verification
    +---- SerpAPI (Developer Mode only)
```

## Testing

- `app/tests/` covers browser-facing APIs, simulation, transfers, storage behavior, portraits, and DOM-binding contracts.
- `app/developer-mode/model.test.js` covers isolated NPC draft logic.
- `worker/tests/` covers request validation, generation contracts, authentication, rate limiting, portraits, and developer storage.

