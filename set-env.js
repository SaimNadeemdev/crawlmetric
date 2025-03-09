// Script to check and set environment variables
const fs = require('fs');
const path = require('path');

// Path to the .env.local file
const envFilePath = path.join(__dirname, '.env.local');

// Check if the file exists
if (fs.existsSync(envFilePath)) {
  console.log('.env.local file exists');
  
  // Read the file content
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  
  // Check if the file contains the required variables
  const hasLogin = envContent.includes('DATAFORSEO_LOGIN=');
  const hasPassword = envContent.includes('DATAFORSEO_PASSWORD=');
  
  console.log('Environment variables check:');
  console.log('- DATAFORSEO_LOGIN exists:', hasLogin);
  console.log('- DATAFORSEO_PASSWORD exists:', hasPassword);
  
  // Create a new content with the correct variables if needed
  let newContent = envContent;
  
  // Update the content with the provided credentials
  if (!hasLogin) {
    console.log('Adding DATAFORSEO_LOGIN to .env.local');
    newContent += '\nDATAFORSEO_LOGIN=saim@makewebeasy.llc';
  }
  
  if (!hasPassword) {
    console.log('Adding DATAFORSEO_PASSWORD to .env.local');
    newContent += '\nDATAFORSEO_PASSWORD=af0929d9a9ee7cad';
  }
  
  // Write the updated content back to the file if changes were made
  if (newContent !== envContent) {
    fs.writeFileSync(envFilePath, newContent);
    console.log('.env.local file updated with the required variables');
  } else {
    console.log('No changes needed to .env.local');
  }
} else {
  console.log('.env.local file does not exist, creating it...');
  
  // Create the file with the required variables
  const envContent = `DATAFORSEO_LOGIN=saim@makewebeasy.llc
DATAFORSEO_PASSWORD=af0929d9a9ee7cad`;
  
  fs.writeFileSync(envFilePath, envContent);
  console.log('.env.local file created with the required variables');
}

console.log('Environment setup complete');
