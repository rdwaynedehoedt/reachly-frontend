/**
 * Email Authentication API Service
 * Handles OAuth flows and email account management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Use separate client ID for email OAuth (different from login OAuth)
const EMAIL_OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_EMAIL_OAUTH_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export interface EmailAccount {
  id: string;
  provider: 'gmail' | 'outlook' | 'imap_smtp';
  email: string;
  displayName?: string;
  status: 'active' | 'expired' | 'revoked' | 'error';
  expiresAt?: string;
  scopes: string[];
  createdAt: string;
  lastSyncedAt?: string;
}

export interface OAuthResponse {
  success: boolean;
  authUrl?: string;
  provider?: string;
  message?: string;
  error?: string;
}

export interface EmailAccountsResponse {
  success: boolean;
  accounts?: EmailAccount[];
  message?: string;
  error?: string;
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken'); // Match AuthContext token key
}

/**
 * Create request headers with authentication
 */
function createAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

/**
 * Handle API responses and errors
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Email Authentication API Class
 */
export class EmailAuthAPI {
  /**
   * Initiate Google OAuth flow
   */
  static async initiateGoogleAuth(): Promise<OAuthResponse> {
    try {
      console.log('🔗 Initiating Google OAuth flow...');
      
      const response = await fetch(`${API_BASE_URL}/email-auth/google/connect`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      const data = await handleApiResponse<OAuthResponse>(response);
      
      console.log('✅ OAuth URL generated successfully');
      return data;
      
    } catch (error) {
      console.error('❌ Failed to initiate Google OAuth:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate OAuth'
      };
    }
  }

  /**
   * Get user's connected email accounts
   */
  static async getEmailAccounts(): Promise<EmailAccountsResponse> {
    try {
      console.log('📧 Fetching connected email accounts...');
      
      const response = await fetch(`${API_BASE_URL}/email-auth/email-accounts`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      const data = await handleApiResponse<EmailAccountsResponse>(response);
      
      console.log(`✅ Retrieved ${data.accounts?.length || 0} email accounts`);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to fetch email accounts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch email accounts'
      };
    }
  }

  /**
   * Disconnect an email account
   */
  static async disconnectEmailAccount(accountId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log(`🗑️ Disconnecting email account: ${accountId}`);
      
      const response = await fetch(`${API_BASE_URL}/email-auth/email-accounts/${accountId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      const data = await handleApiResponse<{ success: boolean; message: string }>(response);
      
      console.log('✅ Email account disconnected successfully');
      return data;
      
    } catch (error) {
      console.error('❌ Failed to disconnect email account:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disconnect email account'
      };
    }
  }

  /**
   * Refresh expired OAuth tokens
   */
  static async refreshTokens(accountId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log(`🔄 Refreshing tokens for account: ${accountId}`);
      
      const response = await fetch(`${API_BASE_URL}/email-auth/google/refresh`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ accountId }),
      });

      const data = await handleApiResponse<{ success: boolean; message: string }>(response);
      
      console.log('✅ Tokens refreshed successfully');
      return data;
      
    } catch (error) {
      console.error('❌ Failed to refresh tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh tokens'
      };
    }
  }

  /**
   * Check service health
   */
  static async checkHealth(): Promise<{ success: boolean; message?: string; endpoints?: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/email-auth/health`, {
        method: 'GET',
      });

      return await handleApiResponse<{ success: boolean; message: string; endpoints: any }>(response);
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }
}

/**
 * Utility functions for OAuth handling
 */
export class OAuthUtils {
  /**
   * Handle OAuth callback URL parameters
   */
  static parseOAuthCallback(): { 
    success: boolean; 
    provider?: string; 
    email?: string; 
    error?: string; 
    details?: string 
  } {
    if (typeof window === 'undefined') return { success: false };
    
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for OAuth success
    const connectedProvider = urlParams.get('connected');
    const email = urlParams.get('email');
    
    if (connectedProvider) {
      return {
        success: true,
        provider: connectedProvider,
        email: email || undefined
      };
    }
    
    // Check for OAuth errors
    const error = urlParams.get('error');
    const details = urlParams.get('details');
    
    if (error) {
      return {
        success: false,
        error: error,
        details: details || undefined
      };
    }
    
    return { success: false };
  }

  /**
   * Clean OAuth parameters from URL
   */
  static cleanOAuthParams(): void {
    if (typeof window === 'undefined') return;
    
    const url = new URL(window.location.href);
    const paramsToRemove = ['connected', 'email', 'error', 'details', 'code', 'state'];
    
    paramsToRemove.forEach(param => url.searchParams.delete(param));
    
    // Update URL without reloading the page
    window.history.replaceState({}, document.title, url.toString());
  }

  /**
   * Redirect to OAuth provider
   */
  static redirectToOAuth(authUrl: string): void {
    if (typeof window === 'undefined') return;
    window.location.href = authUrl;
  }
}

export default EmailAuthAPI;
