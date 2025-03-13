const fs = require('fs');
const path = require('path');

// Root directory of the API routes
const apiDir = path.join(__dirname, '..', 'app', 'api');

// Function to recursively find all route.ts files
function findRouteFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search directories
      results = results.concat(findRouteFiles(filePath));
    } else if (file === 'route.ts' || file === 'route.js') {
      results.push(filePath);
    }
  }
  
  return results;
}

// Function to add dynamic export to a route file if it doesn't already have it
function addDynamicExport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if dynamic export already exists
  if (content.includes("export const dynamic = 'force-dynamic'") || 
      content.includes('export const dynamic = "force-dynamic"')) {
    console.log(`✓ ${filePath} already has dynamic export`);
    return false;
  }
  
  // Find a good position to insert the dynamic export
  // Typically after imports but before function declarations
  const lines = content.split('\n');
  let insertPosition = 0;
  
  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      insertPosition = i + 1;
    } else if (lines[i].trim().startsWith('export ') && !lines[i].includes('dynamic')) {
      // Found first export, insert before this
      break;
    }
  }
  
  // Insert the dynamic export
  lines.splice(insertPosition, 0, '', '// Use dynamic route handlers to avoid static generation errors', "export const dynamic = 'force-dynamic';", '');
  
  // Write the modified content back to the file
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`✅ Added dynamic export to ${filePath}`);
  return true;
}

// Main function
function main() {
  console.log('Finding API route files...');
  const routeFiles = findRouteFiles(apiDir);
  console.log(`Found ${routeFiles.length} route files.`);
  
  let modifiedCount = 0;
  
  for (const file of routeFiles) {
    const modified = addDynamicExport(file);
    if (modified) modifiedCount++;
  }
  
  console.log(`\nSummary: Modified ${modifiedCount} of ${routeFiles.length} route files.`);
}

// Run the script
main();
