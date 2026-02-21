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
 * POST /api/auth/login
 * Authenticate user with email and password
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()

    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Sign in user
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Login error:', signInError)
      return NextResponse.json(
        { error: signInError.message || 'Invalid email or password' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: data.user,
      session: data.session,
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
