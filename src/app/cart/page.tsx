//src/app/cart/page.tsx
"use client";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Calculate subtotal with fallback for undefined prices
  const subtotal = cart.reduce((acc, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    return acc + price * item.quantity;
  }, 0);
  
  // Handle checkout
  const handleCheckout = () => {
    // You can implement checkout logic here
    console.log("Proceeding to checkout with:", { 
      cart, 
      subtotal, 
      couponCode, 
      specialInstructions 
    });
    
    // Navigate to checkout page
    window.location.href = "/checkout";
  };

  // This is the rendered JSX
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Link href="/products">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Continue Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Product List */}
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => {
              // Add fallback for missing price
              const price = typeof item.price === 'number' ? item.price : 0;
              
              return (
                <div key={item.id} className="flex items-center border p-4 rounded-lg">
                  <div className="flex-shrink-0 w-20 h-24 relative">
                    {item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        sizes="80px"
                        className="object-cover rounded-md" 
                      />
                    ) : (
                      <div className="w-20 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-gray-700">${price.toFixed(2)} USD</p>

                    {/* Quantity Selector */}
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1 border rounded-l-md bg-gray-50 hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-t border-b">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 border rounded-r-md bg-gray-50 hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-lg font-semibold">${(price * item.quantity).toFixed(2)}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="mt-2 text-red-500 hover:text-red-700"
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
            
            <div className="mt-4">
              <label htmlFor="special-instructions" className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea 
                id="special-instructions"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Any special requests or notes for your order..."
                rows={3}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border p-6 rounded-lg bg-gray-50 h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span className="font-medium">${subtotal.toFixed(2)} USD</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)} USD</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Code
              </label>
              <div className="flex">
                <input 
                  id="coupon"
                  type="text" 
                  placeholder="Enter code" 
                  className="flex-grow p-2 border rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-r-md hover:bg-gray-300">
                  Apply
                </button>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <button 
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Proceed to Checkout
              </button>
              
              <Link href="/products">
                <button className="w-full border p-3 rounded-lg hover:bg-gray-100">
                  Continue Shopping
                </button>
              </Link>
              
              <button 
                onClick={clearCart} 
                className="w-full text-red-500 hover:text-red-700 p-2 text-sm"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}