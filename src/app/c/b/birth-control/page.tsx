//src/app/c/b/birth-control/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import LoadingFallback from "./components/LoadingFallback";
import IntroductionStep from "./components/IntroductionStep";
import BirthControlForm from "./components/BirthControlForm";
import { useBCFormStore } from "@/store/bcFormStore";
import { useRouter } from "next/navigation";

// The main page component
export default function BirthControlPage(): React.JSX.Element {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientPageRouter />
    </Suspense>
  );
}

// This client-side router handles the URL parameters
function ClientPageRouter(): React.JSX.Element {
  const [offset, setOffset] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const { currentStep, completedSteps } = useBCFormStore();
  const router = useRouter();

  // Safely access window object only in browser environment after component mounts
  useEffect(() => {
    // Skip if we're in server-side rendering
    if (typeof window === 'undefined') return;
    
    const readUrlOffset = (): void => {
      const searchParams = new URL(window.location.href).searchParams;
      const urlOffset = parseInt(searchParams.get("offset") || "0");
      setOffset(urlOffset);
      // Mark as loaded once we've read the parameters
      setIsLoaded(true);
    };
    
    // Read the initial offset
    readUrlOffset();
    
    // Set up a listener for URL changes (back/forward navigation)
    const handleRouteChange = (): void => {
      readUrlOffset();
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // If the offset is still being determined, render a minimal placeholder
  // This avoids the loading spinner flash between steps
  if (offset === null) {
    return <div className="min-h-screen bg-white"></div>;
  }

  // If offset is 0, show the introduction step
  if (offset === 0) {
    return <IntroductionStep />;
  }

  // For all other offsets, show the form
  return <BirthControlForm />;
}