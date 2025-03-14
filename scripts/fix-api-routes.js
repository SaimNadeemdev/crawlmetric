const fs = require('fs');
const path = require('path');

// Function to recursively find all route.ts files in the api directory
function findRouteFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search directories
      results = results.concat(findRouteFiles(filePath));
    } else if (file === 'route.ts' || file.endsWith('/route.ts')) {
      // Found a route file
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to remove "use client" directive from a file
function removeUseClientDirective(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file has the "use client" directive
    if (content.includes('"use client"') || content.includes("'use client'")) {
      // Remove the directive and any empty lines that follow
      content = content.replace(/["']use client["']\s*\n+/g, '');
      
      // Write the modified content back to the file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Removed 'use client' directive from ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️ No 'use client' directive found in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  const apiDir = path.join(process.cwd(), 'app', 'api');
  
  if (!fs.existsSync(apiDir)) {
    console.error(`❌ API directory not found: ${apiDir}`);
    return;
  }
  
  console.log(`🔍 Searching for route files in ${apiDir}...`);
  const routeFiles = findRouteFiles(apiDir);
  
  console.log(`🔎 Found ${routeFiles.length} route files.`);
  
  let modifiedCount = 0;
  
  routeFiles.forEach(file => {
    const wasModified = removeUseClientDirective(file);
    if (wasModified) modifiedCount++;
  });
  
  console.log(`\n✨ Done! Modified ${modifiedCount} files.`);
}

// Run the script
main();
