// This is a partial file containing only the fixed handleLoadLighthouseResults function
// This should be integrated into the main context file

const handleLoadLighthouseResults = async (taskId: string) => {
  setLighthouseLoading(true)
  try {
    const data = await getLighthouseResults(taskId)
    console.log("Lighthouse API response:", JSON.stringify(data).substring(0, 500))
    
    if (data.tasks && data.tasks.length > 0) {
      // Check if the task is still running
      if (data.tasks[0].status_message === "Task In Queue" || 
          data.tasks[0].status_message === "Task In Progress") {
        console.log(`Task ${taskId} is still running with status: ${data.tasks[0].status_message}`)
        // Update task status to running
        updateLighthouseTaskStatus(taskId, {
          status: "running",
          progress: 50,
        })
        return null
      }
      
      // Check if we have results
      if (data.tasks[0].result && data.tasks[0].result.length > 0) {
        const result = data.tasks[0].result[0]
        console.log("Lighthouse results loaded successfully")
        setLighthouseResults(result)
        
        // Update task status
        updateLighthouseTaskStatus(taskId, {
          status: "completed",
          progress: 100,
          completedAt: new Date().toISOString(),
        })
        
        return result
      } else {
        // No results yet, but task exists
        console.log(`Task ${taskId} exists but no results yet`)
        updateLighthouseTaskStatus(taskId, {
          status: "running",
          progress: 50,
        })
        return null
      }
    } else {
      // No task data found
      console.error("No task data found for ID:", taskId)
      updateLighthouseTaskStatus(taskId, {
        status: "failed",
        progress: 0,
      })
      return null
    }
  } catch (error) {
    console.error("Error loading Lighthouse results:", error)
    
    // Update task status to failed
    updateLighthouseTaskStatus(taskId, {
      status: "failed",
      progress: 0,
    })
    
    throw error
  } finally {
    setLighthouseLoading(false)
  }
}
