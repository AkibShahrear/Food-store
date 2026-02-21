import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
      return NextResponse.json(
        { error: 'Invalid sort order. Must be "asc" or "desc"' },
        { status: 400 }
      )
    }

    // Validate sortBy field
    const validSortFields = ['price', 'name', 'created_at', 'stock']
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: `Invalid sort field. Must be one of: ${validSortFields.join(', ')}` },
        { status: 400 }
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
      return NextResponse.json(
        { error: 'Failed to fetch products', details: error.message },
        { status: 500 }
      )
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      success: true,
      data: products || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        category: category || null,
        search: search || null,
        sortBy,
        order,
      },
    })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
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
    const { name, description, price, category, stock, calories, spicy_level, image_url } = body

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name and price' },
        { status: 400 }
      )
    }

    // Validate price
    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'Failed to create product', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Product created successfully', data: data?.[0] },
      { status: 201 }
    )
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
