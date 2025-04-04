// src/app/debug/subscriptions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import ApiTest from "./ApiTest";

interface DebugResult {
  success: boolean;
  operation: string;
  data?: any;
  error?: string;
  timestamp: string;
}

export default function SubscriptionDebugPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DebugResult[]>([]);
  const [userDetails, setUserDetails] = useState<any>(null);

  // Get current user details on component mount
  useEffect(() => {
    if (user) {
      setUserDetails({
        id: user.id,
        email: user.email,
        isAuthenticated
      });
    }
  }, [user, isAuthenticated]);

  const logResult = (result: DebugResult) => {
    setResults(prev => [result, ...prev]);
  };

  // Test direct database read
  const testDatabaseRead = async () => {
    setLoading(true);
    try {
      // Try to read from the user_subscriptions table
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .limit(5);

      if (error) {
        logResult({
          success: false,
          operation: "Read user_subscriptions",
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } else {
        logResult({
          success: true,
          operation: "Read user_subscriptions",
          data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      logResult({
        success: false,
        operation: "Read user_subscriptions (exception)",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // Test record creation for the current user
  const testCreateRecord = async () => {
    if (!user) {
      logResult({
        success: false,
        operation: "Create subscription record",
        error: "User not authenticated",
        timestamp: new Date().toISOString()
      });
      return;
    }

    setLoading(true);
    try {
      // Create a test subscription record
      const testRecord = {
        user_id: user.id,
        user_email: user.email,
        plan_name: "Debug Test Subscription",
        subscription_name: "Debug Test",
        billing_amount: 0,
        billing_period: "monthly",
        start_date: new Date().toISOString(),
        status: "debug",
        is_active: false,
        has_appointment_access: false,
        appointment_discount_percentage: 0,
        is_deleted: false
      };

      // Try to insert the record
      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert(testRecord)
        .select();

      if (error) {
        logResult({
          success: false,
          operation: "Create subscription record",
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } else {
        logResult({
          success: true,
          operation: "Create subscription record",
          data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      logResult({
        success: false,
        operation: "Create subscription record (exception)",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // Test record update for the current user
  const testUpdateRecord = async () => {
    if (!user) {
      logResult({
        success: false,
        operation: "Update subscription record",
        error: "User not authenticated",
        timestamp: new Date().toISOString()
      });
      return;
    }

    setLoading(true);
    try {
      // First, try to find a debug record to update
      const { data: existingRecords, error: findError } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "debug")
        .limit(1);

      if (findError) {
        logResult({
          success: false,
          operation: "Find record to update",
          error: findError.message,
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      if (!existingRecords || existingRecords.length === 0) {
        logResult({
          success: false,
          operation: "Update subscription record",
          error: "No debug record found to update. Please create one first.",
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      // We found a record to update
      const recordId = existingRecords[0].id;
      
      // Try to update the record
      const { data, error } = await supabase
        .from("user_subscriptions")
        .update({
          updated_at: new Date().toISOString(),
          is_active: true,  // Toggle this value
        })
        .eq("id", recordId)
        .select();

      if (error) {
        logResult({
          success: false,
          operation: "Update subscription record",
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } else {
        logResult({
          success: true,
          operation: "Update subscription record",
          data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      logResult({
        success: false,
        operation: "Update subscription record (exception)",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // Test deleting a debug record
  const testDeleteRecord = async () => {
    if (!user) {
      logResult({
        success: false,
        operation: "Delete subscription record",
        error: "User not authenticated",
        timestamp: new Date().toISOString()
      });
      return;
    }

    setLoading(true);
    try {
      // First, find debug records to delete
      const { data: existingRecords, error: findError } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "debug")
        .limit(10);

      if (findError) {
        logResult({
          success: false,
          operation: "Find records to delete",
          error: findError.message,
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      if (!existingRecords || existingRecords.length === 0) {
        logResult({
          success: false,
          operation: "Delete subscription record",
          error: "No debug records found to delete",
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      // Get the IDs to delete
      const recordIds = existingRecords.map(record => record.id);
      
      // We'll use soft deletion by setting is_deleted = true
      const { data, error } = await supabase
        .from("user_subscriptions")
        .update({ is_deleted: true })
        .in("id", recordIds)
        .select();

      if (error) {
        logResult({
          success: false,
          operation: "Delete subscription record",
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } else {
        logResult({
          success: true,
          operation: "Delete subscription record",
          data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      logResult({
        success: false,
        operation: "Delete subscription record (exception)",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // Test checking Supabase auth status
  const testAuthStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        logResult({
          success: false,
          operation: "Check auth status",
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } else {
        logResult({
          success: true, 
          operation: "Check auth status",
          data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      logResult({
        success: false,
        operation: "Check auth status (exception)",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <h1 className="text-xl font-bold">Authentication Required</h1>
          <p>You must be logged in to use this debug page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Subscription Debug Page</h1>
        <p className="text-gray-700 mb-2">
          This page helps diagnose database permission issues with the subscription system.
        </p>
      </div>

      {/* Current user details */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Current User</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
          {JSON.stringify(userDetails, null, 2)}
        </pre>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={testAuthStatus}
          disabled={loading}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          Test Auth Status
        </button>
        <button
          onClick={testDatabaseRead}
          disabled={loading}
          className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          Test Database Read
        </button>
        <button
          onClick={testCreateRecord}
          disabled={loading}
          className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          Test Create Record
        </button>
        <button
          onClick={testUpdateRecord}
          disabled={loading}
          className="p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
        >
          Test Update Record
        </button>
        <button
          onClick={testDeleteRecord}
          disabled={loading}
          className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          Soft Delete Debug Records
        </button>
      </div>

      {/* API testing section */}
      <ApiTest />
      
      {/* Results log */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Direct Supabase Results</h2>
        {results.length === 0 ? (
          <p className="text-gray-500 italic">No operations performed yet.</p>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">
                    {result.operation}{" "}
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        result.success ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                      }`}
                    >
                      {result.success ? "SUCCESS" : "FAILED"}
                    </span>
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {result.error && (
                  <div className="mb-2 text-red-700 text-sm bg-red-50 p-2 rounded">
                    Error: {result.error}
                  </div>
                )}
                {result.data && (
                  <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}