import { sql } from 'drizzle-orm'
import { Elysia } from 'elysia'
import { db } from '../../infrastructure/db'
import { redis } from '../../infrastructure/redis'

type ServiceStatus = 'ok' | 'error'

interface HealthCheck {
  status: 'ok' | 'degraded'
  uptime: number
  services: {
    database: ServiceStatus
    redis: ServiceStatus
  }
}

async function checkDatabase(): Promise<ServiceStatus> {
  try {
    await db.execute(sql`SELECT 1`)
    return 'ok'
  } catch {
    return 'error'
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  try {
    await redis.ping()
    return 'ok'
  } catch {
    return 'error'
  }
}

export const healthPlugin = new Elysia({ name: 'health' }).get(
  '/health',
  async ({ set }) => {
    const [database, redisStatus] = await Promise.all([checkDatabase(), checkRedis()])

    const health: HealthCheck = {
      status: database === 'ok' && redisStatus === 'ok' ? 'ok' : 'degraded',
      uptime: Math.floor(process.uptime()),
      services: {
        database,
        redis: redisStatus,
      },
    }

    if (health.status === 'degraded') {
      set.status = 503
    }

    return health
  },
  {
    detail: {
      tags: ['system'],
      summary: 'Health check',
      description: 'Returns service health status. 200 = healthy, 503 = degraded.',
    },
  },
)
