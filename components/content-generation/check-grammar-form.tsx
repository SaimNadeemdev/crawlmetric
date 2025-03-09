"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Copy, Download, Check, X, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  offset: number
  length: number
  type: string
  rule_id: string
  rule_description: string
  rule_issue_type: string
  rule_category_id: string
  rule_category_name: string
}

interface GrammarResult {
  correctedText: string
  errors: GrammarError[]
  originalText: string
}

// Language options
const languages = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-ES", label: "Spanish" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
  { value: "it-IT", label: "Italian" },
  { value: "pt-PT", label: "Portuguese" },
  { value: "ru-RU", label: "Russian" },
]

export function CheckGrammarForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GrammarResult | null>(null)
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("original")

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      language_code: "en-US",
      auto_correct: true,
    },
  })

  // Function to automatically correct text based on grammar errors
  const autoCorrectText = (text: string, errors: GrammarError[]): string => {
    // Sort errors by offset in descending order to avoid offset changes when applying corrections
    const sortedErrors = [...errors].sort((a, b) => b.offset - a.offset)

    let correctedText = text

    for (const error of sortedErrors) {
      // Skip errors without suggestions
      if (!error.suggestions || error.suggestions.length === 0) continue

      // Get the best suggestion (first one is usually the best)
      const bestSuggestion = error.suggestions[0]

      // Replace the error with the suggestion
      correctedText =
        correctedText.substring(0, error.offset) + bestSuggestion + correctedText.substring(error.offset + error.length)
    }

    return correctedText
  }

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/content-generation/check-grammar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: values.text,
          language_code: values.language_code,
        }),
      })

      // Check if response is OK
      if (!response.ok) {
        let errorMessage = "Failed to check grammar"

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
      console.log("Grammar check response:", data)

      if (!data.success) {
        throw new Error(data.error || "Failed to check grammar")
      }

      // Generate corrected text if auto-correct is enabled
      const originalText = data.originalText || values.text
      const errors = data.errors || []
      const correctedText = values.auto_correct ? autoCorrectText(originalText, errors) : originalText

      // Set result
      setResult({
        correctedText: correctedText,
        errors: errors,
        originalText: originalText,
      })

      // Set active tab to corrected if auto-correct is enabled and there are errors
      if (values.auto_correct && errors.length > 0) {
        setActiveTab("corrected")
      }

      toast({
        title: errors.length > 0 ? "Grammar Issues Found" : "Grammar Check Complete",
        description:
          errors.length > 0
            ? `Found ${errors.length} grammar issues in your text.${values.auto_correct ? " Text has been automatically corrected." : ""}`
            : "No grammar issues found in your text.",
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
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    })
  }

  // Download result as text file
  const downloadAsText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Downloaded",
      description: "Text downloaded as text file",
    })
  }

  // Apply a single correction
  const applySingleCorrection = (error: GrammarError, suggestion: string) => {
    if (!result) return

    const newText =
      result.correctedText.substring(0, error.offset) +
      suggestion +
      result.correctedText.substring(error.offset + error.length)

    setResult({
      ...result,
      correctedText: newText,
    })

    toast({
      title: "Correction Applied",
      description: `Changed "${result.correctedText.substring(error.offset, error.offset + error.length)}" to "${suggestion}"`,
    })
  }

  // Apply all corrections at once
  const applyAllCorrections = () => {
    if (!result) return

    const correctedText = autoCorrectText(result.originalText, result.errors)

    setResult({
      ...result,
      correctedText,
    })

    setActiveTab("corrected")

    toast({
      title: "All Corrections Applied",
      description: `Applied ${result.errors.length} corrections to your text.`,
    })
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <FormField
              control={form.control}
              name="language_code"
              render={({ field }) => (
                <FormItem className="flex-1">
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
              name="auto_correct"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Auto-Correct</FormLabel>
                    <FormDescription>Automatically fix grammar issues</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text to Check</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the text you want to check for grammar issues..."
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Enter the text you want to check for grammar and spelling errors.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Grammar"
            )}
          </Button>
        </form>
      </Form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Grammar Check Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="original">Original Text</TabsTrigger>
                    <TabsTrigger value="corrected">Corrected Text</TabsTrigger>
                  </TabsList>

                  <TabsContent value="original" className="space-y-4">
                    <div className="bg-white dark:bg-gray-950 p-4 rounded-md border border-gray-200 dark:border-gray-800 max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                      {result.originalText}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.originalText)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Original
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadAsText(
                            result.originalText,
                            `original-text-${new Date().toISOString().slice(0, 10)}.txt`,
                          )
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="corrected" className="space-y-4">
                    <div className="bg-white dark:bg-gray-950 p-4 rounded-md border border-gray-200 dark:border-gray-800 max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                      {result.correctedText}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.correctedText)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Corrected
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadAsText(
                            result.correctedText,
                            `corrected-text-${new Date().toISOString().slice(0, 10)}.txt`,
                          )
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Grammar Issues {result.errors.length > 0 ? `(${result.errors.length})` : ""}
                    </h3>

                    {result.errors.length > 0 && (
                      <Button variant="outline" size="sm" onClick={applyAllCorrections} className="text-xs">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Auto-Fix All
                      </Button>
                    )}
                  </div>

                  {result.errors.length > 0 ? (
                    <div className="bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800 max-h-[300px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                      {result.errors.map((error, index) => {
                        // Extract the error text from the original text
                        const errorText = result.originalText.substring(error.offset, error.offset + error.length)

                        return (
                          <div key={index} className="p-3 space-y-2">
                            <div className="flex items-start">
                              <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium">{error.message || error.description}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-mono bg-red-100 dark:bg-red-900/30 px-1 rounded">
                                    {errorText}
                                  </span>
                                  {error.description && <span className="ml-2 text-xs">{error.description}</span>}
                                </p>
                              </div>
                            </div>

                            {error.suggestions && error.suggestions.length > 0 && (
                              <div className="ml-7 space-y-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Suggestions:</p>
                                <div className="flex flex-wrap gap-1">
                                  {error.suggestions.slice(0, 5).map((suggestion, i) => (
                                    <button
                                      key={i}
                                      onClick={() => applySingleCorrection(error, suggestion)}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      {suggestion}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-950 p-4 rounded-md border border-gray-200 dark:border-gray-800 text-center">
                      <Check className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No grammar issues found!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

