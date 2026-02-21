import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  errorResponse,
} from '@/lib/api/responses'
import {
  isValidUUID,
  handleDatabaseError,
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
 * GET /api/products/[id]
 * Fetch a single product by ID with its ratings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Validate UUID format
    if (!isValidUUID(id)) {
      return validationErrorResponse('Invalid product ID format')
    }

    const supabase = getSupabaseClient()

    // Fetch product with ratings
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (productError) {
      console.error('Database error:', productError)
      throw handleDatabaseError(productError)
    }

    // Fetch product ratings
    const { data: ratings, error: ratingsError } = await supabase
      .from('product_ratings')
      .select('id, rating, review, user_id, created_at')
      .eq('product_id', id)
      .order('created_at', { ascending: false })

    if (ratingsError) {
      console.error('Database error:', ratingsError)
      // Continue without ratings if there's an error
    }

    // Calculate average rating
    const averageRating =
      ratings && ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
        : null

    return successResponse({
      ...product,
      ratings: {
        average: averageRating,
        count: ratings?.length || 0,
        reviews: ratings || [],
      },
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
 * PATCH /api/products/[id]
 * Update a product by ID (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Validate UUID format
    if (!isValidUUID(id)) {
      return validationErrorResponse('Invalid product ID format')
    }

    const supabase = getSupabaseClient()
    const body = await request.json()

    // Validate price if provided
    if (body.price !== undefined && (typeof body.price !== 'number' || body.price < 0)) {
      return validationErrorResponse('Price must be a positive number')
    }

    // Update product
    const { data, error } = await supabase
      .from('products')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw handleDatabaseError(error)
    }

    return successResponse(data)
  } catch (err) {
    console.error('API error:', err)
    const { message, statusCode, details } = getErrorInfo(err)
    return statusCode === 400
      ? validationErrorResponse(message, details)
      : errorResponse(message, statusCode, details)
  }
}

/**
 * DELETE /api/products/[id]
 * Delete a product by ID (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Validate UUID format
    if (!isValidUUID(id)) {
      return validationErrorResponse('Invalid product ID format')
    }

    const supabase = getSupabaseClient()

    // Delete product
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      console.error('Database error:', error)
      throw handleDatabaseError(error)
    }

    return successResponse({ id, message: 'Product deleted successfully' })
  } catch (err) {
    console.error('API error:', err)
    const { message, statusCode, details } = getErrorInfo(err)
    return statusCode === 400
      ? validationErrorResponse(message, details)
      : errorResponse(message, statusCode, details)
  }
}
