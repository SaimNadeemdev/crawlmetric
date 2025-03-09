import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { redirect } from "next/navigation"

export async function getServerSession() {
  const supabase = createServerComponentClient<Database>({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting server session:", error)
    return null
  }
}

export async function requireAuth() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

