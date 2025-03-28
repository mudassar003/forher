// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminHeader from "./components/AdminHeader";

interface StatCard {
  title: string;
  value: string;
  link: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would fetch from an API
        // For now, we'll use placeholder data
        setStats([
          {
            title: "Active Subscriptions",
            value: "142",
            link: "/admin/subscriptions?status=active"
          },
          {
            title: "Pending Subscriptions",
            value: "7",
            link: "/admin/subscriptions?status=pending"
          }
        ]);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AdminHeader title="Admin Dashboard" />
      
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Overview</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <Link 
                href={stat.link}
                key={index}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{stat.value}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}