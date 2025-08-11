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
  showMessage = true 
}: LoadingAnimationProps) {
  const sizeConfig = {
    small: {
      container: 'w-20 h-20',
      logo: 'h-8 w-auto',
      text: 'text-sm',
      dots: 'w-1 h-1'
    },
    medium: {
      container: 'w-32 h-32',
      logo: 'h-12 w-auto',
      text: 'text-base',
      dots: 'w-1.5 h-1.5'
    },
    large: {
      container: 'w-48 h-48',
      logo: 'h-16 w-auto',
      text: 'text-lg',
      dots: 'w-2 h-2'
    }
  };

  const config = sizeConfig[size];

  // Animation variants for the logo
  const logoVariants = {
    initial: { scale: 0.8, opacity: 0.7 },
    animate: { 
      scale: [0.8, 1.1, 0.8],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Animation for the outer ring
  const ringVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Animation for the dots
  const dotVariants = {
    animate: (i: number) => ({
      scale: [1, 1.5, 1],
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut"
      }
    })
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Main loading container */}
      <div className={`relative ${config.container} flex items-center justify-center`}>
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            background: 'conic-gradient(from 0deg, #1876d3, #60a5fa, #1876d3)',
            borderRadius: '50%',
          }}
          variants={ringVariants}
          animate="animate"
        >
          <div className="absolute inset-1 bg-white rounded-full"></div>
        </motion.div>

        {/* Inner pulsing background */}
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{ backgroundColor: '#f8fafc' }}
          animate={{
            backgroundColor: ['#f8fafc', '#e2e8f0', '#f8fafc'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>

        {/* Logo */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          variants={logoVariants}
          initial="initial"
          animate="animate"
        >
          <img
            src="/logo with no background.png"
            alt="Reachly"
            className={config.logo}
          />
        </motion.div>

        {/* Floating dots around the logo */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45) * (Math.PI / 180);
          const radius = size === 'small' ? 25 : size === 'medium' ? 35 : 50;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={i}
              className={`absolute ${config.dots} rounded-full`}
              style={{
                backgroundColor: '#1876d3',
                left: '50%',
                top: '50%',
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
              }}
              variants={dotVariants}
              animate="animate"
              custom={i}
            />
          );
        })}
      </div>

      {/* Loading message */}
      {showMessage && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className={`${config.text} font-medium text-gray-700 mb-2`}>
            {message}
          </p>
          <motion.div
            className="flex items-center justify-center space-x-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-gray-400 rounded-full"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Pre-built variants for common use cases
export const LoadingScreen = ({ message }: { message?: string }) => (
  <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
    <LoadingAnimation message={message} size="large" />
  </div>
);

export const LoadingOverlay = ({ message }: { message?: string }) => (
  <div className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-40 flex items-center justify-center">
    <LoadingAnimation message={message} size="medium" />
  </div>
);

export const InlineLoading = ({ message, size = 'small' }: { message?: string; size?: 'small' | 'medium' }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingAnimation message={message} size={size} />
  </div>
);
