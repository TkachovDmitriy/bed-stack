import { defineConfig } from 'drizzle-kit'

// biome-ignore lint/style/noDefaultExport: drizzle-kit requires a default export
export default defineConfig({
  schema:      './src/infrastructure/db/schema/index.ts',
  out:         './src/infrastructure/db/migrations',
  dialect:     'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict:  true,
})
