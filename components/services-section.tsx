import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GradientHeading } from "@/components/ui/gradient-heading"
import { Search, FileText, BarChart3, Globe } from "lucide-react"

export function ServicesSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center mb-12">
        <GradientHeading
          title="Our Services"
          subtitle="Comprehensive tools to boost your website's search engine performance"
          className="text-center"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Keyword Research Card */}
        <Card className="bg-black/40 backdrop-blur-sm border border-gray-800 hover:border-purple-500/50 transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Keyword Research</CardTitle>
              <Search className="h-5 w-5 text-purple-500" />
            </div>
            <CardDescription>Discover high-value keywords for your niche</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              Find the perfect keywords to target with our advanced research tool. Analyze search volume, competition,
              and keyword difficulty to optimize your content strategy.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/keyword-research">Start Research</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Content Generation Card */}
        <Card className="bg-black/40 backdrop-blur-sm border border-gray-800 hover:border-purple-500/50 transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Content Generation</CardTitle>
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
            <CardDescription>Create SEO-optimized content</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              Generate high-quality, SEO-friendly content with our AI-powered tools. Create meta descriptions, blog
              outlines, and full articles optimized for your target keywords.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/content-generation">Generate Content</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Rank Tracking Card */}
        <Card className="bg-black/40 backdrop-blur-sm border border-gray-800 hover:border-purple-500/50 transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Rank Tracking</CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            <CardDescription>Monitor your search engine positions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              Track your website's rankings for target keywords over time. Get insights into ranking changes, competitor
              movements, and opportunities for improvement.
            </p>
          </CardContent>
          <CardFooter>
            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href="/dashboard/main">Track Rankings</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Site Audit Card */}
        <Card className="bg-black/40 backdrop-blur-sm border border-gray-800 hover:border-purple-500/50 transition-all md:col-span-2 lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Full Site Audit</CardTitle>
              <Globe className="h-5 w-5 text-purple-500" />
            </div>
            <CardDescription>Comprehensive analysis of your website's SEO health</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Get a complete picture of your website's SEO performance with our detailed site audit. Identify technical
              issues, content gaps, and optimization opportunities to improve your search rankings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-black/20 p-4 rounded-lg border border-gray-800">
                <h3 className="font-medium mb-2">Technical SEO</h3>
                <p className="text-sm text-gray-400">
                  Identify crawlability issues, broken links, slow page speed, and other technical problems.
                </p>
              </div>
              <div className="bg-black/20 p-4 rounded-lg border border-gray-800">
                <h3 className="font-medium mb-2">On-Page Analysis</h3>
                <p className="text-sm text-gray-400">
                  Evaluate title tags, meta descriptions, headings, content quality, and keyword usage.
                </p>
              </div>
              <div className="bg-black/20 p-4 rounded-lg border border-gray-800">
                <h3 className="font-medium mb-2">Actionable Insights</h3>
                <p className="text-sm text-gray-400">
                  Get prioritized recommendations to fix issues and improve your site's SEO performance.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full md:w-auto">
              <Link href="/site-audit">Start Site Audit</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}
