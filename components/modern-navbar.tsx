"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { IOSLogo } from "./ui/ios-logo"
import { LogOut, LayoutDashboard } from "lucide-react"

export function ModernNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Safe check for browser environment
    if (typeof window === 'undefined') return
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Safe check for browser environment
    if (typeof window === 'undefined') return
    
    const handleResize = () => {
      // Add your resize event logic here
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Safe check for browser environment
    if (typeof window === 'undefined') return
    
    const handleLoad = () => {
      // Add your load event logic here
    }
    window.addEventListener("load", handleLoad)
    return () => window.removeEventListener("load", handleLoad)
  }, [])

  useEffect(() => {
    // Safe check for browser environment
    if (typeof window === 'undefined') return
    
    const handleUnload = () => {
      // Add your unload event logic here
    }
    window.addEventListener("unload", handleUnload)
    return () => window.removeEventListener("unload", handleUnload)
  }, [])

  // Handle logout and redirect
  const handleLogout = async () => {
    try {
      // First perform the signOut operation
      await signOut();
      
      // Use router for navigation instead of window.location
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, try to redirect
      router.push('/');
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-sm border-b border-[#e5e5e7]" : "bg-white"
      }`}
    >
      <div className="w-[90%] max-w-[2000px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="/">
              <IOSLogo />
            </Link>
          </motion.div>

          {/* Center Section - Dashboard Link (only when logged in) */}
          <div className="flex-1 flex justify-center">
            {user && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Link href="/dashboard/main">
                  <Button 
                    variant="ghost" 
                    className="text-[#06c] hover:text-[#06c]/90 hover:bg-[#06c]/10 rounded-full px-5"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Right Section - Auth Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-[#06c] hover:text-[#06c]/90 hover:bg-[#06c]/10 rounded-full px-5"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="text-[#06c] hover:text-[#06c]/90 hover:bg-[#06c]/10 rounded-full px-5"
                >
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button
                  asChild
                  className="bg-[#06c] hover:bg-[#06c]/90 text-white rounded-full px-5"
                >
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
