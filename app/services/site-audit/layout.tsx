import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Site Audit | SEO Tool",
  description: "Run a comprehensive SEO audit on your website",
}

export default function SiteAuditLayout({
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
