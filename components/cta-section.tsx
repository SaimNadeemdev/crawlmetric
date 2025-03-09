import { Button } from "@/components/ui/button"
import { GradientHeading } from "@/components/ui/gradient-heading"

export function CTASection() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center space-y-6">
          <GradientHeading title="Ready to Transform Your SEO Strategy?" className="mb-4" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of businesses that have improved their search rankings and driven more organic traffic with
            our powerful SEO tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg">Get Started Free</Button>
            <Button size="lg" variant="outline">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

