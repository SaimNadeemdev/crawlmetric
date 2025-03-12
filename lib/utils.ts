import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number | undefined | null): string {
  if (input === undefined || input === null || input === "") {
    return "Unknown date";
  }
  
  try {
    // Handle various date formats and edge cases
    let date: Date | null = null;
    
    if (typeof input === 'string') {
      // First try direct parsing
      const directDate = new Date(input);
      if (!isNaN(directDate.getTime())) {
        date = directDate;
      } else {
        // Try parsing as timestamp
        const timestamp = parseInt(input, 10);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        }
      }
    } else if (typeof input === 'number') {
      // If it's already a number, treat as timestamp
      date = new Date(input);
    }
    
    // If we have a valid date, format it
    if (date && !isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    
    // If we get here, the date is invalid
    console.warn("Invalid date format:", input);
    return "Unknown date";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown date";
  }
}

/**
 * Format a date as a relative time (e.g., "2 days ago")
 * Safely handles various date formats and invalid dates
 */
export function formatTimeAgo(input: string | number | undefined | null): string {
  if (input === undefined || input === null || input === "") {
    return "Unknown date";
  }
  
  try {
    // Handle various date formats and edge cases
    let date: Date | null = null;
    
    if (typeof input === 'string') {
      // First try direct parsing
      const directDate = new Date(input);
      if (!isNaN(directDate.getTime())) {
        date = directDate;
      } else {
        // Try parsing as timestamp
        const timestamp = parseInt(input, 10);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        }
      }
    } else if (typeof input === 'number') {
      // If it's already a number, treat as timestamp
      date = new Date(input);
    }
    
    // If we have a valid date, format it
    if (date && !isNaN(date.getTime())) {
      // Calculate time difference in milliseconds
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      // Convert to appropriate time units
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);
      
      if (years > 0) {
        return years === 1 ? "1 year ago" : `${years} years ago`;
      } else if (months > 0) {
        return months === 1 ? "1 month ago" : `${months} months ago`;
      } else if (days > 0) {
        return days === 1 ? "1 day ago" : `${days} days ago`;
      } else if (hours > 0) {
        return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
      } else if (minutes > 0) {
        return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
      } else {
        return "just now";
      }
    }
    
    // If we get here, the date is invalid
    console.warn("Invalid date format for time ago:", input);
    return "Unknown date";
  } catch (error) {
    console.error("Error formatting time ago:", error);
    return "Unknown date";
  }
}

/**
 * Format a date with a specific format pattern
 * Safely handles various date formats and invalid dates
 */
export function formatDateWithPattern(input: string | number | undefined | null, pattern: string): string {
  if (input === undefined || input === null || input === "") {
    return "Unknown date";
  }
  
  try {
    // Handle various date formats and edge cases
    let date: Date | null = null;
    
    if (typeof input === 'string') {
      // First try direct parsing
      const directDate = new Date(input);
      if (!isNaN(directDate.getTime())) {
        date = directDate;
      } else {
        // Try parsing as timestamp
        const timestamp = parseInt(input, 10);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        }
      }
    } else if (typeof input === 'number') {
      // If it's already a number, treat as timestamp
      date = new Date(input);
    }
    
    // If we have a valid date, format it according to the pattern
    if (date && !isNaN(date.getTime())) {
      const options: Intl.DateTimeFormatOptions = {};
      
      if (pattern.includes('yyyy')) {
        options.year = 'numeric';
      } else if (pattern.includes('yy')) {
        options.year = '2-digit';
      }
      
      if (pattern.includes('MMMM')) {
        options.month = 'long';
      } else if (pattern.includes('MMM')) {
        options.month = 'short';
      } else if (pattern.includes('MM')) {
        options.month = '2-digit';
      } else if (pattern.includes('M')) {
        options.month = 'numeric';
      }
      
      if (pattern.includes('dd')) {
        options.day = '2-digit';
      } else if (pattern.includes('d')) {
        options.day = 'numeric';
      }
      
      if (pattern.includes('hh') || pattern.includes('HH')) {
        options.hour = '2-digit';
      } else if (pattern.includes('h') || pattern.includes('H')) {
        options.hour = 'numeric';
      }
      
      if (pattern.includes('mm')) {
        options.minute = '2-digit';
      } else if (pattern.includes('m')) {
        options.minute = 'numeric';
      }
      
      if (pattern.includes('ss')) {
        options.second = '2-digit';
      } else if (pattern.includes('s')) {
        options.second = 'numeric';
      }
      
      if (pattern.includes('a')) {
        options.hour12 = true;
      }
      
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
    
    // If we get here, the date is invalid
    console.warn("Invalid date format for pattern formatting:", input);
    return "Unknown date";
  } catch (error) {
    console.error("Error formatting date with pattern:", error);
    return "Unknown date";
  }
}

export function formatNumber(input: number): string {
  return new Intl.NumberFormat().format(input)
}

export function formatCurrency(input: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(input)
}

export function truncateText(input: string, length: number): string {
  if (input.length <= length) return input
  return `${input.substring(0, length)}...`
}

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Client-side: use the current window location origin
    // This ensures we use whatever port the browser is currently on
    return window.location.origin
  }
  
  // Server-side
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  
  // For local development, try to detect if port 3000 is in use
  // This is a best effort approach - the most reliable solution is to use window.location.origin on the client
  try {
    // Default to 3000 but allow override via PORT env var
    const port = process.env.PORT || 3001 // Default to 3001 since 3000 seems to be in use
    return `http://localhost:${port}`
  } catch (e) {
    // Fallback to 3000 if anything goes wrong
    return "http://localhost:3000"
  }
}

/**
 * Checks if the DataForSEO API credentials are configured
 * Now always returns true since we have hardcoded credentials
 */
export function isDataForSeoConfigured(): boolean {
  return true
}

export function getDataForSeoCredentials() {
  // Return hardcoded DataForSEO API credentials
  return {
    login: "saim@makewebeasy.llc",
    password: "af0929d9a9ee7cad"
  }
}
