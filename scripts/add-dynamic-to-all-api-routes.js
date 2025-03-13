const fs = require('fs');
const path = require('path');

// Root directory of the API routes
const apiDir = path.join(__dirname, '..', 'app', 'api');

// Function to recursively find all route.ts files
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fileList = findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts' || file === 'route.js' || file === 'route.tsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to add dynamic export to a route file if it doesn't already have it
function addDynamicExport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if dynamic export already exists
  if (content.includes("export const dynamic = 'force-dynamic'") || 
      content.includes('export const dynamic = "force-dynamic"')) {
    console.log(`\x1b[32mu2713 ${filePath} already has dynamic export\x1b[0m`);
    return false;
  }
  
  // Find a good position to insert the dynamic export
  const lines = content.split('\n');
  let insertPosition = 0;
  
  // Find position after imports or 'use server' directive
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('import ') || line === '"use server"' || line === "'use server'") {
      insertPosition = i + 1;
    } else if (line !== '' && !line.startsWith('//') && insertPosition > 0) {
      // Found first non-empty, non-comment line after imports
      break;
    }
  }
  
  // Insert the dynamic export
  lines.splice(insertPosition, 0, '', '// Force dynamic API route', "export const dynamic = 'force-dynamic';", '');
  
  // Write the modified content back to the file
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`\x1b[32mu2705 Added dynamic export to ${filePath}\x1b[0m`);
  return true;
}

// Main function
function main() {
  console.log('Finding all API route files...');
  const routeFiles = findRouteFiles(apiDir);
  console.log(`Found ${routeFiles.length} route files.`);
  
  let modifiedCount = 0;
  
  for (const filePath of routeFiles) {
    try {
      const modified = addDynamicExport(filePath);
      if (modified) modifiedCount++;
    } catch (error) {
      console.error(`\x1b[31mError processing ${filePath}: ${error.message}\x1b[0m`);
    }
  }
  
  console.log(`\n\x1b[32mSummary: Modified ${modifiedCount} of ${routeFiles.length} API route files.\x1b[0m`);
}

// Run the script
main();
