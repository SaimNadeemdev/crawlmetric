import type React from "react"
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="flex min-h-screen items-center justify-center pt-16">{children}</div>
    </div>
  )
}

