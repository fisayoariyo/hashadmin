# Hashmar CropEx — Farmer & Agent App

React (Vite) app: role select → **Farmer** or **Agent** flows. Mobile-first, Tailwind, React Router.

---

## What works today (real API)

These call the **CropEx API** using `fetch` (no axios):

| Flow | What it does |
|------|----------------|
| **Farmer** — phone → OTP | `POST /otp/send`, `POST /otp/verify` |
| **Agent** — create account | OTP (same endpoints) → state/LGA → `POST /agents/register` |
| **Agent** — login | `POST /agents/login` → JWT stored in `sessionStorage` |
| **Agent** — farmers list | `GET /farmers` (Bearer; **auto refresh** on `401` via `POST /agents/refresh`, then one retry) |
| **Agent** — farmer detail | `GET /farmers/{id}` when you open a farmer (merges with list row; shows a warning if the call fails) |
| **Agent** — register farmer | `POST /farmers` (enrollment payload from the wizard) |

**Still mock / UI-only:** farmer home, profile, ID screens (data from `mockData`), agent password reset demo, dashboard “sync all” as local UI, admin APIs (no screens yet).

**Code:** `src/services/cropexHttp.js` (base URL + `fetch` wrapper), `src/services/cropexApi.js` (endpoints + helpers).

---

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### API base URL (optional)

By default the app uses:

`https://hashmaramala-production.up.railway.app`

To override, create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://your-api.example.com
```

(No trailing slash.) See `.env.example`.

---

## How to test the integration

1. **CORS** — The API must allow your dev origin (`http://localhost:5173`). If the browser blocks requests, the backend needs to allow that origin.

2. **Agent — new account**  
   Role → Agent → Get Started → Create account (password **≥ 8** characters) → Verify phone (real OTP from SMS if the backend sends it) → Select state/LGA → Submit (calls **register**).

3. **Agent — login**  
   Use an account that already exists on the server (email + password). Opens **home** and attaches the access token to **farmers** calls.

4. **Agent — farmers**  
   After login: **Saved farmers** should load from **`GET /farmers`**. If the call fails, a red banner shows the error; the app may fall back to cached/mock list.

5. **Agent — enroll farmer**  
   From home → Register farmer → complete steps → submit (calls **`POST /farmers`**). Needs valid token and fields the API requires (NIN, BVN, etc.).

6. **Farmer — OTP**  
   Role → Farmer → through onboarding → enter phone → enter OTP from SMS (**not** a fixed demo code anymore).

7. **Logout (agent)**  
   Settings → log out clears agent session and cached farmer list key used for the API.

If something fails, open **DevTools → Network** and check status codes and response bodies.

---

## Note for backend developer

Hi — the frontend is wired to the **Swagger** base paths: `/otp/send`, `/otp/verify`, `/agents/register`, `/agents/login`, `/agents/refresh` (exported but **not** auto-called yet), `/farmers`, `/farmers/{id}` (**GET by id** not used in UI yet).

**Please confirm or share sample JSON for:**

- Login / refresh responses (exact field names for access and refresh tokens, and agent id if available).
- `GET /farmers` — pagination wrapper and each farmer object shape.
- `POST /farmers` — 201 response body (e.g. farmer `id` / UUID).
- After `POST /otp/verify` for a **farmer** — is there a farmer session token or only agent-facing farmer APIs?

**CORS:** Allow our web origins for local dev and production....


Thanks boss.

---

## Scripts

```bash
npm run dev      # Dev server
npm run build    # Production build
npm run preview  # Preview build locally
```

---

## Stack (short)

| Item | Choice |
|------|--------|
| UI | React 18, Vite, Tailwind, Lucide |
| Routing | React Router v6 |
| API client | `fetch` — `src/services/cropexHttp.js` |

Main routes live in **`src/App.jsx`**. Screens under **`src/pages/`** (farmer / agent / shared). Mock data: **`src/mockData/`**.

Older **`src/screens/`** + **`src/services/api.js`** are legacy placeholders and are **not** what the current router uses for CropEx API calls.
