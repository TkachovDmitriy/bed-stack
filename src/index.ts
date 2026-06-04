import { createApp } from './app'
import { bootstrap } from './bootstrap'
import { env } from './infrastructure/config/env'
import { pgClient } from './infrastructure/db'
import { logger } from './infrastructure/logger'
import { redis } from './infrastructure/redis'

await bootstrap()

const app = createApp()

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'server.listening')
})

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'shutdown.initiated')

  // Force-exit if graceful shutdown stalls (e.g. stuck WebSocket connections)
  const forceExit = setTimeout(() => {
    logger.error('shutdown.timeout — forcing exit')
    process.exit(1)
  }, 10_000)
  // Don't let this timer keep the process alive on its own
  forceExit.unref()

  try {
    // Stop accepting new HTTP connections; in-flight requests finish naturally
    app.server?.stop()

    // Drain and close infrastructure connections
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
