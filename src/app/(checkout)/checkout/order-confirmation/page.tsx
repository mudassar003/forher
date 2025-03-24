//src/app/(checkout)/checkout/order-confirmation/page.tsx
'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCartStore();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Clear the cart regardless of payment method
    clearCart();
    
    // Check for Stripe session ID first
    if (sessionId) {
      fetchOrderDetailsBySession();
    } else {
      // Fall back to checking localStorage for COD payments
      const storedOrderId = localStorage.getItem("lastOrderId");
      if (storedOrderId) {
        setOrderId(storedOrderId);
        localStorage.removeItem("lastOrderId"); // Clear stored order ID after displaying
        setLoading(false);
      } else {
        setLoading(false);
        setError("No order information found. Your order may still have been processed.");
      }
    }
  }, [sessionId, clearCart]);

  const fetchOrderDetailsBySession = async () => {
    try {
      const response = await fetch(`/api/orders/by-session?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setOrderId(data.orderId);
        setLoading(false);
      } else if (response.ok && data.message && retryCount < 3) {
        // Webhook processing might be delayed, retry after a short delay
        setRetryCount(prev => prev + 1);
        setTimeout(fetchOrderDetailsBySession, 2000); // Retry after 2 seconds
      } else {
        setError(data.error || "Failed to retrieve order details");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred while retrieving your order details");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-center py-12 px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Order!</h1>
      <p className="text-gray-700 mb-6">
        {sessionId 
          ? "Your payment was successful and your order has been placed." 
          : "Your order has been placed successfully."
        } We will notify you once it is shipped.
      </p>

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
        <Link href="/products">
          <button className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700">
            Continue Shopping
          </button>
        </Link>
        <Link href="/account/orders">
          <button className="bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300">
            View Your Orders
          </button>
        </Link>
      </div>
    </div>
  );
}