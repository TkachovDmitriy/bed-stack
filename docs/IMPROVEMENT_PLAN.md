# bed-stack — Improvement Plan

A plan for selectively porting **operational practices** from the older `nest-stack`
project (NestJS · Prisma · production app for Kumakatok) into `bed-stack`
(Bun · ElysiaJS · Drizzle · better-auth).

## Guiding principle

bed-stack is the more modern 2026 baseline — **do not** import nest-stack's
architecture wholesale. Most of nest-stack's bulk is hand-rolled plumbing that our
dependencies already provide (auth, tokens, 2FA, sessions → better-auth).

We cherry-pick **policies**, not **plumbing**: take the security/observability
*decisions* nest-stack made, re-expressed in idiomatic Elysia/Bun + pino code that
is a fraction of the size.

---

## Scope at a glance

| # | Improvement | Source of inspiration | Effort | Priority |
|---|-------------|-----------------------|--------|----------|
| 1 | Structured logger upgrade (redaction, base metadata, trace mixin) | `logger.config.ts` | S | **P0** |
| 2 | Request correlation IDs (X-Request-Id round-trip) | `logger.ts` + `rest-logging.interceptor.ts` | S | **P0** |
| 3 | HTTP request/response logging plugin | `rest-logging.interceptor.ts` | M | **P1** |
| 4 | Error tracking (Sentry) with `beforeSend` hygiene | `application.bootstrap.ts` | M | **P1** |
| 5 | Proxy-aware client IP extraction | `rest-logging.interceptor.ts` | S | **P2** |

Effort: S ≈ <1h, M ≈ a few hours.

---

## P0 — Logger upgrade + correlation IDs

The single highest-value, lowest-cost change. Today `src/infrastructure/logger/index.ts`
is a 7-line plain pino export: no secret redaction, no base metadata, no request
correlation.

### What to take from nest-stack (the policies)

- **Redaction with `remove: true`** for `password`, `token`, `authorization`,
  `*.password`, and request header `authorization` / `cookie`. Secrets must never
  reach the log sink. *(nest-stack `logger.config.ts:38-41`)*
- **`base` metadata** — `service` + `version` on every line for cross-instance
  correlation. *(`logger.config.ts:30-35`)*
- **Trace ID on every log line** via `AsyncLocalStorage`. *(`logger.ts`)*

### What to leave behind (the plumbing)

- ❌ nest-stack's `logger.ts` manually re-wraps all six pino level methods (~90 lines)
  just to inject the trace ID. Replace the **entire file** with pino's built-in
  `mixin: () => ({ traceId: getTraceId() })`.
- ❌ `logger-service.ts` — the NestJS DI `LoggerService` with `(string | Record)`
  overloads repeated 6×. We have no DI container; a plain exported `logger` +
  `logger.child()` is enough.
- ❌ Free-text messages (`'New user signed up:'`). **Keep bed-stack's existing
  event-name style** (`bootstrap.db.connected`, `http.error.unhandled`) — it is more
  queryable and already better than nest-stack's.

### Target shape

```ts
// src/infrastructure/logger/index.ts
import { AsyncLocalStorage } from 'node:async_hooks'
import pino from 'pino'
import { env } from '../config/env'

const als = new AsyncLocalStorage<{ traceId: string }>()
export const getTraceId = () => als.getStore()?.traceId
export const runWithTrace = <T>(traceId: string, fn: () => T) => als.run({ traceId }, fn)

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  base: { service: 'bed-stack', version: env.VERSION },
  redact: {
    paths: ['password', 'token', 'authorization', '*.password',
            'req.headers.authorization', 'req.headers.cookie'],
    remove: true,
  },
  mixin: () => ({ traceId: getTraceId() }),
  ...(env.NODE_ENV !== 'production' && { transport: { target: 'pino-pretty' } }),
})
```

### Tasks

