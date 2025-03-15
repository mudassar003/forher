//src/components/HomeHeader.tsx
"use client";

import { useEffect, useState } from "react";
import { FiShoppingCart, FiMenu, FiX, FiUser } from "react-icons/fi";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Get cart data from Zustand
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); // Calculate total quantity

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Check auth state on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };

    fetchUser();

    // Listen for auth state changes (login/logout)
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

  // Close menu if screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
      style={{ backgroundColor: headerBg }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="text-3xl md:text-4xl font-semibold text-black">
            Direct2Her
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <Link href="/" className="text-base lg:text-lg font-normal text-gray-800 hover:text-black transition-colors">
              Home
            </Link>
            <Link href="#" className="text-base lg:text-lg font-normal text-gray-800 hover:text-black transition-colors">
              Weight Loss
            </Link>
            <Link href="#" className="text-base lg:text-lg font-normal text-gray-800 hover:text-black transition-colors">
              Mental Health
            </Link>
            <Link href="#" className="text-base lg:text-lg font-normal text-gray-800 hover:text-black transition-colors">
              Hair Regrowth
            </Link>
            <Link href="/products" className="text-base lg:text-lg font-normal text-gray-800 hover:text-black transition-colors">
              Products
            </Link>
            <Link href="/studio" className="text-base lg:text-lg font-normal text-gray-800 hover:text-black transition-colors">
              Studio
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Desktop Login/Account Button */}
            <Link href={user ? "/account" : "/login"} className="hidden md:flex">
              <button className="flex items-center bg-white text-black border border-gray-200 px-5 py-2 rounded-full shadow-sm hover:shadow-md transition">
                <FiUser className="mr-2" />
                <span>{user ? "Account" : "Login"}</span>
              </button>
            </Link>

            {/* Shopping Cart Icon with Dynamic Count */}
            <Link href="/cart" className="relative">
              <FiShoppingCart className="text-2xl text-black cursor-pointer" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-black focus:outline-none" 
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 transition-transform duration-300 ease-in-out transform ${
          isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
        style={{ backgroundColor: headerBg }}
      >
        <div className="px-4 pt-2 pb-4 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <Link href="/" className="text-lg font-normal text-gray-800 hover:text-black py-2 border-b border-gray-100">
              Home
            </Link>
            <Link href="#" className="text-lg font-normal text-gray-800 hover:text-black py-2 border-b border-gray-100">
              Weight Loss
            </Link>
            <Link href="#" className="text-lg font-normal text-gray-800 hover:text-black py-2 border-b border-gray-100">
              Mental Health
            </Link>
            <Link href="#" className="text-lg font-normal text-gray-800 hover:text-black py-2 border-b border-gray-100">
              Hair Regrowth
            </Link>
            <Link href="/products" className="text-lg font-normal text-gray-800 hover:text-black py-2 border-b border-gray-100">
              Products
            </Link>
            <Link href="/studio" className="text-lg font-normal text-gray-800 hover:text-black py-2 border-b border-gray-100">
              Studio
            </Link>
            <Link href={user ? "/account" : "/login"} className="py-2">
              <button className="w-full flex items-center justify-center bg-black text-white px-5 py-3 rounded-full shadow-sm hover:bg-gray-800 transition">
                <FiUser className="mr-2" />
                <span>{user ? "My Account" : "Login / Sign Up"}</span>
              </button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;