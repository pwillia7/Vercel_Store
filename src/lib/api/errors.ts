export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get isNotFound() {
    return this.status === 404
  }

  get isUnauthorized() {
    return this.status === 401 || this.status === 403
  }

  get isServerError() {
    return this.status >= 500
  }

  get isValidationError() {
    return this.status === 422
  }
}

/**
 * Convert any thrown value into a user-safe error message.
 * Raw API errors, network failures, and unexpected values are
 * all normalized so the UI never receives stack traces.
 */
export function normalizeError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNotFound) return 'The requested resource was not found.'
    if (err.isUnauthorized) return 'Access denied. Please check your credentials.'
    if (err.isValidationError) return 'Invalid request. Please check your input.'
    if (err.isServerError) return 'The server encountered an error. Please try again later.'
    return err.message
  }

  if (err instanceof Error) {
    // Don't leak internal error messages to users
    if (process.env.NODE_ENV === 'development') return err.message
    return 'An unexpected error occurred.'
  }

  return 'An unexpected error occurred.'
}
