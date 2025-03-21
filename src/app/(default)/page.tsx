// src/app/(default)/page.tsx
import { Suspense } from "react";
import RotatingHeadline from "@/components/RotatingHeadline";
// import Categories from "@/components/Categories";
import RotatingSection from "@/components/RotatingSection";
// import VideoSection from "@/components/VideoSection";
import HairLoss from "@/components/HairLoss";
// import HairRegrowCard from "@/components/HairRegrowCard";
import FaqAccordion from "@/components/FaqAccordion";
import SubscribeSection from "@/components/SubscribeSection";
import AuthCallback from "@/components/Auth/AuthCallback";
import HowItWorks from "@/components/HowItWorks";
import NewHairLossSection from "@/components/NewHairLossSection";

// Simple loading fallback for AuthCallback
const AuthCallbackLoading = () => <div className="hidden">Loading auth callback...</div>;

export default function HomePage() {
  return (
    <main>
      <div>
        <RotatingHeadline />
        <HowItWorks />
        <RotatingSection />
        <NewHairLossSection />
        <FaqAccordion />
        <SubscribeSection />
      </div>
    </main>
  );
}