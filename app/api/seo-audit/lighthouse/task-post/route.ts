import { NextRequest, NextResponse } from "next/server";
import { saveTaskHistory } from "@/lib/task-history";

// DataForSEO API credentials - use environment variables with fallbacks
const API_LOGIN = process.env.DATAFORSEO_USERNAME || "saim.nadeem@gmail.com";
const API_PASSWORD = process.env.DATAFORSEO_PASSWORD || "9e8f3d68a939d229";
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString('base64');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, options } = body;
    
    if (!url) {
      return NextResponse.json({
        success: false,
        error: "URL is required"
      }, { status: 400 });
    }
    
    console.log(`Starting Lighthouse audit for URL: ${url}`);
    console.log(`With options:`, options);
    
    // Normalize the URL
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // Create a proper request body with all required parameters
    const requestBody = [
      {
        url: normalizedUrl,
        lighthouse_version: options?.lighthouse_version || "latest",
        device: options?.forMobile ? "mobile" : "desktop",
        location_name: options?.location_name || "United States",
        language_name: options?.language_name || "English"
      }
    ];
    
    const apiUrl = `https://api.dataforseo.com/v3/on_page/lighthouse/task_post`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${AUTH_HEADER}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error starting Lighthouse audit: ${response.status} - ${errorText}`);
      return NextResponse.json({
        success: false,
        error: `Error starting Lighthouse audit: ${response.status}`
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log("DataForSEO API response:", data);
    
    if (data.status_code !== 20000) {
      console.error(`API error: ${data.status_code} - ${data.status_message}`);
      return NextResponse.json({
        success: false,
        error: data.status_message || "Failed to start Lighthouse audit"
      }, { status: 500 });
    }
    
    if (!data.tasks || data.tasks.length === 0) {
      console.error("No tasks returned from API");
      return NextResponse.json({
        success: false,
        error: "No tasks returned from API"
      }, { status: 500 });
    }
    
    const task = data.tasks[0];
    if (!task.id) {
      console.error("No task ID returned from API");
      return NextResponse.json({
        success: false,
        error: "No task ID returned from API"
      }, { status: 500 });
    }
    
    const taskId = task.id;
    
    // Save the task history with the URL for future reference
    saveTaskHistory(taskId, {
      url: normalizedUrl,
      options: requestBody[0],
      createdAt: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      taskId,
      status: "in_progress",
      message: "Lighthouse audit task created successfully",
      data: {
        url: normalizedUrl,
        lighthouse_version: requestBody[0].lighthouse_version,
        device: requestBody[0].device,
        location_name: requestBody[0].location_name,
        language_name: requestBody[0].language_name
      }
    });
  } catch (error) {
    console.error("Error starting Lighthouse audit:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }, { status: 500 });
  }
}
