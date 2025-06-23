"use client";

import Link from "next/link";
import { useAuth } from "@/app/providers";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Define navigation items
  const navItems = [
    { name: "Dashboard", href: "/", requireAuth: true },
    { name: "Campaigns", href: "/campaigns", requireAuth: true },
    { name: "Contacts", href: "/contacts", requireAuth: true },
    { name: "Settings", href: "/settings", requireAuth: true },
  ];

  // Filter navigation items based on authentication status
  const filteredNavItems = navItems.filter(
    (item) => !item.requireAuth || isAuthenticated
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Reachly
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isAuthenticated ? (
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  {user?.givenName || user?.username}
                </span>
                <Link
                  href="/auth/sign-out"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Sign Out
                </Link>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 