"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Updated button data with brand colors and different background gradients
// Primary: #fe92b5
// Darker accent 1: #f96897
// Darker accent 2: #fc4e87
// Additional lighter shades for backgrounds
const buttonData = [
  {
    text: "Lose weight",
    color: "from-[#ffe6f0] to-[#ffeff6]",
    hoverColor: "from-[#fc4e87] to-[#fe92b5]",
    textColor: "text-[#fc4e87]",
    image: "/images/Hims_Homepage_Weight_Loss_Default.webp",
    url: "/c/wm",
  },
  {
    text: "Grow fuller hair",
    color: "from-[#ffd6e4] to-[#ffe1ec]",
    hoverColor: "from-[#f96897] to-[#fe92b5]",
    textColor: "text-[#f96897]",
    image: "/images/Hims_Homepage_Weight_Loss_Default.webp",
    url: "/c/hl",
  },
  {
    text: "Control your cycle",
    color: "from-[#ffeaf2] to-[#ffd9e7]",
    hoverColor: "from-[#fe92b5] to-[#f96897]",
    textColor: "text-[#fe92b5]",
    image: "/images/Hims_Homepage_Weight_Loss_Default.webp",
    url: "/c/b",
  },
  {
    text: "Find relief for anxiety",
    color: "from-[#ffcfdf] to-[#ffe0eb]",
    hoverColor: "from-[#fc4e87] to-[#f96897]",
    textColor: "text-[#fc4e87]",
    image: "/images/Hims_Homepage_Weight_Loss_Default.webp",
    url: "/c/mh",
  },
  {
    text: "Get glowing skin",
    color: "from-[#ffd1e0] to-[#ffe8f1]",
    hoverColor: "from-[#fe92b5] to-[#fc4e87]",
    textColor: "text-[#fe92b5]",
    image: "/images/Hims_Homepage_Weight_Loss_Default.webp",
    url: "/c/aa",
  },
  {
    text: "Explore wellness",
    color: "from-[#ffe2ed] to-[#ffd4e2]",
    hoverColor: "from-[#f96897] to-[#fc4e87]",
    textColor: "text-[#f96897]",
    image: "/images/Hims_Homepage_Weight_Loss_Default.webp",
    url: "/c/consultation",
  },
];

export default function HoverEffectButtons() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <>
      {/* Mobile: Horizontally Scrollable Categories with Three Items Per Row */}
      <div className="sm:hidden overflow-x-auto px-4 py-4 scroll-smooth snap-x">
        <div className="grid grid-cols-3 gap-2 w-[900px]">
          {buttonData.map((item, index) => {
            const words = item.text.split(" ");
            return (
              <Link key={index} href={item.url}>
                <div
                  className={`relative flex items-center justify-between w-[280px] h-[75px] p-3 rounded-2xl transition-all duration-300 bg-gradient-to-r ${
                    hoverIndex === index ? item.hoverColor : item.color
                  } snap-start`}
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <span
                    className={`text-lg font-semibold flex items-center gap-1 transition-all duration-300 ${
                      hoverIndex === index ? "bg-clip-text text-white mix-blend-overlay" : "text-black"
                    }`}
                  >
                    <span>{words.slice(0, -1).join(" ")}</span>{" "}
                    <span
                      className={`transition-all duration-300 ${
                        hoverIndex === index ? "text-white" : item.textColor
                      }`}
                    >
                      {words[words.length - 1]}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Image
                      src={item.image}
                      alt={item.text}
                      width={50}
                      height={50}
                      className={`transition-transform duration-300 ${
                        hoverIndex === index ? "rotate-[-30deg] scale-110" : "rotate-0 scale-100"
                      }`}
                    />
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
                        hoverIndex === index ? "bg-white text-black" : "bg-black text-white"
                      }`}
                    >
                      ➝
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 md:px-8 lg:px-16 mt-12">
        {buttonData.map((item, index) => {
          const words = item.text.split(" ");
          return (
            <Link key={index} href={item.url}>
              <div
                className={`relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 bg-gradient-to-r ${
                  hoverIndex === index ? item.hoverColor : item.color
                }`}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <span
                  className={`text-xl font-semibold flex items-center gap-1 transition-all duration-300 ${
                    hoverIndex === index ? "bg-clip-text text-white mix-blend-overlay" : "text-black"
                  }`}
                >
                  <span>{words.slice(0, -1).join(" ")}</span>{" "}
                  <span
                    className={`transition-all duration-300 ${
                      hoverIndex === index ? "text-white" : item.textColor
                    }`}
                  >
                    {words[words.length - 1]}
                  </span>
                </span>
                <div className="flex items-center gap-4">
                  <Image
                    src={item.image}
                    alt={item.text}
                    width={100}
                    height={100}
                    className={`transition-transform duration-300 ${
                      hoverIndex === index ? "rotate-[-30deg] scale-110" : "rotate-0 scale-100"
                    }`}
                  />
                  <div
                    className={`w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
                      hoverIndex === index ? "bg-white text-black" : "bg-black text-white"
                    }`}
                  >
                    ➝
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}