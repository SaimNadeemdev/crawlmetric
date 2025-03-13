"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import type { Session, User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import { isClient } from "@/utils/client-utils"

// Use hardcoded Supabase credentials for client-side
const supabaseUrl = 'https://nzxgnnpthtefahosnolm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDQ1MDcsImV4cCI6MjA1Njg4MDUwN30.kPPrr1NaDkl1OxP9g0oO9l2tWnKWNw2h4LXiDD7v3Mg'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  }
})

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  // Initial session check
  useEffect(() => {
    // Skip if not in browser environment
    if (!isClient) {
      setIsLoading(false)
      return
    }
    
    const checkSession = async () => {
      try {
        console.log("Auth provider - Checking session")
        
        // Check for session in localStorage first
        if (isClient) {
          const storedSession = localStorage.getItem('supabase.auth.token')
          if (storedSession) {
            console.log("Found stored session in localStorage")
            try {
              // Try to parse and use the stored session
              const parsedSession = JSON.parse(storedSession)
              if (parsedSession && parsedSession.access_token) {
                console.log("Using stored session from localStorage")
              }
            } catch (e) {
              console.error("Error parsing stored session:", e)
            }
          }
        }
        
        // Get session from Supabase
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error getting session:", error.message)
          setIsLoading(false)
          return
        }
        
        console.log("Session check result:", data.session ? "Has session" : "No session")
        
        if (data.session) {
          setSession(data.session)
          setUser(data.session.user)
          
          // Store session in localStorage as backup
          if (isClient) {
            localStorage.setItem('supabase.auth.token', JSON.stringify(data.session))
          }
        }
      } catch (error) {
        console.error("Unexpected error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session ? "Has session" : "No session")
        
        if (session) {
          setSession(session)
          setUser(session.user)
          
          // Store session in localStorage as backup
          if (isClient) {
            localStorage.setItem('supabase.auth.token', JSON.stringify(session))
          }
        } else {
          setSession(null)
          setUser(null)
          if (isClient) {
            localStorage.removeItem('supabase.auth.token')
          }
        }
        
        setIsLoading(false)
      }
    )

    checkSession()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Redirect unauthenticated users from protected routes
  useEffect(() => {
    // Skip during loading to prevent flashing redirects
    if (isLoading) return
    
    // Define protected routes that require authentication
    const protectedRoutes = [
      '/dashboard',
      '/services',
    ]
    
    // Check if current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route))
    
    if (isProtectedRoute && !user) {
      console.log("User not authenticated but on protected route. Redirecting to home page.");
      // Use router.push instead of window.location.replace
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Auth provider - Signing in with:", email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error("Sign in error:", error.message)
        return { error }
      }
      
      console.log("Sign in successful:", {
        hasUser: !!data.user,
        hasSession: !!data.session,
      })
      
      // Store session in localStorage as backup
      if (isClient) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(data.session))
      }
      
      return { error: null }
    } catch (error: any) {
      console.error("Unexpected sign in error:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      console.log("Auth provider - Signing up with:", email, name ? "and name" : "without name")
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '', 
          },
        }
      })
      
      if (error) {
        console.error("Sign up error:", error.message)
        return { error }
      }
      
      console.log("Sign up successful:", {
        hasUser: !!data.user,
        hasSession: !!data.session,
        userId: data.user?.id
      })
      
      return { error: null }
    } catch (error: any) {
      console.error("Unexpected sign up error:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      if (isClient) {
        localStorage.removeItem('supabase.auth.token')
      }
      
      // Use router.push instead of window.location.replace
      router.push('/');
    } catch (error) {
      console.error("Sign out error:", error)
      // Even on error, try to redirect
      router.push('/');
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
