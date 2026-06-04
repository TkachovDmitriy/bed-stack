import { sql } from 'drizzle-orm'
import type { createApp } from './app'
import { db, pgClient } from './infrastructure/db'
import { logger } from './infrastructure/logger'
import { redis } from './infrastructure/redis'

async function connectDatabase(): Promise<void> {
  await db.execute(sql`SELECT 1`)
  logger.info('bootstrap.db.connected')
}

async function connectRedis(): Promise<void> {
  await redis.ping()
  logger.info('bootstrap.redis.connected')
}

export async function bootstrap(): Promise<void> {
  logger.info('bootstrap.start')

  const [dbResult, redisResult] = await Promise.allSettled([connectDatabase(), connectRedis()])

  if (dbResult.status === 'rejected') {
    logger.fatal({ err: dbResult.reason }, 'bootstrap.db.failed')
  }

  if (redisResult.status === 'rejected') {
    logger.fatal({ err: redisResult.reason }, 'bootstrap.redis.failed')
  }

  const hasFailed = dbResult.status === 'rejected' || redisResult.status === 'rejected'

  if (hasFailed) {
    process.exit(1)
  }

  logger.info('bootstrap.complete')
}

export function startServer(app: ReturnType<typeof createApp>, port: number): void {
  app.listen(port, () => {
    logger.info({ port }, 'server.listening')
  })

  async function shutdown(signal: string): Promise<void> {
    logger.info({ signal }, 'shutdown.initiated')

    const forceExit = setTimeout(() => {
      logger.error('shutdown.timeout — forcing exit')
      process.exit(1)
    }, 10_000)
    forceExit.unref()

    try {
      app.server?.stop()
      await redis.quit()
      await pgClient.end()
      logger.info('shutdown.complete')
      process.exit(0)
    } catch (err) {
      logger.error({ err }, 'shutdown.error')
      process.exit(1)
    }
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'process.uncaughtException')
    process.exit(1)
  })

  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'process.unhandledRejection')
    process.exit(1)
  })
}
