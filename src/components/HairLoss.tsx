"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function HairLoss() {
  const [activeTab, setActiveTab] = useState("minoxidil");

  // Treatment data for better maintenance
  const treatments = {
    minoxidil: {
      title: "Minoxidil",
      description: "The most widely used treatment for hair regrowth with proven results.",
      tags: ["FDA-Approved", "Topical", "No Prescription"],
      timeline: "60%", // 3-6 months
      features: [
        "Regrow hair in as little as 3–6 months",
        "FDA-approved for both men and women",
        "Easy-to-apply topical solution",
        "Proven to increase hair count by up to 25%"
      ],
      price: "$49",
      regularPrice: "$69",
      ctaText: "Book Consultation"
    },
    finasteride: {
      title: "Finasteride",
      description: "Blocks DHT to help prevent further hair loss and maintain your hair.",
      tags: ["FDA-Approved", "Oral", "Prescription"],
      timeline: "80%", // 3-6 months, but more effective
      features: [
        "Prevents further hair loss at the source",
        "Reduces DHT, the hormone causing hair loss",
        "Once-daily oral medication",
        "Results visible within 3-6 months"
      ],
      price: "$59",
      regularPrice: "$79",
      ctaText: "Start Treatment"
    },
    combo: {
      title: "Complete Care",
      description: "Our most comprehensive solution for maximum hair regrowth and retention.",
      tags: ["Minoxidil", "Finasteride", "Biotin"],
      timeline: "100%", // Full effectiveness
      isBestValue: true,
      features: [
        "Minoxidil + Finasteride combination therapy",
        "Targets hair loss from multiple angles",
        "Biotin supplement for hair health",
        "Quarterly follow-ups with hair specialists"
      ],
      price: "$89",
      regularPrice: "$129",
      ctaText: "Start Treatment"
    }
  };

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
    <section className="relative w-full py-16 md:py-24 bg-white overflow-hidden" aria-labelledby="hair-growth-heading">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#FBF8F7] to-white"></div>
      <div className="absolute -top-1 left-0 w-24 h-24 md:w-40 md:h-40 rounded-full bg-[#ffe6f0] opacity-50 -translate-x-1/2"></div>
      <div className="absolute top-1/4 right-0 w-32 h-32 md:w-56 md:h-56 rounded-full bg-[#f9dde5] opacity-40 translate-x-1/2"></div>
      
      {/* Main content container */}
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 id="hair-growth-heading" className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "#e63946" }}>
            Grow Hair Like Never Before
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Lily's clinically proven treatments tailored to your unique hair restoration journey
          </p>
        </motion.div>

        {/* Treatment options with tabs */}
        <motion.div 
          className="w-full max-w-4xl mx-auto mb-12 md:mb-16 overflow-hidden rounded-2xl shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          {/* Tabs - Improved for mobile */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 bg-white">
            {Object.entries(treatments).map(([id, treatment]) => (
              <button 
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 py-4 px-4 md:px-6 text-center font-semibold text-base md:text-lg transition-all whitespace-nowrap ${
                  activeTab === id 
                    ? "text-[#e63946] border-b-2 border-[#e63946]" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
                aria-selected={activeTab === id}
                role="tab"
              >
                {treatment.title}
              </button>
            ))}
          </div>

          {/* Content based on active tab with improved layout for mobile */}
          <div className="bg-white p-6 md:p-8">
            {Object.entries(treatments).map(([id, treatment]) => (
              activeTab === id && (
                <div key={id} className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/2">
                    <div className="relative p-6 bg-gray-50 rounded-2xl border border-gray-100 h-full shadow-sm">
                      {treatment.isBestValue && (
                        <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-[#e63946] text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg z-10">
                          BEST VALUE
                        </div>
                      )}
                      
                      <div className="relative z-10">
                        <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{treatment.title}</div>
                        <div className="h-1 w-20 bg-[#e63946] mb-4 rounded-full"></div>
                        <p className="text-gray-600 mb-4">{treatment.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {treatment.tags.map(tag => (
                            <span key={tag} className="bg-[#ffe6f0] text-[#e63946] px-3 py-1 rounded-full text-sm font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="mt-6">
                          <span className="text-gray-600 text-sm">Result Timeline</span>
                          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                            <div className="h-full rounded-full bg-[#e63946]" 
                                 style={{
                                   width: treatment.timeline
                                 }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>3 months</span>
                            <span>6 months</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{`${treatment.title} Treatment`}</h3>
                    <ul className="space-y-3 mb-6">
                      {treatment.features.map(feature => (
                        <li key={feature} className="flex items-start">
                          <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#e63946]">✓</span>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center mb-6">
                      <div className="mr-4">
                        <span className="text-2xl md:text-3xl font-bold text-gray-800">{treatment.price}</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      <span className="line-through text-gray-400">{treatment.regularPrice}</span>
                    </div>
                    <motion.button 
                      className="w-full py-3 md:py-4 rounded-xl font-bold text-lg shadow-md text-white"
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
                      aria-label={treatment.ctaText}
                    >
                      {treatment.ctaText}
                    </motion.button>
                  </div>
                </div>
              )
            ))}
          </div>
        </motion.div>

        {/* Trust indicators and benefits */}
        <motion.div
          className="w-full max-w-4xl mx-auto mb-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2" style={{ color: "#e63946" }}>
              <span className="inline-block">
                <span className="inline-block mr-2">✨</span>Backed by science
              </span>
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-lg p-6 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-[#e63946] text-3xl font-bold mb-2">96%</span>
              <p className="text-gray-600 text-sm">of users see visible results</p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-lg p-6 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-[#d81159] text-3xl font-bold mb-2">25%</span>
              <p className="text-gray-600 text-sm">average hair count increase</p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-lg p-6 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-[#8f2d56] text-3xl font-bold mb-2">4.8/5</span>
              <p className="text-gray-600 text-sm">customer satisfaction</p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-lg p-6 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-[#ff4d6d] text-3xl font-bold mb-2">30+</span>
              <p className="text-gray-600 text-sm">licensed physicians</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}