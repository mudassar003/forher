//src/app/(checkout)/checkout/order-confirmation/page.tsx
'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrderConfirmationPage() {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const storedOrderId = localStorage.getItem("lastOrderId");
    if (storedOrderId) {
      setOrderId(storedOrderId);
      localStorage.removeItem("lastOrderId"); // Clear stored order ID after displaying
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto text-center py-12 px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Order!</h1>
      <p className="text-gray-700 mb-6">Your order has been placed successfully. We will notify you once it is shipped.</p>

      {orderId ? (
        <p className="text-lg font-semibold text-blue-600 mb-4">Order ID: {orderId}</p>
      ) : (
        <p className="text-gray-600">We couldn't retrieve your order ID, but your order is confirmed.</p>
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
