// src/components/Auth/LoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthFormStore } from "@/store/authFormStore";
import { signInWithGoogle, signInWithEmail } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

interface LoginFormProps {
  returnUrl?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ returnUrl = '/dashboard' }) => {
  const {
    email,
    password,
    loading,
    error,
    successMessage,
    setEmail,
    setPassword,
    setLoading,
    setError,
    setSuccessMessage,
    resetForm,
  } = useAuthFormStore();

  const router = useRouter();
  const [isThrottled, setIsThrottled] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Check for throttling on component mount
  useEffect(() => {
    // Check if the user is throttled based on previous login attempts
    const attemptKey = `login_attempts_${email.toLowerCase()}`;
    const attemptData = sessionStorage.getItem(attemptKey);
    
    if (attemptData) {
      const attempts = JSON.parse(attemptData);
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (attempts.count >= 5 && (Date.now() - attempts.timestamp) < thirtyMinutes) {
        setIsThrottled(true);
        
        // Calculate time remaining and set error message
        const timeLeft = Math.ceil((thirtyMinutes - (Date.now() - attempts.timestamp)) / 60000);
        setError(`Too many login attempts. Please try again in ${timeLeft} minutes.`);
      }
    }
    
    // Cleanup function to reset the form on unmount
    return () => {
      resetForm();
    };
  }, [email, resetForm, setError]);

  const validateInputs = (): boolean => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (!password) {
      setError("Password is required");
      return false;
    }
    
    return true;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors and messages
    setError(null);
    setSuccessMessage(null);
    
    // Check if user is throttled
    if (isThrottled) {
      return;
    }
    
    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    
    try {
      const { error: authError, session } = await signInWithEmail(email, password);
      
      if (authError) {
        setError(authError);
        return;
      }

      // Store auth token if available
      if (session?.access_token) {
        localStorage.setItem('user-auth-token', session.access_token);
      }
      
      // Reset form after successful login
      resetForm();
      
      // Get the stored returnUrl (may have changed if user did OAuth)
      const storedReturnUrl = sessionStorage.getItem('loginReturnUrl') || returnUrl;
      sessionStorage.removeItem('loginReturnUrl'); // Clean up
      
      // Redirect to the return URL
      router.push(storedReturnUrl);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Clear previous errors and messages
    setError(null);
    setSuccessMessage(null);
    
    setLoading(true);
    
    try {
      const { error: authError } = await signInWithGoogle();
      
      if (authError) {
        setError(authError);
      }
      // For OAuth, the redirect will happen automatically after auth completion
      // The returnUrl is already saved in sessionStorage
    } catch (err) {
      setError("An unexpected error occurred with Google login. Please try again.");
      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
            required
            disabled={loading || isThrottled}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none pr-10"
              required
              disabled={loading || isThrottled}
              autoComplete="current-password"
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
        </div>

        <div className="text-right">
          <Link 
            href={`/forgot-password${returnUrl !== '/dashboard' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} 
            className="text-sm text-purple-600 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading || isThrottled}
          className="w-full bg-black text-white p-3 rounded-md font-semibold hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-gray-500">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading || isThrottled}
        className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        <FcGoogle className="text-xl" />
        {loading ? "Signing in..." : "Continue with Google"}
      </button>

      <button
        disabled={true} // Disabled until implemented
        className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md font-semibold hover:bg-gray-100 transition mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        <FaApple className="text-xl" />
        Continue with Apple
      </button>

      <p className="text-center text-sm mt-6 text-gray-500">
        First time here?{" "}
        <Link 
          href={`/signup${returnUrl !== '/account' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} 
          className="text-blue-600 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;