"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Type, Tag, RefreshCw, CheckCircle, FileText } from "lucide-react"
import { GenerateTextForm } from "@/components/content-generation/generate-text-form"
import { GenerateMetaTagsForm } from "@/components/content-generation/generate-meta-tags-form"
import { ParaphraseForm } from "@/components/content-generation/paraphrase-form"
import { CheckGrammarForm } from "@/components/content-generation/check-grammar-form"
import { TextSummaryForm } from "@/components/content-generation/text-summary-form"

export default function ContentGenerationPage() {
  const [activeTab, setActiveTab] = useState("generate-text")

  return (
    <div className="py-6 space-y-6 ml-72 pr-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Content Generation</h1>
        <p className="text-muted-foreground">Generate high-quality content for your website using AI-powered tools.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <TabsTrigger value="generate-text" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Generate Text</span>
            <span className="sm:hidden">Text</span>
          </TabsTrigger>
          <TabsTrigger value="generate-meta-tags" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Meta Tags</span>
            <span className="sm:hidden">Meta</span>
          </TabsTrigger>
          <TabsTrigger value="paraphrase" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Paraphrase</span>
          </TabsTrigger>
          <TabsTrigger value="check-grammar" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Grammar Check</span>
            <span className="sm:hidden">Grammar</span>
          </TabsTrigger>
          <TabsTrigger value="text-summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Text Summary</span>
            <span className="sm:hidden">Summary</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate-text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Text</CardTitle>
              <CardDescription>Create original content from keywords, topics, or seed text.</CardDescription>
            </CardHeader>
            <CardContent>
              <GenerateTextForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate-meta-tags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Meta Tags</CardTitle>
              <CardDescription>Create SEO-friendly meta titles and descriptions for your web pages.</CardDescription>
            </CardHeader>
            <CardContent>
              <GenerateMetaTagsForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paraphrase" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paraphrase Text</CardTitle>
              <CardDescription>Reword your content while maintaining its original meaning.</CardDescription>
            </CardHeader>
            <CardContent>
              <ParaphraseForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="check-grammar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Check Grammar</CardTitle>
              <CardDescription>Validate and correct grammar with detailed suggestions.</CardDescription>
            </CardHeader>
            <CardContent>
              <CheckGrammarForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text-summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Text Summary</CardTitle>
              <CardDescription>Generate concise summaries from longer texts.</CardDescription>
            </CardHeader>
            <CardContent>
              <TextSummaryForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

