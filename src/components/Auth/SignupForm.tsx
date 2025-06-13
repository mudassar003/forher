// src/components/Auth/SignupForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthFormStore } from "@/store/authFormStore";
import { useAuthStore } from "@/store/authStore"; 
import { signUpWithEmail, signInWithGoogle } from "@/lib/auth";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

interface SignupFormProps {
  returnUrl?: string;
}

const SignupForm: React.FC<SignupFormProps> = ({ returnUrl = '/' }) => {
  const {
    email,
    password,
    loading,
    error,
    successMessage,
    passwordStrength,
    setEmail,
    setPassword,
    setLoading,
    setError,
    setSuccessMessage,
    validatePassword,
    resetForm,
  } = useAuthFormStore();

  // Add auth store to update auth state after signup
  const { setUser, checkSession, isAuthenticated } = useAuthStore();

  const router = useRouter();
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isHoneypotFilled, setIsHoneypotFilled] = useState<boolean>(false);

  // Initialize reCAPTCHA
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
  const { executeRecaptcha } = useRecaptcha({ siteKey: recaptchaSiteKey });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const storedReturnUrl = sessionStorage.getItem('loginReturnUrl') || returnUrl;
      router.push(storedReturnUrl);
    }
  }, [isAuthenticated, returnUrl, router]);

  // Reset form on component unmount
  useEffect(() => {
    return () => {
      resetForm();
    };
  }, [resetForm]);

  // Check for pending subscription
  useEffect(() => {
    const pendingSubscriptionId = sessionStorage.getItem('pendingSubscriptionId');
    if (isAuthenticated && pendingSubscriptionId) {
      // Clear the pending subscription ID
      sessionStorage.removeItem('pendingSubscriptionId');
      
      // Redirect to subscriptions page
      router.push('/subscriptions');
    }
  }, [isAuthenticated, router]);

  const validateInputs = (): boolean => {
    // Clear any previous errors
    setError(null);
    
    // Check if honeypot is filled (bot protection)
    if (isHoneypotFilled) {
      // Silently reject without showing error
      return false;
    }
    
    // Check email format
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    // Check password
    if (!password) {
      setError("Password is required");
      return false;
    }
    
    // Validate password strength
    if (!passwordStrength.isValid) {
      setError(passwordStrength.feedback || "Password is too weak");
      return false;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    // Check terms acceptance
    if (!termsAccepted) {
      setError("You must accept the Terms & Privacy Policy");
      return false;
    }
    
    return true;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous messages
    setError(null);
    setSuccessMessage(null);
    
    // Validate all inputs
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    
    try {
      // Execute reCAPTCHA if enabled
      let recaptchaToken: string | null = null;
      if (recaptchaSiteKey) {
        recaptchaToken = await executeRecaptcha('signup');
        if (!recaptchaToken) {
          setError("Security verification failed. Please try again.");
          setLoading(false);
          return;
        }
      }

      const { error: authError, session } = await signUpWithEmail(email, password, recaptchaToken || undefined);
      
      if (authError) {
        setError(authError);
        setLoading(false);
        return;
      }
      
      /* 
      // Uncomment for email verification flow
      if (data && !data.session) {
        // Email verification is required
        setSuccessMessage("Please check your email to verify your account before logging in");
        setLoading(false);
        // Don't redirect yet, show success message
        return;
      }
      */
      
      // Update the auth state
      if (session?.user) {
        setUser(session.user);
      } else {
        // If no session returned, explicitly check the session
        await checkSession();
      }
      
      resetForm();
      
      // Get stored returnUrl or use the provided one
      const storedReturnUrl = sessionStorage.getItem('loginReturnUrl') || returnUrl;
      sessionStorage.removeItem('loginReturnUrl'); // Clean up
      
      // Set success message
      setSuccessMessage("Account created successfully! Redirecting...");
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        router.push(storedReturnUrl);
      }, 1500);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Signup error:", err);
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    // Clear any previous messages
    setError(null);
    setSuccessMessage(null);
    
    setLoading(true);
    
    try {
      // Store current return URL
      const storedReturnUrl = sessionStorage.getItem('loginReturnUrl') || returnUrl;
      
      // Pass the returnUrl to the Google OAuth function
      const { error: authError } = await signInWithGoogle(storedReturnUrl);
      
      if (authError) {
        setError(authError);
        setLoading(false);
      }
      // For OAuth, the redirect happens automatically
    } catch (err) {
      setError("An unexpected error occurred with Google login. Please try again.");
      console.error("Google signup error:", err);
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => {
    if (!password) return null;
    
    const getColorClass = () => {
      if (passwordStrength.score <= 1) return "bg-red-500";
      if (passwordStrength.score === 2) return "bg-yellow-500";
      if (passwordStrength.score === 3) return "bg-blue-500";
      return "bg-green-500";
    };
    
    return (
      <div className="mt-2">
        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColorClass()} transition-all duration-300 ease-in-out`} 
            style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
          ></div>
        </div>
        {passwordStrength.feedback && (
          <p className={`text-xs mt-1 ${passwordStrength.isValid ? 'text-green-600' : 'text-red-600'}`}>
            {passwordStrength.feedback}
          </p>
        )}
      </div>
    );
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

      <form onSubmit={handleEmailSignup} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none text-black placeholder-gray-500"
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none pr-10 text-black placeholder-gray-500"
              required
              disabled={loading}
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
          <p className="text-xs text-black mt-1">
            Password must be at least 8 characters with uppercase letters, numbers, and special characters.
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none text-black placeholder-gray-500"
            required
            disabled={loading}
            autoComplete="new-password"
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

        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
            className="mt-1 mr-2"
            disabled={loading}
          />
          <label htmlFor="terms" className="text-sm text-black">
            By creating an account, I agree to the{" "}
            <Link href="/terms-of-service" className="text-blue-600 hover:underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-black">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-black"
        type="button"
      >
        <FcGoogle className="text-xl" />
        {loading ? "Signing up..." : "Continue with Google"}
      </button>

      <p className="text-center text-sm mt-6 text-black">
        Already have an account?{" "}
        <Link 
          href={`/login${returnUrl !== '/' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} 
          className="text-blue-600 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;