// src/app/admin/price-sync/layout.tsx
import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Price Sync Dashboard | Admin',
  description: 'Manage and synchronize subscription prices between Sanity and Stripe',
};

interface PriceSyncLayoutProps {
  children: ReactNode;
}

export default function PriceSyncLayout({ children }: PriceSyncLayoutProps): ReactNode {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/admin" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </a>
              <a 
                href="/admin/subscriptions" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Subscriptions
              </a>
              <a 
                href="/admin/price-sync" 
                className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Price Sync
              </a>
              <a 
                href="/" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Back to Site
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}