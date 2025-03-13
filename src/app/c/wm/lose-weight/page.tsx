//src/app/c/wm/lose-weight/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import LoadingFallback from "./components/LoadingFallback";
import IntroductionStep from "./components/IntroductionStep";
import WeightLossForm from "./components/WeightLossForm";

// The main page component stays simple
export default function LoseWeightPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientPageRouter />
    </Suspense>
  );
}

// This client-side router handles the URL patterns inside the Suspense boundary
function ClientPageRouter() {
  const [offset, setOffset] = useState<number | null>(null);

  // Safely access window object only in browser environment after component mounts
  useEffect(() => {
    // Now we're safely in the browser environment
    const searchParams = new URL(window.location.href).searchParams;
    const urlOffset = parseInt(searchParams.get("offset") || "0");
    setOffset(urlOffset);
  }, []);

  // Show loading while determining the offset
  if (offset === null) {
    return <LoadingFallback />;
  }

  // If offset is 0, show the introduction step
  if (offset === 0) {
    return <IntroductionStep />;
  }

  // For all other offsets, show the form
  return <WeightLossForm />;
}