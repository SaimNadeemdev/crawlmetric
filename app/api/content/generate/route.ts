import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

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
    const { prompt, type } = await request.json()

    if (!prompt || !type) {
      return NextResponse.json({ error: "Prompt and type are required" }, { status: 400 })
    }

    // Here you would integrate with a content generation service
    // For now, we'll simulate a response
    const result = `Generated content for prompt: ${prompt}`

    // Store the generation in the database
    const { data, error } = await supabase
      .from("content_generations")
      .insert({
        user_id: userId,
        type,
        prompt,
        result,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      generation: data,
      content: result,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

