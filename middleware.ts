import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function middleware(request: NextRequest) {
  // Define paths
  const path = request.nextUrl.pathname
  const isAuthPage = path === "/login" || path === "/register" || path === "/forgot-password"
  const isProtectedPage = path.startsWith("/dashboard") || path === "/profile"
  
  // Skip middleware for certain paths
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/static") ||
    path.includes(".") ||
    path.startsWith("/auth/callback")
  ) {
    return NextResponse.next()
  }

  // Log the current path and checks
  console.log("Middleware check:", {
    path,
    isAuthPage,
    isProtectedPage
  })

  // Use hardcoded Supabase credentials for client-side
  const supabaseUrl = 'https://nzxgnnpthtefahosnolm.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDQ1MDcsImV4cCI6MjA1Njg4MDUwN30.kPPrr1NaDkl1OxP9g0oO9l2tWnKWNw2h4LXiDD7v3Mg'
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'supabase.auth.token',
    }
  })

  // Get the session from the request
  const authHeader = request.headers.get("authorization")
  const cookieHeader = request.headers.get("cookie")
  
  console.log("Auth headers:", { 
    hasAuthHeader: !!authHeader,
    hasCookieHeader: !!cookieHeader 
  })
  
  try {
    // Get session from the cookie
    const { data: { session }, error } = await supabase.auth.getSession()
    
    const hasSession = !!session
    
    console.log("Middleware session check:", { 
      hasSession,
      sessionError: error ? error.message : null
    })

    // IMPORTANT: If we're on any dashboard page, don't redirect to login
    // This prevents the redirect loop
    if (path.startsWith("/dashboard/")) {
      console.log("On dashboard page, skipping redirect checks")
      return NextResponse.next()
    }

    // Only redirect for protected pages, not auth pages
    // This allows users to stay on the login page even if they're not authenticated
    if (isProtectedPage && !hasSession) {
      console.log("User is not authenticated but on protected page, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // If on login page and authenticated, redirect to dashboard/main
    if (isAuthPage && hasSession) {
      console.log("User is authenticated but on auth page, redirecting to dashboard/main")
      return NextResponse.redirect(new URL("/dashboard/main", request.url))
    }

    // If on home page and authenticated, redirect to dashboard/main
    if (path === "/" && hasSession) {
      console.log("User is authenticated and on home page, redirecting to dashboard/main")
      return NextResponse.redirect(new URL("/dashboard/main", request.url))
    }
  } catch (error) {
    console.error("Middleware error:", error)
    // On error, allow access to prevent loops
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
