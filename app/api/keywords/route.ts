import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


// Use hardcoded Supabase credentials for direct authentication
const supabaseUrl = 'https://nzxgnnpthtefahosnolm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDQ1MDcsImV4cCI6MjA1Njg4MDUwN30.kPPrr1NaDkl1OxP9g0oO9l2tWnKWNw2h4LXiDD7v3Mg'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let userId = null
    let supabase = null
    
    console.log("Auth header present:", !!authHeader)
    
    // Initialize Supabase client with cookies for server-side auth
    const cookieClient = createRouteHandlerClient({ cookies })
    
    // Try to get session from cookies first
    const { data: cookieData, error: cookieError } = await cookieClient.auth.getSession()
    
    if (cookieData?.session?.user) {
      console.log("Found user from cookie session")
      userId = cookieData.session.user.id
      // Use the cookie authenticated client for database operations
      supabase = cookieClient
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      // If no cookie session but we have a bearer token, use it
      const token = authHeader.split(' ')[1]
      console.log("Using bearer token for authentication")
      
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
        console.error("Token validation error:", tokenError)
        return NextResponse.json({ error: "Invalid token: " + tokenError.message }, { status: 401 })
      }
      
      if (tokenData?.user) {
        console.log("Found user from token")
        userId = tokenData.user.id
        // Use the token authenticated client for database operations
        supabase = directClient
      }
    }
    
    // If we still don't have a user ID or authenticated client, return 401
    if (!userId || !supabase) {
      console.error("No valid session or token found")
      return NextResponse.json({ error: "No valid session found. Please log in again." }, { status: 401 })
    }

    console.log("Fetching keywords for user:", userId)
    
    // User is authenticated, proceed with fetching keywords using the authenticated client
    const { data: keywords, error } = await supabase
      .from("keywords")
      .select("*")
      .eq("user_id", userId)

    if (error) {
      console.error("Database error fetching keywords:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Found ${keywords?.length || 0} keywords for user ${userId}`)
    return NextResponse.json({ keywords })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Pass the request to the createServerSupabaseClient function
    const supabase = createServerSupabaseClient(request)
    let userId = null;
    
    // Try to get the user from the session first
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session && session.user) {
      userId = session.user.id;
      console.log("Keywords API (POST) - Found user from session:", userId)
    } else {
      // If no session, try to get the token from the request
      let token = null;
      
      // Check for Authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log("Keywords API (POST) - Found token in Authorization header")
      } else {
        // Try to get token from request body
        try {
          const clonedRequest = request.clone();
          const body = await clonedRequest.json();
          token = body.token;
          if (token) {
            console.log("Keywords API (POST) - Found token in request body")
          }
        } catch (e) {
          // No body or invalid JSON
          console.log("Keywords API (POST) - No token in request body or invalid JSON")
        }
      }
      
      // If we have a token, try to get the user
      if (token) {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) {
          userId = data.user.id;
          console.log("Keywords API (POST) - Found user from token:", userId)
        } else if (error) {
          console.error("Keywords API (POST) - Error getting user from token:", error)
        }
      }
    }

    // If we don't have a user ID, return 401
    if (!userId) {
      console.error("Keywords API (POST) - No valid session or token found")
      return NextResponse.json({ error: "No valid session found. Please log in again." }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()
    
    // Add the user_id to the keyword data
    const keywordData = {
      ...body,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }
    
    console.log("Inserting keyword with data:", JSON.stringify(keywordData))
    
    // First check if the keyword already exists for this user and domain
    const { data: existingKeyword, error: checkError } = await supabase
      .from("keywords")
      .select("id")
      .eq("user_id", userId)
      .eq("keyword", keywordData.keyword)
      .eq("domain", keywordData.domain)
      .maybeSingle()
      
    if (checkError) {
      console.error("Error checking for existing keyword:", checkError)
    }
    
    // If keyword already exists, return it instead of trying to insert a new one
    if (existingKeyword) {
      console.log("Keyword already exists, returning existing record:", existingKeyword.id)
      
      // Get the full keyword record
      const { data: fullKeyword, error: getError } = await supabase
        .from("keywords")
        .select("*")
        .eq("id", existingKeyword.id)
        .single()
        
      if (getError) {
        console.error("Error retrieving existing keyword:", getError)
        return NextResponse.json({ error: getError.message }, { status: 500 })
      }
      
      return NextResponse.json(fullKeyword)
    }
    
    // Insert the keyword using the authenticated client
    const { data, error } = await supabase
      .from("keywords")
      .insert(keywordData)
      .select()
      .single()
    
    if (error) {
      console.error("Database error inserting keyword:", error)
      
      // Check if this is a duplicate key error
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: "This keyword is already being tracked for this domain.",
          code: "DUPLICATE_KEYWORD"
        }, { status: 409 })
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log("Successfully inserted keyword:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
