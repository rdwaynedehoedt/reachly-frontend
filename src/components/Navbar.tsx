"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { performLogout } from "@/utils/logoutUtils";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      const result = await performLogout();
      
      if (result.success && result.logoutUrl) {
        window.location.href = result.logoutUrl;
      } else {
        console.error("Logout failed:", result.error);
        router.push("/auth/signin");
      }
    } catch (error) {
      console.error("Error during sign out:", error);
      router.push("/auth/signin");
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <Image
                  src="/logo with no background.png"
                  alt="Reachly Logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                {user?.givenName || user?.username}
              </span>
              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoggingOut ? "Signing Out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 