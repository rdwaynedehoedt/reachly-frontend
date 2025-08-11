'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showMessage?: boolean;
}

export default function LoadingAnimation({ 
  message = "Loading...", 
  size = 'medium',
  showMessage = false 
}: LoadingAnimationProps) {
  const sizeConfig = {
    small: {
      logo: 'h-16 w-auto',
      text: 'text-sm'
    },
    medium: {
      logo: 'h-24 w-auto',
      text: 'text-base'
    },
    large: {
      logo: 'h-32 w-auto',
      text: 'text-lg'
    }
  };

  const config = sizeConfig[size];

  // Simple fade in animation for the logo
  const logoVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Simple animated logo */}
      <motion.div
        className="flex items-center justify-center"
        variants={logoVariants}
        initial="initial"
        animate="animate"
      >
        <img
          src="/png-animated-unscreen.gif"
          alt="Reachly Loading"
          className={config.logo}
        />
      </motion.div>

      {/* Optional loading message */}
      {showMessage && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className={`${config.text} font-medium text-gray-700`}>
            {message}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// Pre-built variants for common use cases
export const LoadingScreen = ({ message }: { message?: string }) => (
  <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
    <LoadingAnimation message={message} size="large" showMessage={false} />
  </div>
);

export const LoadingOverlay = ({ message }: { message?: string }) => (
  <div className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-40 flex items-center justify-center">
    <LoadingAnimation message={message} size="medium" showMessage={false} />
  </div>
);

export const InlineLoading = ({ message, size = 'small' }: { message?: string; size?: 'small' | 'medium' }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingAnimation message={message} size={size} showMessage={!!message} />
  </div>
);
