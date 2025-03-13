//scr/comp/GlobalFooter.tsx
"use client";

import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin } from "react-icons/fi";

const GlobalFooter = () => {
  return (
    <footer className="bg-gray-100 text-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        
        {/* Logo */}
        <div className="text-3xl font-semibold">
          <span className="text-black">hers</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex space-x-6">
          <a href="#" className="text-md font-normal hover:text-black">
            About Us
          </a>
          <a href="#" className="text-md font-normal hover:text-black">
            Careers
          </a>
          <a href="#" className="text-md font-normal hover:text-black">
            Contact
          </a>
          <a href="#" className="text-md font-normal hover:text-black">
            Privacy Policy
          </a>
          <a href="#" className="text-md font-normal hover:text-black">
            Terms of Service
          </a>
        </nav>

        {/* Social Media Icons */}
        <div className="flex space-x-4">
          <a href="#" aria-label="Facebook" className="hover:text-black">
            <FiFacebook className="text-2xl" />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-black">
            <FiInstagram className="text-2xl" />
          </a>
          <a href="#" aria-label="Twitter" className="hover:text-black">
            <FiTwitter className="text-2xl" />
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-black">
            <FiLinkedin className="text-2xl" />
          </a>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-gray-300 mt-8 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} hers. All rights reserved.
      </div>
    </footer>
  );
};

export default GlobalFooter;
