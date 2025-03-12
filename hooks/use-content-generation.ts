import { useContext } from 'react'
import { 
  ContentGenerationContext, 
  ContentGenerationContextType,
  ContentGenerationHistoryItem 
} from '@/contexts/content-generation-context'

// Re-export the ContentGenerationHistoryItem type for convenience
export type { ContentGenerationHistoryItem }

// Hook to use the content generation context
export function useContentGenerationContext(): ContentGenerationContextType {
  const context = useContext(ContentGenerationContext)
  
  if (context === undefined) {
    throw new Error('useContentGenerationContext must be used within a ContentGenerationProvider')
  }
  
  return context
}

// Alias for backward compatibility
export const useContentGeneration = useContentGenerationContext
