import { createApp } from './app'
import { bootstrap, startServer } from './bootstrap'
import { env } from './infrastructure/config/env'

await bootstrap()

const app = createApp()
startServer(app, env.PORT)
