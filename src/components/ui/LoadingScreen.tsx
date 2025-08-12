'use client';

import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <img 
        src="/png-animated-unscreen.gif" 
        alt="Loading..." 
        className="h-24 w-auto"
      />
    </div>
  );
};

export default LoadingScreen;
