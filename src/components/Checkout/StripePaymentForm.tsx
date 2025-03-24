// src/components/Checkout/StripePaymentForm.tsx
'use client';

import { useState } from 'react';

interface StripePaymentFormProps {
  onSelectPaymentMethod: (method: string) => void;
  selectedMethod: string;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  onSelectPaymentMethod,
  selectedMethod,
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Payment</h2>
      <p className="text-gray-600 mb-4">All transactions are secure and encrypted.</p>
      <div className="border rounded-md overflow-hidden">
        {/* Cash on Delivery Option */}
        <div className="border-b">
          <div className="p-4 flex items-center">
            <input 
              type="radio" 
              id="codPayment" 
              name="paymentMethod" 
              value="cod" 
              checked={selectedMethod === "cod"} 
              onChange={() => onSelectPaymentMethod("cod")} 
              className="mr-2" 
            />
            <label htmlFor="codPayment" className="flex items-center">
              <span>Cash on Delivery (COD)</span>
              <svg className="ml-2" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 9V7C17 4.2 14.8 2 12 2C9.2 2 7 4.2 7 7V9" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14.5C13.1046 14.5 14 13.6046 14 12.5C14 11.3954 13.1046 10.5 12 10.5C10.8954 10.5 10 11.3954 10 12.5C10 13.6046 10.8954 14.5 12 14.5Z" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 15.6V8.4C19 7.08 17.92 6 16.6 6H7.4C6.08 6 5 7.08 5 8.4V15.6C5 16.92 6.08 18 7.4 18H16.6C17.92 18 19 16.92 19 15.6Z" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </label>
          </div>
        </div>
        
        {/* Stripe Card Payment Option */}
        <div>
          <div className="p-4 flex items-center">
            <input 
              type="radio" 
              id="cardPayment" 
              name="paymentMethod" 
              value="card" 
              checked={selectedMethod === "card"} 
              onChange={() => onSelectPaymentMethod("card")} 
              className="mr-2" 
            />
            <label htmlFor="cardPayment" className="flex items-center">
              <span>Card Payment (Stripe)</span>
              <svg className="ml-2" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M2 8.5H22" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 16.5H8" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.5 16.5H14.5" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 12.03V16.11C22 19.62 21.11 20.5 17.56 20.5H6.44C2.89 20.5 2 19.62 2 16.11V7.89C2 4.38 2.89 3.5 6.44 3.5H17.56C21.11 3.5 22 4.38 22 7.89V8.98" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </label>
          </div>
          
          {/* Additional info for card payments */}
          {selectedMethod === "card" && (
            <div className="px-4 pb-4 pl-10">
              <div className="flex flex-wrap gap-2 mb-2">
                <img src="/images/visa.svg" alt="Visa" className="h-6" />
                <img src="/images/mastercard.svg" alt="Mastercard" className="h-6" />
                <img src="/images/amex.svg" alt="American Express" className="h-6" />
                <img src="/images/discover.svg" alt="Discover" className="h-6" />
              </div>
              <p className="text-sm text-gray-600">
                You'll be redirected to Stripe's secure payment page to complete your purchase.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripePaymentForm;