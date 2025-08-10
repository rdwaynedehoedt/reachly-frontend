const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  // Check if we're in the browser before accessing localStorage
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  onboardingCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token?: string;
    accessToken?: string;
  };
  message?: string;
}

// Login function
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for refresh tokens
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Login failed',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
}

// Signup function
export async function signup(signupData: SignupData): Promise<AuthResponse> {
  try {
    console.log('🚀 Signup attempt:', { API_URL, signupData: { ...signupData, password: '[HIDDEN]' } });
    
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(signupData),
    });

    console.log('📡 Signup response status:', response.status);
    const data = await response.json();
    console.log('📄 Signup response data:', data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Signup failed',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
}

// Logout function
export async function logout(): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Logout failed. Please try again.',
    };
  }
}

// Get current user
export async function getCurrentUser(): Promise<{ success: boolean; data?: User; message?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        // User is not authenticated - this is normal for logged out users
        return {
          success: false,
          message: 'Not authenticated',
        };
      }
      // For other errors, return a response instead of throwing
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return {
        success: false,
        message: errorData.message || 'Failed to get user information',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data.user,
    };
  } catch (error) {
    // Only log network errors, not authentication errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error while checking authentication:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
    
    console.error('Get current user error:', error);
    return {
      success: false,
      message: 'Failed to get user information',
    };
  }
}

// Refresh token
export async function refreshToken(): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return { success: true };
  } catch (error) {
    console.error('Refresh token error:', error);
    return {
      success: false,
      message: 'Session expired. Please login again.',
    };
  }
}

// Google OAuth login
export async function googleAuth(credential: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/oauth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ credential }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Google authentication failed',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Google auth error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
}

// Complete onboarding
export async function completeOnboarding(data: {
  role: string;
  experienceLevel: string;
  goals: string[];
  organization?: {
    mode: 'create' | 'join';
    name: string;
    industry?: string;
    size?: string;
    existingOrgId?: string;
  } | null;
  teamMembers?: { email: string; role: string }[];
  jobTitle?: string;
}): Promise<{ success: boolean; message?: string; data?: any }> {
  try {
    const response = await fetch(`${API_URL}/user/complete-onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to complete onboarding',
      };
    }

    return {
      success: true,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
}