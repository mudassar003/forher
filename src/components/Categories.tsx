"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link"; // Import Link from next/link

const buttonData = [
  {
    text: "Lose weight",
    color: "from-[#EBF3ED] to-[#EBF3ED]",
    hoverColor: "from-[#3A5226] to-[#5A6E3F]",
    textColor: "text-[#5A6E3F]",
    image: "/images/Hims_Homepage_Weight_Loss_Default.webp",
    url: "/c/wm", // Define the URL here
  },
  {
    text: "Find relief for anxiety",
    color: "from-[#EBF3ED] to-[#EBF3ED]",
    hoverColor: "from-[#4B6478] to-[#3D5B74]",
    textColor: "text-[#3D5B74]",
    image: "/images/Hims_Homepage_Weight_Loss_Default.webp",
    url: "/c/mh", // Define the URL here
  },
  {
    text: "Control your cycle",
    color: "from-[#EBF3ED] to-[#EBF3ED]",
    hoverColor: "from-[#8B9B96] to-[#5F9C92]",
    textColor: "text-[#5F9C92]",
    image: "/images/Hims_Homepage_Weight_Loss_Default.webp",
    url: "/c/b", // Define the URL here
  },
  {
    text: "Grow fuller hair",
    color: "from-[#EBF3ED] to-[#EBF3ED]",
    hoverColor: "from-[#506C5F] to-[#4E7F6B]",
    textColor: "text-[#4E7F6B]",
    image: "/images/Hims_Homepage_Weight_Loss_Default.webp",
    url: "/c/hl", // Define the URL here
  },
  {
    text: "Get glowing skin",
    color: "from-[#EBF3ED] to-[#EBF3ED]",
    hoverColor: "from-[#658C84] to-[#5F9C92]",
    textColor: "text-[#5F9C92]",
    image: "/images/Hims_Homepage_Weight_Loss_Default.webp",
    url: "/c/aa", // Define the URL here
  },
  {
    text: "Explore wellness",
    color: "from-[#EBF3ED] to-[#EBF3ED]",
    hoverColor: "from-[#7A5B68] to-[#7F5D76]",
    textColor: "text-[#7F5D76]",
    image: "/images/Hims_Homepage_Weight_Loss_Default.webp",
    url: "/vitamin-women", // Define the URL here
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
              <Link key={index} href={item.url}> {/* Wrap the button in the Link component */}
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

      {/* Desktop: Grid Layout (Unchanged) */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 md:px-8 lg:px-16 mt-12">
        {buttonData.map((item, index) => {
          const words = item.text.split(" ");
          return (
            <Link key={index} href={item.url}> {/* Wrap the button in the Link component */}
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
