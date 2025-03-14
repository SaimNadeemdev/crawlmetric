const fs = require('fs');
const path = require('path');

function addDynamicExport(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      addDynamicExport(fullPath);
    } else if (file.name === 'route.ts') {
      console.log(`Processing: ${fullPath}`);
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if dynamic export already exists
      if (!content.includes("export const dynamic = 'force-dynamic'")) {
        // Add dynamic export at the beginning of the file
        content = "export const dynamic = 'force-dynamic';\n\n" + content;
        fs.writeFileSync(fullPath, content);
        console.log(`Added dynamic export to: ${fullPath}`);
      } else {
        console.log(`Dynamic export already exists in: ${fullPath}`);
      }
    }
  }
}

const apiDirectory = path.join(process.cwd(), 'app', 'api');
console.log(`Starting to add dynamic exports to API routes in: ${apiDirectory}`);
addDynamicExport(apiDirectory);
console.log('Finished adding dynamic exports to API routes.');
