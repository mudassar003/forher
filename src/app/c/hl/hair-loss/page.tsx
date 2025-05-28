//src/app/c/hl/hair-loss/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import LoadingFallback from "./components/LoadingFallback";
import HairLossForm from "./components/HairLossForm";
import { useHLFormStore } from "@/store/hlFormStore";
import { useRouter } from "next/navigation";

// The main page component
export default function HairLossPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientPageRouter />
    </Suspense>
  );
}

// This client-side router handles the URL parameters
function ClientPageRouter() {
  const [offset, setOffset] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { currentStep, completedSteps } = useHLFormStore();
  const router = useRouter();

  // Safely access window object only in browser environment after component mounts
  useEffect(() => {
    // Skip if we're in server-side rendering
    if (typeof window === 'undefined') return;
    
    // Check if the introduction step is completed
    const introCompleted = completedSteps.includes("/c/hl/introduction");
    
    if (!introCompleted) {
      // If introduction is not completed, redirect back to the introduction page
      router.push("/c/hl/introduction");
      return;
    }
    
    const readUrlOffset = () => {
      const searchParams = new URL(window.location.href).searchParams;
      const urlOffset = parseInt(searchParams.get("offset") || "1");
      
      // Make sure offset is never 0 (avoid showing IntroductionStep again)
      setOffset(urlOffset < 1 ? 1 : urlOffset);
      
      // Mark as loaded once we've read the parameters
      setIsLoaded(true);
    };
    
    // Read the initial offset
    readUrlOffset();
    
    // Set up a listener for URL changes (back/forward navigation)
    const handleRouteChange = () => {
      readUrlOffset();
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [router, completedSteps]);

  // If the offset is still being determined, render a minimal placeholder
  // This avoids the loading spinner flash between steps
  if (offset === null || !isLoaded) {
    return <div className="min-h-screen bg-white"></div>;
  }

  // Always show the HairLossForm
  return <HairLossForm />;
}