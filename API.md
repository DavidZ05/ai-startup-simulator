# API

All paths begin with `/api`. Responses are JSON. Protected routes require `Authorization: Bearer <token>`. API responses are never cached.

During development, the frontend uses relative `/api` URLs through Vite on `127.0.0.1:5173` (or `localhost:5173`), which proxies to the backend on port 3001. In the production container, frontend and API share port 3001. For connection diagnostics, check `/api/health` through the frontend address as well as directly on the backend; see [README.md](README.md#frontendbackend-connection).

## Authentication

| Method | Path | Body / result |
| --- | --- | --- |
| POST | `/auth/register` | `{username,password}` → 201 `{token,user}` |
| POST | `/auth/login` | `{username,password}` → `{token,user}` |
| GET | `/auth/me` | Current user |
| GET | `/health` | Public health status |

Registration: username 3–32 characters after trimming; password at least 8 characters and at most 72 UTF-8 bytes. Tokens expire after 7 days. No fixed test credentials are included.

## Games (authenticated)

| Method | Path | Contract |
| --- | --- | --- |
| GET | `/games` | Current user’s saved-game summaries |
| POST | `/games` | `{companyName,industry,targetUsers}` → 201 game record |
| GET | `/games/:id` | Owned game with authoritative `state` |
| POST | `/games/:id/turn` | `{decisions:[{id}],revision}` → monthly result plus `snapshot` |
| POST | `/games/:id/purchase` | `{type,id,revision}`; type is `tech`, `market`, or `employee` → `{success,company,snapshot}` |
| POST | `/games/:id/exit` | `{type,revision,offerId?}`; type is `ipo` or `acquisition` → `{success,snapshot}` |
| GET | `/games/:id/history` | Owned game’s server-recorded turn history |
| DELETE | `/games/:id` | Delete owned game and dependent history/ranking |
| DELETE | `/games/user/all` | Delete current user’s games, history and ranking |

Company name is 2–30 characters, target customers 2–50. Industry accepts a canonical ID or name from `src/config/decisions.ts`. Client economic state is ignored at creation.

`state` / `snapshot`: `{company,history,turn,revision,endCondition}`. `endCondition` is null during play and `{type,reason}` at completion. A game record also includes `id`, `company_name`, `industry`, `is_active`, and `updated_at`.

A mutation uses the revision in the last server snapshot. A successful mutation increments it once. After a timeout, reload the game before retrying; the server may already have applied the request. A stale request or mutation of an ended game returns 409. Unknown or unavailable actions return 400 with no state changes.

`PUT /games/:id`, `POST /games/:id/history` and `POST /leaderboard` return 405: these are server-owned operations. Terminal scores are recorded automatically in the same transaction as the ending state. Acquisition amounts and IPO eligibility come from saved server state.

## Rankings and storage

| Method | Path | Contract |
| --- | --- | --- |
| GET | `/leaderboard?limit=20` | Public rankings; limit clamped to 1–100 |
| GET | `/leaderboard/my` | Authenticated user’s scores |
| GET | `/storage/stats` | `{games,historyEntries,totalSize}` for current user’s serialized game data |
| POST | `/storage/cleanup` | Remove only current user’s inactive games older than 90 days; `{success,deleted,message}` |

## Errors

`{error: string}` with 400 invalid input, 401 unauthenticated, 404 missing/not-owned game, 405 disabled write endpoint, 409 stale/ended game, 413 oversized body, 429 rate limit, or 500 unexpected server failure. Internal error details are logged on the server, not returned to the browser.
