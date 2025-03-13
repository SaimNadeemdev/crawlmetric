// Test script for Lighthouse audit integration

// Configuration
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const testUrl = "example.com"; // URL to test with

// Helper function to wait for a specified time
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to log with timestamp
function logWithTime(message) {
  const now = new Date();
  console.log(`[${now.toISOString()}] ${message}`);
}

// Helper function to start a Lighthouse audit
async function startLighthouseAudit(url) {
  logWithTime(`Starting Lighthouse audit for URL: ${url}`);
  
  try {
    const response = await fetch(`${baseUrl}/api/seo-audit/lighthouse/task-post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        options: {
          device: "mobile",
          location: "United States",
          language: "English",
          tag: "Test Audit"
        }
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logWithTime(`Error starting Lighthouse audit: ${response.status} - ${errorText}`);
      return { success: false, error: errorText };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logWithTime(`Error starting Lighthouse audit: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Helper function to get task history
async function getTaskHistory(taskId) {
  logWithTime(`Checking task history for task ID: ${taskId}`);
  
  try {
    // Use the dedicated history endpoint
    const response = await fetch(`${baseUrl}/api/seo-audit/lighthouse/history?taskId=${encodeURIComponent(taskId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logWithTime(`Error getting task history: ${response.status} - ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logWithTime(`Error getting task history: ${error.message}`);
    return null;
  }
}

// Helper function to get Lighthouse results
async function getLighthouseResults(taskId) {
  logWithTime(`Getting Lighthouse results for task ID: ${taskId}`);
  
  try {
    const response = await fetch(`${baseUrl}/api/seo-audit/lighthouse/task-get?taskId=${encodeURIComponent(taskId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const data = await response.json();
    
    // Check for different status codes
    if (response.status === 202) {
      // 202 Accepted means the task is still in progress
      logWithTime(`Task is still in progress: ${data.error || 'No details available'}`);
      return { success: false, error: 'Task in progress', status: 'in_progress' };
    } else if (!response.ok) {
      logWithTime(`Error getting Lighthouse results: ${response.status} - ${JSON.stringify(data)}`);
      return { success: false, error: data.error || 'Unknown error', status: 'error' };
    }
    
    return data;
  } catch (error) {
    logWithTime(`Error getting Lighthouse results: ${error.message}`);
    return { success: false, error: error.message, status: 'error' };
  }
}

// Helper function to get latest results
async function getLatestResults() {
  logWithTime(`Getting latest Lighthouse results`);
  
  try {
    const response = await fetch(`${baseUrl}/api/seo-audit/lighthouse/latest`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const data = await response.json();
    
    // Check for different status codes
    if (response.status === 202) {
      // 202 Accepted means the task is still in progress
      logWithTime(`Latest task is still in progress: ${data.error || 'No details available'}`);
      return { success: false, error: 'Task in progress', status: 'in_progress' };
    } else if (!response.ok) {
      logWithTime(`Note: Latest results not available: ${response.status} - ${JSON.stringify(data)}`);
      logWithTime(`This is expected if no tasks have completed yet. Try again later.`);
      return { success: false, error: data.error || 'Unknown error', status: 'error' };
    }
    
    return data;
  } catch (error) {
    logWithTime(`Error getting latest results: ${error.message}`);
    return { success: false, error: error.message, status: 'error' };
  }
}

// Helper function to check results with retry
async function checkResultsWithRetry(taskId, maxRetries = 3, retryInterval = 5000) {
  logWithTime(`Checking results with retry for task ID: ${taskId}`);
  
  for (let i = 0; i < maxRetries; i++) {
    logWithTime(`Attempt ${i + 1}/${maxRetries} to get results...`);
    
    const results = await getLighthouseResults(taskId);
    
    if (results.success) {
      logWithTime(`Successfully retrieved Lighthouse results on attempt ${i + 1}`);
      return results;
    }
    
    logWithTime(`Results not ready yet. Waiting ${retryInterval / 1000} seconds before retrying...`);
    await sleep(retryInterval);
  }
  
  logWithTime(`Max retries (${maxRetries}) reached. Could not get results.`);
  return { success: false, error: 'Max retries reached' };
}

// Main test function
async function testLighthouseAudit() {
  try {
    logWithTime("Starting Lighthouse audit test");
    
    // Step 1: Start a Lighthouse audit
    const startResult = await startLighthouseAudit(testUrl);
    
    if (!startResult.success) {
      logWithTime(`Failed to start Lighthouse audit: ${startResult.error}`);
      return;
    }
    
    logWithTime(`Successfully started Lighthouse audit with task ID: ${startResult.taskId}`);
    
    // Step 2: Check task history
    const historyData = await getTaskHistory(startResult.taskId);
    
    if (historyData) {
      logWithTime(`Task history data: ${JSON.stringify(historyData)}`);
    } else {
      logWithTime("Failed to get task history");
    }
    
    // Step 3: Wait a bit before checking results
    logWithTime("Waiting for 5 seconds before checking results...");
    await sleep(5000);
    
    // Step 4: Try to get results with retry
    const results = await checkResultsWithRetry(startResult.taskId);
    
    if (!results.success) {
      logWithTime(`Note: Task results not ready yet: ${results.error}`);
      logWithTime("This is expected if the task is still processing. Try again later.");
    } else {
      logWithTime(`Task results: ${JSON.stringify(results).substring(0, 200)}...`);
    }
    
    // Step 5: Try to get the latest results
    const latestResults = await getLatestResults();
    
    if (!latestResults.success) {
      logWithTime(`Note: Latest results not available: ${latestResults.error}`);
      logWithTime("This is expected if no tasks have completed yet. Try again later.");
    } else {
      logWithTime(`Latest results: ${JSON.stringify(latestResults).substring(0, 200)}...`);
    }
    
    logWithTime("Lighthouse audit test completed successfully");
  } catch (error) {
    logWithTime(`Error in Lighthouse audit test: ${error.message}`);
    process.exit(1);
  }
}

// Run the test
testLighthouseAudit();
