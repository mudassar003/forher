"use client";

import { useEffect, useState, JSX } from "react";
import { FaMobileAlt, FaStar, FaHeart, FaCog, FaComments, FaShieldAlt, FaBox } from "react-icons/fa";

type TickerItem = {
  id: number;
  icon: JSX.Element;
  text: string;
};

const tickerItems: TickerItem[] = [
  { id: 1, icon: <FaCog />, text: "Affordable pricing with no hidden fees" },
  { id: 2, icon: <FaMobileAlt />, text: "100% online" },
  { id: 3, icon: <FaStar />, text: "Personalized to your needs" },
  { id: 4, icon: <FaHeart />, text: "Ongoing support" },
  { id: 5, icon: <FaCog />, text: "US-Sourced ingredients" },
  { id: 6, icon: <FaComments />, text: "Unlimited provider messaging" },
  { id: 7, icon: <FaShieldAlt />, text: "FDA-regulated pharmacies" },
  { id: 8, icon: <FaBox />, text: "Free & discreet shipping on all prescriptions" },
  { id: 9, icon: <FaCog />, text: "Affordable pricing with no hidden fees" },
  { id: 10, icon: <FaStar />, text: "Personalized to your needs" },
];

// Brand colors
const primaryColor = "#fe92b5";
const accentColor = "#f96897";
const darkAccentColor = "#fc4e87";
const lightBgColor = "#fff8fa";

export default function Ticker() {
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Different speeds for different devices
  const desktopSpeed = 25;
  const mobileSpeed = 10;

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

  // Mobile specific ticker
  const MobileTicker = () => (
    <div
      className="relative w-full overflow-hidden py-2 flex items-center animate-fade-in"
      style={{ backgroundColor: lightBgColor }}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div 
        className="relative z-10 px-3 whitespace-nowrap font-medium flex items-center"
        style={{ backgroundColor: lightBgColor, color: darkAccentColor }}
      >
        <span className="text-xs">Why Direct2Her?</span>
        <span className="ml-1 text-xs" style={{ color: accentColor }}>|</span>
      </div>
      <div className="w-full overflow-hidden relative">
        <div
          className="flex space-x-16"
          style={{
            animation: `slideMobile ${mobileSpeed}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
            whiteSpace: 'nowrap',
          }}
        >
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
            <div key={index} className="flex items-center space-x-1 text-xs font-normal">
              <span className="text-sm" style={{ color: accentColor }}>{item.icon}</span>
              <span style={{ color: "#333" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Desktop specific ticker
  const DesktopTicker = () => (
    <div
      className="relative w-full overflow-hidden py-2 flex items-center animate-fade-in"
      style={{ backgroundColor: lightBgColor }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className="relative z-10 px-4 whitespace-nowrap font-medium flex items-center"
        style={{ backgroundColor: lightBgColor, color: darkAccentColor }}
      >
        <span className="text-base">Why Direct2Her?</span>
        <span className="ml-2 text-base" style={{ color: accentColor }}>|</span>
      </div>
      <div className="w-full overflow-hidden relative">
        <div
          className="flex space-x-36"
          style={{
            animation: `slideDesktop ${desktopSpeed}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
            whiteSpace: 'nowrap',
          }}
        >
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm font-normal">
              <span className="text-lg" style={{ color: accentColor }}>{item.icon}</span>
              <span style={{ color: "#333" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Render either mobile or desktop ticker based on screen width */}
      <div className="hidden md:block">
        <DesktopTicker />
      </div>
      <div className="block md:hidden">
        <MobileTicker />
      </div>

      <style jsx global>{`
        @keyframes slideDesktop {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }
        
        @keyframes slideMobile {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
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
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
}