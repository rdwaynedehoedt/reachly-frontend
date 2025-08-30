'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, getCurrentUser, login, signup, logout, googleAuth, LoginCredentials, SignupData } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; message?: string }>;
  googleLogin: (credential: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Check if user is authenticated on component mount
  useEffect(() => {
    // Restore token from localStorage (only in browser)
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('authToken');
      if (savedToken) {
        setToken(savedToken);
      }
    }
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success && response.data) {
        console.log('✅ User authenticated:', response.data.email);
        setUser(response.data);
      } else {
        // User is not authenticated - this is normal, no need to log error
        if (response.message !== 'Not authenticated') {
          console.log('⚠️ Auth check:', response.message);
        }
        setUser(null);
      }
    } catch (error) {
      // Only log unexpected errors
      console.error('❌ Unexpected auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const response = await login(credentials);
      
      if (response.success && response.data) {
        // Immediately update user state for instant UI updates
        setUser(response.data.user);
        const authToken = response.data.token || response.data.accessToken;
        setToken(authToken || null);
        if (typeof window !== 'undefined' && authToken) {
          localStorage.setItem('authToken', authToken);
        }
        // Force a brief delay to ensure state propagation
        await new Promise(resolve => setTimeout(resolve, 50));
        return { success: true };
      } else {
        return {
          success: false,
          message: response.message || 'Login failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  };

  const handleSignup = async (data: SignupData) => {
    try {
      const response = await signup(data);
      
      if (response.success && response.data) {
        // Immediately update user state for instant UI updates
        setUser(response.data.user);
        const authToken = response.data.token || response.data.accessToken;
        setToken(authToken || null);
        if (typeof window !== 'undefined' && authToken) {
          localStorage.setItem('authToken', authToken);
        }
        // Force a brief delay to ensure state propagation
        await new Promise(resolve => setTimeout(resolve, 50));
        return { success: true };
      } else {
        return {
          success: false,
          message: response.message || 'Signup failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user state even if logout request fails
      setUser(null);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    try {
      const response = await googleAuth(credential);
      
      if (response.success && response.data) {
        // Immediately update user state for instant UI updates
        setUser(response.data.user);
        const authToken = response.data.token || response.data.accessToken;
        setToken(authToken || null);
        if (typeof window !== 'undefined' && authToken) {
          localStorage.setItem('authToken', authToken);
        }
        // Force a brief delay to ensure state propagation
        await new Promise(resolve => setTimeout(resolve, 50));
        return { success: true };
      } else {
        return {
          success: false,
          message: response.message || 'Google login failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    needsOnboarding: !!user && !user.onboardingCompleted,
    login: handleLogin,
    signup: handleSignup,
    googleLogin: handleGoogleLogin,
    logout: handleLogout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}