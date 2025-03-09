import type { Metadata } from "next"
import { GradientHeading } from "@/components/ui/gradient-heading"

export const metadata: Metadata = {
  title: "About Us | SEO Toolkit",
  description: "Learn about our mission to help businesses improve their online visibility and search rankings.",
}

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <GradientHeading as="h1" className="text-4xl md:text-5xl font-bold mb-8 text-center">
        About Us
      </GradientHeading>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">
          At SEO Toolkit, we're passionate about helping businesses of all sizes improve their online visibility and
          search rankings.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p>
          Our mission is to democratize SEO by providing powerful, easy-to-use tools that give businesses the insights
          they need to compete effectively in search results.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
        <p>
          Founded in 2023, SEO Toolkit was born out of frustration with existing SEO tools that were either too complex,
          too expensive, or both. We set out to create a solution that combines powerful functionality with an intuitive
          interface at a price point that's accessible to businesses of all sizes.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Approach</h2>
        <p>
          We believe in data-driven decision making. Our tools provide actionable insights based on real-time data,
          allowing you to make informed decisions about your SEO strategy. We're constantly innovating and improving our
          platform to ensure you have access to the most effective tools and strategies.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Team</h2>
        <p>
          Our team consists of SEO experts, data scientists, and software engineers who are passionate about search
          engine optimization and helping businesses succeed online. With decades of combined experience in the
          industry, we understand the challenges businesses face in improving their search visibility.
        </p>
      </div>
    </main>
  )
}

