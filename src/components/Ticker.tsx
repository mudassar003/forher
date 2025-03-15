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

export default function Ticker() {
  const [isPaused, setIsPaused] = useState(false);
  const desktopSpeed = 25;
  const mobileSpeed = 10; // Even faster speed for mobile
  const [animationDuration, setAnimationDuration] = useState(desktopSpeed);

  useEffect(() => {
    const updateDuration = () => {
      const screenWidth = window.innerWidth;
      // Force update the animation duration based on screen width
      if (screenWidth < 768) {
        setAnimationDuration(mobileSpeed);
      } else {
        setAnimationDuration(desktopSpeed);
      }
    };
    
    // Run on initial render
    updateDuration();
    
    // Add event listener for window resize
    window.addEventListener("resize", updateDuration);
    
    // Cleanup
    return () => window.removeEventListener("resize", updateDuration);
  }, [mobileSpeed, desktopSpeed]);

  // Brand colors
  const primaryColor = "#fe92b5";
  const accentColor = "#f96897";
  const darkAccentColor = "#fc4e87";
  const lightBgColor = "#fff8fa"; // Light pink background that complements brand colors

  return (
    <div
      className="relative w-full overflow-hidden py-2 flex items-center opacity-0 animate-fade-in"
      style={{ backgroundColor: lightBgColor }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div 
        className="relative z-10 px-4 whitespace-nowrap font-medium text-base md:text-base flex items-center"
        style={{ backgroundColor: lightBgColor, color: darkAccentColor }}
      >
        <span className="text-xs md:text-base">Why Direct2Her?</span>
        <span className="ml-2 text-xs md:text-base" style={{ color: accentColor }}>|</span>
      </div>
      <div className="w-full overflow-hidden relative">
        <div
          className="flex space-x-36 ticker-animation"
          style={{
            animation: `slide ${animationDuration}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
            whiteSpace: 'nowrap',
          }}
        >
          {/* Triple the items to ensure smooth looping */}
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs md:text-sm font-normal">
              <span className="text-base md:text-lg" style={{ color: accentColor }}>{item.icon}</span>
              <span style={{ color: "#333" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide {
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

        @media (max-width: 767px) {
          .ticker-animation {
            animation-duration: ${mobileSpeed}s !important;
          }
        }

        @media (min-width: 768px) {
          .ticker-animation {
            animation-duration: ${desktopSpeed}s !important;
          }
        }
      `}</style>
    </div>
  );
}