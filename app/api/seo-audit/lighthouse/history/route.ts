import { NextRequest, NextResponse } from "next/server";
import { loadTaskHistory, getAllTaskHistory } from "@/lib/task-history";

// Route handler for GET requests to retrieve task history
export async function GET(request: NextRequest) {
  try {
    // Get the task ID from the query parameters
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    
    console.log(`Processing history request for task ID: ${taskId}`);
    
    // If we have a task ID, return its history
    if (taskId) {
      const taskData = loadTaskHistory(taskId);
      
      if (taskData) {
        console.log(`Returning history for task ID: ${taskId}`);
        return NextResponse.json(taskData);
      } else {
        console.log(`No history found for task ID: ${taskId}`);
        return NextResponse.json(
          { error: `No history found for task ID: ${taskId}` },
          { status: 404 }
        );
      }
    }
    
    // If no task ID, return all task history
    console.log(`Returning all task history`);
    const allHistory = getAllTaskHistory();
    return NextResponse.json(allHistory);
  } catch (error) {
    console.error("Error retrieving task history:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
