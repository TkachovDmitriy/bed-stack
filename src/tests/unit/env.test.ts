import { describe, expect, it } from 'bun:test'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  AWS_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  MEILISEARCH_URL: z.string().optional(),
  MEILISEARCH_API_KEY: z.string().optional(),
})

const validBase = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test',
  BETTER_AUTH_SECRET: 'a'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3000',
}

describe('env schema', () => {
  it('parses valid env with defaults', () => {
    const result = envSchema.safeParse(validBase)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.NODE_ENV).toBe('development')
    expect(result.data.PORT).toBe(3000)
    expect(result.data.REDIS_URL).toBe('redis://localhost:6379')
    expect(result.data.ALLOWED_ORIGINS).toBe('http://localhost:5173')
  })

  it('accepts test as NODE_ENV', () => {
    const result = envSchema.safeParse({ ...validBase, NODE_ENV: 'test' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.NODE_ENV).toBe('test')
  })

  it('coerces PORT string to number', () => {
    const result = envSchema.safeParse({ ...validBase, PORT: '8080' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.PORT).toBe(8080)
  })

  it('fails when DATABASE_URL is missing', () => {
    const { DATABASE_URL: _, ...rest } = validBase
    const result = envSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('fails when BETTER_AUTH_SECRET is too short', () => {
    const result = envSchema.safeParse({ ...validBase, BETTER_AUTH_SECRET: 'short' })
    expect(result.success).toBe(false)
  })

  it('fails when DATABASE_URL is not a valid URL', () => {
    const result = envSchema.safeParse({ ...validBase, DATABASE_URL: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('fails when NODE_ENV is an unknown value', () => {
    const result = envSchema.safeParse({ ...validBase, NODE_ENV: 'staging' })
    expect(result.success).toBe(false)
  })

  it('treats optional fields as absent when not provided', () => {
    const result = envSchema.safeParse(validBase)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.AWS_REGION).toBeUndefined()
    expect(result.data.STRIPE_SECRET_KEY).toBeUndefined()
  })
})
