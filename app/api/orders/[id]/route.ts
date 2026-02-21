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
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * GET /api/orders/[id]
 * Fetch a single order with all its items and product details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params

    // Validate UUID format
    if (!isValidUUID(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    const { data: order, error } = await supabase
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
          products(id, name, description, image_url, category, price)
        )
        `
      )
      .eq('id', orderId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch order', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
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
 * PATCH /api/orders/[id]
 * Update order status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params

    // Validate UUID format
    if (!isValidUUID(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    const body = await request.json()

    // Define updateable fields
    const updateData: any = {}

    // Only allow updating status
    if ('status' in body) {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.status = body.status
    } else {
      return NextResponse.json(
        { error: 'No updateable fields provided. Currently only "status" can be updated' },
        { status: 400 }
      )
    }

    // Check if order exists first
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Perform update
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
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
          products(id, name, image_url)
        )
        `
      )
      .single()

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
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
 * DELETE /api/orders/[id]
 * Delete an order and all related order items
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params

    // Validate UUID format
    if (!isValidUUID(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // Check if order exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Delete order items first (FK constraint)
    const { error: itemsDeleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId)

    if (itemsDeleteError) {
      console.error('Database error deleting items:', itemsDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete order items', details: itemsDeleteError.message },
        { status: 500 }
      )
    }

    // Delete order
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete order', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
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
