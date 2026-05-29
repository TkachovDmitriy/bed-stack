import { swagger } from '@elysiajs/swagger'
import { auth } from '../auth'
import { env } from '../config/env'

// better-auth generates its own OpenAPI spec for all auth endpoints.
// We merge it into our Swagger so everything appears in one place.
const authSchema = await auth.api.generateOpenAPISchema()

export const swaggerConfig = swagger({
  documentation: {
    info: {
      title:       'BED Stack API',
      version:     '1.0.0',
      description: 'Bun · ElysiaJS · Drizzle backend boilerplate',
    },
    servers: [{ url: env.BETTER_AUTH_URL }],
    tags: [
      { name: 'auth', description: 'Authentication' },
      ...(authSchema.tags ?? []),
    ],
    paths: authSchema.paths,
    components: {
      ...(authSchema.components ?? {}),
      securitySchemes: {
        ...(authSchema.components?.securitySchemes ?? {}),
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'better-auth.session_token' },
      },
    },
  },
  mapJsonSchema: { zod: (schema) => (schema as any).toJSONSchema() },
})
