"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase"; // Import Supabase client

export default function PersonalDetails() {
  const { user, loading, checkSession } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
  });

  // Fetch user details from Supabase Auth
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.name || "Not provided",
        email: user.email || "Not provided",
        phone: user.user_metadata?.phone || "Not provided",
        birthday: user.user_metadata?.birthday || "Not provided",
      });
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save changes to Supabase
  const saveChanges = async () => {
    setEditing(false);

    const { data, error } = await supabase.auth.updateUser({
      data: {
        name: formData.name,
        phone: formData.phone,
        birthday: formData.birthday, // Update birthday in user_metadata
      },
    });

    if (error) {
      console.error("Error updating profile:", error);
    } else {
      console.log("Profile updated successfully", data);
      checkSession(); // Refresh user data
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Account Details</h2>
        <button
          onClick={editing ? saveChanges : () => setEditing(true)}
          className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 3.487a1.5 1.5 0 012.121 2.121L6.812 17.78a4.5 4.5 0 01-1.751 1.1l-2.285.646a.375.375 0 01-.472-.472l.646-2.285a4.5 4.5 0 011.1-1.751L16.862 3.487z"
            />
          </svg>
          {editing ? "Save" : "Edit"}
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-gray-500">Name</p>
          {editing ? (
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full text-black font-medium border-b border-gray-300 focus:border-black outline-none p-1"
              title="Enter your name"
              placeholder="Full name"
            />
          ) : (
            <p className="text-black font-medium">{formData.name}</p>
          )}
        </div>
        <div>
          <p className="text-gray-500">Email</p>
          <p className="text-black font-medium">{formData.email}</p> {/* Email is non-editable */}
        </div>
        <div>
          <p className="text-gray-500">Phone</p>
          {editing ? (
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full text-black font-medium border-b border-gray-300 focus:border-black outline-none p-1"
              title="Enter your phone number"
              placeholder="Phone number"
            />
          ) : (
            <p className="text-black font-medium">{formData.phone}</p>
          )}
        </div>
        <div>
          <p className="text-gray-500">Birthday</p>
          {editing ? (
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="w-full text-black font-medium border-b border-gray-300 focus:border-black outline-none p-1"
              title="Enter your birthday"
              placeholder="YYYY-MM-DD"
            />
          ) : (
            <p className="text-black font-medium">{formData.birthday}</p>
          )}
        </div>
      </div>
    </div>
  );
}
