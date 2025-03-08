"use client";
import PersonalDetails from "./components/PersonalDetails";
import PaymentMethod from "./components/PaymentMethod";
import ShippingAddress from "./components/ShippingAddress";
import ChangePassword from "./components/ChangePassword";


export default function ProfilePage() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Profile</h1>
      <h2 className="text-gray-500 mb-4">Account Details</h2>

      {/* Personal Details Component */}
          
          <PersonalDetails />
          <PaymentMethod />
          <ShippingAddress />
          <ChangePassword   />
    </div>
  );
}