- [ ] Add `VERSION` (default `'dev'`) to the env schema in `src/infrastructure/config/env.ts`.
- [ ] Rewrite `src/infrastructure/logger/index.ts` as above.
- [ ] Verify existing call sites (`bootstrap.ts`, `app.ts`) still type-check — API is unchanged.

---

## P1 — Request logging plugin

Port the *logic* of nest-stack's `RestLoggingInterceptor`, dropping the NestJS/RxJS
wrapper. As an Elysia plugin it seeds the trace context and logs one structured line
per request on completion.

### Behaviour to replicate

- Read `X-Request-Id` from the incoming request, or generate one; run the handler
  inside `runWithTrace(...)`.
- **Echo `X-Request-Id` back** on the response header.
- On request finish, log: `method`, `path`, `status`, `durationMs` (via
  `process.hrtime.bigint()` or `performance.now()`), `clientIp`.
- **Level by status**: 5xx → `error`, 4xx → `warn`/`debug`, else `info`.
  *(nest-stack `rest-logging.interceptor.ts` `isServerError`)*

### Tasks

- [ ] Create `src/shared/middleware/request-logger.plugin.ts`.
- [ ] Register it early in `createApp()` (`src/app.ts`), before domain routes.
- [ ] Emit event-name messages, e.g. `http.request.completed`.

---

## P1 — Error tracking (Sentry)

bed-stack has **no error tracking today**. nest-stack's value here is not the SDK
wiring but its `beforeSend` / `beforeSendTransaction` hygiene
*(`application.bootstrap.ts:97-145`)*.

### Policies worth copying

- **Strip `authorization` and `cookie` headers** before any event is sent.
- **Only forward 5xx** — drop client 4xx noise (don't page on user error).
- **Sample high-volume routes** (e.g. health, hot read endpoints) to control volume.

### Tasks

- [ ] Decide on a provider (Sentry, or a lighter alternative). Gate entirely behind
      an optional `SENTRY_DSN` env var — no-op when unset.
- [ ] Initialise in `bootstrap.ts`, enabled only in production.
- [ ] Implement `beforeSend`: drop <500 status, strip auth/cookie headers.
- [ ] Wire the `onError` handler in `app.ts` to report unhandled 5xx.

---

## P2 — Proxy-aware client IP

Small helper mirroring nest-stack's `extractClientIp`: prefer `X-Forwarded-For`
(first hop) → `X-Real-IP` → `CF-Connecting-IP` → socket address. Used by the request
logger (and later rate limiting / audit).

- [ ] Add `getClientIp(headers)` to `src/shared/` and use it in the request plugin.

---

## Explicitly NOT porting

Recorded so this is a deliberate decision, not an oversight:

- ❌ **Auth / login / tokens / 2FA / password reset** — better-auth already covers all
  of it via config. nest-stack's `token.service.ts` (manual RS256 JWS keypair in
  Redis, argon2) and `auth.use-case.ts` would be a regression. *(strongest "old
  project" signal)*
- ❌ **NestJS `LoggerService` DI wrapper** — no DI container here; over-engineered.
- ❌ **4-layer architecture** (`core`/`use-cases`/`presentation`/`infrastructure`) —
  bed-stack's lighter `infrastructure` + `shared` + per-domain plugins is appropriate
  for its size.
- ❌ **Bootstrap / graceful shutdown** — bed-stack's `bootstrap.ts` is already *better*
  (both SIGTERM/SIGINT, 10s force-exit timeout, `uncaughtException`/`unhandledRejection`).
- ❌ **Health endpoint shape** — bed-stack's aggregated `/health` with
  `degraded`/503/uptime is more modern than nest-stack's three split endpoints.

---

## Suggested sequencing

1. **P0** (logger + trace IDs) — foundational; everything else logs through it.
2. **P1 request plugin** — depends on P0's `runWithTrace`.
3. **P1 Sentry** — independent; can land in parallel.
4. **P2 client IP** — folds into the request plugin.

Each item is independently shippable. Recommend one PR per numbered item.
