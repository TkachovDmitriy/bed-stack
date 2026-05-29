import { swagger } from '@elysiajs/swagger'
import type { OpenAPIV3 } from 'openapi-types'
import { auth } from '../auth'
import { env } from '../config/env'

// better-auth generates its own OpenAPI spec for all auth endpoints.
// We merge it into our Swagger so everything appears in one place.
const authSchema = await auth.api.generateOpenAPISchema()

export const swaggerConfig = swagger({
  documentation: {
    info: {
      title: 'BED Stack API',
      version: '1.0.0',
      description: 'Bun · ElysiaJS · Drizzle backend boilerplate',
    },
    servers: [{ url: env.BETTER_AUTH_URL }],
    tags: [{ name: 'auth', description: 'Authentication' }, ...(authSchema.tags ?? [])],
    // better-auth's generated OpenAPI types are looser than openapi-types' strict
    // PathsObject / ComponentsObject, so we narrow them at the merge boundary.
    paths: authSchema.paths as OpenAPIV3.PathsObject,
    components: {
      ...(authSchema.components ?? {}),
      securitySchemes: {
        ...(authSchema.components?.securitySchemes ?? {}),
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'better-auth.session_token' },
      },
    } as OpenAPIV3.ComponentsObject,
  },
})
