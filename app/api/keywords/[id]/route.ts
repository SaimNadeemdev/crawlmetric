import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    const keywordId = params.id

    // Get keyword
    const { data, error } = await supabase
      .from("keywords")
      .select("*")
      .eq("id", keywordId)
      .eq("user_id", userId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 })
    }

    return NextResponse.json({ keyword: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const keywordId = params.id

    // Get request body
    const updates = await request.json()

    // Update keyword
    const { data, error } = await supabase
      .from("keywords")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", keywordId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ keyword: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Pass the request to the createServerSupabaseClient function
    const supabase = createServerSupabaseClient(request)
    let userId = null;
    
    // Try to get the user from the session first
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session && session.user) {
      userId = session.user.id;
    } else {
      // If no session, try to get the token from the request
      let token = null;
      
      // Check for Authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else {
        // Try to get token from request body
        try {
          const body = await request.clone().json();
          token = body.token;
        } catch (e) {
          // No body or invalid JSON
        }
      }
      
      // If we have a token, try to get the user
      if (token) {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) {
          userId = data.user.id;
        }
      }
    }

    // If we don't have a user ID, return unauthorized
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 })
    }

    const keywordId = params.id

    // Delete keyword
    const { error } = await supabase.from("keywords").delete().eq("id", keywordId).eq("user_id", userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
