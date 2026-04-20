# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn dev` — run dev server on port **2323** (hardcoded in `package.json`).
- `yarn build` — static build via `@sveltejs/adapter-static` into `./build`.
- `yarn check` / `yarn check:watch` — `svelte-kit sync` + `svelte-check` type check.
- `yarn lint` — Prettier check + ESLint. `yarn format` writes Prettier fixes.
- `yarn test` — Playwright. There are no test files in the repo yet.
- Node version is pinned to **19.8.1** via `engines` + `engineStrict` — matching the CI workflow. Use `nvm`/equivalent.

## Architecture

SvelteKit 1.x SPA, fully prerendered (`src/routes/+layout.ts` sets `prerender = true`, `svelte.config.js` uses `adapter-static`). Deployed to GitHub Pages on push to `master` (`.github/workflows/deployment.yml`, custom domain `decider.cyber-man.pl` via `CNAME`). Because everything is static, all user/data logic runs in the browser — there is **no server code**.

### Backend

A remote PocketBase instance at `https://pocketbase.cyber-man.pl` is the only backend. The client is constructed once in `src/lib/index.ts` as the exported `pb` singleton. Collections in use:

- `users` — auth via `pb.collection("users").authWithPassword(...)`.
- `matrices` — plaintext decision matrices; includes `isShared` flag used for public share links.
- `matrices_encrypted` — client-side-encrypted matrices; the server only ever sees ciphertext.
- `chats` + `messages` — realtime chat via `pb.collection("messages").subscribe("*", ...)`.

### State model (`src/lib/index.ts`)

Svelte stores are the single source of truth and are mirrored to `localStorage` via subscriptions set up in `subscribe()`. Every page that reads this state **must** call `onMountHandler()` inside `onMount` — it (1) hydrates stores from `localStorage`, (2) wires the persistence subscriptions, (3) runs an optional callback. Skipping it means stores stay empty and nothing persists.

Core stores: `decisionMatrix`, `decisionMatrixId` (null = unsaved), `errorMessage` (derived reactively from matrix validity in `+page.svelte`), `user`, `shouldEncrypt`, `symmetricKey`.

### Encryption model

All encryption is client-side, AES-CTR via WebCrypto.

- `createKey(password)` derives a 16-byte hex key by SHA-256-hashing the password `0xffff` times. It is called at login (`src/routes/login/+page.svelte`) from the plaintext password the user just typed — **this is the only time the plaintext password is available**, so the key cannot be recovered on refresh if it's missing from `localStorage`. `decryptMatrix` throws `"No key provided. Please logout and log in again."` in that case; preserve that flow.
- `encryptWithKey` / `decryptWithKey` use format `"<hex iv>:<base64 ciphertext>"`. `decryptMatrix` reads the key from a module-local `_matrixKey` mirror of the store (synchronous access).
- `SaveButton.svelte` branches on `$shouldEncrypt` to write to either `matrices` or `matrices_encrypted`. Sharing (`ShareButton`) only applies to the plaintext collection — encrypted matrices are intentionally not shareable (see the `!$decisionMatrix.isEncrypted` guards in `+page.svelte`).

### Routes layout

Routes are flat under `src/routes/`. Per-page helper components sit **next to** their page (e.g. `CriteriaField.svelte`, `SaveButton.svelte`, `ShareButton.svelte` all live directly in `src/routes/`, not in `$lib`). Shared code lives in `src/lib` and is imported as `$lib`. Subroutes: `/login`, `/register`, `/logout`, `/my-decisions`, `/chats`, `/chats/create`. The root `+page.svelte` also handles `?share=<id>` by fetching from `matrices` on mount.

### Scoring

`DecisionResult.svelte` scores each item as `sum(criteria.value * criteria.importance) / criteria.length`, rounded to 4 decimals, sorted desc. The "Score / Max score" column is relative to the top item. `denominator` is computed but unused.

## Conventions

- Styling is Bulma (CDN link in `src/app.html`) + Font Awesome; there is no CSS framework installed via npm. Keep using Bulma classes.
- Error surface is `alert(err.message ?? err.toString())` inside try/catch around PocketBase calls. Match this style rather than introducing a toast system unless asked.
- Prefer editing existing per-page components; do not reorganize them into `$lib` without reason — the flat layout is intentional.
- Note: `.prettierrc` currently contains tsconfig-shaped content (likely a historical mistake). Prettier still runs with defaults; don't "fix" this without confirming.
