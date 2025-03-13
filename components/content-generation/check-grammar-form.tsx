"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Download, Wand2, AlertCircle, CheckCircle2, Globe, FileText, Zap, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useContentGenerationContext } from "@/hooks/use-content-generation"

// Form schema
const formSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters"),
  language_code: z.string().default("en-US"),
  auto_correct: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

// Interface for grammar errors based on the DataForSEO API response
interface GrammarError {
  message: string
  description: string
  suggestions: string[]
  position: {
    start: number
    end: number
  }
  severity: "critical" | "major" | "minor"
}

interface GrammarResult {
  correctedText: string
  errors: GrammarError[]
}

export function CheckGrammarForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GrammarResult | null>(null)
  const [activeTab, setActiveTab] = useState<"original" | "corrected">("corrected")
  const [mounted, setMounted] = useState(false)
  const [glowColor, setGlowColor] = useState("#0071e3")
  const { toast } = useToast()
  const { saveToHistory } = useContentGenerationContext()

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

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      language_code: "en-US",
      auto_correct: true,
    },
  })

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setResult(null)

    try {
      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock result
      const mockResult: GrammarResult = {
        correctedText: values.text.replace(/\bi\b/g, "I").replace(/\s\s+/g, " ").trim(),
        errors: [
          {
            message: "Capitalization error",
            description: "Personal pronoun 'i' should be capitalized",
            suggestions: ["I"],
            position: {
              start: values.text.indexOf("i"),
              end: values.text.indexOf("i") + 1,
            },
            severity: "minor",
          },
          {
            message: "Double spacing",
            description: "Multiple consecutive spaces detected",
            suggestions: [" "],
            position: {
              start: values.text.indexOf("  "),
              end: values.text.indexOf("  ") + 2,
            },
            severity: "minor",
          },
        ],
      }

      setResult(mockResult)

      // Save to history
      saveToHistory({
        type: "check-grammar",
        prompt: {
          text: values.text,
          language_code: values.language_code,
          auto_correct: values.auto_correct
        },
        result: JSON.stringify({
          corrected_text: mockResult.correctedText,
          errors: mockResult.errors
        }),
        created_at: new Date().toISOString(),
      });

      toast({
        title: "Grammar Check Complete",
        description: `Found ${mockResult.errors.length} issues in your text.`,
      })
    } catch (error) {
      console.error("Error checking grammar:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check grammar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.correctedText)
      toast({
        title: "Copied",
        description: "Corrected text copied to clipboard",
      })
    }
  }

  // Download corrected text as file
  const downloadAsText = () => {
    if (result) {
      import('@/utils/client-utils').then(({ downloadFile }) => {
        downloadFile(
          result.correctedText,
          `corrected-text-${new Date().toISOString().slice(0, 10)}.txt`,
          'text/plain'
        );
        toast({
          title: "Downloaded",
          description: "Corrected text downloaded as text file",
        });
      });
    }
  }

  const getSeverityColor = (severity: GrammarError["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-600 border-red-200"
      case "major":
        return "bg-amber-100 text-amber-600 border-amber-200"
      case "minor":
        return "bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: GrammarError["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4" />
      case "major":
        return <AlertCircle className="h-4 w-4" />
      case "minor":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <CheckCircle2 className="h-4 w-4" />
    }
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
                      <Wand2 className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-semibold tracking-tight text-gray-900">
                        Grammar Checker
                      </CardTitle>
                      <CardDescription className="text-base text-gray-500 mt-1">
                        Check and correct grammar, spelling, and style issues
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
                                    <FileText className="h-5 w-5 text-[#0071e3]" />
                                    Text to Check
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
                                      placeholder="Enter text to check for grammar and spelling errors..."
                                      className="min-h-[180px] resize-none rounded-xl border-[#d2d2d7] bg-white/80 backdrop-blur-sm text-base transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                                      {...field}
                                    />
                                  </FormControl>
                                </motion.div>
                                <FormDescription className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                                  <CheckCircle2 className="h-4 w-4 text-[#0071e3]" />
                                  Enter the text you want to check for grammar, spelling, and style issues
                                </FormDescription>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="language_code"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center gap-2 mb-3">
                                    <FormLabel className="text-base font-medium text-gray-800 flex items-center gap-2">
                                      <Globe className="h-5 w-5 text-[#0071e3]" />
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
                                      <SelectContent className="rounded-xl border-[#d2d2d7] bg-white/90 backdrop-blur-xl">
                                        <SelectItem value="en-US">English (US)</SelectItem>
                                        <SelectItem value="en-GB">English (UK)</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                        <SelectItem value="de">German</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </motion.div>
                                  <FormDescription className="text-sm text-gray-500 mt-2">
                                    Select the language of your text
                                  </FormDescription>
                                  <FormMessage className="text-red-500" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="auto_correct"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-[#d2d2d7] p-4 bg-white/80 backdrop-blur-sm">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base font-medium text-gray-800">Auto-correct</FormLabel>
                                    <FormDescription className="text-sm text-gray-500">
                                      Automatically apply suggested corrections
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="data-[state=checked]:bg-[#0071e3]"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

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
                                  <span className="ml-3">Checking grammar...</span>
                                </div>
                              ) : (
                                <span className="flex items-center">
                                  <Zap className="mr-2 h-5 w-5" />
                                  Check Grammar
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
                              <CheckCircle2 className="h-5 w-5 text-[#0071e3]" />
                              Grammar Tips
                            </h3>
                            <ul className="space-y-4">
                              <li className="flex gap-3">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                  <span className="text-sm font-semibold">1</span>
                                </div>
                                <div>
                                  <p className="text-gray-700 font-medium">Use active voice</p>
                                  <p className="text-sm text-gray-500">
                                    Active voice makes your writing clearer and more engaging.
                                  </p>
                                </div>
                              </li>
                              <li className="flex gap-3">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                  <span className="text-sm font-semibold">2</span>
                                </div>
                                <div>
                                  <p className="text-gray-700 font-medium">Be concise</p>
                                  <p className="text-sm text-gray-500">
                                    Remove unnecessary words to make your writing more powerful.
                                  </p>
                                </div>
                              </li>
                              <li className="flex gap-3">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                  <span className="text-sm font-semibold">3</span>
                                </div>
                                <div>
                                  <p className="text-gray-700 font-medium">Check punctuation</p>
                                  <p className="text-sm text-gray-500">
                                    Proper punctuation improves readability and clarity.
                                  </p>
                                </div>
                              </li>
                              <li className="flex gap-3">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                  <span className="text-sm font-semibold">4</span>
                                </div>
                                <div>
                                  <p className="text-gray-700 font-medium">Avoid jargon</p>
                                  <p className="text-sm text-gray-500">
                                    Use simple language that everyone can understand.
                                  </p>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {result && (
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
                                <Wand2 className="h-6 w-6 text-[#0071e3]" />
                                Grammar Check Results
                              </h2>
                              <p className="text-gray-500 mb-6">
                                {result.errors.length > 0
                                  ? `Found ${result.errors.length} issues in your text`
                                  : "No grammar issues found in your text"}
                              </p>

                              <Tabs
                                defaultValue={activeTab}
                                onValueChange={(value) => setActiveTab(value as "original" | "corrected")}
                                className="w-full"
                              >
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                  <TabsTrigger value="corrected" className="text-base">
                                    Corrected Text
                                  </TabsTrigger>
                                  <TabsTrigger value="original" className="text-base">
                                    Original Text
                                  </TabsTrigger>
                                </TabsList>
                                <TabsContent value="corrected" className="space-y-5">
                                  <div className="bg-[#f5f5f7] rounded-xl border border-[#d2d2d7] p-4 max-h-[300px] overflow-y-auto text-gray-800 whitespace-pre-wrap">
                                    {result.correctedText}
                                  </div>
                                </TabsContent>
                                <TabsContent value="original" className="space-y-5">
                                  <div className="bg-[#f5f5f7] rounded-xl border border-[#d2d2d7] p-4 max-h-[300px] overflow-y-auto text-gray-800 whitespace-pre-wrap">
                                    {form.getValues().text}
                                  </div>
                                </TabsContent>
                              </Tabs>

                              {result.errors.length > 0 && (
                                <div className="mt-6 space-y-3">
                                  <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-[#0071e3]" />
                                    Issues Found
                                  </h3>
                                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                    {result.errors.map((error, index) => (
                                      <div
                                        key={index}
                                        className="p-4 rounded-xl border border-[#d2d2d7] bg-white/80 backdrop-blur-sm"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className={`p-1.5 rounded-full ${getSeverityColor(error.severity)}`}>
                                            {getSeverityIcon(error.severity)}
                                          </div>
                                          <div className="flex-1">
                                            <p className="font-medium text-gray-800">{error.message}</p>
                                            <p className="text-sm text-gray-600 mt-1">{error.description}</p>
                                            {error.suggestions.length > 0 && (
                                              <div className="mt-3">
                                                <p className="text-xs text-gray-500 mb-1.5">Suggestions:</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                  {error.suggestions.map((suggestion, i) => (
                                                    <Badge
                                                      key={i}
                                                      variant="outline"
                                                      className="bg-[#0071e3]/5 text-[#0071e3] border-[#0071e3]/20"
                                                    >
                                                      {suggestion}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between items-center border-t border-[#d2d2d7] px-6 py-4 bg-[#f5f5f7]">
                              <div className="text-sm text-gray-500 flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-[#0071e3] mr-2" />
                                Use the corrected text in your documents for better clarity
                              </div>
                              <div className="flex gap-2">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                  <Button
                                    variant="outline"
                                    className="rounded-xl border-[#d2d2d7] hover:bg-[#0071e3]/5 hover:text-[#0071e3] transition-colors"
                                    onClick={copyToClipboard}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Text
                                  </Button>
                                </motion.div>
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
                                    Download
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                  </Button>
                                </motion.div>
                              </div>
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
