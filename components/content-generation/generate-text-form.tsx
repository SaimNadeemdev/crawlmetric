"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Download, Sparkles, Zap, Lightbulb, Wand2, Tag, FileText, AlignJustify, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useContentGenerationContext } from "@/hooks/use-content-generation"

const formSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters"),
  description: z.string().optional(),
  creativity_index: z.number().min(1).max(5),
  target_words_count: z.number().min(100).max(2000),
})

type FormValues = z.infer<typeof formSchema>

export function GenerateTextForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { saveToHistory } = useContentGenerationContext()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "Write about digital marketing trends for small businesses",
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
        const generatedText = data.result[0].generated_text;
        setResult(generatedText)
        
        // Save to history
        saveToHistory({
          type: "generate-text",
          prompt: values,
          result: generatedText,
          created_at: new Date().toISOString(),
        });
        
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
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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

  const getWordCount = (text: string) => {
    return text.split(/\s+/).filter((word) => word.length > 0).length
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gradient-to-br from-white to-gray-50">
      <div className="w-full max-w-5xl">
        <Card className="relative overflow-hidden border-none bg-white/90 backdrop-blur-xl shadow-xl rounded-3xl">
          <CardHeader className="space-y-2 pb-6 pt-8 px-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#40a9ff] shadow-md">
                <Wand2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-semibold tracking-tight text-gray-900">
                  AI Content Generator
                </CardTitle>
                <CardDescription className="text-base text-gray-500 mt-1">
                  Create high-quality content with advanced AI
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Form section - 3 columns */}
                  <div className="lg:col-span-3 space-y-6">
                    <FormField
                      control={form.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2 mb-3">
                            <FormLabel className="text-base font-medium text-gray-800 flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-[#0071e3]" />
                              Prompt
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
                                placeholder="Describe what you want to generate..."
                                className="min-h-[180px] resize-none rounded-xl border-[#d2d2d7] bg-white/80 backdrop-blur-sm text-base transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                                {...field}
                              />
                            </FormControl>
                          </motion.div>
                          <FormDescription className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            Be specific for better results
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2 mb-3">
                            <FormLabel className="text-base font-medium text-gray-800 flex items-center gap-2">
                              <FileText className="h-5 w-5 text-[#0071e3]" />
                              Additional Context
                            </FormLabel>
                          </div>
                          <motion.div
                            whileFocus={{ scale: 1.005 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <FormControl>
                              <Input
                                placeholder="e.g., For a blog post aimed at beginners"
                                className="h-12 rounded-xl border-[#d2d2d7] bg-white/80 backdrop-blur-sm text-base transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                                {...field}
                              />
                            </FormControl>
                          </motion.div>
                          <FormDescription className="text-sm text-gray-500 mt-2">
                            Optional - Add context about the content's purpose
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
                          <div className="flex items-center gap-2 mb-3">
                            <FormLabel className="text-base font-medium text-gray-800 flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-[#0071e3]" />
                              Creativity Level
                            </FormLabel>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <RadioGroup
                                onValueChange={(value) => field.onChange(Number.parseInt(value))}
                                defaultValue={field.value.toString()}
                                className="flex"
                              >
                                <div className="relative z-0 flex w-full rounded-xl bg-[#f5f5f7] p-1">
                                  {[1, 2, 3, 4, 5].map((value) => (
                                    <FormItem key={value} className="flex-1 relative z-10">
                                      <FormControl>
                                        <RadioGroupItem
                                          value={value.toString()}
                                          id={`creativity-${value}`}
                                          className="peer sr-only"
                                        />
                                      </FormControl>
                                      <FormLabel
                                        htmlFor={`creativity-${value}`}
                                        className="flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-all peer-data-[state=checked]:text-white peer-data-[state=unchecked]:text-gray-600 peer-data-[state=unchecked]:hover:text-gray-900 cursor-pointer"
                                      >
                                        {value === 1 && "Conservative"}
                                        {value === 2 && "Balanced"}
                                        {value === 3 && "Creative"}
                                        {value === 4 && "Very Creative"}
                                        {value === 5 && "Experimental"}
                                        {field.value === value && (
                                          <motion.div
                                            layoutId="creativity-pill"
                                            className="absolute inset-0 z-[-1] rounded-lg bg-gradient-to-r from-[#0071e3] to-[#40a9ff] shadow-md"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                          />
                                        )}
                                      </FormLabel>
                                    </FormItem>
                                  ))}
                                </div>
                              </RadioGroup>
                            </div>
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500 mt-2">
                            Higher creativity produces more varied and unique content
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target_words_count"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between mb-3">
                            <FormLabel className="text-base font-medium text-gray-800 flex items-center gap-2">
                              <AlignJustify className="h-5 w-5 text-[#0071e3]" />
                              Target Word Count
                            </FormLabel>
                            <Badge
                              variant="outline"
                              className="bg-[#0071e3]/5 text-[#0071e3] border-[#0071e3]/20 font-medium"
                            >
                              {field.value} words
                            </Badge>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <RadioGroup
                                onValueChange={(value) => field.onChange(Number.parseInt(value))}
                                defaultValue={field.value.toString()}
                                className="flex"
                              >
                                <div className="relative z-0 flex w-full rounded-xl bg-[#f5f5f7] p-1">
                                  {[100, 500, 1000, 1500, 2000].map((value) => (
                                    <FormItem key={value} className="flex-1 relative z-10">
                                      <FormControl>
                                        <RadioGroupItem
                                          value={value.toString()}
                                          id={`words-${value}`}
                                          className="peer sr-only"
                                        />
                                      </FormControl>
                                      <FormLabel
                                        htmlFor={`words-${value}`}
                                        className="flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-all peer-data-[state=checked]:text-white peer-data-[state=unchecked]:text-gray-600 peer-data-[state=unchecked]:hover:text-gray-900 cursor-pointer"
                                      >
                                        {value}
                                        {field.value === value && (
                                          <motion.div
                                            layoutId="words-pill"
                                            className="absolute inset-0 z-[-1] rounded-lg bg-gradient-to-r from-[#0071e3] to-[#40a9ff] shadow-md"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                          />
                                        )}
                                      </FormLabel>
                                    </FormItem>
                                  ))}
                                </div>
                              </RadioGroup>
                            </div>
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500 mt-2">
                            Select the approximate length of content you need
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

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
                            <span className="ml-3">Generating content...</span>
                          </div>
                        ) : (
                          <span className="flex items-center">
                            <Wand2 className="mr-2 h-5 w-5" />
                            Generate Content
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </div>

                  {/* Tips section - 2 columns */}
                  <div className="lg:col-span-2">
                    <div className="h-full relative rounded-2xl overflow-hidden">
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
                            Writing Tips
                          </h3>
                          <ul className="space-y-4">
                            <li className="flex gap-3">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                <span className="text-sm font-semibold">1</span>
                              </div>
                              <div>
                                <p className="text-gray-700 font-medium">Be specific in your prompt</p>
                                <p className="text-sm text-gray-500">
                                  The more details you provide, the better the results will be.
                                </p>
                              </div>
                            </li>
                            <li className="flex gap-3">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                <span className="text-sm font-semibold">2</span>
                              </div>
                              <div>
                                <p className="text-gray-700 font-medium">Specify your audience</p>
                                <p className="text-sm text-gray-500">
                                  Mention who the content is for (beginners, experts, etc.).
                                </p>
                              </div>
                            </li>
                            <li className="flex gap-3">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                <span className="text-sm font-semibold">3</span>
                              </div>
                              <div>
                                <p className="text-gray-700 font-medium">Include desired tone</p>
                                <p className="text-sm text-gray-500">
                                  Formal, conversational, persuasive, informative, etc.
                                </p>
                              </div>
                            </li>
                            <li className="flex gap-3">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                <span className="text-sm font-semibold">4</span>
                              </div>
                              <div>
                                <p className="text-gray-700 font-medium">Request specific sections</p>
                                <p className="text-sm text-gray-500">
                                  Ask for introduction, key points, conclusion, etc.
                                </p>
                              </div>
                            </li>
                            <li className="flex gap-3">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mt-0.5 shadow-sm">
                                <span className="text-sm font-semibold">5</span>
                              </div>
                              <div>
                                <p className="text-gray-700 font-medium">Always review and edit</p>
                                <p className="text-sm text-gray-500">AI-generated content may need human refinement.</p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Form>

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
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] shadow-md">
                              <Zap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h2 className="text-xl font-semibold text-gray-900">Generated Content</h2>
                              <p className="text-sm text-gray-500">
                                {getWordCount(result)} words • Generated {new Date().toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-[#d2d2d7] hover:bg-[#0071e3]/5 hover:text-[#0071e3] transition-colors"
                                onClick={copyToClipboard}
                              >
                                {copied ? (
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
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                              <Button
                                className="rounded-xl bg-gradient-to-r from-[#0071e3] to-[#40a9ff] text-white transition-colors"
                                size="sm"
                                onClick={downloadAsText}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </motion.div>
                          </div>
                        </div>

                        <Tabs defaultValue="preview" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="preview" className="text-base">
                              Preview
                            </TabsTrigger>
                            <TabsTrigger value="raw" className="text-base">
                              Raw Text
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="preview" className="space-y-6">
                            <div className="prose prose-blue max-w-none">
                              {result.split("\n").map((paragraph, index) =>
                                paragraph.trim() ? (
                                  <p key={index} className="text-gray-700 leading-relaxed mb-4">
                                    {paragraph}
                                  </p>
                                ) : (
                                  <br key={index} />
                                ),
                              )}
                            </div>
                          </TabsContent>
                          <TabsContent value="raw" className="space-y-4">
                            <div className="bg-[#f5f5f7] rounded-xl border border-[#d2d2d7] p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                              {result}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                      <div className="flex justify-between items-center border-t border-[#d2d2d7] px-6 py-4 bg-[#f5f5f7]">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Lightbulb className="h-4 w-4 text-amber-500 mr-2" />
                          Always review AI-generated content before publishing
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Button
                            className="rounded-xl bg-gradient-to-r from-[#0071e3] to-[#40a9ff] text-white transition-colors"
                            onClick={copyToClipboard}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Content
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
      `}</style>
    </div>
  )
}
