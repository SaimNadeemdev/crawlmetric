"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { KeywordBadge } from "./keyword-badge"

// Phrases to cycle through
const phrases = [
  { heading: "Search Rankings", subheading: "Track your SEO performance" },
  { heading: "Website Traffic", subheading: "Boost your visibility" },
  { heading: "Keyword Position", subheading: "Monitor your progress" },
  { heading: "SEO Performance", subheading: "Optimize your content" },
]

// Background shape component
function BackgroundShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, delay }}
      className={`absolute ${className}`}
    >
      <div
        style={{ width, height, transform: `rotate(${rotate}deg)` }}
        className="rounded-full bg-gradient-to-r from-slate-700/30 to-transparent border border-slate-700/30"
      />
    </motion.div>
  )
}

// Letter animation component for letter-by-letter animation
const AnimatedLetters = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  return (
    <span className="inline-block">
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: delay + index * 0.04,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block"
          style={{
            fontWeight: 700,
            textShadow: char !== " " ? "0 0 8px rgba(168, 85, 247, 0.4)" : "none",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  )
}

export default function HeroGeometric() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Effect to cycle through phrases
  useEffect(() => {
    setIsVisible(true)
    const timer = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [])

  const currentPhrase = phrases[currentPhraseIndex]

  return (
    <div className="relative w-full flex items-center justify-center bg-black/90 py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/40" />

      {/* Animated background grid */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="h-full w-full bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* Glow effect */}
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-purple-500/20 blur-[100px]"></div>

      {/* Background shapes */}
      <div className="absolute inset-0">
        <BackgroundShape delay={0.2} width={800} height={200} rotate={-15} className="left-[-20%] top-[10%]" />
        <BackgroundShape delay={0.4} width={600} height={150} rotate={15} className="right-[-10%] top-[60%]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-slate-800/40 rounded-tl-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="mb-8">
            <KeywordBadge />
          </div>

          {/* Main heading with letter-by-letter animation */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight font-heading">
            <div className="mb-2 flex justify-center">
              <AnimatedLetters text="Optimize Your" delay={0.1} />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhraseIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <AnimatedLetters text={currentPhrase.heading} delay={0.5} />
              </motion.div>
            </AnimatePresence>
          </h1>

          {/* Animated subheading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhraseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="text-base sm:text-lg text-slate-400 mb-12 max-w-xl mx-auto font-light h-8"
            >
              {currentPhrase.subheading}
            </motion.div>
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get Started
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.5 }}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 text-white font-medium backdrop-blur-sm transition-colors border border-slate-700/20"
              >
                Sign Up
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

