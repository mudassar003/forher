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

// Helper function to format billing period display
const formatBillingPeriod = (period: string): string => {
  switch (period?.toLowerCase()) {
    case 'monthly':
      return 'Monthly';
    case 'three_month':
      return '3 Months';
    case 'six_month':
      return '6 Months';
    case 'annually':
      return 'Annual';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
    case 'other':
      return 'Custom';
    default:
      return period ? period.charAt(0).toUpperCase() + period.slice(1) : 'Monthly';
  }
};

// Helper function to format billing period for price display
const formatBillingPeriodShort = (period: string): string => {
  switch (period?.toLowerCase()) {
    case 'monthly':
      return 'month';
    case 'three_month':
      return '3 months';
    case 'six_month':
      return '6 months';
    case 'annually':
      return 'year';
    case 'quarterly':
      return 'quarter';
    case 'yearly':
      return 'year';
    case 'other':
      return 'period';
    default:
      return 'month';
  }
};

export const SubscriptionCard = ({ subscription, onCancel }: SubscriptionCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
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
      <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-lg mb-1">{subscription.plan_name}</h3>
              <p className="text-sm text-gray-500">
                {formatBillingPeriod(subscription.billing_period)} Plan
              </p>
            </div>
            <StatusBadge status={subscription.status} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
            <div>
              <span className="font-medium text-gray-700">Started:</span>
              <p className="mt-1">{formatDate(subscription.start_date)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">
                {subscription.status.toLowerCase() === 'cancelled' ? 'Cancelled:' : 'Next billing:'}
              </span>
              <p className="mt-1">
                {subscription.status.toLowerCase() === 'cancelled' && subscription.cancellation_date
                  ? formatDate(subscription.cancellation_date)
                  : subscription.next_billing_date 
                    ? formatDate(subscription.next_billing_date)
                    : 'N/A'
                }
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-gray-100">
            <div className="mb-2 sm:mb-0">
              <span className="font-semibold text-lg text-gray-800">
                ${subscription.billing_amount}
              </span>
              <span className="text-gray-600 text-sm ml-1">
                / {formatBillingPeriodShort(subscription.billing_period)}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors font-medium"
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