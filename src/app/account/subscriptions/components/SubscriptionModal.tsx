//src/app/account/subscriptions/components/SubscriptionModal.tsx
"use client";
import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { Subscription } from "@/store/subscriptionStore";

interface SubscriptionModalProps {
  subscription: Subscription;
  onClose: () => void;
  onCancel: () => Promise<void>;
  isLoading: boolean;
}

export const SubscriptionModal = ({ 
  subscription, 
  onClose, 
  onCancel,
  isLoading
}: SubscriptionModalProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Manage Subscription
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            {/* Subscription Header */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-semibold text-gray-800">{subscription.plan_name}</h4>
                  <p className="text-gray-600 mt-1">Started on {formatDate(subscription.start_date)}</p>
                </div>
                <StatusBadge status={subscription.status} />
              </div>
              
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Billing Amount:</span>
                  <span className="font-medium">${subscription.billing_amount} / {subscription.billing_period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Billing Date:</span>
                  <span className="font-medium">{formatDate(subscription.next_billing_date)}</span>
                </div>
              </div>
            </div>

            {/* Subscription Features */}
            <div className="mb-6">
              <h5 className="font-medium text-gray-800 mb-3">Subscription Features</h5>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Access to premium features</li>
                <li>Priority telehealth appointments</li>
                <li>Discounted consultation fees</li>
                {subscription.appointmentsIncluded > 0 && (
                  <li>
                    <span className="font-medium">
                      {subscription.appointmentsUsed} / {subscription.appointmentsIncluded}
                    </span> appointments used
                  </li>
                )}
              </ul>
            </div>
            
            {/* Subscription Controls */}
            {!showConfirmation ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-3">Subscription Details</h5>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-gray-600">Current billing frequency</p>
                      <p className="font-medium">Every {subscription.billing_period}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-3">Cancellation Policy</h5>
                  <p className="text-gray-600 text-sm">
                    You can cancel your subscription at any time. Your subscription benefits will 
                    continue until the end of your current billing period. No refunds are provided for 
                    partial billing periods.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-medium text-red-700 mb-3">Confirm Cancellation</h5>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to cancel your subscription? You'll lose access to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
                  <li>Priority telehealth appointments</li>
                  <li>Discounted consultation fees</li>
                  <li>Premium features</li>
                </ul>
                <p className="text-sm text-gray-600 mb-4">
                  Your subscription will remain active until {formatDate(subscription.next_billing_date)}, 
                  after which it will not renew.
                </p>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
            {!showConfirmation ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                {subscription.status.toLowerCase() === "active" && (
                  <button 
                    onClick={() => setShowConfirmation(true)}
                    className="px-4 py-2 border border-red-500 text-red-500 font-medium rounded-md hover:bg-red-50"
                  >
                    Cancel Subscription
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Keep Subscription
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;