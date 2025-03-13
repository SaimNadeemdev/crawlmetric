/**
 * Script to verify that there are no direct references to browser APIs
 * that could cause static generation errors during Vercel deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define patterns to look for
const patterns = [
  {
    name: 'Direct window access',
    regex: /(?<!typeof\s+|===\s+|!==\s+|==\s+|!=\s+|\?\s+|\(|\s+in\s+|=\s+)window\./g,
    safePatterns: [
      /if\s*\(\s*typeof\s+window\s*!==\s*['"]undefined['"]\s*\)/,
      /if\s*\(\s*typeof\s+window\s*===\s*['"]undefined['"]\s*\)\s*return/,
      /isClient/,
      /getWindow\(\)/
    ]
  },
  {
    name: 'Direct document access',
    regex: /(?<!typeof\s+|===\s+|!==\s+|==\s+|!=\s+|\?\s+|\(|\s+in\s+|=\s+)document\./g,
    safePatterns: [
      /if\s*\(\s*typeof\s+document\s*!==\s*['"]undefined['"]\s*\)/,
      /if\s*\(\s*typeof\s+document\s*===\s*['"]undefined['"]\s*\)\s*return/,
      /isClient/,
      /getDocument\(\)/
    ]
  },
  {
    name: 'localStorage access',
    regex: /localStorage\./g,
    safePatterns: [
      /if\s*\(\s*typeof\s+window\s*!==\s*['"]undefined['"]\s*\)/,
      /if\s*\(\s*typeof\s+localStorage\s*!==\s*['"]undefined['"]\s*\)/,
      /isClient/
    ]
  },
  {
    name: 'sessionStorage access',
    regex: /sessionStorage\./g,
    safePatterns: [
      /if\s*\(\s*typeof\s+window\s*!==\s*['"]undefined['"]\s*\)/,
      /if\s*\(\s*typeof\s+sessionStorage\s*!==\s*['"]undefined['"]\s*\)/,
      /isClient/
    ]
  },
  {
    name: 'navigator access',
    regex: /navigator\./g,
    safePatterns: [
      /if\s*\(\s*typeof\s+window\s*!==\s*['"]undefined['"]\s*\)/,
      /if\s*\(\s*typeof\s+navigator\s*!==\s*['"]undefined['"]\s*\)/,
      /isClient/
    ]
  }
];

// Directories to exclude
const excludeDirs = [
  'node_modules',
  '.next',
  '.git',
  'public',
  'scripts',
  'utils/client-utils.ts' // This file is specifically designed to handle browser APIs safely
];

// File extensions to check
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// Function to check if a file should be excluded
function shouldExcludeFile(filePath) {
  return excludeDirs.some(dir => filePath.includes(path.sep + dir + path.sep) || filePath.endsWith(path.sep + dir));
}

// Function to check if a file contains unsafe patterns
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // Check each pattern
    for (const pattern of patterns) {
      const matches = content.match(pattern.regex);
      
      if (matches) {
        // Check if any of the safe patterns are present
        const hasSafePattern = pattern.safePatterns.some(safePattern => {
          return safePattern.test(content);
        });

        // If no safe pattern is present, report an issue
        if (!hasSafePattern) {
          issues.push({
            pattern: pattern.name,
            matches: matches.length
          });
        }
      }
    }

    return issues.length > 0 ? { filePath, issues } : null;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

// Function to recursively scan directories
function scanDirectory(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !shouldExcludeFile(fullPath)) {
      results.push(...scanDirectory(fullPath));
    } else if (entry.isFile() && extensions.includes(path.extname(entry.name)) && !shouldExcludeFile(fullPath)) {
      const fileIssues = checkFile(fullPath);
      if (fileIssues) {
        results.push(fileIssues);
      }
    }
  }

  return results;
}

// Main function
function main() {
  console.log('Scanning for unsafe browser API references...');
  
  const rootDir = path.resolve(__dirname, '..');
  const results = scanDirectory(rootDir);

  if (results.length === 0) {
    console.log('\n✅ No unsafe browser API references found!');
  } else {
    console.log(`\n❌ Found ${results.length} files with potential unsafe browser API references:\n`);
    
    results.forEach(result => {
      console.log(`File: ${result.filePath.replace(rootDir, '')}`);
      result.issues.forEach(issue => {
        console.log(`  - ${issue.pattern}: ${issue.matches} occurrences`);
      });
      console.log('');
    });

    console.log('These files may cause static generation errors during Vercel deployment.');
    console.log('Consider adding safety checks like:');
    console.log('  - if (typeof window !== "undefined") { ... }');
    console.log('  - Using utility functions from utils/client-utils.ts');
    console.log('  - Adding "use client" directive to components that use browser APIs');
  }
}

main();
