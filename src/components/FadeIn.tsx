'use client';

import { useEffect, useState } from 'react';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'scale' | 'none';
  duration?: number;
  className?: string;
}

export default function FadeIn({ 
  children, 
  delay = 0, 
  direction = 'up', 
  duration = 600,
  className = '' 
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'translateY(20px)';
        case 'scale':
          return 'scale(0.95)';
        default:
          return 'translateY(10px)';
      }
    }
    return 'translateY(0) scale(1)';
  };

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      {children}
    </div>
  );
}