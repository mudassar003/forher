'use client';

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { signInWithEmail, signUpWithEmail } from "@/lib/auth";
import LoginButton from '@/components/Auth/LoginButton';

interface ValidationErrors {
  [key: string]: string;
}

interface CheckoutAuthProps {
  email: string;
  setEmail: (email: string) => void;
  newsOffers: boolean;
  setNewsOffers: (value: boolean) => void;
}

const CheckoutAuth = ({ email, setEmail, newsOffers, setNewsOffers }: CheckoutAuthProps) => {
  const { isAuthenticated, user, loading: authLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // If the user is authenticated, pre-fill the email field
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.email) {
      setEmail(user.email);
    }
  }, [authLoading, isAuthenticated, user, setEmail]);

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    } else if (!emailPattern.test(email)) {
      return "Invalid email address";
    }
    return null;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    } else if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  const handleEmailBlur = () => {
    const emailError = validateEmail(email);
    setValidationErrors(prev => ({
      ...prev,
      email: emailError || ""
    }));
    
    // If email is valid and user is not authenticated, show password field
    if (!emailError && !isAuthenticated) {
      setShowPassword(true);
    }
  };

  const handlePasswordBlur = () => {
    if (password) {
      const passwordError = validatePassword(password);
      setValidationErrors(prev => ({
        ...prev,
        password: passwordError || ""
      }));
    }
  };

  const handleAuthentication = async () => {
    // Validate inputs
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (emailError || passwordError) {
      setValidationErrors({
        email: emailError || "",
        password: passwordError || ""
      });
      return;
    }
    
    setIsAuthenticating(true);
    setError(null);
    
    try {
      if (createAccount) {
        // Sign up
        const { error, data } = await signUpWithEmail(email, password);
        if (error) {
          setError(error);
        }
      } else {
        // Sign in
        const { error, data } = await signInWithEmail(email, password);
        if (error) {
          setError(error);
        }
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isAuthenticated) {
    // User is logged in, just show their email
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Contact</h2>
        <div className="mb-4">
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="Email"
            readOnly
          />
          <p className="text-sm text-gray-600 mt-1">You are logged in as {email}</p>
        </div>
        
        <div className="flex items-center mb-2">
          <input 
            type="checkbox" 
            id="newsOffers"
            checked={newsOffers} 
            onChange={() => setNewsOffers(!newsOffers)} 
            className="mr-2"
          />
          <label htmlFor="newsOffers" className="text-sm">Email me with news and offers</label>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Contact</h2>
      
      {/* Email Field */}
      <div className="mb-4">
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleEmailBlur}
          className={`w-full p-3 border rounded-md focus:outline-none ${
            validationErrors.email ? "border-red-500" : "focus:ring-1 focus:ring-black"
          }`}
          placeholder="Email"
        />
        {validationErrors.email && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
        )}
      </div>
      
      {/* Password Field (conditional) */}
      {showPassword && (
        <div className="mb-4">
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            onBlur={handlePasswordBlur}
            className={`w-full p-3 border rounded-md focus:outline-none ${
              validationErrors.password ? "border-red-500" : "focus:ring-1 focus:ring-black"
            }`}
            placeholder={createAccount ? "Create password" : "Password"}
          />
          {validationErrors.password && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
          )}
          
          {/* Create Account Toggle */}
          <div className="mt-2">
            <button 
              type="button"
              onClick={() => setCreateAccount(!createAccount)}
              className="text-blue-600 hover:underline text-sm"
            >
              {createAccount ? "Login to existing account" : "Create a new account instead"}
            </button>
          </div>
          
          {/* Login/Signup Button */}
          <button
            type="button"
            onClick={handleAuthentication}
            disabled={isAuthenticating}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {isAuthenticating ? "Processing..." : createAccount ? "Create Account" : "Login"}
          </button>
          
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
      )}
      
      {/* News & Offers Checkbox */}
      <div className="flex items-center mb-2">
        <input 
          type="checkbox" 
          id="newsOffers"
          checked={newsOffers} 
          onChange={() => setNewsOffers(!newsOffers)} 
          className="mr-2"
        />
        <label htmlFor="newsOffers" className="text-sm">Email me with news and offers</label>
      </div>
      
      {/* Login Link (only shown if password field is not visible) */}
      {!showPassword && (
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold">Already have an account?</p>
          <LoginButton 
            buttonText="Login" 
            className="text-blue-600 hover:underline" 
          />
        </div>
      )}
    </div>
  );
};

export default CheckoutAuth;