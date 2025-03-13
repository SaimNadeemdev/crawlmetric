"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKeywordsForSite } from "@/lib/dataforseo-keywords-api";

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';


// Copy of the flattenApiResponse function from keyword-research-results.tsx
const flattenApiResponse = (data: any) => {
  console.log("Flattening API response:", typeof data, Array.isArray(data));
  
  // If data is already an array, check if it contains items property
  if (Array.isArray(data)) {
    console.log("Data is an array with", data.length, "items");
    
    // Check if the first item has an 'items' property (common for Keywords for Site)
    if (data.length > 0 && data[0] && data[0].items && Array.isArray(data[0].items)) {
      console.log("First item has items array with", data[0].items.length, "items");
      return data[0].items;
    }
    
    return data;
  }
  
  // If data is an object with tasks property
  if (data && data.tasks && Array.isArray(data.tasks)) {
    console.log("Data has tasks array with", data.tasks.length, "tasks");
    
    // Flatten all tasks and their results
    const flattenedData = data.tasks.flatMap((task: any) => {
      // First check if task.result[0] has items property (for Keywords for Site mode)
      if (task.result && Array.isArray(task.result) && task.result.length > 0 && task.result[0].items) {
        console.log("Task has result[0].items array with", task.result[0].items.length, "items");
        return task.result[0].items;
      }
      // Then check if task.result has items property (for Keywords for Site mode)
      else if (task.result && task.result.items && Array.isArray(task.result.items)) {
        console.log("Task has result.items array with", task.result.items.length, "items");
        return task.result.items;
      }
      // Then check if task.result is an array
      else if (task.result && Array.isArray(task.result)) {
        console.log("Task has result array with", task.result.length, "items");
        return task.result;
      }
      // If neither, return empty array
      return [];
    });
    
    console.log("Flattened data has", flattenedData.length, "items");
    return flattenedData;
  }
  
  // If data is not in expected format, return empty array
  console.log("Data is not in expected format, returning empty array");
  return [];
};

export default function DebugPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any>(null);
  const [processedData, setProcessedData] = useState<any[]>([]);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test with a simple domain
      const data = await getKeywordsForSite("example.com", "United States", "English", 10);
      console.log("Raw API response:", data);
      setRawData(data);

      // Process the data as the KeywordResearchResults component would
      if (data) {
        // Log the structure before flattening
        console.log("Data structure before flattening:", JSON.stringify(data, null, 2).substring(0, 1000) + "...");
        
        // Flatten the API response
        const flattened = flattenApiResponse(data);
        console.log("Flattened data:", flattened);
        
        // Process the data to normalize field names and structure
        const processed = flattened.map((item: any) => {
          console.log("Processing item:", JSON.stringify(item, null, 2));
          
          // Create a normalized item with common fields
          const normalizedItem: any = {};
          
          // Extract basic fields
          normalizedItem.keyword = item.keyword || "";
          
          // Extract position (rank) from the item
          normalizedItem.position = item.position || 0;
          
          // Extract search volume from keyword_info if available
          if (item.keyword_info && item.keyword_info.search_volume) {
            normalizedItem.search_volume = item.keyword_info.search_volume;
          } else {
            normalizedItem.search_volume = "N/A";
          }
          
          // Extract traffic (estimated visits)
          normalizedItem.traffic = item.traffic || 0;
          
          // Extract SEO difficulty - use keyword_difficulty as the field name to match the table component
          if (item.keyword_properties && item.keyword_properties.keyword_difficulty) {
            normalizedItem.keyword_difficulty = item.keyword_properties.keyword_difficulty;
            console.log(`[Debug] Using keyword_properties.keyword_difficulty: ${normalizedItem.keyword_difficulty}`);
          } else if (item.keyword_info && item.keyword_info.keyword_difficulty) {
            normalizedItem.keyword_difficulty = item.keyword_info.keyword_difficulty;
            console.log(`[Debug] Using keyword_info.keyword_difficulty: ${normalizedItem.keyword_difficulty}`);
          } else {
            // If no difficulty is available, set to 50 (Medium) as a default
            normalizedItem.keyword_difficulty = 50;
            console.log(`[Debug] No difficulty found, using default: ${normalizedItem.keyword_difficulty}`);
          }
          
          // Extract competition data
          if (item.keyword_info) {
            normalizedItem.competition = item.keyword_info.competition || "N/A";
            normalizedItem.competition_level = item.keyword_info.competition_level || "N/A";
            normalizedItem.cpc = item.keyword_info.cpc || "N/A";
          }
          
          // Extract URL
          normalizedItem.url = item.url || "N/A";
          
          console.log("Normalized item:", normalizedItem);
          return normalizedItem;
        });
        
        setProcessedData(processed);
      }
    } catch (err) {
      console.error("Error in debug test:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Debug Keywords for Site</h1>
      
      <Button 
        onClick={runTest} 
        disabled={loading}
        className="mb-8"
      >
        {loading ? "Testing..." : "Run Test"}
      </Button>
      
      {error && (
        <Card className="mb-8 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </CardContent>
        </Card>
      )}
      
      {rawData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Raw API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px]">
              <pre className="text-xs">{JSON.stringify(rawData, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
      
      {processedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processed Data ({processedData.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px]">
              <pre className="text-xs">{JSON.stringify(processedData, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
