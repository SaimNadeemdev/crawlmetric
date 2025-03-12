"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { IOSLogo } from "./ui/ios-logo"
import { Settings, Menu, X, Home, ChevronRight, LogOut, User, Lock, Activity, Zap } from "lucide-react"

// Define menu items
const publicMenuItems = [{ name: "Home", href: "/", icon: Home }]

// Remove service tools from authenticated menu items
const authenticatedMenuItems = [
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function BlackMirrorNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Ambient background glow */}
      <div className="fixed top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent z-50"></div>

      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/5" : "bg-black/70 backdrop-blur-sm"
        }`}
      >
        <div className="w-full px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <IOSLogo variant="black-mirror" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Only show Home link when user is logged in */}
              {user &&
                publicMenuItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-4 py-2 rounded-md transition-all duration-300 overflow-hidden group ${
                        isActive ? "text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-2 z-10 relative">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </div>

                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-white/5 border border-white/10 rounded-md z-0"
                          layoutId="activeNavItem"
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}

                      {/* Hover effect */}
                      <motion.div
                        className="absolute bottom-0 left-0 h-[1px] bg-blue-500/50"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  )
                })}

              {/* Only show authenticated menu items if user is logged in */}
              {user &&
                authenticatedMenuItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-4 py-2 rounded-md transition-all duration-300 overflow-hidden group ${
                        isActive ? "text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-2 z-10 relative">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </div>

                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-white/5 border border-white/10 rounded-md z-0"
                          layoutId="activeNavItem"
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}

                      {/* Hover effect */}
                      <motion.div
                        className="absolute bottom-0 left-0 h-[1px] bg-blue-500/50"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  )
                })}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <ModeToggle />

              {user ? (
                <div className="hidden md:flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white relative overflow-hidden group"
                    onClick={logout}
                  >
                    <span className="relative z-10 flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                  </Button>
                  <div className="relative">
                    <Avatar className="h-8 w-8 ring-1 ring-white/10 hover:ring-blue-500/50 transition-all duration-300">
                      <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                      <AvatarFallback className="bg-black text-blue-500">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <motion.div
                      className="absolute -inset-1 rounded-full bg-blue-500/20 blur-sm opacity-0 group-hover:opacity-100"
                      initial={false}
                      animate={{ scale: [0.9, 1.1, 0.9], opacity: [0, 0.5, 0] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <Link href="/login">
                    <Button variant="ghost" className="text-gray-400 hover:text-white relative overflow-hidden group">
                      <span className="relative z-10 flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Login
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white relative overflow-hidden group border-0">
                      <span className="relative z-10 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Sign Up
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-white relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </span>
                <motion.div
                  className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-black/90 backdrop-blur-md border-t border-white/5"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="space-y-1">
                  {/* Only show Home link when user is logged in */}
                  {user &&
                    publicMenuItems.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center justify-between px-4 py-3 rounded-md transition-all duration-200 ${
                            isActive
                              ? "bg-white/5 text-white border-l-2 border-blue-500"
                              : "text-gray-400 hover:bg-white/5 hover:text-white hover:border-l-2 hover:border-blue-500/50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </div>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      )
                    })}

                  {/* Only show authenticated menu items if user is logged in */}
                  {user &&
                    authenticatedMenuItems.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center justify-between px-4 py-3 rounded-md transition-all duration-200 ${
                            isActive
                              ? "bg-white/5 text-white border-l-2 border-blue-500"
                              : "text-gray-400 hover:bg-white/5 hover:text-white hover:border-l-2 hover:border-blue-500/50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </div>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      )
                    })}
                </div>

                {user ? (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center space-x-3 px-4 py-3">
                      <Avatar className="h-10 w-10 ring-1 ring-white/10">
                        <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                        <AvatarFallback className="bg-black text-blue-500">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full mt-2 text-gray-400 hover:text-white border border-white/5 hover:border-white/10"
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full text-gray-400 hover:text-white border border-white/5 hover:border-white/10"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <User className="h-4 w-4 mr-2" />
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Tech pattern overlay */}
      <div className="fixed top-0 left-0 right-0 h-screen pointer-events-none z-30 opacity-10">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5"></div>
      </div>
    </>
  )
}
