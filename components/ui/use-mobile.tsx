"use client"

import * as React from "react"
import { isBrowser, getWindowDimensions, safeWindowAddEventListener, safeMatchMedia } from "@/lib/client-utils"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    if (!isBrowser) return
    
    // Use a safe approach to check mobile status
    const checkMobile = () => {
      const { width } = getWindowDimensions()
      setIsMobile(width < MOBILE_BREAKPOINT)
    }
    
    // Initial check
    checkMobile()
    
    // Create the media query safely
    const mql = safeMatchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Set up event listener
    let cleanup = () => {}
    
    if (mql) {
      // Use the appropriate event listener based on browser support
      if (mql.addEventListener) {
        mql.addEventListener("change", checkMobile)
        cleanup = () => mql.removeEventListener("change", checkMobile)
      } else {
        // Fallback for older browsers
        cleanup = safeWindowAddEventListener("resize", checkMobile)
      }
    }
    
    return cleanup
  }, [])

  return isMobile === undefined ? false : isMobile
}
