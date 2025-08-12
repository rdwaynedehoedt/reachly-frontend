'use client';

import React from 'react';

interface PoweredByFooterProps {
  className?: string;
}

export const PoweredByFooter: React.FC<PoweredByFooterProps> = ({ 
  className = "" 
}) => {
  return (
    <div className={`fixed bottom-4 right-4 z-10 ${className}`}>
      <p className="text-xs text-gray-400">
        Powered by{' '}
        <a
          href="https://t3xlk.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-600"
        >
          T3X LK
        </a>
      </p>
    </div>
  );
};

export default PoweredByFooter;
