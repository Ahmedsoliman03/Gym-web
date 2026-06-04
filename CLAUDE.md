# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server (default port 3000)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (Next core-web-vitals + TS, with `unused-imports`)

There is no test runner configured. Type-checking happens implicitly via `next build` / IDE; `tsc --noEmit` works because `tsconfig.json` already sets `noEmit: true` plus strict / `noUnusedLocals` / `noUnusedParameters` / `noImplicitReturns`.

Required env: `NEXT_PUBLIC_API_URL` (the upstream backend, e.g. `http://localhost:8001`). The dev `.env` defaults to this.

## Architecture

**Stack:** Next.js 16 App Router (React 19), TypeScript strict, Tailwind v4, next-intl (en/ar), TanStack Query v5, Axios, Formik + Yup, next-themes (dark-forced).

### Locale-prefixed routing

Every user-facing route lives under `app/[locale]/...` with locales `en` and `ar` (`i18n/routing.ts`). The app's root (`/`) redirects through middleware; `app/[locale]/page.tsx` further redirects to `/coaches`. Always import navigation primitives (`Link`, `useRouter`, `usePathname`, `redirect`) from `@/i18n/routing`, **not** from `next/navigation` / `next/link`, so locale prefixes are preserved. The locale layout (`app/[locale]/layout.tsx`) sets `dir="rtl"` when locale is `ar` and swaps the font family between Geist (en) and Almarai (ar).

Translations live in `messages/{en,ar}.json` and are loaded by `i18n/request.ts`. Keep both files in sync when adding keys.

### Auth + RBAC in middleware

`middleware.ts` is the single source of truth for auth gating and role-based access — it runs **before** `next-intl`'s middleware (which it composes into step 8). Flow:

1. Read JWT from cookies (`access_token` or `token`).
2. No token + non-auth path → redirect to `/{locale}/login`.
3. Token + auth path → redirect to `/{locale}`.
4. Decode JWT payload **in-edge** (custom base64 decoder — no jsonwebtoken) and read `userType` / `user_type` / `role`.
5. Enforce route restrictions: `coach` is blocked from `/applications`; `client` is blocked from `/jobs` and `/applications`; `gym` has full access.

**Important:** never trust the `user_type` cookie for access control — it is non-HttpOnly and exists only for the UI. Always derive role from the JWT (mirrors the comment in `middleware.ts:78-83`). The auth paths list (`/login`, `/register`, `/verify-otp`, `/request-access`, `/activate`) is duplicated in three places — `middleware.ts`, `utils/axios.ts`, and `components/navbar.tsx` — keep them in sync.

### Backend proxy

The browser never calls the backend directly. `app/api/[...slug]/route.ts` is a catch-all proxy:

- Forwards `GET/POST/PUT/DELETE` to `${NEXT_PUBLIC_API_URL}/api/{slug}`.
- Translates the `access_token` cookie into an `Authorization: Bearer ...` header server-side, so the token can stay HttpOnly.
- In production, enforces CSRF by matching `Origin` host against `Host` exactly (`includes()` would be bypassable).
- Adds an `ngrok-skip-browser-warning` header for tunneled dev.
- On `auth/logout`, explicitly clears `access_token`, `refresh_token`, `user_type` cookies (defensive — in case the backend response didn't).
- After auth responses, extracts `userType` from the JSON body and writes a non-HttpOnly `user_type` cookie for client/middleware convenience.

The Axios client (`utils/axios.ts`) uses `baseURL: '/'` + `withCredentials: true` so all calls go through this proxy. Its 401 interceptor redirects to `/{locale}/login` but skips redirect if already on an auth page (avoids loops).

### Data layer

TanStack Query is wired in `components/providers/query-provider.tsx` (default `staleTime: 60s`). The convention in `features/*/services/*.service.ts` is to export both a raw async function (e.g. `getProfile`) and a hook wrapper (`useProfileQuery`). Mutations update relevant query caches via `setQueryData` and invalidate by query key. Known query keys: `['session']`, `['profile']`, `['gyms']`, `['coaches']`, etc.

### Feature-based folder layout

Top-level domain logic lives in `features/{auth,profile,gyms,coaches,jobs,chat,notification}/`. Each feature typically has:

- `components/` — feature-scoped UI
- `services/` — server calls + React Query hooks
- `hooks/` — public hook composing the services (e.g. `useAuthUser`, `useProfileUser`)
- `types.ts`, `validations.ts`

Shared / cross-feature UI sits under `components/` (`navbar.tsx`, `components/ui/*`, `components/shared/*`, `components/providers/*`). Constants and static option lists are in `constants/`. The `@/*` path alias maps to the repo root, so imports look like `@/features/auth/...`, `@/components/...`, `@/utils/axios`.

### User-type-driven UI

User profiles are discriminated unions over `userType`: `'client' | 'coach' | 'gym'` (`features/profile/types.ts`). The navbar (`components/navbar.tsx:107-113`) and profile page conditionally render based on this. When adding role-gated features, gate **both** in middleware (for security) and in the UI (for UX) — middleware alone is correct but the UI should hide what the user can't reach.

### Theming

`ThemeProvider` is mounted with `forcedTheme="dark"` in the locale layout, so dark mode is the only theme. CSS custom properties (`--background`, `--foreground`, `--primary`, `--surface`) are defined in `app/globals.css` and exposed to Tailwind v4 through `@theme` — extend colors there, not in `tailwind.config`. Tailwind v4 has no `tailwind.config.{js,ts}` in this repo; configuration lives in `postcss.config.mjs` + `@theme` blocks.

# API 

For any API-related task:

ALWAYS read:

- ./postman/GymSpot_Auth_API.postman_collection.json
- ./postman/README.md

These files are the source of truth.
# Build
When the user says:

"finish task"

You must:

1. Run npm run build
2. Fix all build errors
3. Run npm run build again
4. Repeat until build succeeds
5. Only then consider the task complete

# Commit
When the user says:

"Commit and push"

You must:

1. start flow of push changes 
2. Commit changes with message about changes implemented
3. then push
4. if any issue appear about push ask user about it 