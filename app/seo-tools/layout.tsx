import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { ClientProviders } from "@/components/providers/client-providers"

export default function SeoToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Sidebar>
      <div className="bg-white text-gray-900">
        <div className="min-h-screen">
          <div className="p-6 pt-20">
            <ClientProviders>{children}</ClientProviders>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
