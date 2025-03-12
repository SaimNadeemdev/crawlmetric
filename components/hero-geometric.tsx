"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import Link from "next/link"
import { KeywordBadge } from "./keyword-badge"
import { DashboardPreview } from "./dashboard-preview"
import { lilgrotesk, fsMe, poppins, pacifico } from "@/lib/fonts"

// Phrases to cycle through
const phrases = [
  { heading: "Search Rankings", subheading: "" },
  { heading: "Website Traffic", subheading: "" },
  { heading: "Keyword Position", subheading: "Monitor your progress" },
  { heading: "SEO Performance", subheading: "Optimize your content" },
]

// Feature tags to display
const featureTags = [
  "Keyword Research",
  "Keyword Tracker",
  "Content Generation",
  "SEO Analysis"
]

// Tag component with blue background and white text
const FeatureTag = ({ text }: { text: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ 
      duration: 0.4,
      type: "spring",
      stiffness: 300
    }}
    className="mx-1 my-1"
  >
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#0071e3] text-white text-xs font-medium tracking-tight">
      <span className="mr-1.5 text-white">•</span>
      {text}
    </div>
  </motion.div>
);

// iOS-style blur effect component
function IOSBlurEffect({ className }: { className?: string }) {
  return (
    <div className={`absolute backdrop-blur-xl bg-white/50 rounded-3xl ${className}`}></div>
  )
}

// Background shape component with iOS-style design
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
        className="rounded-[40px] bg-gradient-to-r from-blue-100/70 to-white/30 backdrop-blur-md border border-white/50 shadow-lg"
      />
    </motion.div>
  )
}

