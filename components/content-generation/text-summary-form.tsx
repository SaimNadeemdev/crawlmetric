"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart2,
  FileText,
  Copy,
  Download,
  Check,
  BookOpen,
  Sparkles,
  MessageSquareText,
  Lightbulb,
  ChevronRight,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useContentGeneration } from "@/contexts/content-generation-context"

// Form schema
const formSchema = z.object({
  text: z.string().min(50, "Text must be at least 50 characters for analysis"),
  language_name: z.string().default("English (United States)"),
})

type FormValues = z.infer<typeof formSchema>

// Interface for text analysis result
interface TextAnalysisResult {
  sentences: number
  paragraphs: number
  words: number
  characters_without_spaces: number
  characters_with_spaces: number
  words_per_sentence: number
  characters_per_word: number
  vocabulary_density: number
  keyword_density: Record<string, number>
  automated_readability_index: number
  coleman_liau_index: number
  flesch_kincaid_grade_level: number
  smog_readability_index: number
  spelling_errors: number
  grammar_errors: number
}

// Language options
const languages = [
  { value: "English (United States)", label: "English (US)" },
  { value: "English (United Kingdom)", label: "English (UK)" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Italian", label: "Italian" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Russian", label: "Russian" },
]

export function TextAnalysisForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [analysisSummary, setAnalysisSummary] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<TextAnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState("summary")
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [glowColor, setGlowColor] = useState("#0071e3")
  const { toast } = useToast()
  const { saveToHistory } = useContentGeneration()

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      language_name: "English (United States)",
    },
  })

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Animated glow effect
  useEffect(() => {
    if (!mounted) return

    const colors = [
      "#0071e3", // Apple blue
      "#3a86ff", // Light blue
      "#5e60ce", // Purple
      "#7400b8", // Deep purple
      "#6930c3", // Violet
      "#5390d9", // Sky blue
      "#4ea8de", // Light sky blue
    ]

    let colorIndex = 0
    const interval = setInterval(() => {
      colorIndex = (colorIndex + 1) % colors.length
      setGlowColor(colors[colorIndex])
    }, 2000)

    return () => clearInterval(interval)
  }, [mounted])

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setSummary(null)
    setAnalysisSummary(null)
    setAnalysis(null)

    try {
      // Make actual API call to the backend
      const response = await fetch('/api/content-generation/text-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: values.text,
          language: values.language_name
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Set results from actual API response
      setSummary(data.summary);
      setAnalysisSummary(data.analysisSummary);
      setAnalysis(data.analysis);

      // Save to history
      saveToHistory({
        type: "text-summary",
        prompt: {
          text: values.text,
          language_name: values.language_name
        },
        result: data.summary,
        metadata: {
          analysis: data.analysis,
          originalLength: values.text.length,
          summaryLength: data.summary.length,
          timestamp: new Date().toISOString()
        }
      })

      toast({
        title: "Text Analysis Complete",
        description: "Your text has been successfully analyzed.",
      })
    } catch (error) {
      console.error("Error analyzing text:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze text. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied",
        description: "Text summary copied to clipboard",
      })
    }
  }

  // Download result as text file
  const downloadAsText = () => {
    if (summary) {
      const blob = new Blob([summary], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `text-summary-${new Date().toISOString().slice(0, 10)}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: "Downloaded",
        description: "Text summary downloaded as text file",
      })
    }
  }

  // Get readability level description
  const getReadabilityLevel = (score: number): string => {
    if (score > 90) return "Very Easy"
    if (score > 80) return "Easy"
    if (score > 70) return "Fairly Easy"
    if (score > 60) return "Standard"
    if (score > 50) return "Fairly Difficult"
    if (score > 30) return "Difficult"
    return "Very Difficult"
  }

  // Get color for readability score
  const getReadabilityColor = (score: number): string => {
    if (score > 70) return "bg-green-500"
    if (score > 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gradient-to-br from-white to-gray-50">
      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-5xl"
          >
            {/* Main container with subtle glow effect */}
            <div className="relative">
              <Card
                className="relative overflow-hidden border-none bg-white/90 backdrop-blur-xl shadow-xl rounded-3xl"
                style={{
                  boxShadow: `0 10px 40px -10px rgba(0,0,0,0.1), 0 0 15px 2px ${glowColor}20`,
                  transition: "box-shadow 1.5s ease-in-out",
                }}
              >
                <CardHeader className="space-y-2 pb-6 pt-8 px-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#40a9ff] shadow-md">
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-semibold tracking-tight text-gray-900">
                        Text Analysis Tool
                      </CardTitle>
                      <CardDescription className="text-base text-gray-500 mt-1">
                        Summarize and analyze your text content with AI
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form section - 3 columns */}
                    <div className="lg:col-span-3 space-y-6">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="text"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2 mb-3">
                                  <FormLabel className="text-base font-medium text-gray-800 flex items-center gap-2">
                                    <MessageSquareText className="h-5 w-5 text-[#0071e3]" />
                                    Text Content
                                  </FormLabel>
                                  <Badge
                                    variant="outline"
                                    className="ml-auto bg-[#0071e3]/5 text-[#0071e3] border-[#0071e3]/20 font-medium"
                                  >
                                    Required
                                  </Badge>
                                </div>
                                <motion.div
                                  whileFocus={{ scale: 1.005 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                  <FormControl>
                                    <Textarea
                                      placeholder="Enter the text you want to summarize and analyze..."
                                      className="min-h-[180px] resize-none rounded-xl border-[#d2d2d7] bg-white/80 backdrop-blur-sm text-base transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                                      {...field}
                                    />
                                  </FormControl>
                                </motion.div>
                                <FormDescription className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                                  <Lightbulb className="h-4 w-4 text-amber-500" />
                                  Enter at least 50 characters for a meaningful analysis
                                </FormDescription>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="language_name"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2 mb-3">
                                  <FormLabel className="text-base font-medium text-gray-800 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-[#0071e3]" />
                                    Language
                                  </FormLabel>
                                </div>
                                <motion.div
                                  whileFocus={{ scale: 1.005 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-12 rounded-xl border-[#d2d2d7] bg-white/80 backdrop-blur-sm text-base transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]">
                                        <SelectValue placeholder="Select language" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl border-[#d2d2d7] bg-white/95 backdrop-blur-md">
                                      {languages.map((language) => (
                                        <SelectItem key={language.value} value={language.value}>
                                          {language.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </motion.div>
                                <FormDescription className="text-sm text-gray-500 mt-2">
                                  Select the language of your text for more accurate analysis
                                </FormDescription>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />

                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            className="pt-2"
                          >
                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="w-full h-14 rounded-xl bg-gradient-to-r from-[#0071e3] to-[#40a9ff] text-white font-medium text-lg shadow-md transition-all hover:shadow-lg"
                            >
                              {isLoading ? (
                                <div className="flex items-center justify-center">
                                  <div className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                                  <span className="ml-3">Analyzing text...</span>
                                </div>
                              ) : (
                                <span className="flex items-center">
                                  <Zap className="mr-2 h-5 w-5" />
                                  Analyze & Summarize
                                </span>
                              )}
                            </Button>
                          </motion.div>
                        </form>
                      </Form>
                    </div>

                    {/* Tips section - 2 columns */}
                    <div className="lg:col-span-2">
                      <div className="h-full relative rounded-2xl overflow-hidden">
                        {/* Content with glass effect and thin border */}
                        <div className="relative h-full rounded-xl bg-white/80 backdrop-blur-sm p-6 overflow-hidden shadow-sm border border-[#d2d2d7]">
                          {/* Subtle gradient overlay */}
                          <div
                            className="absolute inset-0 opacity-10"
                            style={{
                              background: "radial-gradient(circle at top right, #0071e3, transparent 70%)",
                            }}
                          />

                          <div className="relative z-10">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-amber-500" />
                              Analysis Tips
                            </h3>
                            <ul className="space-y-4">
                              <li className="flex gap-3">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                  <span className="text-sm font-semibold">1</span>
                                </div>
                                <div>
                                  <p className="text-gray-700 font-medium">Longer texts yield better results</p>
                                  <p className="text-sm text-gray-500">
                                    For more accurate analysis, provide at least 200 words
                                  </p>
                                </div>
                              </li>
                              <li className="flex gap-3">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                  <span className="text-sm font-semibold">2</span>
                                </div>
                                <div>
                                  <p className="text-gray-700 font-medium">Choose the correct language</p>
                                  <p className="text-sm text-gray-500">Language selection affects readability scores</p>
                                </div>
                              </li>
                              <li className="flex gap-3">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                  <span className="text-sm font-semibold">3</span>
                                </div>
                                <div>
                                  <p className="text-gray-700 font-medium">Check readability scores</p>
                                  <p className="text-sm text-gray-500">Lower scores indicate easier-to-read content</p>
                                </div>
                              </li>
                              <li className="flex gap-3">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                  <span className="text-sm font-semibold">4</span>
                                </div>
                                <div>
                                  <p className="text-gray-700 font-medium">Review keyword density</p>
                                  <p className="text-sm text-gray-500">Aim for natural keyword usage (1-3%)</p>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {(summary || analysis) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="mt-10"
                      >
                        <div className="relative">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0071e3] to-[#40a9ff]"></div>
                          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#d2d2d7] overflow-hidden shadow-lg">
                            <div className="p-6">
                              <h2 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                <BarChart2 className="h-6 w-6 text-[#0071e3]" />
                                Analysis Results
                              </h2>
                              <p className="text-gray-500 mb-6">Summary and detailed analysis of your text content</p>

                              <Tabs defaultValue="summary" className="w-full" onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#f5f5f7] rounded-xl p-1">
                                  <TabsTrigger
                                    value="summary"
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0071e3] data-[state=active]:shadow-sm"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Summary
                                  </TabsTrigger>
                                  <TabsTrigger
                                    value="analysis"
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0071e3] data-[state=active]:shadow-sm"
                                  >
                                    <BarChart2 className="h-4 w-4 mr-2" />
                                    Analysis
                                  </TabsTrigger>
                                </TabsList>

                                <TabsContent value="summary" className="space-y-5">
                                  {summary && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                      className="space-y-4"
                                    >
                                      <div className="bg-gradient-to-br from-white to-[#f5f5f7] rounded-2xl border border-[#d2d2d7] p-6 max-h-[400px] overflow-y-auto shadow-sm backdrop-blur-xl">
                                        <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.2, duration: 0.8 }}
                                        >
                                          <h3 className="text-xl font-semibold text-gray-900 mb-4 bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">AI-Generated Summary</h3>
                                          <div className="prose prose-blue max-w-none text-gray-800 leading-relaxed">
                                            {summary.split('\n').map((paragraph, index) => (
                                              <motion.p 
                                                key={index}
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                                                className="mb-3"
                                              >
                                                {paragraph}
                                              </motion.p>
                                            ))}
                                          </div>
                                        </motion.div>
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <motion.div 
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.3, duration: 0.5 }}
                                          className="text-sm text-gray-500 bg-[#f5f5f7] px-4 py-2 rounded-full"
                                        >
                                          <span className="font-medium">{summary.split(" ").length}</span> words,
                                          <span className="font-medium ml-1">{summary.length}</span> characters
                                        </motion.div>
                                        <div className="flex gap-2">
                                          <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                          >
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="rounded-xl border-[#d2d2d7] hover:bg-[#0071e3]/5 hover:text-[#0071e3] transition-colors"
                                              onClick={copyToClipboard}
                                            >
                                              {copied ? (
                                                <>
                                                  <Check className="h-4 w-4 mr-1" />
                                                  Copied
                                                </>
                                              ) : (
                                                <>
                                                  <Copy className="h-4 w-4 mr-1" />
                                                  Copy
                                                </>
                                              )}
                                            </Button>
                                          </motion.div>
                                          <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                          >
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="rounded-xl border-[#d2d2d7] hover:bg-[#0071e3]/5 hover:text-[#0071e3] transition-colors"
                                              onClick={downloadAsText}
                                            >
                                              <Download className="h-4 w-4 mr-1" />
                                              Download
                                            </Button>
                                          </motion.div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </TabsContent>

                                <TabsContent value="analysis" className="space-y-5">
                                  {analysis && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                      className="space-y-6"
                                    >
                                      {/* Text Analysis Summary */}
                                      <div className="bg-gradient-to-br from-white to-[#f5f5f7] rounded-2xl border border-[#d2d2d7] p-6 max-h-[400px] overflow-y-auto shadow-sm backdrop-blur-xl">
                                        <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.2, duration: 0.8 }}
                                        >
                                          <h3 className="text-xl font-semibold text-gray-900 mb-4 bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">Text Analysis Overview</h3>
                                          <div className="prose prose-blue max-w-none text-gray-800 leading-relaxed">
                                            {analysisSummary && analysisSummary.split('\n').map((paragraph, index) => (
                                              <motion.p 
                                                key={index}
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                                                className="mb-3"
                                              >
                                                {paragraph}
                                              </motion.p>
                                            ))}
                                          </div>
                                        </motion.div>
                                      </div>

                                      {/* Text Statistics */}
                                      <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                        className="space-y-4 bg-white/80 backdrop-blur-sm rounded-xl border border-[#d2d2d7] p-5"
                                      >
                                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-[#0071e3]" />
                                          Text Statistics
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                          <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4, duration: 0.5 }}
                                            className="bg-[#f5f5f7] rounded-xl p-4 flex flex-col items-center"
                                          >
                                            <div className="text-xs text-gray-500 mb-1">Words</div>
                                            <div className="text-xl font-semibold text-gray-800">
                                              {analysis.words}
                                            </div>
                                          </motion.div>
                                          <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.45, duration: 0.5 }}
                                            className="bg-[#f5f5f7] rounded-xl p-4 flex flex-col items-center"
                                          >
                                            <div className="text-xs text-gray-500 mb-1">Sentences</div>
                                            <div className="text-xl font-semibold text-gray-800">
                                              {analysis.sentences}
                                            </div>
                                          </motion.div>
                                          <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5, duration: 0.5 }}
                                            className="bg-[#f5f5f7] rounded-xl p-4 flex flex-col items-center"
                                          >
                                            <div className="text-xs text-gray-500 mb-1">Paragraphs</div>
                                            <div className="text-xl font-semibold text-gray-800">
                                              {analysis.paragraphs}
                                            </div>
                                          </motion.div>
                                          <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.55, duration: 0.5 }}
                                            className="bg-[#f5f5f7] rounded-xl p-4 flex flex-col items-center"
                                          >
                                            <div className="text-xs text-gray-500 mb-1">Characters</div>
                                            <div className="text-xl font-semibold text-gray-800">
                                              {analysis.characters_with_spaces}
                                            </div>
                                          </motion.div>
                                        </div>
                                      </motion.div>

                                      {/* Readability Scores */}
                                      <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6, duration: 0.5 }}
                                        className="space-y-4 bg-white/80 backdrop-blur-sm rounded-xl border border-[#d2d2d7] p-5"
                                      >
                                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                          <Sparkles className="h-4 w-4 text-[#0071e3]" />
                                          Readability Scores
                                        </h3>
                                        <div className="space-y-4">
                                          {[
                                            { title: "Flesch-Kincaid Grade Level", value: analysis.flesch_kincaid_grade_level },
                                            { title: "Coleman-Liau Index", value: analysis.coleman_liau_index },
                                            { title: "SMOG Readability", value: analysis.smog_readability_index }
                                          ].map((item, index) => (
                                            <motion.div key={item.title}>
                                              <div className="flex justify-between mb-1">
                                                <span className="text-xs text-gray-500">{item.title}</span>
                                                <span className="text-xs font-medium">{item.value.toFixed(1)}</span>
                                              </div>
                                              <div className="h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                                                <motion.div
                                                  initial={{ width: 0 }}
                                                  animate={{ width: `${Math.min(item.value * 8, 100)}%` }}
                                                  transition={{ delay: 0.7 + 0.2 * index, duration: 1, ease: "easeOut" }}
                                                  className="h-full bg-gradient-to-r from-[#0071e3] to-[#40a9ff]"
                                                />
                                              </div>
                                            </motion.div>
                                          ))}
                                        </div>
                                      </motion.div>

                                      {/* Top Keywords */}
                                      <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7, duration: 0.5 }}
                                        className="space-y-4 bg-white/80 backdrop-blur-sm rounded-xl border border-[#d2d2d7] p-5"
                                      >
                                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                          <MessageSquareText className="h-4 w-4 text-[#0071e3]" />
                                          Top Keywords
                                        </h3>
                                        <div className="space-y-3">
                                          {Object.entries(analysis.keyword_density)
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 5)
                                            .map(([keyword, density], index) => (
                                              <motion.div 
                                                key={keyword} 
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.8 + 0.1 * index, duration: 0.4 }}
                                                className="flex items-center justify-between"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div className="h-2 w-2 rounded-full bg-[#0071e3]"></div>
                                                  <span className="text-sm font-medium text-gray-700">"{keyword}"</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <div className="w-32 h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                                                    <motion.div
                                                      initial={{ width: 0 }}
                                                      animate={{ width: `${Math.min(density * 40, 100)}%` }}
                                                      transition={{ delay: 0.9 + 0.1 * index, duration: 0.8, ease: "easeOut" }}
                                                      className="h-full bg-gradient-to-r from-[#0071e3] to-[#40a9ff]"
                                                    />
                                                  </div>
                                                  <span className="text-xs text-gray-500">{density.toFixed(1)}</span>
                                                </div>
                                              </motion.div>
                                            ))}
                                        </div>
                                      </motion.div>

                                      {/* Text Quality */}
                                      <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8, duration: 0.5 }}
                                        className="space-y-4 bg-white/80 backdrop-blur-sm rounded-xl border border-[#d2d2d7] p-5"
                                      >
                                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-[#0071e3]" />
                                          Text Quality
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                          <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.9, duration: 0.5 }}
                                            className="bg-[#f5f5f7] rounded-xl p-4 flex flex-col items-center"
                                          >
                                            <div className="text-xs text-gray-500 mb-1">Spelling Errors</div>
                                            <div className={`text-xl font-semibold ${analysis.spelling_errors > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                                              {analysis.spelling_errors}
                                            </div>
                                          </motion.div>
                                          <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1, duration: 0.5 }}
                                            className="bg-[#f5f5f7] rounded-xl p-4 flex flex-col items-center"
                                          >
                                            <div className="text-xs text-gray-500 mb-1">Grammar Errors</div>
                                            <div className={`text-xl font-semibold ${analysis.grammar_errors > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                                              {analysis.grammar_errors}
                                            </div>
                                          </motion.div>
                                        </div>
                                      </motion.div>
                                    </motion.div>
                                  )}
                                </TabsContent>
                              </Tabs>
                            </div>
                            <div className="flex justify-between items-center border-t border-[#d2d2d7] px-6 py-4 bg-[#f5f5f7]">
                              <div className="text-sm text-gray-500 flex items-center">
                                <Lightbulb className="h-4 w-4 text-amber-500 mr-2" />
                                Analyze your text regularly to maintain optimal readability
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                              >
                                <Button
                                  className="rounded-xl bg-gradient-to-r from-[#0071e3] to-[#40a9ff] text-white transition-colors"
                                  onClick={downloadAsText}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Results
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inject CSS styles */}
      <style jsx global>{`
        /* Base styles that would normally be in globals.css */
        body {
          background-color: #ffffff;
          color: #222222;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Animation keyframes */
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse-glow {
          0% { filter: blur(10px); opacity: 0.5; }
          50% { filter: blur(15px); opacity: 0.7; }
          100% { filter: blur(10px); opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
