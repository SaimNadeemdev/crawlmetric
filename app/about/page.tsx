"use client"

import type { Metadata } from "next"
import { AnimatedTitle } from "@/components/client-success-section"
import { SiteFooter } from "@/components/site-footer"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
  title: "About Us | Crawl Metric",
  description: "Learn about our mission to help businesses improve their online visibility and search rankings.",
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              <span className="text-[#0071e3]">
                About Us
              </span>
            </h1>
            <p className="text-gray-500 text-lg">Learn about our mission and vision</p>
          </div>

          <div className="bg-white/50 backdrop-blur-xl rounded-[22px] border border-gray-100 shadow-xl p-8 mb-12">
            <p className="text-lg mb-6 text-gray-700">
              At Crawl Metric, we're passionate about helping businesses of all sizes improve their online visibility and
              search rankings.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              Our Mission
            </h2>
            <p className="text-gray-700">
              Our mission is to democratize SEO by providing powerful, easy-to-use tools that give businesses the insights
              they need to compete effectively in search results.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              Our Story
            </h2>
            <p className="text-gray-700">
              Founded in 2025, Crawl Metric was born out of frustration with existing SEO tools that were either too complex,
              too expensive, or both. We set out to create a solution that combines powerful functionality with an intuitive
              interface at a price point that's accessible to businesses of all sizes.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              Our Approach
            </h2>
            <p className="text-gray-700">
              We believe in data-driven decision making. Our tools provide actionable insights based on real-time data,
              allowing you to make informed decisions about your SEO strategy. We're constantly innovating and improving our
              platform to ensure you have access to the most effective tools and strategies.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              Our Team
            </h2>
            <p className="text-gray-700">
              Our team consists of SEO experts, data scientists, and software engineers who are passionate about search
              engine optimization and helping businesses succeed online. With decades of combined experience in the
              industry, we understand the challenges businesses face in improving their search visibility.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
