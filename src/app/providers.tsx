"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";

// Define user type
type User = {
  id: string;
  username: string;
  givenName?: string;
  familyName?: string;
  email?: string;
};

// Define authentication context type
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
};

// Create authentication context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  checkAuthStatus: async () => {},
});

// Authentication provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      console.log("Checking auth status with backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000");
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/auth/user`,
        {
          credentials: "include",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          mode: "cors"
        }
      );

      console.log("Auth status response:", response.status);
      
      const data = await response.json();
      console.log("Auth status data:", data);
      
      if (data.success && data.isAuthenticated) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Combined providers
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>{children}</AuthProvider>
  );
} 