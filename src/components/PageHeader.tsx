// src/components/PageHeader.tsx
"use client";

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  bgColor?: string;
  className?: string;
}

/**
 * A simplified, professional page header component
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  bgColor,
  className = "",
}) => {
  return (
    <div 
      className={`relative py-8 sm:py-10 ${className}`}
      style={{ backgroundColor: bgColor || 'white' }}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            {title}
          </h1>
          {subtitle && (
            <p 
              className="mt-3 max-w-2xl mx-auto text-lg text-gray-600"
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;