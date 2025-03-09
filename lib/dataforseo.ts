"use server"

// DataForSEO API credentials
const API_LOGIN = process.env.DATAFORSEO_USERNAME || "saim@makewebeasy.llc"
const API_PASSWORD = process.env.DATAFORSEO_PASSWORD || "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

// Helper function for making API requests
export async function getRequestData(endpoint: string, data: any) {
  try {
    // Always use v3 prefix as shown in the documentation
    const url = `https://api.dataforseo.com/v3/${endpoint}`

    console.log(`[SERVER] Making request to: ${url}`)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${AUTH_HEADER}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`DataForSEO API error: ${response.status} ${errorText}`)
      throw new Error(`API error: ${response.status} ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("DataForSEO API request failed:", error)
    throw error
  }
}

