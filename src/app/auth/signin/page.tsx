"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'standard' | 'simple'>('standard');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const handleSignIn = async () => {
      try {
        // Get the backend URL
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        console.log("Backend URL:", backendUrl);
        
        // Make sure the backend URL doesn't end with a slash
        const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
        
        // Determine which login route to use
        const loginRoute = loginMethod === 'simple' ? '/auth/login-simple' : '/auth/login';
        
        // Construct the login URL with the correct path based on domain
        let loginUrl;
        
        // Check for different backend domains
        if (baseUrl.includes('choreoapis.dev')) {
          // Choreo API domain
          loginUrl = `${baseUrl}/reachly/reachly-backend/v1.0${loginRoute}`;
          console.log("Using Choreo URL format:", loginUrl);
        } else if (baseUrl.includes('dp-development-reachly')) {
          // New development domain - already includes the path
          // Make sure we don't duplicate the path
          if (baseUrl.includes('/reachly/reachly-backend/v1.0')) {
            loginUrl = `${baseUrl}${loginRoute}`;
          } else {
            loginUrl = `${baseUrl}/reachly/reachly-backend/v1.0${loginRoute}`;
          }
          console.log("Using development domain URL format:", loginUrl);
        } else {
          // Local development or other environment
          loginUrl = `${baseUrl}${loginRoute}`;
          console.log("Using standard URL format:", loginUrl);
        }
        
        console.log(`Redirecting to backend login URL: ${loginUrl}`);
        setDebugInfo({ backendUrl, baseUrl, loginUrl });
        
        // Directly redirect to the backend login URL
        window.location.href = loginUrl;
      } catch (error) {
        console.error("Error during sign in:", error);
        setError("Failed to redirect to login page. Please try again.");
      }
    };
    
    handleSignIn();
  }, [loginMethod]);

  const toggleLoginMethod = () => {
    setLoginMethod(prev => prev === 'standard' ? 'simple' : 'standard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      {error ? (
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <p className="text-red-800">{error}</p>
          {debugInfo && (
            <div className="mt-2 p-2 bg-gray-100 text-xs overflow-auto max-w-full">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md"
            >
              Try Again
            </button>
            <button 
              onClick={toggleLoginMethod}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Try {loginMethod === 'standard' ? 'Simple' : 'Standard'} Login
            </button>
            <button 
              onClick={() => {
                // Display the current environment variables for debugging
                setDebugInfo({
                  ...debugInfo,
                  env: {
                    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL
                  }
                });
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Show Env
            </button>
            <Link 
              href="/debug"
              className="px-4 py-2 bg-purple-600 text-white rounded-md inline-block"
            >
              Debug Tools
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <Image
              src="/png-animated-unscreen.gif"
              alt="Loading animation"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <Link 
            href="/debug"
            className="text-blue-500 hover:underline mt-4"
          >
            Debug Connection Issues
          </Link>
        </div>
      )}
    </div>
  );
} 