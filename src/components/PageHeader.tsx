// src/components/PageHeader.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * A simplified, professional page header component
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  className = "",
}) => {
  return (
    <div className={`relative bg-white py-8 sm:py-10 ${className}`}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1 
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              className="mt-3 max-w-2xl mx-auto text-lg text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;