// Letter animation component for letter-by-letter animation
const AnimatedLetters = ({ text, delay = 0, useBlue = false, usePacifico = false }: { 
  text: string; 
  delay?: number; 
  useBlue?: boolean;
  usePacifico?: boolean;
}) => {
  // Capitalize first letter of each word
  const formattedText = text.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  return (
    <span className={`inline-block ${usePacifico ? 'pacifico-text' : ''}`}>
      {formattedText.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: delay + index * 0.04,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`inline-block ${usePacifico ? 'pacifico-text' : ''} ${useBlue ? 'bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent' : ''}`}
          style={{
            fontFamily: usePacifico ? 'Pacifico, cursive !important' : 'inherit',
            fontWeight: useBlue ? 700 : 700,
            textShadow: !useBlue && char !== " " ? "0 0 8px rgba(79, 70, 229, 0.2)" : "none",
            position: 'relative',
            zIndex: 1,
            margin: '0 1px', // Add a small margin to prevent cut-off
            lineHeight: '1.1', // Adjust line height to prevent cut-off
            display: 'inline-flex', // Use inline-flex for better character alignment
            alignItems: 'center',
            height: useBlue ? '1.2em' : 'auto', // Fixed height for better alignment
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  )
}

// Word animation component with gradient applied to whole words
const AnimatedWords = ({ text, delay = 0, useBlue = false, usePacifico = false }: { 
  text: string; 
  delay?: number; 
  useBlue?: boolean;
  usePacifico?: boolean;
}) => {
  // Split text into words
  const words = text.split(' ');
  
  // Calculate total character count for each word for animation timing
  const wordLengths = words.map(word => word.length);
  const totalChars = wordLengths.reduce((sum, len) => sum + len, 0);
  
  return (
    <div className="inline-flex flex-wrap" style={{ overflow: 'visible' }}>
      {words.map((word, index) => {
        // Calculate delay for this word based on previous word lengths
        const previousChars = wordLengths.slice(0, index).reduce((sum, len) => sum + len, 0);
        const wordDelay = delay + previousChars * 0.04;
        
        // Capitalize first letter
        const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        
        return (
          <div 
            key={index} 
            className={`relative mx-1 my-1 overflow-visible ${usePacifico ? pacifico.className : ''}`}
          >
            {/* Hidden text for proper sizing */}
            <span 
              className="invisible" 
              aria-hidden="true"
              style={{ fontFamily: usePacifico ? 'Pacifico, cursive' : 'inherit' }}
            >
              {capitalizedWord}
            </span>
            
            {/* Visible gradient background */}
            {useBlue && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-[#0071e3] to-[#40a9ff]"
                style={{ borderRadius: '4px' }}
              />
            )}
            
            {/* Animated letters */}
            <div 
              className={`relative ${useBlue ? 'mix-blend-screen text-white' : ''}`}
              style={{ 
                fontFamily: usePacifico ? 'Pacifico, cursive' : 'inherit',
                fontWeight: 700,
              }}
            >
              {capitalizedWord.split('').map((char, charIndex) => (
                <motion.span
                  key={charIndex}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: wordDelay + charIndex * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block"
                  style={{
                    textShadow: !useBlue ? "0 0 8px rgba(79, 70, 229, 0.2)" : "none",
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Use the gradientText class directly for the heading with letter-by-letter animation
const AnimatedGradientHeading = ({ text, delay = 0, className }: { 
  text: string; 
  delay?: number;
  className?: string;
}) => {
  // Capitalize first letter of each word
  const formattedText = text.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  return (
    <div className={`inline-block ${className || ''}`} style={{ fontFamily: 'Pacifico, cursive !important' }}>
      {formattedText.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: delay + index * 0.04,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block pacifico-text"
          style={{
            fontFamily: 'Pacifico, cursive !important',
            fontWeight: 700,
            position: 'relative',
            zIndex: 1,
            margin: '0 1px',
            lineHeight: '1.3',
            display: 'inline-flex',
            alignItems: 'center',
            color: '#0071e3', // Blue color
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  );
};

// iOS-style floating element
const FloatingElement = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const controls = useAnimation();
  
  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      transition: {
        delay,
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse"
      }
    });
  }, [controls, delay]);
  
  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, ...controls }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
};

export default function HeroGeometric() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
    <div ref={containerRef} className="relative w-full flex items-center justify-center bg-white py-20 md:py-32 overflow-hidden">
      {/* Background gradient - iOS style with softer colors */}
      <div className="absolute inset-0 bg-white" />

      {/* CSS for the animated gradient */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
        
        .text-blue {
          color: #06c;
        }
        
        .pacifico-text {
          font-family: 'Pacifico', cursive !important;
        }
        
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .gradientText {
          background: linear-gradient(90deg, #0071e3, #0071e3, #40a9ff, #0071e3);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          animation: gradientAnimation 8s ease infinite;
          display: inline-block;
          font-family: 'Pacifico', cursive !important;
        }
      `}</style>

      {/* Animated background grid */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="h-full w-full bg-[radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* iOS-style glow effects */}
      <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-blue-300/20 blur-[120px]"></div>
      <div className="absolute right-1/4 bottom-1/3 h-[350px] w-[350px] translate-x-1/2 translate-y-1/2 transform rounded-full bg-indigo-300/20 blur-[100px]"></div>

      {/* Background shapes with iOS-style design */}
      <div className="absolute inset-0">
        <BackgroundShape delay={0.2} width={800} height={200} rotate={-15} className="left-[-20%] top-[10%]" />
        <BackgroundShape delay={0.4} width={600} height={150} rotate={15} className="right-[-10%] top-[60%]" />
        <FloatingElement delay={0.3} className="absolute top-[15%] right-[20%]">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-white backdrop-blur-lg border border-white/50 shadow-xl"></div>
        </FloatingElement>
        <FloatingElement delay={0.7} className="absolute bottom-[25%] left-[15%]">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-100 to-white backdrop-blur-lg border border-white/50 shadow-xl"></div>
        </FloatingElement>
      </div>

      {/* iOS-style blur panels */}
      <IOSBlurEffect className="w-[300px] h-[200px] -top-[50px] -left-[150px] rotate-15 opacity-70" />
      <IOSBlurEffect className="w-[400px] h-[250px] -bottom-[100px] -right-[200px] -rotate-15 opacity-70" />

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 flex flex-wrap lg:justify-start justify-center">
              {featureTags.map((tag, index) => (
                <FeatureTag key={index} text={tag} />
              ))}
            </div>

            {/* Main heading with word-by-word animation */}
            <h1 className="text-4xl sm:text-5xl md:text-[4rem] font-semibold mb-6 tracking-tight text-[#1d1d1f]" 
              style={{ 
                letterSpacing: '-0.01em',
                overflow: 'visible', // Ensure text isn't cut off
                paddingBottom: '16px', // Increased padding to prevent cut-off
                paddingTop: '8px', // Add padding to the top as well
                lineHeight: '1.5', // Increased line height
              }}
            >
              <div className="mb-2 flex lg:justify-start justify-center overflow-visible">
                <AnimatedLetters text="Optimize Your" delay={0.1} usePacifico={false} />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhraseIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex lg:justify-start justify-center animated-heading pacifico-text`}
                  style={{ 
                    lineHeight: '1.3',
                    fontFamily: 'Pacifico, cursive !important'
                  }}
                >
                  <AnimatedGradientHeading text={currentPhrase.heading} delay={0.5} className="pacifico-text" />
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
                className="text-base sm:text-lg text-[#86868b] mb-10 max-w-xl mx-auto lg:mx-0 font-normal h-8"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                }}
              >
                {currentPhrase.subheading}
              </motion.div>
            </AnimatePresence>

            {/* Apple-style buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/login">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#06c] hover:bg-[#0071e3] text-white text-sm font-medium transition-colors shadow-sm"
                >
                  Get Started
                </motion.button>
              </Link>
              <Link href="/register">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-5 py-3 rounded-full bg-white text-[#1d1d1f] text-sm font-medium transition-colors border border-[#e5e5e7] shadow-sm"
                >
                  Sign Up
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="hidden lg:block"
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </div>
    </div>
  )
}