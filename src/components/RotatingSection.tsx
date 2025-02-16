"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
      className="relative w-full h-[85vh] flex flex-col items-center justify-between bg-cover bg-center text-white rounded-t-2xl overflow-hidden"
      style={{ backgroundImage: "url('/images/background_sc1.png')" }}
    >
      {/* Headings */}
      <div className="absolute top-[5%] text-center px-4 md:px-0">
        <h1 className="text-xl md:text-4xl font-semibold leading-tight">
          Lose weight with a
        </h1>
        <h2 className="text-xl md:text-4xl font-semibold leading-tight">
          personalized plan
        </h2>
      </div>

      {/* Rotating Text */}
      <div className="absolute top-[20%] flex items-center text-[10px] md:text-sm font-normal">
        <span className="mr-2 flex items-center justify-center w-4 h-4 md:w-5 md:h-5 bg-white rounded-full text-green-600 text-xs md:text-base font-bold">
          ✔
        </span>
        <p className="transition-opacity duration-500">{rotatingTexts[index]}</p>
      </div>

      {/* Buttons */}
      <div className="absolute bottom-[5%] flex gap-4 w-full max-w-xs md:max-w-md">
        <button className="w-1/2 py-3 text-black bg-white rounded-full font-semibold shadow-md transition hover:bg-gray-200 text-xs md:text-sm">
          Get started
        </button>
        <button className="w-1/2 py-3 bg-gray-400 text-white rounded-full font-semibold shadow-md transition text-xs md:text-sm">
          See if I'm eligible
        </button>
      </div>
    </section>
  );
}
