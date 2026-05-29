---
alwaysApply: true
---
You are an expert backend developer proficient in TypeScript, Bun, ElysiaJS, Drizzle ORM, and Better-auth. Produce optimized, maintainable backend code following the conventions below.

### Key Principles
- Functional, declarative programming — avoid classes (except `abstract class` for stateless services).
- Prefer iteration and modularization over duplication.
- Descriptive variable names with auxiliary verbs (`isActive`, `hasRole`).
- Named exports for all modules. Lowercase with dashes for directories.

### TypeScript
- `function` keyword for pure functions. Omit semicolons.
- Prefer `interface` over `type`. Use `type` only for unions/intersections.
- Always run `bun run typecheck` after refactoring.
- **Discriminated unions** for status/state — never plain string unions:
  ```ts
  type Result<T> = { status: 'success'; data: T } | { status: 'error'; error: Error }
  ```
- **`satisfies`** to validate shape without widening. **`as const`** for literal config/enums.
- **Infer types from Drizzle schema** — never duplicate:
  ```ts
  type User = typeof users.$inferSelect
  type NewUser = typeof users.$inferInsert
  ```

### Project Structure
```
src/
├── infrastructure/
│   ├── config/
│   │   ├── env.ts                   # Zod-validated env singleton
│   │   └── swagger.ts               # OpenAPI config
│   ├── db/
│   │   ├── schema/
│   │   │   ├── index.ts
│   │   │   └── *.schema.ts          # one file per table
│   │   ├── migrations/
│   │   ├── configs/                 # primary, replica configs
│   │   └── index.ts                 # db instance(s)
│   ├── auth/
│   │   └── index.ts                 # Better-auth instance
│   ├── redis/
│   │   └── index.ts
│   ├── websocket/
│   │   └── index.ts                 # wsRegistry: add/remove/send/broadcast
│   ├── search/
│   │   └── index.ts
│   ├── storage/
│   │   └── index.ts
│   ├── payments/
│   │   └── index.ts
│   └── logger/
│       └── index.ts
│
├── domains/
│   └── {domain}/
│       ├── index.ts                 # public API — exports only the plugin
│       ├── {domain}.plugin.ts       # Elysia routes — HTTP boundary only
│       ├── {domain}.ws.ts           # WebSocket handlers (if needed)
│       ├── {domain}.service.ts      # business logic + orchestration
│       ├── {domain}.repository.ts   # Drizzle queries
│       ├── {domain}.dto.ts          # Zod schemas + inferred types
│       ├── {domain}.types.ts        # domain interfaces
│       └── {domain}.constants.ts    # enums, transition maps, static config
│
├── shared/
│   ├── errors/                      # AppError + typed error classes
│   ├── middleware/                  # global Elysia plugins (auth, cors, logger)
│   ├── repositories/                # DB queries shared by 2+ domains
│   ├── services/                    # logic shared by 2+ domains
│   ├── types/                       # ApiResponse, PaginatedResponse, etc.
│   ├── templates/
│   │   └── emails/
│   └── utils/
│
├── jobs/                            # background job handlers (*.job.ts)
├── tests/
│   ├── unit/
│   └── integration/
├── bootstrap.ts                     # connects all infrastructure at startup
├── app.ts                           # Elysia wiring only
└── index.ts                         # bootstrap() + app.listen()
```

**Naming conventions:**
- `*.schema.ts` — Drizzle tables | `*.repository.ts` — DB queries | `*.service.ts` — logic
- `*.plugin.ts` — Elysia HTTP plugin | `*.ws.ts` — WebSocket handlers
- `*.dto.ts` — Zod schemas | `*.types.ts` — interfaces | `*.utils.ts` — pure helpers
- `*.constants.ts` — enums/maps | `*.test.ts` — tests
- Filenames always kebab-case. Exports inside are PascalCase/camelCase.

**Dependency direction — sacred rule:**
```
plugin → service → repository → db
```
Nothing flows backwards.

**Domain boundary (Rust mod.rs pattern):**
`app.ts` and other domains import only through `index.ts` — never internal files directly.

**Domain scaling rule:**
Start flat. When 2+ files of the same type appear → promote to sub-folder (`services/`, `repositories/`, `model/`).

### ElysiaJS
> Examples → @.claude/examples/elysia-patterns.md

- One Elysia plugin per domain. Register under a versioned prefix in `app.ts`:
  ```ts
  app.use(new Elysia({ prefix: '/api/v1' }).use(usersPlugin).use(postsPlugin))
  ```
