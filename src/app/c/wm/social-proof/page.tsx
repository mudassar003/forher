"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
// import ProgressBar from "@/app/c/wm/components/ProgressBar"; // Import ProgressBar

export default function SocialProof() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress animation for the percentage circle
    const timeout = setTimeout(() => setProgress(85), 500);
    return () => clearTimeout(timeout);
  }, []);

  const nextStep = () => {
    router.push("/c/wm/step5"); // Navigate to the next step
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
     

      {/* Left-Aligned Logo (Like Previous Steps) */}
      <div className="w-[90%] max-w-lg text-left mt-5">
        <motion.h1
          className="text-4xl font-bold text-[#fe92b5]"
          variants={slideInVariants}
          initial="hidden"
          animate="visible"
          custom={0.2}
        >
          Direct2Her
        </motion.h1>
      </div>

      {/* Large Circular Progress Below Logo */}
      <motion.div
        className="w-[90%] max-w-lg flex justify-start mt-8"
        variants={slideInVariants}
        initial="hidden"
        animate="visible"
        custom={0.3}
      >
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="absolute w-full h-full" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle cx="50" cy="50" r="40" stroke="#E0E0E0" strokeWidth="8" fill="none" />
            {/* Progress Circle (85%) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#fe92b5"
              strokeWidth="8"
              fill="none"
              strokeDasharray="251.2" /* Full circle length */
              strokeDashoffset={251.2 * (1 - progress / 100)} /* 85% fill */
              strokeLinecap="round"
              transform="rotate(-90 50 50)" /* Starts from top */
            />
          </svg>
          {/* Animated Percentage Text */}
          <motion.span
            className="absolute text-2xl font-light text-[#fe92b5]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          >
            {progress}%
          </motion.span>
        </div>
      </motion.div>

      {/* Main Content (Now below progress circle) */}
      <div className="w-[90%] max-w-lg text-left mt-6">
        {/* Main Text */}
        <motion.p
          className="text-2xl font-semibold text-black leading-snug"
          variants={slideInVariants}
          initial="hidden"
          animate="visible"
          custom={0.4}
        >
          of Direct2Her customers looking to lose over 50 lbs{" "}
          <span className="text-[#fe92b5] font-semibold underline">
            prefer GLP-1 injections.*
          </span>
        </motion.p>

        {/* Additional Text */}
        <motion.p
          className="text-2xl text-black mt-6"
          variants={slideInVariants}
          initial="hidden"
          animate="visible"
          custom={0.6}
        >
          To find a custom plan for you, we’ll need to build your weight loss{" "}
          <span className="opacity-50">profile first.</span>
        </motion.p>

        {/* "Ready?" Line */}
        <motion.p
          className="text-2xl font-semibold text-gray-500 mt-4"
          variants={slideInVariants}
          initial="hidden"
          animate="visible"
          custom={0.8}
        >
          Ready?
        </motion.p>
      </div>

      {/* Step-Specific Button (Aligned Like Previous Steps) */}
      <motion.div
        className="fixed bottom-6 w-[90%] max-w-lg flex justify-center"
        variants={slideInVariants}
        initial="hidden"
        animate="visible"
        custom={1.0}
      >
        <button
          onClick={nextStep}
          className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-full flex items-center justify-center gap-2"
        >
          Next <span className="text-xl">➜</span>
        </button>
      </motion.div>
    </div>
  );
}
