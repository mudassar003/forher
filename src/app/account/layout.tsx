"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import GlobalFooter from "@/components/GlobalFooter";

// AccountHeader component for all account pages
const AccountHeader = () => {
  const { user } = useAuthStore();
  
  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Account Dashboard</h1>
            {user && <span className="text-sm bg-indigo-700 px-3 py-1 rounded-full">{user.email}</span>}
          </div>
          <nav className="flex space-x-6">
            <Link href="/account" className="hover:text-indigo-200 font-medium">
              Dashboard
            </Link>
            <Link href="/account/profile" className="hover:text-indigo-200 font-medium">
              Profile
            </Link>
            <Link href="/account/settings" className="hover:text-indigo-200 font-medium">
              Settings
            </Link>
            <Link href="/" className="hover:text-indigo-200 font-medium">
              Back to Home
            </Link>
            <button className="bg-white text-indigo-600 px-3 py-1 rounded-md font-medium hover:bg-indigo-100">
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <GlobalFooter />
    </div>
  );
}