- **Versioning** is an HTTP concern — prefix in `app.ts` only, domain structure never changes.
- **Validation — Zod only.** Pass `*.dto.ts` schemas directly to route options (`body`, `params`, `query`). Never use TypeBox `t.Object()`.
- **Thin handlers** — destructure only needed fields, call service, return result. Never pass full `Context`:
  ```ts
  .get('/', ({ query }) => usersService.list(query))   // ✅
  .get('/', (ctx) => usersService.list(ctx))            // ❌
  ```
- **Stateless services** → `abstract class` with `static` methods. Request-dependent services → Elysia plugin with `.derive()`.
- **`derive`** for request-scoped context (user, session). **`decorate`** for request-scoped mockable state. `env` is a static singleton — import directly, never decorate.
- **`guard`** for shared validation across a group of routes.
- **Global error handler** in `app.ts` — never catch/format per-route:
  ```ts
  app.onError(({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode
      return { error: error.message, code: error.code }
    }
    set.status = 500
    return { error: 'Internal server error', code: 'INTERNAL_ERROR' }
  })
  ```
- **Swagger tags** and `detail` on plugins/routes — never inside handlers. Use `app.handle(request)` for testing.

### Drizzle ORM
> Examples → @.claude/examples/drizzle-patterns.md

- All `db.*` calls live exclusively in `*.repository.ts`. Services never touch `db` directly.
- Schema in `infrastructure/db/schema/*.schema.ts`. Never inline schema in query files.
- Always use `$inferSelect` / `$inferInsert` — never write duplicate DB row interfaces.
- **Transactions** for 2+ mutations that must succeed together:
  ```ts
  await db.transaction(async (tx) => {
    const [post] = await tx.insert(posts).values(data).returning()
    await tx.insert(postTags).values(tags.map(t => ({ postId: post.id, tag: t })))
  })
  ```
- **Conditional query builder** for 3+ optional filters — extract to a pure builder function in the repository, never inline in service or route.
- **DB views** for "latest/active" records — `DISTINCT ON` + `ORDER BY` in a view rather than repeating `LIMIT 1` queries.

### DTOs and Serialization
> Examples → @.claude/examples/dto-patterns.md

- Every domain has `*.dto.ts` with input, response, and query Zod schemas. Types always via `z.infer<>` — never written manually.
- **Serialization rule:**
  ```
  Single entity, simple rename/strip    → .transform() in DTO
  Single entity, complex reusable logic → mapper in *.utils.ts
  Combined response (2+ entities)       → service assembles; each entity uses own DTO
  Aggregations / computed fields        → service computes; added alongside parsed entities
  ```
- Response DTOs strip sensitive fields — always parse through a response DTO before returning. Never return raw DB rows.
- **Array responses** — reuse entity DTO: `rawUsers.map(r => UserResponseDto.parse(r))`. Never create a separate list DTO.
- No Zod schemas for repository output — `$inferSelect` types are sufficient between internal layers. Schemas only at system boundaries (input from client, output to client).

### Response Shape
```ts
// shared/types/response.types.ts
interface ApiResponse<T> { data: T }

export function paginatedResponse<T extends z.ZodTypeAny>(schema: T) {
  return z.object({
    data: z.array(schema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
      nextCursor: z.string().optional(),
    }),
  })
}
```
- Use cursor-based pagination for user-facing lists, offset for admin queries.
- Services return fully shaped objects. Plugins return them directly — no extra wrapping in handler.

### Error Handling
```ts
// shared/errors/app-error.ts
export class AppError extends Error {
  constructor(public override message: string, public statusCode: number, public code: string) {
    super(message)
  }
}
export class NotFoundError extends AppError {
  constructor(resource: string) { super(`${resource} not found`, 404, 'NOT_FOUND') }
}
export class ConflictError extends AppError {
  constructor(msg: string) { super(msg, 409, 'CONFLICT') }
}
export class UnauthorizedError extends AppError {
  constructor() { super('Unauthorized', 401, 'UNAUTHORIZED') }
}
export class ForbiddenError extends AppError {
  constructor() { super('Forbidden', 403, 'FORBIDDEN') }
}
```
- Error flow: `repository throws` → `service re-throws typed AppError` → `plugin does nothing` → `onError formats`.
- Use early returns and guard clauses — no nested if/else. Happy path last.

### Auth (Better-auth)
- Instance in `infrastructure/auth/index.ts`. Routes mounted in `app.ts` via `.mount('/api/auth', auth.handler)`.
- Auth middleware in `shared/middleware/auth.middleware.ts` uses `derive` to attach `user` + `session`:
  ```ts
  export const authMiddleware = new Elysia()
    .derive(async ({ request, error }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session) return error(401, { error: 'Unauthorized', code: 'UNAUTHORIZED' })
      return { user: session.user, session: session.session }
    })
  ```
