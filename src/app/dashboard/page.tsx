"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-xl font-semibold">Welcome to your Dashboard, {user?.email}!</h1>
    </div>
  );
};

export default Dashboard;
