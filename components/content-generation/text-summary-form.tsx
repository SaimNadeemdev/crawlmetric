"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, BarChart2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ContentResultCard } from "./content-result-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

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

export function TextSummaryForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<TextAnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState("summary")
  const { toast } = useToast()

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      language_name: "English (United States)",
    },
  })

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setSummary(null)
    setAnalysis(null)

    try {
      const response = await fetch("/api/content-generation/text-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: values.text,
          language_name: values.language_name,
        }),
      })

      // Check if response is OK
      if (!response.ok) {
        let errorMessage = "Failed to analyze text"

        // Try to get error message from response
        try {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json()
            errorMessage = errorData.message || errorData.error || errorMessage
          } else {
            errorMessage = await response.text()
          }
        } catch (e) {
          console.error("Error parsing error response:", e)
        }

        throw new Error(errorMessage)
      }

      // Parse response
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to analyze text")
      }

      // Set results
      setSummary(data.summary)
      setAnalysis(data.analysis)

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
      toast({
        title: "Copied",
        description: "Text analysis copied to clipboard",
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
      a.download = `text-analysis-${new Date().toISOString().slice(0, 10)}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: "Downloaded",
        description: "Text analysis downloaded as text file",
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
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="language_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Select the language of your text.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text to Analyze</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter the text you want to analyze..." className="min-h-[200px]" {...field} />
                </FormControl>
                <FormDescription>Enter the text you want to analyze (minimum 50 characters).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Text...
              </>
            ) : (
              "Analyze Text"
            )}
          </Button>
        </form>
      </Form>

      <AnimatePresence>
        {(summary || analysis) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Detailed Metrics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                {summary && (
                  <ContentResultCard
                    title="Text Analysis Summary"
                    content={summary}
                    fileName="text-analysis.txt"
                    onCopy={copyToClipboard}
                    onDownload={downloadAsText}
                  />
                )}
              </TabsContent>

              <TabsContent value="metrics" className="mt-4">
                {analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Text Metrics</CardTitle>
                      <CardDescription>Comprehensive analysis of your text</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Basic Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted rounded-lg p-4">
                          <h3 className="text-sm font-medium mb-2">Text Structure</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Words:</span>
                              <span className="font-medium">{analysis.words}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Sentences:</span>
                              <span className="font-medium">{analysis.sentences}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Paragraphs:</span>
                              <span className="font-medium">{analysis.paragraphs}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted rounded-lg p-4">
                          <h3 className="text-sm font-medium mb-2">Character Count</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">With spaces:</span>
                              <span className="font-medium">{analysis.characters_with_spaces}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Without spaces:</span>
                              <span className="font-medium">{analysis.characters_without_spaces}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Per word:</span>
                              <span className="font-medium">{analysis.characters_per_word.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted rounded-lg p-4">
                          <h3 className="text-sm font-medium mb-2">Errors</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Spelling:</span>
                              <span
                                className={`font-medium ${analysis.spelling_errors > 0 ? "text-red-500" : "text-green-500"}`}
                              >
                                {analysis.spelling_errors}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Grammar:</span>
                              <span
                                className={`font-medium ${analysis.grammar_errors > 0 ? "text-red-500" : "text-green-500"}`}
                              >
                                {analysis.grammar_errors}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total:</span>
                              <span
                                className={`font-medium ${(analysis.spelling_errors + analysis.grammar_errors) > 0 ? "text-red-500" : "text-green-500"}`}
                              >
                                {analysis.spelling_errors + analysis.grammar_errors}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Readability Metrics */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Readability Scores</h3>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Flesch-Kincaid Grade Level</span>
                              <span className="text-sm font-medium">
                                {getReadabilityLevel(analysis.flesch_kincaid_grade_level)}
                              </span>
                            </div>
                            <Progress
                              value={Math.min(100, (analysis.flesch_kincaid_grade_level / 100) * 100)}
                              className={getReadabilityColor(analysis.flesch_kincaid_grade_level)}
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Coleman-Liau Index</span>
                              <span className="text-sm font-medium">
                                Grade {Math.round(analysis.coleman_liau_index)}
                              </span>
                            </div>
                            <Progress
                              value={Math.min(100, (analysis.coleman_liau_index / 16) * 100)}
                              className="bg-blue-500"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Automated Readability Index</span>
                              <span className="text-sm font-medium">
                                Grade {Math.round(analysis.automated_readability_index)}
                              </span>
                            </div>
                            <Progress
                              value={Math.min(100, (analysis.automated_readability_index / 16) * 100)}
                              className="bg-purple-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Keyword Density */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Top Keywords</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {Object.entries(analysis.keyword_density)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 10)
                            .map(([word, count], index) => (
                              <div key={index} className="bg-muted rounded-lg p-2 text-center">
                                <div className="text-sm font-medium truncate">{word}</div>
                                <div className="text-xs text-muted-foreground">{count} times</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

