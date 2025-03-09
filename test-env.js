// Script to test if environment variables are loaded correctly
// No need to require dotenv as Next.js handles this

console.log('Testing environment variables:');
console.log('- Process env keys:', Object.keys(process.env).filter(key => key.includes('DATAFORSEO')));
console.log('- DATAFORSEO_LOGIN exists:', !!process.env.DATAFORSEO_LOGIN);
console.log('- DATAFORSEO_PASSWORD exists:', !!process.env.DATAFORSEO_PASSWORD);

if (process.env.DATAFORSEO_LOGIN) {
  console.log('- DATAFORSEO_LOGIN first 4 chars:', process.env.DATAFORSEO_LOGIN.substring(0, 4) + '...');
}

if (process.env.DATAFORSEO_PASSWORD) {
  console.log('- DATAFORSEO_PASSWORD first 4 chars:', process.env.DATAFORSEO_PASSWORD.substring(0, 4) + '...');
}

console.log('Environment test complete');
