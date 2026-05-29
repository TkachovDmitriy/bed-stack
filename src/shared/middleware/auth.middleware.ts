import { Elysia } from 'elysia'
import { auth } from '../../infrastructure/auth'

export const authMiddleware = new Elysia()
  .derive(async ({ request, error }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return error(401, { error: 'Unauthorized', code: 'UNAUTHORIZED' })
    return { user: session.user, session: session.session }
  })
