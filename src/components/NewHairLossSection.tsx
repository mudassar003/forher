"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import React from "react";

// Define types for our data
interface Solution {
  id: string;
  title: string;
  icon: string;
  description: string;
}

interface SolutionContent {
  title: string;
  subtitle: string;
  features: string[];
  results: string;
  timeline: number;
}

interface SolutionContents {
  [key: string]: SolutionContent;
}

const solutions: Solution[] = [
  {
    id: "minoxidil",
    title: "Topical Minoxidil",
    icon: "💧",
    description: "FDA-approved medication that promotes hair growth and slows balding."
  },
  {
    id: "finasteride",
    title: "Oral Finasteride",
    icon: "💊",
    description: "Prescription medication that blocks DHT, the hormone responsible for hair loss."
  },
  {
    id: "combo",
    title: "Combined Therapy",
    icon: "✨",
    description: "Our most effective solution combining multiple treatments for maximum results."
  }
];

export default function NewHairLossSection(): React.ReactElement {
  const [activeSolution, setActiveSolution] = useState<string>("minoxidil");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [beforeAfterValue, setBeforeAfterValue] = useState<number>(50);

  // Solution content based on selection
  const solutionContent: SolutionContents = {
    minoxidil: {
      title: "Topical Minoxidil",
      subtitle: "The #1 FDA-approved hair regrowth treatment",
      features: [
        "Easy-to-apply topical solution",
        "Clinically proven to regrow hair",
        "Results visible within 3-6 months",
        "Safe for long-term use"
      ],
      results: "50% of users see improved hair growth",
      /* No pricing information */
      timeline: 6
    },
    finasteride: {
      title: "Oral Finasteride",
      subtitle: "Halt hair loss at the hormonal source",
      features: [
        "Once-daily oral tablet",
        "Blocks DHT production",
        "Prevents further hair thinning",
        "Most effective for crown and vertex balding"
      ],
      results: "83% of users prevent further hair loss",
      /* No pricing information */
      timeline: 4
    },
    combo: {
      title: "Combined Therapy",
      subtitle: "Maximum results with our dual approach",
      features: [
        "Minoxidil + Finasteride combination",
        "Attacks hair loss from multiple angles",
        "Enhanced efficacy over single treatments",
        "Quarterly physician consultations included"
      ],
      results: "94% success rate for combined therapy",
      /* No pricing information */
      timeline: 3
    }
  };

  const handleSolutionChange = (solution: string): void => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveSolution(solution);
      setIsAnimating(false);
    }, 300);
  };

  // Animation variants
  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="relative py-10 md:py-16 lg:py-24 bg-gradient-to-b from-white to-[#f9f9f9] overflow-hidden">
      {/* Background elements */}
      <div className="absolute -top-10 right-0 w-40 md:w-64 h-40 md:h-64 rounded-full bg-[#ffe6f0] opacity-20 blur-3xl"></div>
      <div className="absolute bottom-20 left-0 w-40 md:w-80 h-40 md:h-80 rounded-full bg-[#f9dde5] opacity-20 blur-3xl"></div>
      
      {/* Content container */}
      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-8 md:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4" style={{ color: "#e63946" }}>
            Transform Your Hair Journey
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced solutions for thicker, fuller hair backed by science and medical expertise
          </p>
        </motion.div>

        {/* Solutions Selection */}
        <motion.div 
          className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {solutions.map((solution) => (
            <button
              key={solution.id}
              onClick={() => handleSolutionChange(solution.id)}
              className={`flex items-center gap-1 md:gap-2 px-3 sm:px-4 md:px-6 py-2 md:py-3 rounded-full text-sm sm:text-base transition-all ${
                activeSolution === solution.id
                  ? "bg-gradient-to-r from-[#e63946] to-[#ff758f] text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-200 hover:shadow-md"
              }`}
            >
              <span>{solution.icon}</span>
              <span className="font-medium">{solution.title}</span>
            </button>
          ))}
        </motion.div>

        {/* Main content area - Before/After with Solution details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
          {/* Left side: Before/After slider */}
          <motion.div 
            className="relative bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Before/After comparison visualization - Now using actual image */}
            <div className="aspect-[4/3] relative">
              {/* Using the HairLoss.webp image */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="relative h-full w-full">
                  {/* After image (full) */}
                  <div className="absolute inset-0 w-full h-full">
                    <Image 
                      src="/images/HairLoss.webp" 
                      alt="After hair treatment results" 
                      fill 
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  
                  {/* Before image (shown based on slider) */}
                  <div 
                    className="absolute inset-0 w-full h-full overflow-hidden" 
                    style={{ width: `${beforeAfterValue}%` }}
                  >
                    <div className="absolute inset-0 bg-gray-800 opacity-70 flex items-center justify-center">
                      <Image 
                        src="/images/HairLoss.webp" 
                        alt="Before hair treatment" 
                        fill 
                        style={{ 
                          objectFit: 'cover',
                          filter: 'grayscale(100%) brightness(60%)'
                        }}
                      />
                      <span className="absolute text-white text-opacity-80 text-base md:text-xl font-bold">BEFORE</span>
                    </div>
                  </div>
                  
                  {/* After label */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span 
                      className="text-white text-opacity-80 text-base md:text-xl font-bold"
                      style={{ 
                        transform: `translateX(${beforeAfterValue < 50 ? '0' : '100px'})`,
                        opacity: beforeAfterValue > 70 ? 1 : 0,
                        transition: 'all 0.3s ease-in-out'
                      }}
                    >
                      AFTER
                    </span>
                  </div>
                  
                  {/* Slider control */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={beforeAfterValue} 
                      onChange={(e) => setBeforeAfterValue(parseInt(e.target.value))}
                      className="w-full h-1 appearance-none bg-transparent z-10"
                      style={{
                        accentColor: "#e63946"
                      }}
                    />
                    <div 
                      className="absolute left-1/2 top-0 w-1 h-full bg-white transform -translate-x-1/2 pointer-events-none z-10"
                      style={{ left: `${beforeAfterValue}%` }}
                    ></div>
                    
                    {/* Drag handle */}
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md pointer-events-none z-20 flex items-center justify-center"
                      style={{ left: `${beforeAfterValue}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ background: "#e63946" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Month indicator */}
            <div className="p-3 sm:p-4 md:p-6 border-t border-gray-100">
              <h3 className="text-base md:text-lg lg:text-xl font-semibold mb-2 text-gray-800">
                Results Timeline
              </h3>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-[#e63946]">
                      Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-[#e63946]">
                      {solutionContent[activeSolution].timeline} months to full results
                    </span>
                  </div>
                </div>
                <div className="relative h-2 mt-2">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div 
                      style={{ width: "70%" }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#e63946] to-[#ff758f]"
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 -mt-2">
                    <span>Month 1</span>
                    <span className="hidden sm:inline">Month 3</span>
                    <span>Month 6</span>
                    <span>Month 12</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right side: Solution details */}
          <motion.div 
            className="flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSolution}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 h-full"
              >
                <div className="space-y-4 md:space-y-6">
                  {/* Header */}
                  <div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: "#e63946" }}>
                      {solutionContent[activeSolution].title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mt-1 md:mt-2">
                      {solutionContent[activeSolution].subtitle}
                    </p>
                  </div>
                  
                  {/* Features */}
                  <div>
                    <h4 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-gray-800">Key Benefits</h4>
                    <ul className="space-y-2 md:space-y-3">
                      {solutionContent[activeSolution].features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-4 md:w-5 h-4 md:h-5 rounded-full bg-[#e63946]">✓</span>
                          <span className="text-sm sm:text-base text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Results */}
                  <div className="bg-[#f9f9f9] rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-[#ffe6f0]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
                          <path d="m22 11-7-9v5H3v8h12v5z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-base md:text-lg font-semibold text-gray-800">Expected Results</h4>
                        <p className="text-sm sm:text-base text-[#e63946]">{solutionContent[activeSolution].results}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* CTA Only */}
                  <div className="flex justify-center pt-2 md:pt-4 mt-auto">
                    <motion.button 
                      className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg text-white shadow-md"
                      style={{ 
                        background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
                        backgroundSize: "200% auto" 
                      }}
                      whileHover={{ 
                        scale: 1.03, 
                        backgroundPosition: "right center"
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                    >
                      Book Appointment
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
        
        {/* Trust indicators */}
        <motion.div
          className="mt-10 sm:mt-12 md:mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: "#e63946" }}>
              Why Choose Our Hair Solutions
            </h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Join thousands who've transformed their hair with our science-backed approach
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white rounded-lg p-4 md:p-6 text-center border border-gray-100 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
                  <path d="M3 7V5c0-1.1.9-2 2-2h2"></path>
                  <path d="M17 3h2c1.1 0 2 .9 2 2v2"></path>
                  <path d="M21 17v2c0 1.1-.9 2-2 2h-2"></path>
                  <path d="M7 21H5c-1.1 0-2-.9-2-2v-2"></path>
                  <path d="M8 7v10"></path>
                  <path d="M16 7v10"></path>
                  <path d="M12 7v10"></path>
                </svg>
              </div>
              <h4 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-gray-800">FDA Approved</h4>
              <p className="text-xs sm:text-sm text-gray-600">All treatments meet strict FDA guidelines</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 md:p-6 text-center border border-gray-100 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </div>
              <h4 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-gray-800">96% Satisfaction</h4>
              <p className="text-xs sm:text-sm text-gray-600">Our patients love their results</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 md:p-6 text-center border border-gray-100 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <h4 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-gray-800">Expert Support</h4>
              <p className="text-xs sm:text-sm text-gray-600">Guidance from hair restoration specialists</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 md:p-6 text-center border border-gray-100 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
              </div>
              <h4 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-gray-800">Privacy First</h4>
              <p className="text-xs sm:text-sm text-gray-600">Discreet delivery and consultations</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}