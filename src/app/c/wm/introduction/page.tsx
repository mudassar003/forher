//src/app/c/wm/introduction/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWMFormStore } from "@/store/wmFormStore";
import Image from "next/image";
import { motion } from "framer-motion";

export default function IntroductionPage() {
  const router = useRouter();
  const { resetForm, setCurrentStep, markStepCompleted } = useWMFormStore();
  
  // Reset the form when this page loads
  useEffect(() => {
    resetForm();
    setCurrentStep("/c/wm/introduction");
    
    // Clear any previous responses
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem("weightLossResponses");
      sessionStorage.removeItem("ineligibilityReason");
      sessionStorage.removeItem("finalResponses");
    }
  }, [resetForm, setCurrentStep]);

  const startAssessment = (): void => {
    // Mark this step as completed
    markStepCompleted("/c/wm/introduction");
    
    // Navigate directly to the first question with offset=1
    router.push("/c/wm/lose-weight?offset=1");
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  const slideUp = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, delay: 0.2 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const staggerItem = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff5f8] to-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-0 w-96 h-96 bg-[#ffe6f0] rounded-full opacity-30 blur-3xl -z-10"></div>
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-[#fff0f5] rounded-full opacity-40 blur-3xl -z-10"></div>
      <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-[#ffebf1] rounded-full opacity-20 blur-2xl -z-10"></div>
      
      {/* Main content container with split design */}
      <div className="flex flex-col md:flex-row h-screen">
        {/* Left panel - Hero image and branding (hidden on small screens) */}
        <div className="hidden md:flex md:w-1/2 bg-[#fe92b5] relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>
          
          {/* Image overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#fe92b5] via-[#fe92b5]/80 to-transparent"></div>
          
          {/* Content positioned on top of background */}
          <div className="relative flex flex-col justify-center items-center h-full p-10 text-white z-10">
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Image 
                src="/Logo.png" 
                alt="Lilys Logo" 
                width={180} 
                height={70} 
                priority 
                className="h-auto"
              />
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6 text-center"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              Your Weight Loss <br />Journey Starts Here
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/90 mb-8 text-center max-w-md"
              variants={slideUp}
              initial="hidden"
              animate="visible"
            >
              Personalized plans backed by medical professionals for lasting results.
            </motion.p>
            
            {/* Statistics section removed as requested */}
          </div>
        </div>
        
        {/* Right panel - Form content */}
        <div className="w-full md:w-1/2 flex flex-col p-6 md:p-10">
          {/* Mobile logo (visible only on small screens) */}
          <div className="flex justify-center md:hidden mb-8 mt-4">
            <Image 
              src="/Logo.png" 
              alt="Lilys Logo" 
              width={140} 
              height={56} 
              priority 
              className="h-auto"
            />
          </div>
          
          <div className="flex-grow flex flex-col justify-center max-w-lg mx-auto w-full">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mb-12"
            >
              <motion.h2 
                className="text-3xl md:text-4xl font-semibold text-[#fe92b5] mb-4"
                variants={staggerItem}
              >
                Get Your Personalized Weight Loss Plan
              </motion.h2>
              
              <motion.p 
                className="text-lg text-gray-700 mb-8"
                variants={staggerItem}
              >
                Answer a few questions about your health history, goals, and preferences to receive customized recommendations from our medical team.
              </motion.p>
              
              {/* How It Works Section */}
              <motion.div 
                className="space-y-6 mb-8"
                variants={staggerItem}
              >
                <h3 className="text-xl font-medium text-gray-800">How It Works</h3>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ffe6f0] flex items-center justify-center text-[#fe92b5] font-semibold">1</div>
                  <div>
                    <h4 className="font-medium text-gray-800">Complete a Brief Assessment</h4>
                    <p className="text-gray-600 text-sm">Answer questions about your health profile and weight loss goals.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ffe6f0] flex items-center justify-center text-[#fe92b5] font-semibold">2</div>
                  <div>
                    <h4 className="font-medium text-gray-800">Review Recommendations</h4>
                    <p className="text-gray-600 text-sm">Get personalized treatment options tailored to your needs.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ffe6f0] flex items-center justify-center text-[#fe92b5] font-semibold">3</div>
                  <div>
                    <h4 className="font-medium text-gray-800">Begin Your Journey</h4>
                    <p className="text-gray-600 text-sm">Start your personalized program with ongoing support.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <button
                onClick={startAssessment}
                className="w-full bg-black hover:bg-gray-900 text-white text-lg font-medium py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Assessment
              </button>
              
              {/* Privacy notice */}
              <p className="text-sm text-gray-500 mt-4 text-center">
                By continuing, you agree that Lilys may use your responses as described in our{" "}
                <a href="/privacy-policy" className="underline text-[#fe92b5]">Privacy Policy</a>.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}