"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BMICalculator from "./BMICalculator";

const categories = [
  { id: "weight-loss", text: "Weight Loss", icon: "🍃" },
  { id: "nutrition", text: "Nutrition", icon: "🥗" },
  { id: "exercise", text: "Exercise", icon: "🏃‍♀️" },
];

export default function HeroSection() {
  const [activeCategory, setActiveCategory] = useState("weight-loss");
  const [wordIndex, setWordIndex] = useState(0);
  
  const animatedWords = [
    { text: "healthier", color: "#e63946" },
    { text: "happier", color: "#d81159" },
    { text: "stronger", color: "#8f2d56" },
    { text: "better", color: "#ff4d6d" },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prevIndex) => (prevIndex + 1) % animatedWords.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full py-16 md:py-24 bg-gradient-to-b from-white to-[#f9f9f9] overflow-hidden">
      {/* Background elements */}
      <div className="absolute -top-10 right-0 w-64 h-64 rounded-full bg-[#ffe6f0] opacity-20 blur-3xl"></div>
      <div className="absolute bottom-20 left-0 w-80 h-80 rounded-full bg-[#f9dde5] opacity-20 blur-3xl"></div>

      {/* Main content container with side-by-side layout */}
      <div className="container mx-auto relative z-10 px-6 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        {/* Left column: Copy and buttons */}
        <motion.div 
          className="w-full md:w-1/2 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ color: "#e63946" }}
          >
            Start Your Weight Loss Journey The Right Way
          </motion.h1>
          
          {/* Animated word cycle */}
          <motion.p 
            className="text-xl md:text-2xl lg:text-3xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-gray-600">Be </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ color: animatedWords[wordIndex].color }}
                className="font-semibold"
              >
                {animatedWords[wordIndex].text}
              </motion.span>
            </AnimatePresence>
            <span className="text-gray-600"> today</span>
          </motion.p>
          
          {/* Benefits list */}
          <motion.div 
            className="space-y-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#ffe6f0] text-[#e63946]">
                ✓
              </span>
              <p className="text-gray-600">Save 30% on avg. with FSA & HSA</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#ffe6f0] text-[#e63946]">
                ✓
              </span>
              <p className="text-gray-600">No insurance required</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#ffe6f0] text-[#e63946]">
                ✓
              </span>
              <p className="text-gray-600">Expert medical guidance available</p>
            </div>
          </motion.div>
          
          {/* Categories tabs/pills */}
          <motion.div 
            className="flex flex-wrap gap-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? "bg-gradient-to-r from-[#e63946] to-[#ff758f] text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:shadow-sm"
                }`}
                onClick={() => setActiveCategory(category.id)}
                aria-label={`Select ${category.text}`}
              >
                <span className="mr-1">{category.icon}</span>
                <span>{category.text}</span>
              </button>
            ))}
          </motion.div>
          
          {/* CTA buttons */}
          <motion.div 
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.button 
              className="px-6 py-3 rounded-full font-semibold shadow-lg"
              style={{
                background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
                backgroundSize: "200% auto",
                color: "white"
              }}
              whileHover={{ 
                scale: 1.05, 
                backgroundPosition: "right center"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              onClick={() => window.location.href="/products"}
            >
              See Products
            </motion.button>
            <motion.button 
              className="px-6 py-3 rounded-full font-semibold shadow-md bg-white text-gray-700 border border-gray-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              onClick={() => window.location.href="/consultation"}
            >
              Book Consultation
            </motion.button>
          </motion.div>
        </motion.div>
        
        {/* Right column: BMI Calculator */}
        <motion.div 
          className="w-full md:w-5/12 mt-8 md:mt-0"
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <BMICalculator />
          </div>
        </motion.div>
      </div>
      
      {/* Wave transition at the bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg className="relative block w-full h-16 sm:h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C15,10.18,36.88,20.62,58.94,31.06,108.88,52.93,163.34,71.36,216,87.57,281.12,107.36,345.66,119.57,411,119.22Z" 
            className="fill-white"
          ></path>
        </svg>
      </div>
    </section>
  );
}