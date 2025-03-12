"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedTitle } from "@/components/client-success-section"
import Lottie from "lottie-react"
import { useState } from "react"

// iOS-style blur effect component
function IOSBlurEffect({ className }: { className?: string }) {
  return (
    <div className={`absolute backdrop-blur-xl bg-white/50 rounded-3xl ${className}`}></div>
  )
}

// iOS-style card component with advanced interactions
function IOSCard({ 
  children, 
  className, 
  custom, 
  variants 
}: { 
  children: React.ReactNode, 
  className?: string, 
  custom: number,
  variants: any
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      custom={custom}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      className="relative"
    >
      {/* iOS-style shadow effect that animates on hover */}
      <motion.div 
        className="absolute -inset-0.5 rounded-[24px] bg-gradient-to-r from-blue-100 to-purple-100 opacity-0"
        animate={{ opacity: isHovered ? 0.6 : 0, scale: isHovered ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      />
      
      <motion.div
        className={`relative bg-white rounded-[22px] shadow-sm overflow-hidden transition-all duration-300 ${className}`}
        animate={{ 
          y: isHovered ? -6 : 0,
          boxShadow: isHovered 
            ? "0 20px 30px -10px rgba(0, 0, 0, 0.1), 0 10px 20px -10px rgba(0, 0, 0, 0.04)" 
            : "0 4px 10px -2px rgba(0, 0, 0, 0.05)"
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function ServicesSection() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  }

  const MotionCard = motion(Card);
  
  const [activeCard, setActiveCard] = useState<number | null>(null);

  // iOS-style button with hover and tap effects
  const IOSButton = ({ children, className, href }: { children: React.ReactNode, className?: string, href: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <motion.div 
        className="w-full"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Button asChild className={`w-full rounded-2xl font-medium transition-all duration-300 h-12 ${className}`}>
          <Link href={href} className="flex items-center justify-center gap-2">
            {children}
            <motion.div
              animate={{ x: isHovered ? 4 : 0, opacity: isHovered ? 1 : 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <Lottie 
                animationData={require("@/public/lottie/arrow-right.json")} 
                className="h-4 w-4"
                loop={true}
              />
            </motion.div>
          </Link>
        </Button>
      </motion.div>
    );
  };

  // iOS-style tag component
  const IOSTag = ({ children }: { children: React.ReactNode }) => (
    <motion.span 
      className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 shadow-sm"
      whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
    >
      {children}
    </motion.span>
  );

  return (
    <section className="relative w-full py-24 overflow-hidden">
      {/* Pure white background */}
      <div className="absolute inset-0 bg-white" />

      {/* Animated background grid - same as hero */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="h-full w-full bg-[radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* iOS-style glow effects */}
      <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-purple-300/20 blur-[120px]"></div>
      <div className="absolute right-1/4 bottom-1/3 h-[350px] w-[350px] translate-x-1/2 translate-y-1/2 transform rounded-full bg-blue-300/20 blur-[100px]"></div>
      
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
              Our Services
            </span>
          </motion.div>
          
          <AnimatedTitle>Comprehensive SEO Tools</AnimatedTitle>
          
          <motion.p
            className="text-gray-600 text-lg leading-relaxed tracking-wide mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Boost your website's search engine performance with our powerful suite of tools
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Keyword Research Card */}
          <IOSCard custom={0} variants={cardVariants}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-[18px] bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg overflow-hidden">
                    <Lottie 
                      animationData={require("@/public/lottie/keyword-research.json")} 
                      className="h-10 w-10"
                      loop={true}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Keyword Research</h3>
                    <p className="text-gray-500 text-sm mt-0.5">Discover high-value keywords</p>
                  </div>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-xs px-3 py-1.5 rounded-full bg-purple-100 text-purple-600 font-medium shadow-sm"
                >
                  Popular
                </motion.div>
              </div>
              
              <p className="text-sm text-gray-600 mb-5">
                Find the perfect keywords to target with our advanced research tool. Analyze search volume, competition,
                and keyword difficulty to optimize your content strategy.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <IOSTag>Search Volume</IOSTag>
                <IOSTag>Difficulty Score</IOSTag>
                <IOSTag>Trend Analysis</IOSTag>
              </div>
              
              <IOSButton 
                href="/keyword-research" 
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
              >
                Start Research
              </IOSButton>
            </div>
          </IOSCard>

          {/* Content Generation Card */}
          <IOSCard custom={1} variants={cardVariants}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-[18px] bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg overflow-hidden">
                    <Lottie 
                      animationData={require("@/public/lottie/content-generation.json")} 
                      className="h-10 w-10"
                      loop={true}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Content Generation</h3>
                    <p className="text-gray-500 text-sm mt-0.5">AI-powered content tools</p>
                  </div>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 font-medium shadow-sm"
                >
                  AI-Powered
                </motion.div>
              </div>
              
              <p className="text-sm text-gray-600 mb-5">
                Generate high-quality, SEO-friendly content with our AI-powered tools. Create meta descriptions, blog
                outlines, and full articles optimized for your target keywords.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <IOSTag>Blog Posts</IOSTag>
                <IOSTag>Meta Descriptions</IOSTag>
                <IOSTag>Product Copy</IOSTag>
              </div>
              
              <IOSButton 
                href="/content-generation" 
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-md hover:shadow-lg"
              >
                Generate Content
              </IOSButton>
            </div>
          </IOSCard>

          {/* Rank Tracking Card */}
          <IOSCard custom={2} variants={cardVariants}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-[18px] bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg overflow-hidden">
                    <Lottie 
                      animationData={require("@/public/lottie/rank-tracking.json")} 
                      className="h-10 w-10"
                      loop={true}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Rank Tracking</h3>
                    <p className="text-gray-500 text-sm mt-0.5">Monitor search positions</p>
                  </div>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-600 font-medium shadow-sm"
                >
                  Real-time
                </motion.div>
              </div>
              
              <p className="text-sm text-gray-600 mb-5">
                Track your website's rankings for target keywords over time. Get insights into ranking changes, competitor
                movements, and opportunities for improvement.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <IOSTag>Daily Updates</IOSTag>
                <IOSTag>Competitor Analysis</IOSTag>
                <IOSTag>History Tracking</IOSTag>
              </div>
              
              <IOSButton 
                href="/dashboard/main" 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
              >
                Track Rankings
              </IOSButton>
            </div>
          </IOSCard>

          {/* Site Audit Card */}
          <div className="md:col-span-2 lg:col-span-3">
            <IOSCard custom={3} variants={cardVariants} className="h-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-[18px] bg-gradient-to-r from-orange-500 to-pink-600 flex items-center justify-center shadow-lg overflow-hidden">
                      <Lottie 
                        animationData={require("@/public/lottie/site-audit.json")} 
                        className="h-10 w-10"
                        loop={true}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Full Site Audit</h3>
                      <p className="text-gray-500 text-sm mt-0.5">Complete SEO health analysis</p>
                    </div>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-xs px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 font-medium shadow-sm"
                  >
                    Comprehensive
                  </motion.div>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                  Get a complete picture of your website's SEO performance with our detailed site audit. Identify technical
                  issues, content gaps, and optimization opportunities to improve your search rankings.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <motion.div 
                    className="bg-white p-5 rounded-[18px] shadow-sm border border-gray-100"
                    whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-3">
                      <span className="h-8 w-8 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center text-sm font-bold shadow-sm">1</span>
                      Technical SEO
                    </h3>
                    <p className="text-sm text-gray-600">
                      Identify crawlability issues, broken links, slow page speed, and other technical problems.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="bg-white p-5 rounded-[18px] shadow-sm border border-gray-100"
                    whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-3">
                      <span className="h-8 w-8 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center text-sm font-bold shadow-sm">2</span>
                      On-Page Analysis
                    </h3>
                    <p className="text-sm text-gray-600">
                      Evaluate title tags, meta descriptions, headings, content quality, and keyword usage.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="bg-white p-5 rounded-[18px] shadow-sm border border-gray-100"
                    whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-3">
                      <span className="h-8 w-8 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center text-sm font-bold shadow-sm">3</span>
                      Actionable Insights
                    </h3>
                    <p className="text-sm text-gray-600">
                      Get prioritized recommendations to fix issues and improve your site's SEO performance.
                    </p>
                  </motion.div>
                </div>
                
                <IOSButton 
                  href="/site-audit" 
                  className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white shadow-md hover:shadow-lg"
                >
                  Start Site Audit
                </IOSButton>
              </div>
            </IOSCard>
          </div>
        </div>
      </div>
    </section>
  )
}
