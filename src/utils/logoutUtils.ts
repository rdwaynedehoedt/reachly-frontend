/**
 * Utility functions for handling logout operations
 */

/**
 * Performs a complete logout by:
 * 1. Calling the backend logout endpoint
 * 2. Clearing local storage and session data
 * 3. Returning the Asgardeo logout URL for redirection
 */
export async function performLogout(): Promise<{ success: boolean; logoutUrl?: string; error?: string }> {
  try {
    console.log("Starting logout process...");
    
    // Call the backend logout endpoint
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const logoutEndpoint = `${backendUrl}/auth/logout`;
    
    console.log(`Calling backend logout endpoint: ${logoutEndpoint}`);
    
    const response = await fetch(logoutEndpoint, {
      method: "POST",
      credentials: "include", // Important: This sends cookies to the backend
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Logout failed with status: ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Backend logout response:", data);
    
    if (data.success) {
      // Clear any client-side storage
      clearClientStorage();
      console.log("Client storage cleared");
      
      console.log("Logout URL from backend:", data.logoutUrl);
      return {
        success: true,
        logoutUrl: data.logoutUrl
      };
    } else {
      console.error("Backend reported logout failure:", data.message);
      return {
        success: false,
        error: data.message || "Unknown error during logout"
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error during logout:", errorMessage);
    return {
      success: false,
      error: `Error during logout: ${errorMessage}`
    };
  }
}

/**
 * Clears all client-side storage related to authentication
 */
function clearClientStorage(): void {
  // Clear any local storage items related to authentication
  localStorage.removeItem("user");
  
  // Clear any session storage items related to authentication
  sessionStorage.removeItem("auth_state");
  sessionStorage.removeItem("flowId");
  
  // Clear any cookies that can be cleared client-side (non-httpOnly)
  document.cookie = "next-auth.callback-url=; Max-Age=0; path=/; domain=" + window.location.hostname;
} 