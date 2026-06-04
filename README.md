# BED Stack

Backend boilerplate — **B**un · **E**lysiaJS · **D**rizzle ORM.

## Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Runtime     | [Bun](https://bun.sh)                   |
| Framework   | [ElysiaJS](https://elysiajs.com)        |
| ORM         | [Drizzle ORM](https://orm.drizzle.team) |
| Database    | PostgreSQL 16                           |
| Cache       | Redis 7                                 |
| Auth        | [Better-auth](https://better-auth.com)  |
| Validation  | Zod                                     |
| Docs        | Swagger UI (`/swagger`)                 |

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.2
- [Docker](https://docker.com) + Docker Compose

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Copy env and fill in secrets
cp .env.example .env

# 3. Start infrastructure (Postgres + Redis)
docker compose up -d

# 4. Run migrations
bun db:migrate

# 5. Start dev server
bun dev
```

Server: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/swagger`  
Health check: `http://localhost:3000/health`

## Environment Variables

Copy `.env.example` to `.env`. Required variables:

| Variable             | Description                              |
|----------------------|------------------------------------------|
| `DATABASE_URL`       | PostgreSQL connection string             |
| `BETTER_AUTH_SECRET` | Random secret ≥ 32 chars                 |
| `BETTER_AUTH_URL`    | Public URL of this server                |
| `REDIS_URL`          | Redis connection string (default: `redis://localhost:6379`) |

Optional variables:

| Variable              | Default                    | Description              |
|-----------------------|----------------------------|--------------------------|
| `PORT`                | `3000`                     | HTTP port                |
| `NODE_ENV`            | `development`              | `development` / `production` / `test` |
| `ALLOWED_ORIGINS`     | `http://localhost:5173`    | CORS whitelist (comma-separated, production only) |
| `GOOGLE_CLIENT_ID/SECRET` | —                      | Google OAuth             |
| `GITHUB_CLIENT_ID/SECRET` | —                      | GitHub OAuth             |
| `AWS_REGION` + `S3_BUCKET` | —                     | File uploads             |
| `STRIPE_SECRET_KEY`   | —                          | Payments                 |
| `MEILISEARCH_URL/API_KEY`  | —                     | Full-text search         |

## Database

```bash
bun db:generate   # generate migration from schema changes
bun db:migrate    # apply migrations
bun db:push       # push schema directly (dev only)
bun db:studio     # open Drizzle Studio
```

Schema files live in `src/infrastructure/db/schema/*.schema.ts`.

## Auth Endpoints

Better-auth is mounted at `/api/auth`. Key endpoints:

| Method | Path                              | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | `/api/auth/sign-up/email`         | Register                 |
| POST   | `/api/auth/sign-in/email`         | Login → returns `token`  |
| POST   | `/api/auth/sign-out`              | Logout                   |
| GET    | `/api/auth/get-session`           | Current session          |
| POST   | `/api/auth/sign-in/social`        | OAuth redirect           |
| GET    | `/api/auth/list-sessions`         | All active sessions      |
| POST   | `/api/auth/revoke-session`        | Revoke session by token  |
| POST   | `/api/auth/revoke-other-sessions` | Revoke all except current |
| POST   | `/api/auth/two-factor/enable`     | Enable TOTP 2FA          |
| POST   | `/api/auth/two-factor/verify-totp`| Verify TOTP code         |

Pass the bearer token as `Authorization: Bearer <token>` or via session cookie.

## Scripts

```bash
bun dev          # watch mode
bun start        # production
bun test         # run tests
bun typecheck    # tsc --noEmit
bun check        # biome lint + format
```

## Project Structure

```
src/
├── infrastructure/   # db, auth, redis, logger, storage, payments, search, websocket
├── domains/          # feature modules (plugin → service → repository)
├── shared/
│   ├── errors/       # AppError + typed subclasses
│   ├── health/       # GET /health (db + redis status)
│   ├── middleware/   # auth middleware
│   ├── types/        # ApiResponse, PaginatedResponse
│   └── utils/
├── jobs/             # background job handlers
├── tests/            # unit + integration
├── bootstrap.ts      # infrastructure startup
├── app.ts            # elysia wiring
└── index.ts          # entry point
```

Each domain follows the pattern:

```
domains/{name}/
├── index.ts              # public API — export only the plugin
├── {name}.plugin.ts      # routes
├── {name}.service.ts     # business logic
├── {name}.repository.ts  # db queries
├── {name}.dto.ts         # zod schemas + inferred types
├── {name}.types.ts       # domain interfaces (optional)
├── {name}.constants.ts   # enums, transition maps (optional)
└── {name}.ws.ts          # websocket handlers (optional)
```

Dependency direction: `plugin → service → repository → db`. Nothing flows backwards.  
Other domains are imported only through a domain's `index.ts`, never internal files directly.
