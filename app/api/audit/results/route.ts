import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
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

    // Get task ID from query params
    const taskId = request.nextUrl.searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    // Get audit from database
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .select("*")
      .eq("task_id", taskId)
      .eq("user_id", userId)
      .single()

    if (auditError) {
      return NextResponse.json({ error: auditError.message }, { status: 500 })
    }

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    // If the audit is already completed, return the results
    if (audit.status === "completed" && audit.results) {
      return NextResponse.json({
        status: "completed",
        results: audit.results,
      })
    }

    // Here you would check the status of the audit with DataForSEO
    // For now, we'll simulate a completed audit after a delay

    // Simulate a 50% chance of completion
    const isCompleted = Math.random() > 0.5

    if (isCompleted) {
      // Simulate audit results
      const results = {
        summary: {
          totalPages: 10,
          errors: 5,
          warnings: 8,
          notices: 12,
        },
        pages: Array.from({ length: 10 }, (_, i) => ({
          url: `${audit.url}/page-${i + 1}`,
          status: 200,
          title: `Page ${i + 1}`,
          h1: `Heading ${i + 1}`,
          issues: {
            errors: Math.floor(Math.random() * 3),
            warnings: Math.floor(Math.random() * 5),
            notices: Math.floor(Math.random() * 7),
          },
        })),
      }

      // Update the audit in the database
      const { error: updateError } = await supabase
        .from("audits")
        .update({
          status: "completed",
          results,
          updated_at: new Date().toISOString(),
        })
        .eq("id", audit.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({
        status: "completed",
        results,
      })
    }

    // If not completed, return the current status
    return NextResponse.json({
      status: "pending",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

