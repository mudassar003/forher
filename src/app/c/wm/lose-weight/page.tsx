//src/app/c/wm/lose-weight/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LoadingFallback from "./components/LoadingFallback";
import IntroductionStep from "./components/IntroductionStep";
import WeightLossForm from "./components/WeightLossForm";

export default function LoseWeightPage() {
  const searchParams = useSearchParams();
  const offset = parseInt(searchParams?.get("offset") || "0");

  // If offset is 0, show the introduction step
  // We use negative offset to represent introduction step
  if (offset === 0) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <IntroductionStep />
      </Suspense>
    );
  }

  // For all other offsets, show the form
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WeightLossForm />
    </Suspense>
  );
}