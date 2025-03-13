import type { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"
import { Mail, Phone, MapPin } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
  title: "Contact Us | Crawl Metric",
  description: "Get in touch with our team for support, feedback, or inquiries about our SEO tools.",
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              <span className="text-[#0071e3]">
                Contact Us
              </span>
            </h1>
            <p className="text-gray-500 text-lg">Get in touch with our team</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white/50 backdrop-blur-xl rounded-[22px] border border-gray-100 shadow-xl p-8">
              <p className="text-lg mb-6 text-gray-700">
                Have questions, feedback, or need assistance? We're here to help! Fill out the form and our team will get
                back to you as soon as possible.
              </p>

              <div className="space-y-6 mt-8">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#0071e3]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">support@crawlmetric.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-[#0071e3]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-[#0071e3]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Address</h3>
                    <p className="text-gray-600">
                      123 SEO Street
                      <br />
                      San Francisco, CA 94103
                      <br />
                      United States
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-xl rounded-[22px] border border-gray-100 shadow-xl p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
