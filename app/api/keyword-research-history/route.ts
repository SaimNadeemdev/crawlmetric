import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


// GET endpoint to retrieve keyword research history for the logged-in user
export async function GET(request: NextRequest) {
  try {
    console.log("Keyword Research History API - Getting history records")
    
    // Initialize Supabase client with the request
    const supabase = createServerSupabaseClient(request)
    let userId = null
    
    // Try to get the user from the session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    console.log("Keyword Research History API - Session check result:", session ? "Session found" : "No session")
    
    if (session && session.user) {
      userId = session.user.id
      console.log("Keyword Research History API - Found user from session:", userId)
    } else {
      // If no session, try to get the token from the request
      let token = null
      
      // Check for Authorization header
      const authHeader = request.headers.get('authorization')
      console.log("Keyword Research History API - Authorization header:", authHeader ? "Present" : "Not present")
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
        console.log("Keyword Research History API - Found token in Authorization header")
      } else {
        // Try to get token from request body
        try {
          const clonedRequest = request.clone()
          const body = await clonedRequest.json()
          console.log("Keyword Research History API - Request body:", JSON.stringify(body))
          token = body.token
          if (token) {
            console.log("Keyword Research History API - Found token in request body")
          }
        } catch (e) {
          // No body or invalid JSON
          console.log("Keyword Research History API - Error parsing request body:", e)
        }
      }
      
      // If we have a token, try to get the user
      if (token) {
        console.log("Keyword Research History API - Attempting to get user from token")
        const { data, error } = await supabase.auth.getUser(token)
        if (!error && data.user) {
          userId = data.user.id
          console.log("Keyword Research History API - Found user from token:", userId)
        } else if (error) {
          console.error("Keyword Research History API - Error getting user from token:", error)
        }
      }
    }

    // If we don't have a user ID, return 401
    if (!userId) {
      console.error("Keyword Research History API - No valid session or token found")
      return NextResponse.json({ error: "No valid session found. Please log in again." }, { status: 401 })
    }
    
    // Get the limit parameter from the URL (default to 10)
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10', 10)
    
    // Fetch the keyword research history for this user
    console.log(`Keyword Research History API - Fetching history for user ${userId} with limit ${limit}`)
    const { data: history, error } = await supabase
      .from("keyword_research_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error("Keyword Research History API - Error fetching history:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log(`Keyword Research History API - Found ${history.length} history records`)
    
    return NextResponse.json({ history })
  } catch (error: any) {
    console.error("Keyword Research History API - Unexpected error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// POST endpoint to save a new keyword research history record
export async function POST(request: NextRequest) {
  try {
    console.log("Keyword Research History API - Saving new history record")
    
    // Initialize Supabase client with the request
    const supabase = createServerSupabaseClient(request)
    let userId = null
    
    // Try to get the user from the session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    console.log("Keyword Research History API - Session check result:", session ? "Session found" : "No session")
    
    if (session && session.user) {
      userId = session.user.id
      console.log("Keyword Research History API - Found user from session:", userId)
    } else {
      // If no session, try to get the token from the request
      let token = null
      
      // Check for Authorization header
      const authHeader = request.headers.get('authorization')
      console.log("Keyword Research History API - Authorization header:", authHeader ? "Present" : "Not present")
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
        console.log("Keyword Research History API - Found token in Authorization header")
      }
      
      // If we have a token, try to get the user
      if (token) {
        console.log("Keyword Research History API - Attempting to get user from token")
        const { data, error } = await supabase.auth.getUser(token)
        if (!error && data.user) {
          userId = data.user.id
          console.log("Keyword Research History API - Found user from token:", userId)
        } else if (error) {
          console.error("Keyword Research History API - Error getting user from token:", error)
        }
      }
    }

    // If we don't have a user ID, return 401
    if (!userId) {
      console.error("Keyword Research History API - No valid session or token found")
      return NextResponse.json({ error: "No valid session found. Please log in again." }, { status: 401 })
    }
    
    // Get the request body
    const body = await request.json()
    const { mode, data, queryParams } = body
    
    if (!mode || !data) {
      console.error("Keyword Research History API - Missing required fields:", { mode, hasData: !!data })
      return NextResponse.json({ error: "Missing required fields: mode and data" }, { status: 400 })
    }
    
    // Create the history record
    const historyRecord = {
      user_id: userId,
      mode,
      data,
      query_params: queryParams || {},
      created_at: new Date().toISOString()
    }
    
    console.log("Keyword Research History API - Inserting record:", {
      mode,
      user_id: userId,
      data_length: Array.isArray(data) ? data.length : 'object'
    })
    
    // Insert the record into the database
    const { data: insertedRecord, error } = await supabase
      .from("keyword_research_history")
      .insert(historyRecord)
      .select()
      .single()
    
    if (error) {
      console.error("Keyword Research History API - Error inserting history record:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log("Keyword Research History API - Successfully saved history record:", insertedRecord.id)
    
    return NextResponse.json({ success: true, record: insertedRecord })
  } catch (error: any) {
    console.error("Keyword Research History API - Unexpected error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
