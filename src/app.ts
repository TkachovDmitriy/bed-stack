import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swaggerConfig } from './infrastructure/config/swagger'
import { auth } from './infrastructure/auth'
import { env } from './infrastructure/config/env'
import { AppError } from './shared/errors/app-error'

export function createApp() {
  const v1 = new Elysia({ prefix: '/api/v1' })
    // register domain plugins here:
    // .use(usersPlugin)

  return new Elysia()
    .use(cors({
      origin:      env.NODE_ENV === 'production' ? env.ALLOWED_ORIGINS.split(',') : true,
      credentials: true,
    }))
    .use(swaggerConfig)
    .mount('/api/auth', auth.handler)
    .onError(({ error, set }) => {
      if (error instanceof AppError) {
        set.status = error.statusCode
        return { error: error.message, code: error.code }
      }
      set.status = 500
      return { error: 'Internal server error', code: 'INTERNAL_ERROR' }
    })
    .use(v1)
}
