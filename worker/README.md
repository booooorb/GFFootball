# GFFootball Worker

Cloudflare Worker API for the Generative Fantasy Football game.

## What it does

- Keeps the Gemini API key out of the GitHub Pages frontend.
- Verifies Cloudflare Turnstile before every generation.
- Allows six successful public transfer markets per IP per UTC day.
- Does not count failed generations, and does not apply the public quota to
  localhost or `127.0.0.1` development.
- Calls the Gemini Developer API with the stable
  `gemini-3.5-flash-lite` model and a strict JSON Schema. If that model has a
  model-specific quota or availability incident, generation retries once
  against the free-tier `gemini-3.1-flash-lite` model.
- Returns a formation-complete eleven-player squad for a club's first theme,
  which the browser signs automatically.
- Returns ten balanced positional candidates for later themes; the browser
  randomly marks three as free transfers and prices the other seven locally.
- Asks for a re-entered theme whenever Gemini does not produce a complete
  player list, and maps free-quota exhaustion to `rate_limited`; there is no
  paid-model fallback.
- Validates all names, exclusions, positions, refusals, and error states.
- Checks developer-curated portraits before any Wikipedia, Wikimedia Commons,
  or Openverse lookup.
- Exposes a developer-token-protected SerpAPI Google Images search for one
  player at a time, returns the top 20 results, and permanently stores the
  selected first and second raster images in the existing `PORTRAIT_CACHE` KV
  namespace. Search sessions expire after 15 minutes.
- Exposes `GET /v1/status` so the game can distinguish a configured Gemini
  Worker from a missing or unreachable service.

## Zero-billing requirement

Create the API key in a Google AI Studio project whose plan is shown as
**Free**. Do not select **Set up billing** and do not link a Cloud Billing
account. The Worker cannot change a Google project's billing plan; it only
pins generation to the free-tier-eligible `gemini-3.5-flash-lite` model.

When both free-tier models refuse a request because quota is exhausted, the
Worker returns a rate-limit error and the game asks the player to try again
later. It never falls back to a paid-only model.

- [Google AI Studio API keys](https://aistudio.google.com/apikey)
- [Gemini API billing](https://ai.google.dev/gemini-api/docs/billing)
- [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)

Keep the Cloudflare account on the Workers Free plan as well. The Worker uses
automatically provisioned KV namespaces for daily quotas and portrait caching.

## Production setup

The production Worker is pinned to Cloudflare account
`28e49e2050f7f826b35df79466003256` in `wrangler.jsonc`. Before changing
secrets or deploying, run `npx wrangler whoami` and confirm that account is
listed. This account migration creates fresh Worker, KV, and Turnstile
resources; resource IDs and secrets from the legacy account are not reusable.

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create a free-tier key at Google AI Studio. Confirm that its project is
   labelled **Free**.

3. Create a Cloudflare Turnstile widget restricted to
   `booooorb.github.io`. Keep the public site key and private secret separate.

4. Store the private secrets interactively:

   ```powershell
   npx wrangler secret put GEMINI_API_KEY
   npx wrangler secret put TURNSTILE_SECRET
   npx wrangler secret put SERPAPI_API_KEY
   npx wrangler secret put DEVELOPER_MODE_TOKEN
   ```

   Wrangler will display `Enter a secret value:` for each command. Paste the
   corresponding value and press Enter. The pasted value may not be visible.
   Use a long random value for `DEVELOPER_MODE_TOKEN`; Developer Mode asks for
   it only when opening a SerpAPI search. Never put any secret in `config.js`,
   GitHub, or a command argument.

5. Validate and deploy:

   ```powershell
   npm run test
   npm run deploy:check
   npm run deploy
   ```

6. Copy the deployed Worker URL and public Turnstile site key into
   `../app/config.js`.

The production `RATE_LIMIT` and `PORTRAIT_CACHE` KV namespaces are bound in
`wrangler.jsonc`. The development environment continues to use local KV
simulation.

## Local development

Copy `.dev.vars.example` to `.dev.vars.development`, replace the placeholder
values with a free-tier Gemini API key, your SerpAPI key, and a private
developer access token. Leave `TURNSTILE_SECRET=dev-bypass`. Never commit
`.dev.vars.development`.

Opening the image picker does not call SerpAPI. Only **Run search** spends one request.

Run the Worker and static site in separate terminals:

```powershell
npm run dev
python -m http.server 8000 --directory ../app
```

For local development only, point `app/config.js` at
`http://localhost:8787` and set `turnstileSiteKey` to `dev-bypass`.

The frontend shows the generator as offline when `apiBaseUrl` is blank; it
never presents placeholder names as Gemini output.
