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

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
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
          {/* Mobile Menu Button - Moved to left */}
          <button 
            className="md:hidden text-black focus:outline-none" 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>

          {/* Logo */}
          <Link href="/" className="text-3xl md:text-4xl font-semibold text-black">
            Lily's
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <Link href="/" className="text-base lg:text-lg font-normal text-gray-800 hover:text-[#fc4e87] hover:shadow-sm hover:shadow-pink-100/30 px-2 py-1 rounded-md transition-all">
              Home
            </Link>
            <Link href="/c/wm" className="text-base lg:text-lg font-normal text-gray-800 hover:text-[#fc4e87] hover:shadow-sm hover:shadow-pink-100/30 px-2 py-1 rounded-md transition-all">
              Weight Loss
            </Link>
            <Link href="/c/mh" className="text-base lg:text-lg font-normal text-gray-800 hover:text-[#fc4e87] hover:shadow-sm hover:shadow-pink-100/30 px-2 py-1 rounded-md transition-all">
              Mental Health
            </Link>
            <Link href="/c/hl" className="text-base lg:text-lg font-normal text-gray-800 hover:text-[#fc4e87] hover:shadow-sm hover:shadow-pink-100/30 px-2 py-1 rounded-md transition-all">
              Hair Regrowth
            </Link>
            <Link href="/products" className="text-base lg:text-lg font-normal text-gray-800 hover:text-[#fc4e87] hover:shadow-sm hover:shadow-pink-100/30 px-2 py-1 rounded-md transition-all">
              Products
            </Link>
            <Link href="/studio" className="text-base lg:text-lg font-normal text-gray-800 hover:text-[#fc4e87] hover:shadow-sm hover:shadow-pink-100/30 px-2 py-1 rounded-md transition-all">
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
          </div>
        </div>
      </div>

      {/* Mobile Menu - Modified to slide from left */}
      <div 
        className={`md:hidden fixed top-0 left-0 h-full w-3/4 max-w-xs z-50 shadow-lg transition-transform duration-300 ease-in-out transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: headerBg }}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link href="/" className="text-2xl font-semibold text-black">
              Lily's
            </Link>
            <button 
              className="text-black focus:outline-none" 
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <FiX className="text-2xl" />
            </button>
          </div>
          
          {/* Navigation Links */}
          <div className="flex-grow overflow-y-auto px-4 py-2">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-lg font-normal text-gray-800 hover:text-[#fc4e87] hover:shadow-sm hover:shadow-pink-100/30 py-3 px-4 rounded-md border-b border-gray-100 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/c/wm" 
                className="text-lg font-normal text-gray-800 hover:text-[#fc4e87] hover:shadow-sm hover:shadow-pink-100/30 py-3 px-4 rounded-md border-b border-gray-100 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Weight Loss
              </Link>
              <Link 
                href="/c/mh" 
                className="text-lg font-normal text-gray-800 hover:text-[#fc4e87] hover:shadow-sm hover:shadow-pink-100/30 py-3 px-4 rounded-md border-b border-gray-100 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Mental Health
              </Link>
              <Link 
                href="/c/hl" 
                className="text-lg font-normal text-gray-800 hover:text-[#fc4e87] hover:shadow-sm hover:shadow-pink-100/30 py-3 px-4 rounded-md border-b border-gray-100 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Hair Regrowth
              </Link>
              <Link 
                href="/products" 
                className="text-lg font-normal text-gray-800 hover:text-[#fc4e87] hover:shadow-sm hover:shadow-pink-100/30 py-3 px-4 rounded-md border-b border-gray-100 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/studio" 
                className="text-lg font-normal text-gray-800 hover:text-[#fc4e87] hover:shadow-sm hover:shadow-pink-100/30 py-3 px-4 rounded-md border-b border-gray-100 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Studio
              </Link>
            </nav>
          </div>
          
          {/* User Account Button at Bottom */}
          <div className="p-4 border-t border-gray-200">
            <Link 
              href={user ? "/account" : "/login"} 
              className="block"
              onClick={() => setIsMenuOpen(false)}
            >
              <button className="w-full flex items-center justify-center bg-black text-white px-5 py-3 rounded-full shadow-sm hover:bg-gray-800 transition">
                <FiUser className="mr-2" />
                <span>{user ? "My Account" : "Login / Sign Up"}</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default HomeHeader;