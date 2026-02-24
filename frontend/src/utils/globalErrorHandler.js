// frontend/src/utils/globalErrorHandler.js

/**
 * Global error handler to catch JSON parsing errors and prevent app crashes
 */

import { clearCorruptedLocalStorage } from './safeJsonParser';

// Global error handler for JSON parsing errors
export const setupGlobalErrorHandler = () => {
  const handleError = (event) => {
    const error = event.error || event.reason;
    
    if (error && error.message) {
      const errorMessage = error.message;
      
      // Check for JSON parsing related errors
      if (
        errorMessage.includes('JSON') ||
        errorMessage.includes('Unexpected token') ||
        errorMessage.includes('You need t') ||
        errorMessage.includes('is not valid JSON') ||
        errorMessage.includes('SyntaxError')
      ) {
        console.warn('🛡️ Global JSON parsing error caught:', errorMessage);
        console.warn('📍 Error source:', event.filename || 'unknown', 'Line:', event.lineno || 'unknown');
        
        // Clear corrupted localStorage data
        const clearedKeys = clearCorruptedLocalStorage();
        
        if (clearedKeys > 0) {
          console.log(`🧹 Cleared ${clearedKeys} corrupted localStorage keys`);
          
          // Show user-friendly message (optional)
          if (typeof window !== 'undefined' && window.alert) {
            console.log('🔄 App data was corrupted and has been cleared. Please refresh the page.');
          }
        }
        
        // Prevent error from crashing app
        event.preventDefault();
        return true;
      }
    }
    
    return false;
  };

  // Handle synchronous errors (including window.onload)
  window.addEventListener('error', handleError);
  
  // Handle asynchronous errors (Promise rejections)
  window.addEventListener('unhandledrejection', handleError);
  
  // Handle window.onload specifically
  const originalOnload = window.onload;
  window.onload = function(event) {
    try {
      if (originalOnload) {
        return originalOnload.call(this, event);
      }
    } catch (error) {
      if (error.message && (
        error.message.includes('JSON') ||
        error.message.includes('Unexpected token') ||
        error.message.includes('You need t')
      )) {
        console.warn('🛡️ window.onload JSON error caught:', error.message);
        clearCorruptedLocalStorage();
        event.preventDefault();
        return;
      }
      throw error;
    }
  };
  
  // Cleanup function
  return () => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleError);
  };
};

// Export for use in App.jsx or main entry point
export default setupGlobalErrorHandler;
