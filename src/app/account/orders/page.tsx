//src/app/account/orders/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import Link from "next/link";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = "bg-gray-100 text-gray-800";
  
  switch (status?.toLowerCase()) {
    case "processing":
      bgColor = "bg-blue-100 text-blue-800";
      break;
    case "shipped":
      bgColor = "bg-indigo-100 text-indigo-800";
      break;
    case "delivered":
      bgColor = "bg-green-100 text-green-800";
      break;
    case "cancelled":
      bgColor = "bg-red-100 text-red-800";
      break;
    case "completed":
      bgColor = "bg-green-100 text-green-800";
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

export default function OrdersPage() {
  const { user } = useAuthStore();
  const { 
    orders, 
    selectedOrder, 
    loading, 
    error, 
    fetchUserOrders, 
    selectOrder 
  } = useOrderStore();

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Only fetch if we have a user with an email
    if (user?.email) {
      fetchUserOrders(user.email);
    }
  }, [user, fetchUserOrders]);

  // Handle viewing order details
  const viewOrderDetails = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      selectOrder(order);
      setModalVisible(true);
    }
  };

  // Handle closing order modal
  const closeOrderDetails = () => {
    setModalVisible(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-black">Your Orders</h2>
        </div>

        {orders.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-pink-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">When you place orders, they will appear here.</p>
            <Link href="/shop" className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewOrderDetails(order.id)}
                        className="text-pink-500 hover:text-pink-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto ${modalVisible ? '' : 'hidden'}`}>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                  Order #{selectedOrder.id.substring(0, 8).toUpperCase()}
                </h3>
                <button onClick={closeOrderDetails} className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Order Information</h4>
                    <p className="text-sm mb-1"><span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                    <p className="text-sm mb-1"><span className="font-medium">Status:</span> <StatusBadge status={selectedOrder.status} /></p>
                    <p className="text-sm mb-1"><span className="font-medium">Payment:</span> {selectedOrder.payment_status || 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">Total:</span> ${selectedOrder.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Information</h4>
                    <p className="text-sm mb-1"><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                    <p className="text-sm mb-1"><span className="font-medium">Email:</span> {selectedOrder.email}</p>
                    <p className="text-sm"><span className="font-medium">Address:</span> {selectedOrder.address}</p>
                    {selectedOrder.city && selectedOrder.country && (
                      <p className="text-sm"><span className="font-medium">Location:</span> {selectedOrder.city}, {selectedOrder.country}</p>
                    )}
                  </div>
                </div>
                
                <h4 className="text-sm font-medium text-gray-500 mb-3 border-b pb-2">Order Items</h4>
                <div className="space-y-4">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <div className="flex items-center">
                          <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h5 className="text-sm font-medium text-gray-800">{item.name}</h5>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No items for this order</p>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-sm font-medium text-gray-800">${selectedOrder.subtotal?.toFixed(2) || selectedOrder.total.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-gray-600">Shipping</p>
                    <p className="text-sm font-medium text-gray-800">${selectedOrder.shipping_cost?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div className="flex justify-between font-medium">
                    <p className="text-base text-gray-800">Total</p>
                    <p className="text-base text-pink-600">${selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button 
                  onClick={closeOrderDetails}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 mr-2"
                >
                  Close
                </button>
                <button 
                  className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
                  onClick={() => {
                    // Handle tracking or other functions
                    window.open(`/track-order/${selectedOrder.id}`, '_blank');
                  }}
                >
                  Track Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}