//src/app/account/layout.tsx
"use client";

import { ReactNode, useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import GlobalFooter from "@/components/GlobalFooter";
import { User } from "@supabase/supabase-js";

// Define navigation items interface
interface NavItem {
  name: string;
  path: string;
}

// Define navigation items
const navItems: NavItem[] = [
  { name: "Dashboard", path: "/account" },
  { name: "Profile", path: "/account/profile" },
  { name: "Orders", path: "/account/orders" },
  { name: "Subscriptions", path: "/account/subscriptions" },
  { name: "Settings", path: "/account/settings" },
];

// Type for Order from Supabase
type OrderRow = Database['public']['Tables']['orders']['Row'];

// AccountHeader component for all account pages
const AccountHeader = () => {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [customerName, setCustomerName] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerName = async (authUser: User) => {
      // Ensure email exists and is a non-empty string
      const userEmail = authUser.email;
      if (!userEmail) {
        handleFallbackName(authUser);
        return;
      }

      try {
        // Fetch from orders with a type-safe email check
        const { data, error } = await supabase
          .from("orders")
          .select("customer_name")
          // Use type assertion to handle email column
          .eq("email", userEmail as string) 
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching orders:", error);
          handleFallbackName(authUser);
          return;
        }

        const orderData = data as OrderRow | null;
        if (orderData?.customer_name) {
          setCustomerName(orderData.customer_name);
        } else {
          handleFallbackName(authUser);
        }
      } catch (error) {
        console.error("Unexpected error fetching customer name:", error);
        handleFallbackName(authUser);
      }
    };

    const handleFallbackName = (authUser: User) => {
      // Fallback to user metadata or parsed email
      setCustomerName(
        // Check if user_metadata.name exists and is a string
        (authUser.user_metadata?.name && typeof authUser.user_metadata.name === 'string') 
          ? authUser.user_metadata.name 
          : (authUser.email && typeof authUser.email === 'string')
            ? authUser.email.split('@')[0] 
            : null
      );
    };

    // Only fetch customer name if user exists
    if (user) {
      fetchCustomerName(user);
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">My Account</h1>
            {customerName && (
              <span className="text-sm bg-pink-100 text-pink-600 px-3 py-1 rounded-full">
                {customerName}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md font-medium hover:bg-gray-200 transition flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

// Sidebar navigation
const AccountNavigation = () => {
  const pathname = usePathname();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`block px-4 py-3 rounded-lg transition-colors ${
              pathname === item.path
                ? "bg-pink-100 text-pink-700 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {item.name}
          </Link>
        ))}
        
        {/* Add telehealth link to navigation */}
        <Link
          href="/appointment"
          className={`block px-4 py-3 rounded-lg transition-colors ${
            pathname === "/appointment"
              ? "bg-pink-100 text-pink-700 font-medium"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          Telehealth
        </Link>
      </nav>
      <div className="mt-6">
        <Link
          href="/"
          className="block px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

// This layout will wrap all pages within the account section
export default function AccountLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  if (!user) return null; // Don't render anything while redirecting

  return (
    <div className="min-h-screen bg-gray-50">
      <AccountHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <AccountNavigation />
          </div>
          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
      <GlobalFooter />
    </div>
  );
}