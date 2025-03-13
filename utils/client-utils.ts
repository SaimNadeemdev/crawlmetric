/**
 * Utility functions for handling client-side code during server-side rendering
 */

// Check if code is running on the client side
export const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';

// Safe way to access document object
export const getDocument = () => {
  if (isClient) {
    return document;
  }
  return null;
};

// Safe way to access window object
export const getWindow = () => {
  if (isClient) {
    return window;
  }
  return null;
};

// Create a DOM element safely (only on client)
export const createDomElement = (tag: string, attributes: Record<string, string> = {}, parent: HTMLElement | null = null) => {
  if (!isClient) return null;
  
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  // Append to parent if provided
  if (parent) {
    parent.appendChild(element);
  }
  
  return element;
};

// Download a file safely (only on client)
export const downloadFile = (content: string, fileName: string, contentType: string = 'text/plain') => {
  if (!isClient) return false;
  
  try {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    return false;
  }
};

// Set a cookie safely (only on client)
export const setCookie = (name: string, value: string, maxAge: number) => {
  if (!isClient) return false;
  
  try {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
    return true;
  } catch (error) {
    console.error('Error setting cookie:', error);
    return false;
  }
};
