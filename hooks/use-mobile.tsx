"use client"

import * as React from "react"
import { isBrowser, getWindowDimensions, safeMatchMedia } from "@/lib/client-utils"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    if (!isBrowser) return
    
    const mql = safeMatchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    if (!mql) return
    
    const onChange = () => {
      const { width } = getWindowDimensions()
      setIsMobile(width < MOBILE_BREAKPOINT)
    }
    
    mql.addEventListener("change", onChange)
    
    // Set initial value
    onChange()
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile === undefined ? false : isMobile
}
