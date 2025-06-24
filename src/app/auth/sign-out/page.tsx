"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { performLogout } from "@/utils/logoutUtils";

export default function SignOut() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    const logout = async () => {
      try {
        console.log("Sign-out page: Starting logout process");
        const result = await performLogout();
        
        console.log("Sign-out page: Logout result", result);
        
        if (result.success && result.logoutUrl) {
          // Show debug info before redirecting
          setDebugInfo(`Redirecting to: ${result.logoutUrl}`);
          console.log(`Sign-out page: Redirecting to ${result.logoutUrl}`);
          
          // Short delay to allow console logs to be seen
          setTimeout(() => {
            // Redirect to Asgardeo logout URL to complete the IdP logout
            window.location.href = result.logoutUrl as string;
          }, 500);
        } else {
          const errorMsg = result.error || "Failed to logout";
          setError(errorMsg);
          console.error("Sign-out page: Logout failed:", errorMsg);
          
          // Redirect to login page after 3 seconds if there was an error
          setTimeout(() => {
            router.push("/auth/signin");
          }, 3000);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(`Error during logout: ${errorMessage}`);
        console.error("Sign-out page: Exception during logout:", err);
        
        // Redirect to login page after 3 seconds even if there was an error
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      }
    };

    logout();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      {error && (
        <p className="text-center text-sm text-red-600 mb-4">{error}</p>
      )}
      {debugInfo && (
        <p className="text-center text-xs text-gray-500 mb-2">{debugInfo}</p>
      )}
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