"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import BMICalculator from "./BMICalculator";

const RedesignedWeightLossSection = () => {
  const [activeCategory, setActiveCategory] = useState("weight-loss");
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

  const categories = [
    { id: "weight-loss", text: "Weight Loss", icon: "🍃", content: "Personalized programs designed to help you lose weight in a safe, sustainable way." },
    { id: "nutrition", text: "Nutrition", icon: "🥗", content: "Expert advice on meal planning and dietary adjustments tailored to your lifestyle." },
    { id: "exercise", text: "Exercise", icon: "🏃‍♀️", content: "Activity recommendations that fit your body type, preferences, and fitness level." },
  ];

  const getActiveContent = () => {
    return categories.find(cat => cat.id === activeCategory)?.content || "";
  };

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
            
            {/* Category selection with improved visual design */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4 p-1 bg-gray-50 rounded-xl">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                      activeCategory === category.id
                        ? "bg-white text-[#e63946] shadow-sm border border-gray-100"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <span className="mr-2">{category.icon}</span>
                    <span>{category.text}</span>
                  </button>
                ))}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm min-h-16"
                >
                  <p className="text-gray-700">{getActiveContent()}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Action buttons with improved visual appeal */}
            <div className="flex flex-wrap gap-4">
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
            
            {/* Trust indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 p-4 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 bg-[#ecfdf5] rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#10b981]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-700">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 bg-[#eff6ff] rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3b82f6]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-700">Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 bg-[#fff1f2] rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#e63946]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-700">4,500+ Happy Clients</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Testimonial/social proof section */}
        <motion.div 
          className="mt-16 md:mt-20 bg-white p-6 rounded-lg border border-gray-100 shadow-sm max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              <img src="/api/placeholder/100/100" alt="Client testimonial" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1">
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <blockquote className="text-gray-700 italic mb-3">
                "Lily's program changed my life. The personalized approach and medical guidance helped me lose 30 pounds in 4 months. I've never felt better!"
              </blockquote>
              
              <div>
                <p className="font-medium text-gray-900">Sarah J.</p>
                <p className="text-sm text-gray-500">Lost 30 lbs • Member since 2023</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RedesignedWeightLossSection;