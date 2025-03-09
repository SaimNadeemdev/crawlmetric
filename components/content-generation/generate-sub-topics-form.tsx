"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

// Form schema
const formSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters"),
  depth: z.string().transform((val) => Number.parseInt(val, 10)),
})

type FormValues = z.infer<typeof formSchema>

export function GenerateSubTopicsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string[] | null>(null)
  const { toast } = useToast()

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      depth: "1",
    },
  })

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/content-generation/generate-sub-topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: values.topic,
          depth: values.depth,
        }),
      })

      // Check if response is OK
      if (!response.ok) {
        let errorMessage = "Failed to generate sub topics"

        // Try to get error message from response
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If response is not JSON, try to get text
          errorMessage = (await response.text()) || errorMessage
        }

        throw new Error(errorMessage)
      }

      // Parse response
      const data = await response.json()

      if (!data.subTopics || !Array.isArray(data.subTopics)) {
        throw new Error("No sub topics returned")
      }

      setResult(data.subTopics)

      toast({
        title: "Sub Topics Generated",
        description: `Generated ${data.subTopics.length} sub topics for "${values.topic}"`,
      })
    } catch (error) {
      console.error("Error generating sub topics:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate sub topics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy sub topics to clipboard
  const copyToClipboard = () => {
    if (result) {
      const text = result.map((topic, index) => `${index + 1}. ${topic}`).join("\n")
      navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Sub topics copied to clipboard",
      })
    }
  }

  // Download sub topics as text file
  const downloadAsText = () => {
    if (result) {
      const text = result.map((topic, index) => `${index + 1}. ${topic}`).join("\n")
      const blob = new Blob([text], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sub-topics-${form.getValues().topic.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: "Downloaded",
        description: "Sub topics downloaded as text file",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Topic</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your main topic..." {...field} />
                </FormControl>
                <FormDescription>Enter the main topic for which you want to generate sub-topics.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="depth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Depth Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select depth level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Level 1 (Basic)</SelectItem>
                    <SelectItem value="2">Level 2 (Detailed)</SelectItem>
                    <SelectItem value="3">Level 3 (Comprehensive)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Higher depth levels generate more detailed sub-topics.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Sub Topics...
              </>
            ) : (
              "Generate Sub Topics"
            )}
          </Button>
        </form>
      </Form>

      <AnimatePresence>
        {result && result.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Generated Sub Topics</CardTitle>
                <CardDescription>
                  {result.length} sub topics for "{form.getValues().topic}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-decimal pl-5 space-y-2">
                  {result.map((topic, index) => (
                    <li key={index} className="text-sm">
                      {topic}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadAsText}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

