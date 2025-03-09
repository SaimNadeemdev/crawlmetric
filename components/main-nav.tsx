"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, BarChart, TrendingUp } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/dashboard/main" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">CrawlMetrics</span>
      </Link>
      <nav className="flex items-center space-x-2">
        <Button variant={pathname === "/dashboard/main" ? "default" : "ghost"} size="sm" className="h-8" asChild>
          <Link href="/dashboard/main">
            <BarChart className="h-4 w-4 mr-2" />
            Keywords
          </Link>
        </Button>
        <Button variant={pathname === "/seo-audit" ? "default" : "ghost"} size="sm" className="h-8" asChild>
          <Link href="/seo-audit">
            <Search className="h-4 w-4 mr-2" />
            SEO Audit
          </Link>
        </Button>
        <Button variant={pathname === "/keyword-research" ? "default" : "ghost"} size="sm" className="h-8" asChild>
          <Link href="/keyword-research">
            <TrendingUp className="h-4 w-4 mr-2" />
            Keyword Research
          </Link>
        </Button>
      </nav>
    </div>
  )
}
