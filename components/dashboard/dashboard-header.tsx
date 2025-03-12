import * as React from "react"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({
  heading,
  text,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2 pt-8">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">{heading}</h1>
        {text && <p className="text-[#86868b]">{text}</p>}
      </div>
      {children}
    </div>
  )
}
