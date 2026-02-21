import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
} from '@/lib/api/responses'
import { getErrorInfo } from '@/lib/api/errors'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * GET /api/auth/me
 * Get current authenticated user information
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Get current user
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return unauthorizedResponse('Not authenticated')
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return successResponse({
      id: user.id,
      email: user.email,
      ...profile,
    })
  } catch (err) {
    console.error('API error:', err)
    const { message, statusCode, details } = getErrorInfo(err)
    return statusCode === 401
      ? unauthorizedResponse(message)
      : errorResponse(message, statusCode, details)
  }
}
