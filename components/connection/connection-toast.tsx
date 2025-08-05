import React, { useEffect } from 'react';
import { useConnectionStore } from '../../stores/connection-store';

export const ConnectionToast: React.FC = () => {
  const { 
    showToast, 
    errorMessage, 
    hideConnectionToast,
    isOnline,
    isServerConnected,
    checkConnection
  } = useConnectionStore();

  // Check connection status when component mounts
  useEffect(() => {
    checkConnection();
    
    // Set up periodic connection checks
    const intervalId = setInterval(() => {
      checkConnection();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [checkConnection]);

  // Auto-hide toast after 5 seconds if we're back online
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (showToast && isOnline && isServerConnected) {
      timeoutId = setTimeout(() => {
        hideConnectionToast();
      }, 5000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showToast, isOnline, isServerConnected, hideConnectionToast]);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`rounded-md p-4 shadow-lg ${isOnline ? 'bg-yellow-50' : 'bg-red-50'}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {isOnline ? (
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${isOnline ? 'text-yellow-800' : 'text-red-800'}`}>
              {errorMessage}
            </p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={hideConnectionToast}
                className={`inline-flex rounded-md p-1.5 ${isOnline ? 'text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50' : 'text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50'}`}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};