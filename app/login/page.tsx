"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import { createClient } from "@supabase/supabase-js"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [loginSuccess, setLoginSuccess] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  // Direct Supabase client for testing
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

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => prev + "\n" + info)
    console.log(info)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setLoginSuccess(false)
    setDebugInfo("Starting login process...")

    try {
      addDebugInfo(`Attempting to sign in with: ${email}`)
      
      // Try direct Supabase auth first
      addDebugInfo("Trying direct Supabase auth...")
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (supabaseError) {
        addDebugInfo(`Direct Supabase auth failed: ${supabaseError.message}`)
        throw supabaseError
      }
      
      addDebugInfo(`Direct Supabase auth successful: ${data.user?.email}`)
      
      // Check if we got a session
      const { data: sessionData } = await supabase.auth.getSession()
      addDebugInfo(`Session after direct auth: ${sessionData.session ? 'Has session' : 'No session'}`)
      
      if (sessionData.session) {
        // Store the session in localStorage as a backup
        localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData.session))
        addDebugInfo("Session stored in localStorage")
        
        // Show success message and button instead of automatic redirect
        setLoginSuccess(true)
        addDebugInfo("Login successful! You can now go to the dashboard.")
      } else {
        addDebugInfo("No session found after login. Something went wrong.")
        throw new Error("No session found after login")
      }
      
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to sign in"
      addDebugInfo(`Login error: ${errorMessage}`)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const goToDashboard = () => {
    window.location.href = "/dashboard/main"
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        {!loginSuccess ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Login Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {debugInfo && (
              <div className="rounded-md bg-gray-50 p-4">
                <div className="flex">
                  <div className="ml-3 w-full">
                    <h3 className="text-sm font-medium text-gray-800">
                      Debug Info
                    </h3>
                    <pre className="mt-2 text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-40">
                      {debugInfo}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Login Successful
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    You have successfully logged in!
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={goToDashboard}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Go to Dashboard
            </button>
            
            {debugInfo && (
              <div className="rounded-md bg-gray-50 p-4">
                <div className="flex">
                  <div className="ml-3 w-full">
                    <h3 className="text-sm font-medium text-gray-800">
                      Debug Info
                    </h3>
                    <pre className="mt-2 text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-40">
                      {debugInfo}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
