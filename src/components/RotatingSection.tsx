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
          className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/images/Picture2.jpg')"
          }}
        />

        {/* Headings */}
        <div className="absolute top-[15%] text-center px-4 md:px-0 z-10">
          <h1 className="text-xl md:text-4xl font-semibold leading-tight text-white">
            Lose weight with a
          </h1>
          <h2 className="text-xl md:text-4xl font-semibold leading-tight text-white">
            personalized plan
          </h2>
          
          {/* Rotating Text - Moved below headings */}
          <div className="mt-4 flex items-center justify-center text-[10px] md:text-sm font-normal text-white z-10">
            <span 
              className="mr-2 flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full text-xs md:text-base font-bold"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.3)", color: "white" }}
            >
              ✔
            </span>
            <p className="transition-opacity duration-500">{rotatingTexts[index]}</p>
          </div>
        </div>
        
        {/* Buttons - Increased visibility with stronger colors and moved higher */}
        <div className="absolute bottom-[20%] flex gap-4 w-full max-w-xs md:max-w-md z-10">
          <button 
            className="w-1/2 py-3 text-gray-800 rounded-full font-semibold shadow-lg transition hover:opacity-90 text-sm md:text-base bg-white"
          >
            Get started
          </button>
          <button 
            className="w-1/2 py-3 rounded-full font-semibold shadow-lg transition hover:bg-opacity-90 text-sm md:text-base text-white border-2 border-white"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
          >
            See if I&apos;m eligible
          </button>
        </div>
      </section>

      {/* BMI Calculator - Moved completely outside the section with the background */}
      <div className="w-full max-w-xs md:max-w-md mx-auto mt-4 z-10">
        <BMICalculator />
      </div>
    </>
  );
}