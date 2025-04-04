// src/app/(default)/user-subscriptions/page.tsx
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { BillingPeriod } from '@/types/subscription';

// Define interfaces for type safety
interface SubscriptionFormData {
  subscriptionName: string;
  planId: string;
  billingAmount: number;
  billingPeriod: BillingPeriod;
  isActive: boolean;
  hasAppointmentAccess: boolean;
  appointmentDiscountPercentage: number;
}

interface SubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  error?: string;
}

export default function UserSubscriptionsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState<SubscriptionFormData>({
    subscriptionName: '',
    planId: '',
    billingAmount: 0,
    billingPeriod: 'monthly',
    isActive: false,
    hasAppointmentAccess: false,
    appointmentDiscountPercentage: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResponse, setSubmitResponse] = useState<SubscriptionResponse | null>(null);

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox separately
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
      return;
    }

    // Handle other input types
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResponse(null);

    try {
      const response = await fetch('/api/user-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
          userEmail: user?.email
        })
      });

      const result: SubscriptionResponse = await response.json();
      setSubmitResponse(result);

      // Reset form on success
      if (result.success) {
        setFormData({
          subscriptionName: '',
          planId: '',
          billingAmount: 0,
          billingPeriod: 'monthly',
          isActive: false,
          hasAppointmentAccess: false,
          appointmentDiscountPercentage: 0
        });
      }
    } catch (error) {
      setSubmitResponse({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Create User Subscription</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Subscription Name</label>
          <input
            type="text"
            name="subscriptionName"
            value={formData.subscriptionName}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Plan ID</label>
          <input
            type="text"
            name="planId"
            value={formData.planId}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Billing Amount</label>
          <input
            type="number"
            name="billingAmount"
            value={formData.billingAmount}
            onChange={handleInputChange}
            step="0.01"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Billing Period</label>
          <select
            name="billingPeriod"
            value={formData.billingPeriod}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="mr-2"
          />
          <label>Is Active</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="hasAppointmentAccess"
            checked={formData.hasAppointmentAccess}
            onChange={handleInputChange}
            className="mr-2"
          />
          <label>Has Appointment Access</label>
        </div>

        <div>
          <label className="block mb-2">Appointment Discount %</label>
          <input
            type="number"
            name="appointmentDiscountPercentage"
            value={formData.appointmentDiscountPercentage}
            onChange={handleInputChange}
            min="0"
            max="100"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isSubmitting ? 'Submitting...' : 'Create Subscription'}
        </button>
      </form>

      {submitResponse && (
        <div className={`mt-4 p-4 rounded ${
          submitResponse.success 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {submitResponse.success ? (
            <>
              <p>Subscription created successfully!</p>
              <p>Subscription ID: {submitResponse.subscriptionId}</p>
            </>
          ) : (
            <p>Error: {submitResponse.error}</p>
          )}
        </div>
      )}
    </div>
  );
}