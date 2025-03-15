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
    <section
      className="relative w-full h-[85vh] flex flex-col items-center justify-between rounded-t-2xl overflow-hidden"
      style={{ 
        background: "linear-gradient(135deg, #ffe6f0 0%, #fff5f9 50%, #ffedf4 100%)",
      }}
    >
      {/* Subtle brand pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{
          backgroundImage: "radial-gradient(#fe92b5 1px, transparent 1px), radial-gradient(#fc4e87 1px, transparent 1px)",
          backgroundSize: "20px 20px, 30px 30px",
          backgroundPosition: "0 0, 10px 10px"
        }}
      />

      {/* Headings */}
      <div className="absolute top-[5%] text-center px-4 md:px-0 z-10">
        <h1 className="text-xl md:text-4xl font-semibold leading-tight text-gray-800">
          Lose weight with a
        </h1>
        <h2 className="text-xl md:text-4xl font-semibold leading-tight" style={{ color: "#fc4e87" }}>
          personalized plan
        </h2>
      </div>

      {/* Rotating Text */}
      <div className="absolute top-[20%] flex items-center text-[10px] md:text-sm font-normal text-gray-700 z-10">
        <span 
          className="mr-2 flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full text-xs md:text-base font-bold"
          style={{ backgroundColor: "#fe92b5", color: "white" }}
        >
          ✔
        </span>
        <p className="transition-opacity duration-500">{rotatingTexts[index]}</p>
      </div>
      
      {/* BMI Calculator */}
      <div className="absolute top-1/2 transform -translate-y-1/2 w-full max-w-xs md:max-w-md z-10">
        <BMICalculator />
      </div>

      {/* Buttons */}
      <div className="absolute bottom-[5%] flex gap-4 w-full max-w-xs md:max-w-md z-10">
        <button 
          className="w-1/2 py-3 text-white rounded-full font-semibold shadow-md transition hover:opacity-90 text-xs md:text-sm"
          style={{ backgroundColor: "#fc4e87" }}
        >
          Get started
        </button>
        <button 
          className="w-1/2 py-3 rounded-full font-semibold shadow-md transition hover:bg-opacity-90 text-xs md:text-sm text-gray-700 border border-gray-300"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
        >
          See if I&apos;m eligible
        </button>
      </div>

      {/* Decorative elements */}
      <div 
        className="absolute bottom-[-5%] right-[-5%] w-[200px] h-[200px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #fe92b5 0%, rgba(255,255,255,0) 70%)" }}
      />
      <div 
        className="absolute top-[10%] left-[-10%] w-[250px] h-[250px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #f96897 0%, rgba(255,255,255,0) 70%)" }}
      />
    </section>
  );
}