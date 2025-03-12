import * as React from "react"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        <div className="flex flex-col gap-8">
          {children}
        </div>
      </div>
    </div>
  )
}
