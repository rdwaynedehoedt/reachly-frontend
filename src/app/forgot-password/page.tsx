'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-white/50">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(37, 99, 235, 0.1) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link 
            href="/signin"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200 mb-8 group font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to sign in
          </Link>

          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-6 shadow-lg animate-pulse-blue">
              <span className="text-2xl font-bold text-white">R</span>
            </div>
            {!isSubmitted ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset your password</h1>
                <p className="text-gray-600 text-base">Enter your email address and we&apos;ll send you a link to reset your password.</p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Check your email</h1>
                <p className="text-gray-600 text-base">We&apos;ve sent a password reset link to <span className="font-semibold text-gray-900">{email}</span></p>
              </>
            )}
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-slideUp">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="email"
                    placeholder="Work Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 font-medium"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending reset link...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Didn&apos;t receive the email? Check your spam folder or{' '}
                    <button 
                      onClick={() => {
                        setIsSubmitted(false);
                        setEmail('');
                      }}
                      className="text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                    >
                      try again
                    </button>
                  </p>

                                  <Link
                  href="/signin"
                  className="inline-block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 text-center"
                >
                  Back to Sign In
                </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
