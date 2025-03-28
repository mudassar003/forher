// src/components/Appointment/AppointmentCard.tsx
"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
  duration?: number;
  imageSrc?: SanityImageSource;
  qualiphyExamId?: number;
  requiresSubscription: boolean;
  hasActiveSubscription: boolean;
}

const AppointmentCard = ({
  id,
  title,
  description,
  price,
  duration = 30,
  imageSrc,
  qualiphyExamId,
  requiresSubscription,
  hasActiveSubscription
}: AppointmentCardProps) => {
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { purchaseAppointment, isLoading } = useAppointmentPurchase();

  // Handle booking logic
  const handleBookNow = async () => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    // If appointment requires subscription but user doesn't have one
    if (requiresSubscription && !hasActiveSubscription) {
      setError("This appointment requires an active subscription.");
      return;
    }

    setIsBooking(true);
    setError(null);

    try {
      // Use the appointment purchase hook
      const result = await purchaseAppointment(id, {
        useSubscription: requiresSubscription
      });

      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        setError(result.error || "Failed to book appointment.");
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border rounded-lg shadow-sm overflow-hidden">
      {/* Header with image if available */}
      {imageSrc && (
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={urlFor(imageSrc).width(600).url()}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title and Price */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <span className="text-xl font-bold text-gray-900">${price}</span>
          </div>
          {duration && (
            <p className="mt-1 text-sm text-gray-500">
              Estimated duration: {duration} minutes
            </p>
          )}
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-gray-600 mb-4 flex-grow">{description}</p>
        )}
        
        {/* Subscription requirement badge */}
        {requiresSubscription && (
          <div className="mt-1 mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              hasActiveSubscription ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'
            }`}>
              {hasActiveSubscription ? 'Subscription Access' : 'Subscription Required'}
            </span>
            
            {!hasActiveSubscription && (
              <p className="mt-2 text-xs text-gray-500">
                This appointment requires an active subscription. 
                <a href="/subscriptions" className="ml-1 text-indigo-600 hover:text-indigo-800">
                  View subscription options
                </a>
              </p>
            )}
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        {/* Book button */}
        <div className="mt-auto">
          <button
            onClick={handleBookNow}
            disabled={isBooking || isLoading || (requiresSubscription && !hasActiveSubscription)}
            className={`w-full px-4 py-2 rounded-md text-white font-medium ${
              isBooking || isLoading || (requiresSubscription && !hasActiveSubscription)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-pink-600 hover:bg-pink-700'
            } transition-colors focus:outline-none`}
          >
            {isBooking || isLoading ? 'Processing...' : 'Book Now'}
          </button>
          
          {!isAuthenticated && (
            <p className="mt-2 text-sm text-gray-500 text-center">
              Please log in to book an appointment
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;