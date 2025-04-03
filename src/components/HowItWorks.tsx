"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Process steps data
  const steps = [
    {
      id: 1,
      title: "Quick Online Assessment",
      description: "Complete a comprehensive health questionnaire in just 5 minutes.",
      icon: "/images/assessment-icon.svg",
      color: "#e63946"
    },
    {
      id: 2,
      title: "Good Faith Exam",
      description: "A licensed healthcare provider performs a quick 5-10 minute telehealth exam",
      icon: "/images/doctor-icon.svg",
      color: "#d81159"
    },
    {
      id: 3,
      title: "Discreet Delivery",
      description: "24/7 online consultations, offering personalized treatment.",
      icon: "/images/delivery-icon.svg",
      color: "#8f2d56"
    },
    {
      id: 4,
      title: "Ongoing Support",
      description: "Access to our medical team for questions, adjustments, and regular check-ins.",
      icon: "/images/support-icon.svg",
      color: "#ff4d6d"
    }
  ];

  return (
    <section className="relative py-16 md:py-24 bg-white overflow-hidden" id="how-it-works">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#FBF8F7] to-white"></div>
      <div className="absolute -top-1 left-0 w-24 h-24 md:w-40 md:h-40 rounded-full bg-[#ffe6f0] opacity-50 -translate-x-1/2"></div>
      <div className="absolute top-1/4 right-0 w-32 h-32 md:w-56 md:h-56 rounded-full bg-[#f9dde5] opacity-40 translate-x-1/2"></div>
      
      {/* Content container */}
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ color: "#e63946" }}
          >
            How Lily's Works
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Get personalized healthcare from the comfort of your home in just a few simple steps.
          </motion.p>
        </div>
        
        {/* Desktop Process steps (hidden on mobile) */}
        <motion.div 
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {steps.map((step) => (
            <motion.div 
              key={step.id}
              className="relative flex flex-col items-center text-center p-6 rounded-2xl transition-all"
              variants={itemVariants}
            >
              {/* Step number badge */}
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6 shadow-lg"
                style={{ backgroundColor: step.color }}
              >
                {step.id}
              </div>
              
              {/* Icon placeholder */}
              <div className="w-20 h-20 mb-5 flex items-center justify-center bg-[#ffe6f0] rounded-full">
                {step.id === 1 && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="m9 9 6 6" />
                    <path d="m15 9-6 6" />
                  </svg>
                )}
                {step.id === 2 && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
                {step.id === 3 && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m7.5 4.27 9 5.15" />
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                )}
                {step.id === 4 && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                  </svg>
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-2" style={{ color: step.color }}>
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
              
              {/* Connector line between steps (visible on desktop) */}
              {step.id < 4 && (
                <div className="hidden lg:block absolute top-12 -right-4 w-8 border-t-2 border-dashed border-gray-200 z-0"></div>
              )}
            </motion.div>
          ))}
        </motion.div>
        
        {/* Mobile Process Steps - New Timeline Design */}
        <div className="md:hidden">
          {/* Mobile Progress Bar */}
          <div className="relative h-2 bg-gray-200 rounded-full mb-8 mx-4">
            <div className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-[#e63946] to-[#ff4d6d]" 
                 style={{ width: `${(activeStep/4) * 100}%` }}>
            </div>
            {steps.map((step) => (
              <button 
                key={step.id} 
                className={`absolute top-0 -mt-2 w-6 h-6 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 transition-all duration-300 ${activeStep >= step.id ? 'scale-110' : 'bg-gray-300'}`}
                style={{ 
                  left: `${((step.id - 1) / 3) * 100}%`, 
                  backgroundColor: activeStep >= step.id ? step.color : '#e5e7eb'
                }}
                onClick={() => setActiveStep(step.id)}
                aria-label={`View step ${step.id}`}
              >
                <span className="sr-only">Step {step.id}</span>
              </button>
            ))}
          </div>
          
          {/* Step Selector Pills */}
          <div className="flex justify-between mb-8 mx-2">
            {steps.map((step) => (
              <button
                key={step.id}
                className={`text-xs font-semibold px-2 py-1 rounded-full transition-all ${
                  activeStep === step.id 
                    ? 'text-white shadow-md' 
                    : 'text-gray-500 bg-gray-100'
                }`}
                style={{ 
                  backgroundColor: activeStep === step.id ? step.color : ''
                }}
                onClick={() => setActiveStep(step.id)}
              >
                Step {step.id}
              </button>
            ))}
          </div>
          
          {/* Active Step Content with Animation */}
          <motion.div 
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            {steps.map((step) => (
              step.id === activeStep && (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.id}
                  </div>
                  
                  <div className="w-24 h-24 mb-5 flex items-center justify-center bg-[#ffe6f0] rounded-full">
                    {step.id === 1 && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="m9 9 6 6" />
                        <path d="m15 9-6 6" />
                      </svg>
                    )}
                    {step.id === 2 && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                    {step.id === 3 && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m7.5 4.27 9 5.15" />
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                    )}
                    {step.id === 4 && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                        <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                      </svg>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-center" style={{ color: step.color }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center text-lg">{step.description}</p>
                </div>
              )
            ))}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setActiveStep(prev => Math.max(prev - 1, 1))}
                disabled={activeStep === 1}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center ${
                  activeStep === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={() => setActiveStep(prev => Math.min(prev + 1, 4))}
                disabled={activeStep === 4}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center ${
                  activeStep === 4 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom CTA */}
        <motion.div 
          className="mt-12 md:mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-lg md:text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
            Experience personalized healthcare designed for your unique needs with Lily's.
          </p>
          <motion.a
            href="/booking"
            className="inline-block px-8 py-3 md:px-10 md:py-4 rounded-full font-bold text-white text-lg shadow-lg"
            style={{ 
              background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
              backgroundSize: "200% auto",
            }}
            whileHover={{ 
              scale: 1.05,
              backgroundPosition: "right center"
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            Book Appointment
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}