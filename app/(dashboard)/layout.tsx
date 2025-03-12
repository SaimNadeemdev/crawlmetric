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
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 rounded-full border-4 border-[#0071e3]/20 border-t-[#0071e3] animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Sidebar>
      <div className="bg-white text-gray-900">
        <div className="min-h-screen">
          <div className="p-6 pt-20">{children}</div>
        </div>
      </div>
    </Sidebar>
  )
}
