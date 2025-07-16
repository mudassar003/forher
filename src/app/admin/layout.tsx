// src/app/admin/layout.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { checkAdminStatus } from '@/utils/adminAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuthStore();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [checkingAccess, setCheckingAccess] = useState<boolean>(true);

  useEffect(() => {
    // Don't check while still loading auth state
    if (loading) {
      return;
    }
    
    // Check if user has admin access
    const checkAdminAccess = async () => {
      if (!isAuthenticated) {
        setCheckingAccess(false);
        return;
      }
      
      try {
        // Use secure server-side admin check
        const { isAdmin } = await checkAdminStatus();
        
        setHasAccess(isAdmin);
        setCheckingAccess(false);
        
        // Redirect if not admin
        if (!isAdmin && !window.localStorage.getItem('adminRedirectAttempted')) {
          window.localStorage.setItem('adminRedirectAttempted', 'true');
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setHasAccess(false);
        setCheckingAccess(false);
      }
    };
    
    checkAdminAccess();
    
    // Cleanup
    return () => {
      window.localStorage.removeItem('adminRedirectAttempted');
    };
  }, [user, isAuthenticated, loading, router]);

  // Show loading state
  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
        <div className="text-gray-600 text-sm">
          Loading...
        </div>
      </div>
    );
  }

  // If not authenticated or no access, show clean access restriction
  if (!isAuthenticated || !hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access this area.
          </p>
          <button
            onClick={() => router.push(!isAuthenticated ? '/login' : '/')}
            className="px-6 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
          >
            {!isAuthenticated ? "Log In" : "Go to Home"}
          </button>
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