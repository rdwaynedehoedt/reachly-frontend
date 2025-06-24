"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'standard' | 'simple'>('standard');

  useEffect(() => {
    const handleSignIn = async () => {
      try {
        // Get the backend URL
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        
        // Determine which login route to use
        const loginRoute = loginMethod === 'simple' ? '/auth/login-simple' : '/auth/login';
        console.log(`Redirecting to backend login URL: ${backendUrl}${loginRoute}`);
        
        // Directly redirect to the backend login URL
        window.location.href = `${backendUrl}${loginRoute}`;
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
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Try Again
          </button>
          <button 
            onClick={toggleLoginMethod}
            className="mt-2 ml-2 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Try {loginMethod === 'standard' ? 'Simple' : 'Standard'} Login
          </button>
        </div>
      ) : (
        <div className="relative w-32 h-32">
          <Image
            src="/png-animated-unscreen.gif"
            alt="Loading animation"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      )}
    </div>
  );
} 