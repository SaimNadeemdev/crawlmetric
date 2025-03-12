import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET endpoint to retrieve content generation history for the logged-in user
export async function GET(request: NextRequest) {
  try {
    console.log("Content Generation History API - Getting history records")
    
    // Initialize Supabase client with the request
    const supabase = createServerSupabaseClient(request)
    let userId = null
    
    // Try to get the user from the session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    console.log("Content Generation History API - Session check result:", session ? "Session found" : "No session")
    
    if (session && session.user) {
      userId = session.user.id
      console.log("Content Generation History API - Found user from session:", userId)
    } else {
      // If no session, try to get the token from the request
      let token = null
      
      // Check for Authorization header
      const authHeader = request.headers.get('authorization')
      console.log("Content Generation History API - Authorization header:", authHeader ? "Present" : "Not present")
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
        console.log("Content Generation History API - Found token in Authorization header")
      } else {
        // Try to get token from request body
        try {
          const clonedRequest = request.clone()
          const body = await clonedRequest.json()
          console.log("Content Generation History API - Request body:", JSON.stringify(body))
          token = body.token
          if (token) {
            console.log("Content Generation History API - Found token in request body")
          }
        } catch (e) {
          // No body or invalid JSON
          console.log("Content Generation History API - Error parsing request body:", e)
        }
      }
      
      // If we have a token, try to get the user
      if (token) {
        console.log("Content Generation History API - Attempting to get user from token")
        const { data, error } = await supabase.auth.getUser(token)
        if (!error && data.user) {
          userId = data.user.id
          console.log("Content Generation History API - Found user from token:", userId)
        } else if (error) {
          console.error("Content Generation History API - Error getting user from token:", error)
        }
      }
    }

    // If we don't have a user ID, return 401
    if (!userId) {
      console.error("Content Generation History API - No valid session or token found")
      return NextResponse.json({ success: false, error: "No valid session found. Please log in again." }, { status: 401 })
    }
    
    // Get the limit parameter from the URL (default to 100)
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '100', 10)
    const type = url.searchParams.get('type') || null
    const timestamp = url.searchParams.get('_t') || null // Cache-busting parameter
    
    // Fetch the content generation history for this user
    console.log(`Content Generation History API - Fetching history for user ${userId} with limit ${limit}${timestamp ? ' and timestamp ' + timestamp : ''}`)
    
    // Fall back to using the Supabase client directly
    console.log("Content Generation History API - Using Supabase client")
    
    // Create query with a cache-busting parameter
    let query = supabase
      .from("content_generation_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(Math.min(limit, 100)) // Always limit to maximum 100 results
    
    // Add type filter if provided
    if (type) {
      query = query.eq("type", type)
    }
    
    // Execute the query
    const { data: history, error } = await query
    
    if (error) {
      console.error("Content Generation History API - Error fetching history:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    console.log(`Content Generation History API - Found ${history.length} history records`)
    
    // Create a response with cache control headers
    const apiResponse = NextResponse.json({ success: true, history })
    apiResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    apiResponse.headers.set('Pragma', 'no-cache')
    apiResponse.headers.set('Expires', '0')
    
    return apiResponse
  } catch (error: any) {
    console.error("Content Generation History API - Unexpected error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}

// POST endpoint to save a new content generation history record
export async function POST(request: NextRequest) {
  try {
    console.log("Content Generation History API - Saving new history record")
    
    // Initialize Supabase client with the request
    const supabase = createServerSupabaseClient(request)
    let userId = null
    
    // Try to get the user from the session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    console.log("Content Generation History API - Session check result:", session ? "Session found" : "No session")
    
    if (session && session.user) {
      userId = session.user.id
      console.log("Content Generation History API - Found user from session:", userId)
    } else {
      // If no session, try to get the token from the request
      let token = null
      
      // Check for Authorization header
      const authHeader = request.headers.get('authorization')
      console.log("Content Generation History API - Authorization header:", authHeader ? "Present" : "Not present")
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
        console.log("Content Generation History API - Found token in Authorization header")
      }
      
      // If we have a token, try to get the user
      if (token) {
        console.log("Content Generation History API - Attempting to get user from token")
        const { data, error } = await supabase.auth.getUser(token)
        if (!error && data.user) {
          userId = data.user.id
          console.log("Content Generation History API - Found user from token:", userId)
        } else if (error) {
          console.error("Content Generation History API - Error getting user from token:", error)
        }
      }
    }

    // If we don't have a user ID, return 401
    if (!userId) {
      console.error("Content Generation History API - No valid session or token found")
      return NextResponse.json({ success: false, error: "No valid session found. Please log in again." }, { status: 401 })
    }
    
    // Get the request body
    const body = await request.json()
    const { type, prompt, result, metadata } = body
    
    if (!type || !prompt || !result) {
      console.error("Content Generation History API - Missing required fields:", { type, hasPrompt: !!prompt, hasResult: !!result })
      return NextResponse.json({ success: false, error: "Missing required fields: type, prompt, and result" }, { status: 400 })
    }
    
    // Create the history record
    const historyRecord = {
      user_id: userId,
      type,
      prompt,
      result,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    }
    
    console.log("Content Generation History API - Inserting record:", {
      type,
      user_id: userId,
      prompt_length: typeof prompt === 'string' ? prompt.length : 'object'
    })
    
    // Insert the record into the database
    const { data: insertedRecord, error } = await supabase
      .from("content_generation_history")
      .insert(historyRecord)
      .select()
      .single()
    
    if (error) {
      console.error("Content Generation History API - Error inserting history record:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    console.log("Content Generation History API - Successfully saved history record:", insertedRecord.id)
    
    return NextResponse.json({ success: true, record: insertedRecord })
  } catch (error: any) {
    console.error("Content Generation History API - Unexpected error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}

// DELETE endpoint to delete a specific history record or all records
export async function DELETE(request: NextRequest) {
  console.log("Content Generation History API - DELETE request received")
  
  try {
    // Get the record ID from the query parameters
    const url = new URL(request.url)
    const recordId = url.searchParams.get("id")
    
    if (!recordId) {
      console.log("Content Generation History API - No record ID provided")
      return NextResponse.json(
        { 
          success: false, 
          error: "Record ID is required", 
          message: "Please use the dynamic route /api/content-generation-history/[id] for deleting specific records"
        },
        { status: 400 }
      )
    }
    
    console.log(`Content Generation History API - Deleting record ${recordId}`)
    
    // Initialize Supabase client
    const supabase = createServerSupabaseClient(request)
    
    // Check if the user is authenticated
    const { data: sessionData } = await supabase.auth.getSession()
    console.log(`Content Generation History API - Session check result: ${sessionData.session ? "Session found" : "No session"}`)
    
    // Get the user ID from the session or token
    let userId: string | null = null
    
    // Try to get the user ID from the session
    if (sessionData.session && sessionData.session.user) {
      userId = sessionData.session.user.id
      console.log(`Content Generation History API - Found user from session: ${userId}`)
    } else {
      // Try to get the user ID from the Authorization header
      const authHeader = request.headers.get("Authorization")
      console.log(`Content Generation History API - Authorization header: ${authHeader ? "Present" : "Not present"}`)
      
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7)
        console.log("Content Generation History API - Found token in Authorization header")
        
        try {
          console.log("Content Generation History API - Attempting to get user from token")
          const { data: userData, error: userError } = await supabase.auth.getUser(token)
          
          if (userError) {
            console.error("Content Generation History API - Error getting user from token:", userError.message)
            return NextResponse.json(
              { success: false, error: "Unauthorized" },
              { status: 401 }
            )
          }
          
          if (userData && userData.user) {
            userId = userData.user.id
            console.log(`Content Generation History API - Found user from token: ${userId}`)
          }
        } catch (error) {
          console.error("Content Generation History API - Error validating token:", error)
          return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
          )
        }
      }
    }
    
    // If no user ID was found, return an error
    if (!userId) {
      console.log("Content Generation History API - No user ID found")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.log(`Content Generation History API - DELETE params: recordId=${recordId}, userId=${userId}`)
    
    // First, verify the record exists and belongs to the user
    const { data: existingRecord, error: existingError } = await supabase
      .from("content_generation_history")
      .select("id")
      .eq("id", recordId)
      .eq("user_id", userId)
      .single()
    
    if (existingError && existingError.code === "PGRST116") {
      // Record not found
      console.log(`Content Generation History API - No records found with id ${recordId} for user ${userId}`)
      return NextResponse.json(
        { 
          success: false, 
          error: "Record not found",
          message: `No record found with id ${recordId} for this user`
        },
        { status: 404 }
      )
    } else if (existingError) {
      console.error(`Content Generation History API - Error checking record: ${existingError.message}`)
      return NextResponse.json(
        { success: false, error: existingError.message },
        { status: 500 }
      )
    }
    
    console.log(`Content Generation History API - Record ${recordId} found and belongs to user ${userId}, proceeding with deletion`)
    
    // Try standard delete approach first
    const { error: deleteError } = await supabase
      .from("content_generation_history")
      .delete()
      .eq("id", recordId)
      .eq("user_id", userId)
    
    if (deleteError) {
      console.error(`Content Generation History API - Error with standard delete: ${deleteError.message}`)
      
      // Try with direct REST API call as a fallback
      console.log(`Content Generation History API - Attempting direct REST API delete`)
      
      try {
        // Get the Supabase URL and key from the client
        const supabaseUrl = 'https://nzxgnnpthtefahosnolm.supabase.co'
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDQ1MDcsImV4cCI6MjA1Njg4MDUwN30.kPPrr1NaDkl1OxP9g0oO9l2tWnKWNw2h4LXiDD7v3Mg'
        
        // Construct the URL for the delete operation
        const apiUrl = `${supabaseUrl}/rest/v1/content_generation_history?id=eq.${recordId}&user_id=eq.${userId}`
        
        // Make a direct DELETE request to the Supabase REST API
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Content Generation History API - REST API delete failed: ${response.status} - ${errorText}`)
          return NextResponse.json(
            { success: false, error: `REST API delete failed: ${response.status}` },
            { status: 500 }
          )
        }
        
        console.log(`Content Generation History API - REST API delete successful`)
      } catch (restError) {
        console.error(`Content Generation History API - Error with REST API delete: ${restError}`)
        return NextResponse.json(
          { success: false, error: "Failed to delete record with REST API" },
          { status: 500 }
        )
      }
    }
    
    console.log(`Content Generation History API - Successfully deleted record ${recordId}`)
    
    // Return success with cache control headers
    const response = NextResponse.json({
      success: true,
      message: "Record deleted successfully"
    })
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error("Content Generation History API - Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
