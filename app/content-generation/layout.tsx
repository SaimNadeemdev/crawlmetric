import type React from "react"
import { Sidebar } from "@/components/sidebar"

export default function ContentGenerationLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
