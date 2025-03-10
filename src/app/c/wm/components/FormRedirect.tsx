//src/app/c/wm/components/FormRedirect.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWMFormStore, getLastCompletedStep, WM_FORM_STEPS, canAccessStep } from "@/store/wmFormStore";

export default function FormRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { completedSteps } = useWMFormStore();

  useEffect(() => {
    if (!pathname) return;

    // Skip redirecting for the root WM page (the loading page)
    if (pathname === "/c/wm") return;

    // If there are no completed steps, we don't need to redirect
    if (completedSteps.length === 0) return;

    // Check if the current path is a valid form step
    const isValidStep = WM_FORM_STEPS.includes(pathname);
    if (!isValidStep) return;

    // Check if the user is allowed to access the current step
    if (canAccessStep(pathname, completedSteps)) return;

    // Get the last completed step
    const lastStep = getLastCompletedStep(completedSteps);
    
    // Get the next step after the last completed one
    const lastStepIndex = WM_FORM_STEPS.indexOf(lastStep);
    const nextStep = lastStepIndex < WM_FORM_STEPS.length - 1 
      ? WM_FORM_STEPS[lastStepIndex + 1] 
      : lastStep;

    // Redirect to the appropriate step
    router.replace(nextStep);
  }, [pathname, router, completedSteps]);

  // This component doesn't render anything
  return null;
}