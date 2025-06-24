"use client";

import { useAuth } from "./providers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { performLogout } from "@/utils/logoutUtils";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

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

  if (isLoading) {
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <Image 
              src="/logo with no background.png" 
              alt="Reachly Logo" 
              width={200} 
              height={80} 
              className="h-20 w-auto"
            />
          </div>
          
          <h1 className="text-4xl font-bold text-indigo-800 mb-4">Coming Soon</h1>
          
          <div className="w-24 h-1 bg-indigo-500 mx-auto mb-6"></div>
          
          <p className="text-xl text-gray-600 mb-8">
            We're working hard to bring you an amazing experience.
            Our platform is under development and will be available soon.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-12">
            <div className="flex items-center gap-3 text-gray-700">
              <Image src="/globe.svg" alt="Global" width={24} height={24} />
              <span>Multi-tenant Architecture</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Image src="/file.svg" alt="Document" width={24} height={24} />
              <span>Scalable Design</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Image src="/window.svg" alt="Interface" width={24} height={24} />
              <span>Modern Interface</span>
            </div>
          </div>
          
          <div className="text-gray-600 mb-8">
            <p className="text-sm">A solution by</p>
            <p className="text-xl font-bold text-indigo-700">T3X Solutions</p>
          </div>
          
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50"
          >
            {isLoggingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </main>
  );
}
