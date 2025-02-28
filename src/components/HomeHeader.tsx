"use client";

import { useEffect, useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import Link from "next/link";

// Define the component-to-color mapping, including the new RotatingSection
const componentColorMap: { [key: string]: string } = {
  HairRegrowCard: "#729693",
  FaqAccordion: "#ffffff",
  HomeHero: "#f0f0f0",
  TestimonialSection: "#eaeaea",
  RotatingSection: "#464E3D", // New section with the specified color
};

const HomeHeader = () => {
  const [headerBg, setHeaderBg] = useState("#ffffff");

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const componentName = entry.target.getAttribute("data-component");
          const sectionColor = componentColorMap[componentName || ""];
          if (sectionColor) setHeaderBg(sectionColor);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5, // Trigger when 50% of the component is visible
    });

    // Observe all components with the 'data-component' attribute
    Object.keys(componentColorMap).forEach((componentName) => {
      const elements = document.querySelectorAll(`[data-component="${componentName}"]`);
      elements.forEach((element) => observer.observe(element));
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-colors duration-300"
      style={{ backgroundColor: headerBg }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="text-4xl font-semibold">
          <span className="text-black">hers</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-lg font-normal text-gray-800 hover:text-black">
            Weight Loss
          </a>
          <a href="#" className="text-lg font-normal text-gray-800 hover:text-black">
            Mental Health
          </a>
          <a href="#" className="text-lg font-normal text-gray-800 hover:text-black">
            Hair Regrowth
          </a>
          <a href="/products" className="text-lg font-normal text-gray-800 hover:text-black">
            Products
          </a>
          <a href="/dashboard" className="text-lg font-normal text-gray-800 hover:text-black">
            Dashboard
          </a>
        </nav>

        {/* Login Button and Cart Icon */}
        <div className="flex items-center space-x-4">
          {/* ✅ LOGIN button wrapped with Next.js Link */}
          <Link href="/login">
            <button className="hidden md:flex items-center bg-white text-black border border-gray-200 px-6 py-2 rounded-full shadow-sm hover:shadow-md transition">
              LOGIN
            </button>
          </Link>

          {/* ✅ Shopping Cart Icon */}
          <FiShoppingCart className="text-2xl text-black cursor-pointer" />
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
