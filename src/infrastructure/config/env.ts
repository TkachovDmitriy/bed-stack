import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV:            z.enum(['development', 'production', 'test']).default('development'),
  PORT:                z.coerce.number().default(3000),
  DATABASE_URL:        z.string().url(),
  BETTER_AUTH_SECRET:  z.string().min(32),
  BETTER_AUTH_URL:     z.string().url(),
  REDIS_URL:           z.string().default('redis://localhost:6379'),
  ALLOWED_ORIGINS:     z.string().default('http://localhost:5173'),
  // AWS S3 — required only when using file uploads
  AWS_REGION:          z.string().optional(),
  S3_BUCKET:           z.string().optional(),
  // Stripe — required only when using payments
  STRIPE_SECRET_KEY:   z.string().optional(),
  // Meilisearch — required only when using search
  MEILISEARCH_URL:     z.string().optional(),
  MEILISEARCH_API_KEY: z.string().optional(),
  // Social login (optional — enable per provider)
  GOOGLE_CLIENT_ID:     z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID:     z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env
