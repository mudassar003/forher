//src/components/Auth/SignupForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthFormStore } from "@/store/authFormStore";
import { signUpWithEmail, signInWithGoogle } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc"; // Google icon
import { FaApple } from "react-icons/fa"; // Apple icon

const SignupForm = () => {
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
  const searchParams = useSearchParams();
  const [returnUrl, setReturnUrl] = useState<string>("/dashboard");

  // Extract the returnUrl parameter if present
  useEffect(() => {
    const returnUrlParam = searchParams?.get("returnUrl");
    if (returnUrlParam) {
      setReturnUrl(returnUrlParam);
    }
  }, [searchParams]);

  const handleEmailSignup = async () => {
    setLoading(true);
    const { error, user, session } = await signUpWithEmail(email, password);
    if (error) {
      setError(error);
    } else {
      // Store auth token
      if (typeof window !== 'undefined' && session) {
        localStorage.setItem('user-auth-token', session.access_token);
      }
      resetForm();
      router.push(returnUrl);
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    // Pass the returnUrl to the Google sign-in function
    const { error, user, session } = await signInWithGoogle(returnUrl);
    if (error) {
      setError(error);
    } else {
      // Store auth token
      if (typeof window !== 'undefined' && session) {
        localStorage.setItem('user-auth-token', session.access_token);
      }
      router.push(returnUrl);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
        />

        <button
          onClick={handleEmailSignup}
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </div>

      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-gray-500">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md font-semibold hover:bg-gray-100 transition disabled:opacity-50"
      >
        <FcGoogle className="text-xl" />
        {loading ? "Signing up..." : "Continue with Google"}
      </button>

      <button
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md font-semibold hover:bg-gray-100 transition mt-3 disabled:opacity-50"
      >
        <FaApple className="text-xl" />
        Continue with Apple
      </button>

      <p className="text-center text-xs text-gray-500 mt-4">
        By creating an account using email, Google, or Apple, I agree to the{" "}
        <a href="#" className="text-blue-600 hover:underline">
          Terms & Conditions
        </a>{" "}
        and acknowledge the{" "}
        <a href="#" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>.
      </p>

      <p className="text-center text-sm mt-6 text-gray-500">
        Already have an account?{" "}
        <a href={`/login${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} className="text-blue-600 hover:underline">
          Log in
        </a>
      </p>
    </div>
  );
};

export default SignupForm;