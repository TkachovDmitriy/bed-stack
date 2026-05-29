# Elysia Patterns — Code Examples

## Plugin Structure

```ts
// domains/users/users.plugin.ts
import { Elysia } from 'elysia'
import { authMiddleware } from '../../shared/middleware/auth.middleware'
import { usersService } from './users.service'
import { CreateUserDto, UpdateUserDto, ListUsersQueryDto } from './users.dto'

export const usersPlugin = new Elysia({ prefix: '/users', tags: ['users'] })
  // public routes
  .get('/:id', ({ params }) => usersService.findById(params.id), {
    detail: { summary: 'Get user by id' },
  })
  // protected routes
  .use(authMiddleware)
  .guard({ as: 'scoped' }, app =>
    app
      .get('/', ({ user, query }) => usersService.list(query, user), {
        query: ListUsersQueryDto,
        detail: { summary: 'List users', security: [{ bearerAuth: [] }] },
      })
      .post('/', ({ body, user }) => usersService.create(body, user), {
        body: CreateUserDto,
        detail: { summary: 'Create user', security: [{ bearerAuth: [] }] },
      })
      .patch('/:id', ({ params, body, user }) => usersService.update(params.id, body, user), {
        body: UpdateUserDto,
        detail: { summary: 'Update user', security: [{ bearerAuth: [] }] },
      })
      .delete('/:id', ({ params, user }) => usersService.delete(params.id, user), {
        detail: { summary: 'Delete user', security: [{ bearerAuth: [] }] },
      })
  )
```

## Domain index.ts — Public API Only

```ts
// domains/users/index.ts
export { usersPlugin } from './users.plugin'
// nothing else — service, repository, dto are private to this domain
```

## app.ts — Wiring Only

```ts
// app.ts
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { rateLimit } from 'elysia-rate-limit'
import { swaggerConfig } from './infrastructure/config/swagger'
import { auth } from './infrastructure/auth'
import { logger } from './infrastructure/logger'
import { usersPlugin } from './domains/users'
import { postsPlugin } from './domains/posts'
import { env } from './infrastructure/config/env'
import { AppError } from './shared/errors/app-error'

export function createApp() {
  const v1 = new Elysia({ prefix: '/api/v1' })
    .use(usersPlugin)
    .use(postsPlugin)

  return new Elysia()
    .use(cors({
      origin:      env.NODE_ENV === 'production' ? env.ALLOWED_ORIGINS.split(',') : true,
      credentials: true,
    }))
    .use(rateLimit({ duration: 60_000, max: 100 }))
    .use(swaggerConfig)
    .mount('/api/auth', auth.handler)
    .onError(({ error, set }) => {
      if (error instanceof AppError) {
        set.status = error.statusCode
        return { error: error.message, code: error.code }
      }
      logger.error({ err: error }, 'http.error.unhandled')
      set.status = 500
      return { error: 'Internal server error', code: 'INTERNAL_ERROR' }
    })
    .use(v1)
}
```

## API Versioning

```ts
// v1 stays untouched when v2 is added
const v1 = new Elysia({ prefix: '/api/v1' }).use(usersPlugin)
const v2 = new Elysia({ prefix: '/api/v2' }).use(usersV2Plugin)

app.use(v1).use(v2)
// domain folder structure never changes — only plugin registration differs
```

## Stateless Service — abstract class

```ts
// domains/users/users.service.ts
import { usersRepository } from './users.repository'
import { NotFoundError } from '../../shared/errors/app-error'

export abstract class UserService {
  static async findById(id: string) {
    const user = await usersRepository.findById(id)
    if (!user) throw new NotFoundError('User')
    return user
  }

  static async list(filters: ListUsersInput) {
    return usersRepository.findMany(filters)
  }
}
```

## Auth Middleware — derive

```ts
// shared/middleware/auth.middleware.ts
import { Elysia } from 'elysia'
import { auth } from '../../infrastructure/auth'

// name → Elysia deduplicates when plugin is used in multiple places
// as: 'scoped' → context leaks only into the current plugin's routes
export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  .derive({ as: 'scoped' }, async ({ request, error }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return error(401, { error: 'Unauthorized', code: 'UNAUTHORIZED' })
    return { user: session.user, session: session.session }
  })
```

## Swagger Config

```ts
// infrastructure/config/swagger.ts
import { swagger } from '@elysiajs/swagger'
import { env } from '../config/env'

export const swaggerConfig = swagger({
  documentation: {
    info: { title: 'BED Stack API', version: '1.0.0', description: '...' },
    servers: [{ url: env.BETTER_AUTH_URL }],
    tags: [
      { name: 'users', description: 'User management' },
      { name: 'auth', description: 'Authentication' },
    ],
    components: {
      securitySchemes: {
        // Bearer token from POST /api/auth/sign-in/email (bearer plugin)
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        // Session cookie set automatically on sign-in
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'better-auth.session_token' },
      },
    },
  },
  mapJsonSchema: { zod: (schema) => (schema as any).toJSONSchema() },
})
```

## How to test protected routes in Swagger UI

1. `POST /api/auth/sign-in/email` — sign in, copy `token` from response
2. Click **Authorize** → paste token into `bearerAuth`
3. All routes with `security: [{ bearerAuth: [] }]` are now authenticated

## bootstrap.ts

```ts
// bootstrap.ts
import { db } from './infrastructure/db'
import { redis } from './infrastructure/redis'
import { logger } from './infrastructure/logger'

export async function bootstrap() {
  logger.info('Starting application...')
  await db.$connect?.()
  await redis.ping()
  logger.info('All services connected')
}
```

## index.ts — Entry Point

```ts
// index.ts
import { bootstrap } from './bootstrap'
import { createApp } from './app'
import { env } from './infrastructure/config/env'

await bootstrap()
const app = createApp()
app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`)
})
```

## Testing with app.handle

```ts
// tests/integration/users.test.ts
import { describe, it, expect } from 'bun:test'
import { createApp } from '../../src/app'

const app = createApp()

describe('GET /api/v1/users/:id', () => {
  it('returns 404 for unknown user', async () => {
    const res = await app.handle(new Request('http://localhost/api/v1/users/unknown'))
    expect(res.status).toBe(404)
  })

  it('returns user', async () => {
    const res = await app.handle(new Request('http://localhost/api/v1/users/user-1'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.id).toBe('user-1')
  })
})
```
