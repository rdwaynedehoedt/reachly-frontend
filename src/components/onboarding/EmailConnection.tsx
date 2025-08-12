'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FadeIn from '@/components/FadeIn';
import { useEmail } from '@/contexts/EmailContext';

interface EmailConnectionProps {
  onEmailSetup: (emailData: { 
    connectedAccounts: { provider: string; email: string; status: string }[];
    skipForNow: boolean;
  }) => void;
  onContinue: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const EmailConnection: React.FC<EmailConnectionProps> = ({
  onEmailSetup,
  onContinue,
  onBack,
  onSkip
}) => {
  const { emailAccounts, loading, error, connectGmail, disconnectAccount, clearError } = useEmail();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showFullScreenSuccess, setShowFullScreenSuccess] = useState(false);

  // Detect OAuth callback success and show full-screen celebration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connectedProvider = urlParams.get('connected');
    
    if (connectedProvider && emailAccounts.length > 0 && !showFullScreenSuccess) {
      console.log(`🎉 OAuth success detected for ${connectedProvider}!`);
      setShowFullScreenSuccess(true);
      
      // Auto-call onEmailSetup when accounts are detected
      const connectedAccounts = emailAccounts.map(account => ({
        provider: account.provider,
        email: account.email,
        status: account.status
      }));
      onEmailSetup({
        connectedAccounts,
        skipForNow: false
      });
    }
  }, [emailAccounts, onEmailSetup, showFullScreenSuccess]);

  // Show success message when email accounts are connected (fallback)
  useEffect(() => {
    if (emailAccounts.length > 0 && !showSuccessMessage && !showFullScreenSuccess) {
      setShowSuccessMessage(true);
    }
  }, [emailAccounts, showSuccessMessage, showFullScreenSuccess]);

  const emailProviders = [
    {
      id: 'gmail',
      name: 'Gmail / G-Suite',
      description: 'Connect your Gmail or Google Workspace account',
      color: 'bg-white border-gray-200 hover:bg-gray-50',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      popular: true,
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )
    },
    {
      id: 'outlook',
      name: 'Office 365 / Outlook',
      description: 'Connect your Microsoft Outlook account',
      color: 'bg-white border-gray-200 hover:bg-gray-50',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      popular: true,
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path d="M21.53 4.306v15.363H12.93V17.91h7.25V6.09h-7.25V4.306h8.6z" fill="#0078D4"/>
          <path d="M1.47 4.306v15.387h11.46v-1.748H3.218V6.09H12.93V4.306H1.47z" fill="#0078D4"/>
          <path d="M12.93 9.953h7.25v4.114h-7.25V9.953z" fill="#40E0D0"/>
          <path d="M3.218 9.953H12.93v4.114H3.218V9.953z" fill="#0078D4"/>
        </svg>
      )
    },
    {
      id: 'imap_smtp',
      name: 'Connect via IMAP/SMTP',
      description: '(Yahoo, ProtonMail, etc.)',
      color: 'bg-white border-gray-200 hover:bg-gray-50',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      popular: false,
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="m2 6 10 7 10-7"/>
        </svg>
      )
    }
  ];

  const handleConnect = async (providerId: string) => {
    if (isConnecting || loading) return;
    
    setIsConnecting(providerId);
    clearError(); // Clear any previous errors
    
    try {
      if (providerId === 'gmail') {
        await connectGmail();
        // OAuth redirect will happen, so we won't reach this point
      } else if (providerId === 'outlook') {
        // TODO: Implement Outlook OAuth
        console.log('🔧 Outlook OAuth not yet implemented');
        setIsConnecting(null);
      } else if (providerId === 'imap_smtp') {
        // TODO: Implement IMAP/SMTP setup
        console.log('🔧 IMAP/SMTP setup not yet implemented');
        setIsConnecting(null);
      }
    } catch (error) {
      console.error('❌ Connection failed:', error);
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      await disconnectAccount(accountId);
    } catch (error) {
      console.error('❌ Disconnect failed:', error);
    }
  };

  const handleContinue = () => {
    // Convert emailAccounts to the expected format
    const connectedAccounts = emailAccounts.map(account => ({
      provider: account.provider,
      email: account.email,
      status: account.status
    }));
    
    onEmailSetup({
      connectedAccounts,
      skipForNow: connectedAccounts.length === 0
    });
    onContinue();
  };

  const handleSkipForNow = () => {
    onEmailSetup({
      connectedAccounts: [],
      skipForNow: true
    });
    onSkip();
  };

  const isAccountConnected = (providerId: string) => 
    emailAccounts.some(acc => acc.provider === providerId);

  const getConnectedAccount = (providerId: string) => {
    return emailAccounts.find(acc => acc.provider === providerId);
  };

  // If showing full-screen success, ONLY show that - nothing else
  if (showFullScreenSuccess) {
    return (
      <motion.div 
        className="fixed inset-0 bg-gradient-to-br from-green-50 to-emerald-50 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center relative">
          {/* Floating Particles Background */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full opacity-60"
              initial={{ 
                x: 0, 
                y: 0,
                scale: 0
              }}
              animate={{ 
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                scale: [0, 1, 0]
              }}
              transition={{ 
                duration: 2,
                delay: 1.2 + i * 0.1,
                repeat: Infinity,
                repeatDelay: 3
              }}
              style={{
                left: '50%',
                top: '50%',
              }}
            />
          ))}

          {/* Main Success Circle with Ripple Effect */}
          <div className="relative">
            {/* Ripple Rings */}
            <motion.div
              className="absolute inset-0 w-40 h-40 border-4 border-green-300 rounded-full"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 1, 2], opacity: [1, 0.5, 0] }}
              transition={{ duration: 1.5, delay: 0.8, repeat: Infinity }}
              style={{ left: '-1rem', top: '-1rem' }}
            />
            <motion.div
              className="absolute inset-0 w-40 h-40 border-4 border-green-400 rounded-full"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 1, 2], opacity: [1, 0.5, 0] }}
              transition={{ duration: 1.5, delay: 1.2, repeat: Infinity }}
              style={{ left: '-1rem', top: '-1rem' }}
            />

            {/* Main Success Circle */}
            <motion.div
              className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl relative z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                duration: 1.2, 
                delay: 0.3,
                bounce: 0.6
              }}
            >
              {/* Checkmark with Draw Animation */}
              <motion.svg 
                className="w-16 h-16 text-white" 
                fill="none"
                viewBox="0 0 24 24"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <motion.path
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                />
              </motion.svg>

              {/* Shine Effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-white opacity-30"
                initial={{ scale: 0, opacity: 0.3 }}
                animate={{ scale: [0, 1.5], opacity: [0.3, 0] }}
                transition={{ duration: 0.6, delay: 1.5 }}
              />
            </motion.div>
          </div>

          {/* Success Text with Bounce */}
          <motion.h1 
            className="text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              type: "spring",
              duration: 0.8, 
              delay: 1.3,
              bounce: 0.4
            }}
          >
            Email Connected!
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            Successfully connected your Gmail account
          </motion.p>

          {/* Connected Account Card with Slide In */}
          {emailAccounts.length > 0 && (
            <motion.div 
              className="bg-white rounded-2xl p-6 mb-8 max-w-sm mx-auto shadow-xl border border-green-100"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.7, type: "spring" }}
            >
              {emailAccounts.map((account, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <motion.div 
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100"
                    whileHover={{ scale: 1.05 }}
                  >
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </motion.div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900 text-lg">{account.email}</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-sm text-green-600 font-medium">Connected & Ready</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Final Progress Message */}
          <motion.p 
            className="text-green-600 font-medium text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            Taking you to your dashboard...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <FadeIn>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m2 6 10 7 10-7"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connect Your Email Accounts
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect your email accounts to start sending campaigns and manage your outreach. 
              You can always add more accounts later in your settings.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h4 className="font-medium text-red-900">Connection Error</h4>
                <button
                  onClick={clearError}
                  className="ml-auto text-red-600 hover:text-red-700"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {showSuccessMessage && emailAccounts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="font-medium text-green-900">🎉 Email Account Connected!</h4>
              </div>
              <div className="mt-2">
                {emailAccounts.map((account, index) => (
                  <p key={index} className="text-sm text-green-700">
                    ✅ {account.email} ({account.provider})
                  </p>
                ))}
              </div>
              <p className="text-sm text-green-600 mt-2">
                Proceeding to complete your onboarding...
              </p>
            </motion.div>
          )}

          {/* Email Provider Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {emailProviders.map((provider) => {
              const isConnected = isAccountConnected(provider.id);
              const connectedAccount = getConnectedAccount(provider.id);
              const isCurrentlyConnecting = isConnecting === provider.id;

              return (
                <motion.div
                  key={provider.id}
                  className={`relative border-2 rounded-lg p-6 transition-all duration-200 ${provider.color} cursor-pointer`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Popular Badge */}
                  {provider.popular && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Popular
                    </div>
                  )}

                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {provider.logo}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {provider.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {provider.description}
                    </p>

                    {/* Connection Status */}
                    {isConnected ? (
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-green-900">Connected</span>
                          </div>
                          <p className="text-xs text-green-700 mt-1 text-center">
                            {connectedAccount?.email}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDisconnect(connectedAccount?.id || '')}
                          className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnect(provider.id)}
                        disabled={isCurrentlyConnecting || loading}
                        className={`w-full px-4 py-2 ${provider.buttonColor} text-white rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isCurrentlyConnecting ? (
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Connecting...</span>
                          </div>
                        ) : (
                          `Connect ${provider.id === 'gmail' ? 'Gmail' : provider.id === 'outlook' ? 'Office' : 'Any'}`
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Connected Accounts Summary */}
          {emailAccounts.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {emailAccounts.length} Account{emailAccounts.length !== 1 ? 's' : ''} Connected
              </h3>
              <ul className="space-y-2">
                {emailAccounts.map((account, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">{account.email}</span>
                    <span className="text-gray-500">({account.provider})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSkipForNow}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Skip for now
              </button>
              <button
                onClick={handleContinue}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default EmailConnection;