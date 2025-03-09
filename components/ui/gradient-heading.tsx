import { cn } from "@/lib/utils"

interface GradientHeadingProps {
  title: string
  subtitle?: string
  className?: string
}

export function GradientHeading({ title, subtitle, className }: GradientHeadingProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        {title}
      </h1>
      {subtitle && <p className="text-muted-foreground mx-auto max-w-[700px]">{subtitle}</p>}
    </div>
  )
}

