import { bootstrap } from './bootstrap'
import { createApp } from './app'
import { env } from './infrastructure/config/env'

await bootstrap()

const app = createApp()
app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`)
})
