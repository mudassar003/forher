// src/components/Appointment/AppointmentCard.tsx
import React from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useAppointmentPurchase } from '@/hooks/useAppointmentPurchase';
import { urlFor } from '@/sanity/lib/image';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Define the appointment props interface
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

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  id,
  title,
  description,
  price,
  duration,
  imageSrc,
  qualiphyExamId,
  requiresSubscription,
  hasActiveSubscription
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { purchaseAppointment, isLoading, error } = useAppointmentPurchase();

  // Check if user can purchase this appointment
  const canPurchase = !requiresSubscription || (requiresSubscription && hasActiveSubscription);

  // Handle appointment purchase
  const handlePurchase = async () => {
    if (!user || !canPurchase) return;
    
    try {
      const options = requiresSubscription ? { useSubscription: true } : {};
      const result = await purchaseAppointment(id, options);
      
      if (result.success && result.url) {
        // Redirect to checkout page
        window.location.href = result.url;
      }
    } catch (err) {
      console.error('Error purchasing appointment:', err);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      {imageSrc && (
        <div className="relative h-48 w-full">
          <Image
            src={urlFor(imageSrc).url()}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          
          {/* Subscription requirement badge */}
          {requiresSubscription && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Subscription Required
            </span>
          )}
        </div>
        
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        
        {duration && (
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">{duration} minutes</span>
          </div>
        )}
        
        <div className="mb-6">
          <span className="text-2xl font-bold text-pink-600">
            ${price.toFixed(2)}
          </span>
        </div>
        
        <button
          onClick={handlePurchase}
          disabled={isLoading || !isAuthenticated || !canPurchase}
          className={`w-full py-2 px-4 rounded-md font-medium text-white ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : !isAuthenticated 
                ? 'bg-gray-400 cursor-not-allowed'
                : !canPurchase
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-pink-600 hover:bg-pink-700' 
          }`}
        >
          {isLoading 
            ? 'Processing...' 
            : !isAuthenticated 
              ? 'Sign in to Book' 
              : !canPurchase
                ? 'Subscription Required'
                : 'Book Appointment' 
          }
        </button>
        
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        
        {requiresSubscription && !hasActiveSubscription && isAuthenticated && (
          <p className="mt-2 text-sm text-indigo-600">
            This appointment requires an active subscription. <a href="/subscriptions" className="underline hover:text-indigo-800">View subscription options</a>.
          </p>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;