"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { ModernNavbar } from "@/components/modern-navbar"

export function NavbarController() {
  const pathname = usePathname()
  const [shouldShow, setShouldShow] = React.useState(false)
  
  React.useEffect(() => {
    // Check if the current path is a dashboard path
    const isDashboardPage = pathname.includes('/dashboard') || 
                           pathname.includes('/keyword-research') || 
                           pathname.includes('/content-generation') || 
                           pathname.includes('/seo-audit')
    
    setShouldShow(!isDashboardPage)
    
    // For client-side navigation that might not trigger a full component re-render
    const handleRouteChange = () => {
      const currentPath = window.location.pathname
      const isAppPage = currentPath.includes('/dashboard') || 
                        currentPath.includes('/keyword-research') || 
                        currentPath.includes('/content-generation') || 
                        currentPath.includes('/seo-audit')
      
      setShouldShow(!isAppPage)
    }
    
    // Add event listener for popstate (browser back/forward)
    window.addEventListener('popstate', handleRouteChange)
    
    // Clean up
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [pathname])
  
  if (!shouldShow) {
    return null
  }
  
  return <ModernNavbar />
}
