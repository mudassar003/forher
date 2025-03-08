"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ProgressBar from "@/app/(default)/c/wm/components/ProgressBar"; // Import ProgressBar

export default function YourGoalTransition() {
  const router = useRouter();
  const [goalText, setGoalText] = useState<string>("your weight");

  useEffect(() => {
    // Retrieve the stored goal value
    const storedGoal = localStorage.getItem("selectedGoal") || "your weight";
    setGoalText(storedGoal);
  }, []);

  const nextStep = () => {
    router.push("/c/wm/step4"); // Navigate to the next step
  };

  // Animation Variants for Left-to-Right Effect
  const slideInVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (delay: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, delay },
    }),
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Progress Bar */}
      <ProgressBar progress={60} />

      {/* Centered Content but Left-Aligned Text */}
      <div className="max-w-lg text-left mt-5">
        {/* Animated Logo */}
        <motion.h1
          className="text-3xl mt-2 font-bold text-[#fe92b5]"
          variants={slideInVariants}
          initial="hidden"
          animate="visible"
          custom={0.2} // Delay for animation
        >
          Direct2Her
        </motion.h1>

        {/* Animated Text Lines */}
        <motion.p
          className="text-3xl text-black mt-4"
          variants={slideInVariants}
          initial="hidden"
          animate="visible"
          custom={0.4} // Staggered animation delay
        >
          Your goal to lose{" "}
          <span className="text-[#fe92b5] font-semibold">{goalText}</span> is closer than you think— and it doesn’t involve restrictive diets.
        </motion.p>

        <motion.p
          className="text-3xl text-black mt-4"
          variants={slideInVariants}
          initial="hidden"
          animate="visible"
          custom={0.6}
        >
          To find a custom plan for you, we’ll need to build your Weight Loss Profile first.
        </motion.p>

        <motion.p
          className="text-2xl text-black mt-4 font-semibold"
          variants={slideInVariants}
          initial="hidden"
          animate="visible"
          custom={0.8}
        >
          Ready?
        </motion.p>
      </div>

      {/* Step-Specific Button (Centered, Appears Last) */}
      <motion.div
        className="fixed bottom-6 w-full flex justify-center"
        variants={slideInVariants}
        initial="hidden"
        animate="visible"
        custom={1.0}
      >
        <button
          onClick={nextStep}
          className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-lg"
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
