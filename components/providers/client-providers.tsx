"use client";

import React from 'react';
import { SeoAuditProvider } from '@/contexts/seo-audit-context';
import { ContentGenerationProvider } from '@/contexts/content-generation-context';

interface ClientProvidersProps {
  children: React.ReactNode;
}

/**
 * Client-side only providers wrapper
 * This component ensures that context providers that depend on browser APIs
 * are only rendered on the client side
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SeoAuditProvider>
      <ContentGenerationProvider>
        {children}
      </ContentGenerationProvider>
    </SeoAuditProvider>
  );
}
