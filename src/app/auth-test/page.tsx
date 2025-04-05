// src/app/auth-test/page.tsx
import AuthDatabaseTest from '@/components/AuthTest';
import SanityAuthTest from '@/components/SanityAuthTest';

export const metadata = {
  title: 'Authentication Test',
  description: 'Test authentication with database and Sanity CMS',
};

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Authentication Tests</h1>
          <p className="mt-2 text-lg text-gray-600">
            Verify that authentication is working properly with both database and Sanity CMS
          </p>
        </div>
        
        {/* Database Test */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Database Authentication Test</h2>
          <AuthDatabaseTest />
        </div>
        
        {/* Sanity CMS Test */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sanity CMS Authentication Test</h2>
          <SanityAuthTest />
        </div>
        
        <div className="mt-10 text-center text-gray-500 text-sm">
          <p>These tests verify that your authentication is correctly configured for both database operations and Sanity CMS integration.</p>
          <p>You should only be able to write to these systems if you're properly authenticated with HTTP-only cookies.</p>
        </div>
      </div>
    </div>
  );
}