export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) { super(`${resource} not found`, 404, 'NOT_FOUND') }
}

export class ConflictError extends AppError {
  constructor(msg: string) { super(msg, 409, 'CONFLICT') }
}

export class UnauthorizedError extends AppError {
  constructor() { super('Unauthorized', 401, 'UNAUTHORIZED') }
}

export class ForbiddenError extends AppError {
  constructor() { super('Forbidden', 403, 'FORBIDDEN') }
}

export class ValidationError extends AppError {
  constructor(msg: string) { super(msg, 422, 'VALIDATION_ERROR') }
}
