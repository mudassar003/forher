// src/components/Appointment/AppointmentCard.tsx
import React from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { Subscription, useSubscriptionStore } from '@/store/subscriptionStore';
import { useAppointmentPurchase } from '@/hooks/useAppointmentPurchase';
import { urlFor } from '@/sanity/lib/image';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Define the appointment props interface
interface AppointmentProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  imageSrc?: SanityImageSource;
  qualiphyExamId?: number;
}

// Extend the Subscription type to include the missing properties
interface SubscriptionWithDiscount extends Subscription {
  appointmentDiscountPercentage: number;
}

const AppointmentCard: React.FC<AppointmentProps> = ({
  id,
  title,
  description,
  price,
  duration,
  imageSrc,
  qualiphyExamId
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { subscriptions } = useSubscriptionStore();
  const { purchaseAppointment, isLoading, error } = useAppointmentPurchase();

  // Find user's active subscription with the highest discount
  const eligibleSubscription = React.useMemo(() => {
    if (!subscriptions.length) return null;
    
    // Filter active subscriptions
    const activeSubscriptions = subscriptions.filter(
      sub => sub.status.toLowerCase() === 'active'
    );
    
    if (!activeSubscriptions.length) return null;
    
    // Sort by discount percentage (highest first) and return the first one
    return activeSubscriptions.sort((a, b) => {
      // Cast to SubscriptionWithDiscount to ensure TypeScript knows about the property
      const aDiscount = (a as unknown as SubscriptionWithDiscount).appointmentDiscountPercentage || 0;
      const bDiscount = (b as unknown as SubscriptionWithDiscount).appointmentDiscountPercentage || 0;
      return bDiscount - aDiscount;
    })[0] as unknown as SubscriptionWithDiscount;
  }, [subscriptions]);

  // Calculate discounted price if applicable
  const getDiscountedPrice = () => {
    if (eligibleSubscription && eligibleSubscription.appointmentDiscountPercentage > 0) {
      const discountPercent = eligibleSubscription.appointmentDiscountPercentage;
      return price * (1 - discountPercent / 100);
    }
    return price;
  };

  const finalPrice = getDiscountedPrice();
  const hasDiscount = finalPrice < price;

  // Handle appointment purchase
  const handlePurchase = async () => {
    if (!user) return;
    
    try {
      await purchaseAppointment({
        appointmentId: id,
        userId: user.id,
        userEmail: user.email || '',
        userName: user.user_metadata?.name,
        subscriptionId: eligibleSubscription ? eligibleSubscription.id : undefined
      });
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
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-700">{duration} minutes</span>
        </div>
        
        <div className="flex items-baseline mb-6">
          {hasDiscount ? (
            <>
              <span className="text-2xl font-bold text-pink-600 mr-2">
                ${finalPrice.toFixed(2)}
              </span>
              <span className="text-lg text-gray-500 line-through">
                ${price.toFixed(2)}
              </span>
              <span className="ml-2 text-sm text-green-600 font-medium">
                {eligibleSubscription.appointmentDiscountPercentage}% off with subscription
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-pink-600">
              ${price.toFixed(2)}
            </span>
          )}
        </div>
        
        <button
          onClick={handlePurchase}
          disabled={isLoading || !isAuthenticated}
          className={`w-full py-2 px-4 rounded-md font-medium text-white ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : isAuthenticated 
                ? 'bg-pink-600 hover:bg-pink-700' 
                : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading 
            ? 'Processing...' 
            : isAuthenticated 
              ? 'Book Appointment' 
              : 'Sign in to Book'
          }
        </button>
        
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;