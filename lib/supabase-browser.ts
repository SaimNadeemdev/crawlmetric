import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Get the environment variables with the crawlmetric_ prefix
const supabaseUrl = process.env.crawlmetric_NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.crawlmetric_NEXT_PUBLIC_SUPABASE_ANON_KEY

// For client-side usage
export const createBrowserClient = () => {
  return createClientComponentClient<Database>({
    supabaseUrl: supabaseUrl as string,
    supabaseKey: supabaseAnonKey as string,
  })
}
