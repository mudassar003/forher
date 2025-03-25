// src/components/Appointment/AppointmentCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { useAppointmentPurchase } from '@/hooks/useAppointmentPurchase';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface AppointmentCardProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  image?: SanityImageSource;
  qualiphyExamId?: number;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  id,
  title,
  description,
  price,
  duration,
  image,
  qualiphyExamId
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [useSubscription, setUseSubscription] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { purchaseAppointment, isLoading, error } = useAppointmentPurchase();
  const { subscriptions, hasActiveSubscription } = useSubscriptionStore();

  // Find eligible subscription with appointment access and available appointments
  const eligibleSubscription = subscriptions.find(sub => 
    sub.status.toLowerCase() === 'active' && 
    sub.appointmentsIncluded > sub.appointmentsUsed
  );

  // Calculate discounted price if applicable
  const getDiscountedPrice = () => {
    if (eligibleSubscription && eligibleSubscription.appointmentDiscountPercentage > 0) {
      const discountPercent = eligibleSubscription.appointmentDiscountPercentage;
      return price * (1 - discountPercent / 100);
    }
    return price;
  };

  const displayPrice = useSubscription ? getDiscountedPrice() : price;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle appointment booking
  const handleBookAppointment = async () => {
    if (isProcessing || isLoading) return;
    
    setIsProcessing(true);
    
    try {
      const result = await purchaseAppointment(id, {
        useSubscription: useSubscription,
        subscriptionId: useSubscription && eligibleSubscription ? eligibleSubscription.id : undefined
      });
      
      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      }
    } catch (err) {
      console.error('Failed to initiate appointment booking:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col bg-white border rounded-lg shadow-sm overflow-hidden h-full">
      {/* Header with image if available */}
      {image && (
        <div className="relative h-32 w-full overflow-hidden">
          <Image
            src={urlFor(image).width(600).url()}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="p-6 flex flex-col h-full">
        {/* Title and price */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(displayPrice)}</span>
            <span className="ml-1 text-gray-500">for {duration} minutes</span>
          </div>
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        
        {/* Subscription discount option */}
        {hasActiveSubscription && eligibleSubscription && (
          <div className="mt-4 mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useSubscription}
                onChange={() => setUseSubscription(!useSubscription)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {eligibleSubscription.appointmentDiscountPercentage > 0 ? (
                  `Use my subscription (${eligibleSubscription.appointmentDiscountPercentage}% discount)`
                ) : (
                  'Use my subscription'
                )}
              </span>
            </label>
            
            {useSubscription && eligibleSubscription.appointmentDiscountPercentage > 0 && (
              <div className="mt-2 text-sm text-green-600">
                <p>Original price: {formatCurrency(price)}</p>
                <p>You save: {formatCurrency(price - displayPrice)}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Features */}
        <ul className="mt-4 space-y-3 flex-grow">
          <li className="flex">
            <svg
              className="h-5 w-5 text-green-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="ml-2 text-gray-600">{duration} minute consultation</span>
          </li>
          <li className="flex">
            <svg
              className="h-5 w-5 text-green-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="ml-2 text-gray-600">Licensed healthcare provider</span>
          </li>
          <li className="flex">
            <svg
              className="h-5 w-5 text-green-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="ml-2 text-gray-600">Convenient telehealth</span>
          </li>
          {qualiphyExamId && (
            <li className="flex">
              <svg
                className="h-5 w-5 text-green-500 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-2 text-gray-600">Professional medical advice</span>
            </li>
          )}
        </ul>
        
        {/* Book button */}
        <div className="mt-6">
          <button
            onClick={handleBookAppointment}
            disabled={isProcessing || isLoading || !isAuthenticated}
            className={`w-full px-4 py-2 rounded-md text-white font-medium ${
              isProcessing || isLoading || !isAuthenticated
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-pink-600 hover:bg-pink-700'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50`}
          >
            {isProcessing || isLoading ? 'Processing...' : 'Book Appointment'}
          </button>
          
          {!isAuthenticated && (
            <p className="mt-2 text-sm text-gray-500 text-center">
              Please log in to book an appointment
            </p>
          )}
          
          {error && (
            <p className="mt-2 text-sm text-red-600 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;