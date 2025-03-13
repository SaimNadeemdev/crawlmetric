import type { Metadata } from "next"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Terms of Service | Crawl Metric",
  description: "Our terms of service outline the rules and guidelines for using our platform.",
}

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              <span className="text-[#0071e3]">
                Terms of Service
              </span>
            </h1>
            <p className="text-gray-500 text-lg">Guidelines for using our platform</p>
          </div>

          <div className="bg-white/50 backdrop-blur-xl rounded-[22px] border border-gray-100 shadow-xl p-8 mb-12">
            <p className="text-lg mb-6 text-gray-700">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>

            <p className="text-gray-700">
              Please read these Terms of Service carefully before using our website or services. By accessing or using our
              services, you agree to be bound by these Terms.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700">
              By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy. If you do not
              agree to these Terms, you may not access or use our services.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              2. Description of Services
            </h2>
            <p className="text-gray-700">
              Crawl Metric provides tools and services to help businesses improve their search engine optimization (SEO) and
              online visibility. Our services include keyword research, rank tracking, site audits, and content
              optimization.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              3. User Accounts
            </h2>
            <p className="text-gray-700">
              To access certain features of our services, you may be required to create an account. You are responsible for
              maintaining the confidentiality of your account credentials and for all activities that occur under your
              account.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              4. Payment Terms
            </h2>
            <p className="text-gray-700">
              Some of our services require payment. By subscribing to a paid plan, you agree to pay all fees in accordance
              with the pricing and terms in effect at the time of your subscription. All payments are non-refundable unless
              otherwise specified.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              5. Intellectual Property
            </h2>
            <p className="text-gray-700">
              All content, features, and functionality of our services, including but not limited to text, graphics, logos,
              icons, and software, are the exclusive property of Crawl Metric and are protected by copyright, trademark, and
              other intellectual property laws.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              6. Limitation of Liability
            </h2>
            <p className="text-gray-700">
              In no event shall Crawl Metric be liable for any indirect, incidental, special, consequential, or punitive
              damages arising out of or related to your use of our services.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              7. Changes to Terms
            </h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new
              Terms on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              8. Contact Us
            </h2>
            <p className="text-gray-700">
              If you have any questions about these Terms, please contact us at legal@crawlmetric.com.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
