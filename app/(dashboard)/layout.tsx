"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="bg-[#0a0a0a] text-white">
      <Sidebar />
      <div className="ml-64 min-h-screen">
        <div className="p-6 pt-20">{children}</div>
      </div>
    </div>
  )
}

