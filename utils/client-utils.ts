/**
 * Utility functions for handling client-side code during server-side rendering
 */

// Import the safe utilities from lib/client-utils.ts
import {
  isBrowser,
  safeDocument,
  safeWindow,
  downloadFile as libDownloadFile,
  setCookie as libSetCookie,
  getCookie,
  eraseCookie,
  createTag
} from '../lib/client-utils';

// Re-export the utilities from lib/client-utils.ts
export {
  isBrowser,
  safeDocument,
  safeWindow,
  getCookie,
  eraseCookie,
  createTag
};

// Check if code is running on the client side (for backward compatibility)
export const isClient = isBrowser;

// Safe way to access document object (for backward compatibility)
export const getDocument = safeDocument;

// Safe way to access window object (for backward compatibility)
export const getWindow = safeWindow;

// Create a DOM element safely (only on client)
export const createDomElement = (tag: string, attributes: Record<string, string> = {}, parent: HTMLElement | null = null) => {
  if (!isBrowser) return null;
  
  const element = createTag(tag, attributes);
  
  // Append to parent if provided
  if (parent && element) {
    parent.appendChild(element);
  }
  
  return element;
};

// Download a file safely (only on client) - use the lib implementation
export const downloadFile = libDownloadFile;

// Set a cookie safely (only on client) - use the lib implementation
export const setCookie = libSetCookie;

/**
 * Safely adds a style element to the document head on the client side
 * @param styles CSS styles as a string
 * @returns Cleanup function to remove the style element
 */
export const addStyleToHead = (styles: string): (() => void) => {
  if (!isBrowser) {
    console.warn('addStyleToHead called during server rendering');
    return () => {}; // No-op for SSR
  }
  
  // Create style element
  const styleEl = createTag('style') as HTMLStyleElement;
  if (styleEl) {
    styleEl.innerHTML = styles;
    const doc = safeDocument();
    if (doc && doc.head) {
      doc.head.appendChild(styleEl);

      // Return cleanup function
      return () => {
        if (doc.head.contains(styleEl)) {
          doc.head.removeChild(styleEl);
        }
      };
    }
  }
  return () => {};
};

/**
 * Safely copy text to clipboard on the client side
 * @param text Text to copy to clipboard
 * @returns Boolean indicating success
 */
export const copyToClipboard = (text: string): boolean => {
  if (!isBrowser) return false;
  
  try {
    const win = safeWindow();
    if (win && win.navigator && win.navigator.clipboard) {
      win.navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};
