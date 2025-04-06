// src/app/admin/layout.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuthStore();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [checkingAccess, setCheckingAccess] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    // Debug information
    console.log("Auth state:", { isAuthenticated, loading, user });
    console.log("Admin emails env var:", process.env.NEXT_PUBLIC_ADMIN_EMAILS);
    
    // Don't check while still loading auth state
    if (loading) {
      setDebugInfo("Still loading auth state...");
      return;
    }
    
    // Check if user has admin access
    const checkAdminAccess = () => {
      if (!isAuthenticated) {
        setDebugInfo("User not authenticated");
        setCheckingAccess(false);
        return;
      }
      
      // Get admin emails from environment variable
      const adminEmailsVar = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
      setDebugInfo(`Admin emails: ${adminEmailsVar}`);
      
      const adminEmails = adminEmailsVar.split(',').map(email => email.trim());
      
      // Check if current user's email is in the admin list
      const userEmail = user?.email || '';
      const isAdmin = adminEmails.includes(userEmail);
      
      setDebugInfo(prev => `${prev}\nUser email: ${userEmail}, Is admin: ${isAdmin}`);
      setHasAccess(isAdmin);
      setCheckingAccess(false);
      
      // Only redirect if not admin - but add a flag to prevent loops
      if (!isAdmin && !window.localStorage.getItem('adminRedirectAttempted')) {
        window.localStorage.setItem('adminRedirectAttempted', 'true');
        router.push('/unauthorized');
      }
    };
    
    checkAdminAccess();
    
    // Cleanup
    return () => {
      window.localStorage.removeItem('adminRedirectAttempted');
    };
  }, [user, isAuthenticated, loading, router]);

  // Show loading state with debug info
  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
        <div className="text-gray-600 text-sm max-w-md p-4 bg-white rounded-md shadow-sm whitespace-pre-line">
          {debugInfo || "Checking admin access..."}
        </div>
      </div>
    );
  }

  // If not authenticated or no access, show helpful message
  if (!isAuthenticated || !hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">Access Restricted</h1>
          <p className="text-gray-700 mb-4">
            {!isAuthenticated 
              ? "You need to be logged in to access this area." 
              : "You don't have permission to access this area."}
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => router.push(!isAuthenticated ? '/login' : '/')}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
            >
              {!isAuthenticated ? "Log In" : "Go to Home"}
            </button>
          </div>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-gray-100 rounded-md text-xs whitespace-pre-line text-gray-700">
              <strong>Debug Info:</strong><br/>
              {debugInfo}
            </div>
          )}
        </div>
      </div>
    );
  }

  // User has access, render the admin content
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}