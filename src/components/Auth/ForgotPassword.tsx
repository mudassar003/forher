//src/components/Auth/ForgotPassword.tsx
"use client";

import { useState, useEffect } from "react";
import { sendPasswordResetEmail } from "@/lib/auth";
import Link from "next/link";

interface ForgotPasswordProps {
  returnUrl?: string | null;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ returnUrl = '' }) => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isHoneypotFilled, setIsHoneypotFilled] = useState<boolean>(false);

  useEffect(() => {
    // Clear messages when component unmounts
    return () => {
      setMessage("");
      setError("");
    };
  }, []);

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage("");
    setError("");
    
    // Check if honeypot is filled (bot protection)
    if (isHoneypotFilled) {
      // Silently reject without showing error
      setMessage("If your email exists in our system, you'll receive a reset link shortly.");
      return;
    }
    
    // Validate email
    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);
    
    try {
      const { error: resetError } = await sendPasswordResetEmail(email);
      
      if (resetError) {
        setError(resetError);
      } else {
        // Always show the same message whether email exists or not
        // to prevent user enumeration
        setMessage("If your email exists in our system, you'll receive a reset link shortly.");
        // Clear email field on success
        setEmail("");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Reset Password</h2>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-sm">
          {message}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>
        
        {/* Hidden honeypot field to catch bots */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="email-confirm">
            Please leave this blank to confirm you are human
          </label>
          <input
            type="email"
            id="email-confirm"
            name="email-confirm"
            onChange={() => setIsHoneypotFilled(true)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="text-center text-sm mt-6 text-gray-500">
        Remembered your password?{" "}
        <Link 
          href={`/login${returnUrl ? `?returnUrl=${returnUrl}` : ''}`} 
          className="text-blue-600 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;