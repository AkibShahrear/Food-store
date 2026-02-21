import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  successResponse,
  validationErrorResponse,
  errorResponse,
} from '@/lib/api/responses'
import {
  isValidEmail,
  getErrorInfo,
  ValidationError,
} from '@/lib/api/errors'

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
      throw new ValidationError('Email and password are required')
    }

    // Validate email format
    if (!isValidEmail(email)) {
      throw new ValidationError('Invalid email format')
    }

    // Validate password length
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long')
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
      throw new ValidationError(signUpError.message || 'Failed to create account')
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
        // Don't fail the request if profile creation fails
      }
    }

    return successResponse(
      {
        user: data.user,
        message: 'Account created successfully. Please check your email to confirm.',
      },
      201
    )
  } catch (err) {
    console.error('API error:', err)
    const { message, statusCode, details } = getErrorInfo(err)
    return statusCode === 400
      ? validationErrorResponse(message, details)
      : errorResponse(message, statusCode, details)
  }
}
