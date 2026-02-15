import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Handle GET requests for orders
  return NextResponse.json({ message: 'Orders API' })
}

export async function POST(request: NextRequest) {
  // Handle POST requests for creating orders
  return NextResponse.json({ message: 'Order created' })
}
