"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const headlines = [
  { text: "Weight loss", color: "#68724C" }, // Greenish
  { text: "Wellness", color: "#7F5D76" }, // Purple
  { text: "Thicker hair", color: "#4E7F6B" }, // Teal
  { text: "Anxiety relief", color: "#3D5B74" }, // Blue
  { text: "Glowing skin", color: "#5F9C92" }, // Soft Teal
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
      <div className="relative h-auto overflow-hidden w-full mb-2">
        <AnimatePresence mode="wait">
          <motion.h1
            key={headlines[index].text}
            className="text-8xl font-normal leading-tight"
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
      <h2 className="text-black text-8xl mt-2">
        personalized to you
      </h2>

      {/* Subtext */}
      <p className="text-gray-600 text-2xl mt-8">
        Customized care starts here
      </p>
    </section>
  );
}
