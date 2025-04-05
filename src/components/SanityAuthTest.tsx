// src/components/SanityAuthTest.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const SanityAuthTest = () => {
  const { user, isAuthenticated, loading } = useAuthStore();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to create a test record in Sanity
  const createSanityTestRecord = async () => {
    if (!isAuthenticated || !user) {
      setTestResult({
        success: false,
        message: "You must be logged in to run this test",
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      // Current timestamp for unique test data
      const timestamp = new Date().toISOString();
      
      // Create test data for Sanity
      const testData = {
        userId: user.id,
        userEmail: user.email,
        testName: `Sanity Test ${timestamp}`,
        // Using subscription schema type for test
        subscriptionType: 'userSubscription'
      };

      // Make request to the test API endpoint
      const response = await fetch('/api/auth-test/sanity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
        // Include credentials to send cookies
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: "Successfully created test record in Sanity!",
          data: result
        });
      } else {
        setTestResult({
          success: false,
          message: "Failed to create test record in Sanity",
          error: result.error || "Unknown error"
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: "Error running Sanity test",
        error: error.message || String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Sanity Authentication Test</h2>
      
      <div className="p-4 mb-6 bg-gray-50 rounded-md">
        <h3 className="font-semibold mb-2">Authentication Status:</h3>
        {loading ? (
          <p>Checking authentication...</p>
        ) : (
          <div>
            <p><span className="font-medium">Authenticated:</span> {isAuthenticated ? "Yes" : "No"}</p>
            {user && (
              <>
                <p><span className="font-medium">User ID:</span> {user.id}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mb-6">
        <p className="mb-4">
          This test will attempt to create a test record in Sanity CMS using your 
          authenticated session. This verifies that your authentication is working correctly
          with Sanity API requests.
        </p>
        
        <button
          onClick={createSanityTestRecord}
          disabled={isLoading || !isAuthenticated}
          className={`px-4 py-2 rounded-md font-medium ${
            isAuthenticated
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Testing..." : "Run Sanity Write Test"}
        </button>
      </div>

      {testResult && (
        <div className={`p-4 rounded-md ${testResult.success ? "bg-green-50" : "bg-red-50"}`}>
          <h3 className={`font-semibold mb-2 ${testResult.success ? "text-green-700" : "text-red-700"}`}>
            Test Result: {testResult.success ? "Success" : "Failed"}
          </h3>
          <p className="mb-2">{testResult.message}</p>
          
          {testResult.error && (
            <div className="text-red-600 mt-2 p-2 bg-red-100 rounded">
              <p className="font-medium">Error:</p>
              <p className="font-mono text-sm whitespace-pre-wrap">{testResult.error}</p>
            </div>
          )}
          
          {testResult.data && (
            <div className="mt-4">
              <p className="font-medium mb-1">Response Data:</p>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SanityAuthTest;