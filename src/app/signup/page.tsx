'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import FadeIn from '@/components/FadeIn';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialSignup = (provider: string) => {
    setIsLoading(true);
    console.log(`Signup with ${provider}`);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Form submitted:', { fullName, companyName, email, password });
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Clean Benefits (60%) */}
      <div className="flex-[3] bg-gray-50 flex flex-col justify-center items-center p-12">
        <FadeIn>
          <div className="text-center max-w-lg">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <img
                src="/logo with no background.png"
                alt="Reachly Logo"
                className="h-12 w-auto mr-3"
              />
              <span className="text-2xl font-bold" style={{ color: '#1876d3' }}>Reachly</span>
            </div>

            {/* Big Number */}
            <div className="text-6xl font-bold mb-6" style={{ color: '#1876d3' }}>
              800,000+
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Sales professionals trust Reachly
            </h1>

            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Find prospects, automate outreach, and close more deals with AI-powered sales tools.
            </p>

            {/* Clean Features List */}
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#1876d3' }}></div>
                <span className="text-gray-700">200M+ verified contacts</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#1876d3' }}></div>
                <span className="text-gray-700">AI-powered email sequences</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#1876d3' }}></div>
                <span className="text-gray-700">Chrome extension included</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#1876d3' }}></div>
                <span className="text-gray-700">Real-time tracking</span>
              </div>
            </div>

            {/* Simple Stats */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1876d3' }}>200M+</div>
                <div className="text-gray-600 text-sm">Contacts</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1876d3' }}>500K+</div>
                <div className="text-gray-600 text-sm">Companies</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1876d3' }}>99.5%</div>
                <div className="text-gray-600 text-sm">Uptime</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Right Panel - Simple Signup Form (40%) */}
      <div className="flex-[2] flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-sm">
          {/* Header */}
          <FadeIn delay={200}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/signin"
                  className="font-medium transition-colors duration-200 hover:underline"
                  style={{ color: '#1876d3' }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </FadeIn>

          {/* Social Signup Options */}
          <FadeIn delay={300}>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialSignup('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 font-medium transition-all duration-200 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => handleSocialSignup('microsoft')}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 font-medium transition-all duration-200 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                  <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                Continue with Microsoft
              </button>
            </div>
          </FadeIn>

          {/* Divider */}
          <FadeIn delay={400}>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
          </FadeIn>

          {/* Email Signup Form */}
          <FadeIn delay={500}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#1876d3' } as React.CSSProperties}
                  required
                />
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Company (Optional)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#1876d3' } as React.CSSProperties}
                />
              </div>
              
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
                  placeholder="Create Password"
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
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </FadeIn>

          {/* Footer */}
          <FadeIn delay={600}>
            <div className="mt-6 text-xs text-gray-500 text-center">
              <p>
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="transition-colors duration-200 hover:underline" style={{ color: '#1876d3' }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="transition-colors duration-200 hover:underline" style={{ color: '#1876d3' }}>
                  Privacy Policy
                </Link>
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}