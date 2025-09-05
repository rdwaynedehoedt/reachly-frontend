'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a global query client with email platform optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimized for email platforms - shorter stale times
      staleTime: 5000, // Consider data stale after 5 seconds
      gcTime: 30000, // Keep unused data for 30 seconds
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Background refetch when window regains focus
      refetchOnWindowFocus: true,
      // Refetch when reconnecting
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };
