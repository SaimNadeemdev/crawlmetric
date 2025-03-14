"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Type, Tag, RefreshCw, CheckCircle, FileText, Sparkles, MessageSquare, FileBarChart2, BookOpen, Wand2, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { GenerateTextForm } from "@/components/content-generation/generate-text-form"
import { GenerateMetaTagsForm } from "@/components/content-generation/generate-meta-tags-form"
import { ParaphraseForm } from "@/components/content-generation/paraphrase-form"
import { CheckGrammarForm } from "@/components/content-generation/check-grammar-form"
import { TextAnalysisForm } from "@/components/content-generation/text-summary-form"
import { Badge } from "@/components/ui/badge"
import ContentGenerationHistory from "@/components/content-generation/content-generation-history"
import { Button } from "@/components/ui/button"
import { AnimatedTitle } from "@/components/client-success-section"
import { ClientProviders } from "@/components/providers/client-providers"
import { isClient } from "@/utils/client-utils"
import { safeWindowAddEventListener, getWindowDimensions } from "@/lib/client-utils"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';


export default function ContentGenerationPage() {
  const [activeTab, setActiveTab] = useState("generate-text")
  const [mounted, setMounted] = useState(false)
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Initialize animated background
  useEffect(() => {
    if (!isClient) return;
    
    setMounted(true)
    
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      if (!canvas) return
      const { width, height } = getWindowDimensions();
      canvas.width = width;
      canvas.height = height;
    }
    
    resizeCanvas()
    const cleanupListener = safeWindowAddEventListener('resize', resizeCanvas)
    
    // Create dots
    const dots: { x: number; y: number; radius: number; opacity: number; speed: number }[] = []
    
    for (let i = 0; i < 100; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.2 + 0.1
      })
    }
    
    // Animation loop
    let animationFrameId: number
    
    const animate = () => {
      if (!ctx || !canvas) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw dots
      dots.forEach(dot => {
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 0, 0, ${dot.opacity * 0.3})`
        ctx.fill()
        
        // Move dots
        dot.y += dot.speed
        
        // Reset dots that go off screen
        if (dot.y > canvas.height) {
          dot.y = 0
          dot.x = Math.random() * canvas.width
        }
      })
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      cleanupListener()
      cancelAnimationFrame(animationFrameId)
    }
  }, [mounted])

  return (
    <div className="relative">
      {/* Animated dotted background */}
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full opacity-50 pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="flex flex-col items-center text-center mb-3">
            <div className="flex items-center gap-3 mb-3">
              <AnimatedTitle>Content Generation</AnimatedTitle>
              <Badge className="bg-gradient-to-r from-[#0071e3] to-[#40a9ff] text-white text-xs font-medium py-1 px-2 rounded-full">
                AI Powered
              </Badge>
            </div>
            <p className="text-gray-500 text-lg max-w-2xl">Generate high-quality content for your website using AI-powered tools.</p>
          </div>
        </motion.div>

        {/* Expandable History Section */}
        <div className="mb-8">
          <div 
            className="flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-[22px] p-5 border border-gray-100 shadow-sm cursor-pointer hover:bg-white/90 transition-all duration-300"
            onClick={() => setHistoryExpanded(!historyExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">Content Generation History</h3>
                <p className="text-gray-500">View and manage your previously generated content</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-10 w-10 bg-gray-100/70 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            >
              {historyExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
          
          <AnimatePresence>
            {historyExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-b-[22px] p-6 border border-gray-100 border-t-0 shadow-sm">
                  <ContentGenerationHistory />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-8"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[22px] p-2 border border-gray-100 shadow-sm">
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 bg-transparent">
              <TabsTrigger 
                value="generate-text" 
                className={`flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  activeTab === "generate-text" 
                    ? "bg-gradient-to-r from-blue-600 to-blue-400 !text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100/80"
                }`}
              >
                <Wand2 className={`h-4 w-4 ${activeTab === "generate-text" ? "text-white" : ""}`} />
                <span className="hidden sm:inline">Generate Text</span>
                <span className="sm:hidden">Text</span>
              </TabsTrigger>
              <TabsTrigger 
                value="generate-meta-tags" 
                className={`flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  activeTab === "generate-meta-tags" 
                    ? "bg-gradient-to-r from-blue-600 to-blue-400 !text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100/80"
                }`}
              >
                <Tag className={`h-4 w-4 ${activeTab === "generate-meta-tags" ? "text-white" : ""}`} />
                <span className="hidden sm:inline">Meta Tags</span>
                <span className="sm:hidden">Meta</span>
              </TabsTrigger>
              <TabsTrigger 
                value="paraphrase" 
                className={`flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  activeTab === "paraphrase" 
                    ? "bg-gradient-to-r from-blue-600 to-blue-400 !text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100/80"
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${activeTab === "paraphrase" ? "text-white" : ""}`} />
                <span>Paraphrase</span>
              </TabsTrigger>
              <TabsTrigger 
                value="check-grammar" 
                className={`flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  activeTab === "check-grammar" 
                    ? "bg-gradient-to-r from-blue-600 to-blue-400 !text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100/80"
                }`}
              >
                <CheckCircle className={`h-4 w-4 ${activeTab === "check-grammar" ? "text-white" : ""}`} />
                <span className="hidden sm:inline">Grammar Check</span>
                <span className="sm:hidden">Grammar</span>
              </TabsTrigger>
              <TabsTrigger 
                value="text-summary" 
                className={`flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  activeTab === "text-summary" 
                    ? "bg-gradient-to-r from-blue-600 to-blue-400 !text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100/80"
                }`}
              >
                <FileBarChart2 className={`h-4 w-4 ${activeTab === "text-summary" ? "text-white" : ""}`} />
                <span className="hidden sm:inline">Text Summary</span>
                <span className="sm:hidden">Summary</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate-text" className="space-y-4">
              <Card className="overflow-hidden border border-gray-100 rounded-[22px] shadow-sm hover:shadow-md transition-all duration-300 bg-white/90 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-300"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Wand2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">Generate Text</CardTitle>
                      <CardDescription className="text-gray-500">Create original content from keywords, topics, or seed text.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <GenerateTextForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generate-meta-tags" className="space-y-4">
              <Card className="overflow-hidden border border-gray-100 rounded-[22px] shadow-sm hover:shadow-md transition-all duration-300 bg-white/90 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-300"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">Meta Tags</CardTitle>
                      <CardDescription className="text-gray-500">Generate SEO-optimized meta tags for your content.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <GenerateMetaTagsForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paraphrase" className="space-y-4">
              <Card className="overflow-hidden border border-gray-100 rounded-[22px] shadow-sm hover:shadow-md transition-all duration-300 bg-white/90 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-300"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">Paraphrase</CardTitle>
                      <CardDescription className="text-gray-500">Rewrite content while maintaining the original meaning.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ParaphraseForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="check-grammar" className="space-y-4">
              <Card className="overflow-hidden border border-gray-100 rounded-[22px] shadow-sm hover:shadow-md transition-all duration-300 bg-white/90 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-300"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">Grammar Check</CardTitle>
                      <CardDescription className="text-gray-500">Check and correct grammar, spelling, and punctuation.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CheckGrammarForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="text-summary" className="space-y-4">
              <Card className="overflow-hidden border border-gray-100 rounded-[22px] shadow-sm hover:shadow-md transition-all duration-300 bg-white/90 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-300"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <FileBarChart2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">Text Summary</CardTitle>
                      <CardDescription className="text-gray-500">Generate concise summaries of longer content.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <TextAnalysisForm />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
