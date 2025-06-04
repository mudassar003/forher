//src/app/account/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { updatePassword } from "@/lib/auth";

const AccountSettingsPage = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  
  // Form states
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string }>({ text: "", type: "" });
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: string }>({ text: "", type: "" });
  
  // Load user data
  useEffect(() => {
    if (!user) {
      router.push("/login?returnUrl=" + encodeURIComponent("/account/settings"));
      return;
    }
    
    // Set initial values from user metadata
    setName(user.user_metadata?.full_name || user.user_metadata?.name || "");
    setDateOfBirth(user.user_metadata?.date_of_birth || "");
  }, [user, router]);
  
  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          date_of_birth: dateOfBirth
        }
      });
      
      if (error) throw error;
      
      setMessage({
        text: "Profile updated successfully!",
        type: "success"
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({
        text: error.message || "Failed to update profile. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPasswordMessage({ text: "", type: "" });
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        text: "New passwords don't match.",
        type: "error"
      });
      setLoading(false);
      return;
    }
    
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // First, verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || "",
        password: currentPassword,
      });
      
      if (signInError) {
        setPasswordMessage({
          text: "Current password is incorrect.",
          type: "error"
        });
        setLoading(false);
        return;
      }
      
      // Update password
      const { error } = await updatePassword(newPassword);
      
      if (error) throw error;
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      setPasswordMessage({
        text: "Password updated successfully!",
        type: "success"
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      setPasswordMessage({
        text: error.message || "Failed to update password. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // If no user, show loading
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-black">Account Settings</h1>
      
      {/* Profile Information Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-black">Profile Information</h2>
        
        {message.text && (
          <div 
            className={`p-3 mb-4 rounded-md ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleProfileUpdate}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={user.email || ""}
              disabled
              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-black"
            />
            <p className="text-sm text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none text-black"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none text-black"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
      
      {/* Password Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Change Password</h2>
        
        {passwordMessage.text && (
          <div 
            className={`p-3 mb-4 rounded-md ${
              passwordMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {passwordMessage.text}
          </div>
        )}
        
        <form onSubmit={handlePasswordUpdate}>
          <div className="mb-4">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none text-black"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none text-black"
              required
              minLength={6}
            />
            <p className="text-sm text-gray-500 mt-1">
              Password must be at least 6 characters
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none text-black"
              required
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettingsPage;