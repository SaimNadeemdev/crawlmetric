"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InstantAuditForm } from "@/components/seo-audit/instant-audit-form"
import { FullSiteAuditForm } from "@/components/seo-audit/full-site-audit-form"
import { SiteAuditTaskList } from "@/components/seo-audit/site-audit-task-list"
import { LighthouseAuditForm } from "@/components/seo-audit/lighthouse-audit-form"
import LighthouseResults from "@/components/seo-audit/lighthouse-results-fixed"
import { Search, Globe, Sparkles, ArrowRight, Info, RefreshCw } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { SeoAuditProvider } from "@/contexts/seo-audit-context"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { AnimatedTitle } from "@/components/client-success-section"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';


export default function SeoAuditPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab")
  const { toast } = useToast()
  const { activeSiteAuditTask, lighthouseAuditResults, siteAuditTasks } = useSeoAudit()
  const { setActiveSiteAuditTask } = useSeoAudit()
  const [activeTab, setActiveTab] = useState<string>(
    tabParam === "site" ? "site" : tabParam === "lighthouse" ? "lighthouse" : "instant"
  )
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/seo-audit?tab=${value}`, { scroll: false })
  }

  // Update tab state if URL parameter changes
  useEffect(() => {
    if (tabParam === "site" || tabParam === "instant" || tabParam === "lighthouse") {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Track mouse position for interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Initialize animated background
  useEffect(() => {
    setMounted(true)

    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create dots with improved properties
    const dots: {
      x: number
      y: number
      radius: number
      opacity: number
      speed: number
      originalX: number
      originalY: number
      angle: number
      distance: number
    }[] = []

    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      dots.push({
        x,
        y,
        originalX: x,
        originalY: y,
        radius: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 0.15 + 0.05,
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * 2 + 1,
      })
    }

    // Animation loop
    let animationFrameId: number

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw dots with subtle movement
      dots.forEach((dot) => {
        // Subtle floating movement
        dot.angle += dot.speed / 20
        dot.x = dot.originalX + Math.sin(dot.angle) * dot.distance
        dot.y = dot.originalY + Math.cos(dot.angle) * dot.distance

        // Subtle interaction with mouse
        const dx = mousePosition.x - dot.x
        const dy = mousePosition.y - dot.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 150

        if (distance < maxDistance) {
          const force = (1 - distance / maxDistance) * 0.2
          dot.x -= dx * force
          dot.y -= dy * force
        }

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 113, 227, ${dot.opacity * 0.4})`
        ctx.fill()

        // Draw connections between nearby dots
        dots.forEach((otherDot) => {
          const dx = dot.x - otherDot.x
          const dy = dot.y - otherDot.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 80) {
            ctx.beginPath()
            ctx.moveTo(dot.x, dot.y)
            ctx.lineTo(otherDot.x, otherDot.y)
            ctx.strokeStyle = `rgba(0, 113, 227, ${0.03 * (1 - distance / 80)})`
            ctx.stroke()
          }
        })
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mounted, mousePosition])

  // Staggered animation for children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  }

  return (
    <SeoAuditProvider>
      <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Animated background */}
        <canvas ref={canvasRef} className="fixed inset-0 h-full w-full opacity-40 pointer-events-none" />

        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-tr from-blue-50/30 to-transparent pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center justify-center mb-3">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#40a9ff] shadow-md mb-4"
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
            </div>

            <div className="flex items-center justify-center mb-3">
              <AnimatedTitle>Onsite SEO Audit</AnimatedTitle>
            </div>

            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge className="bg-gradient-to-r from-[#0071e3] to-[#40a9ff] text-white text-xs font-medium py-1 px-3 rounded-full">
                AI Powered
              </Badge>
              <Badge
                variant="outline"
                className="bg-white/80 backdrop-blur-sm text-gray-600 border-gray-200 text-xs font-medium py-1 px-3 rounded-full"
              >
                Comprehensive Analysis
              </Badge>
            </div>

            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Analyze your website for SEO issues and discover optimization opportunities with our advanced AI-powered
              tools
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="max-w-5xl mx-auto"
          >
            <Card className="border-none bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 sm:p-8">
                  <Tabs
                    defaultValue={activeTab}
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="space-y-8"
                  >
                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-1.5 border border-gray-100 shadow-sm">
                      <TabsList className="grid grid-cols-3 gap-2 bg-transparent h-auto p-0">
                        <TabsTrigger
                          value="instant"
                          className={`flex items-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                            activeTab === "instant"
                              ? "bg-gradient-to-r from-[#0071e3] to-[#40a9ff] !text-white shadow-md"
                              : "text-gray-600 hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          <Search className={`h-4 w-4 ${activeTab === "instant" ? "text-white" : "text-[#0071e3]"}`} />
                          <span>Instant Page Audit</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="site"
                          className={`flex items-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                            activeTab === "site"
                              ? "bg-gradient-to-r from-[#0071e3] to-[#40a9ff] !text-white shadow-md"
                              : "text-gray-600 hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          <Globe className={`h-4 w-4 ${activeTab === "site" ? "text-white" : "text-[#0071e3]"}`} />
                          <span>Full Site Audit</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="lighthouse"
                          className={`flex items-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                            activeTab === "lighthouse"
                              ? "bg-gradient-to-r from-[#0071e3] to-[#40a9ff] !text-white shadow-md"
                              : "text-gray-600 hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          <Sparkles className={`h-4 w-4 ${activeTab === "lighthouse" ? "text-white" : "text-[#0071e3]"}`} />
                          <span>Lighthouse Audit</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <AnimatePresence mode="wait">
                      <TabsContent value="instant" className="space-y-6 mt-8" asChild>
                        <motion.div
                          key="instant"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="space-y-2 mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                              <Search className="h-5 w-5 text-[#0071e3]" />
                              Instant Page Audit
                            </h2>
                            <p className="text-gray-500">
                              Analyze a specific page for SEO issues and get instant recommendations
                            </p>
                          </div>

                          <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 gap-6"
                          >
                            <motion.div variants={itemVariants} className="w-full">
                              <InstantAuditForm />
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="site" className="space-y-6 mt-8" asChild>
                        <motion.div
                          key="site"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="space-y-2 mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                              <Globe className="h-5 w-5 text-[#0071e3]" />
                              Full Site Audit
                            </h2>
                            <p className="text-gray-500">
                              Comprehensive analysis of your entire website with detailed reports
                            </p>
                          </div>

                          <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 gap-8"
                          >
                            <motion.div variants={itemVariants} className="w-full space-y-8">
                              <FullSiteAuditForm />
                              <SiteAuditTaskList />
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="lighthouse" className="space-y-6 mt-8" asChild>
                        <motion.div
                          key="lighthouse"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="space-y-2 mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-[#0071e3]" />
                              Lighthouse Audit
                            </h2>
                            <p className="text-gray-500">
                              Performance, accessibility, SEO, and best practices analysis powered by Google Lighthouse
                            </p>
                          </div>

                          <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 gap-6"
                          >
                            <motion.div variants={itemVariants} className="w-full">
                              <LighthouseAuditForm />
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>
                </div>

                <div className="mt-6 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 px-6 sm:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-500 flex items-center">
                    <Sparkles className="h-4 w-4 text-[#0071e3] mr-2" />
                    Powered by advanced AI algorithms for accurate results
                  </div>
                  <motion.a
                    href="#learn-more"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center text-sm font-medium text-[#0071e3] hover:text-[#0057b3] transition-colors"
                  >
                    Learn more about our SEO tools
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </motion.a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </SeoAuditProvider>
  )
}
