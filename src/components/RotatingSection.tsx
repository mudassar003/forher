"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import BMICalculator from "./BMICalculator";

const RedesignedWeightLossSection = () => {
  // activeCategory state removed as it's no longer needed
  const [wordIndex, setWordIndex] = useState(0);
  
  const animatedWords = [
    { text: "healthier", color: "#10b981" }, // Green for health
    { text: "happier", color: "#e63946" },   // Brand red for emotion
    { text: "stronger", color: "#3b82f6" },  // Blue for strength
    { text: "confident", color: "#8b5cf6" }, // Purple for confidence
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prevIndex) => (prevIndex + 1) % animatedWords.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Categories removed as requested

  return (
    <section className="relative w-full py-16 bg-gradient-to-b from-white to-[#fdfafa] overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#ffeef2] opacity-60 blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-[#f0f7ff] opacity-40 blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header area - more compact */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-3 text-gray-800"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Start Your Weight Loss Journey <span className="text-[#e63946]">The Right Way</span>
          </motion.h2>
          <motion.p 
            className="text-base text-gray-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Expert guidance and effective solutions tailored to your body's unique needs
          </motion.p>
        </div>
        
        {/* Main content area */}
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-10 md:gap-12">
          {/* Left column - more engaging, cleaner layout */}
          <motion.div 
            className="w-full lg:w-6/12 flex flex-col justify-center"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Animated headline with improved typography */}
            <div className="mb-6 md:mb-8">
              <h3 className="text-2xl md:text-3xl font-medium mb-1">
                <span className="text-gray-700">Be </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ color: animatedWords[wordIndex].color }}
                    className="font-bold relative inline-block"
                  >
                    {animatedWords[wordIndex].text}
                    <span className="absolute bottom-0 left-0 w-full h-1 rounded opacity-40" style={{ backgroundColor: animatedWords[wordIndex].color }}></span>
                  </motion.span>
                </AnimatePresence>
                <span className="text-gray-700"> today</span>
              </h3>
              <p className="text-gray-600 mt-3 md:pr-10">
                Our clinically-backed approach helps you achieve sustainable results with personalized support.
              </p>
            </div>
            
            {/* Benefits with enhanced visual presentation */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <motion.div 
                className="flex items-start gap-3 p-4 rounded-lg bg-white border border-gray-100 shadow-sm"
                whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.05)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-center min-w-8 h-8 rounded-full bg-[#e6f5ff] text-[#0284c7]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Save 30% with FSA & HSA</h4>
                  <p className="text-sm text-gray-600">Use pre-tax dollars to save on your health journey</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-3 p-4 rounded-lg bg-white border border-gray-100 shadow-sm"
                whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.05)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-center min-w-8 h-8 rounded-full bg-[#ecfdf5] text-[#10b981]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">No Insurance Needed</h4>
                  <p className="text-sm text-gray-600">Direct access to quality care without insurance hassles</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-3 p-4 rounded-lg bg-white border border-gray-100 shadow-sm"
                whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.05)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-center min-w-8 h-8 rounded-full bg-[#fff1f2] text-[#e63946]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Medical Expertise</h4>
                  <p className="text-sm text-gray-600">Board-certified professionals guide your weight loss journey</p>
                </div>
              </motion.div>
            </div>
            
            {/* Category selection removed as requested */}
          </motion.div>
          
          {/* Right column - Enhanced BMI calculator */}
          <motion.div 
            className="w-full lg:w-5/12 relative"
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-[#ffedf0] opacity-70 z-0"></div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-[#f0f7ff] opacity-60 z-0"></div>
            
            {/* Calculator with shadow and positioning effects */}
            <div className="relative z-10 transform hover:-translate-y-1 transition-transform duration-300">
              <BMICalculator />
            </div>
          </motion.div>
        </div>
        
        {/* Action buttons centered below section */}
        <div className="flex flex-wrap gap-4 justify-center mt-12">
          <motion.a 
            href="/products"
            className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-[#e63946] to-[#ff4d6d] shadow-sm flex items-center justify-center min-w-32 hover:shadow-md transition-all duration-300"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            See Products
          </motion.a>
          <motion.a 
            href="/booking"
            className="px-6 py-3 rounded-lg font-medium text-[#e63946] bg-white border border-[#e63946] shadow-sm flex items-center justify-center min-w-32 hover:bg-[#fff5f6] transition-all duration-300"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Book Appointment
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default RedesignedWeightLossSection;