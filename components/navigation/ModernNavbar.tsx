"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { IOSLogo } from "../ui/ios-logo"
import { Home, Activity, Settings, LogOut, Menu, X, ChevronRight, BarChart, Search } from "lucide-react"

const publicMenuItems = [{ name: "Home", href: "/", icon: Home }]

// Remove service tools from authenticated menu items
const authenticatedMenuItems = [
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

// Make sure we're using a named export here
export function ModernNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const navRef = useRef<HTMLDivElement>(null)

  // Spring animation for navbar height
  const navHeight = useMotionValue(64)
  const springNavHeight = useSpring(navHeight, { stiffness: 300, damping: 30 })

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      setIsScrolled(scrolled)
      navHeight.set(scrolled ? 56 : 64) // Shrink navbar slightly on scroll
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [navHeight])

  // Only show menu items when user is logged in
  const menuItems = user ? [...publicMenuItems, ...authenticatedMenuItems] : []

  return (
    <motion.nav
      ref={navRef}
      style={{ height: springNavHeight }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-[#e5e5e7]" 
          : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="/">
              <IOSLogo />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <motion.div
                  key={item.href}
                  className="relative"
                  whileHover={{ y: -1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Link
                    href={item.href}
                    className={`transition-all duration-200 group flex items-center space-x-1.5 ${
                      isActive 
                        ? "text-[#06c]" 
                        : "text-[#1d1d1f] hover:text-[#06c]"
                    }`}
                  >
                    <motion.div
                      animate={{ 
                        scale: isActive ? 1.1 : 1
                      }}
                      transition={{ 
                        scale: { type: "spring", stiffness: 400, damping: 17 }
                      }}
                    >
                      <item.icon className={`h-[18px] w-[18px] transition-all duration-200 ${
                        isActive ? "text-[#06c]" : "text-[#1d1d1f] group-hover:text-[#06c]"
                      }`} />
                    </motion.div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                  
                  {/* Apple-style active indicator - subtle line */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute bottom-[-8px] left-0 right-0 mx-auto w-4 h-[2px] bg-[#06c] rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-5">
            <ModeToggle />

            {user ? (
              <div className="hidden md:flex items-center space-x-5">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="ghost" 
                    className="text-[#1d1d1f] text-sm font-medium hover:text-[#06c] hover:bg-[#f5f5f7] rounded-full px-4 h-9"
                    onClick={signOut}
                  >
                    <LogOut className="h-[18px] w-[18px] mr-2 text-[#1d1d1f]" />
                    Logout
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar className="h-9 w-9 ring-[1.5px] ring-[#e5e5e7] dark:ring-[#333333]">
                    <AvatarImage src="/placeholder-user.jpg" alt={user.email} />
                    <AvatarFallback className="bg-[#06c] text-white text-sm font-medium">
                      {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="bg-[#06c] hover:bg-[#0071e3] text-white text-sm font-medium rounded-full px-4 h-9 shadow-sm"
                    >
                      Login
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="bg-[#06c] hover:bg-[#0071e3] text-white text-sm font-medium rounded-full px-4 h-9 shadow-sm"
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-8 h-8 rounded-full text-[#86868b] hover:text-[#06c] hover:bg-[#f5f5f7] dark:hover:bg-[#2a2a2a]"
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-white dark:bg-[#1a1a1a] border-t border-[#e5e5e7] dark:border-[#333333]"
          >
            <div className="px-6 py-5 space-y-3 max-w-7xl mx-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between p-3 ${
                        isActive 
                          ? "text-[#06c]" 
                          : "text-[#1d1d1f] dark:text-white"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className={`h-5 w-5 ${isActive ? "text-[#06c]" : "text-[#86868b]"}`} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#86868b]" />
                    </Link>
                  </motion.div>
                )
              })}
              
              {user ? (
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => {
                      signOut()
                      setIsOpen(false)
                    }}
                    className="flex items-center justify-between w-full p-3 text-[#1d1d1f] dark:text-white"
                  >
                    <div className="flex items-center space-x-3">
                      <LogOut className="h-5 w-5 text-[#86868b]" />
                      <span className="font-medium">Logout</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#86868b]" />
                  </button>
                </motion.div>
              ) : (
                <div className="pt-3 space-y-3">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full border-[#e5e5e7] dark:border-[#333333] text-[#1d1d1f] dark:text-white h-10">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-[#06c] hover:bg-[#0071e3] text-white rounded-full h-10 shadow-sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
