import { Elysia } from 'elysia'
import { auth } from '../../infrastructure/auth'

export const authMiddleware = new Elysia({ name: 'auth-middleware' }).derive(
  { as: 'scoped' },
  async ({ request, status }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return status(401, { error: 'Unauthorized', code: 'UNAUTHORIZED' })
    return { user: session.user, session: session.session }
  },
)
