import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ModernNavbar } from "@/components/navigation/ModernNavbar"

export const metadata: Metadata = {
  title: "CrawlMetrics - SEO Tools",
  description: "Track and optimize your website's search engine rankings",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ModernNavbar />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}