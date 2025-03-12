import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { ModernNavbar } from "@/components/navigation/ModernNavbar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Background gradient effects - simplified for performance */}
      <div className="fixed top-0 left-1/4 w-1/2 h-1/2 bg-blue-500 opacity-10 rounded-full blur-[150px] -z-10" />
      <div className="fixed bottom-0 right-1/4 w-1/2 h-1/2 bg-purple-500 opacity-10 rounded-full blur-[150px] -z-10" />
      
      <ModernNavbar />
      <Sidebar children={children} />
    </div>
  )
}
