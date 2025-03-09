import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { cookies } from "next/headers"
import { type NextRequest } from "next/server"

// Check if we're on the client side
const isBrowser = typeof window !== 'undefined'

// Hardcoded Supabase credentials for consistency
const hardcodedUrl = 'https://nzxgnnpthtefahosnolm.supabase.co'
const hardcodedKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDQ1MDcsImV4cCI6MjA1Njg4MDUwN30.kPPrr1NaDkl1OxP9g0oO9l2tWnKWNw2h4LXiDD7v3Mg'

// Get the environment variables
let supabaseUrl = ''
let supabaseAnonKey = ''

// Server-side: Use the hardcoded values for consistency
if (!isBrowser) {
  supabaseUrl = hardcodedUrl
  supabaseAnonKey = hardcodedKey
} 
// Client-side: Use hardcoded values for client-side code
else {
  supabaseUrl = hardcodedUrl
  supabaseAnonKey = hardcodedKey
}

// For client-side usage
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  }
})

// For server-side usage with request context
export const createServerSupabaseClient = (request?: NextRequest) => {
  // Use hardcoded credentials for consistency
  const serverUrl = hardcodedUrl
  const serverKey = hardcodedKey
  
  // Check for authorization header if request is provided
  let authHeaders = {}
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      authHeaders = {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    }
  }

  return createClient<Database>(serverUrl, serverKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    ...authHeaders
  })
}

// Helper function to extract user ID from request
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // If we have a bearer token, use it
      const token = authHeader.split(' ')[1]
      
      // Create a direct Supabase client with the token
      const supabase = createClient(hardcodedUrl, hardcodedKey, {
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
      const { data, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error("Token validation error:", error)
        return null
      }
      
      if (data?.user) {
        return data.user.id
      }
    }
    
    // If no valid token found
    return null
  } catch (error) {
    console.error("Error getting user ID from request:", error)
    return null
  }
}

// For server actions
export const createServerActionClient = () => {
  return createClient<Database>(
    process.env.crawlmetric_NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.crawlmetric_SUPABASE_SERVICE_ROLE_KEY || "",
    {
      auth: {
        persistSession: false,
      },
    }
  )
}
