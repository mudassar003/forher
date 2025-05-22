//src/components/GlobalFooter.tsx
"use client";

import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin } from "react-icons/fi";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { useEffect } from "react";

// Define interface for component props (following TypeScript strict typing)
interface GlobalFooterProps {
  className?: string;
}

const GlobalFooter: React.FC<GlobalFooterProps> = ({ className = "" }) => {
  const { t } = useTranslations();
  const currentYear = new Date().getFullYear();
  
  // Load Trustpilot script
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="tp.widget.bootstrap.min.js"]')) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
    script.async = true;
    script.defer = true;
    
    // Add error handling
    script.onerror = () => {
      console.warn('Failed to load Trustpilot widget script');
    };
    
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const existingScript = document.querySelector('script[src*="tp.widget.bootstrap.min.js"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);
  
  return (
    <footer className={`bg-gray-100 text-gray-800 py-8 border-t-2 border-gray-300 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 pb-8 md:grid-cols-2 xl:grid-cols-4">
          {/* Trustpilot Reviews Column - First on mobile */}
          <div className="col-span-1 order-1 md:order-4 xl:order-4">
            <h3 className="text-lg font-medium mb-4">Customer Reviews</h3>
            <p className="text-sm text-gray-600 mb-4">
              See what our customers say about us.
            </p>
            {/* Trustpilot Widget - Review Collector */}
            <div 
              className="trustpilot-widget" 
              data-locale="en-US" 
              data-template-id="56278e9abfbbba0bdcd568bc" 
              data-businessunit-id="682f5d1ffe7a18bd7cb35e31" 
              data-style-height="52px" 
              data-style-width="100%"
            >
              <a 
                href="https://www.trustpilot.com/review/lilyswomenshealth.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-black transition-colors duration-200"
              >
                View our Trustpilot reviews
              </a>
            </div>
          </div>

          {/* Brand Column */}
          <div className="col-span-1 order-2 md:order-1 xl:order-1">
            <div className="mb-4">
              <Link href="/" className="flex items-center">
                <img src="/Logo.png" alt="Lily's Logo" className="h-10" />
              </Link>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Empowering you to look and feel your best every day.
            </p>
            {/* Social Media Icons */}
            <div className="flex space-x-4 mt-4">
              <a href="#" aria-label="Facebook" className="hover:text-black transition-colors duration-200">
                <FiFacebook className="text-xl" />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-black transition-colors duration-200">
                <FiInstagram className="text-xl" />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-black transition-colors duration-200">
                <FiTwitter className="text-xl" />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-black transition-colors duration-200">
                <FiLinkedin className="text-xl" />
              </a>
            </div>
            
            {/* LegitScript Certification */}
            <div className="mt-6">
              <a 
                href="https://www.legitscript.com/websites/?checker_keywords=lilyswomenshealth.com" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Verify LegitScript Approval for www.lilyswomenshealth.com"
                className="inline-block"
              >
                <img 
                  src="https://static.legitscript.com/seals/44171411.png" 
                  alt="LegitScript Approved" 
                  width="73" 
                  height="79"
                  className="max-w-full h-auto"
                />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="col-span-1 order-3 md:order-2 xl:order-2">
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
                  About Us
                </a>
              </li>
              <li>
                <a href="/c/wm" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
                  Weight Loss
                </a>
              </li>
              <li>
                <a href="/c/hl" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
                  Hair Loss
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="col-span-1 order-4 md:order-3 xl:order-3">
            <h3 className="text-lg font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy-policy" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/cookie-policy" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="/ccpa-notice" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
                  CCPA Notice
                </a>
              </li>
            </ul>
          </div>
        </div>


      </div>

      {/* FDA Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div className="bg-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>FDA Disclaimer:</strong> Some of our products are not FDA approved.
          </p>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-gray-300 pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {currentYear} Lily&apos;s. All rights reserved.
          </p>
          
          {/* Additional Certifications could go here */}
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;