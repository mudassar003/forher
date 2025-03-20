"use client";

import { useEffect, useState } from "react";
import BMICalculator from "./BMICalculator";

const rotatingTexts = [
  "Save 30% on avg. with FSA & HSA",
  "No insurance required",
  "Expert medical guidance available",
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % rotatingTexts.length);
    }, 5000); // Change text every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section
        className="relative w-full h-[85vh] flex flex-col items-center justify-between rounded-t-2xl overflow-hidden"
        style={{ 
          background: "#596e4c", // Green background from screenshot
        }}
      >
        {/* Background image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center z-0 opacity-90"
          style={{
            backgroundImage: "url('/images/Picture2.jpg')"
          }}
        />

        {/* Content overlay with slight dark gradient to improve text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-0"></div>

        {/* Headings */}
        <div className="absolute top-[15%] text-center px-4 md:px-0 z-10 max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-5xl font-semibold leading-tight text-white mb-2">
            Lose weight with a
          </h1>
          <h2 className="text-2xl md:text-5xl font-semibold leading-tight text-white mb-6">
            personalized plan
          </h2>
          
          {/* Rotating Text */}
          <div className="mt-4 flex items-center justify-center text-sm md:text-base font-normal text-white z-10">
            <span 
              className="mr-2 flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full text-xs md:text-base font-bold"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.3)", color: "white" }}
            >
              ✓
            </span>
            <p className="transition-opacity duration-500">{rotatingTexts[index]}</p>
          </div>
        </div>
        
        {/* Buttons - Positioned in the middle of the section */}
        <div className="absolute bottom-[25%] flex gap-4 w-full max-w-xs md:max-w-md z-10">
          <button 
            className="w-1/2 py-3 text-gray-800 rounded-full font-semibold shadow-lg transition hover:opacity-90 text-sm md:text-base bg-white"
            onClick={() => window.location.href="/products"}
          >
            See Products
          </button>
          <button 
            className="w-1/2 py-3 rounded-full font-semibold shadow-lg transition hover:bg-opacity-90 text-sm md:text-base text-white border-2 border-white"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
            onClick={() => window.location.href="/consultation"}
          >
            Book Consultation
          </button>
        </div>
      </section>

      {/* Motivational Text and BMI Calculator Section */}
      <div className="w-full bg-white pt-10 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            Here you will start the journey to take back your life and your joy. 
            Not happy with your calculation? No worries! 
            Get Started below and book a consultation! Freedom is right around the corner!
          </p>
        </div>
        
        {/* BMI Calculator */}
        <div className="w-full max-w-md mx-auto">
          <BMICalculator />
        </div>
      </div>
    </>
  );
}