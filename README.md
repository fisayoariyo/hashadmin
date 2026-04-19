# Hashmar Admin App

React + Vite + TypeScript + Tailwind admin console for farmer and agent management (desktop-first shell).

## Scripts

- `npm run dev` — dev server (default port **5174** in `vite.config.ts`)
- `npm run build` — typecheck + production bundle
- `npm run preview` — preview production build
- `npm run lint` — ESLint

## Useful routes (dev)

- `/login` — admin login (mock auth until APIs exist)
- `/logout` — clears session and returns to login
- `/login?logout=1` — same as logout (clears then shows login)

---

## Backend handover note

Hey team,

Quick heads-up from the admin web app side so we’re aligned before you wire real APIs.

**Auth today**  
Login is still a **front-end stub**: we’re not calling your auth service yet. Anyone can “sign in” with email + password, we stash a small **session record** (email + display name + timestamp) and send them to the dashboard. Treat that as placeholder until you give us real endpoints and token handling.

**Offline-first storage**  
We’re using **sql.js** (SQLite in WASM) in the browser and **snapshotting the DB to IndexedDB** after writes so refreshes and flaky connectivity still keep session + queued work. There’s also a **localStorage mirror** of the session for older installs; new session reads/writes go through SQLite first.

**Outbox / sync when online**  
Actions we’ll eventually need on the server (today: **login** and **password reset**) append rows to an **`outbox`** table (`kind`, JSON `payload`, `createdAt`, `synced`). When the browser fires **`online`**, we run a **flush** step. Right now that flush only **marks rows as synced locally**—there’s **no HTTP call** yet. When you’re ready, the flow should be: **read pending outbox rows → POST to your services → mark synced or delete based on real responses**, with whatever idempotency and retry rules you want.

**WASM loading**  
sql.js loads its **`.wasm` from jsDelivr** on first use. If CSP or fully air-gapped installs are a concern, we can self-host the wasm under `public/` instead—let us know.

**What would help next**

- Contract for **admin login** (and refresh / logout if we’re doing tokens).
- Contract for **replaying** outbox events (batch vs single, idempotency keys, auth on each call).
- Whether you want the client to **drop the localStorage session mirror** once the API is live.

Ping if anything here doesn’t match how you want the server to behave—we’d rather adjust the client early than paper over mismatches later.

Thanks,

— Frontend / admin app
