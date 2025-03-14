"use client"

import { NextResponse } from "next/server";

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


// DataForSEO API credentials - hardcoded for all users (same as in task-get route)
const API_LOGIN = "saim@makewebeasy.llc"
const API_PASSWORD = "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

export async function GET() {
  try {
    // DataForSEO API endpoint for getting tasks
    // Using the live endpoint instead of tasks_ready to get all tasks
    const apiUrl = "https://api.dataforseo.com/v3/on_page/lighthouse/tasks_ready";
    
    console.log("Fetching Lighthouse tasks from DataForSEO");
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${AUTH_HEADER}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching Lighthouse tasks: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `Failed to fetch Lighthouse tasks: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Lighthouse tasks response status: ${data.status_code}`);

    if (data.status_code !== 20000) {
      return NextResponse.json(
        { error: `API Error: ${data.status_code} - ${data.status_message}` },
        { status: 400 }
      );
    }

    // Try to get tasks from the response
    let tasks = [];
    
    if (data.tasks && Array.isArray(data.tasks)) {
      tasks = data.tasks.map((task: any) => ({
        id: task.id,
        status: task.status_message === "Ok." ? "completed" : "pending",
        url: task.data?.target || "",
        createdAt: task.date_posted || new Date().toISOString(),
      }));
    }
    
    // If no tasks found, try an alternative endpoint
    if (tasks.length === 0) {
      console.log("No tasks found in tasks_ready, trying alternative endpoint");
      
      // Try the live endpoint to get all tasks
      const liveApiUrl = "https://api.dataforseo.com/v3/on_page/lighthouse/tasks_ready";
      
      const liveResponse = await fetch(liveApiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${AUTH_HEADER}`,
        },
      });
      
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        
        if (liveData.status_code === 20000 && liveData.tasks && Array.isArray(liveData.tasks)) {
          tasks = liveData.tasks.map((task: any) => ({
            id: task.id,
            status: task.status_message === "Ok." ? "completed" : "pending",
            url: task.data?.target || "",
            createdAt: task.date_posted || new Date().toISOString(),
          }));
        }
      }
    }
    
    console.log(`Found ${tasks.length} Lighthouse tasks`);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error in Lighthouse tasks endpoint:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
