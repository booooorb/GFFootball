# GFFootball

GFFootball is a browser-based generative fantasy football management game. Build a themed squad, manually arrange the Starting XI, scout and sign players, simulate seasons, create NPC clubs, and track goals, assists, form, standings, and Ballon d'Or history.

This repository is the standalone development home for the game. A production build may later be integrated into `booooorb.github.io`, but game changes and documentation are tracked here independently.

## Repository layout

- `app/` — static browser game, game simulation, save migration, UI, tests, and optional Developer Mode.
- `worker/` — Cloudflare Worker for Gemini generation, Turnstile verification, portrait discovery, rate limiting, and shared developer data.
- `docs/` — architecture, development, deployment, and UI planning documents.

## Quick start

Requirements:

- Node.js 20 or newer
- npm
- Python 3 or another static file server
- A Cloudflare account for Worker development or deployment

Install Worker dependencies:

```powershell
npm --prefix worker install
```

Run all tests:

```powershell
npm test
```

Serve the browser game:

```powershell
python -m http.server 8000 --directory app
```

Open `http://localhost:8000`.

The checked-in `app/config.js` points to the current production Worker. For local Worker development, follow [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Current gameplay systems

- Initial formation-complete 11-player squad generation
- Transfer scouting packs with 10- or 11-player compatibility
- Full-screen pack opening and three manager-selected free transfers
- Manual tactics board, formation changes, flexible positional fitting, and role penalties
- Match simulation with goals, assists, cards, dismissals, and post-red-card scoring effects
- Ten-match seasons, standings, fixture history, recent form, statistics, and Ballon d'Or records
- Optional isolated Developer Mode for drafting and publishing NPC opponents
- Club identity editing and scalable transparent team crests

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Development](docs/DEVELOPMENT.md)
- [Deployment](docs/DEPLOYMENT.md)
- [UI overhaul plan](docs/UI_OVERHAUL_PLAN.md)
- [Contributing](CONTRIBUTING.md)

## Security

Never commit Gemini, Turnstile, SerpAPI, Cloudflare, or developer-mode secrets. Browser configuration contains public endpoints and public Turnstile site keys only. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for secret setup.

