'use client';

import React, { useEffect, useState } from 'react';

interface SimpleGoogleButtonProps {
  onSuccess: (credential: string) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

export default function SimpleGoogleButton({ onSuccess, onError, disabled = false }: SimpleGoogleButtonProps) {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('🚀 SimpleGoogleButton: Initializing...');
    
    // Load Google Identity Services
    const loadGoogleScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if already loaded
        if ((window as any).google?.accounts?.id) {
          console.log('✅ Google API already loaded');
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log('✅ Google script loaded');
          // Wait a bit for the API to be ready
          setTimeout(() => {
            if ((window as any).google?.accounts?.id) {
              resolve();
            } else {
              reject(new Error('Google API not available'));
            }
          }, 100);
        };
        
        script.onerror = () => {
          console.error('❌ Failed to load Google script');
          reject(new Error('Failed to load Google script'));
        };

        document.head.appendChild(script);
      });
    };

    loadGoogleScript()
      .then(() => {
        console.log('🔧 Initializing Google OAuth...');
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        console.log('🔑 Client ID:', clientId);

        if (!clientId) {
          throw new Error('Google Client ID not found');
        }

        // Initialize with configuration for client-side flow
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            console.log('🎉 Google OAuth callback:', response);
            setIsLoading(false);
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError('No credential received from Google');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup', // Force popup mode (no redirect needed)
          use_fedcm_for_prompt: false, // Disable FedCM which can cause issues
        });

        setIsGoogleLoaded(true);
        console.log('✅ Google OAuth initialized successfully');
      })
      .catch((error) => {
        console.error('❌ Google OAuth initialization failed:', error);
        onError(error);
      });
  }, [onSuccess, onError]);

  const handleGoogleLogin = () => {
    if (!isGoogleLoaded) {
      console.log('⚠️ Google not loaded yet');
      onError('Google OAuth not ready');
      return;
    }

    setIsLoading(true);
    console.log('🚀 Triggering Google OAuth...');

    try {
      // Create a temporary container for the Google button
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.visibility = 'hidden';
      document.body.appendChild(tempContainer);

      // Render the actual Google Sign-In button
      (window as any).google.accounts.id.renderButton(tempContainer, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 250,
        click_listener: () => {
          console.log('🎯 Google button clicked');
        }
      });

      // Programmatically click the button
      setTimeout(() => {
        const button = tempContainer.querySelector('div[role="button"]') as HTMLElement;
        if (button) {
          console.log('🎯 Clicking Google button programmatically');
          button.click();
        } else {
          console.log('⚠️ Could not find Google button');
          setIsLoading(false);
          onError('Google button not found');
        }
        
        // Clean up
        setTimeout(() => {
          if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
          }
        }, 1000);
      }, 100);

    } catch (error) {
      console.error('❌ Error triggering Google login:', error);
      setIsLoading(false);
      onError(error);
    }
  };

  if (disabled) {
    return (
      <button 
        disabled 
        className="w-full flex items-center justify-center px-4 py-3 bg-gray-200 rounded-md text-gray-500 font-medium cursor-not-allowed"
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="#9CA3AF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#9CA3AF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#9CA3AF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#9CA3AF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </button>
    );
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={!isGoogleLoaded || isLoading}
      className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {isLoading ? 'Connecting...' : isGoogleLoaded ? 'Sign in with Google' : 'Loading Google...'}
    </button>
  );
}