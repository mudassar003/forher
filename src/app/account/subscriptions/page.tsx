//src/app/account/subscriptions/page.tsx
"use client";
import { useEffect } from "react";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useAuthStore } from "@/store/authStore";
import SubscriptionsList from "./components/SubscriptionsList";
import BenefitsSection from "./components/BenefitsSection";

export default function SubscriptionsPage() {
  const { fetchUserSubscriptions, isFetched } = useSubscriptionStore();
  const { user } = useAuthStore();

  useEffect(() => {
    // Only fetch if user is available and subscriptions haven't been fetched yet
    if (user?.id && !isFetched) {
      fetchUserSubscriptions(user.id);
    }
  }, [user, fetchUserSubscriptions, isFetched]);

  return (
    <div className="space-y-6">
      <SubscriptionsList />
      <BenefitsSection />
    </div>
  );
}