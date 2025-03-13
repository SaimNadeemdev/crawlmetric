import type { Metadata } from "next"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Privacy Policy | Crawl Metric",
  description: "Our privacy policy explains how we collect, use, and protect your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              <span className="text-[#0071e3]">
                Privacy Policy
              </span>
            </h1>
            <p className="text-gray-500 text-lg">How we protect your data</p>
          </div>

          <div className="bg-white/50 backdrop-blur-xl rounded-[22px] border border-gray-100 shadow-xl p-8 mb-12">
            <p className="text-lg mb-6 text-gray-700">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>

            <p className="text-gray-700">
              At Crawl Metric, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you visit our website or use our services.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              Information We Collect
            </h2>
            <p className="text-gray-700">
              We collect information that you provide directly to us, such as when you create an account, subscribe to our
              newsletter, or contact us for support. This may include your name, email address, company name, and payment
              information.
            </p>
            <p className="text-gray-700">
              We also automatically collect certain information about your device and how you interact with our website,
              including IP address, browser type, referring/exit pages, and operating system.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              How We Use Your Information
            </h2>
            <p className="text-gray-700">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 mb-4 text-gray-700">
              <li className="mb-1">Provide, maintain, and improve our services</li>
              <li className="mb-1">Process transactions and send related information</li>
              <li className="mb-1">Send you technical notices, updates, security alerts, and support messages</li>
              <li className="mb-1">Respond to your comments, questions, and requests</li>
              <li className="mb-1">Develop new products and services</li>
              <li className="mb-1">Monitor and analyze trends, usage, and activities in connection with our services</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              Data Security
            </h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational measures to protect the security of your personal
              information. However, no method of transmission over the Internet or electronic storage is 100% secure, so
              we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              Your Rights
            </h2>
            <p className="text-gray-700">
              Depending on your location, you may have certain rights regarding your personal information, such as the right
              to access, correct, or delete your personal information.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0071e3]">
              Contact Us
            </h2>
            <p className="text-gray-700">If you have any questions about this Privacy Policy, please contact us at privacy@seotoolkit.com.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
