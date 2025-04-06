// src/app/(login)/reset-password/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updatePassword } from "@/lib/auth";
import Link from "next/link";

interface ResetPasswordFormProps {
  token?: string | null;
}

// Component that safely uses token from URL
const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token: tokenProp }) => {
  // Use token from props or parse from URL for direct access
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(tokenProp || null);
  
  // Get token from URL if not provided in props
  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token') || searchParams?.get('token') || null;
      setToken(tokenParam);
    }
  }, [token, searchParams]);
  const router = useRouter();
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  
  // Check token validity
  useEffect(() => {
    if (token) {
      setTokenValid(true);
    } else {
      setTokenValid(false);
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
    
    // Clear any messages when component unmounts
    return () => {
      setMessage("");
      setError("");
    };
  }, [token]);

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setError("Password is required");
      return false;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    
    // Check for strong password
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      setError("Password must include uppercase and lowercase letters, numbers, and special characters");
      return false;
    }
    
    return true;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage("");
    setError("");
    
    // Validate token
    if (!tokenValid) {
      setError("Invalid reset token. Please request a new password reset link.");
      return;
    }
    
    // Validate password
    if (!validatePassword(newPassword)) {
      return;
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    
    try {
      const { error: resetError } = await updatePassword(newPassword);
      
      if (resetError) {
        setError(resetError);
      } else {
        setMessage("Password updated successfully! Redirecting to login...");
        
        // Clear password fields
        setNewPassword("");
        setConfirmPassword("");
        
        // Redirect to login after a short delay
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Password update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => {
    if (!newPassword) return null;
    
    // Calculate password strength score (0-4)
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    
    const getColorClass = () => {
      if (score <= 1) return "bg-red-500";
      if (score === 2) return "bg-yellow-500";
      if (score === 3) return "bg-blue-500";
      return "bg-green-500";
    };
    
    const getFeedback = () => {
      if (score <= 1) return "Weak password";
      if (score === 2) return "Fair password";
      if (score === 3) return "Good password";
      return "Strong password";
    };
    
    return (
      <div className="mt-2">
        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColorClass()} transition-all duration-300 ease-in-out`} 
            style={{ width: `${(score / 4) * 100}%` }}
          ></div>
        </div>
        <p className={`text-xs mt-1 ${score >= 3 ? 'text-green-600' : 'text-red-600'}`}>
          {getFeedback()}
        </p>
      </div>
    );
  };

  // Complete the ResetPasswordForm component
  // If token is invalid, show error message with link to request new password reset
  if (tokenValid === false) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">Reset Password</h2>
        
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          <p className="font-medium">Invalid or expired reset link</p>
          <p className="mt-1">Please request a new password reset link.</p>
        </div>
        
        <div className="text-center">
          <Link 
            href="/forgot-password" 
            className="inline-block bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Set New Password</h2>

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

      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none pr-10"
              placeholder="New Password"
              required
              disabled={loading || !tokenValid}
              autoComplete="new-password"
            />
            <button 
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <PasswordStrengthIndicator />
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 8 characters with uppercase letters, numbers, and special characters.
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="Confirm New Password"
            required
            disabled={loading || !tokenValid}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !tokenValid}
          className="w-full bg-black text-white p-3 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      <p className="text-center text-sm mt-6 text-gray-500">
        <Link href="/login" className="text-blue-600 hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
};

// Loading fallback to display while the form component is loading
const LoadingFallback = () => (
  <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
    <div className="animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
      <div className="h-24 bg-gray-200 rounded mb-4"></div>
      <div className="h-12 bg-gray-200 rounded mb-4"></div>
      <div className="h-12 bg-gray-200 rounded mb-4"></div>
      <div className="h-12 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Main component
const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm token={token} />
    </Suspense>
  );
};

export default ResetPasswordPage;