import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  paginationResponse,
  successResponse,
  validationErrorResponse,
  errorResponse,
} from '@/lib/api/responses'
import {
  handleDatabaseError,
  validateRequiredFields,
  getErrorInfo,
} from '@/lib/api/errors'

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * GET /api/products
 * Fetch all products with optional filtering and pagination
 * 
 * Query Parameters:
 * - category: Filter by product category
 * - search: Search by product name or description
 * - sortBy: Sort field (price, name, created_at) - default: created_at
 * - order: Sort order (asc, desc) - default: desc
 * - page: Page number for pagination - default: 1
 * - limit: Items per page - default: 10, max: 100
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const order = (searchParams.get('order') || 'desc').toLowerCase()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))

    // Validate sort order
    if (!['asc', 'desc'].includes(order)) {
      return validationErrorResponse('Invalid sort order. Must be "asc" or "desc"')
    }

    // Validate sortBy field
    const validSortFields = ['price', 'name', 'created_at', 'stock']
    if (!validSortFields.includes(sortBy)) {
      return validationErrorResponse(
        `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`
      )
    }

    // Build the query
    let query = supabase.from('products').select('*', { count: 'exact' })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: order === 'asc' })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data: products, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      throw handleDatabaseError(error)
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / limit)

    return paginationResponse(products || [], {
      total: count || 0,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    })
  } catch (err) {
    console.error('API error:', err)
    const { message, statusCode, details } = getErrorInfo(err)
    return statusCode === 400
      ? validationErrorResponse(message, details)
      : errorResponse(message, statusCode, details)
  }
}

/**
 * POST /api/products
 * Create a new product (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Parse request body
    const body = await request.json()

    // Validate required fields
    const validation = validateRequiredFields(body, ['name', 'price'])
    if (!validation.valid) {
      return validationErrorResponse(
        `Missing required fields: ${validation.missingFields.join(', ')}`
      )
    }

    const { name, description, price, category, stock, calories, spicy_level, image_url } = body

    // Validate price
    if (typeof price !== 'number' || price < 0) {
      return validationErrorResponse('Price must be a positive number')
    }

    // Insert product
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          description: description || null,
          price,
          category: category || null,
          stock: stock || 0,
          calories: calories || null,
          spicy_level: spicy_level || null,
          image_url: image_url || null,
        },
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      throw handleDatabaseError(error)
    }

    return successResponse(data?.[0], 201)
  } catch (err) {
    console.error('API error:', err)
    const { message, statusCode, details } = getErrorInfo(err)
    return statusCode === 400
      ? validationErrorResponse(message, details)
      : errorResponse(message, statusCode, details)
  }
}
