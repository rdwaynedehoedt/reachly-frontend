// API Client utility for authenticated requests

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic API client for authenticated requests
async function baseApiClient(
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  return fetch(url, config);
}

// Enhanced API client with convenience methods
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await baseApiClient(endpoint, { method: 'GET' });
    const data = await response.json();
    return { success: response.ok, data, message: data.message, status: response.status };
  },
  
  post: async (endpoint: string, requestData: any) => {
    const response = await baseApiClient(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    const responseData = await response.json();
    return { success: response.ok, data: responseData.data || responseData, message: responseData.message, status: response.status };
  },
  
  put: async (endpoint: string, requestData: any) => {
    const response = await baseApiClient(endpoint, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
    const responseData = await response.json();
    return { success: response.ok, data: responseData.data || responseData, message: responseData.message, status: response.status };
  },
  
  delete: async (endpoint: string) => {
    const response = await baseApiClient(endpoint, { method: 'DELETE' });
    const data = await response.json();
    return { success: response.ok, data, message: data.message, status: response.status };
  },
};

// Convenience methods for common HTTP methods (legacy)
export const api = {
  get: async (endpoint: string) => {
    const response = await baseApiClient(endpoint, { method: 'GET' });
    return { data: await response.json() };
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await baseApiClient(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { data: await response.json() };
  },
  
  put: async (endpoint: string, data: any) => {
    const response = await baseApiClient(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { data: await response.json() };
  },
  
  delete: async (endpoint: string) => {
    const response = await baseApiClient(endpoint, { method: 'DELETE' });
    return { data: await response.json() };
  },
};

// Specialized methods for common API patterns
export const leadsApi = {
  getAll: async () => {
    const response = await api.get('/leads');
    return response.data;
  },
  
  import: async (data: {
    leads: any[];
    columnMapping: Record<string, string>;
    fileName: string;
    duplicateChecks: any;
  }) => {
    const response = await api.post('/leads/import', data);
    return response.data;
  },
  
  delete: async (leadId: string) => {
    const response = await api.delete(`/leads/${leadId}`);
    return response.data;
  },
};
