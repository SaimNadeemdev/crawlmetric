// Authentication utilities for DataForSEO API

export function getAuthHeader(): string | null {
  // Get credentials from environment variables
  const username = process.env.DATAFORSEO_USERNAME || '';
  const password = process.env.DATAFORSEO_PASSWORD || '';
  
  if (!username || !password) {
    console.error('DataForSEO API credentials not configured');
    return null;
  }
  
  // Create Basic Auth header
  try {
    // For Node.js environment
    const credentials = `${username}:${password}`;
    // Use Buffer in Node.js environment
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(credentials).toString('base64');
    }
    // Fallback for browser environment
    return btoa(credentials);
  } catch (error) {
    console.error('Error creating auth header:', error);
    return null;
  }
}
