import { NextRequest, NextResponse } from 'next/server'

// Mock authentication endpoint
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Simple validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Mock authentication - replace with real authentication logic
    if (email === 'admin@reachly.com' && password === 'password123') {
      return NextResponse.json({
        success: true,
        user: {
          id: '1',
          email: email,
          name: 'Admin User'
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
