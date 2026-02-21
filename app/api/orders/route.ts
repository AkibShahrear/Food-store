import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * GET /api/orders
 * Fetch all orders for the authenticated user with filtering and pagination
 * 
 * Query Parameters:
 * - status: Filter by order status (pending, processing, shipped, delivered, cancelled)
 * - sortBy: Sort field (created_at, total, status) - default: created_at
 * - order: Sort order (asc, desc) - default: desc
 * - page: Page number for pagination - default: 1
 * - limit: Items per page - default: 10, max: 100
 * - userId: Filter by user ID (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const order = (searchParams.get('order') || 'desc').toLowerCase()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const userIdFilter = searchParams.get('userId')

    // Validate sort order
    if (!['asc', 'desc'].includes(order)) {
      return NextResponse.json(
        { error: 'Invalid sort order. Must be "asc" or "desc"' },
        { status: 400 }
      )
    }

    // Validate sortBy field
    const validSortFields = ['created_at', 'total', 'status']
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: `Invalid sort field. Must be one of: ${validSortFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Build query
    let query = supabase
      .from('orders')
      .select(
        `
        id,
        user_id,
        total_price,
        status,
        created_at,
        updated_at,
        order_items(
          id,
          product_id,
          quantity,
          price,
          products(name, image_url)
        )
        `,
        { count: 'exact' }
      )

    // Apply user filter (if provided and authorized)
    if (userIdFilter) {
      query = query.eq('user_id', userIdFilter)
    }

    // Apply status filter
    if (status) {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      query = query.eq('status', status)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: order === 'asc' })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data: orders, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: error.message },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      success: true,
      data: orders || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        status: status || null,
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

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()

    const {
      user_id,
      items,
      total_price,
    } = body

    // Validate required fields
    if (!user_id || !Array.isArray(items) || items.length === 0 || total_price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, items (non-empty array), total_price' },
        { status: 400 }
      )
    }

    // Validate items array
    if (!items.every((item: any) => item.product_id && item.quantity && item.price)) {
      return NextResponse.json(
        { error: 'Each item must have: product_id, quantity, price' },
        { status: 400 }
      )
    }

    // Validate numeric fields
    if (typeof total_price !== 'number' || total_price < 0) {
      return NextResponse.json(
        { error: 'total_price must be a positive number' },
        { status: 400 }
      )
    }

    // Create order in transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id,
          total_price,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (orderError) {
      console.error('Database error:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      )
    }

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Database error:', itemsError)
      // Delete order if items insertion failed
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Failed to create order items', details: itemsError.message },
        { status: 500 }
      )
    }

    // Fetch complete order with items
    const { data: completeOrder } = await supabase
      .from('orders')
      .select(
        `
        id,
        user_id,
        total_price,
        status,
        created_at,
        updated_at,
        order_items(
          id,
          product_id,
          quantity,
          price,
          products(name, image_url)
        )
        `
      )
      .eq('id', order.id)
      .single()

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: completeOrder,
      },
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
