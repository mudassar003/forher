//scr/comp/GlobalFooter.tsx
"use client";

import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin } from "react-icons/fi";

const GlobalFooter = () => {
  return (
    <footer className="bg-gray-100 text-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
          {/* Brand Column */}
          <div className="col-span-1">
            <div className="text-3xl font-semibold mb-4">
              <span className="text-black">Lily&apos;s</span>
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
          </div>

          {/* Quick Links Column */}
          <div className="col-span-1">
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
          <div className="col-span-1">
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

          {/* Newsletter Column */}
          <div className="col-span-1">
            <h3 className="text-lg font-medium mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-600 mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-3 py-2 bg-white border border-gray-300 rounded text-sm w-full focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded text-sm whitespace-nowrap hover:bg-gray-800 transition-colors duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-gray-300 pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Lily&apos;s. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;