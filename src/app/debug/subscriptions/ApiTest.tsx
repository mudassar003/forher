// src/app/debug/subscriptions/ApiTest.tsx
"use client";

import { useState } from "react";

interface ApiResult {
  success: boolean;
  action: string;
  data?: any;
  error?: string;
  timestamp: string;
}

export default function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ApiResult[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");
  const [recordOptions, setRecordOptions] = useState<Array<{id: string, name: string}>>([]);

  const logResult = (result: ApiResult) => {
    setResults(prev => [result, ...prev]);
  };

  const callApi = async (action: string, payload = {}) => {
    setLoading(true);
    try {
      const response = await fetch("/api/debug/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          ...payload,
        }),
      });

      const result = await response.json();

      logResult({
        success: result.success,
        action,
        data: result.data || result,
        error: result.error,
        timestamp: new Date().toISOString(),
      });

      // If we did a read operation and it was successful, update the record options
      if (action === "read" && result.success && result.data) {
        const options = result.data.map((record: any) => ({
          id: record.id,
          name: `${record.plan_name} (${record.status}) - ${new Date(record.created_at).toLocaleString()}`
        }));
        setRecordOptions(options);
        
        // If we have records but no selection, select the first one
        if (options.length > 0 && !selectedRecordId) {
          setSelectedRecordId(options[0].id);
        }
      }

      return result;
    } catch (error: any) {
      logResult({
        success: false,
        action,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const testApiCreate = () => callApi("create");
  
  const testApiRead = () => callApi("read");
  
  const testApiUpdate = () => {
    if (!selectedRecordId) {
      logResult({
        success: false,
        action: "update",
        error: "No record selected to update",
        timestamp: new Date().toISOString(),
      });
      return;
    }
    return callApi("update", { recordId: selectedRecordId });
  };

  const testApiDelete = () => {
    if (!selectedRecordId) {
      logResult({
        success: false,
        action: "delete",
        error: "No record selected to delete",
        timestamp: new Date().toISOString(),
      });
      return;
    }
    return callApi("delete", { recordId: selectedRecordId });
  };

  const testAuthStatus = () => callApi("auth-status");

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <h2 className="text-xl font-semibold mb-4">API Testing</h2>
      <p className="text-gray-700 mb-4">
        Test subscription operations using the API route instead of direct Supabase calls.
      </p>

      {/* Record selection dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Record for Update/Delete
        </label>
        <div className="flex gap-2">
          <select
            value={selectedRecordId}
            onChange={(e) => setSelectedRecordId(e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded-md"
            disabled={recordOptions.length === 0}
          >
            {recordOptions.length === 0 ? (
              <option value="">No records available</option>
            ) : (
              recordOptions.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.name}
                </option>
              ))
            )}
          </select>
          <button
            onClick={testApiRead}
            className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={testAuthStatus}
          disabled={loading}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          Test Auth Status
        </button>
        <button
          onClick={testApiCreate}
          disabled={loading}
          className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          Create Test Record
        </button>
        <button
          onClick={testApiUpdate}
          disabled={loading || !selectedRecordId}
          className="p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
        >
          Update Selected Record
        </button>
        <button
          onClick={testApiDelete}
          disabled={loading || !selectedRecordId}
          className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          Soft Delete Selected Record
        </button>
      </div>

      {/* Results log */}
      <div>
        <h3 className="text-lg font-medium mb-2">API Results</h3>
        {results.length === 0 ? (
          <p className="text-gray-500 italic">No API operations performed yet.</p>
        ) : (
          <div className="space-y-4 overflow-auto max-h-96">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">
                    API: {result.action}{" "}
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