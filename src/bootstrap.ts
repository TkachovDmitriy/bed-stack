
import { redis } from './infrastructure/redis'
import { logger } from './infrastructure/logger'

export async function bootstrap() {
  logger.info('Starting application...')

  await redis.ping()

  logger.info('All services connected')
}
