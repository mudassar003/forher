// src/app/admin/subscriptions/page.tsx
"use client";

import { useState, useEffect } from "react";
import SubscriptionTable from "./components/SubscriptionTable";
import AdminHeader from "../components/AdminHeader";
import StatusUpdateModal from "./components/StatusUpdateModal";

interface Subscription {
  id: string;
  user_email: string;
  plan_name: string;
  status: string;
  is_active: boolean;
  sanity_id: string | null;
  stripe_subscription_id: string | null;
  start_date: string;
  next_billing_date: string;
  billing_amount: number;
  billing_period: string;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Function to fetch subscriptions
  const fetchSubscriptions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/admin/subscriptions");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch subscriptions");
      }
      
      const data = await response.json();
      setSubscriptions(data.subscriptions);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to update subscription status
  const updateSubscriptionStatus = async (
    subscriptionId: string, 
    newStatus: string, 
    isActive: boolean
  ) => {
    try {
      const response = await fetch("/api/admin/subscriptions/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId,
          status: newStatus,
          isActive
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update subscription status");
      }
      
      // Refresh the subscriptions list
      await fetchSubscriptions();
      setIsModalOpen(false);
      setSelectedSubscription(null);
      
      return true;
    } catch (error) {
      console.error("Error updating subscription status:", error);
      return false;
    }
  };
  
  // Open modal to edit a subscription
  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsModalOpen(true);
  };
  
  // Initial load
  useEffect(() => {
    fetchSubscriptions();
  }, []);
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AdminHeader title="Subscription Management" />
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Subscriptions</h1>
        <button
          className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
          onClick={() => fetchSubscriptions()}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
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
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <SubscriptionTable 
        subscriptions={subscriptions} 
        isLoading={isLoading} 
        onEdit={handleEditSubscription}
      />
      
      {isModalOpen && selectedSubscription && (
        <StatusUpdateModal
          subscription={selectedSubscription}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSubscription(null);
          }}
          onUpdate={updateSubscriptionStatus}
        />
      )}
    </div>
  );
}