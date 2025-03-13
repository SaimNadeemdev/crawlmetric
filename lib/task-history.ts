import fs from 'fs';
import path from 'path';
import os from 'os';

// Use a temp directory for task history to avoid permission issues
const HISTORY_DIR = path.join(os.tmpdir(), 'crawlmetric-task-history');

// Ensure the history directory exists
try {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
    console.log(`Created task history directory: ${HISTORY_DIR}`);
  }
} catch (error) {
  console.error(`Error creating task history directory:`, error);
}

// Helper function to save task history to a file
export function saveTaskHistory(taskId: string, data: any) {
  try {
    const filePath = path.join(HISTORY_DIR, `${taskId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Saved task history to file: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error saving task history:`, error);
    return false;
  }
}

// Helper function to load task history from a file
export function loadTaskHistory(taskId: string) {
  try {
    const filePath = path.join(HISTORY_DIR, `${taskId}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`Loaded task history from file: ${filePath}`);
      return data;
    }
    return null;
  } catch (error) {
    console.error(`Error loading task history:`, error);
    return null;
  }
}

// Helper function to get all task history
export function getAllTaskHistory() {
  try {
    const files = fs.readdirSync(HISTORY_DIR);
    const history: Record<string, any> = {};
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const taskId = file.replace('.json', '');
        const data = loadTaskHistory(taskId);
        if (data) {
          history[taskId] = data;
        }
      }
    }
    
    return history;
  } catch (error) {
    console.error(`Error getting all task history:`, error);
    return {};
  }
}

// Helper function to directly get URL for a task ID
export function getUrlForTaskId(taskId: string): string | null {
  const taskData = loadTaskHistory(taskId);
  if (taskData && taskData.url) {
    return taskData.url;
  }
  return null;
}
