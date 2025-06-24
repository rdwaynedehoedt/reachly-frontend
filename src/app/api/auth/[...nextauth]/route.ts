import { NextRequest, NextResponse } from "next/server";

// Simple placeholder GET handler
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: "Authentication API is not implemented directly in Next.js. Using backend authentication instead." 
  });
}

// Simple placeholder POST handler
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: "Authentication API is not implemented directly in Next.js. Using backend authentication instead." 
  });
} 