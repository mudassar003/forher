// src/app/admin/appointments/components/AppointmentList.tsx
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AppointmentStatus, PaymentStatus, QualiphyExamStatus } from '@/types/appointment';
import { formatDate } from '@/utils/dateUtils';

interface AdminAppointment {
  id: string;
  user_email: string;
  customer_name: string;
  treatment_name: string;
  appointment_date?: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  qualiphy_exam_status?: QualiphyExamStatus;
  created_at: string;
  requires_subscription: boolean;
  is_from_subscription: boolean;
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [qualiphyFilter, setQualiphyFilter] = useState<QualiphyExamStatus | 'all'>('all');

  useEffect(() => {
    fetchAppointments();
  }, [page, statusFilter, paymentFilter, qualiphyFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Start building query
      let query = supabase
        .from('user_appointments')
        .select('id, user_email, customer_name, treatment_name, appointment_date, status, payment_status, qualiphy_exam_status, created_at, requires_subscription, is_from_subscription', { count: 'exact' });
      
      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (paymentFilter !== 'all') {
        query = query.eq('payment_status', paymentFilter);
      }
      
      if (qualiphyFilter !== 'all') {
        query = query.eq('qualiphy_exam_status', qualiphyFilter);
      }
      
      // Add pagination and order
      query = query
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      const { data, error, count } = await query;
      
      if (error) {
        throw error;
      }
      
      setAppointments(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh appointment statuses
  const refreshAppointmentStatus = async (appointmentId: string) => {
    try {
      const response = await fetch('/api/appointments/sync-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh appointment status');
      }
      
      // Refresh the list
      fetchAppointments();
    } catch (err) {
      console.error('Error refreshing appointment status:', err);
      setError('Failed to refresh appointment status');
    }
  };

  // Render loading state
  if (loading && appointments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
        <p>{error}</p>
        <button 
          onClick={() => fetchAppointments()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Filter controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
            className="mt-1 block w-40 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
          <select 
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'all')}
            className="mt-1 block w-40 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Qualiphy Status</label>
          <select 
            value={qualiphyFilter}
            onChange={(e) => setQualiphyFilter(e.target.value as QualiphyExamStatus | 'all')}
            className="mt-1 block w-40 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Qualiphy</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Deferred">Deferred</option>
            <option value="N/A">N/A</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => fetchAppointments()}
            className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
        </div>
      </div>
      
      {/* Appointments table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Treatment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qualiphy
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{appointment.customer_name}</div>
                  <div className="text-sm text-gray-500">{appointment.user_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{appointment.treatment_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {appointment.appointment_date 
                      ? formatDate(appointment.appointment_date, 'short')
                      : 'Not scheduled'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(appointment.created_at, 'short')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${appointment.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                      appointment.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                      appointment.payment_status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {appointment.payment_status.charAt(0).toUpperCase() + appointment.payment_status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {appointment.qualiphy_exam_status ? (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${appointment.qualiphy_exam_status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        appointment.qualiphy_exam_status === 'Deferred' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.qualiphy_exam_status === 'N/A' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'}`}>
                      {appointment.qualiphy_exam_status}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Not set</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appointment.requires_subscription ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      Required
                    </span>
                  ) : (
                    <span>Not required</span>
                  )}
                  {appointment.is_from_subscription && (
                    <span className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      From subscription
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => refreshAppointmentStatus(appointment.id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Refresh Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {appointments.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, totalCount)} of {totalCount} appointments
        </div>
        <div className="flex-1 flex justify-end">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {/* Page numbers */}
            {[...Array(Math.ceil(totalCount / pageSize))].slice(Math.max(0, page - 3), Math.min(Math.ceil(totalCount / pageSize), page + 2)).map((_, idx) => {
              const pageNumber = Math.max(1, page - 2) + idx;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === pageNumber
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(totalCount / pageSize)}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}