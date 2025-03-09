import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { ModernNavbar } from "@/components/navigation/ModernNavbar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#111111]">
      <ModernNavbar />
      <Sidebar />
      <div className="pt-16">{children}</div>
    </div>
  )
}

