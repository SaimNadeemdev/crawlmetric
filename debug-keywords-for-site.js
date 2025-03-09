// Debug script for Keywords for Site functionality

async function testKeywordsForSite() {
  try {
    const baseUrl = 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/dataforseo`;
    
    console.log('Making request to DataForSEO API via:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: '/dataforseo_labs/google/keywords_for_site/live',
        data: [
          {
            target: 'example.com',
            location_name: 'United States',
            language_name: 'English',
            limit: 5,
            include_serp_info: true,
            include_subdomains: true,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response error:', response.status, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    // Log the full response structure
    console.log('API response structure:', JSON.stringify(result, null, 2));
    
    // Log the data that would be used by the UI
    if (result.data && Array.isArray(result.data)) {
      console.log('Number of items:', result.data.length);
      
      if (result.data.length > 0) {
        console.log('First item structure:', JSON.stringify(result.data[0], null, 2));
        
        // Check for nested keyword_info
        if (result.data[0].keyword_info) {
          console.log('keyword_info structure:', JSON.stringify(result.data[0].keyword_info, null, 2));
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error testing keywords for site:', error);
    throw error;
  }
}

// Run the test
testKeywordsForSite()
  .then(() => console.log('Test completed'))
  .catch(error => console.error('Test failed:', error));
