"use client";

import { useState } from "react";
import Link from "next/link";

const buttonData = [
  {
    text: "Weight Loss",
    color: "from-[#ffe6f0] to-[#ffeff6]",
    hoverColor: "from-[#fc4e87] to-[#fe92b5]",
    textColor: "text-[#fc4e87]",
    url: "/c/wm",
  },
  {
    text: "Hair Care",
    color: "from-[#ffe6f0] to-[#ffeff6]",
    hoverColor: "from-[#fc4e87] to-[#fe92b5]",
    textColor: "text-[#fc4e87]",
    url: "/c/hl",
  },
  {
    text: "Cycle Management",
    color: "from-[#ffe6f0] to-[#ffeff6]",
    hoverColor: "from-[#fc4e87] to-[#fe92b5]",
    textColor: "text-[#fc4e87]",
    url: "/c/b",
  },
  {
    text: "Anxiety Relief",
    color: "from-[#ffe6f0] to-[#ffeff6]",
    hoverColor: "from-[#fc4e87] to-[#fe92b5]",
    textColor: "text-[#fc4e87]",
    url: "/c/mh",
  },
  {
    text: "Skin Care",
    color: "from-[#ffe6f0] to-[#ffeff6]",
    hoverColor: "from-[#fc4e87] to-[#fe92b5]",
    textColor: "text-[#fc4e87]",
    url: "/c/aa",
  },
  {
    text: "Finding Balance",
    color: "from-[#ffe6f0] to-[#ffeff6]",
    hoverColor: "from-[#fc4e87] to-[#fe92b5]",
    textColor: "text-[#fc4e87]",
    url: "/c/consultation",
  },
];

export default function HoverEffectButtons() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <>
      {/* Mobile: Horizontally Scrollable Categories */}
      <div className="sm:hidden overflow-x-auto px-4 py-4 scroll-smooth snap-x">
        <div className="grid grid-cols-3 gap-3 w-[900px]">
          {buttonData.map((item, index) => (
            <Link key={index} href={item.url}>
              <div
                className={`relative flex items-center justify-center w-[280px] h-[90px] p-4 rounded-2xl transition-all duration-300 bg-gradient-to-r ${
                  hoverIndex === index ? item.hoverColor : item.color
                } shadow-md hover:shadow-xl snap-start`}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <span
                  className={`text-base font-semibold text-center transition-all duration-300 ${
                    hoverIndex === index ? "text-white" : item.textColor
                  }`}
                >
                  {item.text}
                </span>
                <div
                  className={`absolute right-4 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
                    hoverIndex === index ? "bg-white text-black" : "bg-black text-white"
                  }`}
                >
                  ➝
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-8 lg:px-16 mt-12">
        {buttonData.map((item, index) => (
          <Link key={index} href={item.url}>
            <div
              className={`relative flex items-center justify-center h-[120px] p-6 rounded-2xl transition-all duration-300 bg-gradient-to-r ${
                hoverIndex === index ? item.hoverColor : item.color
              } shadow-md hover:shadow-xl`}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <span
                className={`text-lg font-semibold text-center transition-all duration-300 ${
                  hoverIndex === index ? "text-white" : item.textColor
                }`}
              >
                {item.text}
              </span>
              <div
                className={`absolute right-6 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
                  hoverIndex === index ? "bg-white text-black" : "bg-black text-white"
                }`}
              >
                ➝
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}