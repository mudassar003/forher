// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminHeader from "./components/AdminHeader";

interface StatCard {
  title: string;
  value: string;
  link: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'pink';
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      
      try {
        // Fetch subscription stats
        const subscriptionResponse = await fetch("/api/admin/subscriptions");
        const subscriptionData = await subscriptionResponse.json();
        
        // Fetch appointment access stats
        const appointmentResponse = await fetch("/api/admin/appointment-access?limit=1000"); // Get all for stats
        const appointmentData = await appointmentResponse.json();
        
        if (subscriptionData.success && appointmentData.success) {
          const subscriptions = subscriptionData.subscriptions || [];
          const appointmentUsers = appointmentData.data?.users || [];
          
          // Calculate subscription stats
          const activeSubscriptions = subscriptions.filter((sub: any) => sub.status === 'active').length;
          const pendingSubscriptions = subscriptions.filter((sub: any) => sub.status === 'pending').length;
          
          // Calculate appointment access stats
          const expiredAccess = appointmentUsers.filter((user: any) => user.accessStatus === 'expired').length;
          const activeAccess = appointmentUsers.filter((user: any) => user.accessStatus === 'active').length;
          
          setStats([
            {
              title: "Active Subscriptions",
              value: activeSubscriptions.toString(),
              link: "/admin/subscriptions?status=active",
              color: 'green'
            },
            {
              title: "Pending Subscriptions",
              value: pendingSubscriptions.toString(),
              link: "/admin/subscriptions?status=pending",
              color: 'yellow'
            },
            {
              title: "Active Appointment Access",
              value: activeAccess.toString(),
              link: "/admin/appointment-access?status=active",
              color: 'blue'
            },
            {
              title: "Expired Appointment Access",
              value: expiredAccess.toString(),
              link: "/admin/appointment-access?status=expired",
              color: 'red'
            }
          ]);
        } else {
          // Fallback to placeholder data if API fails
          setStats([
            {
              title: "Active Subscriptions",
              value: "—",
              link: "/admin/subscriptions?status=active",
              color: 'green'
            },
            {
              title: "Pending Subscriptions",
              value: "—",
              link: "/admin/subscriptions?status=pending",
              color: 'yellow'
            },
            {
              title: "Active Appointment Access",
              value: "—",
              link: "/admin/appointment-access?status=active",
              color: 'blue'
            },
            {
              title: "Expired Appointment Access",
              value: "—",
              link: "/admin/appointment-access?status=expired",
              color: 'red'
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Set placeholder stats on error
        setStats([
          {
            title: "Active Subscriptions",
            value: "Error",
            link: "/admin/subscriptions?status=active",
            color: 'green'
          },
          {
            title: "Pending Subscriptions",
            value: "Error",
            link: "/admin/subscriptions?status=pending",
            color: 'yellow'
          },
          {
            title: "Active Appointment Access",
            value: "Error",
            link: "/admin/appointment-access?status=active",
            color: 'blue'
          },
          {
            title: "Expired Appointment Access",
            value: "Error",
            link: "/admin/appointment-access?status=expired",
            color: 'red'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);
  
  // Get color classes for stats cards
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'green':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'yellow':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'red':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'pink':
        return 'bg-pink-50 text-pink-600 border-pink-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AdminHeader title="Admin Dashboard" />
      
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Overview</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse border">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Link 
                href={stat.link}
                key={index}
                className={`p-6 rounded-lg shadow hover:shadow-md transition-shadow border ${getColorClasses(stat.color)}`}
              >
                <h3 className="text-sm font-medium opacity-80">{stat.title}</h3>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/subscriptions"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <div className="bg-pink-100 p-2 rounded-md mr-3">
                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Manage Subscriptions</h3>
                <p className="text-sm text-gray-500">View and edit user subscriptions</p>
              </div>
            </div>
          </Link>
          
          <Link
            href="/admin/appointment-access"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-md mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Appointment Access</h3>
                <p className="text-sm text-gray-500">Reset user appointment access</p>
              </div>
            </div>
          </Link>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-gray-200 p-2 rounded-md mr-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">More Features</h3>
                <p className="text-sm text-gray-400">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}