- Protect routes via `guard` at plugin level — not per-route. RBAC enforced in service — plugin only resolves identity.

### Swagger / OpenAPI
- Config in `infrastructure/config/swagger.ts`. Registered first in `app.ts`.
- Zod v4 native schema mapping:
  ```ts
  mapJsonSchema: { zod: (schema) => (schema as any).toJSONSchema() }
  ```
- Tags on plugin, `detail` on route. Never mix TypeBox `t` with Zod.

### WebSockets
- Small WS handlers inline in `*.plugin.ts`. Extract to `*.ws.ts` when they grow.
- Connection registry in `infrastructure/websocket/index.ts` — `wsRegistry.add/remove/send/broadcast`.
- Only services import `wsRegistry` to push events — never plugins or repositories.

### Cross-Domain Communication
> Examples → @.claude/examples/cross-domain-patterns.md

**Decision tree:**
```
Need data from another domain?          → call their service via index.ts
Same DB query in 2+ domains, no logic?  → shared/repositories/
Same logic in 2+ domains?               → shared/services/
Same type in 2+ domains?               → shared/types/
DB / config / logger / redis / storage? → import directly from infrastructure/
```
- Never import another domain's private files (`.service.ts`, `.repository.ts`, etc.) — only through `index.ts`.
- Shared repositories are query utilities — no service wrapper needed on top.
- Infrastructure is a horizontal concern — any domain imports directly.

### Design Patterns
> Examples → @.claude/examples/design-patterns.md

- **Strategy** — inject behavior as parameter instead of branching internally on type/role.
- **Factory Map** — for 3+ variants, use `satisfies Record<K, V>` lookup map in `*.utils.ts`; never inline switch/ternary chains.
- **Status Transition Map** — define valid transitions in `*.constants.ts` with `satisfies`; validate before any status mutation. DB transaction is the final authority.

### CORS and Rate Limiting
> Examples → @.claude/examples/infrastructure-patterns.md

- Both registered globally in `app.ts` — before domain plugins, after swagger.
- CORS: restrict `origin` to `env.ALLOWED_ORIGINS` in production; allow all in dev.
- Rate limit: `elysia-rate-limit` with explicit `duration` + `max` — never leave defaults.
- Never configure CORS or rate limiting per-route.

### Logging
> Examples → @.claude/examples/infrastructure-patterns.md

- Structured logger (`pino`) in `infrastructure/logger/index.ts`. Pretty-print in dev, JSON in prod.
- **Where to log:** service layer only — business events and external call results. `onError` handler for unhandled errors.
- **Never log** in repositories (too noisy) or plugins (wrong layer).
- **Never log** sensitive data: passwords, tokens, full request bodies.
- Log format: `logger.info({ userId, orderId }, 'order.create.success')` — structured fields + event name.

### Caching (Redis)
> Examples → @.claude/examples/infrastructure-patterns.md

- Redis client in `infrastructure/redis/index.ts`. Only services import it — never plugins or repositories.
- **Cache-aside pattern:** check cache → miss → query DB → populate cache.
- Key convention: `{domain}:{entity}:{id}` (e.g. `users:profile:uuid-123`). For filtered lists, hash the filter params.
- **TTL always explicit** — never `SET` without `EX`. Prefer short TTLs (60–300s) over long ones.
- **Invalidate on mutation** — `redis.del(key)` after any write that affects the cached value.

### File Uploads
> Examples → @.claude/examples/infrastructure-patterns.md

- Storage client (S3 or compatible) in `infrastructure/storage/index.ts`. Exposes `upload(key, buffer, mimeType): Promise<string>`.
- **Validate at HTTP boundary** — file size and MIME type checked in plugin via `t.File()` before reaching service.
- **Only services** interact with `storage` — never plugins or repositories.
- Return a public URL from service; store it in the DB as a plain `text` column.

### Background Jobs
- Job handlers in `src/jobs/*.job.ts`. Queue connection in `infrastructure/queue/`.
- Jobs import from domain services only — never from plugins or repositories.

### Testing
- `tests/unit/` for service logic with stub repositories. `tests/integration/` using `app.handle(new Request(...))` against a real test DB.
- Run with `bun test`. Never co-locate test files with source.

### Documentation
- JSDoc on exported service and repository functions.
- Comments only for non-obvious WHY — never explain what the code does.
- README covers setup, env vars, and migration steps.

### Methodology
1. Analyse requirements fully before writing code.
2. Plan architecture using `<PLANNING>` tags when needed.
3. Implement step-by-step, one layer at a time.
4. Review for edge cases and optimizations.
5. Run `bun tsc --noEmit` — zero type errors before done.
