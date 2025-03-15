"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Updated headlines with your brand colors
const headlines = [
  { text: "Weight loss", color: "#fe92b5" }, // Primary brand color
  { text: "Wellness", color: "#f96897" },    // Darker accent
  { text: "Thicker hair", color: "#fc4e87" }, // Another darker accent
  { text: "Anxiety relief", color: "#fe92b5" }, // Primary brand color
  { text: "Glowing skin", color: "#f96897" },  // Darker accent
];

export default function RotatingHeadlineSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % headlines.length);
    }, 2500); // Change text every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="flex flex-col items-start justify-center min-h-[60vh] px-6 md:px-12 lg:px-24 mt-[-40px]">
      {/* Rotating Heading */}
      <div className="relative h-auto overflow-visible w-full mb-2">
        <AnimatePresence mode="wait">
          <motion.h1
            key={headlines[index].text}
            className="text-5xl md:text-7xl lg:text-8xl leading-light font-normal"
            style={{ color: headlines[index].color, whiteSpace: 'nowrap' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {headlines[index].text}
          </motion.h1>
        </AnimatePresence>
      </div>
      
      {/* Main Supporting Text */}
      <h2 className="w-full text-left text-4xl mt-[-1px] md:w-auto md:text-6xl lg:text-8xl md:mt-4" 
          style={{ color: "#fc4e87" }}>
        personalized to you
      </h2>

      {/* Subtext */}
      <p className="text-gray-600 text-lg md:text-2xl mt-5">
        Customized care starts here
      </p>
    </section>
  );
}