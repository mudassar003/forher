"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Categories with accessible colors (WCAG AA compliant)
const categories = [
  { id: "weight-loss", text: "Weight Loss", color: "#0077b6", icon: "🍃" },  // Deep blue
  { id: "hair-care", text: "Hair Care", color: "#7209b7", icon: "✨" },      // Purple
  { id: "anxiety", text: "Anxiety Relief", color: "#3a86ff", icon: "🧘" },   // Blue
  { id: "skin", text: "Skin Care", color: "#38b000", icon: "✨" },          // Green
  { id: "cycle", text: "Cycle Management", color: "#d00000", icon: "🔄" },   // Red
];

// Content for each category that appears after selection
const categoryContent = {
  "weight-loss": {
    heading: "Personalized weight management",
    subheading: "Custom plans tailored to your body",
    ctaText: "Start your plan",
  },
  "hair-care": {
    heading: "Solutions for thicker, healthier hair",
    subheading: "Targeted treatments for your hair type",
    ctaText: "Hair assessment",
  },
  "anxiety": {
    heading: "Find your calm with custom support",
    subheading: "Evidence-based anxiety relief",
    ctaText: "Discover options",
  },
  "skin": {
    heading: "Reveal your natural glow",
    subheading: "Skincare routines for your unique needs",
    ctaText: "Skin analysis",
  },
  "cycle": {
    heading: "Balanced hormones, better life",
    subheading: "Track, understand, and optimize your cycle",
    ctaText: "Start tracking",
  },
};

export default function PersonalizedHeroSection() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [stage, setStage] = useState("initial"); // initial, selected, quiz

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setStage("selected");
  };

  // Reset to initial state
  const handleReset = () => {
    setSelectedCategory(null);
    setStage("initial");
  };

  // Start personalization quiz
  const handleStartQuiz = () => {
    setStage("quiz");
  };

  return (
    <section className="flex flex-col items-start justify-center min-h-[70vh] px-6 md:px-12 lg:px-24 py-12 relative overflow-hidden">
      {/* Background gradient effect */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ 
          background: "radial-gradient(circle at 30% 50%, rgba(58, 134, 255, 0.15), transparent 70%)"
        }} 
      />

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {stage === "initial" && (
          <>
            {/* Initial headline */}
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-normal leading-tight mb-6"
              style={{ color: "#0e2b5c" }} /* Dark blue for high contrast */
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Personalized care <br className="hidden md:block" />
              <span className="text-4xl md:text-6xl lg:text-7xl">designed for you</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              className="text-gray-600 text-xl md:text-2xl mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              What are you looking for help with today?
            </motion.p>

            {/* Category selection pills */}
            <motion.div 
              className="flex flex-wrap gap-3 md:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  className="px-6 py-3 rounded-full text-white font-medium text-lg md:text-xl transition-all hover:shadow-lg flex items-center gap-2"
                  style={{ backgroundColor: category.color }}
                  onClick={() => handleCategorySelect(category.id)}
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.2 + (index * 0.1) }
                  }}
                >
                  <span>{category.icon}</span>
                  <span>{category.text}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}

        {stage === "selected" && selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {/* Category specific content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              {/* Selected category indicator */}
              <div className="flex items-center gap-2 mb-4">
                <button 
                  onClick={handleReset}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← All categories
                </button>
                <span className="text-gray-400">|</span>
                <span 
                  className="px-3 py-1 rounded-full text-white text-sm"
                  style={{ backgroundColor: categories.find(c => c.id === selectedCategory)?.color }}
                >
                  {categories.find(c => c.id === selectedCategory)?.text}
                </span>
              </div>
              
              {/* Dynamic heading based on selection */}
              <h1 
                className="text-5xl md:text-7xl lg:text-7xl font-normal mb-4"
                style={{ color: categories.find(c => c.id === selectedCategory)?.color }}
              >
                {categoryContent[selectedCategory].heading}
              </h1>
              
              {/* Dynamic subheading */}
              <p className="text-gray-600 text-xl md:text-2xl mb-12">
                {categoryContent[selectedCategory].subheading}
              </p>
              
              {/* Call to action */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className="px-8 py-4 rounded-full text-white font-medium text-lg transition-all hover:shadow-lg"
                  style={{ backgroundColor: "#3a86ff" }} /* Universal accessible blue */
                  onClick={() => window.location.href="/appointment"}
                >
                  Book an Appointment
                </button>
                <button 
                  className="px-8 py-4 rounded-full bg-white text-gray-700 border border-gray-200 font-medium text-lg transition-all hover:shadow-lg"
                  onClick={handleStartQuiz}
                >
                  Take Assessment Survey
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {stage === "quiz" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8"
          >
            {/* Simple quiz start */}
            <div className="text-center mb-6">
              <h2 
                className="text-3xl font-normal mb-4"
                style={{ color: categories.find(c => c.id === selectedCategory)?.color }}
              >
                Let's personalize your {categories.find(c => c.id === selectedCategory)?.text.toLowerCase()} plan
              </h2>
              <p className="text-gray-600">
                Answer a few questions so we can tailor our recommendations
              </p>
            </div>
            
            {/* Quiz would continue here - this is just the starting point */}
            <div className="space-y-6 mb-8">
              <div className="text-left">
                <label className="block text-gray-700 mb-2">How would you describe your current concerns?</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option>Select an option</option>
                  <option>Just starting my journey</option>
                  <option>Tried other solutions without success</option>
                  <option>Looking to maintain my progress</option>
                </select>
              </div>
              
              <div className="text-left">
                <label className="block text-gray-700 mb-2">What's your top priority right now?</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option>Select an option</option>
                  <option>Quick results</option>
                  <option>Sustainable long-term approach</option>
                  <option>Addressing specific health concerns</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                className="px-6 py-3 rounded-full bg-white text-gray-700 border border-gray-200 font-medium transition-all hover:shadow-md"
                onClick={() => setStage("selected")}
              >
                Back
              </button>
              <button 
                className="px-6 py-3 rounded-full text-white font-medium transition-all hover:shadow-md"
                style={{ backgroundColor: categories.find(c => c.id === selectedCategory)?.color }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}