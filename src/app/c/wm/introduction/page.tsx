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
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff5f8] to-white">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-0 w-96 h-96 bg-[#ffe6f0] rounded-full opacity-30 blur-3xl -z-10"></div>
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-[#fff0f5] rounded-full opacity-40 blur-3xl -z-10"></div>
      <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-[#ffebf1] rounded-full opacity-20 blur-2xl -z-10"></div>
      
      {/* Mobile-First Design with Responsive Layout */}
      <div className="relative">
        {/* Header with Logo - Always visible */}
        <div className="flex justify-center pt-8 pb-4 md:pt-12 md:pb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Image 
              src="/Logo.png" 
              alt="Lilys Logo" 
              width={160} 
              height={64} 
              priority 
              className="h-auto w-auto"
            />
          </motion.div>
        </div>

        {/* Main Content Container */}
        <div className="px-4 sm:px-6 lg:px-8 pb-32">
          <div className="max-w-4xl mx-auto">
            
            {/* Hero Section */}
            <motion.div
              className="text-center mb-8 md:mb-12"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fe92b5] mb-4 leading-tight">
                Your Weight Loss <br className="hidden sm:block" />Journey Starts Here
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
                Personalized plans backed by medical professionals for lasting results.
              </p>
            </motion.div>

            {/* Content Section */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mb-12"
            >
              <motion.div
                className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 mb-8"
                variants={staggerItem}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#fe92b5] mb-4 text-center">
                  Get Your Personalized Weight Loss Plan
                </h2>
                
                <p className="text-base sm:text-lg text-gray-700 mb-8 text-center max-w-2xl mx-auto">
                  Answer a few questions about your health history, goals, and preferences to receive customized recommendations from our medical team.
                </p>
                
                {/* How It Works Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-medium text-gray-800 text-center mb-6">How It Works</h3>
                  
                  <div className="grid gap-6 sm:gap-8">
                    <motion.div 
                      className="flex items-start space-x-4"
                      variants={staggerItem}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ffe6f0] flex items-center justify-center text-[#fe92b5] font-bold text-lg">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-lg mb-2">Complete a Brief Assessment</h4>
                        <p className="text-gray-600">Answer questions about your health profile and weight loss goals.</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-start space-x-4"
                      variants={staggerItem}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ffe6f0] flex items-center justify-center text-[#fe92b5] font-bold text-lg">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-lg mb-2">Review Recommendations</h4>
                        <p className="text-gray-600">Get personalized treatment options tailored to your needs.</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-start space-x-4"
                      variants={staggerItem}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ffe6f0] flex items-center justify-center text-[#fe92b5] font-bold text-lg">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-lg mb-2">Begin Your Journey</h4>
                        <p className="text-gray-600">Start your personalized program with ongoing support.</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Fixed CTA Button - Always visible and accessible */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="max-w-lg mx-auto">
            <button
              onClick={startAssessment}
              className="w-full bg-black hover:bg-gray-900 text-white text-lg font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
            >
              Start Assessment
            </button>
            
            {/* Privacy notice */}
            <p className="text-xs sm:text-sm text-gray-500 mt-3 text-center leading-relaxed">
              By continuing, you agree that Lilys may use your responses as described in our{" "}
              <a href="/privacy-policy" className="underline text-[#fe92b5] hover:text-[#e63946]">
                Privacy Policy
              </a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}