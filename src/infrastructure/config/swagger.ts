import { swagger } from '@elysiajs/swagger'

export const swaggerConfig = swagger({
  documentation: {
    info: { title: 'BED Stack API', version: '1.0.0' },
    tags: [
      { name: 'auth', description: 'Authentication' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer' },
      },
    },
  },
  mapJsonSchema: { zod: (schema) => (schema as any).toJSONSchema() },
})
