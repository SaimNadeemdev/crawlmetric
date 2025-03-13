"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Home,
  Search,
  Settings,
  Globe,
  ChevronRight,
  BarChart,
  PanelLeft,
  HelpCircle,
  Command,
  ChevronLeft,
  LogOut,
  TrendingUp,
  LineChart
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { lilgrotesk } from "@/lib/fonts"
import { useAuth } from "@/lib/auth-provider"

// Custom SidebarLogo component with letter-by-letter animation
const SidebarLogo = ({ isMinimized = false }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  // Text for the logo
  const text1 = "Crawl";
  const text2 = "Metric";
  
  // Animation variants for each letter
  const letterVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1], // Custom easing for handwritten feel
      },
    }),
  };

  // Short form logo for minimized sidebar
  if (isMinimized) {
    return (
      <Link href="/" className="flex items-center justify-center">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#06c]/10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="text-[#06c] text-xl font-bold"
            style={{ fontFamily: "'Lil Grotesk', sans-serif" }}
          >
            CM
          </motion.div>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/" className="flex items-center">
      <div className="relative flex flex-col items-center">
        <div className="flex flex-col items-center">
          {/* First word: Crawl */}
          <div className="flex text-[#06c] text-2xl font-bold" style={{ fontFamily: "'Lil Grotesk', sans-serif" }}>
            {text1.split("").map((letter, i) => (
              <motion.span
                key={`crawl-${letter}-${i}`}
                custom={i}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={letterVariants}
              >
                {letter}
              </motion.span>
            ))}
            <div className="w-1"></div>
            {/* Second word: Metric */}
            {text2.split("").map((letter, i) => (
              <motion.span
                key={`metric-${letter}-${i}`}
                custom={i + text1.length + 1}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={letterVariants}
              >
                {letter}
              </motion.span>
            ))}
          </div>
          {/* BETA label with animation */}
          <motion.div 
            className="text-[10px] text-gray-500 font-medium tracking-wider -mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ delay: (text1.length + text2.length) * 0.08 + 0.2 }}
          >
            BETA
          </motion.div>
        </div>
      </div>
    </Link>
  );
};

