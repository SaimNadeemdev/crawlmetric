const fs = require('fs');
const path = require('path');

// Root directory of the app pages
const appDir = path.join(__dirname, '..', 'app');

// List of pages that are causing errors during static generation
const problematicPages = [
  '/seo-audit/debug-tools/page.tsx',
  '/seo-audit/debug/page.tsx',
  '/content-generation/history/page.tsx',
  '/content-generator/page.tsx',
  '/dashboard/keywords-overview/page.tsx',
  '/services/content-generation/page.tsx'
];

// Function to add dynamic export to a page file if it doesn't already have it
function addDynamicExport(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`\x1b[33m⚠ ${filePath} does not exist\x1b[0m`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if dynamic export already exists
  if (content.includes("export const dynamic = 'force-dynamic'") || 
      content.includes('export const dynamic = "force-dynamic"')) {
    console.log(`\x1b[32m✓ ${filePath} already has dynamic export\x1b[0m`);
    return false;
  }
  
  // Find a good position to insert the dynamic export
  // Typically after imports but before function declarations
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
  console.log(`\x1b[32m✅ Added dynamic export to ${filePath}\x1b[0m`);
  return true;
}

// Main function
function main() {
  console.log('Adding dynamic export to problematic pages...');
  
  let modifiedCount = 0;
  
  for (const pagePath of problematicPages) {
    const fullPath = path.join(appDir, pagePath);
    try {
      const modified = addDynamicExport(fullPath);
      if (modified) modifiedCount++;
    } catch (error) {
      console.error(`\x1b[31mError processing ${fullPath}: ${error.message}\x1b[0m`);
    }
  }
  
  console.log(`\n\x1b[32mSummary: Modified ${modifiedCount} of ${problematicPages.length} page files.\x1b[0m`);
}

// Run the script
main();
