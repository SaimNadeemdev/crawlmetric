const fs = require('fs');
const path = require('path');

// Function to recursively find all page.tsx files
function findPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findPageFiles(filePath, fileList);
    } else if (file === 'page.tsx') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to add 'use client' directive to a file if it doesn't already have it
function addUseClientDirective(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Skip if the file already has 'use client' directive
  if (content.includes('"use client"') || content.includes("'use client'")) {
    console.log(`✓ ${filePath} already has use client directive`);
    return false;
  }

  // Add 'use client' directive at the beginning of the file
  const updatedContent = `"use client"

${content}`;
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`✅ Added use client directive to ${filePath}`);
  return true;
}

// Main function
function main() {
  console.log('Finding all page.tsx files...');
  const appDir = path.join(__dirname, '..', 'app');
  const pageFiles = findPageFiles(appDir);
  console.log(`Found ${pageFiles.length} page files.`);

  let modifiedCount = 0;
  pageFiles.forEach(filePath => {
    if (addUseClientDirective(filePath)) {
      modifiedCount++;
    }
  });

  console.log(`\nSummary: Modified ${modifiedCount} of ${pageFiles.length} page files.`);
}

// Run the script
main();
