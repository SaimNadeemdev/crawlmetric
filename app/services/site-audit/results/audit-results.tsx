"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"
import Link from "next/link"

interface AuditResultsProps {
  taskId: string
  taskData: any
  summaryData: any
  pagesWithIssues: any
  summaryError: string | null
  pagesError: string | null
}

export default function AuditResults({
  taskId,
  taskData,
  summaryData,
  pagesWithIssues,
  summaryError,
  pagesError,
}: AuditResultsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Extract the target URL from the task data
  const targetUrl = taskData?.target || "Unknown URL"

  // Calculate the overall health score (0-100)
  const calculateHealthScore = () => {
    if (!summaryData || !summaryData.total_pages) return 0

    const totalPages = summaryData.total_pages
    const pagesWithIssues = (summaryData.pages_with_errors || 0) + (summaryData.pages_with_warnings || 0)

    return Math.max(0, Math.min(100, Math.round((1 - pagesWithIssues / totalPages) * 100)))
  }

  const healthScore = calculateHealthScore()

  // Get the health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  // Get the health score background
  const getHealthScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Site Overview Card */}
      <Card className="bg-black/40 backdrop-blur-sm border border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Site Audit: {targetUrl}</span>
            <span className={`text-2xl font-bold ${getHealthScoreColor(healthScore)}`}>{healthScore}/100</span>
          </CardTitle>
          <CardDescription>Task ID: {taskId}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span>Health Score</span>
              <span>{healthScore}%</span>
            </div>
            <Progress value={healthScore} className="h-2" indicatorClassName={getHealthScoreBackground(healthScore)} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 lg:grid-cols-5 bg-black/40 backdrop-blur-sm border border-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {summaryError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{summaryError}</AlertDescription>
            </Alert>
          ) : !summaryData ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Loading</AlertTitle>
              <AlertDescription>Fetching summary data...</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-black/40 backdrop-blur-sm border border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pages Crawled</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{summaryData.total_pages || 0}</p>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Critical Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-500">{summaryData.total_errors || 0}</p>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Warnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-yellow-500">{summaryData.total_warnings || 0}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-black/40 backdrop-blur-sm border border-gray-800">
                <CardHeader>
                  <CardTitle>Crawl Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Internal Links</p>
                      <p className="text-xl font-semibold">{summaryData.internal_links_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">External Links</p>
                      <p className="text-xl font-semibold">{summaryData.external_links_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Broken Links</p>
                      <p className="text-xl font-semibold">{summaryData.broken_links_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Broken Resources</p>
                      <p className="text-xl font-semibold">{summaryData.broken_resources_count || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          {pagesError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{pagesError}</AlertDescription>
            </Alert>
          ) : !pagesWithIssues ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Loading</AlertTitle>
              <AlertDescription>Fetching issues data...</AlertDescription>
            </Alert>
          ) : pagesWithIssues.items && pagesWithIssues.items.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>No Issues Found</AlertTitle>
              <AlertDescription>Great job! No pages with issues were detected.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {pagesWithIssues.items &&
                pagesWithIssues.items.map((page: any, index: number) => (
                  <Card key={index} className="bg-black/40 backdrop-blur-sm border border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="truncate">{page.url}</span>
                        <Link
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 ml-2 flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex space-x-4">
                        <span className="flex items-center">
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          {page.checks?.critical_issues || 0} Critical
                        </span>
                        <span className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                          {page.checks?.warnings || 0} Warnings
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {page.checks?.critical_issues > 0 && page.issues?.critical && (
                          <div>
                            <h4 className="font-medium text-red-500 mb-1">Critical Issues:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {Object.entries(page.issues.critical).map(([key, value]: [string, any]) => (
                                <li key={key} className="text-sm">
                                  {key}: {value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {page.checks?.warnings > 0 && page.issues?.warnings && (
                          <div>
                            <h4 className="font-medium text-yellow-500 mb-1">Warnings:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {Object.entries(page.issues.warnings).map(([key, value]: [string, any]) => (
                                <li key={key} className="text-sm">
                                  {key}: {value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {summaryError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{summaryError}</AlertDescription>
            </Alert>
          ) : !summaryData ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Loading</AlertTitle>
              <AlertDescription>Fetching performance data...</AlertDescription>
            </Alert>
          ) : (
            <>
              <Card className="bg-black/40 backdrop-blur-sm border border-gray-800">
                <CardHeader>
                  <CardTitle>Page Load Speed</CardTitle>
                  <CardDescription>Average load time across all pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Average Page Load Time</p>
                      <p className="text-2xl font-semibold">
                        {summaryData.average_page_load_time
                          ? `${(summaryData.average_page_load_time / 1000).toFixed(2)}s`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Slowest Page</p>
                      <p className="text-2xl font-semibold">
                        {summaryData.slowest_page_load_time
                          ? `${(summaryData.slowest_page_load_time / 1000).toFixed(2)}s`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Fastest Page</p>
                      <p className="text-2xl font-semibold">
                        {summaryData.fastest_page_load_time
                          ? `${(summaryData.fastest_page_load_time / 1000).toFixed(2)}s`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-gray-800">
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                  <CardDescription>Analysis of page resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Total Page Size</p>
                      <p className="text-xl font-semibold">
                        {summaryData.average_page_size
                          ? `${(summaryData.average_page_size / 1024).toFixed(2)} KB`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">JS Resources</p>
                      <p className="text-xl font-semibold">{summaryData.js_resources_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">CSS Resources</p>
                      <p className="text-xl font-semibold">{summaryData.css_resources_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Image Resources</p>
                      <p className="text-xl font-semibold">{summaryData.images_count || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          {summaryError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{summaryError}</AlertDescription>
            </Alert>
          ) : !summaryData ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Loading</AlertTitle>
              <AlertDescription>Fetching SEO data...</AlertDescription>
            </Alert>
          ) : (
            <>
              <Card className="bg-black/40 backdrop-blur-sm border border-gray-800">
                <CardHeader>
                  <CardTitle>SEO Elements</CardTitle>
                  <CardDescription>Analysis of key SEO elements across your site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Pages with Title Issues</p>
                      <p className="text-xl font-semibold">{summaryData.pages_with_title_issues || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Pages with Meta Description Issues</p>
                      <p className="text-xl font-semibold">{summaryData.pages_with_meta_description_issues || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Pages with Duplicate Content</p>
                      <p className="text-xl font-semibold">{summaryData.pages_with_duplicate_content || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Pages with Low Word Count</p>
                      <p className="text-xl font-semibold">{summaryData.pages_with_low_word_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Pages with 4XX Status</p>
                      <p className="text-xl font-semibold">{summaryData.pages_with_4xx_status_code || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Pages with 5XX Status</p>
                      <p className="text-xl font-semibold">{summaryData.pages_with_5xx_status_code || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-gray-800">
                <CardHeader>
                  <CardTitle>Content Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Pages with H1 Issues</p>
                      <p className="text-xl font-semibold">{summaryData.pages_with_h1_issues || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Pages with Image Alt Text Issues</p>
                      <p className="text-xl font-semibold">{summaryData.pages_with_image_alt_text_issues || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {summaryError || pagesError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{summaryError || pagesError}</AlertDescription>
            </Alert>
          ) : !summaryData || !pagesWithIssues ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Loading</AlertTitle>
              <AlertDescription>Generating recommendations...</AlertDescription>
            </Alert>
          ) : (
            <Card className="bg-black/40 backdrop-blur-sm border border-gray-800">
              <CardHeader>
                <CardTitle>Improvement Recommendations</CardTitle>
                <CardDescription>Based on the issues found in your site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Critical Issues Recommendations */}
                  {summaryData.total_errors > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-red-500">Critical Issues to Fix</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        {summaryData.pages_with_4xx_status_code > 0 && (
                          <li>
                            Fix {summaryData.pages_with_4xx_status_code} pages with 4XX status codes to prevent negative
                            user experience and SEO impact.
                          </li>
                        )}
                        {summaryData.pages_with_5xx_status_code > 0 && (
                          <li>
                            Resolve {summaryData.pages_with_5xx_status_code} server errors (5XX status codes) to ensure
                            all pages are accessible.
                          </li>
                        )}
                        {summaryData.broken_links_count > 0 && (
                          <li>
                            Fix {summaryData.broken_links_count} broken links that are harming user experience and SEO
                            performance.
                          </li>
                        )}
                        {summaryData.broken_resources_count > 0 && (
                          <li>
                            Repair {summaryData.broken_resources_count} broken resources (images, scripts, etc.) to
                            improve page loading and user experience.
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* SEO Recommendations */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-blue-400">SEO Improvements</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {summaryData.pages_with_title_issues > 0 && (
                        <li>
                          Optimize page titles on {summaryData.pages_with_title_issues} pages. Ensure titles are unique,
                          descriptive, and between 50-60 characters.
                        </li>
                      )}
                      {summaryData.pages_with_meta_description_issues > 0 && (
                        <li>
                          Improve meta descriptions on {summaryData.pages_with_meta_description_issues} pages. Write
                          compelling descriptions between 120-160 characters.
                        </li>
                      )}
                      {summaryData.pages_with_h1_issues > 0 && (
                        <li>
                          Fix H1 headings on {summaryData.pages_with_h1_issues} pages. Each page should have exactly one
                          H1 that clearly describes the page content.
                        </li>
                      )}
                      {summaryData.pages_with_image_alt_text_issues > 0 && (
                        <li>
                          Add descriptive alt text to images on {summaryData.pages_with_image_alt_text_issues} pages for
                          better accessibility and image SEO.
                        </li>
                      )}
                      {summaryData.pages_with_low_word_count > 0 && (
                        <li>
                          Expand content on {summaryData.pages_with_low_word_count} pages with thin content to provide
                          more value to users and improve rankings.
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Performance Recommendations */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-purple-400">Performance Optimizations</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {summaryData.average_page_load_time > 3000 && (
                        <li>
                          Improve page load speed. Current average is{" "}
                          {(summaryData.average_page_load_time / 1000).toFixed(2)}s, aim for under 3 seconds.
                        </li>
                      )}
                      <li>
                        Optimize resource usage: compress images, minify CSS and JavaScript, and implement lazy loading.
                      </li>
                      <li>Consider implementing a Content Delivery Network (CDN) to improve global load times.</li>
                      <li>Enable browser caching for static resources to improve repeat visit performance.</li>
                    </ul>
                  </div>

                  {/* Mobile Recommendations */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-green-400">Mobile Optimization</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Ensure your site is fully responsive and provides a good experience on all device sizes.</li>
                      <li>Test touch elements to ensure they have adequate spacing for mobile users.</li>
                      <li>Optimize font sizes for readability on small screens.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

