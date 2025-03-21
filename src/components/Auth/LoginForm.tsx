//src/components/Auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useAuthFormStore } from "@/store/authFormStore";
import { signInWithGoogle, signInWithEmail } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc"; // Google icon
import { FaApple } from "react-icons/fa"; // Apple icon

const LoginForm = ({ returnUrl = '/dashboard' }) => {
  const {
    email,
    password,
    loading,
    error,
    setEmail,
    setPassword,
    setLoading,
    setError,
    resetForm,
  } = useAuthFormStore();

  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error, data } = await signInWithEmail(email, password);
    if (error) {
      setError(error);
    } else {
      // Store auth token - using session token if available
      if (typeof window !== 'undefined' && data && data.session) {
        localStorage.setItem('user-auth-token', data.session.access_token || 'token-placeholder');
      }
      resetForm();
      
      // Get the stored returnUrl (may have changed if user did OAuth)
      const storedReturnUrl = sessionStorage.getItem('loginReturnUrl') || returnUrl;
      sessionStorage.removeItem('loginReturnUrl'); // Clean up
      
      // Redirect to the return URL
      router.push(storedReturnUrl);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
    }
    // For OAuth, the redirect will happen automatically after auth completion
    // The returnUrl is already saved in sessionStorage
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
          required
        />

        <div className="text-right">
          <a 
            href={`/forgot-password${returnUrl !== '/dashboard' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} 
            className="text-sm text-purple-600 hover:underline"
          >
            Forgot your password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
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
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md font-semibold hover:bg-gray-100 transition disabled:opacity-50"
      >
        <FcGoogle className="text-xl" />
        {loading ? "Signing in..." : "Continue with Google"}
      </button>

      <button
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md font-semibold hover:bg-gray-100 transition mt-3 disabled:opacity-50"
      >
        <FaApple className="text-xl" />
        Continue with Apple
      </button>

      <p className="text-center text-sm mt-6 text-gray-500">
        First time here?{" "}
        <a 
          href={`/signup${returnUrl !== '/account' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} 
          className="text-blue-600 hover:underline"
        >
          Create an account
        </a>
      </p>
    </div>
  );
};

export default LoginForm;