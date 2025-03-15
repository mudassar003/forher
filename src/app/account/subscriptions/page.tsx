//src/app/account/subscriptions/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Define the Subscription interface
interface Subscription {
  id: string;
  plan_name: string;
  status: string;
  billing_amount: number;
  billing_period: string;
  next_billing_date: string;
  start_date: string;
  products: SubscriptionProduct[];
}

interface SubscriptionProduct {
  id: string;
  name: string;
  quantity: number;
  image: string | null;
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = "bg-gray-100 text-gray-800";
  
  switch (status.toLowerCase()) {
    case "active":
      bgColor = "bg-green-100 text-green-800";
      break;
    case "paused":
      bgColor = "bg-yellow-100 text-yellow-800";
      break;
    case "cancelled":
      bgColor = "bg-red-100 text-red-800";
      break;
    case "pending":
      bgColor = "bg-blue-100 text-blue-800";
      break;
    default:
      bgColor = "bg-gray-100 text-gray-800";
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {status}
    </span>
  );
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      // Simulated data - replace with actual API call in production
      setTimeout(() => {
        setSubscriptions([
          {
            id: "sub_1",
            plan_name: "Hair Growth Premium",
            status: "Active",
            billing_amount: 89.99,
            billing_period: "monthly",
            next_billing_date: "2025-04-15",
            start_date: "2025-01-15",
            products: [
              {
                id: "prod_1",
                name: "Hair Growth Serum",
                quantity: 1,
                image: null,
              },
              {
                id: "prod_2",
                name: "Biotin Supplement",
                quantity: 1,
                image: null,
              }
            ]
          },
          {
            id: "sub_2",
            plan_name: "Weight Management",
            status: "Paused",
            billing_amount: 59.99,
            billing_period: "monthly",
            next_billing_date: "2025-04-10",
            start_date: "2025-02-10",
            products: [
              {
                id: "prod_3",
                name: "Metabolism Booster",
                quantity: 1,
                image: null,
              }
            ]
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchSubscriptions();
  }, []);

  const viewSubscriptionDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    document.getElementById("subscriptionDetailsModal")?.classList.remove("hidden");
  };

  const closeSubscriptionDetails = () => {
    document.getElementById("subscriptionDetailsModal")?.classList.add("hidden");
    setSelectedSubscription(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Your Subscriptions</h2>
          <Link href="/shop/subscriptions" className="px-4 py-2 bg-pink-500 text-white text-sm rounded-md hover:bg-pink-600 transition-colors">
            Browse Plans
          </Link>
        </div>

        {subscriptions.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-pink-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No active subscriptions</h3>
            <p className="text-gray-600 mb-6">Subscribe to your favorite products for regular delivery and save.</p>
            <Link href="/shop/subscriptions" className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
              Browse Subscription Plans
            </Link>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">{subscription.plan_name}</h3>
                    <StatusBadge status={subscription.status} />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-600 mb-3">
                    <p>Started: {formatDate(subscription.start_date)}</p>
                    <p>Next billing: {formatDate(subscription.next_billing_date)}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 pt-3 border-t border-gray-100">
                    <div className="mb-2 sm:mb-0">
                      <span className="font-medium text-gray-800">${subscription.billing_amount}</span>
                      <span className="text-gray-600 text-sm"> / {subscription.billing_period}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => viewSubscriptionDetails(subscription)}
                        className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                      >
                        Manage
                      </button>
                      {subscription.status.toLowerCase() === "active" ? (
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                          Pause
                        </button>
                      ) : subscription.status.toLowerCase() === "paused" ? (
                        <button className="px-3 py-1 border border-pink-500 bg-white text-pink-500 text-sm rounded hover:bg-pink-50">
                          Resume
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Management Info */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Subscription Benefits</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-pink-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800 mb-1">Save 15%</h3>
                <p className="text-sm text-gray-600">Subscribers save 15% on every order</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-pink-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800 mb-1">Free Shipping</h3>
                <p className="text-sm text-gray-600">All subscriptions include free shipping</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-pink-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800 mb-1">Flexible Delivery</h3>
                <p className="text-sm text-gray-600">Skip, pause, or cancel anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Details Modal */}
      <div id="subscriptionDetailsModal" className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
            {selectedSubscription && (
              <>
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Manage Subscription
                  </h3>
                  <button onClick={closeSubscriptionDetails} className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6">
                  {/* Subscription Header */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-800">{selectedSubscription.plan_name}</h4>
                        <p className="text-gray-600 mt-1">Started on {formatDate(selectedSubscription.start_date)}</p>
                      </div>
                      <StatusBadge status={selectedSubscription.status} />
                    </div>
                    
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Billing Amount:</span>
                        <span className="font-medium">${selectedSubscription.billing_amount} / {selectedSubscription.billing_period}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Billing Date:</span>
                        <span className="font-medium">{formatDate(selectedSubscription.next_billing_date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Products Section */}
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-800 mb-3">Products in this subscription</h5>
                    <div className="space-y-4">
                      {selectedSubscription.products.map((product) => (
                        <div key={product.id} className="flex items-center border border-gray-200 rounded-lg p-3">
                          <div className="w-14 h-14 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            <h6 className="font-medium text-gray-800">{product.name}</h6>
                            <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Subscription Controls */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-3">Delivery Schedule</h5>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <p className="text-gray-600">Current delivery frequency</p>
                          <p className="font-medium">Every {selectedSubscription.billing_period}</p>
                        </div>
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100">
                          Change
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-3">Shipping Address</h5>
                      <div className="flex items-start">
                        <div className="flex-1">
                          <p className="text-gray-800">
                            Jane Doe<br />
                            123 Main St<br />
                            Apt 4B<br />
                            New York, NY 10001
                          </p>
                        </div>
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100">
                          Edit
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-3">Payment Method</h5>
                      <div className="flex items-center">
                        <div className="flex-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700 mr-2">
                            <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                            <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-800">•••• •••• •••• 4242</span>
                        </div>
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100">
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
                  {selectedSubscription.status.toLowerCase() === "active" ? (
                    <>
                      <button className="px-4 py-2 border border-red-500 text-red-500 font-medium rounded-md hover:bg-red-50">
                        Cancel Subscription
                      </button>
                      <button className="px-4 py-2 border border-yellow-500 text-yellow-600 font-medium rounded-md hover:bg-yellow-50">
                        Pause Deliveries
                      </button>
                    </>
                  ) : selectedSubscription.status.toLowerCase() === "paused" ? (
                    <>
                      <button className="px-4 py-2 border border-red-500 text-red-500 font-medium rounded-md hover:bg-red-50">
                        Cancel Subscription
                      </button>
                      <button className="px-4 py-2 bg-pink-500 text-white font-medium rounded-md hover:bg-pink-600">
                        Resume Deliveries
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={closeSubscriptionDetails}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 ml-auto"
                    >
                      Close
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}