/**
 * Script to ensure all pages have the dynamic export to prevent serialization errors
 * This helps prevent "Unsupported Server Component type: Module" errors during Vercel deployment
 */

const fs = require('fs');
const path = require('path');

// Directory to scan
const appDirectory = path.join(__dirname, '../app');

// File extensions to check
const fileExtensions = ['.tsx', '.jsx', '.ts', '.js'];

// Files to skip (already known to have dynamic export)
const skipFiles = [
  'layout.tsx',
  'not-found.tsx',
  'error.tsx',
  'loading.tsx',
  'global-error.tsx'
];

// Function to check if a file already has the dynamic export
function hasDynamicExport(content) {
  return /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/.test(content);
}

// Function to add the dynamic export to a file
function addDynamicExport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (hasDynamicExport(content)) {
    console.log(`\u2713 ${filePath} already has dynamic export`);
    return;
  }
  
  // Check if it's a page file (named page.tsx, page.jsx, etc.)
  const fileName = path.basename(filePath);
  if (!fileName.startsWith('page.')) {
    console.log(`\u23ed\ufe0f Skipping ${filePath} (not a page file)`);
    return;
  }
  
  // Find the position to insert the dynamic export
  // Look for "use client" directive first
  const useClientMatch = content.match(/["']use client["']\s*/);
  
  let newContent;
  if (useClientMatch) {
    // Insert after "use client" directive and any imports
    const importsEndIndex = findImportsEndIndex(content, useClientMatch.index + useClientMatch[0].length);
    newContent = [
      content.slice(0, importsEndIndex),
      '\n// Force dynamic rendering to prevent serialization errors\nexport const dynamic = \'force-dynamic\';\n',
      content.slice(importsEndIndex)
    ].join('');
  } else {
    // No "use client" directive, insert at the beginning of the file
    newContent = '// Force dynamic rendering to prevent serialization errors\nexport const dynamic = \'force-dynamic\';\n\n' + content;
  }
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`\u2705 Added dynamic export to ${filePath}`);
}

// Function to find the end of import statements
function findImportsEndIndex(content, startIndex) {
  const lines = content.slice(startIndex).split('\n');
  let endIndex = startIndex;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '' || !line.trim().startsWith('import ')) {
      // Found the first non-import line
      endIndex += lines.slice(0, i).join('\n').length;
      if (i > 0) endIndex += 1; // Add 1 for the newline character
      break;
    }
  }
  
  return endIndex;
}

// Function to recursively process files in a directory
function processDirectory(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.isFile()) {
      const ext = path.extname(file.name);
      if (fileExtensions.includes(ext) && !skipFiles.includes(file.name)) {
        addDynamicExport(fullPath);
      }
    }
  }
}

// Main execution
console.log('Starting to add dynamic exports to page files...');
processDirectory(appDirectory);
console.log('\nProcess complete!');
