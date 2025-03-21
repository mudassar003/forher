//src/components/GlobalFooter.tsx
"use client";

import { useState } from "react";
import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin } from "react-icons/fi";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const GlobalFooter = () => {
  // State for mobile accordion functionality
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  return (
    <footer className="bg-gray-100 text-gray-800 pt-8 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 md:gap-8 pb-8">
          {/* Brand Column */}
          <div className="col-span-1">
            <div className="text-2xl md:text-3xl font-semibold mb-3 md:mb-4">
              <span className="text-black">Lily's</span>
            </div>
            <p className="text-sm text-gray-600 mb-4 max-w-xs">
              Empowering you to look and feel your best every day.
            </p>
            {/* Social Media Icons */}
            <div className="flex space-x-5 mt-4">
              <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-black transition-colors duration-200">
                <FiFacebook className="text-xl" />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-black transition-colors duration-200">
                <FiInstagram className="text-xl" />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-black transition-colors duration-200">
                <FiTwitter className="text-xl" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-500 hover:text-black transition-colors duration-200">
                <FiLinkedin className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links Column - Mobile Accordion, Desktop Regular */}
          <div className="col-span-1 border-b md:border-b-0 border-gray-200 pb-3 md:pb-0">
            <button 
              className="flex w-full justify-between items-center text-left md:hidden py-2"
              onClick={() => toggleSection('quickLinks')}
              aria-expanded={openSection === 'quickLinks'}
            >
              <h3 className="text-lg font-medium">Quick Links</h3>
              {openSection === 'quickLinks' ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            <h3 className="hidden md:block text-lg font-medium mb-4">Quick Links</h3>
            <ul 
              className={`space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${
                openSection === 'quickLinks' || window.innerWidth >= 768 ? 'max-h-48 py-2' : 'max-h-0 md:max-h-48 md:py-0'
              }`}
            >
              <li>
                <a href="/about" className="text-sm text-gray-600 hover:text-black transition-colors duration-200 block py-1">
                  About Us
                </a>
              </li>
              <li>
                <a href="/c/wm" className="text-sm text-gray-600 hover:text-black transition-colors duration-200 block py-1">
                  Weight Loss
                </a>
              </li>
              <li>
                <a href="/c/hl" className="text-sm text-gray-600 hover:text-black transition-colors duration-200 block py-1">
                  Hair Loss
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-gray-600 hover:text-black transition-colors duration-200 block py-1">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column - Mobile Accordion, Desktop Regular */}
          <div className="col-span-1 border-b md:border-b-0 border-gray-200 pb-3 md:pb-0">
            <button 
              className="flex w-full justify-between items-center text-left md:hidden py-2"
              onClick={() => toggleSection('legal')}
              aria-expanded={openSection === 'legal'}
            >
              <h3 className="text-lg font-medium">Legal</h3>
              {openSection === 'legal' ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            <h3 className="hidden md:block text-lg font-medium mb-4">Legal</h3>
            <ul 
              className={`space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${
                openSection === 'legal' || window.innerWidth >= 768 ? 'max-h-48 py-2' : 'max-h-0 md:max-h-48 md:py-0'
              }`}
            >
              <li>
                <a href="/privacy-policy" className="text-sm text-gray-600 hover:text-black transition-colors duration-200 block py-1">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="text-sm text-gray-600 hover:text-black transition-colors duration-200 block py-1">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/cookie-policy" className="text-sm text-gray-600 hover:text-black transition-colors duration-200 block py-1">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="/ccpa-notice" className="text-sm text-gray-600 hover:text-black transition-colors duration-200 block py-1">
                  CCPA Notice
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-gray-200 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center">
          <p className="text-sm text-gray-500 text-center">
            © 2025 Lily's. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;