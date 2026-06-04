import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { rateLimit } from 'elysia-rate-limit'
import { auth } from './infrastructure/auth'
import { env } from './infrastructure/config/env'
import { swaggerConfig } from './infrastructure/config/swagger'
import { logger } from './infrastructure/logger'
import { AppError } from './shared/errors/app-error'
import { healthPlugin } from './shared/health/health.plugin'

export function createApp() {
  const v1 = new Elysia({ prefix: '/api/v1' })
  // register domain plugins here:
  // .use(usersPlugin)

  return new Elysia()
    .use(
      cors({
        origin: env.NODE_ENV === 'production' ? env.ALLOWED_ORIGINS.split(',') : true,
        credentials: true,
      }),
    )
    .use(rateLimit({ duration: 60_000, max: 100 }))
    .use(swaggerConfig)
    .use(healthPlugin)
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
