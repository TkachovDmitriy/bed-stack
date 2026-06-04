import { sql } from 'drizzle-orm'
import { db } from './infrastructure/db'
import { redis } from './infrastructure/redis'
import { logger } from './infrastructure/logger'

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
