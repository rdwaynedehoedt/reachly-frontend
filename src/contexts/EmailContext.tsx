'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { EmailAuthAPI, EmailAccount, OAuthUtils } from '@/lib/emailAuth';
import { useAuth } from './AuthContext';

interface EmailContextType {
  // State
  emailAccounts: EmailAccount[];
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshAccounts: () => Promise<void>;
  connectGmail: () => Promise<void>;
  disconnectAccount: (accountId: string) => Promise<void>;
  clearError: () => void;
  
  // OAuth handling
  handleOAuthCallback: () => void;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export function useEmail() {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
}

interface EmailProviderProps {
  children: React.ReactNode;
}

export function EmailProvider({ children }: EmailProviderProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch email accounts from API
   */
  const refreshAccounts = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, skipping email accounts fetch');
      setEmailAccounts([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await EmailAuthAPI.getEmailAccounts();
      
      if (response.success && response.accounts) {
        setEmailAccounts(response.accounts);
        console.log(`📧 Loaded ${response.accounts.length} email accounts`);
      } else {
        throw new Error(response.error || 'Failed to fetch email accounts');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch email accounts';
      setError(errorMessage);
      console.error('❌ Error fetching email accounts:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Initiate Gmail OAuth flow
   */
  const connectGmail = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please log in first to connect email accounts');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔗 Starting Gmail OAuth flow...');
      const response = await EmailAuthAPI.initiateGoogleAuth();
      
      if (response.success && response.authUrl) {
        console.log('✅ Redirecting to Google OAuth...');
        OAuthUtils.redirectToOAuth(response.authUrl);
      } else {
        throw new Error(response.error || 'Failed to initiate Gmail OAuth');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect Gmail';
      setError(errorMessage);
      console.error('❌ Error connecting Gmail:', errorMessage);
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Disconnect an email account
   */
  const disconnectAccount = useCallback(async (accountId: string) => {
    if (!isAuthenticated) {
      setError('Please log in to manage email accounts');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await EmailAuthAPI.disconnectEmailAccount(accountId);
      
      if (response.success) {
        // Remove the account from local state
        setEmailAccounts(prev => prev.filter(account => account.id !== accountId));
        console.log('✅ Account disconnected successfully');
      } else {
        throw new Error(response.error || 'Failed to disconnect account');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect account';
      setError(errorMessage);
      console.error('❌ Error disconnecting account:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle OAuth callback after user authorization
   */
  const handleOAuthCallback = useCallback(() => {
    const result = OAuthUtils.parseOAuthCallback();
    
    if (result.success) {
      console.log(`✅ OAuth success: Connected ${result.provider} account ${result.email}`);
      
      // Clean URL parameters
      OAuthUtils.cleanOAuthParams();
      
      // Refresh accounts to get the new connection
      refreshAccounts();
      
    } else if (result.error) {
      console.error(`❌ OAuth error: ${result.error}`, result.details);
      setError(`OAuth failed: ${result.error}${result.details ? ` (${result.details})` : ''}`);
      
      // Clean URL parameters
      OAuthUtils.cleanOAuthParams();
    }
  }, [refreshAccounts]);

  /**
   * Load accounts when authentication state changes
   */
  useEffect(() => {
    // Wait for auth loading to complete
    if (authLoading) return;
    
    // Check for OAuth callback first
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('connected') || urlParams.has('error')) {
      handleOAuthCallback();
    } else if (isAuthenticated) {
      // Only fetch accounts if user is authenticated
      refreshAccounts();
    } else {
      // Clear accounts if user is not authenticated
      setEmailAccounts([]);
      setError(null);
    }
  }, [isAuthenticated, authLoading, handleOAuthCallback, refreshAccounts]);

  const value: EmailContextType = {
    // State
    emailAccounts,
    loading,
    error,
    
    // Actions
    refreshAccounts,
    connectGmail,
    disconnectAccount,
    clearError,
    
    // OAuth handling
    handleOAuthCallback,
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
}

export default EmailContext;
