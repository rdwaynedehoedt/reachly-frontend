"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignOut() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const logout = async () => {
      try {
        // Call the backend logout endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        
        if (data.success) {
          // Redirect to Asgardeo logout URL
          window.location.href = data.logoutUrl;
        } else {
          setError("Failed to logout");
          // Redirect to login page after 3 seconds even if there was an error
          setTimeout(() => {
            router.push("/auth/signin");
          }, 3000);
        }
      } catch (err) {
        setError("An error occurred during logout");
        console.error(err);
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