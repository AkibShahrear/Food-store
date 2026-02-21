import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all products
    const { data: products, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch products',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `✅ Database connected! Found ${count} products in Supabase`,
      totalProducts: count,
      sampleProducts: products?.slice(0, 5) || [],
      allProducts: products || []
    })
  } catch (err) {
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    )
  }
}
