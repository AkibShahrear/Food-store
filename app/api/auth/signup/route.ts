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
 * POST /api/auth/signup
 * Create a new user account
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()

    const { email, password, name } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Sign up user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    })

    if (signUpError) {
      console.error('Signup error:', signUpError)
      return NextResponse.json(
        { error: signUpError.message || 'Failed to create account' },
        { status: 400 }
      )
    }

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase.from('user_profiles').insert([
        {
          id: data.user.id,
          email: data.user.email,
          name: name || email.split('@')[0],
        },
      ])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't fail the request if profile creation fails - user is created
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully. Please check your email to confirm your signup.',
        user: data.user,
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
