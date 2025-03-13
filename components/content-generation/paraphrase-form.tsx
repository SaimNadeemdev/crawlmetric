"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, MessageSquare, Sliders, History, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { ContentResultCard } from "./content-result-card"
import { Badge } from "@/components/ui/badge"
import { useContentGeneration } from "@/contexts/content-generation-context"
import Link from "next/link"

// Form schema
const formSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters"),
  creativity_index: z.number().min(0).max(1).default(0.5),
})

type FormValues = z.infer<typeof formSchema>

export function ParaphraseForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { saveToHistory } = useContentGeneration()

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      creativity_index: 0.5,
    },
  })

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      setResult(null)

      console.log("Submitting paraphrase form with values:", {
        textLength: values.text.length,
        creativity_index: values.creativity_index,
      })

      // Call the API
      const response = await fetch("/api/content-generation/paraphrase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: values.text,
          creativity_index: values.creativity_index,
        }),
      })

      // Check if response is OK
      if (!response.ok) {
        let errorMessage = "Failed to paraphrase text"

        // Try to get error message from response
        try {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json()
            console.error("Paraphrase API error response:", errorData)
            errorMessage = errorData.error || errorData.message || errorMessage
          } else {
            errorMessage = await response.text()
            console.error("Paraphrase API error text:", errorMessage)
          }
        } catch (e) {
          console.error("Error parsing error response:", e)
        }

        throw new Error(errorMessage)
      }

      // Parse response
      const data = await response.json()
      console.log("Paraphrase API response:", data)

      if (!data.success) {
        console.error("Paraphrase API returned success=false:", data)
        throw new Error(data.error || "Failed to paraphrase text")
      }

      if (!data.paraphrasedText) {
        console.error("Paraphrase API missing paraphrasedText:", data)
        throw new Error("No paraphrased text returned")
      }

      // Set result
      setResult(data.paraphrasedText)
      console.log("Paraphrase successful, result length:", data.paraphrasedText.length)

      // Save to history
      saveToHistory({
        type: "paraphrase",
        prompt: {
          text: values.text,
          creativity_index: values.creativity_index,
        },
        result: data.paraphrasedText,
        metadata: {
          originalLength: values.text.length,
          paraphrasedLength: data.paraphrasedText.length,
          timestamp: new Date().toISOString(),
        },
      })

      toast({
        title: "Text Paraphrased",
        description: "Your text has been successfully paraphrased.",
      })
    } catch (error) {
      console.error("Error paraphrasing text:", error)
      setError(error instanceof Error ? error.message : "Failed to paraphrase text. Please try again.")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to paraphrase text. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      toast({
        title: "Copied",
        description: "Paraphrased text copied to clipboard",
      })
    }
  }

  // Download result as text file
  const downloadAsText = () => {
    if (result) {
      import('@/utils/client-utils').then(({ downloadFile }) => {
        downloadFile(
          result,
          `paraphrased-text-${new Date().toISOString().slice(0, 10)}.txt`,
          'text/plain'
        );
        toast({
          title: "Downloaded",
          description: "Paraphrased text downloaded as text file",
        });
      });
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gradient-to-br from-white to-gray-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-5xl"
        >
          <div className="relative">
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#40a9ff] shadow-md">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Text Paraphraser</h1>
                  <p className="text-base text-gray-500 mt-1">
                    Rewrite your content with different wording while preserving the original meaning
                  </p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2 mb-3">
                          <FormLabel className="text-base font-medium text-gray-800 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-[#0071e3]" />
                            Text to Paraphrase
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
                              placeholder="Enter the text you want to paraphrase..."
                              className="min-h-[180px] resize-none rounded-xl border-[#d2d2d7] bg-white/80 backdrop-blur-sm text-base transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                              {...field}
                            />
                          </FormControl>
                        </motion.div>
                        <FormDescription className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                          Paste the text you want to paraphrase (minimum 10 characters)
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="creativity_index"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-3">
                          <FormLabel className="text-base font-medium text-gray-800 flex items-center gap-2">
                            <Sliders className="h-5 w-5 text-[#0071e3]" />
                            Creativity Level
                          </FormLabel>
                          <span className="text-sm font-medium bg-[#0071e3]/10 text-[#0071e3] px-2.5 py-1 rounded-full">
                            {Math.round(field.value * 100)}%
                          </span>
                        </div>
                        <FormControl>
                          <div className="relative px-1 py-5">
                            <div className="absolute inset-0 flex items-center px-2">
                              <div className="w-full h-1 bg-gray-200 rounded-full"></div>
                            </div>
                            <Slider
                              min={0}
                              max={1}
                              step={0.05}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="relative z-10 custom-slider"
                            />
                          </div>
                        </FormControl>
                        <div className="flex justify-between text-sm text-gray-500 px-1">
                          <span>Conservative</span>
                          <span>Balanced</span>
                          <span>Creative</span>
                        </div>
                        <FormDescription className="text-sm text-gray-500 mt-3">
                          Higher creativity means more variation from the original text
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 rounded-xl bg-gradient-to-r from-[#0071e3] to-[#40a9ff] text-white font-medium text-lg shadow-md transition-all hover:shadow-lg"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                            <span className="ml-3">Paraphrasing...</span>
                          </div>
                        ) : (
                          <span className="flex items-center">
                            <Sparkles className="mr-2 h-5 w-5" />
                            Paraphrase Text
                          </span>
                        )}
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Link href="/dashboard/content-generation/history" className="block w-full">
                        <Button
                          type="button"
                          className="w-full h-14 rounded-xl bg-white border border-[#d2d2d7] text-[#0071e3] font-medium text-lg shadow-sm transition-all hover:bg-[#f5f5f7]"
                        >
                          <span className="flex items-center">
                            <History className="mr-2 h-5 w-5" />
                            View History
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </form>
              </Form>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M10 6V12M10 14V14.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Error</h3>
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <ContentResultCard
                      title="Paraphrased Text"
                      content={result}
                      downloadFileName="paraphrased-text.txt"
                      onCopy={copyToClipboard}
                      onDownload={downloadAsText}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Inject CSS styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Base styles that would normally be in globals.css */
        body {
          background-color: #ffffff;
        }
        
        /* Animation */
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Custom slider styles */
        .custom-slider [role="slider"] {
          height: 24px !important;
          width: 24px !important;
          background: white !important;
          border: 2px solid #0071e3 !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
        
        .custom-slider [data-orientation="horizontal"] {
          background: linear-gradient(to right, #0071e3, #40a9ff) !important;
        }
      ` }} />
    </div>
  )
}
