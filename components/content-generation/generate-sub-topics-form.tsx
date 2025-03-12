"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { Loader2, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useContentGeneration } from "@/contexts/content-generation-context"

// Form schema
const formSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters"),
  depth: z.coerce.number().min(1).max(5),
})

type FormValues = z.infer<typeof formSchema>

export function GenerateSubTopicsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string[] | null>(null)
  const { toast } = useToast()
  const { saveToHistory } = useContentGeneration()

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      depth: 1,
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
      setResult(data.topics || [])

      // Save to history
      saveToHistory({
        type: "generate-sub-topics",
        prompt: {
          topic: values.topic,
          depth: values.depth
        },
        result: data.topics.join("\n"),
        metadata: {
          topicCount: data.topics.length,
          timestamp: new Date().toISOString()
        }
      })

      toast({
        title: "Success",
        description: `Generated ${data.topics.length} sub-topics for "${values.topic}"`,
      })
    } catch (error) {
      console.error("Error generating sub-topics:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate sub-topics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!result) return

    const text = result.map((topic, index) => `${index + 1}. ${topic}`).join("\n")
    navigator.clipboard.writeText(text)

    toast({
      title: "Copied",
      description: "Sub-topics copied to clipboard",
    })
  }

  // Download as text
  const downloadAsText = () => {
    if (!result) return

    const text = result.map((topic, index) => `${index + 1}. ${topic}`).join("\n")
    const element = document.createElement("a")
    const file = new Blob([text], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `sub-topics-${form.getValues().topic.replace(/\s+/g, "-").toLowerCase()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Downloaded",
      description: "Sub-topics downloaded as text file",
    })
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Topic</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your main topic..."
                      className="rounded-xl border-gray-200 bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-black"
                      {...field}
                    />
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
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select depth level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Level 1 - Basic</SelectItem>
                      <SelectItem value="2">Level 2 - Detailed</SelectItem>
                      <SelectItem value="3">Level 3 - Comprehensive</SelectItem>
                      <SelectItem value="4">Level 4 - In-depth</SelectItem>
                      <SelectItem value="5">Level 5 - Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose how detailed you want the sub-topics to be.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Sub-Topics"
            )}
          </Button>
        </form>
      </Form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <Card className="overflow-hidden border border-gray-200 rounded-[22px] bg-white/80 backdrop-blur-xl shadow-sm">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-gray-800">Generated Sub-Topics</CardTitle>
              <CardDescription className="text-gray-600">
                {result.length} sub-topics generated for "{form.getValues().topic}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-xl p-4 max-h-[400px] overflow-y-auto border border-gray-100">
                <ul className="space-y-2 text-black">
                  {result.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-800">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2 pb-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button
                variant="default"
                size="sm"
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                onClick={downloadAsText}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
