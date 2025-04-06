// src/app/unauthorized/page.tsx
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?returnUrl=/');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full px-6 py-12 bg-white shadow-md rounded-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this area. If you believe this is an error, please
            contact the administrator.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 text-center"
            >
              Return to Home
            </Link>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}