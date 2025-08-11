'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '@/components/ui';

export default function DashboardPage() {
  const { user, loading, isAuthenticated, needsOnboarding, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && isAuthenticated && needsOnboarding) {
      router.push('/onboarding');
    }
  }, [isAuthenticated, needsOnboarding, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img 
                src="/logo with no background no nae just logo.png" 
                alt="Reachly Logo" 
                className="h-8 w-auto mr-3"
              />
              <span className="text-xl font-bold" style={{ color: '#1876d3' }}>Reachly</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, {user?.firstName} {user?.lastName}
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
              
              {/* Welcome Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  🎉 Authentication Setup Complete!
                </h2>
                <p className="text-blue-700">
                  Your authentication system is working perfectly. You're now logged in as{' '}
                  <strong>{user?.email}</strong>.
                </p>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">User Information</h3>
                  <dl className="space-y-1">
                    <div>
                      <dt className="text-xs text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{user?.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Name</dt>
                      <dd className="text-sm text-gray-900">{user?.firstName} {user?.lastName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Account Status</dt>
                      <dd className="text-sm text-gray-900">
                        {user?.isVerified ? (
                          <span className="text-green-600">✅ Verified</span>
                        ) : (
                          <span className="text-yellow-600">⏳ Pending Verification</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Member Since</dt>
                      <dd className="text-sm text-gray-900">
                        {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Next Steps</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✅ Authentication system working</li>
                    <li>✅ User registration complete</li>
                    <li>⏳ Complete onboarding process</li>
                    <li>⏳ Set up your first campaign</li>
                    <li>⏳ Invite team members</li>
                  </ul>
                  <button
                    onClick={() => router.push('/onboarding')}
                    className="mt-4 w-full text-white font-medium py-2 px-4 rounded-md transition-colors"
                    style={{ backgroundColor: '#1876d3' }}
                  >
                    Start Onboarding
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}