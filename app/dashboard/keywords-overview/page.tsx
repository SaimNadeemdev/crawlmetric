"use client"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';

export default function KeywordsOverviewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Keywords Overview</h1>
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <p className="text-muted-foreground">Your keywords overview dashboard will appear here.</p>
      </div>
    </div>
  );
}
