"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface HeroAnimatedProps {
  badge?: string
  title1: string
  title2: string
  description?: string
}

export function HeroAnimated({ badge, title1, title2, description }: HeroAnimatedProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  }

  return (
    <div className="relative overflow-hidden bg-black py-20 md:py-32">
      {/* Background grid pattern */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="h-full w-full bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* Glow effect */}
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-purple-500/20 blur-[100px]"></div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Badge
                variant="outline"
                className="border-purple-500/50 bg-black/50 px-4 py-1 text-sm font-medium text-purple-400 backdrop-blur-sm"
              >
                {badge}
              </Badge>
            </motion.div>
          )}

          <h1 className="mb-6 font-heading text-4xl font-bold tracking-tight text-white md:text-6xl">
            <div className="mb-2 flex justify-center">
              {title1.split("").map((char, index) => (
                <motion.span
                  key={`${char}-${index}`}
                  custom={index}
                  variants={letterVariants}
                  initial="hidden"
                  animate={isVisible ? "visible" : "hidden"}
                  className={char === " " ? "w-4" : ""}
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    display: "inline-block",
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
            <div className="flex justify-center">
              {title2.split("").map((char, index) => (
                <motion.span
                  key={`${char}-${index}`}
                  custom={index + title1.length}
                  variants={letterVariants}
                  initial="hidden"
                  animate={isVisible ? "visible" : "hidden"}
                  className={`${char === " " ? "w-4" : ""} bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent`}
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    display: "inline-block",
                    fontWeight: 800,
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </h1>

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mx-auto max-w-2xl text-lg text-gray-400"
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}

