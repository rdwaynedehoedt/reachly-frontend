'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProspectSearchInterface from '@/components/leads/ProspectSearchInterface';

export default function ProspectSearchPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Find Prospects</h1>
            <p className="mt-1 text-sm text-gray-600">
              Search ContactOut's database for qualified leads
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-green-600">200</span> email credits
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium text-blue-600">100</span> phone credits
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <ProspectSearchInterface />
    </div>
  );
}
