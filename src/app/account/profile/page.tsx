//src/app/account/profile/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const { user, loading, checkSession } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
  });
  const [cardLast4, setCardLast4] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch user details
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.name || "Not provided",
        email: user.email || "Not provided",
        phone: user.user_metadata?.phone || "Not provided",
        birthday: user.user_metadata?.birthday || "Not provided",
      });
    }

    // Fetch payment method (if available)
    const fetchPaymentMethod = async () => {
      try {
        const { data, error } = await supabase
          .from("payments")
          .select("last4")
          .eq("user_id", user?.id)
          .single();

        if (!error && data) {
          setCardLast4(data.last4);
        }
      } catch (error) {
        console.error("Error fetching payment method:", error);
      }
    };

    if (user) {
      fetchPaymentMethod();
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save changes to Supabase
  const saveChanges = async () => {
    setEditing(false);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          phone: formData.phone,
          birthday: formData.birthday,
        },
      });

      if (error) {
        console.error("Error updating profile:", error);
      } else {
        checkSession(); // Refresh user data
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!newPassword) {
      setPasswordMessage("Please enter a new password.");
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage("");

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setPasswordMessage(`Error: ${error.message}`);
      } else {
        setPasswordMessage("Password updated successfully.");
        setNewPassword("");
        // Close modal after success
        document.getElementById("passwordModal")?.classList.add("hidden");
      }
    } catch (error) {
      setPasswordMessage("An error occurred while updating your password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
            <button
              onClick={editing ? saveChanges : () => setEditing(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                editing
                  ? "bg-pink-500 text-white hover:bg-pink-600"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {editing ? "Save Changes" : "Edit Profile"}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                  placeholder="Your full name"
                />
              ) : (
                <p className="text-gray-800">{formData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
              <p className="text-gray-800">{formData.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
              {editing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                  placeholder="Your phone number"
                />
              ) : (
                <p className="text-gray-800">{formData.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Birthday</label>
              {editing ? (
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                />
              ) : (
                <p className="text-gray-800">{formData.birthday}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Payment Method</h2>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 mb-1">Default Payment Method</p>
              {cardLast4 ? (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700 mr-2">
                    <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                    <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800 font-medium">•••• •••• •••• {cardLast4}</span>
                </div>
              ) : (
                <p className="text-gray-800">No payment method added</p>
              )}
            </div>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-300">
              {cardLast4 ? "Update" : "Add Payment Method"}
            </button>
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Security</h2>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 mb-1">Password</p>
              <p className="text-gray-800">••••••••</p>
            </div>
            <button 
              onClick={() => document.getElementById("passwordModal")?.classList.remove("hidden")}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Address Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Shipping Address</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Orders</p>
              <p className="text-gray-800">
                Need to change the address of an order that's in-progress?{" "}
                <a href="#" className="text-pink-500 hover:text-pink-600 hover:underline">
                  Contact customer support.
                </a>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Subscriptions</p>
              <p className="text-pink-500 hover:text-pink-600">
                <a href="/account/subscriptions" className="hover:underline">
                  Update your shipping address in your subscriptions page.
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <div id="passwordModal" className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
          <button 
            onClick={() => document.getElementById("passwordModal")?.classList.add("hidden")}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Change Password</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="Enter new password"
              />
            </div>
            
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {passwordMessage}
              </p>
            )}
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => document.getElementById("passwordModal")?.classList.add("hidden")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 disabled:opacity-50"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}