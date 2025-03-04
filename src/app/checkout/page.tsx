'use client';

import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();

  // Form states
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Pakistan");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [newsOffers, setNewsOffers] = useState(true);
  const [giftCard, setGiftCard] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [billingAddressType, setBillingAddressType] = useState("same");

  // Calculate subtotal
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = 150;
  const total = subtotal + shippingCost;

  // Handle order submission
  const handlePlaceOrder = () => {
    if (!email || !lastName || !address || !city || !phone) {
      alert("Please fill in all required fields.");
      return;
    }

    console.log("Order Placed:", { 
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
      cart 
    });

    clearCart();
    window.location.href = "/order-confirmation";
  };

  const handleApplyGiftCard = () => {
    if (giftCard) {
      // Logic to apply gift card
      console.log("Gift card applied:", giftCard);
      alert("Gift card applied!");
    }
  };

  return (
    <>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">DirectForHer</h1>
          <Link href="/cart">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </div>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left Side - Checkout Form */}
          <div className="col-span-3 overflow-y-auto max-h-[calc(100vh-100px)] hide-scrollbar">
            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <div className="mb-4">
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Email"
                />
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
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Already have an account?</span>
                <a href="/login" className="text-blue-600 text-sm hover:underline">Log in</a>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Delivery</h2>
              
              <div className="mb-4">
                <select 
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Qatar">Qatar</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="First name (optional)"
                />
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Last name"
                />
              </div>

              <div className="mb-4">
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Address"
                />
              </div>

              <div className="mb-4">
                <input 
                  type="text" 
                  value={apartment} 
                  onChange={(e) => setApartment(e.target.value)} 
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="City"
                />
                <input 
                  type="text" 
                  value={postalCode} 
                  onChange={(e) => setPostalCode(e.target.value)} 
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Postal code (optional)"
                />
              </div>

              <div className="mb-4">
                <div className="relative">
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
                    placeholder="Phone"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Shipping Method Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Shipping method</h2>
              <div className="border rounded-md overflow-hidden">
                <div className="flex justify-between items-center p-4 bg-blue-50">
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
                    <label htmlFor="standardShipping">Standard Delievery</label>
                  </div>
                  <div>Rs 150.00</div>
                </div>
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Payment</h2>
              <p className="text-gray-600 mb-4">All transactions are secure and encrypted.</p>
              
              <div className="border rounded-md overflow-hidden">
                <div className="border-b">
                  <div className="p-4 flex items-center">
                    <input 
                      type="radio" 
                      id="codPayment" 
                      name="paymentMethod" 
                      value="cod" 
                      checked={paymentMethod === "cod"} 
                      onChange={() => setPaymentMethod("cod")} 
                      className="mr-2" 
                    />
                    <label htmlFor="codPayment">Cash on Delivery (COD)</label>
                  </div>
                </div>
                
                <div className="border-b">
                  <div className="p-4 flex items-center">
                    <input 
                      type="radio" 
                      id="bankDeposit" 
                      name="paymentMethod" 
                      value="bank" 
                      checked={paymentMethod === "bank"} 
                      onChange={() => setPaymentMethod("bank")} 
                      className="mr-2" 
                    />
                    <label htmlFor="bankDeposit">Card Payment</label>
                  </div>
                </div>
                
    
              </div>
            </div>
            
            {/* Billing Address Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Billing address</h2>
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

            {/* Complete Order Button */}
            <div className="mb-8">
              <button 
                onClick={handlePlaceOrder}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-lg font-medium"
              >
                Complete order
              </button>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="col-span-2 bg-gray-50 p-6 rounded-md sticky top-6 h-fit">
            {/* Cart Items */}
            <div className="mb-6">
              {cart.length > 0 ? (
                cart.map((item, index) => (
                  <div key={index} className="flex items-center mb-4">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden">
                      <Image
                        // Provide a fallback image if item.image is undefined
                        src={item.image ?? '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium">{item.name}</h3>
                     
                    </div>
                    <div className="font-medium">Rs {(item.price).toFixed(2)}</div>
                  </div>
                ))
              ) : (
                // Demo items based on screenshot
                <>
                  <div className="flex items-center mb-4">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-200">
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">3</span>
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium">Mizka Classic Maxi Abaya</h3>
                      <p className="text-sm text-gray-600">Select Size: M</p>
                    </div>
                    <div className="font-medium">Rs 22,500.00</div>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-200">
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">4</span>
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium">Mizka Classic Maxi Abaya</h3>
                      <p className="text-sm text-gray-600">Select Size: S</p>
                    </div>
                    <div className="font-medium">Rs 30,000.00</div>
                  </div>
                </>
              )}
            </div>

            {/* Gift Card */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={giftCard} 
                  onChange={(e) => setGiftCard(e.target.value)} 
                  className="flex-grow p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Gift card"
                />
                <button 
                  onClick={handleApplyGiftCard}
                  className="bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 focus:outline-none"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Price Details */}
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal · {cart.length || 7} items</span>
                <span>Rs {cart.length ? subtotal.toFixed(2) : "52,500.00"}</span>
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
                <span>Rs {shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-bold py-4 border-t">
                <span>Total</span>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-normal">PKR</div>
                  <span>Rs {cart.length ? total.toFixed(2) : "52,650.00"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
