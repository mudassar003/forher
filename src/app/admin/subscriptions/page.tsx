// src/app/admin/subscriptions/page.tsx
import React from 'react';
import AdminSubscriptionTable from './components/AdminSubscriptionTable';

const AdminSubscriptionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <div className="text-sm text-gray-600">
            Manage user subscriptions and billing
          </div>
        </div>
        
        <AdminSubscriptionTable />
      </div>
    </div>
  );
};

export default AdminSubscriptionsPage;