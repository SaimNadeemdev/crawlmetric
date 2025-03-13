import { NextResponse } from "next/server"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


export async function GET() {
  return NextResponse.json({
    message: "API is working correctly",
    timestamp: new Date().toISOString(),
  })
}

