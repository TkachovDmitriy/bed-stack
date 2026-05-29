# Infrastructure Patterns — Code Examples

## Redis — connection

```ts
// infrastructure/redis/index.ts
import { Redis } from 'ioredis'
import { env } from '../config/env'

export const redis = new Redis(env.REDIS_URL)
```

## Caching — cache-aside pattern

```ts
// domains/users/users.service.ts
import { redis } from '../../infrastructure/redis'
import { usersRepository } from './users.repository'
import { UserResponseDto } from './users.dto'

const CACHE_TTL = 300 // seconds

export abstract class UserService {
  static async findById(id: string) {
    const cacheKey = `users:profile:${id}`

    // 1. check cache
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    // 2. cache miss — query DB
    const user = await usersRepository.findById(id)
    if (!user) throw new NotFoundError('User')

    const response = UserResponseDto.parse(user)

    // 3. populate cache — TTL always explicit
    await redis.set(cacheKey, JSON.stringify(response), 'EX', CACHE_TTL)

    return response
  }

  static async update(id: string, data: UpdateUserInput) {
    const user = await usersRepository.update(id, data)

    // invalidate on mutation — never let stale data linger
    await redis.del(`users:profile:${id}`)

    return UserResponseDto.parse(user)
  }
}
```

## Cache key conventions

```ts
// key format: {domain}:{entity}:{id}  or  {domain}:{list}:{hash-of-filters}
'users:profile:uuid-123'
'users:list:page=1&role=admin'
'products:detail:uuid-456'
'sessions:user:uuid-789'

// never use raw object keys — serialize filters deterministically
import { createHash } from 'crypto'

function cacheKey(prefix: string, filters: object): string {
  const hash = createHash('md5').update(JSON.stringify(filters)).digest('hex')
  return `${prefix}:${hash}`
}
```

## Logger — structured output

```ts
// infrastructure/logger/index.ts
import pino from 'pino'
import { env } from '../config/env'

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  ...(env.NODE_ENV !== 'production' && {
    transport: { target: 'pino-pretty' },
  }),
})
```

## Logging conventions — what and where

```ts
// ✅ log in service layer — business events and external call results
export abstract class OrderService {
  static async create(data: CreateOrderInput, userId: string) {
    logger.info({ userId, total: data.total }, 'order.create.start')

    const order = await ordersRepository.create({ ...data, userId })

    logger.info({ orderId: order.id, userId }, 'order.create.success')
    return order
  }
}

// ✅ log errors at the onError handler — not per-route
app.onError(({ error, request }) => {
  if (!(error instanceof AppError)) {
    logger.error({ err: error, url: request.url }, 'unhandled_error')
  }
  // ...
})

// ❌ never log in repositories — too noisy, wrong layer
// ❌ never log sensitive data
logger.info({ password: data.password })   // ❌
logger.info({ token: session.token })      // ❌
logger.info({ userId, action: 'login' })   // ✅
```

## File uploads — multipart + storage

```ts
// infrastructure/storage/index.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../config/env'

const s3 = new S3Client({ region: env.AWS_REGION })

export const storage = {
  async upload(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    await s3.send(new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key:    key,
      Body:   buffer,
      ContentType: mimeType,
    }))
    return `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`
  },
}
```

```ts
// domains/avatars/avatars.plugin.ts — validate at HTTP boundary
import { Elysia, t } from 'elysia'
import { AvatarService } from './avatars.service'

export const avatarsPlugin = new Elysia({ prefix: '/avatars', tags: ['avatars'] })
  .use(authMiddleware)
  .post('/upload', ({ body, user }) => AvatarService.upload(body.file, user.id), {
    body: t.Object({
      file: t.File({ maxSize: '5m', type: ['image/jpeg', 'image/png', 'image/webp'] }),
    }),
    detail: { summary: 'Upload avatar', security: [{ bearerAuth: [] }] },
  })
```

```ts
// domains/avatars/avatars.service.ts — storage interaction only in service
import { storage } from '../../infrastructure/storage'
import { randomUUID } from 'crypto'

export abstract class AvatarService {
  static async upload(file: File, userId: string): Promise<{ url: string }> {
    const ext = file.name.split('.').pop()
    const key = `avatars/${userId}/${randomUUID()}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const url    = await storage.upload(key, buffer, file.type)

    await usersRepository.update(userId, { avatarUrl: url })

    return { url }
  }
}
```

## CORS + Rate Limiting — global middleware in app.ts

```ts
// app.ts
import { cors }      from '@elysiajs/cors'
import { rateLimit } from 'elysia-rate-limit'

export function createApp() {
  return new Elysia()
    .use(cors({
      origin:      env.NODE_ENV === 'production' ? env.ALLOWED_ORIGINS : true,
      credentials: true,
    }))
    .use(rateLimit({
      duration: 60_000,  // 1 minute window
      max:      100,     // requests per window
    }))
    .use(swaggerConfig)
    // ... rest of app
}
```
