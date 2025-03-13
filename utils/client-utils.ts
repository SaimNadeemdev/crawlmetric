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
