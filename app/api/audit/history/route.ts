import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

// Use hardcoded Supabase credentials for direct authentication
const supabaseUrl = 'https://nzxgnnpthtefahosnolm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDQ1MDcsImV4cCI6MjA1Njg4MDUwN30.kPPrr1NaDkl1OxP9g0oO9l2tWnKWNw2h4LXiDD7v3Mg'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let userId = null
    let supabase = null
    
    console.log("Audit History API - Auth header present:", !!authHeader)
    
    // Initialize Supabase client with cookies for server-side auth
    const cookieClient = createRouteHandlerClient({ cookies })
    
    // Try to get session from cookies first
    const { data: cookieData, error: cookieError } = await cookieClient.auth.getSession()
    
    if (cookieData?.session?.user) {
      console.log("Audit History API - Found user from cookie session")
      userId = cookieData.session.user.id
      // Use the cookie authenticated client for database operations
      supabase = cookieClient
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      // If no cookie session but we have a bearer token, use it
      const token = authHeader.split(' ')[1]
      console.log("Audit History API - Using bearer token for authentication")
      
      // Create a direct Supabase client with the token
      const directClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      })
      
      // Get user from the token
      const { data: tokenData, error: tokenError } = await directClient.auth.getUser()
      
      if (tokenError) {
        console.error("Audit History API - Token validation error:", tokenError)
        return NextResponse.json({ error: "Invalid token: " + tokenError.message }, { status: 401 })
      }
      
      if (tokenData?.user) {
        console.log("Audit History API - Found user from token")
        userId = tokenData.user.id
        // Use the token authenticated client for database operations
        supabase = directClient
      }
    }
    
    // If we still don't have a user ID or authenticated client, return 401
    if (!userId || !supabase) {
      console.error("Audit History API - No valid session or token found")
      return NextResponse.json({ error: "No valid session found. Please log in again." }, { status: 401 })
    }

    console.log("Audit History API - Fetching audit history for user:", userId)
    
    // Get audits for the user using the authenticated client
    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      
    if (error) {
      console.error("Audit History API - Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log(`Audit History API - Found ${data?.length || 0} audits for user ${userId}`)
    return NextResponse.json({ audits: data })
  } catch (error: any) {
    console.error("Unexpected error in audit history API:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
