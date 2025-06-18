// src/components/legal/LegalPageLayout.tsx
import React, { ReactNode } from 'react';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
  subtitle?: string;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  lastUpdated,
  children,
  subtitle
}) => {
  return (
    <main className="bg-white">
      {/* Enhanced header section with brand styling */}
      <div className="bg-gradient-to-r from-[#e63946] to-[#ff4d6d] py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              {title}
            </h1>
          </div>
        </div>
        
        {/* Wave overlay at bottom of header */}
        <div className="absolute left-0 right-0 bottom-0 overflow-hidden leading-0">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 320" 
            className="w-full block"
            preserveAspectRatio="none"
            style={{ height: '70px', width: '100%' }}
          >
            <path 
              fill="#ffffff" 
              fillOpacity="1" 
              d="M0,96L60,112C120,128,240,160,360,165.3C480,171,600,149,720,128C840,107,960,85,1080,90.7C1200,96,1320,128,1380,144L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose max-w-none text-gray-700">
          <p className="text-lg mb-6">
            Last Updated: {lastUpdated}
          </p>
          
          {children}
        </div>
      </div>
    </main>
  );
};

export default LegalPageLayout;