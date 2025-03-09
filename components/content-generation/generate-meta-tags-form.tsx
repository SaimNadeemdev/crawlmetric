"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Download, Copy, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Form schema
const formSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters").max(5000, "Text must be less than 5000 characters"),
  target_keywords: z.string().optional(),
  creativity: z.number().min(0).max(1).default(0.8),
})

type FormValues = z.infer<typeof formSchema>

type MetaTagsResult = {
  metaTitle: string
  metaDescription: string
}

export function GenerateMetaTagsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<MetaTagsResult | null>(null)
  const [copied, setCopied] = useState<"title" | "description" | "html" | null>(null)
  const { toast } = useToast()

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      target_keywords: "",
      creativity: 0.8,
    },
  })

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

      const response = await fetch("/api/content-generation/generate-meta-tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: values.text,
          target_keywords,
          creativity: values.creativity,
        }),
      })

      // Check if response is OK
      if (!response.ok) {
        let errorMessage = "Failed to generate meta tags"

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

      if (!data.metaTitle || !data.metaDescription) {
        throw new Error("No meta tags returned")
      }

      setResult({
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      })

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

  // Copy text to clipboard
  const copyToClipboard = (text: string, type: "title" | "description" | "html") => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
    toast({
      title: "Copied",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard`,
    })
  }

  // Download meta tags as HTML file
  const downloadAsHTML = () => {
    if (result) {
      const metaTags = `<title>${result.metaTitle}</title>\n<meta name="description" content="${result.metaDescription}">`
      const blob = new Blob([metaTags], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `meta-tags-${new Date().toISOString().slice(0, 10)}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: "Downloaded",
        description: "Meta tags downloaded as HTML file",
      })
    }
  }

  // Calculate text length
  const textLength = form.watch("text").length
  const isTextTooLong = textLength > 1500

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isTextTooLong && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Text Length Warning</AlertTitle>
              <AlertDescription>
                Your text is {textLength} characters long. For best results, keep it under 1500 characters. Long text
                will be automatically truncated.
              </AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the content for which you want to generate meta tags..."
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the main content of your page (1500 characters recommended).
                  <span className={textLength > 1500 ? "text-amber-500 font-medium" : ""}>
                    {" "}
                    {textLength}/5000 characters
                  </span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Keywords (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="keyword1, keyword2, keyword3" {...field} />
                </FormControl>
                <FormDescription>Enter comma-separated keywords to target in the meta tags.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="creativity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creativity Level: {field.value.toFixed(1)}</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription>
                  Lower values produce more conservative results, higher values produce more creative results.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Meta Tags...
              </>
            ) : (
              "Generate Meta Tags"
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
            <Card>
              <CardHeader>
                <CardTitle>Generated Meta Tags</CardTitle>
                <CardDescription>SEO-friendly meta tags for your content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Meta Title</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.metaTitle, "title")}
                      className="h-8 px-2"
                    >
                      {copied === "title" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded-md relative">
                    <p>{result.metaTitle}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {result.metaTitle.length} / 60 characters
                      {result.metaTitle.length > 60 && <span className="text-destructive"> (Too long for Google)</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Meta Description</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.metaDescription, "description")}
                      className="h-8 px-2"
                    >
                      {copied === "description" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p>{result.metaDescription}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {result.metaDescription.length} / 160 characters
                      {result.metaDescription.length > 160 && (
                        <span className="text-destructive"> (Too long for Google)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">HTML Code</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          `<title>${result.metaTitle}</title>\n<meta name="description" content="${result.metaDescription}">`,
                          "html",
                        )
                      }
                      className="h-8 px-2"
                    >
                      {copied === "html" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded-md font-mono text-xs whitespace-pre-wrap">
                    {`<title>${result.metaTitle}</title>\n<meta name="description" content="${result.metaDescription}">`}
                  </div>
                </div>

                <div className="mt-4 p-4 border rounded-md bg-muted/50">
                  <h3 className="text-sm font-medium mb-2">Search Preview</h3>
                  <div className="space-y-1">
                    <div className="text-blue-600 text-lg font-medium truncate">{result.metaTitle}</div>
                    <div className="text-green-700 text-sm">example.com</div>
                    <div className="text-sm text-gray-600 line-clamp-2">{result.metaDescription}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={downloadAsHTML}>
                  <Download className="h-4 w-4 mr-2" />
                  Download HTML
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

