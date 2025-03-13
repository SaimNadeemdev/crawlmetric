// Configuration for dynamic rendering of pages
// Use this to mark pages that should not be statically generated

// Export this from any page that should be dynamically rendered
export const dynamic = 'force-dynamic';

// Export this from any page that should skip static generation
export const generateStaticParams = () => {
  return [];
};

// Export this to disable static optimization
export const revalidate = 0;
