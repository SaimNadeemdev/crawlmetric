/**
 * Script to ensure all components that might use client-side APIs have the "use client" directive
 * This helps prevent "document is not defined" errors during server-side rendering
 */

const fs = require('fs');
const path = require('path');

// Directories to scan
const directories = [
  path.join(__dirname, '../components'),
  path.join(__dirname, '../app')
];

// Client-side API patterns to look for
const clientApiPatterns = [
  'document\\.',
  'window\\.',
  'localStorage',
  'sessionStorage',
  'navigator\\.',
  'location\\.',
  'addEventListener',
  'removeEventListener',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'fetch\\(',
  'XMLHttpRequest',
  'new Blob',
  'URL\\.createObjectURL',
  'createTag',
  'safeWindow',
  'safeDocument',
  'isBrowser',
  'useEffect',
  'useState',
  'useRef',
  'useCallback',
  'useMemo',
  'useContext',
  'useReducer',
  'useLayoutEffect'
];

// File extensions to check
const fileExtensions = ['.tsx', '.jsx', '.ts', '.js'];

// Files to skip (already known to be properly marked)
const skipFiles = [
  'client-utils.ts',
  'auth-provider.tsx'
];

// Function to check if a file contains client-side API usage
function containsClientApiUsage(content) {
  return clientApiPatterns.some(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(content);
  });
}

// Function to check if a file already has the "use client" directive
function hasUseClientDirective(content) {
  return /^\s*["']use client["']\s*/.test(content);
}

// Function to add the "use client" directive to a file
function addUseClientDirective(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (hasUseClientDirective(content)) {
    console.log(`\u2713 ${filePath} already has "use client" directive`);
    return;
  }
  
  if (containsClientApiUsage(content)) {
    const newContent = `"use client"\n\n${content}`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`\u2705 Added "use client" directive to ${filePath}`);
  } else {
    console.log(`\u23edufe0f Skipping ${filePath} (no client API usage detected)`);
  }
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
        addUseClientDirective(fullPath);
      }
    }
  }
}

// Main execution
console.log('Starting to scan files for client-side API usage...');
directories.forEach(dir => {
  console.log(`\nScanning directory: ${dir}`);
  processDirectory(dir);
});
console.log('\nScan complete!');
