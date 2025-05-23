//src/components/RotatingHeadline.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import useTranslations from "@/hooks/useTranslations";

// Define strict TypeScript types
type CategoryId = "weight-loss" | "hair-care" | "anxiety" | "skin" | "cycle";
type Stage = "initial" | "selected";

interface Category {
  id: CategoryId;
  text: string;
  assessmentUrl: string;
  hidden?: boolean;
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

export default function PersonalizedHeroSection(): React.ReactElement {
  const { t, isRtl } = useTranslations();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [stage, setStage] = useState<Stage>("initial"); // initial, selected
  const [wordIndex, setWordIndex] = useState<number>(0);
  
  // Categories with consistent naming and assessment URLs
  const categories: Category[] = [
    { id: "weight-loss", text: t('rotatingHeadline.categories.weight-loss.text'), assessmentUrl: "/c/wm" },
    { id: "hair-care", text: t('rotatingHeadline.categories.hair-care.text'), assessmentUrl: "/c/hl" },
    { id: "anxiety", text: t('rotatingHeadline.categories.anxiety.text'), assessmentUrl: "/c/mh", hidden: true },
    { id: "skin", text: t('rotatingHeadline.categories.skin.text'), assessmentUrl: "/c/aa", hidden: true },
    { id: "cycle", text: t('rotatingHeadline.categories.cycle.text'), assessmentUrl: "/c/b" },
  ];
  
  const animatedWords: AnimatedWord[] = [
    { text: t('rotatingHeadline.animatedWords.healthier'), color: "#e63946" }, // Brand red
    { text: t('rotatingHeadline.animatedWords.happier'), color: "#d81159" },  // Dark pink
    { text: t('rotatingHeadline.animatedWords.stronger'), color: "#8f2d56" }, // Deep raspberry
    { text: t('rotatingHeadline.animatedWords.better'), color: "#c1121f" },   // Cherry red
    { text: t('rotatingHeadline.animatedWords.transformed'), color: "#ff4d6d" } // Coral pink
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

  // Navigate to assessment URL based on category
  const handleAssessment = (): void => {
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        window.location.href = category.assessmentUrl;
      }
    }
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
    <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 sm:px-6 md:px-12 lg:px-24 py-8 sm:py-12 relative overflow-hidden bg-white">
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
            {/* Initial headline - Improved responsiveness */}
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-normal leading-tight mb-6 sm:mb-10 md:mb-14"
              style={gradientTextStyle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              aria-live="polite"
            >
              {t('rotatingHeadline.noMoreWaiting')}
            </motion.h1>
            
            {/* Animated subheading - Improved responsiveness */}
            <motion.div 
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal mb-6 sm:mb-8 overflow-visible h-20 sm:h-24 md:h-28 lg:h-32"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  className="inline-block text-2xl sm:text-3xl md:text-5xl lg:text-6xl"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{ color: animatedWords[wordIndex].color }}
                >
                  <span className="text-gray-500">{t('rotatingHeadline.be')}</span>{' '}
                  <span className="">
                    {animatedWords[wordIndex].text}
                  </span>{' '}
                  <span className="text-gray-500">{t('rotatingHeadline.today')}</span>
                </motion.span>
              </AnimatePresence>
            </motion.div>

            {/* Subheading - Improved responsiveness */}
            <motion.p 
              className="text-gray-600 text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 md:mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('rotatingHeadline.startJourney')}
            </motion.p>

            {/* Category selection pills */}
            <motion.div 
              className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {categories.filter(category => !category.hidden).map((category, index) => (
                <motion.button
                  key={category.id}
                  className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full text-white font-medium text-base sm:text-lg md:text-xl transition-all hover:shadow-lg flex items-center justify-center sm:justify-start"
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
                  {category.text}
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
                  ← {t('rotatingHeadline.allCategories')}
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
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal mb-4"
                style={{ color: "#e63946" }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {t(`rotatingHeadline.categories.${selectedCategory}.heading`)}
              </motion.h1>
              
              {/* Dynamic subheading */}
              <motion.p 
                className="text-gray-600 text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 md:mb-12"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {t(`rotatingHeadline.categories.${selectedCategory}.subheading`)}
              </motion.p>
              
              {/* Call to action - only assessment button now */}
              <motion.div 
                className="flex justify-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.button 
                  className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white text-gray-700 border border-gray-200 font-medium text-base sm:text-lg transition-all hover:shadow-lg"
                  onClick={handleAssessment}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('rotatingHeadline.takeAssessment')}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
      
      {/* Wave transition at the bottom of the section */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform translate-y-1">
        <svg 
          className="relative block w-full h-16 sm:h-24" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C15,10.18,36.88,20.62,58.94,31.06,108.88,52.93,163.34,71.36,216,87.57,281.12,107.36,345.66,119.57,411,119.22Z" 
            className="fill-white"
            style={{
              filter: "drop-shadow(0px -2px 3px rgba(230, 57, 70, 0.1))"
            }}
          ></path>
        </svg>
      </div>
    </section>
  );
}