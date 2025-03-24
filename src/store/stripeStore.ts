// src/store/stripeStore.ts
import { create } from "zustand";

interface StripeState {
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
  checkoutUrl: string | null;
  
  // Actions
  startCheckout: () => void;
  setCheckoutSuccess: (sessionId: string, checkoutUrl: string) => void;
  setCheckoutError: (error: string) => void;
  resetCheckout: () => void;
}

export const useStripeStore = create<StripeState>((set) => ({
  isLoading: false,
  error: null,
  sessionId: null,
  checkoutUrl: null,
  
  // Set the loading state when checkout starts
  startCheckout: () => set({ 
    isLoading: true, 
    error: null,
    sessionId: null,
    checkoutUrl: null 
  }),
  
  // Set the checkout success state with session ID and checkout URL
  setCheckoutSuccess: (sessionId, checkoutUrl) => set({ 
    isLoading: false, 
    error: null,
    sessionId,
    checkoutUrl 
  }),
  
  // Set the checkout error state
  setCheckoutError: (error) => set({ 
    isLoading: false, 
    error,
    sessionId: null,
    checkoutUrl: null 
  }),
  
  // Reset the checkout state
  resetCheckout: () => set({ 
    isLoading: false, 
    error: null,
    sessionId: null,
    checkoutUrl: null 
  }),
}));