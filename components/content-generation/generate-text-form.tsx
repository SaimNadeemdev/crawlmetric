"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Copy, Download } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters"),
  topic: z.string().optional(),
  description: z.string().optional(),
  creativity_index: z.number().min(1).max(5),
  target_words_count: z.number().min(100).max(2000),
})

type FormValues = z.infer<typeof formSchema>

export function GenerateTextForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "Write about digital marketing trends for small businesses",
      topic: "",
      description: "",
      creativity_index: 3,
      target_words_count: 500,
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/content-generation/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.result && data.result.length > 0) {
        setResult(data.result[0].generated_text)
        toast({
          title: "Content Generated",
          description: "Your content has been successfully generated.",
        })
      } else {
        throw new Error("No content was generated. Please try again.")
      }
    } catch (err) {
      console.error("Error generating text:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      toast({
        title: "Copied",
        description: "Content copied to clipboard",
      })
    }
  }

  const downloadAsText = () => {
    if (result) {
      const blob = new Blob([result], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `generated-content-${new Date().toISOString().slice(0, 10)}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: "Downloaded",
        description: "Content downloaded as text file",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seed Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter seed text or keywords to generate content from"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide keywords, phrases, or a brief description of what you want to generate
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Digital Marketing" {...field} />
                  </FormControl>
                  <FormDescription>Main topic for the generated content</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Benefits for small businesses" {...field} />
                  </FormControl>
                  <FormDescription>Additional context for the content</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="creativity_index"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creativity Level: {field.value}</FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription>
                  Higher values produce more creative but potentially less accurate content
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_words_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Word Count: {field.value}</FormLabel>
                <FormControl>
                  <Slider
                    min={100}
                    max={2000}
                    step={100}
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription>Approximate number of words in the generated content</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Content"
            )}
          </Button>
        </form>
      </Form>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md max-h-[400px] overflow-y-auto whitespace-pre-wrap">{result}</div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
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
      )}
    </div>
  )
}

