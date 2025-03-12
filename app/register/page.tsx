"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, ArrowRight, CheckCircle2, UserPlus } from "lucide-react"
import { AuthProvider, useAuth } from "@/lib/auth-provider"

export default function RegisterPageWrapper() {
  return (
    <AuthProvider>
      <RegisterPage />
    </AuthProvider>
  )
}

function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [glowColor, setGlowColor] = useState("#0071e3")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const { signUp } = useAuth()
  const { toast } = useToast()

  // Add CSS styles to document head
  useEffect(() => {
    // Create style element
    const styleEl = document.createElement("style")
    styleEl.innerHTML = `
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
    `
    document.head.appendChild(styleEl)

    return () => {
      document.head.removeChild(styleEl)
    }
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords don't match. Please make sure your passwords match.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signUp(email, password, name)

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please check your email to confirm your registration.",
      })

      // Wait a moment before redirecting to ensure toast is visible
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
                    <UserPlus className="h-6 w-6 text-[#0071e3]" />
                  </div>
                  <CardTitle className="text-2xl font-medium tracking-tight text-gray-900">Create an account</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Enter your information to get started
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Name
                        </Label>
                        <motion.div
                          whileTap={{ scale: 0.995 }}
                          whileFocus={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-11 rounded-lg border-[#d2d2d7] bg-white transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                            required
                          />
                        </motion.div>
                      </div>

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
                        <Label htmlFor="password" className="text-sm font-medium">
                          Password
                        </Label>
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

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                          Confirm Password
                        </Label>
                        <motion.div
                          whileTap={{ scale: 0.995 }}
                          whileFocus={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-11 rounded-lg border-[#d2d2d7] bg-white transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                            required
                          />
                        </motion.div>
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
                          disabled={isLoading}
                          className="w-full h-11 rounded-lg bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium shadow-sm transition-all hover:shadow-md"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              <span className="ml-2">Creating account...</span>
                            </div>
                          ) : (
                            <span>Create account</span>
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
                        Already have an account?{" "}
                        <Link href="/login" className="text-[#0071e3] hover:underline">
                          Sign in
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
                          Registration Successful
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="text-center text-sm text-muted-foreground"
                        >
                          Your account has been created. Please check your email to confirm your registration.
                        </motion.p>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button
                          onClick={() => router.push("/login")}
                          className="w-full h-11 rounded-lg bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium shadow-sm transition-all hover:shadow-md"
                        >
                          <span>Go to Login</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </CardContent>
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
        
        /* Animation keyframes */
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
      `}</style>
    </div>
  )
}

