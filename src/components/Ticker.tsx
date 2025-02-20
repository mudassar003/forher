
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
  const mobileSpeed = 30;
  const [animationDuration, setAnimationDuration] = useState(desktopSpeed);

  useEffect(() => {
    const updateDuration = () => {
      const screenWidth = window.innerWidth;
      setAnimationDuration(screenWidth < 768 ? mobileSpeed : desktopSpeed);
    };
    
    updateDuration();
    window.addEventListener("resize", updateDuration);
    return () => window.removeEventListener("resize", updateDuration);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-[#EBF3ED] py-2 flex items-center opacity-0 animate-fade-in"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative z-10 bg-[#EBF3ED] px-4 whitespace-nowrap text-black">Why Direct2Her?</div>
      <div className="w-full overflow-hidden relative">
        <div
          className="flex space-x-36"
          style={{
            animation: `slide ${animationDuration}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
            whiteSpace: 'nowrap',
          }}
        >
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-black text-sm font-normal">
              <span className="text-lg">{item.icon}</span>
              <span>{item.text}</span>
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
            transform: translateX(-30%);
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
    </div>
  );
}