// This component contains everything in one file for easy copy-paste
export function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(true)
  const [glowColor, setGlowColor] = React.useState("#0071e3")

  // Set mounted state to enable animations after component mounts
  React.useEffect(() => {
    setMounted(true)

    // Animated glow effect
    const colors = [
      "#0071e3", // Apple blue
      "#3a86ff", // Light blue
      "#5e60ce", // Purple
      "#5390d9", // Sky blue
    ]

    let colorIndex = 0
    const interval = setInterval(() => {
      colorIndex = (colorIndex + 1) % colors.length
      setGlowColor(colors[colorIndex])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Get user data from auth provider
  const { user: authUser, signOut } = useAuth()
  
  // Format user data for display
  const [user, setUser] = React.useState({
    name: "Guest User",
    email: "guest@example.com",
    image: null,
    initials: "G",
  })
  
  // Update user data when auth changes
  React.useEffect(() => {
    if (authUser) {
      // Get user email
      const userEmail = authUser.email || ""
      
      // Generate name and initials
      let userName = "Guest User"
      let userInitials = "G"
      
      // Try to get name from user metadata
      if (authUser.user_metadata?.full_name) {
        userName = authUser.user_metadata.full_name
      } else if (authUser.user_metadata?.name) {
        userName = authUser.user_metadata.name
      } else if (userEmail) {
        // Format name from email if no metadata name
        userName = userEmail.split("@")[0].split(/[._-]/).map((part) => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join(" ")
      }
      
      // Generate initials from name
      userInitials = userName.split(/\s+/).map(n => n[0]).join('').toUpperCase()
      if (!userInitials) userInitials = "G"
      
      // Update user state
      setUser({
        name: userName,
        email: userEmail,
        image: authUser.user_metadata?.avatar_url || null,
        initials: userInitials,
      })
      
      console.log("User profile updated from auth:", { userName, userEmail })
    }
  }, [authUser])

  // Define types for navigation items
  type SubItem = {
    title: string;
    href: string;
    icon: React.ComponentType<any>;
  };

  type NavItem = {
    title: string;
    href: string;
    icon: React.ComponentType<any>;
    shortcut?: string;
    badge?: string;
    subItems?: SubItem[];
  };

  // Navigation items
  const navItems: NavItem[] = [
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
    {
      title: "Dashboard",
      href: "/dashboard/main",
      icon: BarChart,
      shortcut: "⌘D",
    },
    {
      title: "Keyword Tracker",
      href: "/dashboard/keyword-tracker",
      icon: LineChart,
      badge: "New",
    },
    {
      title: "Keyword Research",
      href: "/keyword-research",
      icon: Search,
    },
    {
      title: "Content Generation",
      href: "/content-generation",
      icon: FileText,
    },
    {
      title: "SEO Audit",
      href: "/seo-audit",
      icon: Globe,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  const router = useRouter()

  return (
    <>
      {/* Sidebar - fixed position with z-index to ensure it overlays content */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-white/80 backdrop-blur-xl transition-all duration-500 ease-in-out ${isOpen ? "w-[280px]" : "w-[80px]"}`}
        style={{
          boxShadow: `0 0 30px 0 rgba(0, 0, 0, 0.05)`,
        }}
      >
        <div
          className="relative flex h-full flex-col overflow-hidden bg-white/90 backdrop-blur-xl"
          style={{
            borderRight: "1px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Logo at the top */}
          <div className="px-5 mt-4 mb-6">
            <div className="flex justify-center items-center">
              <SidebarLogo isMinimized={!isOpen} />
            </div>
          </div>

          {/* User profile with integrated toggle button */}
          <div className="px-5 mt-8">
            {isOpen ? (
              <div className="relative overflow-hidden rounded-[22px] border border-gray-100 bg-white/50 backdrop-blur-sm p-4 transition-all duration-300 hover:border-gray-200 hover:shadow-sm hover:bg-white/60">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-blue-300/5 to-blue-100/5 opacity-50" />
                
                <div className="relative flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-[1.5px] border-white">
                      {user.image ? (
                        <AvatarImage src={user.image} alt={user.name} />
                      ) : (
                        <AvatarFallback className="bg-[#0071e3]/10 text-[#0071e3] font-medium">
                          {user.initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-base font-medium text-gray-900 truncate">{user.name}</span>
                    <span className="text-sm text-gray-500 truncate">{user.email}</span>
                  </div>
                  
                  {/* Integrated toggle button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0"
                  >
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#06c] text-white transition-all duration-300 hover:bg-[#0071e3] hover:shadow-sm"
                      aria-label="Minimize sidebar"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#06c] text-white transition-all duration-300 hover:bg-[#0071e3] hover:shadow-sm"
                    aria-label="Expand sidebar"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </motion.div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 px-3"
                >
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Main Navigation</h2>
                </motion.div>
              )}
            </AnimatePresence>

            <ul className="space-y-2">
              <AnimatePresence>
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href
                  return (
                    <motion.li
                      key={item.href}
                      initial={mounted ? { opacity: 0, y: 10 } : false}
                      animate={mounted ? { opacity: 1, y: 0 } : false}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        href={item.href}
                        className={`group relative flex h-14 items-center gap-3 rounded-[22px] px-5 transition-all duration-300 ${
                          isActive
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-700 hover:bg-white/70 hover:text-gray-900 hover:shadow-sm"
                        }`}
                      >
                        {/* Active item indicator - subtle line */}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-blue-600 to-blue-300"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}

                        {/* Icon container */}
                        <div
                          className={`relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[14px] transition-all duration-300 ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600/10 via-blue-300/10 to-blue-100/10 text-gray-900"
                              : "bg-gray-100/70 text-gray-600 group-hover:bg-gray-100 group-hover:text-gray-800"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                        </div>

                        {/* Title and extras */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex flex-1 items-center justify-between"
                            >
                              <span className="relative text-base font-medium">
                                {item.title}

                                {/* Animated underline for active item */}
                                {isActive && (
                                  <motion.div
                                    layoutId="activeUnderline"
                                    className="absolute -bottom-1 left-0 h-[2px] w-1/2 bg-gradient-to-r from-blue-600 to-blue-300"
                                    transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.2 }}
                                  />
                                )}
                              </span>

                              {/* Badge or shortcut - more subtle */}
                              {item.badge && (
                                <span className="flex h-5 items-center rounded-full bg-white/90 border border-gray-100 px-2 text-[10px] font-medium text-gray-900 shadow-sm">
                                  {item.badge}
                                </span>
                              )}

                              {item.shortcut && (
                                <span className="flex h-5 items-center rounded-md bg-gray-100 px-1.5 text-[10px] font-medium text-gray-500">
                                  {item.shortcut}
                                </span>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Link>

                      {'subItems' in item && item.subItems && (
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="relative mt-4 w-full pl-12 pr-4"
                            >
                              <ul className="space-y-3">
                                {item.subItems.map((subItem: any, subIndex: number) => (
                                  <motion.li
                                    key={subItem.href}
                                    initial={mounted ? { opacity: 0, y: 10 } : false}
                                    animate={mounted ? { opacity: 1, y: 0 } : false}
                                    transition={{
                                      duration: 0.3,
                                      delay: subIndex * 0.05,
                                      ease: [0.22, 1, 0.36, 1],
                                    }}
                                  >
                                    <Link
                                      href={subItem.href}
                                      className={`group relative flex h-10 items-center gap-3 rounded-[18px] px-3 text-gray-700 transition-all duration-300 hover:bg-white/70 hover:text-gray-900 hover:shadow-sm`}
                                    >
                                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[14px] bg-gray-100/70 text-gray-600 transition-all duration-300 group-hover:bg-gray-100 group-hover:text-gray-800">
                                        <subItem.icon className="h-4 w-4" />
                                      </div>

                                      <AnimatePresence>
                                        {isOpen && (
                                          <motion.div
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex flex-1 items-center justify-between"
                                          >
                                            <span className="text-sm font-medium">{subItem.title}</span>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </Link>
                                  </motion.li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>

            {/* Logout button at the bottom */}
            <div className={`${isOpen ? 'px-3' : 'flex justify-center'} py-4 border-t border-gray-100`}>
              <button
                onClick={() => {
                  // Handle logout
                  signOut().then(() => {
                    router.push("/")
                  })
                }}
                className={`group relative flex w-full h-14 items-center gap-3 rounded-[22px] px-5 transition-all duration-300 text-gray-700 hover:bg-white/70 hover:text-gray-900 hover:shadow-sm`}
              >
                <LogOut className="h-5 w-5" />
                <span className="text-base font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area - this is now properly offset with padding-left */}
      <div
        className={`min-h-screen transition-all duration-500 ease-in-out ${isOpen ? "pl-[280px]" : "pl-[80px]"}`}
      >
        {children}
      </div>

      {/* Global styles */}
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        @keyframes pulse-glow {
          0% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 0.3; transform: scale(1.2); }
          100% { opacity: 0.1; transform: scale(0.8); }
        }
        
        @keyframes pulse-subtle {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </>
  )
}
