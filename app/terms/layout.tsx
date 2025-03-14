import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Crawl Metric",
  description: "Our terms of service outline the rules and guidelines for using our platform.",
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      {children}
    </section>
  )
}
