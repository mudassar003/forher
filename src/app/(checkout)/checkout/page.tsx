//src/app/checkout/page.tsx
'use client';

import { useCartStore } from "@/store/cartStore";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { countries } from "countries-list";
import CheckoutAuth from '@/components/Checkout/CheckoutAuth';
import { useAuthStore } from "@/store/authStore";
import StripePaymentForm from '@/components/Checkout/StripePaymentForm';
import StripeCheckoutButton from '@/components/Checkout/StripeCheckoutButton';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

interface ValidationErrors {
  [key: string]: string;
}

// Moved validation patterns outside the component to avoid recreation on each render
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;
const POSTAL_CODE_PATTERNS = {
  "United States": /^\d{5}(-\d{4})?$/,
  "Canada": /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  default: /^.{3,10}$/
};

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isClient, setIsClient] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("United States");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [newsOffers, setNewsOffers] = useState(true);
  const [giftCard, setGiftCard] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [billingAddressType, setBillingAddressType] = useState("same");

  // Hydration fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  const countryList = Object.values(countries).map((c) => c.name);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = 15; // $15 USD for shipping
  const total = subtotal + shippingCost;

  // Format currency as USD
  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Validate form function
  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!email) {
      errors.email = "Email is required";
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = "Invalid email address";
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!address.trim()) {
      errors.address = "Address is required";
    }

    if (!city.trim()) {
      errors.city = "City is required";
    }

    if (!phone) {
      errors.phone = "Phone number is required";
    } else if (!PHONE_PATTERN.test(phone)) {
      errors.phone = "Invalid phone number format";
    }

    const countryPostalPattern = POSTAL_CODE_PATTERNS[country as keyof typeof POSTAL_CODE_PATTERNS] 
      || POSTAL_CODE_PATTERNS.default;
    if (postalCode && !countryPostalPattern.test(postalCode)) {
      errors.postalCode = "Invalid postal code format";
    }

    return errors;
  };

  // Update validation status when form fields change
  useEffect(() => {
    const errors = validateForm();
    setValidationErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [email, lastName, address, city, phone, postalCode, country]);

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      // Create order data object to match API expectations
      const orderData = {
        email,
        firstName,
        lastName,
        address,
        apartment,
        city,
        country,
        postalCode,
        phone,
        paymentMethod,
        shippingMethod,
        billingAddressType,
        cart: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        }))
      };
      
      // If Stripe is selected, don't process the order here
      // The StripeCheckoutButton will handle this
      if (paymentMethod === 'card') {
        setIsSubmitting(false);
        return;
      }
      
      // Send order to API (for non-Stripe payment methods)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      if (result.success) {
        // Store order ID in localStorage for the confirmation page to access
        localStorage.setItem("lastOrderId", result.orderId);
        
        // Clear the cart
        clearCart();
        
        // Redirect to confirmation page
        window.location.href = '/checkout/order-confirmation';
      } else {
        // Handle API error
        console.error("Order placement failed:", result.error);
        alert(`Order placement failed: ${result.error}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred while placing your order. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleBlur = () => {
    // Validation happens automatically in the useEffect
  };
  
  // Create checkout data for Stripe
  const checkoutData = {
    email,
    firstName,
    lastName,
    address,
    apartment,
    city,
    country,
    postalCode,
    phone,
    paymentMethod,
    shippingMethod,
    billingAddressType
  };

  if (!isClient) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-40 bg-gray-200 rounded mb-6"></div>
          <div className="h-60 bg-gray-200 rounded"></div>
        </div>
      </div>
    ); // Show loading state and prevent hydration errors
  }

  return (
    <>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <div className="max-w-6xl mx-auto p-6">        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left Side - Checkout Form */}
          <div className="col-span-3 overflow-y-auto max-h-[calc(100vh-100px)] hide-scrollbar">
            <h1 className="text-2xl font-bold mb-8">Checkout</h1>
            
            {/* Contact Information with Authentication Component */}
            <CheckoutAuth 
              email={email}
              setEmail={setEmail}
              newsOffers={newsOffers}
              setNewsOffers={setNewsOffers}
            />

            {/* Delivery Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Delivery</h2>
              <div className="mb-4">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">Country/Region</label>
                <select
                  id="country"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  title="Select your country"
                >
                  {countryList.map((countryName) => (
                    <option key={countryName} value={countryName}>{countryName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="First name (optional)"
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={handleBlur}
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      validationErrors.lastName ? "border-red-500" : "focus:ring-1 focus:ring-black"
                    }`}
                    placeholder="Last name"
                  />
                  {validationErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={handleBlur}
                  className={`w-full p-3 border rounded-md focus:outline-none ${
                    validationErrors.address ? "border-red-500" : "focus:ring-1 focus:ring-black"
                  }`}
                  placeholder="Address"
                />
                {validationErrors.address && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
                )}
              </div>

              <div className="mb-4">
                <input 
                  type="text" 
                  value={apartment} 
                  onChange={(e) => setApartment(e.target.value)}
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <input 
                    type="text" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    onBlur={handleBlur}
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      validationErrors.city ? "border-red-500" : "focus:ring-1 focus:ring-black"
                    }`}
                    placeholder="City"
                  />
                  {validationErrors.city && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                  )}
                </div>
                <div>
                  <input 
                    type="text" 
                    value={postalCode} 
                    onChange={(e) => setPostalCode(e.target.value)}
                    onBlur={handleBlur}
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      validationErrors.postalCode ? "border-red-500" : "focus:ring-1 focus:ring-black"
                    }`}
                    placeholder="Postal code (optional)"
                  />
                  {validationErrors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.postalCode}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={handleBlur}
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      validationErrors.phone ? "border-red-500" : "focus:ring-1 focus:ring-black"
                    } pr-10`}
                    placeholder="Phone (e.g. +1234567890)"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                </div>
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Shipping Method */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Shipping method</h2>
              <div className="border rounded-md overflow-hidden">
                <div className="flex justify-between items-center p-4" style={{ backgroundColor: "#f9f9f9" }}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="standardShipping" 
                      name="shippingMethod" 
                      value="standard" 
                      checked={shippingMethod === "standard"} 
                      onChange={() => setShippingMethod("standard")} 
                      className="mr-2" 
                    />
                    <label htmlFor="standardShipping">Standard Delivery (2-5 business days)</label>
                  </div>
                  <span className="font-medium">{formatUSD(shippingCost)}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods - Now using the StripePaymentForm component */}
            <StripePaymentForm 
              onSelectPaymentMethod={setPaymentMethod}
              selectedMethod={paymentMethod}
            />

            {/* Billing Address */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Billing address</h2>
              <div className="border rounded-md overflow-hidden">
                <div className="border-b">
                  <div className="p-4 flex items-center">
                    <input 
                      type="radio" 
                      id="sameAddress" 
                      name="billingAddressType" 
                      value="same" 
                      checked={billingAddressType === "same"} 
                      onChange={() => setBillingAddressType("same")} 
                      className="mr-2" 
                    />
                    <label htmlFor="sameAddress">Same as shipping address</label>
                  </div>
                </div>
                <div>
                  <div className="p-4 flex items-center">
                    <input 
                      type="radio" 
                      id="differentAddress" 
                      name="billingAddressType" 
                      value="different" 
                      checked={billingAddressType === "different"} 
                      onChange={() => setBillingAddressType("different")} 
                      className="mr-2" 
                    />
                    <label htmlFor="differentAddress">Use a different billing address</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Return to cart link */}
            <div className="mb-8">
              <Link href="/cart" className="flex items-center text-black hover:underline">
                <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Return to cart
              </Link>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="col-span-2 bg-gray-50 p-6 rounded-md sticky top-6 h-fit">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
            
            <div className="mb-6 max-h-[300px] overflow-y-auto">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center mb-4">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 bg-white">
                    <Image
                      src={item.image ?? '/placeholder.png'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                  </div>
                  <div className="font-medium">{formatUSD(item.price)}</div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={giftCard} 
                  onChange={(e) => setGiftCard(e.target.value)} 
                  className="flex-grow p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Discount code"
                />
                <button 
                  className="bg-gray-200 text-black py-3 px-6 rounded-md hover:bg-gray-300 focus:outline-none transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal · {cart.length} items</span>
                <span>{formatUSD(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span>Shipping</span>
                  <div className="text-gray-500">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                </div>
                <span>{formatUSD(shippingCost)}</span>
              </div>
              <div className="flex justify-between items-center font-bold py-4 border-t">
                <span>Total</span>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-normal">USD</div>
                  <span>{formatUSD(total)}</span>
                </div>
              </div>
            </div>
            
            {/* Complete Order Button - Conditional based on payment method */}
            {paymentMethod === 'card' ? (
              <StripeCheckoutButton 
                checkoutData={checkoutData}
                isFormValid={isFormValid}
              />
            ) : (
              <button 
                onClick={handlePlaceOrder}
                disabled={isSubmitting || !isFormValid}
                className={`w-full mt-6 ${
                  isSubmitting || !isFormValid ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                } text-white py-4 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-lg font-medium transition-colors`}
              >
                {isSubmitting ? "Processing..." : "Complete order"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}