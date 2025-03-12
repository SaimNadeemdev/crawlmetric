"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { fsMe } from "@/lib/fonts"
import { AnimatedTitle } from "@/components/client-success-section"

// iOS-style blur effect component
function IOSBlurEffect({ className }: { className?: string }) {
  return (
    <div className={`absolute backdrop-blur-xl bg-white/50 rounded-3xl ${className}`}></div>
  )
}

// Animated counter component with improved animation
function AnimatedCounter({ 
  value, 
  suffix = "", 
  duration = 2000,
  className
}: { 
  value: number, 
  suffix?: string, 
  duration?: number,
  className?: string
}) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  })

  useEffect(() => {
    if (inView) {
      let start = 0
      const end = value
      const increment = end / 40
      const timer = setInterval(() => {
        start += increment
        if (start > end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, duration / 40)
      return () => clearInterval(timer)
    }
  }, [inView, value, duration])

  return <span ref={ref} className={cn("", className)}>{count.toLocaleString()}{suffix}</span>
}

// Enhanced Metric card component with Apple-style design
function MetricCard({ 
  value, 
  suffix = "", 
  label, 
  delay = 0,
  gradient = "from-blue-500 to-indigo-600",
  icon
}: { 
  value: number, 
  suffix?: string, 
  label: string, 
  delay?: number,
  gradient?: string,
  icon: React.ReactNode
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle glow effect that appears on hover */}
      <motion.div 
        className={`absolute -inset-0.5 rounded-[28px] bg-gradient-to-r ${gradient} opacity-0`}
        animate={{ opacity: isHovered ? 0.15 : 0 }}
        transition={{ duration: 0.2 }}
      />
      
      <motion.div 
        className="relative bg-white rounded-[24px] shadow-md overflow-hidden p-8 h-full border border-gray-100"
        whileHover={{ 
          y: -8, 
          boxShadow: "0 25px 30px -12px rgba(0, 0, 0, 0.1)"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20 
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <div className={`h-14 w-14 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
          
          {/* Subtle floating indicator */}
          <motion.div 
            className="h-2 w-2 rounded-full bg-green-400 shadow-sm"
            animate={{ 
              y: isHovered ? -3 : 0,
              boxShadow: isHovered ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
            }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 10 
            }}
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-5xl font-bold text-gray-900 tracking-tight">
            <AnimatedCounter 
              value={value} 
              suffix={suffix} 
              className="tabular-nums"
            />
          </h3>
          <p className="text-gray-600 font-medium">{label}</p>
        </div>
        
        {/* Micro-interaction detail */}
        <motion.div 
          className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${gradient}`}
          animate={{ 
            width: isHovered ? "100%" : "0%",
            opacity: isHovered ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  )
}

// Gradient heading component
function GradientTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <h2 className={cn(`text-4xl md:text-5xl font-bold section-title ${fsMe.className} bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent`, className)}>
      {children}
    </h2>
  )
}

export function MetricsBanner() {
  return (
    <section className="relative w-full py-24 overflow-hidden metrics-banner">
      {/* Pure white background */}
      <div className="absolute inset-0 bg-white" />

      {/* Animated background grid - same as hero */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="h-full w-full bg-[radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* iOS-style glow effects */}
      <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-blue-300/20 blur-[120px]"></div>
      <div className="absolute right-1/4 bottom-1/3 h-[350px] w-[350px] translate-x-1/2 translate-y-1/2 transform rounded-full bg-purple-300/20 blur-[100px]"></div>
      
      {/* iOS-style blur panels */}
      <IOSBlurEffect className="w-[300px] h-[200px] -top-[50px] -left-[150px] rotate-15 opacity-70" />
      <IOSBlurEffect className="w-[400px] h-[250px] -bottom-[100px] -right-[200px] -rotate-15 opacity-70" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div 
          className="flex flex-col items-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Premium badge */}
          <motion.div
            className="inline-block mb-4"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.1,
            }}
          >
            <span
              className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/80 shadow-sm shadow-blue-100/20"
            >
              <motion.span
                className="mr-2 h-2 w-2 rounded-full bg-blue-500"
                animate={{
                  opacity: [1, 0.7, 1],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
              Our Metrics
            </span>
          </motion.div>
          
          <AnimatedTitle>Impact by the Numbers</AnimatedTitle>
          
          <motion.p
            className="text-gray-600 text-center max-w-2xl text-lg leading-relaxed tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Real results that drive business growth and improve search visibility
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <MetricCard 
            value={2400000} 
            suffix="+" 
            label="Keywords Tracked" 
            delay={0.1}
            gradient="from-blue-500 to-blue-300"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                <line x1="16" y1="8" x2="2" y2="22"></line>
                <line x1="17.5" y1="15" x2="9" y2="15"></line>
              </svg>
            }
          />
          <MetricCard 
            value={98} 
            suffix="%" 
            label="Client Retention" 
            delay={0.2}
            gradient="from-blue-500 to-blue-300"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            }
          />
          <MetricCard 
            value={43} 
            suffix="%" 
            label="Avg. Traffic Increase" 
            delay={0.3}
            gradient="from-blue-500 to-blue-300"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            }
          />
          <MetricCard 
            value={24} 
            suffix="/7" 
            label="Rank Monitoring" 
            delay={0.4}
            gradient="from-blue-500 to-blue-300"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            }
          />
        </div>
      </div>
    </section>
  )
}
