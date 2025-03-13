import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Refresh API - Starting refresh for keyword ID:", params.id);
    
    // Pass the request to the createServerSupabaseClient function
    const supabase = createServerSupabaseClient(request);
    console.log("Refresh API - Created Supabase client");
    
    let userId = null;
    
    // Try to get the user from the session first
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    console.log("Refresh API - Session check result:", session ? "Session found" : "No session");

    if (session && session.user) {
      userId = session.user.id;
      console.log("Refresh API - Found user from session:", userId);
    } else {
      // If no session, try to get the token from the request
      let token = null;
      
      // Check for Authorization header
      const authHeader = request.headers.get('authorization');
      console.log("Refresh API - Authorization header:", authHeader ? "Present" : "Not present");
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log("Refresh API - Found token in Authorization header");
      } else {
        // Try to get token from request body
        try {
          const clonedRequest = request.clone();
          const body = await clonedRequest.json();
          console.log("Refresh API - Request body:", JSON.stringify(body));
          token = body.token;
          if (token) {
            console.log("Refresh API - Found token in request body");
          }
        } catch (e) {
          // No body or invalid JSON
          console.log("Refresh API - Error parsing request body:", e);
        }
      }
      
      // If we have a token, try to get the user
      if (token) {
        console.log("Refresh API - Attempting to get user from token");
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) {
          userId = data.user.id;
          console.log("Refresh API - Found user from token:", userId);
        } else if (error) {
          console.error("Refresh API - Error getting user from token:", error);
        }
      }
    }

    // If we don't have a user ID, return 401
    if (!userId) {
      console.error("Refresh API - No valid session or token found");
      return NextResponse.json({ error: "No valid session found. Please log in again." }, { status: 401 });
    }

    const keywordId = params.id;
    
    console.log(`Refresh API - Processing refresh for keyword ${keywordId} by user ${userId}`);
    
    // First, check if the keyword belongs to the user
    const { data: keywordData, error: keywordError } = await supabase
      .from("keywords")
      .select("*")
      .eq("id", keywordId)
      .eq("user_id", userId)
      .single();
      
    if (keywordError) {
      console.error("Refresh API - Error fetching keyword:", keywordError);
      return NextResponse.json({ error: "Keyword not found or not authorized" }, { status: 404 });
    }
    
    console.log("Refresh API - Found keyword:", keywordData.id, keywordData.keyword);
    
    // Simulate refreshing the keyword ranking with updated data
    // In a real implementation, you would call an external API to get fresh ranking data
    const currentRank = keywordData.current_rank || 0;
    const previousRank = currentRank;
    const newRank = Math.max(1, Math.min(100, currentRank + Math.floor(Math.random() * 11) - 5));
    const rankChange = previousRank - newRank; // Positive means improved (lower number is better)
    
    console.log(`Refresh API - Updating rank from ${currentRank} to ${newRank}`);
    
    // Update the keyword with new ranking data
    const { data: updatedKeyword, error: updateError } = await supabase
      .from("keywords")
      .update({
        current_rank: newRank,
        previous_rank: previousRank,
        last_updated: new Date().toISOString()
      })
      .eq("id", keywordId)
      .eq("user_id", userId)
      .select()
      .single();
      
    if (updateError) {
      console.error("Refresh API - Error updating keyword:", updateError);
      return NextResponse.json({ error: "Failed to update keyword ranking" }, { status: 500 });
    }
    
    console.log("Refresh API - Successfully updated keyword ranking");
    
    // Try to add an entry to keyword_history, but don't fail if it doesn't work
    try {
      const { error: historyError } = await supabase
        .from("keyword_history")
        .insert({
          keyword_id: keywordId,
          rank: newRank,
          user_id: userId,
          created_at: new Date().toISOString()
        });
        
      if (historyError) {
        console.error("Refresh API - Error adding history entry:", historyError);
        // Continue anyway, as the main update succeeded
      } else {
        console.log("Refresh API - Added history entry for keyword");
      }
    } catch (historyInsertError) {
      // If the keyword_history table doesn't exist or we don't have permissions,
      // just log the error and continue
      console.error("Refresh API - Failed to insert history record:", historyInsertError);
    }
    
    return NextResponse.json({ 
      success: true, 
      keyword: updatedKeyword,
      message: "Keyword ranking refreshed successfully"
    });
  } catch (error: any) {
    console.error("Unexpected error in keyword refresh API:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
