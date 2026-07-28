# Deployment

## Browser application

`app/` is a static site and can be hosted by GitHub Pages, Cloudflare Pages, or another static host.

Before publishing:

1. Confirm `app/config.js` contains only the public Worker URL and public Turnstile site key.
2. Add the production frontend hostname to the Worker's `ALLOWED_ORIGINS`.
3. Add the hostname to the Cloudflare Turnstile widget.
4. Run `npm test`.

No private key belongs in `app/`.

## Cloudflare Worker

Install dependencies and authenticate Wrangler:

```powershell
npm --prefix worker install
npx --prefix worker wrangler whoami
```

Store production secrets interactively from `worker/`:

```powershell
cd worker
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put SERPAPI_API_KEY
npx wrangler secret put DEVELOPER_MODE_TOKEN
```

Validate before deploying:

```powershell
npm run test
npm run worker:deploy:check
npm --prefix worker run deploy
```

`worker/wrangler.jsonc` currently identifies the existing production Worker account and KV bindings. Review those identifiers before deploying from another Cloudflare account.

## GitHub integration

This repository is the canonical development history. If the game is later served through `booooorb.github.io`, integrate a tested snapshot from this repository instead of developing against two divergent copies.

