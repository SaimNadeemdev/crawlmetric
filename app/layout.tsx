import React from "react"
import type { Metadata } from "next"
import "./globals.css"
import "../styles/pacifico-overrides.css"
import { AuthProvider } from "@/lib/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { fsMe, poppins, pacifico } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { ContentGenerationProvider } from "@/contexts/content-generation-context"
import { NavbarController } from "@/components/navbar-controller"

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
    <html lang="en" suppressHydrationWarning className={cn(fsMe.variable, poppins.variable, pacifico.variable)}>
      <head>
        <link rel="stylesheet" href="/fonts/fonts.css" />
        <link rel="stylesheet" href="/fonts/integral-cf.css" />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ContentGenerationProvider>
              <NavbarController />
              {children}
            </ContentGenerationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}