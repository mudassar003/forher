// src/components/PageHeader.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundGradient?: string;
  textColor?: string;
  waveColor?: string;
  className?: string;
}

/**
 * A reusable page header component with animated wave effect
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backgroundGradient = "bg-gradient-to-r from-[#e63946] to-[#ff4d6d]",
  textColor = "text-white",
  waveColor = "fill-white",
  className = "",
}) => {
  return (
    <div className={`relative bg-gradient-to-r from-[#e63946] to-[#ff4d6d] py-16 sm:py-24 overflow-hidden ${className}`}>
      {/* Decorative elements for the header */}
      <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>
      <div className="absolute bottom-0 right-1/3 w-40 h-40 rounded-full bg-white opacity-5 blur-xl"></div>
      
      {/* Wave pattern background */}
      <div className="absolute inset-0 opacity-20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,208C672,213,768,171,864,149.3C960,128,1056,128,1152,144C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <motion.h1 
            className={`text-4xl font-extrabold tracking-tight ${textColor} sm:text-5xl md:text-6xl`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              className={`mt-6 max-w-2xl mx-auto text-xl ${textColor === 'text-white' ? 'text-pink-100' : 'text-gray-600'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
      
      {/* Wave transition at the bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform translate-y-1">
        <svg 
          className="relative block w-full h-16 sm:h-24" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C15,10.18,36.88,20.62,58.94,31.06,108.88,52.93,163.34,71.36,216,87.57,281.12,107.36,345.66,119.57,411,119.22Z" 
            className={waveColor}
            style={{
              filter: "drop-shadow(0px -2px 3px rgba(230, 57, 70, 0.1))"
            }}
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default PageHeader;