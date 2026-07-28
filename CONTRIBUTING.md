# Contributing

## Development workflow

1. Create a focused branch from `main`.
2. Keep browser game changes in `app/` and API changes in `worker/`.
3. Update documentation when behavior, configuration, storage, or deployment changes.
4. Run `npm test` before opening a pull request.
5. Do not commit generated caches, dependencies, local Worker state, or secrets.

## Design principles

- Keep each manager window usable without page-level scrolling at common desktop sizes.
- Preserve manual squad selection; never silently replace the manager's Starting XI.
- Keep important values readable and avoid overlapping card content.
- Treat saved games as a compatibility contract and migrate older data defensively.
- Keep Developer Mode isolated inside `app/developer-mode/`.

## Commit scope

Prefer small commits that state the outcome, such as:

- `Improve transfer pack opening`
- `Fix red-card scoring segments`
- `Add season opponent scouting`

