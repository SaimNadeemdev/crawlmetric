import HeroGeometric from "@/components/hero-geometric"
import { MetricsBanner } from "@/components/metrics-banner"
import { ServicesSection } from "@/components/services-section"
import { ClientSuccessSection } from "@/components/client-success-section"
import { ContactSection } from "@/components/contact-section"
import { SiteFooter } from "@/components/site-footer"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <HeroGeometric />
        <ServicesSection />
        <MetricsBanner />
        <ClientSuccessSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  )
}
