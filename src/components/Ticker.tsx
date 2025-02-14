"use client";

import { useEffect, useState, JSX } from "react";
import { motion, useAnimation } from "framer-motion";
import { FaMobileAlt, FaStar, FaHeart, FaCog, FaComments, FaShieldAlt, FaBox } from "react-icons/fa";

// Define the structure of a ticker item
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
  const controls = useAnimation();
  const [isPaused, setIsPaused] = useState(false);
  const desktopSpeed = 25;
  const mobileSpeed = 30;
  const [animationDuration, setAnimationDuration] = useState(desktopSpeed);

  useEffect(() => {
    // Dynamically adjust speed based on screen width
    const updateDuration = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        setAnimationDuration(mobileSpeed); // Use mobile speed
      } else {
        setAnimationDuration(desktopSpeed); // Use desktop speed
      }
    };
    
    updateDuration();
    window.addEventListener("resize", updateDuration);
    return () => window.removeEventListener("resize", updateDuration);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      controls.start({
        x: ["100%", "-100%"],
        transition: { repeat: Infinity, duration: animationDuration, ease: "linear" },
      });
    }
  }, [isPaused, controls, animationDuration]);

  return (
    <div
      className="relative w-full overflow-hidden bg-[#EBF3ED] py-2 flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative z-10 bg-[#EBF3ED] px-4 font-semibold whitespace-nowrap text-black">Why Direct2Her?</div>
      <div className="w-full overflow-hidden relative">
        <motion.div
          className="flex space-x-8"
          animate={controls}
          initial={{ x: "100%" }}
          style={{ whiteSpace: "nowrap" }}
        >
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-black text-sm font-medium">
              <span className="text-lg">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
