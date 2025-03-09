"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { ContentResultCard } from "./content-result-card"

// Form schema
const formSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters"),
  creativity_index: z.number().min(0).max(1).default(0.5),
})

type FormValues = z.infer<typeof formSchema>

export function ParaphraseForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const { toast } = useToast()

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
    setIsLoading(true)
    setResult(null)

    try {
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

      if (!data.success || !data.paraphrasedText) {
        throw new Error(data.error || "No paraphrased text returned")
      }

      // Set result
      setResult(data.paraphrasedText)

      toast({
        title: "Text Paraphrased",
        description: "Your text has been successfully paraphrased.",
      })
    } catch (error) {
      console.error("Error paraphrasing text:", error)
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
      const blob = new Blob([result], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `paraphrased-text-${new Date().toISOString().slice(0, 10)}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: "Downloaded",
        description: "Paraphrased text downloaded as text file",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text to Paraphrase</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the text you want to paraphrase..."
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the text you want to reword while maintaining its original meaning.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="creativity_index"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creativity Level: {(field.value * 100).toFixed(0)}%</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription>Higher creativity means more variation from the original text.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Paraphrasing...
              </>
            ) : (
              "Paraphrase Text"
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
            <ContentResultCard
              title="Paraphrased Text"
              content={result}
              fileName="paraphrased-text.txt"
              onCopy={copyToClipboard}
              onDownload={downloadAsText}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

