import type { Metadata } from "next"
import { GradientHeading } from "@/components/ui/gradient-heading"
import { ContactForm } from "@/components/contact-form"
import { Mail, Phone, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us | SEO Toolkit",
  description: "Get in touch with our team for support, feedback, or inquiries about our SEO tools.",
}

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <GradientHeading as="h1" className="text-4xl md:text-5xl font-bold mb-8 text-center">
        Contact Us
      </GradientHeading>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <p className="text-lg mb-6">
            Have questions, feedback, or need assistance? We're here to help! Fill out the form and our team will get
            back to you as soon as possible.
          </p>

          <div className="space-y-6 mt-8">
            <div className="flex items-start space-x-4">
              <Mail className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">support@seotoolkit.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Phone className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Phone</h3>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <MapPin className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Address</h3>
                <p className="text-muted-foreground">
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

        <div className="bg-muted/30 p-6 rounded-lg">
          <ContactForm />
        </div>
      </div>
    </main>
  )
}

