/**
 * Utility functions for safely handling client-side operations
 * These functions ensure that browser-specific APIs are only accessed in the client environment
 */

// Check if code is running in browser environment
export const isBrowser = typeof window !== 'undefined';

// Safely access window object
export function safeWindow() {
  return isBrowser ? window : undefined;
}

// Safely access document object
export function safeDocument() {
  return isBrowser ? document : undefined;
}

// Safely access localStorage
export function safeLocalStorage() {
  return isBrowser ? localStorage : undefined;
}

// Safely access sessionStorage
export function safeSessionStorage() {
  return isBrowser ? sessionStorage : undefined;
}

// Safely add event listener to window
export function safeWindowAddEventListener(
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) {
  if (isBrowser) {
    window.addEventListener(event, handler, options);
    return () => window.removeEventListener(event, handler, options);
  }
  return () => {};
}

// Safely get window dimensions
export function getWindowDimensions() {
  if (!isBrowser) {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

// Safely create an HTML element
export function createTag(tagName: string, attributes: Record<string, string> = {}) {
  if (!isBrowser) return null;
  
  try {
    const element = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  } catch (e) {
    console.error(`Error creating ${tagName} element:`, e);
    return null;
  }
}

// Safely download a file
export function downloadFile(content: string, fileName: string, contentType: string) {
  if (!isBrowser) return;
  
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = createTag('a', { href: url, download: fileName }) as HTMLAnchorElement;
  if (a) {
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Safely set a cookie
export function setCookie(name: string, value: string, days: number) {
  if (!isBrowser) return;
  
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/`;
}

// Safely get a cookie
export function getCookie(name: string) {
  if (!isBrowser) return '';
  
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return '';
}

// Safely delete a cookie
export function eraseCookie(name: string) {
  if (!isBrowser) return;
  
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

// Safely get window scroll position
export function safeGetWindowScrollY() {
  if (!isBrowser) {
    return 0;
  }
  return window.scrollY;
}

// Safely get window scroll X position
export function safeGetWindowScrollX() {
  if (!isBrowser) {
    return 0;
  }
  return window.scrollX;
}

// Safely access window.location object
export function safeGetWindowLocation() {
  if (!isBrowser) {
    // Return a mock location object when not in browser
    return {
      pathname: '',
      href: '',
      origin: '',
      host: '',
      hostname: '',
      protocol: '',
      search: '',
      hash: ''
    };
  }
  return window.location;
}

// Safely manipulate browser history
export function safeUpdateUrl(updateFn: (url: URL) => void) {
  if (!isBrowser) return;
  
  try {
    const url = new URL(window.location.href);
    updateFn(url);
    window.history.pushState({}, "", url);
  } catch (e) {
    console.error("Error updating URL:", e);
  }
}

// Safely access window.matchMedia
export function safeMatchMedia(query: string) {
  if (!isBrowser) return null;
  
  try {
    return window.matchMedia(query);
  } catch (e) {
    console.error('Error accessing window.matchMedia:', e);
    return null;
  }
}

// Safely reload the page
export function safeReloadPage() {
  if (!isBrowser) return;
  
  try {
    window.location.reload();
  } catch (e) {
    console.error('Error reloading page:', e);
  }
}

// Safely navigate to a different URL
export function safeNavigate(url: string) {
  if (!isBrowser) return;
  
  try {
    window.location.href = url;
  } catch (e) {
    console.error('Error navigating to URL:', e);
  }
}
