//src/app/account/subscriptions/page.tsx
"use client";
import { useEffect } from "react";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useAuthStore } from "@/store/authStore";
import SubscriptionsList from "./components/SubscriptionsList";
import BenefitsSection from "./components/BenefitsSection";

export default function SubscriptionsPage() {
  const { fetchUserSubscriptions } = useSubscriptionStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      // Store user ID in localStorage for retry functionality
      localStorage.setItem('userId', user.id);
      // Fetch subscriptions
      fetchUserSubscriptions(user.id);
    }
  }, [user, fetchUserSubscriptions]);

  return (
    <div className="space-y-6">
      <SubscriptionsList />
      <BenefitsSection />
    </div>
  );
}