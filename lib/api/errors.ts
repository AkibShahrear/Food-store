/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
  public statusCode: number
  public details?: string

  constructor(
    message: string,
    statusCode: number = 500,
    details?: string
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

/**
 * Validation error class
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: string) {
    super(message, 400, details)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Unauthorized error class
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Not authenticated') {
    super(message, 401)
    this.name = 'UnauthorizedError'
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

/**
 * Forbidden error class
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403)
    this.name = 'ForbiddenError'
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}

/**
 * Conflict error class
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409)
    this.name = 'ConflictError'
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

/**
 * Database error class
 */
export class DatabaseError extends ApiError {
  constructor(message: string, details?: string) {
    super(message, 500, details)
    this.name = 'DatabaseError'
    Object.setPrototypeOf(this, DatabaseError.prototype)
  }
}

/**
 * Check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Extract error message and status code
 */
export function getErrorInfo(error: unknown): {
  message: string
  statusCode: number
  details?: string
} {
  if (isApiError(error)) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
    }
  }

  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
  }
}

/**
 * Handle database errors from Supabase
 */
export function handleDatabaseError(error: any): ApiError {
  if (!error) {
    return new DatabaseError('Unknown database error')
  }

  const message = error.message || 'Database operation failed'
  const code = error.code

  // Map common database error codes
  switch (code) {
    case '23505': // Unique violation
      return new ConflictError('This record already exists')
    case '23503': // Foreign key violation
      return new ApiError('Related records not found', 400, message)
    case '42703': // Column does not exist
      return new DatabaseError('Invalid database query', message)
    case '42501': // Permission denied
      return new ForbiddenError('Permission denied for this operation')
    case '42P01': // Table does not exist
      return new DatabaseError('Database table not found', message)
    case 'PGRST116': // Record not found
      return new NotFoundError('Record')
    default:
      return new DatabaseError('Database error occurred', message)
  }
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  obj: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter((field) => !obj[field])
  return {
    valid: missingFields.length === 0,
    missingFields,
  }
}

/**
 * Sanitize error message (remove sensitive info)
 */
export function sanitizeErrorMessage(error: any): string {
  const message = error?.message?.toString() || 'An error occurred'

  // Remove sensitive paths and details
  return message
    .replace(/\/home\/.*?\//g, '/path/')
    .replace(/\/var\/.*?\//g, '/path/')
    .replace(/host=.*?;/g, 'host=***;')
    .replace(/password.*?;/g, 'password=***;')
}
