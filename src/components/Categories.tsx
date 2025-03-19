"use client";

import { useState } from "react";
import Link from "next/link";

// Common sizing variables
const buttonSizes = {
  mobileWidth: "100px",
  mobileHeight: "90px",
  desktopHeight: "110px"
};

// Updated button data with enhanced gradients and shadows
// Primary: #fe92b5
// Darker accent 1: #f96897
// Darker accent 2: #fc4e87
const buttonData = [
  {
    text: "Weight Loss",
    color: "from-[#ffe6f0] via-[#ffd1e1] to-[#ffbfd4]", // Enhanced gradient
    hoverColor: "from-[#fc4e87] to-[#fe92b5]",
    textColor: "text-[#fc4e87]",
    url: "/c/wm",
  },
  {
    text: "Hair Care",
    color: "from-[#ffe1ec] via-[#ffd6e4] to-[#ffc8d9]", // Enhanced gradient
    hoverColor: "from-[#f96897] to-[#fe92b5]",
    textColor: "text-[#f96897]",
    url: "/c/hl",
  },
  {
    text: "Cycle Management",
    color: "from-[#ffebf3] via-[#ffdbe8] to-[#ffcadd]", // Enhanced gradient
    hoverColor: "from-[#fe92b5] to-[#f96897]",
    textColor: "text-[#f96897]",
    url: "/c/b",
  },
  {
    text: "Anxiety Relief",
    color: "from-[#ffe3ee] via-[#ffd3e2] to-[#ffc1d6]", // Enhanced gradient
    hoverColor: "from-[#fc4e87] to-[#f96897]",
    textColor: "text-[#fc4e87]",
    url: "/c/mh",
  },
  {
    text: "Skin Care",
    color: "from-[#ffe9f2] via-[#ffd9e6] to-[#ffc7db]", // Enhanced gradient
    hoverColor: "from-[#fe92b5] to-[#fc4e87]",
    textColor: "text-[#f96897]",
    url: "/c/aa",
  },
  {
    text: "Finding Balance",
    color: "from-[#ffe4ef] via-[#ffd4e3] to-[#ffc2d7]", // Enhanced gradient
    hoverColor: "from-[#f96897] to-[#fc4e87]",
    textColor: "text-[#f96897]",
    url: "/c/consultation",
  },
];

export default function HoverEffectButtons() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <>
      {/* Mobile: Vertically Stacked Items */}
      <div className="sm:hidden px-4 py-4">
        <div className="grid grid-cols-1 gap-3">
          {buttonData.map((item, index) => (
            <Link key={index} href={item.url}>
              <div
                className={`relative flex items-center justify-between p-3 rounded-2xl transition-all duration-300 bg-gradient-to-r ${
                  hoverIndex === index ? item.hoverColor : item.color
                } ${
                  hoverIndex === index 
                    ? "shadow-[0_10px_40px_-5px_rgb(252,78,135,0.4),0_0_20px_-5px_rgb(252,78,135,0.2)] scale-[1.02]" 
                    : "shadow-[0_4px_15px_rgb(254,146,181,0.15)]"
                }`}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <span
                  className={`text-xl font-semibold text-center mx-auto transition-all duration-300 ${
                    hoverIndex === index ? "text-white" : item.textColor
                  }`}
                >
                  {item.text}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
                      hoverIndex === index 
                        ? "bg-white text-black shadow-[0_4px_15px_rgb(252,78,135,0.4)]" 
                        : "bg-black text-white shadow-[0_2px_8px_rgb(254,146,181,0.2)]"
                    }`}
                  >
                    ➝
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 md:px-8 lg:px-16 mt-12 mb-16">
        {buttonData.map((item, index) => (
          <Link key={index} href={item.url}>
            <div
              className={`relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 bg-gradient-to-r ${
                hoverIndex === index ? item.hoverColor : item.color
              } ${
                hoverIndex === index 
                  ? "shadow-[0_10px_40px_-5px_rgb(252,78,135,0.4),0_0_20px_-5px_rgb(252,78,135,0.2)] scale-[1.02]" 
                  : "shadow-[0_4px_15px_rgb(254,146,181,0.15)]"
              } h-28`}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <span
                className={`text-2xl font-semibold text-center mx-auto transition-all duration-300 ${
                  hoverIndex === index ? "text-white" : item.textColor
                }`}
              >
                {item.text}
              </span>
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
                    hoverIndex === index 
                      ? "bg-white text-black shadow-[0_4px_15px_rgb(252,78,135,0.4)]" 
                      : "bg-black text-white shadow-[0_2px_8px_rgb(254,146,181,0.2)]"
                  }`}
                >
                  ➝
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}