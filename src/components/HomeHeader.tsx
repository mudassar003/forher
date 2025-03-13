//src/components/HomeHeader.tsx
"use client";

import { useEffect, useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // Import Supabase client
import { useCartStore } from "@/store/cartStore"; // Import Zustand cart store

const componentColorMap: { [key: string]: string } = {
  HairRegrowCard: "#729693",
  FaqAccordion: "#ffffff",
  HomeHero: "#f0f0f0",
  TestimonialSection: "#eaeaea",
  RotatingSection: "#464E3D",
};

const HomeHeader = () => {
  const [headerBg, setHeaderBg] = useState("#ffffff");
  const [user, setUser] = useState<any>(null); // Store logged-in user

  // ✅ Get cart data from Zustand
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); // Calculate total quantity

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
      threshold: 0.5,
    });

    Object.keys(componentColorMap).forEach((componentName) => {
      const elements = document.querySelectorAll(`[data-component="${componentName}"]`);
      elements.forEach((element) => observer.observe(element));
    });

    return () => observer.disconnect();
  }, []);

  // ✅ Check auth state on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };

    fetchUser();

    // ✅ Listen for auth state changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-colors duration-300"
      style={{ backgroundColor: headerBg }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="text-4xl font-semibold">
          <span className="text-black">Direct2Her</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-lg font-normal text-gray-800 hover:text-black">
            Home
          </Link>
          <Link href="#" className="text-lg font-normal text-gray-800 hover:text-black">
            Weight Loss
          </Link>
          <Link href="#" className="text-lg font-normal text-gray-800 hover:text-black">
            Mental Health
          </Link>
          <Link href="#" className="text-lg font-normal text-gray-800 hover:text-black">
            Hair Regrowth
          </Link>
          <Link href="/products" className="text-lg font-normal text-gray-800 hover:text-black">
            Products
          </Link>
          <Link href="/studio" className="text-lg font-normal text-gray-800 hover:text-black">
            Studio
          </Link>
        </nav>

        {/* Login Button and Cart Icon */}
        <div className="flex items-center space-x-4">
          {/* ✅ Conditionally Render Button Based on Auth State */}
          <Link href={user ? "/account" : "/login"}>
            <button className="hidden md:flex items-center bg-white text-black border border-gray-200 px-6 py-2 rounded-full shadow-sm hover:shadow-md transition">
              {user ? "Account" : "Login"}
            </button>
          </Link>

          {/* ✅ Shopping Cart Icon with Dynamic Count */}
          <Link href="/cart" className="relative">
            <FiShoppingCart className="text-2xl text-black cursor-pointer" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
