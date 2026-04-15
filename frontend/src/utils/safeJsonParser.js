// frontend/src/utils/safeJsonParser.js

/**
 * Safe JSON parsing utilities to prevent crashes from invalid JSON
 */

/**
 * Safely parse JSON with comprehensive error handling
 * @param {string} jsonString - The JSON string to parse
 * @param {any} fallback - Default value if parsing fails
 * @param {string} context - Context for error logging
 * @returns {any} Parsed JSON or fallback value
 */
export const safeJsonParse = (jsonString, fallback = null, context = 'Unknown') => {
  if (typeof jsonString !== 'string') {
    console.warn(`[${context}] Input is not a string:`, typeof jsonString);
    return fallback;
  }

  if (!jsonString || jsonString.trim() === '') {
    console.warn(`[${context}] Empty string provided`);
    return fallback;
  }

  const trimmed = jsonString.trim();

  const invalidPatterns = [
    'You need to enable JavaScript',
    'You need t',
    'You need to sign in',
    'Service Unavailable', 
    '<!DOCTYPE html',
    '<html',
    'SyntaxError',
    'Unexpected token',
    'Sign in wi',
    'onrender.com',
    'render.com'
  ];

  for (const pattern of invalidPatterns) {
    if (trimmed.includes(pattern)) {
      console.warn(`[${context}] Detected invalid pattern "${pattern}" in JSON string`);
      return fallback;
    }
  }

  // Check if it looks like JSON
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[') && !trimmed.startsWith('"')) {
    console.warn(`[${context}] String doesn't look like JSON:`, trimmed.substring(0, 50));
    return fallback;
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    console.error(`[${context}] JSON parse error:`, error.message);
    console.error(`[${context}] Raw content:`, trimmed.substring(0, 200));
    return fallback;
  }
};

/**
 * Safely parse localStorage data with corruption detection
 * @param {string} key - localStorage key
 * @param {any} fallback - Default value if parsing fails
 * @returns {any} Parsed data or fallback value
 */
export const safeLocalStorageParse = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;

// Check for corruption patterns
    const corruptedPatterns = [
      'You need to enable JavaScript',
      'You need t',
      'You need to sign in',
      'Service Unavailable', 
      '<!DOCTYPE html',
      '<html',
      'SyntaxError',
      'Unexpected token',
      'Sign in wi',
      // Render
      'onrender.com',
      'render.com'
    ];

    for (const pattern of corruptedPatterns) {
      if (item.includes(pattern)) {
        console.warn(`Corrupted data detected in localStorage key "${key}", removing...`);
        localStorage.removeItem(key);
        return fallback;
      }
    }

    return safeJsonParse(item, fallback, `localStorage-${key}`);
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    localStorage.removeItem(key);
    return fallback;
  }
};

/**
 * Safely set localStorage data with JSON stringification
 * @param {string} key - localStorage key
 * @param {any} value - Value to store
 * @returns {boolean} Success status
 */
export const safeLocalStorageSet = (key, value) => {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
      return true;
    }

    const jsonString = JSON.stringify(value);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Clear all corrupted localStorage data
 */
export const clearCorruptedLocalStorage = () => {
  const keysToCheck = ['user', 'token', 'auth', 'firebase'];
  const corruptedKeys = [];

  // Check specific keys
  keysToCheck.forEach(key => {
    try {
      const item = localStorage.getItem(key);
if (item && (
        item.includes('You need to enable JavaScript') ||
        item.includes('You need t') ||
        item.includes('You need to sign in') ||
        item.includes('Service Unavailable') ||
        item.includes('<!DOCTYPE') ||
        item.includes('<html') ||
        item.includes('SyntaxError') ||
        item.includes('Unexpected token') ||
        item.includes('Sign in wi') ||
        item.includes('onrender.com')
      )) {
        corruptedKeys.push(key);
      }
    } catch (error) {
      corruptedKeys.push(key);
    }
  });

  // Check all keys
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const item = localStorage.getItem(key);
        if (item && (
          item.includes('You need to enable JavaScript') ||
          item.includes('You need t') ||
          item.includes('<!DOCTYPE') ||
          item.includes('<html') ||
          item.includes('Sign in wi')
        )) {
          corruptedKeys.push(key);
        }
      }
    }
  } catch (error) {
    console.error('Error checking localStorage for corruption:', error);
  }

  // Remove corrupted keys
  corruptedKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      console.log(`Removed corrupted key: ${key}`);
    } catch (error) {
      console.error(`Error removing key ${key}:`, error);
    }
  });

  if (corruptedKeys.length > 0) {
    console.log(`Cleared ${corruptedKeys.length} corrupted localStorage keys`);
  }

  return corruptedKeys.length;
};

/**
 * Safe response parsing for API calls
 * @param {Response} response - Fetch response object
 * @param {any} fallback - Default value if parsing fails
 * @returns {Promise<any>} Parsed response data
 */
export const safeResponseParse = async (response, fallback = null) => {
  try {
    const text = await response.text();
    return safeJsonParse(text, fallback, `response-${response.url}`);
  } catch (error) {
    console.error('Error parsing response:', error);
    return fallback;
  }
};

const safeJsonParser = {
  safeJsonParse,
  safeLocalStorageParse,
  safeLocalStorageSet,
  clearCorruptedLocalStorage,
  safeResponseParse
};
export default safeJsonParser;
