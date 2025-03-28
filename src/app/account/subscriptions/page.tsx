//src/app/account/subscriptions/page.tsx
"use client";
import { useEffect, useRef } from "react";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useAuthStore } from "@/store/authStore";
import SubscriptionsList from "./components/SubscriptionsList";
import BenefitsSection from "./components/BenefitsSection";

export default function SubscriptionsPage() {
  const { fetchUserSubscriptions } = useSubscriptionStore();
  const { user } = useAuthStore();
  const initialFetchDone = useRef<boolean>(false);

  useEffect(() => {
    // Only fetch once when user becomes available and initial fetch hasn't been done
    if (user?.id && !initialFetchDone.current) {
      // Store user ID in localStorage for retry functionality
      localStorage.setItem('userId', user.id);
      // Fetch subscriptions
      fetchUserSubscriptions(user.id);
      initialFetchDone.current = true;
    }
  }, [user, fetchUserSubscriptions]);

  return (
    <div className="space-y-6">
      <SubscriptionsList />
      <BenefitsSection />
    </div>
  );
}