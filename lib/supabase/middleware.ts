import { NextRequest, NextResponse } from 'next/server'

export async function authMiddleware(request: NextRequest) {
  // Add Supabase authentication middleware logic here
  return NextResponse.next()
}
