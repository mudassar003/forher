"use client";
import React from "react";

export default function ShippingAddress() {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mt-10">    
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Shipping Address</h2>

      {/* Shipping Address Card */}
      <div className="bg-white  p-6 border border-gray-200">
        <div className="space-y-4">
          {/* Orders Section */}
          <div>
            <p className="text-gray-500 font-medium">Orders</p>
            <p className="text-black font-medium">
              Need to change the address of an order that's in-progress?{" "}
              <a href="#" className="text-black underline">
                Contact customer support.
              </a>
            </p>
          </div>

          {/* Subscriptions Section */}
          <div>
            <p className="text-gray-500 font-medium">Subscriptions</p>
            <p className="text-red-500 font-medium">
              <a href="#" className="underline">Update your shipping address in your subscriptions page.</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
