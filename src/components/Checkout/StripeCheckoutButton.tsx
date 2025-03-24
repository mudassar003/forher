// src/components/Checkout/StripeCheckoutButton.tsx
'use client';

import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useCartStore } from '@/store/cartStore';

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

interface StripeCheckoutButtonProps {
  checkoutData: CheckoutData;
  isFormValid: boolean;
}

const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({
  checkoutData,
  isFormValid,
}) => {
  const { isLoading, error, initiateCheckout } = useStripeCheckout();
  const { cart } = useCartStore();
  
  const handleCheckout = async () => {
    if (!isFormValid || isLoading || cart.length === 0) return;
    
    await initiateCheckout(checkoutData);
  };
  
  return (
    <div>
      <button 
        onClick={handleCheckout}
        disabled={!isFormValid || isLoading || cart.length === 0}
        className={`w-full mt-6 ${
          !isFormValid || isLoading || cart.length === 0 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-black hover:bg-gray-800"
        } text-white py-4 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-lg font-medium transition-colors`}
      >
        {isLoading ? "Processing..." : "Pay with Stripe"}
      </button>
      
      {error && (
        <div className="mt-3 text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default StripeCheckoutButton;