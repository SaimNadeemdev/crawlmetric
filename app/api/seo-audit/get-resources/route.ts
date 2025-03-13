import { NextResponse } from "next/server";
import { getDataForSeoCredentials } from "@/lib/utils";

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");
  const limit = searchParams.get("limit") || "100";
  const offset = searchParams.get("offset") || "0";
  const resourceType = searchParams.get("resourceType") || null;
  const minSize = searchParams.get("minSize") || null;
  const orderBy = searchParams.get("orderBy") || "size,desc";

  if (!taskId) {
    return NextResponse.json(
      { success: false, error: "Task ID is required" },
      { status: 400 }
    );
  }

  console.log("[get-resources] Request received");
  console.log(
    `[get-resources] Fetching resources for taskId: ${taskId}, limit: ${limit}, offset: ${offset}, resourceType: ${resourceType}, minSize: ${minSize}, orderBy: ${orderBy}`
  );

  try {
    // Prepare request body
    const requestBody: any = {
      id: taskId,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    // Add filters if resourceType or minSize is provided
    if (resourceType || minSize) {
      const filters = [];
      
      if (resourceType) {
        filters.push(["resource_type", "=", resourceType]);
      }
      
      if (minSize) {
        if (filters.length > 0) {
          filters.push("and");
        }
        filters.push(["size", ">", parseInt(minSize)]);
      }
      
      if (filters.length > 0) {
        requestBody.filters = filters;
      }
    }

    // Add order_by if provided
    if (orderBy) {
      requestBody.order_by = [orderBy];
    }

    console.log("[get-resources] Making request to DataForSEO API: https://api.dataforseo.com/v3/on_page/resources");
    console.log(`[get-resources] Request body: ${JSON.stringify([requestBody])}`);

    // Get credentials
    const { username, password } = getDataForSeoCredentials();
    const credentials = Buffer.from(`${username}:${password}`).toString("base64");

    // Make API request
    const response = await fetch("https://api.dataforseo.com/v3/on_page/resources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify([requestBody]),
    });

    const data = await response.json();
    console.log(`[get-resources] Response received from DataForSEO API: ${JSON.stringify(data).substring(0, 500)}...`);

    if (data.status_code === 20000) {
      const resources = data.tasks?.[0]?.result?.[0]?.items || [];
      const totalCount = data.tasks?.[0]?.result?.[0]?.total_items_count || 0;
      console.log(`[get-resources] Found ${resources.length} resources out of ${totalCount} total`);

      return NextResponse.json({
        success: true,
        data: resources,
        totalCount,
        crawlProgress: data.tasks?.[0]?.result?.[0]?.crawl_progress,
        crawlStatus: data.tasks?.[0]?.result?.[0]?.crawl_status,
      });
    } else {
      console.error("[get-resources] API error:", data.status_message);
      return NextResponse.json(
        { success: false, error: data.status_message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[get-resources] Error fetching resources:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
