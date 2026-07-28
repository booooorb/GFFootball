# Development

## Install

The browser app has no runtime package dependencies. Install Worker dependencies:

```powershell
npm --prefix worker install
```

## Tests

Run everything from the repository root:

```powershell
npm test
```

Or run suites separately:

```powershell
npm run test:app
npm run test:worker
```

## Browser app

Start a static server:

```powershell
python -m http.server 8000 --directory app
```

Open `http://localhost:8000`.

Do not open `app/index.html` directly with a `file:` URL because ES modules and network requests require an HTTP origin.

## Local Worker

Copy the example without committing the resulting file:

```powershell
Copy-Item worker\.dev.vars.example worker\.dev.vars.development
```

Fill in the private local values, then run:

```powershell
npm --prefix worker run dev
```

For local integration, temporarily set `app/config.js` to:

```js
window.GFF_CONFIG = {
  apiBaseUrl: "http://localhost:8787",
  turnstileSiteKey: "dev-bypass",
};
```

Restore production public configuration before publishing a production frontend.

## Developer Mode isolation

Developer Mode lives entirely inside `app/developer-mode/` and is loaded with a dynamic import. Public gameplay must continue to function if that directory is removed.

