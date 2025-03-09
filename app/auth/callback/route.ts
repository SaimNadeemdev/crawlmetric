import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const cookieStore = cookies()
    
    // Create the Supabase client
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Error exchanging code for session:", error.message)
        // Redirect to login page with error
        return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url))
      }
      
      console.log("Successfully exchanged code for session")
    } catch (err) {
      console.error("Unexpected error in auth callback:", err)
      return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url))
    }
  }
  
  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
