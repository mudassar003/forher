"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BMICalculator from "./BMICalculator";

const categories = [
  { id: "weight-loss", text: "Weight Loss", icon: "🍃" },
  { id: "nutrition", text: "Nutrition", icon: "🥗" },
  { id: "exercise", text: "Exercise", icon: "🏃‍♀️" },
];

export default function RotatingSection() {
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

  // Animation variants
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

  return (
    <section
      className="relative w-full py-16 md:py-24 bg-white overflow-hidden"
    >
      {/* Background elements - styled differently from HowItWorks but using same color scheme */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-[#fff9fb]"></div>
      <div className="absolute -top-12 right-0 w-32 h-32 md:w-48 md:h-48 rounded-full bg-[#ffe6f0] opacity-60 translate-x-1/3"></div>
      <div className="absolute bottom-1/4 left-0 w-40 h-40 md:w-64 md:h-64 rounded-full bg-[#f9dde5] opacity-50 -translate-x-1/3"></div>
      <div className="absolute top-1/3 right-1/4 w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#ffd1e0] opacity-30"></div>
      
      {/* Content container */}
      <div className="container mx-auto relative z-10 px-6">
        {/* Section header - Now at the top like How It Works */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ color: "#e63946" }}
          >
            Start Your Weight Loss Journey The Right Way
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Expert guidance and effective solutions tailored to your body's unique needs
          </motion.p>
        </motion.div>

        {/* Main content with side-by-side layout */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Left column: Copy and buttons */}
          <motion.div 
            className="w-full md:w-1/2 pl-4 pr-4 md:pl-8 md:pr-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Animated word cycle */}
            <motion.p 
              className="text-xl md:text-3xl lg:text-4xl mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
              className="space-y-4 md:space-y-5 mb-10 md:mb-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#ffe6f0] text-[#e63946]">
                  ✓
                </span>
                <p className="text-gray-600 text-base md:text-lg">Save 30% on avg. with FSA & HSA</p>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#ffe6f0] text-[#e63946]">
                  ✓
                </span>
                <p className="text-gray-600 text-base md:text-lg">No insurance required</p>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#ffe6f0] text-[#e63946]">
                  ✓
                </span>
                <p className="text-gray-600 text-base md:text-lg">Expert medical guidance available</p>
              </motion.div>
            </motion.div>
            
            {/* Categories tabs/pills */}
            <motion.div 
              className="flex flex-wrap gap-3 mb-10 md:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-5 py-2.5 rounded-full text-sm md:text-base font-medium transition-all ${
                    activeCategory === category.id
                      ? "bg-[#e63946] text-white shadow-md"
                      : "bg-[#ffe6f0] text-[#e63946] hover:bg-[#ffcfdd]"
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
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.button 
                className="px-8 py-3.5 rounded-full font-semibold text-base md:text-lg shadow-md text-white"
                style={{
                  background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
                  backgroundSize: "200% auto"
                }}
                whileHover={{ 
                  scale: 1.05,
                  backgroundPosition: "right center"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
                aria-label="See available products"
              >
                See Products
              </motion.button>
              <motion.button 
                className="px-8 py-3.5 rounded-full font-semibold text-base md:text-lg shadow-md border-2 border-[#e63946] text-[#e63946] bg-white hover:bg-[#fff5f7] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
                aria-label="Book a consultation appointment"
              >
                Book Appointment
              </motion.button>
            </motion.div>
          </motion.div>
          
          {/* Right column: BMI Calculator */}
          <motion.div 
            className="w-full md:w-5/12 mt-8 md:mt-0"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-[#ffe6f0] opacity-70 z-0"></div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-[#f9dde5] opacity-60 z-0"></div>
              
              {/* BMI Calculator */}
              <div className="relative z-10">
                <BMICalculator />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}