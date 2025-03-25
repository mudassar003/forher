// src/app/(checkout)/checkout/success/page.tsx
'use client';

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

// Content component that uses useSearchParams
function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCartStore();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear the cart on successful checkout
    clearCart();
    
    // If we have a session ID, we can fetch the order details
    if (sessionId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
      setError("No session ID found. Your order may still have been processed.");
    }
  }, [sessionId, clearCart]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/by-session?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setOrderId(data.orderId);
      } else {
        setError(data.error || "Failed to retrieve order details");
      }
    } catch (err) {
      setError("An error occurred while retrieving your order details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-center py-12 px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Order!</h1>
      <p className="text-gray-700 mb-6">Your payment was successful and your order has been placed. We will notify you once it is shipped.</p>

      {loading ? (
        <div className="my-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order details...</p>
        </div>
      ) : (
        <>
          {orderId ? (
            <p className="text-lg font-semibold text-blue-600 mb-4">Order ID: {orderId}</p>
          ) : (
            <p className="text-gray-600 mb-4">
              {error || "We couldn't retrieve your order ID, but your order is confirmed."}
            </p>
          )}
        </>
      )}

      <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
        <Link href="/shop">
          <button className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700">
            Continue Shopping
          </button>
        </Link>
        <Link href="/orders">
          <button className="bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300">
            View Your Orders
          </button>
        </Link>
      </div>
    </div>
  );
}

// Loading fallback for the Suspense boundary
function CheckoutSuccessFallback() {
  return (
    <div className="max-w-4xl mx-auto text-center py-12 px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading Order Details</h1>
      <div className="my-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing your order information...</p>
      </div>
    </div>
  );
}

// The main page component that uses Suspense
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}