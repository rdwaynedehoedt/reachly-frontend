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

  const emailProviders = [
    {
      id: 'gmail',
      name: 'Gmail / G-Suite',
      description: 'Connect your Gmail or Google Workspace account',
      color: 'bg-white border-gray-200 hover:bg-gray-50',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      popular: true,
      logo: (
        <img 
          src="https://developers.google.com/gmail/images/gmail-icon.svg" 
          alt="Gmail"
          className="w-8 h-8"
          onError={(e) => {
            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23EA4335'%3E%3Cpath d='M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.91L12 11.64l9.455-7.819h.91c.904 0 1.636.732 1.636 1.636z'/%3E%3C/svg%3E";
          }}
        />
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
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" 
          alt="Outlook"
          className="w-8 h-8"
          onError={(e) => {
            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230078D4'%3E%3Cpath d='M7 9v6l5-3-5-3zm5.5 4c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5.448-1.5 1-1.5 1 .672 1 1.5zM1 6.5v11C1 18.878 2.122 20 3.5 20h17c1.378 0 2.5-1.122 2.5-2.5v-11C23 5.122 21.878 4 20.5 4h-17C2.122 4 1 5.122 1 6.5zm2 0C3 6.224 3.224 6 3.5 6h17c.276 0 .5.224.5.5v1.5l-8.5 5L4 8V6.5z'/%3E%3C/svg%3E";
          }}
        />
      )
    },
    {
      id: 'imap_smtp',
      name: 'Any Provider',
      description: 'Connect via IMAP/SMTP (Yahoo, ProtonMail, etc.)',
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

  const isAccountConnected = (providerId: string) => {
    return emailAccounts.some(acc => acc.provider === providerId);
  };

  const getConnectedAccount = (providerId: string) => {
    return emailAccounts.find(acc => acc.provider === providerId);
  };

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
                    {isConnected && connectedAccount ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-2 text-green-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">Connected</span>
                        </div>
                        <p className="text-xs text-gray-600">{connectedAccount.email}</p>
                        <button
                          onClick={() => handleDisconnect(connectedAccount.id)}
                          className="text-xs text-red-600 hover:text-red-700 underline"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnect(provider.id)}
                        disabled={isCurrentlyConnecting || loading}
                        className={`w-full ${provider.buttonColor} text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isCurrentlyConnecting ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Connecting...</span>
                          </div>
                        ) : (
                          `Connect ${provider.name.split(' ')[0]}`
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <h4 className="font-medium text-green-900">
                  {emailAccounts.length} Account{emailAccounts.length > 1 ? 's' : ''} Connected
                </h4>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                {emailAccounts.map((account, index) => (
                  <li key={index}>• {account.email} ({account.provider})</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              ← Back
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handleSkipForNow}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleContinue}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                disabled={loading}
              >
                {loading ? 'Connecting...' : emailAccounts.length > 0 ? 'Continue' : 'Continue without email'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default EmailConnection;
