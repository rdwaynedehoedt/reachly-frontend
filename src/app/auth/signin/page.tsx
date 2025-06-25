"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function SignIn() {
  useEffect(() => {
    const handleSignIn = async () => {
      try {
        // Get the backend URL
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        console.log("Redirecting to backend login URL:", `${backendUrl}/auth/login`);
        
        // Directly redirect to the backend login URL
        window.location.href = `${backendUrl}/auth/login`;
      } catch (error) {
        console.error("Error during sign in:", error);
      }
    };
    
    handleSignIn();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="relative w-32 h-32">
        <Image
          src="/png-animated-unscreen.gif"
          alt="Loading animation"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    </div>
  );
} 