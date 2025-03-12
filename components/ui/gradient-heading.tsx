import { cn } from "@/lib/utils"
import { fsMe } from "@/lib/fonts"

interface GradientHeadingProps {
  title: string
  subtitle?: string
  className?: string
}

export function GradientHeading({ title, subtitle, className }: GradientHeadingProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h1 className={`text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent section-title ${fsMe.className}`}>
        {title}
      </h1>
      {subtitle && <p className="text-gray-900 mx-auto max-w-[700px]">{subtitle}</p>}
    </div>
  )
}
