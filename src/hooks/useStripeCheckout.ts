// src/hooks/useStripeCheckout.ts
import { useState } from 'react';
import { useStripeStore } from '@/store/stripeStore';
import { useCartStore } from '@/store/cartStore';
import { verifySession } from '@/lib/auth';

interface CheckoutData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  country: string;
  postalCode?: string;
  phone: string;
  paymentMethod: string;
  shippingMethod: string;
  billingAddressType: string;
}

export function useStripeCheckout() {
  const { cart } = useCartStore();
  const { 
    isLoading, 
    error, 
    sessionId, 
    checkoutUrl,
    startCheckout,
    setCheckoutSuccess,
    setCheckoutError 
  } = useStripeStore();

  // Function to initiate Stripe checkout
  const initiateCheckout = async (checkoutData: CheckoutData) => {
    try {
      // Verify authentication session validity
      const hasValidSession = await verifySession();
      if (!hasValidSession) {
        // Handle unauthenticated users silently - for guest checkout
        // Or throw error if auth is required:
        // throw new Error("Authentication is required for checkout");
      }
      
      startCheckout();
      
      // Ensure payment method is set to 'card' for Stripe
      const stripeCheckoutData = {
        ...checkoutData,
        paymentMethod: 'card',
        cart: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        }))
      };
      
      // Make API request to create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stripeCheckoutData),
        // Include credentials to ensure cookies are sent with the request
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create checkout session');
      }
      
      // Store session information in state
      setCheckoutSuccess(result.sessionId, result.url);
      
      // Redirect to Stripe checkout
      window.location.href = result.url;
      
      return result;
    } catch (error: any) {
      setCheckoutError(error.message || 'An error occurred during checkout');
      return { success: false, error: error.message };
    }
  };
  
  return {
    isLoading,
    error,
    sessionId,
    checkoutUrl,
    initiateCheckout,
  };
}