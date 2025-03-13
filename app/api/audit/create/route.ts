import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get user from session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get request body
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Here you would integrate with DataForSEO to create an audit task
    // For now, we'll simulate a task ID
    const taskId = `task_${Date.now()}`

    // Store the audit in the database
    const { data, error } = await supabase
      .from("audits")
      .insert({
        user_id: userId,
        url,
        status: "pending",
        task_id: taskId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      audit: data,
      taskId,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

