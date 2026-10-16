# Architecture

## Responsibilities

```text
src/components       UI and presentation-only interactions
src/context          Providers and hooks; orchestrate API requests
src/state/game.ts    UI reducer; applies authoritative snapshots
src/services/api.ts  Same-origin HTTP client, timeouts, typed errors
src/types            Shared domain types and HTTP response contracts
src/config           Canonical gameplay definitions and balance constants
src/engine           Pure calculations, turn processing and purchase validation
server/app.ts        Express application factory (no listening or database side effects)
server/index.ts      Environment loading, configuration, database and process lifecycle
server/config.ts     Validated runtime configuration
server/middleware    Authentication and per-app rate limiting
server/routes        HTTP parsing and response codes
server/services      Owned-game lookup, transactions, revision checks and ranking
server/db.ts         Database creation, schema and transactional maintenance
server/test          Real HTTP API tests against in-memory SQLite
src/test             Engine and component/state regression tests
```

## State ownership

The browser submits company metadata or action identifiers. Initial funds, purchase costs, effects, turn outcomes, exit eligibility and scores are computed on the server from canonical definitions. `PUT /games/:id`, history writes and client score submission are disabled.

Each save carries `revision`. Mutations include the expected revision; stale requests return 409 before applying effects. A per-provider lock prevents double-click requests in one browser. A lost response may leave the client behind the server; the UI asks the player to reload and does not retry or reroll automatically.

A SQLite transaction with an immediate write lock contains state/revision changes, terminal ranking and turn history. Completed games reject further actions. Persisted end conditions restore the ending screen after reload. Existing saves without revision fields begin at revision 0; existing users and game data are not deleted by an upgrade. Previously forged legacy data cannot be retroactively authenticated.

## Trust and isolation

JWT secrets are read after environment loading. Production requires a non-placeholder secret of at least 32 characters. Development can generate an ephemeral key. Verification restricts the algorithm to HS256 and checks that the subject user still exists.

Every owned game lookup includes `user_id`. Cleanup through HTTP is scoped to that user; global cleanup is only a server startup or operator command. Child ranking/history records are deleted before games, within a transaction. API responses use `Cache-Control: no-store`; the Service Worker bypasses APIs, authorization headers and other origins, and purges old app caches on activation.

The frontend does not store economic snapshots in local storage or upload offline progress. Local storage holds only the login token and audio preference. No browser fallback can override a server rejection. Passwords use bcrypt and registration rejects inputs exceeding its 72-byte limit.

## Deployment

Development binds the Vite frontend to IPv4 loopback `127.0.0.1`, avoiding a localhost/IPv6 listener mismatch. Browser requests use relative `/api` paths and are forwarded by Vite to port 3001, or to `VITE_PROXY_TARGET` when explicitly configured at startup. Both local processes must be running. Separate frontend origins have separate login storage.

A multi-stage Node.js 24 image builds both applications and compiles the shared engine alongside the backend. The runtime contains only frontend output, server output and production server dependencies. It serves one origin, avoiding container-local browser API addresses and frontend/backend port mismatches. A persistent volume holds SQLite, and the runtime user is unprivileged.

## Presentation

The existing workbench visual design is retained: warm paper, dark navigation and a restrained burnt-orange accent. `tokens.css` defines the portable palette, fonts, spacing and control shape; `src/redesign.css` owns composition and Tailwind aliases. Components use those tokens. Fonts are local and there are no third-party font requests.

## Verification and limits

Regression coverage includes cross-user access, canonical creation, rejected state writes, stale revisions, inactive games, terminal persistence, cleanup/deletion foreign keys, history ownership, purchases, UI failures and public-only caching. Production artifacts are smoke-tested from their compiled entrypoint. Docker daemon availability is required to validate the image itself.

This remains a single-node SQLite application with process-local rate limiting. There is no distributed-session revocation, multiplayer, global scheduling service, or CI/CD deployment automation.
