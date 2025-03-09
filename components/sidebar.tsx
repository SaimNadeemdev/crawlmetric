"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home, Search, Settings, Globe, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard/main",
    icon: Home,
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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 bg-black pt-16 shadow-xl">
      <div className="flex h-full flex-col overflow-y-auto border-r border-white/10 px-4 py-6">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-purple-600/20 via-blue-500/20 to-cyan-400/20 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <div className="flex items-center">
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 transition-colors",
                      isActive
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400"
                        : "text-gray-500 group-hover:text-gray-300",
                    )}
                  />
                  {item.title}
                </div>
                {isActive && (
                  <>
                    <ChevronRight className="ml-auto h-4 w-4 text-blue-400" />
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-purple-600 via-blue-500 to-cyan-400" />
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto">
          <div className="rounded-lg bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-cyan-900/30 p-4">
            <h4 className="mb-2 text-sm font-medium text-white">Need Help?</h4>
            <p className="text-xs text-gray-400">Check our documentation or contact support for assistance.</p>
            <Link
              href="/support"
              className="mt-3 inline-flex items-center text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 hover:opacity-90"
            >
              View Documentation
              <ChevronRight className="ml-1 h-3 w-3 text-blue-400" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
