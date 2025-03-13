const fs = require('fs');
const path = require('path');

// Root directory of the service pages
const servicesDir = path.join(__dirname, '..', 'app', 'services');

// Function to recursively find all page.tsx files
function findPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fileList = findPageFiles(filePath, fileList);
    } else if (file === 'page.tsx' || file === 'page.js' || file === 'page.jsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to add dynamic export to a page file if it doesn't already have it
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
  let foundImports = false;
  
  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      insertPosition = i + 1;
      foundImports = true;
    } else if (foundImports && lines[i].trim() === '') {
      // Found first empty line after imports
      insertPosition = i;
      break;
    } else if (lines[i].trim().startsWith('export ') && !lines[i].includes('dynamic')) {
      // Found first export, insert before this
      break;
    }
  }
  
  // Insert the dynamic export
  lines.splice(insertPosition, 0, '', '// Force dynamic rendering to prevent serialization errors', "export const dynamic = 'force-dynamic';", '');
  
  // Write the modified content back to the file
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`\x1b[32mu2705 Added dynamic export to ${filePath}\x1b[0m`);
  return true;
}

// Main function
function main() {
  console.log('Finding all service page files...');
  const pageFiles = findPageFiles(servicesDir);
  console.log(`Found ${pageFiles.length} page files.`);
  
  let modifiedCount = 0;
  
  for (const filePath of pageFiles) {
    try {
      const modified = addDynamicExport(filePath);
      if (modified) modifiedCount++;
    } catch (error) {
      console.error(`\x1b[31mError processing ${filePath}: ${error.message}\x1b[0m`);
    }
  }
  
  console.log(`\n\x1b[32mSummary: Modified ${modifiedCount} of ${pageFiles.length} service page files.\x1b[0m`);
}

// Run the script
main();
