import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Handle webhook events
  const body = await request.json()
  
  // Process webhook
  return NextResponse.json({ status: 'received' })
}
