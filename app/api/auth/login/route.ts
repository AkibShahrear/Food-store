import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  successResponse,
  validationErrorResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api/responses'
import {
  getErrorInfo,
  ValidationError,
  UnauthorizedError,
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
      throw new ValidationError('Email and password are required')
    }

    // Sign in user
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Login error:', signInError)
      throw new UnauthorizedError(signInError.message || 'Invalid email or password')
    }

    return successResponse({
      user: data.user,
      session: data.session,
    })
  } catch (err) {
    console.error('API error:', err)
    const { message, statusCode, details } = getErrorInfo(err)
    if (statusCode === 400) {
      return validationErrorResponse(message, details)
    } else if (statusCode === 401) {
      return unauthorizedResponse(message)
    } else {
      return errorResponse(message, statusCode, details)
    }
  }
}
