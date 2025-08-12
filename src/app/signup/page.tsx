'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import FadeIn from '@/components/FadeIn';
import { useAuth } from '../../contexts/AuthContext';
import SimpleGoogleButton from '../../components/ui/SimpleGoogleButton';
import { InlineLoading } from '@/components/ui/LoadingAnimation';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup, googleLogin } = useAuth();
  const router = useRouter();

  const handleGoogleSuccess = async (credential: string) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await googleLogin(credential);
      if (result.success) {
        // Redirect to dashboard; onboarding gate will redirect if needed
        router.push('/dashboard');
      } else {
        setError(result.message || 'Google signup failed. Please try again.');
      }
    } catch (err) {
      setError('Google signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error: any) => {
    console.error('Google signup error:', error);
    setError('Google signup failed. Please try again.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      const result = await signup({
        email,
        password,
        firstName,
        lastName,
      });
      
      if (result.success) {
        // New users need onboarding, redirect there
        router.push('/onboarding');
      } else {
        setError(result.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Simple Signup Form (40%) */}
      <div className="flex-[2] flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-sm">
          {/* Header */}
          <FadeIn delay={200}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
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
              <SimpleGoogleButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={isLoading}
              />

              <button
                onClick={() => {/* placeholder for future Microsoft signin */}}
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

          {/* Error Message */}
          {error && (
            <FadeIn delay={400}>
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            </FadeIn>
          )}

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
{isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </FadeIn>

          {/* Footer */}
          <FadeIn delay={600}>
            <div className="mt-6 text-xs text-gray-500 text-center space-y-2">
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
              <p className="text-gray-400">
                Developed by{' '}
                <a
                  href="https://t3xlk.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                >
                  T3X LK
                </a>
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Right Panel - Marketing Content (60%) */}
      <div className="flex-[3] bg-gray-50 flex flex-col justify-center items-center p-12">
        <FadeIn>
          <div className="text-center max-w-lg">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <img
                src="/logo with no background no nae just logo.png"
                alt="Reachly Logo"
                className="h-12 w-auto mr-3"
              />
              <span className="text-2xl font-bold" style={{ color: '#1876d3' }}>Reachly</span>
            </div>

            {/* Big Number */}
            <div className="text-6xl font-bold mb-6" style={{ color: '#1876d3' }}>
              1M+
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Email marketers trust Reachly
            </h1>

            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Create engaging campaigns, automate email sequences, and grow your audience with AI-powered email marketing tools.
            </p>

            {/* Clean Features List */}
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#1876d3' }}></div>
                <span className="text-gray-700">Smart email automation</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#1876d3' }}></div>
                <span className="text-gray-700">AI-powered personalization</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#1876d3' }}></div>
                <span className="text-gray-700">Advanced analytics dashboard</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#1876d3' }}></div>
                <span className="text-gray-700">Real-time campaign tracking</span>
              </div>
            </div>

            {/* Simple Stats */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1876d3' }}>2B+</div>
                <div className="text-gray-600 text-sm">Emails Sent</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1876d3' }}>50K+</div>
                <div className="text-gray-600 text-sm">Campaigns</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1876d3' }}>98.7%</div>
                <div className="text-gray-600 text-sm">Delivery Rate</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}