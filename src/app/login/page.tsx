'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    console.log(`Login with ${provider}`);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Form submitted:', { email, password, keepSignedIn });
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Login Form (60%) */}
      <div className="flex-[3] flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center">
            <img 
              src="/logo with no background.png" 
              alt="Reachly Logo" 
              className="h-10 w-auto mr-3"
            />
            <span className="text-xl font-bold" style={{ color: '#1876d3' }}>Reachly</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="font-medium transition-colors duration-200 hover:underline"
                  style={{ color: '#1876d3' }}
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Social Login Options */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 font-medium transition-all duration-200 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Log in with Google
              </button>

              <button
                onClick={() => handleSocialLogin('microsoft')}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 font-medium transition-all duration-200 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                  <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                Log in with Microsoft
              </button>

              <button
                onClick={() => handleSocialLogin('organization')}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 font-medium transition-all duration-200 disabled:opacity-50"
              >
                <KeyIcon className="w-5 h-5 mr-3" />
                Log in with your Organization
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Work Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#1876d3' } as React.CSSProperties}
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#1876d3' } as React.CSSProperties}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-bold py-3 px-4 rounded-md transition-all duration-200 disabled:opacity-50 hover:shadow-lg transform hover:scale-[1.02]"
                style={{ backgroundColor: '#1876d3' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1876d3'}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Logging In...
                  </div>
                ) : (
                  'Log In'
                )}
              </button>

              {/* Keep signed in & Forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="h-4 w-4 border-gray-300 rounded"
                    style={{ accentColor: '#1876d3' }}
                  />
                  <span className="ml-2 text-gray-600">Keep me signed in</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="transition-colors duration-200 hover:underline"
                  style={{ color: '#1876d3' }}
                >
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-xs text-gray-500">
          2025 All Rights Reserved.{' '}
          <Link href="/privacy" className="hover:text-gray-700">Privacy</Link> and{' '}
          <Link href="/terms" className="hover:text-gray-700">Terms</Link>.
        </div>
      </div>

      {/* Right Panel - Product Preview (40%) */}
      <div className="flex-[2] relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-20 h-20 rounded-full opacity-20 animate-float" style={{ backgroundColor: '#1876d3' }}></div>
        <div className="absolute top-40 left-10 w-32 h-32 rounded-full opacity-15 animate-float" style={{ backgroundColor: '#1876d3', animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 rounded-full opacity-25 animate-float" style={{ backgroundColor: '#1876d3', animationDelay: '2s' }}></div>
        
        {/* Paper Plane Animation */}
        <div className="absolute top-20 left-1/4 animate-paper-plane">
          <div className="w-8 h-8 opacity-30" style={{ color: '#1876d3' }}>
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
          {/* Product Mockup */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8 transform rotate-2 hover:rotate-0 transition-all duration-500 hover:shadow-3xl max-w-sm">
            {/* Tabs */}
            <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
              <div className="flex-1 text-center py-2 bg-white rounded-md shadow-sm text-sm font-medium" style={{ color: '#1876d3' }}>Person</div>
              <div className="flex-1 text-center py-2 text-gray-500 text-sm hover:text-gray-700 cursor-pointer transition-colors">Company</div>
            </div>
            
            {/* Profile */}
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Sarah Chen</h3>
                <p className="text-gray-600 text-sm">VP of Sales at TechCorp</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full mt-2 text-xs font-medium" style={{ backgroundColor: '#e8f5e8', color: '#2d7d32' }}>
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#4caf50' }}></div>
                  95 Excellent match
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button className="bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5">
                  Add to list
                </button>
                <button className="px-3 py-2 rounded-lg text-xs font-medium text-white transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5" style={{ backgroundColor: '#1876d3' }}>
                  Add to Sequence
                </button>
                <button className="bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5">
                  Compose email
                </button>
              </div>
              
              {/* Contact details */}
              <div className="text-xs text-gray-600 space-y-2 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">✉️</span>
                  <span>sarah.chen@techcorp.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">📱</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 pt-1">
                  <span className="text-blue-600 cursor-pointer hover:scale-110 transition-transform">🔗</span>
                  <span className="text-blue-700 cursor-pointer hover:scale-110 transition-transform">💼</span>
                  <span className="text-gray-600 cursor-pointer hover:scale-110 transition-transform">🌐</span>
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Text */}
          <div className="text-center max-w-md">
            <div className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              800,000+
            </div>
            <p className="text-gray-700 mb-8 leading-relaxed text-lg">
              Salespeople and marketers use our extension to prospect, connect, and convert leads faster.
            </p>
            
            {/* CTA Button */}
            <button className="bg-white text-gray-700 px-8 py-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 group">
              <div className="flex items-center space-x-3">
                <img 
                  src="/logo with no background.png" 
                  alt="Reachly" 
                  className="h-5 w-auto group-hover:scale-110 transition-transform duration-300"
                />
                <span>Get Reachly Chrome Extension</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
