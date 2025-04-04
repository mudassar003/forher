// src/app/(default)/supabase-debug/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function SupabaseDebugPage() {
  const [connectionInfo, setConnectionInfo] = useState<{
    url?: string;
    status?: string;
    tables?: string[];
  }>({});
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        // Check Supabase connection
        const connectionDetails = {
          url: supabase.supabaseUrl,
          status: 'Connected'
        };

        // Try to fetch table names (only works if user has permissions)
        const { data: tables, error: tableError } = await supabase.rpc('get_table_names');

        if (tableError) {
          console.error('Error fetching table names:', tableError);
          connectionDetails.status = 'Partial Connection';
        } else {
          connectionDetails.tables = tables;
        }

        setConnectionInfo(connectionDetails);
      } catch (err) {
        console.error('Debug fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchDebugInfo();
  }, []);

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p>Please log in to access debugging information.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Supabase Debug Information</h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Connection Details</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Supabase URL:</strong> {connectionInfo.url || 'Not available'}</p>
            <p><strong>Connection Status:</strong> {connectionInfo.status || 'Checking...'}</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">User Information</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
            <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
          </div>
        </div>

        {connectionInfo.tables && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Available Tables</h2>
            <div className="bg-gray-100 p-4 rounded">
              <ul className="list-disc list-inside">
                {connectionInfo.tables.map((table, index) => (
                  <li key={index}>{table}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
        <p className="text-blue-700">
          <strong>Note:</strong> This page requires authentication and may not show all details 
          depending on your database permissions.
        </p>
      </div>
    </div>
  );
}