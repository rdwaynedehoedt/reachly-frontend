"use client";

import Link from "next/link";
import Image from "next/image";

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <p className="text-center text-sm text-gray-600 mb-4">
        Authentication error
      </p>
      <div className="relative w-32 h-32">
        <Image
          src="/png-animated-unscreen.gif"
          alt="Loading animation"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
      <Link 
        href="/auth/signin"
        className="mt-6 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Try Again
      </Link>
    </div>
  );
} 