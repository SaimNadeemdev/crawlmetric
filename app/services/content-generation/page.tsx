"use client"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';

export default function ContentGenerationServicePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Content Generation Service</h1>
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <p className="text-muted-foreground">Our content generation service helps you create high-quality, SEO-optimized content for your website.</p>
        <ul className="list-disc list-inside mt-4 space-y-2">
          <li>AI-powered content creation</li>
          <li>SEO optimization</li>
          <li>Multiple content formats</li>
          <li>Fast turnaround time</li>
        </ul>
      </div>
    </div>
  );
}
