const fs = require('fs');
const path = require('path');

// Root directory of the project
const rootDir = path.join(__dirname, '..');

// Directories to exclude from scanning
const excludeDirs = ['node_modules', '.next', '.git', 'public'];

// File extensions to scan
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

// Patterns to look for
const patterns = [
  { pattern: /document\./g, description: 'Direct document reference' },
  { pattern: /typeof\s+document/g, description: 'typeof document check' },
  { pattern: /window\./g, description: 'Direct window reference' },
  { pattern: /typeof\s+window/g, description: 'typeof window check' },
  { pattern: /navigator\./g, description: 'Direct navigator reference' },
  { pattern: /localStorage\./g, description: 'Direct localStorage reference' },
  { pattern: /sessionStorage\./g, description: 'Direct sessionStorage reference' }
];

// Files that are allowed to have client-side references
const allowedClientSideFiles = [
  'utils/client-utils.ts',
  'components/ui/use-toast.ts',
  'components/ui/toast.tsx'
];

// Function to recursively find files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip excluded directories
      if (!excludeDirs.includes(file)) {
        fileList = findFiles(filePath, fileList);
      }
    } else {
      // Check if file has one of the extensions we're looking for
      const ext = path.extname(file).toLowerCase();
      if (fileExtensions.includes(ext)) {
        fileList.push({ path: filePath, relativePath });
      }
    }
  });
  
  return fileList;
}

// Function to check a file for patterns
function checkFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check if this is a client component
  const isClientComponent = content.includes('"use client"') || content.includes("'use client'");
  
  // Check if this is an allowed client-side file
  const isAllowedClientSide = allowedClientSideFiles.some(allowedPath => relativePath.includes(allowedPath));
  
  // Skip checking if this is a client component or an allowed client-side file
  if (isClientComponent || isAllowedClientSide) {
    return issues;
  }
  
  // Check for each pattern
  patterns.forEach(({ pattern, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      // Find line numbers for each match
      const lines = content.split('\n');
      const matchLineNumbers = [];
      
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          matchLineNumbers.push(i + 1);
        }
        // Reset the regex lastIndex
        pattern.lastIndex = 0;
      }
      
      issues.push({
        description,
        count: matches.length,
        lineNumbers: matchLineNumbers
      });
    }
  });
  
  return issues;
}

// Main function
function main() {
  console.log('Scanning for document and browser API references...');
  const files = findFiles(rootDir);
  console.log(`Found ${files.length} files to scan.`);
  
  let totalIssues = 0;
  const fileIssues = [];
  
  files.forEach(({ path: filePath, relativePath }) => {
    const issues = checkFile(filePath, relativePath);
    if (issues.length > 0) {
      fileIssues.push({ relativePath, issues });
      totalIssues += issues.reduce((sum, issue) => sum + issue.count, 0);
    }
  });
  
  // Sort by number of issues
  fileIssues.sort((a, b) => {
    const aCount = a.issues.reduce((sum, issue) => sum + issue.count, 0);
    const bCount = b.issues.reduce((sum, issue) => sum + issue.count, 0);
    return bCount - aCount;
  });
  
  // Print results
  console.log('\n=== Files with potential issues ===');
  fileIssues.forEach(({ relativePath, issues }) => {
    console.log(`\n\x1b[33m${relativePath}\x1b[0m`);
    issues.forEach(issue => {
      console.log(`  - ${issue.description}: ${issue.count} occurrences on lines ${issue.lineNumbers.join(', ')}`);
    });
  });
  
  console.log(`\n\x1b[${totalIssues > 0 ? '31' : '32'}mFound ${totalIssues} potential issues in ${fileIssues.length} files.\x1b[0m`);
  
  if (totalIssues > 0) {
    console.log('\nThese issues might cause problems during static generation. Consider:');
    console.log('1. Adding "use client" directive to components that need browser APIs');
    console.log('2. Moving browser API calls to useEffect hooks or client-side utilities');
    console.log('3. Adding checks like "typeof window !== \'undefined\'" before accessing browser APIs');
  } else {
    console.log('\nNo potential issues found. The codebase should be ready for deployment!');
  }
}

// Run the script
main();
