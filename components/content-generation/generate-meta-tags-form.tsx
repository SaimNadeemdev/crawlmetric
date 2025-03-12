"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Check, Tag, FileText, Sparkles, ChevronRight, Zap, Code, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useContentGenerationContext } from "@/hooks/use-content-generation"

// Form schema
const formSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters"),
  target_keywords: z.string().optional(),
  creativity: z.string().default("medium"),
})

type FormValues = z.infer<typeof formSchema>

type MetaTagsResult = {
  title: string
  description: string
}

export function GenerateMetaTagsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<MetaTagsResult | null>(null)
  const [copied, setCopied] = useState<"title" | "description" | "html" | null>(null)
  const [mounted, setMounted] = useState(false)
  const [glowColor, setGlowColor] = useState("#0071e3")
  const { toast } = useToast()
  const { saveToHistory } = useContentGenerationContext()

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      target_keywords: "",
      creativity: "medium",
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
    setResult(null)

    try {
      // Convert comma-separated keywords to array
      const target_keywords = values.target_keywords
        ? values.target_keywords
            .split(",")
            .map((kw) => kw.trim())
            .filter(Boolean)
        : []

      // Map creativity level to numeric value
      const creativityValue = {
        low: 0.3,
        medium: 0.6,
        high: 0.9,
      }[values.creativity] || 0.6;

      // Make actual API call to our backend
      const response = await fetch('/api/content-generation/generate-meta-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: values.text,
          target_keywords,
          creativity: creativityValue,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate meta tags');
      }

      // Set result from API response
      const metaTagsResult = {
        title: data.title,
        description: data.description,
      };
      
      setResult(metaTagsResult);
      
      // Save to history
      saveToHistory({
        type: "generate-meta-tags",
        prompt: {
          text: values.text,
          target_keywords: values.target_keywords,
          creativity: values.creativity
        },
        result: JSON.stringify(metaTagsResult),
        created_at: new Date().toISOString(),
      });

      toast({
        title: "Meta Tags Generated",
        description: "Your meta tags have been successfully generated.",
      })
    } catch (error) {
      console.error("Error generating meta tags:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate meta tags. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (type: "title" | "description" | "html") => {
    if (!result) return

    let textToCopy = ""

    switch (type) {
      case "title":
        textToCopy = result.title
        break
      case "description":
        textToCopy = result.description
        break
      case "html":
        textToCopy = `<meta name="title" content="${result.title}">\n<meta name="description" content="${result.description}">`
        break
    }

    navigator.clipboard.writeText(textToCopy)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)

    toast({
      title: "Copied",
      description: `${type === "html" ? "HTML" : type === "title" ? "Meta title" : "Meta description"} copied to clipboard`,
    })
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
              {/* Glow effects */}

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
                      <Tag className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-semibold tracking-tight text-gray-900">
                        Meta Tags Generator
                      </CardTitle>
                      <CardDescription className="text-base text-gray-500 mt-1">
                        Create optimized meta tags for better SEO performance
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
                                    Page Content
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
                                      placeholder="Enter the main content of your page..."
                                      className="min-h-[180px] resize-none rounded-xl border-[#d2d2d7] bg-white/80 backdrop-blur-sm text-base transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                                      {...field}
                                    />
                                  </FormControl>
                                </motion.div>
                                <FormDescription className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                                  <Lightbulb className="h-4 w-4 text-amber-500" />
                                  More detailed content leads to better meta tags
                                </FormDescription>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="target_keywords"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center gap-2 mb-3">
                                    <FormLabel className="text-base font-medium text-gray-800 flex items-center gap-2">
                                      <Tag className="h-5 w-5 text-[#0071e3]" />
                                      Target Keywords
                                    </FormLabel>
                                  </div>
                                  <motion.div
                                    whileFocus={{ scale: 1.005 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                  >
                                    <FormControl>
                                      <Input
                                        placeholder="Enter keywords (comma separated)"
                                        className="h-12 rounded-xl border-[#d2d2d7] bg-white/80 backdrop-blur-sm text-base transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                                        {...field}
                                      />
                                    </FormControl>
                                  </motion.div>
                                  <FormDescription className="text-sm text-gray-500 mt-2">
                                    Optional but recommended
                                  </FormDescription>
                                  <FormMessage className="text-red-500" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="creativity"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center gap-2 mb-3">
                                    <FormLabel className="text-base font-medium text-gray-800 flex items-center gap-2">
                                      <Sparkles className="h-5 w-5 text-[#0071e3]" />
                                      Creativity Level
                                    </FormLabel>
                                  </div>
                                  <FormControl>
                                    <div className="relative">
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex"
                                      >
                                        <div className="relative z-0 flex w-full rounded-xl bg-[#f5f5f7] p-1">
                                          <FormItem className="flex-1 relative z-10">
                                            <FormControl>
                                              <RadioGroupItem value="low" id="low" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel
                                              htmlFor="low"
                                              className="flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-all peer-data-[state=checked]:text-white peer-data-[state=unchecked]:text-gray-600 peer-data-[state=unchecked]:hover:text-gray-900 cursor-pointer"
                                            >
                                              Conservative
                                              {field.value === "low" && (
                                                <motion.div
                                                  layoutId="creativity-pill"
                                                  className="absolute inset-0 z-[-1] rounded-lg bg-gradient-to-r from-[#0071e3] to-[#40a9ff] shadow-md"
                                                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                              )}
                                            </FormLabel>
                                          </FormItem>
                                          <FormItem className="flex-1 relative z-10">
                                            <FormControl>
                                              <RadioGroupItem value="medium" id="medium" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel
                                              htmlFor="medium"
                                              className="flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-all peer-data-[state=checked]:text-white peer-data-[state=unchecked]:text-gray-600 peer-data-[state=unchecked]:hover:text-gray-900 cursor-pointer"
                                            >
                                              Balanced
                                              {field.value === "medium" && (
                                                <motion.div
                                                  layoutId="creativity-pill"
                                                  className="absolute inset-0 z-[-1] rounded-lg bg-gradient-to-r from-[#0071e3] to-[#40a9ff] shadow-md"
                                                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                              )}
                                            </FormLabel>
                                          </FormItem>
                                          <FormItem className="flex-1 relative z-10">
                                            <FormControl>
                                              <RadioGroupItem value="high" id="high" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel
                                              htmlFor="high"
                                              className="flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-all peer-data-[state=checked]:text-white peer-data-[state=unchecked]:text-gray-600 peer-data-[state=unchecked]:hover:text-gray-900 cursor-pointer"
                                            >
                                              Creative
                                              {field.value === "high" && (
                                                <motion.div
                                                  layoutId="creativity-pill"
                                                  className="absolute inset-0 z-[-1] rounded-lg bg-gradient-to-r from-[#0071e3] to-[#40a9ff] shadow-md"
                                                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                              )}
                                            </FormLabel>
                                          </FormItem>
                                        </div>
                                      </RadioGroup>
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-sm text-gray-500 mt-2">
                                    Higher creativity produces more varied meta tags
                                  </FormDescription>
                                  <FormMessage className="text-red-500" />
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
                                  <span className="ml-3">Generating meta tags...</span>
                                </div>
                              ) : (
                                <span className="flex items-center">
                                  <Zap className="mr-2 h-5 w-5" />
                                  Generate Meta Tags
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
                              SEO Tips
                            </h3>
                            <ul className="space-y-4">
                              <li className="flex gap-3">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                  <span className="text-sm font-semibold">1</span>
                                </div>
                                <div>
                                  <p className="text-gray-700 font-medium">Keep titles under 60 characters</p>
                                  <p className="text-sm text-gray-500">
                                    Search engines typically display the first 50-60 characters of a title tag.
                                  </p>
                                </div>
                              </li>
                              <li className="flex gap-3">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                  <span className="text-sm font-semibold">2</span>
                                </div>
                                <div>
                                  <p className="text-gray-700 font-medium">Descriptions: 120-160 characters</p>
                                  <p className="text-sm text-gray-500">
                                    Meta descriptions should be concise but descriptive.
                                  </p>
                                </div>
                              </li>
                              <li className="flex gap-3">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                  <span className="text-sm font-semibold">3</span>
                                </div>
                                <div>
                                  <p className="text-gray-700 font-medium">Include primary keywords</p>
                                  <p className="text-sm text-gray-500">
                                    Place important keywords near the beginning of titles and descriptions.
                                  </p>
                                </div>
                              </li>
                              <li className="flex gap-3">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                  <span className="text-sm font-semibold">4</span>
                                </div>
                                <div>
                                  <p className="text-gray-700 font-medium">Make it compelling</p>
                                  <p className="text-sm text-gray-500">
                                    Write meta tags that encourage users to click through to your page.
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
                                <Tag className="h-6 w-6 text-[#0071e3]" />
                                Generated Meta Tags
                              </h2>
                              <p className="text-gray-500 mb-6">
                                Add these meta tags to your HTML to improve your page's SEO performance.
                              </p>

                              <Tabs defaultValue="preview" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                  <TabsTrigger value="preview" className="text-base">
                                    Preview
                                  </TabsTrigger>
                                  <TabsTrigger value="code" className="text-base">
                                    HTML Code
                                  </TabsTrigger>
                                </TabsList>
                                <TabsContent value="preview" className="space-y-6">
                                  <div className="space-y-5">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                                          Meta Title
                                        </h3>
                                        <motion.div
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                        >
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl border-[#d2d2d7] hover:bg-[#0071e3]/5 hover:text-[#0071e3] transition-colors"
                                            onClick={() => copyToClipboard("title")}
                                          >
                                            {copied === "title" ? (
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
                                      </div>
                                      <div className="bg-[#f5f5f7] rounded-xl border border-[#d2d2d7] p-4">
                                        <p className="text-gray-800 text-lg">{result.title}</p>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">
                                          {result.title.length} characters
                                        </span>
                                        {result.title.length > 60 ? (
                                          <Badge
                                            variant="outline"
                                            className="text-amber-600 border-amber-200 bg-amber-50"
                                          >
                                            Recommended: 50-60 characters
                                          </Badge>
                                        ) : (
                                          <Badge
                                            variant="outline"
                                            className="text-green-600 border-green-200 bg-green-50"
                                          >
                                            Good length
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                                          Meta Description
                                        </h3>
                                        <motion.div
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                        >
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl border-[#d2d2d7] hover:bg-[#0071e3]/5 hover:text-[#0071e3] transition-colors"
                                            onClick={() => copyToClipboard("description")}
                                          >
                                            {copied === "description" ? (
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
                                      </div>
                                      <div className="bg-[#f5f5f7] rounded-xl border border-[#d2d2d7] p-4">
                                        <p className="text-gray-800">{result.description}</p>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">
                                          {result.description.length} characters
                                        </span>
                                        {result.description.length < 120 ? (
                                          <Badge
                                            variant="outline"
                                            className="text-amber-600 border-amber-200 bg-amber-50"
                                          >
                                            Recommended: 120-160 characters
                                          </Badge>
                                        ) : result.description.length > 160 ? (
                                          <Badge
                                            variant="outline"
                                            className="text-amber-600 border-amber-200 bg-amber-50"
                                          >
                                            Recommended: 120-160 characters
                                          </Badge>
                                        ) : (
                                          <Badge
                                            variant="outline"
                                            className="text-green-600 border-green-200 bg-green-50"
                                          >
                                            Good length
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {/* Google SERP Preview */}
                                    <div className="mt-8 space-y-3">
                                      <h3 className="text-lg font-medium text-gray-800">Google Search Preview</h3>
                                      <div className="bg-white rounded-xl border border-[#d2d2d7] p-5">
                                        <div className="max-w-2xl">
                                          <div className="text-xl text-[#1a0dab] font-medium mb-1 truncate">
                                            {result.title}
                                          </div>
                                          <div className="text-sm text-[#006621] truncate">
                                            https://yourwebsite.com/page
                                          </div>
                                          <div className="text-sm text-[#545454] mt-1">{result.description}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="code" className="space-y-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                                        <Code className="h-5 w-5 text-[#0071e3]" />
                                        HTML Code
                                      </h3>
                                      <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                      >
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="rounded-xl border-[#d2d2d7] hover:bg-[#0071e3]/5 hover:text-[#0071e3] transition-colors"
                                          onClick={() => copyToClipboard("html")}
                                        >
                                          {copied === "html" ? (
                                            <>
                                              <Check className="h-4 w-4 mr-1" />
                                              Copied
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="h-4 w-4 mr-1" />
                                              Copy Code
                                            </>
                                          )}
                                        </Button>
                                      </motion.div>
                                    </div>
                                    <div className="bg-[#1e1e1e] rounded-xl p-5 font-mono text-sm overflow-x-auto">
                                      <pre className="text-white">
                                        <span className="text-[#569cd6]">&lt;meta</span>{" "}
                                        <span className="text-[#9cdcfe]">name</span>=
                                        <span className="text-[#ce9178]">"title"</span>{" "}
                                        <span className="text-[#9cdcfe]">content</span>=
                                        <span className="text-[#ce9178]">"{result.title}"</span>
                                        <span className="text-[#569cd6]">&gt;</span>
                                        <br />
                                        <span className="text-[#569cd6]">&lt;meta</span>{" "}
                                        <span className="text-[#9cdcfe]">name</span>=
                                        <span className="text-[#ce9178]">"description"</span>{" "}
                                        <span className="text-[#9cdcfe]">content</span>=
                                        <span className="text-[#ce9178]">"{result.description}"</span>
                                        <span className="text-[#569cd6]">&gt;</span>
                                      </pre>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                      Add these meta tags to the{" "}
                                      <code className="bg-[#f5f5f7] px-1.5 py-0.5 rounded text-[#0071e3] font-mono">
                                        &lt;head&gt;
                                      </code>{" "}
                                      section of your HTML document.
                                    </p>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </div>
                            <div className="flex justify-between items-center border-t border-[#d2d2d7] px-6 py-4 bg-[#f5f5f7]">
                              <div className="text-sm text-gray-500 flex items-center">
                                <Lightbulb className="h-4 w-4 text-amber-500 mr-2" />
                                Remember to update your meta tags when your content changes
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                              >
                                <Button
                                  className="rounded-xl bg-gradient-to-r from-[#0071e3] to-[#40a9ff] text-white transition-colors"
                                  onClick={() => copyToClipboard("html")}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy HTML
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
