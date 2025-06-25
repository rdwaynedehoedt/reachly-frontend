"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DebugPage() {
  const [backendUrl, setBackendUrl] = useState<string>("");
  const [testUrl, setTestUrl] = useState<string>("");
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the backend URL from environment
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    setBackendUrl(url);
    
    // Construct a test URL to the debug endpoint
    let debugUrl = url;
    if (debugUrl.endsWith('/')) {
      debugUrl = debugUrl.slice(0, -1);
    }
    
    // Add the path based on the domain
    if (url.includes('choreoapis.dev')) {
      debugUrl = `${debugUrl}/reachly/reachly-backend/v1.0/auth/debug-url-structure`;
    } else if (url.includes('dp-development-reachly')) {
      // Check if the URL already contains the path
      if (!url.includes('/reachly/reachly-backend/v1.0')) {
        debugUrl = `${debugUrl}/reachly/reachly-backend/v1.0/auth/debug-url-structure`;
      } else {
        debugUrl = `${debugUrl}/auth/debug-url-structure`;
      }
    } else {
      // Local development
      debugUrl = `${debugUrl}/auth/debug-url-structure`;
    }
    
    setTestUrl(debugUrl);
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(data);
      } else {
        setError(`Error: ${response.status} ${response.statusText}`);
        try {
          const errorText = await response.text();
          setTestResult({ error: errorText });
        } catch (e) {
          setTestResult({ error: "Could not parse error response" });
        }
      }
    } catch (err) {
      setError(`Failed to connect: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBackendUrl = () => {
    // This is just for testing - in a real app you'd use environment variables
    localStorage.setItem('debug_backend_url', backendUrl);
    
    // Update the test URL
    let debugUrl = backendUrl;
    if (debugUrl.endsWith('/')) {
      debugUrl = debugUrl.slice(0, -1);
    }
    
    // Add the path based on the domain
    if (backendUrl.includes('choreoapis.dev')) {
      debugUrl = `${debugUrl}/reachly/reachly-backend/v1.0/auth/debug-url-structure`;
    } else if (backendUrl.includes('dp-development-reachly')) {
      // Check if the URL already contains the path
      if (!backendUrl.includes('/reachly/reachly-backend/v1.0')) {
        debugUrl = `${debugUrl}/reachly/reachly-backend/v1.0/auth/debug-url-structure`;
      } else {
        debugUrl = `${debugUrl}/auth/debug-url-structure`;
      }
    } else {
      // Local development
      debugUrl = `${debugUrl}/auth/debug-url-structure`;
    }
    
    setTestUrl(debugUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Backend Connection Debug</h1>
        
        <div className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Backend URL Configuration</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2"
              placeholder="Enter backend URL"
            />
            <button
              onClick={updateBackendUrl}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Update
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">Test URL: {testUrl}</p>
          </div>
          
          <button
            onClick={testConnection}
            disabled={isLoading}
            className={`${
              isLoading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
            } text-white px-4 py-2 rounded`}
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {testResult && (
          <div className="mb-6 p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Common Issues</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>CORS errors:</strong> Make sure your backend CORS configuration includes your frontend domain
            </li>
            <li>
              <strong>Path duplication:</strong> Check for duplicate path segments like <code>/reachly/reachly-backend/v1.0/reachly/reachly-backend/v1.0</code>
            </li>
            <li>
              <strong>Environment variables:</strong> Ensure <code>NEXT_PUBLIC_BACKEND_URL</code> is set correctly
            </li>
            <li>
              <strong>Callback URL mismatch:</strong> Verify the callback URL registered in Asgardeo matches what your backend is using
            </li>
          </ul>
        </div>
        
        <div className="text-center mt-8">
          <Link href="/auth/signin" className="text-blue-500 hover:underline">
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 