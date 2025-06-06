// src/app/admin/appointment-access/page.tsx
"use client";

import { useState, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";
import AppointmentAccessTable from "./components/AppointmentAccessTable";
import ResetAccessModal from "./components/ResetAccessModal";

interface UserAccessInfo {
  userId: string;
  userEmail: string;
  planName: string | null;
  subscriptionStatus: string | null;
  appointmentAccessedAt: string | null;
  appointmentAccessExpired: boolean;
  appointmentAccessDuration: number;
  timeRemaining: number | null;
  accessStatus: 'unused' | 'active' | 'expired';
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
}

export default function AdminAppointmentAccessPage() {
  const [users, setUsers] = useState<UserAccessInfo[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 0,
    totalUsers: 0,
    limit: 20
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserAccessInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'expired' | 'active' | 'unused'>('all');
  
  // Function to fetch appointment access data
  const fetchAppointmentAccess = async (page: number = 1, status: string = 'all') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        status
      });
      
      const response = await fetch(`/api/admin/appointment-access?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch appointment access data");
      }
      
      const data = await response.json();
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      console.error("Error fetching appointment access:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to reset user appointment access
  const resetUserAccess = async (userId: string, newDuration?: number): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin/appointment-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          newDuration
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reset appointment access");
      }
      
      // Refresh the data
      await fetchAppointmentAccess(pagination.currentPage, statusFilter);
      return true;
    } catch (error) {
      console.error("Error resetting appointment access:", error);
      return false;
    }
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchAppointmentAccess(newPage, statusFilter);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (newStatus: 'all' | 'expired' | 'active' | 'unused') => {
    setStatusFilter(newStatus);
    fetchAppointmentAccess(1, newStatus);
  };
  
  // Open modal to reset access for a user
  const handleResetAccess = (user: UserAccessInfo) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  // Initial load
  useEffect(() => {
    fetchAppointmentAccess();
  }, []);
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AdminHeader title="Appointment Access Management" />
      
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">User Appointment Access</h1>
          
          <div className="flex items-center gap-4">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">All Users</option>
              <option value="unused">Unused Access</option>
              <option value="active">Active Access</option>
              <option value="expired">Expired Access</option>
            </select>
            
            {/* Refresh Button */}
            <button
              className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 text-sm"
              onClick={() => fetchAppointmentAccess(pagination.currentPage, statusFilter)}
              disabled={isLoading}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 text-sm font-medium">Total Users</div>
            <div className="text-2xl font-bold text-blue-800">{pagination.totalUsers}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-600 text-sm font-medium">Unused Access</div>
            <div className="text-2xl font-bold text-green-800">
              {users.filter(u => u.accessStatus === 'unused').length}
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-yellow-600 text-sm font-medium">Active Access</div>
            <div className="text-2xl font-bold text-yellow-800">
              {users.filter(u => u.accessStatus === 'active').length}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-red-600 text-sm font-medium">Expired Access</div>
            <div className="text-2xl font-bold text-red-800">
              {users.filter(u => u.accessStatus === 'expired').length}
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <AppointmentAccessTable 
        users={users} 
        isLoading={isLoading} 
        onResetAccess={handleResetAccess}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
      
      {isModalOpen && selectedUser && (
        <ResetAccessModal
          user={selectedUser}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onReset={resetUserAccess}
        />
      )}
    </div>
  );
}