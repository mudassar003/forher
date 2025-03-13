//src/app/c/wm/lose-weight/page.tsx
"use client";

import { Suspense } from "react";
import LoadingFallback from "./components/LoadingFallback";
import IntroductionStep from "./components/IntroductionStep";
import WeightLossForm from "./components/WeightLossForm";

// This is a Client Component that uses useSearchParams
function LoseWeightContent() {
  // We'll move the useSearchParams hook to the child component
  // This component is a wrapper that will be wrapped in Suspense
  return (
    <>
      <WeightLossForm />
    </>
  );
}

// This is a Client Component that detects if we are in the introduction step
function IntroductionContent() {
  return (
    <>
      <IntroductionStep />
    </>
  );
}

// The main page component stays simple
export default function LoseWeightPage() {
  return (
    <>
      {/* We'll use URL-based rendering with a fallback for each route pattern */}
      <Suspense fallback={<LoadingFallback />}>
        <ClientPageRouter />
      </Suspense>
    </>
  );
}

// This client-side router handles the URL patterns inside the Suspense boundary
function ClientPageRouter() {
  // Move useSearchParams inside this component, which is inside Suspense
  const searchParams = new URL(window.location.href).searchParams;
  const offset = parseInt(searchParams.get("offset") || "0");

  // If offset is 0, show the introduction step
  if (offset === 0) {
    return <IntroductionContent />;
  }

  // For all other offsets, show the form
  return <LoseWeightContent />;
}