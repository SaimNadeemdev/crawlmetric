"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { Sidebar } from "@/components/sidebar"
import { createClient } from "@supabase/supabase-js"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
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
        
        // Check for session in localStorage first
        const storedSession = localStorage.getItem('supabase.auth.token')
        if (storedSession) {
          console.log("Dashboard - Found stored session in localStorage")
          try {
            const parsedSession = JSON.parse(storedSession)
            if (parsedSession && parsedSession.access_token) {
              console.log("Dashboard - Using stored session from localStorage")
              setHasSession(true)
            }
          } catch (e) {
            console.error("Dashboard - Error parsing stored session:", e)
          }
        }
        
        // Get session from Supabase
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Dashboard - Error getting session:", error.message)
          setHasSession(false)
        } else if (data.session) {
          console.log("Dashboard - Session check successful, user is authenticated")
          setHasSession(true)
        } else {
          console.log("Dashboard - No session found")
          setHasSession(false)
        }
      } catch (error) {
        console.error("Dashboard - Unexpected error checking session:", error)
        setHasSession(false)
      } finally {
        setIsCheckingSession(false)
      }
    }
    
    checkSession()
  }, [])

  // Check if we're still loading or if the user is not authenticated
  if (isCheckingSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!hasSession) {
    // Use client-side navigation for redirection
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  return (
    <div className="bg-[#0a0a0a] text-white">
      <Sidebar />
      <div className="ml-64 min-h-screen">
        <div className="p-6 pt-20">{children}</div>
      </div>
    </div>
  )
}
