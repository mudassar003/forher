//src/app/account/profile/components/ChangePassword.tsx
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ChangePassword() {
  const [currentPassword] = useState("••••••••"); // Placeholder for current password display
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChangePassword = async () => {
    if (!newPassword) {
      setMessage("Please enter a new password.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Password updated successfully.");
      setNewPassword("");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mt-10">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Password</h2>

      {/* Password Change Card */}
      <div className=" p-6 border border-gray-200 flex justify-between items-center">
        <div>
          <p className="text-gray-500">Current password</p>
          <p className="text-black font-medium text-lg">{currentPassword}</p>
        </div>

        {/* Change Password Button */}
        <button
          onClick={() => document.getElementById("passwordModal")?.classList.remove("hidden")}
          className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100"
        >
          Change password
        </button>
      </div>

      {/* Password Change Modal */}
      <div id="passwordModal" className="hidden fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />

          {message && <p className="text-sm text-red-500 mt-2">{message}</p>}

          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => document.getElementById("passwordModal")?.classList.add("hidden")}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
