//src/app/account/page.tsx
"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const { user } = useAuthStore();
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        if (!user) return;
        
        const { data: ordersData, error: ordersError, count } = await supabase
          .from("orders")
          .select("id", { count: 'exact' })
          .eq("email", user.email);

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
        } else {
          setOrderCount(count || ordersData.length || 0);
        }
      } catch (error) {
        console.error("Error in order count fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderCount();
  }, [user]);

  // Placeholder stats for dashboard, but with dynamic order count
  const stats = [
    { label: "Orders", value: loading ? "..." : orderCount.toString(), icon: "📦" },
    { label: "Appointments", value: "2", icon: "📅" },
    { label: "Active Subscriptions", value: "1", icon: "🔄" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}</h2>
        
        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-pink-50 p-5 rounded-lg border border-pink-100 flex items-center">
              <div className="text-3xl mr-4">{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/account/profile">
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group">
              <h3 className="font-medium text-gray-800 group-hover:text-pink-500 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Your Profile
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Manage your personal information and preferences
              </p>
            </div>
          </Link>
          
          <Link href="/account/orders">
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group">
              <h3 className="font-medium text-gray-800 group-hover:text-pink-500 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Your Orders
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                View and track your recent orders and shipments
              </p>
            </div>
          </Link>
          
          <Link href="/account/appointments">
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group">
              <h3 className="font-medium text-gray-800 group-hover:text-pink-500 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Your Appointments
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Schedule and manage your upcoming appointments
              </p>
            </div>
          </Link>
          
          <Link href="/account/subscriptions">
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group">
              <h3 className="font-medium text-gray-800 group-hover:text-pink-500 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                Subscriptions
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Manage your recurring product deliveries
              </p>
            </div>
          </Link>
          
          <Link href="/account/settings">
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group">
              <h3 className="font-medium text-gray-800 group-hover:text-pink-500 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Account Settings
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Update your password and security options
              </p>
            </div>
          </Link>
          
          <Link href="/account/help">
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group">
              <h3 className="font-medium text-gray-800 group-hover:text-pink-500 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                Help & Support
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Get assistance with your account or orders
              </p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Recent activity section */}
      {/* <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h2>
        <div className="border-t border-gray-200">
          <div className="py-3 flex items-center">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Your order #ORD12345 has shipped</p>
              <p className="text-sm text-gray-500">Mar 14, 2025</p>
            </div>
          </div>
          
          <div className="py-3 flex items-center border-t border-gray-200">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Upcoming appointment: Hair Regrowth Consultation</p>
              <p className="text-sm text-gray-500">Mar 10, 2025 10:00 AM</p>
            </div>
          </div>
          
          <div className="py-3 flex items-center border-t border-gray-200">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Your subscription was renewed</p>
              <p className="text-sm text-gray-500">Mar 5, 2025</p>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;