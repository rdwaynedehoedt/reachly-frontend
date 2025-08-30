'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline';
import FadeIn from '@/components/FadeIn';
import { useAuth } from '../../contexts/AuthContext';
import SimpleGoogleButton from '../../components/ui/SimpleGoogleButton';
import LoadingScreen from '../../components/ui/LoadingScreen';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, googleLogin, refreshUser } = useAuth();
  const router = useRouter();

  const handleGoogleSuccess = async (credential: string) => {
    console.log('🎉 handleGoogleSuccess called with credential:', credential.substring(0, 20) + '...');
    setIsLoading(true);
    setError('');

    try {
      console.log('📡 Calling googleLogin API...');
      const result = await googleLogin(credential);
      console.log('📨 Google login result:', result);
      
      if (result.success) {
        console.log('✅ Google login successful, redirecting...');
        // Immediate redirect to dashboard - the dashboard will handle onboarding redirect if needed
        router.push('/dashboard'); 
      } else {
        console.log('❌ Google login failed:', result.message);
        setError(result.message || 'Google login failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('💥 Google login error:', error);
      setError('Google login failed. Please try again.');
      setIsLoading(false);
    }
    // Note: Don't setIsLoading(false) on success to maintain loading state during redirect
  };

  const handleGoogleError = (error: any) => {
    console.error('❌Google login error:', error);
    setError('Google login failed. Please try again.');
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'google') {
      // This will be handled by GoogleLoginButton
      return;
    }
    setIsLoading(true);
    console.log(`Login with ${provider}`);
    // TODO: Implement other social login providers
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        // Immediate redirect to dashboard - dashboard will handle onboarding redirect if needed
        router.push('/dashboard');
      } else {
        setError(result.message || 'Login failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
      setIsLoading(false);
    }
    // Note: Don't setIsLoading(false) on success to maintain loading state during redirect
  };

  return (
    <>
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Panel - Email Marketing Benefits - Hidden on mobile, shown on lg+ screens */}
      <div className="hidden lg:flex lg:flex-[3] bg-gray-50 flex-col justify-center items-center p-6 xl:p-12">
        <FadeIn>
          <div className="text-center max-w-lg xl:max-w-xl">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6 xl:mb-8">
              <img
                src="/logo with no background no nae just logo.png"
                alt="Reachly Logo"
                className="h-10 xl:h-12 w-auto mr-3"
              />
              <span className="text-xl xl:text-2xl font-bold" style={{ color: '#1876d3' }}>Reachly</span>
            </div>

            {/* Big Number */}
            <div className="text-6xl font-bold mb-6" style={{ color: '#1876d3' }}>
              98%
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Email delivery success rate
            </h1>

            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Power your outreach with AI-driven email campaigns that reach inboxes and convert prospects.
            </p>

            {/* Clean Features List */}
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#1876d3' }}></div>
                <span className="text-gray-700">AI-powered email personalization</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#1876d3' }}></div>
                <span className="text-gray-700">Advanced deliverability optimization</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#1876d3' }}></div>
                <span className="text-gray-700">Automated follow-up sequences</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#1876d3' }}></div>
                <span className="text-gray-700">Real-time campaign analytics</span>
              </div>
            </div>

            {/* Simple Stats */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1876d3' }}>50M+</div>
                <div className="text-gray-600 text-sm">Emails Sent</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1876d3' }}>35%</div>
                <div className="text-gray-600 text-sm">Avg Open Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1876d3' }}>12%</div>
                <div className="text-gray-600 text-sm">Reply Rate</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Right Panel - Simple Login Form - Responsive design */}
      <div className="flex-1 lg:flex-[2] flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 min-h-screen lg:min-h-auto">
        {/* Mobile Logo - Only shown on small screens */}
        <div className="lg:hidden flex items-center justify-center mb-8">
          <img
            src="/logo with no background no nae just logo.png"
            alt="Reachly Logo"
            className="h-8 w-auto mr-2"
          />
          <span className="text-lg font-bold" style={{ color: '#1876d3' }}>Reachly</span>
        </div>
        
        <div className="w-full max-w-sm">
          {/* Header */}
          <FadeIn delay={200}>
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-sm md:text-base text-gray-600">
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
          </FadeIn>

          {/* Social Login Options */}
          <FadeIn delay={300}>
            <div className="space-y-3 mb-6">
              <SimpleGoogleButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={isLoading}
              />

              <button
                onClick={() => handleSocialLogin('microsoft')}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 md:py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 font-medium transition-all duration-200 disabled:opacity-50 min-h-[44px] touch-target"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                  <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                <span className="text-sm md:text-base">Continue with Microsoft</span>
              </button>

              <button
                onClick={() => handleSocialLogin('organization')}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 md:py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 font-medium transition-all duration-200 disabled:opacity-50 min-h-[44px] touch-target"
              >
                <KeyIcon className="w-5 h-5 mr-3" />
                <span className="text-sm md:text-base">Log in with your Organization</span>
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

          {/* Email/Password Form */}
          <FadeIn delay={500}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Work Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3 md:py-3 sm:py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-sm md:text-base min-h-[44px] touch-target"
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
                  className="w-full px-3 py-3 md:py-3 sm:py-4 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-sm md:text-base min-h-[44px] touch-target"
                  style={{ '--tw-ring-color': '#1876d3' } as React.CSSProperties}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center touch-target"
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
                className="w-full text-white font-bold py-3 md:py-3 sm:py-4 px-4 rounded-md transition-all duration-200 disabled:opacity-50 hover:shadow-lg transform hover:scale-[1.02] text-sm md:text-base min-h-[44px] touch-target"
                style={{ backgroundColor: '#1876d3' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1876d3'}
              >
                {isLoading ? 'Logging In...' : 'Log In'}
              </button>

              {/* Keep signed in & Forgot password */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs md:text-sm space-y-2 sm:space-y-0">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="h-4 w-4 border-gray-300 rounded touch-target"
                    style={{ accentColor: '#1876d3' }}
                  />
                  <span className="ml-2 text-gray-600">Keep me signed in</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="transition-colors duration-200 hover:underline touch-target min-h-[44px] flex items-center"
                  style={{ color: '#1876d3' }}
                >
                  Forgot password?
                </Link>
              </div>
            </form>
          </FadeIn>

          {/* Footer */}
          <FadeIn delay={600}>
            <div className="mt-6 text-xs md:text-sm text-gray-500 text-center space-y-2">
              <p>
                2025 All Rights Reserved.{' '}
                <Link href="/privacy" className="transition-colors duration-200 hover:underline touch-target" style={{ color: '#1876d3' }}>
                  Privacy
                </Link>{' '}
                and{' '}
                <Link href="/terms" className="transition-colors duration-200 hover:underline touch-target" style={{ color: '#1876d3' }}>
                  Terms
                </Link>.
              </p>
              <p className="text-gray-400">
                Developed by{' '}
                <a
                  href="https://t3xlk.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-600 transition-colors duration-200 touch-target"
                >
                  T3X LK
                </a>
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

    </div>
    
    {/* Loading Overlay - Show when successfully logging in */}
    {isLoading && (
      <div className="fixed inset-0 z-50 bg-white">
        <LoadingScreen message="Logging you in..." />
      </div>
    )}
    </>
  );
}
