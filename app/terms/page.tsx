import type { Metadata } from "next"
import { GradientHeading } from "@/components/ui/gradient-heading"

export const metadata: Metadata = {
  title: "Terms of Service | SEO Toolkit",
  description: "Our terms of service outline the rules and guidelines for using our platform.",
}

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <GradientHeading as="h1" className="text-4xl md:text-5xl font-bold mb-8 text-center">
        Terms of Service
      </GradientHeading>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <p>
          Please read these Terms of Service carefully before using our website or services. By accessing or using our
          services, you agree to be bound by these Terms.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy. If you do not
          agree to these Terms, you may not access or use our services.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Services</h2>
        <p>
          SEO Toolkit provides tools and services to help businesses improve their search engine optimization (SEO) and
          online visibility. Our services include keyword research, rank tracking, site audits, and content
          optimization.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. User Accounts</h2>
        <p>
          To access certain features of our services, you may be required to create an account. You are responsible for
          maintaining the confidentiality of your account credentials and for all activities that occur under your
          account.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. Payment Terms</h2>
        <p>
          Some of our services require payment. By subscribing to a paid plan, you agree to pay all fees in accordance
          with the pricing and terms in effect at the time of your subscription. All payments are non-refundable unless
          otherwise specified.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Acceptable Use</h2>
        <p>
          You agree not to use our services for any unlawful purpose or in any way that could damage, disable,
          overburden, or impair our services. You also agree not to attempt to gain unauthorized access to any part of
          our services.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. Intellectual Property</h2>
        <p>
          All content, features, and functionality of our services, including but not limited to text, graphics, logos,
          and software, are owned by SEO Toolkit and are protected by copyright, trademark, and other intellectual
          property laws.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">7. Limitation of Liability</h2>
        <p>
          In no event shall SEO Toolkit be liable for any indirect, incidental, special, consequential, or punitive
          damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new
          Terms on this page and updating the "Last updated" date.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at legal@seotoolkit.com.</p>
      </div>
    </main>
  )
}

