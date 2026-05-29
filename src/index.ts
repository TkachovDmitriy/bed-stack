import { bootstrap } from './bootstrap'
import { createApp } from './app'
import { env } from './infrastructure/config/env'
import { logger } from './infrastructure/logger'

await bootstrap()

const app = createApp()
app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, `Server running on http://localhost:${env.PORT}`)
})
