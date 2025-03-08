"use client";

import { useAuthStore } from "@/store/authStore";

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Welcome back!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-800">Your Profile</h3>
          <p className="text-sm text-gray-600 mt-2">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="font-medium text-green-800">Account Settings</h3>
          <p className="text-sm text-gray-600 mt-2">
            Update your password and security options
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="font-medium text-purple-800">Notifications</h3>
          <p className="text-sm text-gray-600 mt-2">
            Configure your notification preferences
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;