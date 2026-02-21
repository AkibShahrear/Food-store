import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  successResponse,
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
 * POST /api/auth/logout
 * Sign out the current user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Sign out user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      throw new Error(error.message || 'Failed to logout')
    }

    return successResponse({ message: 'Logged out successfully' })
  } catch (err) {
    console.error('API error:', err)
    const { message, statusCode, details } = getErrorInfo(err)
    return errorResponse(message, statusCode, details)
  }
}
