// src/app/(checkout)/checkout/cancel/page.tsx
'use client';

import Link from "next/link";
import { useEffect } from "react";
import { useStripeStore } from "@/store/stripeStore";

export default function CheckoutCancelPage() {
  const { resetCheckout } = useStripeStore();

  useEffect(() => {
    // Reset the checkout state when landing on the cancel page
    resetCheckout();
  }, [resetCheckout]);

  return (
    <div className="max-w-4xl mx-auto text-center py-12 px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
      <p className="text-gray-700 mb-6">
        Your payment was cancelled or did not complete successfully. Your order has not been processed, and you have not been charged.
      </p>

      <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
        <Link href="/checkout">
          <button className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700">
            Try Again
          </button>
        </Link>
        <Link href="/cart">
          <button className="bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300">
            Return to Cart
          </button>
        </Link>
      </div>
    </div>
  );
}