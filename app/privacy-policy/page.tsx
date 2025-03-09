import type { Metadata } from "next"
import { GradientHeading } from "@/components/ui/gradient-heading"

export const metadata: Metadata = {
  title: "Privacy Policy | SEO Toolkit",
  description: "Our privacy policy explains how we collect, use, and protect your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <GradientHeading as="h1" className="text-4xl md:text-5xl font-bold mb-8 text-center">
        Privacy Policy
      </GradientHeading>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <p>
          At SEO Toolkit, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
          and safeguard your information when you visit our website or use our services.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
        <p>
          We collect information that you provide directly to us, such as when you create an account, subscribe to our
          newsletter, or contact us for support. This may include your name, email address, company name, and payment
          information.
        </p>
        <p>
          We also automatically collect certain information about your device and how you interact with our website,
          including IP address, browser type, referring/exit pages, and operating system.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send you technical notices, updates, security alerts, and support messages</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Develop new products and services</li>
          <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect the security of your personal
          information. However, please be aware that no method of transmission over the Internet or electronic storage
          is 100% secure.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
        <p>
          Depending on your location, you may have certain rights regarding your personal information, such as the right
          to access, correct, or delete your personal information.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
          Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@seotoolkit.com.</p>
      </div>
    </main>
  )
}

