"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Define strict TypeScript types
type CategoryId = "weight-loss" | "hair-care" | "anxiety" | "skin" | "cycle";
type Stage = "initial" | "selected" | "quiz";

interface Category {
  id: CategoryId;
  text: string;
  icon: string;
}

interface CategoryContent {
  heading: string;
  subheading: string;
  ctaText: string;
}

interface AnimatedWord {
  text: string;
  color: string;
}

interface GradientTextStyle {
  color: string;
  background?: string;
  backgroundSize?: string;
  WebkitBackgroundClip?: string;
  WebkitTextFillColor?: string;
  backgroundClip?: string;
  animation?: string;
}

// Categories with consistent naming but we'll use a gradient instead of individual colors
const categories: Category[] = [
  { id: "weight-loss", text: "Weight Loss", icon: "🍃" },
  { id: "hair-care", text: "Hair Care", icon: "✨" },
  { id: "anxiety", text: "Anxiety Relief", icon: "🧘" },
  { id: "skin", text: "Skin Care", icon: "✨" },
  { id: "cycle", text: "Cycle Management", icon: "🔄" },
];

// Content for each category that appears after selection
const categoryContent: Record<CategoryId, CategoryContent> = {
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

export default function PersonalizedHeroSection(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [stage, setStage] = useState<Stage>("initial"); // initial, selected, quiz
  const [wordIndex, setWordIndex] = useState<number>(0);
  
  const animatedWords: AnimatedWord[] = [
    { text: "healthier", color: "#e63946" }, // Brand red
    { text: "happier", color: "#d81159" },  // Dark pink
    { text: "stronger", color: "#8f2d56" }, // Deep raspberry
    { text: "better", color: "#c1121f" },   // Cherry red
    { text: "transformed", color: "#ff4d6d" } // Coral pink
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prevIndex) => (prevIndex + 1) % animatedWords.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [animatedWords.length]);

  // Handle category selection
  const handleCategorySelect = (categoryId: CategoryId): void => {
    setSelectedCategory(categoryId);
    setStage("selected");
  };

  // Reset to initial state
  const handleReset = (): void => {
    setSelectedCategory(null);
    setStage("initial");
  };

  // Start personalization quiz
  const handleStartQuiz = (): void => {
    setStage("quiz");
  };

  // Add keyframes for animations
  const animationKeyframes = `
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  // Gradient text styles with proper typing
  const gradientTextStyle: GradientTextStyle = {
    color: "#e63946" // Using the brand color for "No More Waiting"
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] px-6 md:px-12 lg:px-24 py-12 relative overflow-hidden">
      {/* Inject the keyframes animation */}
      <style>{animationKeyframes}</style>
      
      {/* Background gradient effect */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ 
          background: "radial-gradient(circle at 50% 50%, rgba(230, 57, 70, 0.15), transparent 70%)"
        }} 
      />

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
        {stage === "initial" && (
          <>
            {/* Initial headline */}
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-normal leading-tight mb-14"
              style={gradientTextStyle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              aria-live="polite"
            >
              No More Waiting.
            </motion.h1>
            
            {/* Animated subheading */}
            <motion.div 
              className="text-5xl md:text-6xl lg:text-7xl font-normal mb-8 overflow-visible h-32"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  className="inline-block text-4xl md:text-5xl lg:text-6xl"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{ color: animatedWords[wordIndex].color }}
                >
                  <span className="text-gray-500">Be</span> <span 
                    className="underline decoration-wavy decoration-2 underline-offset-8"
                  >
                    {animatedWords[wordIndex].text}
                  </span> <span className="text-gray-500">Today</span>
                </motion.span>
              </AnimatePresence>
            </motion.div>

            {/* Subheading */}
            <motion.p 
              className="text-gray-600 text-xl md:text-2xl mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Start your journey with personalized care
            </motion.p>

            {/* Category selection pills */}
            <motion.div 
              className="flex flex-wrap gap-3 md:gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  className="w-full sm:w-auto px-6 py-3 rounded-full text-white font-medium text-lg md:text-xl transition-all hover:shadow-lg flex items-center justify-center sm:justify-start gap-2"
                  style={{ 
                    background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
                    backgroundSize: "200% auto",
                    animation: "gradient 3s linear infinite",
                    transition: "all 0.3s ease"
                  }}
                  onClick={() => handleCategorySelect(category.id)}
                  whileHover={{ 
                    scale: 1.05,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.3 + (index * 0.1) }
                  }}
                  aria-label={`Select ${category.text}`}
                >
                  <span role="img" aria-hidden="true">{category.icon}</span>
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
              <div className="flex items-center gap-2 mb-4 justify-center">
                <button 
                  onClick={handleReset}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Return to all categories"
                >
                  ← All categories
                </button>
                <span className="text-gray-400" aria-hidden="true">|</span>
                <span 
                  className="px-3 py-1 rounded-full text-white text-sm"
                  style={{ 
                    background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
                    backgroundSize: "200% auto",
                    animation: "gradient 3s linear infinite",
                  }}
                >
                  {categories.find(c => c.id === selectedCategory)?.text}
                </span>
              </div>
              
              {/* Dynamic heading based on selection */}
              <motion.h1 
                className="text-5xl md:text-7xl lg:text-7xl font-normal mb-4"
                style={{ color: "#e63946" }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {categoryContent[selectedCategory].heading}
              </motion.h1>
              
              {/* Dynamic subheading */}
              <motion.p 
                className="text-gray-600 text-xl md:text-2xl mb-12"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {categoryContent[selectedCategory].subheading}
              </motion.p>
              
              {/* Call to action */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.button 
                  className="px-8 py-4 rounded-full text-white font-medium text-lg transition-all hover:shadow-lg"
                  style={{ 
                    background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
                    backgroundSize: "200% auto",
                    animation: "gradient 3s linear infinite",
                  }}
                  onClick={() => window.location.href="/appointment"}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Your Journey Today
                </motion.button>
                <motion.button 
                  className="px-8 py-4 rounded-full bg-white text-gray-700 border border-gray-200 font-medium text-lg transition-all hover:shadow-lg"
                  onClick={handleStartQuiz}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Take Assessment Survey
                </motion.button>
              </motion.div>
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
              <motion.h2 
                className="text-3xl font-normal mb-4"
                style={{ color: "#e63946" }}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Let's personalize your {selectedCategory && categories.find(c => c.id === selectedCategory)?.text.toLowerCase()} plan
              </motion.h2>
              <motion.p 
                className="text-gray-600"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Answer a few questions so we can tailor our recommendations
              </motion.p>
            </div>
            
            {/* Quiz would continue here - this is just the starting point */}
            <motion.div 
              className="space-y-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-left">
                <label className="block text-gray-700 mb-2" htmlFor="concerns">How would you describe your current concerns?</label>
                <select 
                  id="concerns"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  aria-label="Current concerns"
                >
                  <option>Select an option</option>
                  <option>Just starting my journey</option>
                  <option>Tried other solutions without success</option>
                  <option>Looking to maintain my progress</option>
                </select>
              </div>
              
              <div className="text-left">
                <label className="block text-gray-700 mb-2" htmlFor="priority">What's your top priority right now?</label>
                <select 
                  id="priority"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  aria-label="Top priority"
                >
                  <option>Select an option</option>
                  <option>Quick results</option>
                  <option>Sustainable long-term approach</option>
                  <option>Addressing specific health concerns</option>
                </select>
              </div>
            </motion.div>
            
            <div className="flex justify-between">
              <motion.button 
                className="px-6 py-3 rounded-full bg-white text-gray-700 border border-gray-200 font-medium transition-all hover:shadow-md"
                onClick={() => setStage("selected")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              <motion.button 
                className="px-6 py-3 rounded-full text-white font-medium transition-all hover:shadow-md"
                style={{ backgroundColor: "#e63946" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}