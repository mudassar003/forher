"use client";

import { useEffect, useState, JSX } from "react";
import { FaLeaf, FaHeart, FaSpa, FaComments, FaShieldAlt, FaBox, FaStar, FaSeedling } from "react-icons/fa";

type TickerItem = {
  id: number;
  icon: JSX.Element;
  text: string;
};

const tickerItems: TickerItem[] = [
  { id: 1, icon: <FaSpa />, text: "Quality products with no hidden fees" },
  { id: 2, icon: <FaLeaf />, text: "100% online convenience" },
  { id: 3, icon: <FaStar />, text: "Personalized to your needs" },
  { id: 4, icon: <FaHeart />, text: "Ongoing customer support" },
  { id: 5, icon: <FaSeedling />, text: "All-natural ingredients" },
  { id: 6, icon: <FaComments />, text: "24/7 expert consultation" },
  { id: 7, icon: <FaShieldAlt />, text: "Highest safety standards" },
  { id: 8, icon: <FaBox />, text: "Free & discreet shipping on all orders" },
];

// Lily's brand colors
const primaryColor = "#e63946"; // Brand red
const accentColor = "#ff4d6d"; // Coral pink
const darkAccentColor = "#8f2d56"; // Deep raspberry
const lightBgColor = "rgba(230, 57, 70, 0.05)"; // Very light red background
const textColor = "#333333"; // Dark text for readability

export default function Ticker() {
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Animation speeds
  const desktopSpeed = 30;
  const mobileSpeed = 15;

  // Check if device is mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Run on initial render
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Ticker component that works for both mobile and desktop
  const TickerComponent = () => (
    <div
      className="relative w-full overflow-hidden py-3 flex items-center animate-fade-in rounded-lg shadow-sm"
      style={{ 
        backgroundColor: lightBgColor,
        boxShadow: "0 2px 8px rgba(230, 57, 70, 0.1)"
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div 
        className="relative z-10 px-3 md:px-4 whitespace-nowrap font-medium flex items-center"
        style={{ backgroundColor: lightBgColor, color: darkAccentColor }}
      >
                  <span className="text-xs md:text-base font-semibold">Why Lily's?</span>
        <span className="ml-1 md:ml-2 text-xs md:text-base" style={{ color: accentColor }}>|</span>
      </div>
      <div className="w-full overflow-hidden relative">
        <div
          className="flex space-x-12 md:space-x-32"
          style={{
            animation: `slide ${isMobile ? mobileSpeed : desktopSpeed}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
            whiteSpace: 'nowrap',
          }}
        >
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
            <div key={index} className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm font-normal transition-all duration-300 hover:scale-105">
              <span className="text-sm md:text-lg" style={{ color: accentColor }}>{item.icon}</span>
              <span style={{ color: textColor }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Gradient fade effect on both sides */}
      <div className="absolute right-0 top-0 h-full w-8 md:w-16 z-10" 
           style={{ background: `linear-gradient(to left, ${lightBgColor}, transparent)` }}></div>
      <div className="absolute left-0 top-0 h-full w-3 z-0" 
           style={{ background: `linear-gradient(to right, ${lightBgColor}, transparent)` }}></div>
    </div>
  );

  return (
    <div className="max-w-screen-2xl mx-auto px-2 md:px-4">
      <TickerComponent />

      <style jsx global>{`
        @keyframes slide {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-33.33%);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}