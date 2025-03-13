"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowRight, CheckCircle2, AlertCircle, ChevronDown, LockKeyhole } from "lucide-react"
import { AuthProvider } from "@/lib/auth-provider"

export default function LoginPageWrapper() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  )
}

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const [glowColor, setGlowColor] = useState("#0071e3")

  // Add CSS styles to document head
  useEffect(() => {
    import('@/utils/client-utils').then(({ addStyleToHead }) => {
      const styles = `
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse-glow {
          0% { filter: blur(10px); opacity: 0.5; }
          50% { filter: blur(15px); opacity: 0.7; }
          100% { filter: blur(10px); opacity: 0.5; }
        }
      `;
      
      const cleanup = addStyleToHead(styles);
      
      return cleanup;
    });
  }, [])

  // Direct Supabase client for testing
  const supabaseUrl = "https://nzxgnnpthtefahosnolm.supabase.co"
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDQ1MDcsImV4cCI6MjA1Njg4MDUwN30.kPPrr1NaDkl1OxP9g0oO9l2tWnKWNw2h4LXiDD7v3Mg"
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "supabase.auth.token",
    },
  })

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Dotted background animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Create dotted background
    const drawDottedBackground = (t: number) => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Plain white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw animated dots
      const dotSize = 1
      const spacing = 25
      const rows = Math.ceil(canvas.height / spacing)
      const cols = Math.ceil(canvas.width / spacing)

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = j * spacing
          const y = i * spacing

          // Add subtle movement to dots
          const offsetX = Math.sin((i + j) * 0.5 + t * 0.001) * 2
          const offsetY = Math.cos((i - j) * 0.5 + t * 0.001) * 2

          // Vary dot size slightly based on position and time
          const size = dotSize + Math.sin(i * j + t * 0.0005) * 0.3

          ctx.beginPath()
          ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
          ctx.fill()
        }
      }
    }

    let time = 0
    const animate = () => {
      time += 1
      drawDottedBackground(time)
      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mounted])

  // Animated glow effect
  useEffect(() => {
    if (!mounted) return

    const colors = [
      "#0071e3", // Apple blue
      "#3a86ff", // Light blue
      "#5e60ce", // Purple
      "#7400b8", // Deep purple
      "#6930c3", // Violet
      "#5390d9", // Sky blue
      "#4ea8de", // Light sky blue
    ]

    let colorIndex = 0
    const interval = setInterval(() => {
      colorIndex = (colorIndex + 1) % colors.length
      setGlowColor(colors[colorIndex])
    }, 2000)

    return () => clearInterval(interval)
  }, [mounted])

  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => prev + "\n" + info)
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
        password,
      })

      if (supabaseError) {
        addDebugInfo(`Direct Supabase auth failed: ${supabaseError.message}`)
        throw supabaseError
      }

      addDebugInfo(`Direct Supabase auth successful: ${data.user?.email}`)

      // Check if we got a session
      const { data: sessionData } = await supabase.auth.getSession()
      addDebugInfo(`Session after direct auth: ${sessionData.session ? "Has session" : "No session"}`)

      if (sessionData.session) {
        // Store the session in localStorage as a backup
        localStorage.setItem("supabase.auth.token", JSON.stringify(sessionData.session))
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Animated dotted background */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md"
          >
            {/* Card with subtle glow effect */}
            <div className="relative rounded-2xl">
              <Card
                className="relative overflow-hidden border-none bg-white shadow-sm rounded-2xl"
                style={{
                  boxShadow: `0 0 15px 2px ${glowColor}30, 0 0 30px 5px ${glowColor}15`,
                  transition: "box-shadow 1.5s ease-in-out",
                }}
              >
                <CardHeader className="space-y-1 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0071e3]/10 mb-2">
                    <LockKeyhole className="h-6 w-6 text-[#0071e3]" />
                  </div>
                  <CardTitle className="text-2xl font-medium tracking-tight text-gray-900">Welcome back</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Sign in to your account to continue
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {!loginSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <motion.div
                          whileTap={{ scale: 0.995 }}
                          whileFocus={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 rounded-lg border-[#d2d2d7] bg-white transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                            required
                          />
                        </motion.div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-sm font-medium">
                            Password
                          </Label>
                          <Link href="/forgot-password" className="text-xs text-[#0071e3] hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                        <motion.div
                          whileTap={{ scale: 0.995 }}
                          whileFocus={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 rounded-lg border-[#d2d2d7] bg-white transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                            required
                          />
                        </motion.div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          className="border-[#d2d2d7] data-[state=checked]:bg-[#0071e3] data-[state=checked]:border-[#0071e3]"
                        />
                        <label
                          htmlFor="remember"
                          className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </label>
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Error</AlertTitle>
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="pt-2"
                      >
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-11 rounded-lg bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium shadow-sm transition-all hover:shadow-md"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              <span className="ml-2">Signing in...</span>
                            </div>
                          ) : (
                            <span>Sign in</span>
                          )}
                        </Button>
                      </motion.div>

                      {/* Improved "or" divider */}
                      <div className="flex items-center justify-center my-4">
                        <div className="h-[1px] flex-grow bg-[#e6e6e6]"></div>
                        <span className="px-4 text-sm text-[#86868b]">or</span>
                        <div className="h-[1px] flex-grow bg-[#e6e6e6]"></div>
                      </div>

                      <p className="text-center text-sm">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-[#0071e3] hover:underline">
                          Create one now
                        </Link>
                      </p>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-4"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2 py-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 0.2,
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          }}
                        >
                          <div className="rounded-full bg-green-100 p-3">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                          </div>
                        </motion.div>
                        <motion.h3
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="text-xl font-medium text-gray-900"
                        >
                          Login Successful
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="text-center text-sm text-muted-foreground"
                        >
                          You have successfully logged in to your account
                        </motion.p>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button
                          onClick={goToDashboard}
                          className="w-full h-11 rounded-lg bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium shadow-sm transition-all hover:shadow-md"
                        >
                          <span>Go to Dashboard</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col">
                  {debugInfo && (
                    <Collapsible open={showDebug} onOpenChange={setShowDebug} className="w-full">
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full flex items-center justify-between text-xs text-muted-foreground"
                        >
                          Debug Information
                          <ChevronDown className={`h-4 w-4 transition-transform ${showDebug ? "rotate-180" : ""}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 rounded-md bg-slate-50 p-3"
                        >
                          <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-auto max-h-40">
                            {debugInfo}
                          </pre>
                        </motion.div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inject CSS styles */}
      <style jsx global>{`
        /* Base styles that would normally be in globals.css */
        body {
          background-color: #ffffff;
          color: #222222;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
      `}</style>
    </div>
  )
}
