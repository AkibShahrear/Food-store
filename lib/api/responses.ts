import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: string
  timestamp: string
}

export interface PaginationResponse<T = any> extends ApiResponse {
  data: T[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  statusCode: number = 200,
  message?: string
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Create a standardized paginated response
 */
export function paginationResponse<T>(
  data: T[],
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  },
  statusCode: number = 200
): NextResponse<PaginationResponse<T>> {
  const response: PaginationResponse<T> = {
    success: true,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  error: string,
  statusCode: number = 500,
  details?: string
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error,
    details,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Create a standardized validation error response
 */
export function validationErrorResponse(
  error: string,
  details?: string
): NextResponse<ApiResponse> {
  return errorResponse(error, 400, details)
}

/**
 * Create a standardized not found response
 */
export function notFoundResponse(resource: string = 'Resource'): NextResponse<ApiResponse> {
  return errorResponse(`${resource} not found`, 404)
}

/**
 * Create a standardized unauthorized response
 */
export function unauthorizedResponse(message: string = 'Not authenticated'): NextResponse<ApiResponse> {
  return errorResponse(message, 401)
}

/**
 * Create a standardized forbidden response
 */
export function forbiddenResponse(message: string = 'Access denied'): NextResponse<ApiResponse> {
  return errorResponse(message, 403)
}

/**
 * Create a standardized conflict response
 */
export function conflictResponse(message: string = 'Resource already exists'): NextResponse<ApiResponse> {
  return errorResponse(message, 409)
}
