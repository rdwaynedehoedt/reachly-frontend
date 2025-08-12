'use client';

import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="flex items-center space-x-4">
        <img 
          src="/logo with no background no nae just logo.png" 
          alt="Reachly Logo" 
          className="h-12 w-auto animate-pulse"
        />
        <span className="text-2xl font-bold text-blue-600">Reachly</span>
      </div>
      
      <div className="mt-8 flex flex-col items-center">
        {/* Loading spinner */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        
        {/* Loading message */}
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
