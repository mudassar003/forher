"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const solutions = [
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

export default function NewHairLossSection() {
  const [activeSolution, setActiveSolution] = useState("minoxidil");
  const [isAnimating, setIsAnimating] = useState(false);
  const [beforeAfterValue, setBeforeAfterValue] = useState(50);

  // Solution content based on selection
  const solutionContent = {
    minoxidil: {
      title: "Topical Minoxidil",
      subtitle: "The #1 FDA-approved hair regrowth treatment",
      features: [
        "Easy-to-apply topical solution",
        "Clinically proven to regrow hair",
        "Results visible within 3-6 months",
        "Safe for long-term use"
      ],
      results: "76% of users see improved hair growth",
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

  const handleSolutionChange = (solution) => {
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
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-white to-[#f9f9f9] overflow-hidden">
      {/* Background elements */}
      <div className="absolute -top-10 right-0 w-64 h-64 rounded-full bg-[#ffe6f0] opacity-20 blur-3xl"></div>
      <div className="absolute bottom-20 left-0 w-80 h-80 rounded-full bg-[#f9dde5] opacity-20 blur-3xl"></div>
      
      {/* Content container */}
      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "#e63946" }}>
            Transform Your Hair Journey
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced solutions for thicker, fuller hair backed by science and medical expertise
          </p>
        </motion.div>

        {/* Solutions Selection */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {solutions.map((solution) => (
            <button
              key={solution.id}
              onClick={() => handleSolutionChange(solution.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left side: Before/After slider */}
          <motion.div 
            className="relative bg-white rounded-2xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Before/After comparison visualization */}
            <div className="aspect-[4/3] relative">
              {/* Background pattern for placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 grid grid-cols-2">
                <div className="relative h-full overflow-hidden bg-gray-800">
                  <div className="absolute inset-0 opacity-70 flex items-center justify-center">
                    <span className="text-white text-opacity-30 text-xl font-bold">BEFORE</span>
                  </div>
                </div>
                <div className="relative h-full overflow-hidden bg-[#ffe6f0]">
                  <div className="absolute inset-0 opacity-70 flex items-center justify-center">
                    <span className="text-[#e63946] text-opacity-50 text-xl font-bold">AFTER</span>
                  </div>
                </div>
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
                <div className="absolute left-0 top-0 h-full bg-gray-800" style={{ width: `${beforeAfterValue}%` }}></div>
                <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white transform -translate-x-1/2 pointer-events-none"></div>
              </div>
            </div>
            
            {/* Month indicator */}
            <div className="p-4 md:p-6 border-t border-gray-100">
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-800">
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
                    <span>Month 3</span>
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
                className="bg-white rounded-2xl shadow-lg p-6 md:p-8 h-full"
              >
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold" style={{ color: "#e63946" }}>
                      {solutionContent[activeSolution].title}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {solutionContent[activeSolution].subtitle}
                    </p>
                  </div>
                  
                  {/* Features */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">Key Benefits</h4>
                    <ul className="space-y-3">
                      {solutionContent[activeSolution].features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#e63946]">✓</span>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Results */}
                  <div className="bg-[#f9f9f9] rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#ffe6f0]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m22 11-7-9v5H3v8h12v5z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Expected Results</h4>
                        <p className="text-[#e63946]">{solutionContent[activeSolution].results}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* CTA Only */}
                  <div className="flex justify-center pt-4 mt-auto">
                    <motion.button 
                      className="px-8 py-4 rounded-xl font-bold text-lg text-white shadow-md"
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
          className="mt-16 md:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2" style={{ color: "#e63946" }}>
              Why Choose Our Hair Solutions
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands who've transformed their hair with our science-backed approach
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 text-center border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5c0-1.1.9-2 2-2h2"></path>
                  <path d="M17 3h2c1.1 0 2 .9 2 2v2"></path>
                  <path d="M21 17v2c0 1.1-.9 2-2 2h-2"></path>
                  <path d="M7 21H5c-1.1 0-2-.9-2-2v-2"></path>
                  <path d="M8 7v10"></path>
                  <path d="M16 7v10"></path>
                  <path d="M12 7v10"></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-800">FDA Approved</h4>
              <p className="text-gray-600 text-sm">All treatments meet strict FDA guidelines</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-800">96% Satisfaction</h4>
              <p className="text-gray-600 text-sm">Our patients love their results</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-800">Expert Support</h4>
              <p className="text-gray-600 text-sm">Guidance from hair restoration specialists</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-800">Privacy First</h4>
              <p className="text-gray-600 text-sm">Discreet delivery and consultations</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}