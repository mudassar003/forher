//src/app/c/wm/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function YourGoalTransition() {
  const router = useRouter();

  // Redirect to the Introduction step after the animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/c/wm/introduction"); // Redirect to introduction step
    }, 2000); // Wait for 2 seconds before redirecting (adjust as needed)

    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      {/* Circle Animation */}
      <div className="w-24 h-24 border-4 border-[#fe92b5] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
