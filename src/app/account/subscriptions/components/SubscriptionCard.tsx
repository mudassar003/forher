//src/app/account/subscriptions/components/SubscriptionCard.tsx
"use client";
import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { Subscription } from "@/store/subscriptionStore";
import { SubscriptionModal } from "./SubscriptionModal";

interface SubscriptionCardProps {
  subscription: Subscription;
  onCancel: (subscriptionId: string) => Promise<void>;
}

export const SubscriptionCard = ({ subscription, onCancel }: SubscriptionCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await onCancel(subscription.id);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-800">{subscription.plan_name}</h3>
            <StatusBadge status={subscription.status} />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-600 mb-3">
            <p>Started: {formatDate(subscription.start_date)}</p>
            <p>Next billing: {formatDate(subscription.next_billing_date)}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 pt-3 border-t border-gray-100">
            <div className="mb-2 sm:mb-0">
              <span className="font-medium text-gray-800">${subscription.billing_amount}</span>
              <span className="text-gray-600 text-sm"> / {subscription.billing_period}</span>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
              >
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <SubscriptionModal 
          subscription={subscription}
          onClose={() => setIsModalOpen(false)}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default SubscriptionCard;