// src/components/RotatingSection.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import useTranslations from "@/hooks/useTranslations";

// Strict TypeScript interfaces
interface AnimatedWord {
  text: string;
  color: string;
  translationKey: string;
}

interface BenefitItem {
  titleKey: string;
  descriptionKey: string;
  iconColor: string;
  bgColor: string;
  icon: React.ReactElement;
}

interface RotatingSection2Props {
  className?: string;
}

const RedesignedWeightLossSection: React.FC<RotatingSection2Props> = ({ className = "" }) => {
  const { t } = useTranslations();
  
  // State for animated words
  const [wordIndex, setWordIndex] = useState<number>(0);
  
  // State for mobile view
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Detect mobile view on mount and resize
  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Initial check
    checkMobile();
    
    // Check on resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const animatedWords: AnimatedWord[] = [
    { text: "", color: "#10b981", translationKey: "healthier" }, // Green for health
    { text: "", color: "#e63946", translationKey: "happier" },   // Brand red for emotion
    { text: "", color: "#3b82f6", translationKey: "stronger" },  // Blue for strength
    { text: "", color: "#8b5cf6", translationKey: "confident" }, // Purple for confidence
  ];
  
  // Populate text from translations
  const translatedWords = animatedWords.map(word => ({
    ...word,
    text: t(`rotatingSection.animatedWords.${word.translationKey}`)
  }));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prevIndex) => (prevIndex + 1) % translatedWords.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [translatedWords.length]);

  // Benefits data with translation keys
  const benefits: BenefitItem[] = [
    {
      titleKey: "fsaHsa.title",
      descriptionKey: "fsaHsa.description",
      iconColor: "#0284c7",
      bgColor: "#e6f5ff",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      titleKey: "noInsurance.title",
      descriptionKey: "noInsurance.description",
      iconColor: "#10b981",
      bgColor: "#ecfdf5",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      titleKey: "medicalExpertise.title",
      descriptionKey: "medicalExpertise.description",
      iconColor: "#e63946",
      bgColor: "#fff1f2",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  return (
    <section className={`relative w-full py-16 bg-gradient-to-b from-white to-[#fdfafa] overflow-hidden ${className}`}>
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
            {t('rotatingSection.title')} <span className="text-[#e63946]">{t('rotatingSection.titleHighlight')}</span>
          </motion.h2>
          <motion.p 
            className="text-base text-gray-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('rotatingSection.subtitle')}
          </motion.p>
        </div>
        
        {/* Content Section - Centered */}
        <motion.div 
          className="w-full max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Animated headline with improved typography */}
          <div className="mb-6">
            <h3 className="text-2xl md:text-3xl font-medium mb-3">
              <span className="text-gray-700">{t('rotatingSection.beText')} </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ color: translatedWords[wordIndex]?.color }}
                  className="font-bold relative inline-block"
                >
                  {translatedWords[wordIndex]?.text}
                  <span 
                    className="absolute bottom-0 left-0 w-full h-1 rounded opacity-40" 
                    style={{ backgroundColor: translatedWords[wordIndex]?.color }}
                  ></span>
                </motion.span>
              </AnimatePresence>
              <span className="text-gray-700"> {t('rotatingSection.todayText')}</span>
            </h3>
            <p className="text-gray-600 mt-3 mx-auto max-w-2xl">
              {t('rotatingSection.description')}
            </p>
          </div>
          
          {/* Benefits Cards - Centered Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div 
                key={benefit.titleKey}
                className="flex items-start gap-3 p-4 rounded-lg bg-white border border-gray-100 shadow-sm"
                whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.05)" }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div 
                  className="flex items-center justify-center min-w-8 h-8 rounded-full"
                  style={{ 
                    backgroundColor: benefit.bgColor, 
                    color: benefit.iconColor 
                  }}
                >
                  {benefit.icon}
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-800">
                    {t(`rotatingSection.benefits.${benefit.titleKey}`)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t(`rotatingSection.benefits.${benefit.descriptionKey}`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RedesignedWeightLossSection;