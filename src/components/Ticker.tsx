// src/components/Ticker.tsx
"use client";

import { useEffect, useState } from "react";
import { FaMobileAlt, FaStar, FaHeart, FaCog, FaComments, FaShieldAlt, FaBox } from "react-icons/fa";
import useTranslations from "@/hooks/useTranslations";

// Strict TypeScript interfaces
interface TickerItem {
  id: number;
  icon: React.ReactElement;
  translationKey: string;
}

interface TickerProps {
  className?: string;
}

// Brand colors - moved to constants for better maintainability
const BRAND_COLORS = {
  primary: "#fe92b5",
  accent: "#f96897",
  darkAccent: "#fc4e87",
  lightBg: "#fff8fa",
  text: "#333"
} as const;

// Animation speeds
const ANIMATION_SPEEDS = {
  desktop: 25,
  mobile: 10
} as const;

const tickerItems: TickerItem[] = [
  { id: 1, icon: <FaCog />, translationKey: "affordablePricing" },
  { id: 2, icon: <FaMobileAlt />, translationKey: "onlineAccess" },
  { id: 3, icon: <FaStar />, translationKey: "personalizedCare" },
  { id: 4, icon: <FaHeart />, translationKey: "ongoingSupport" },
  { id: 5, icon: <FaCog />, translationKey: "usSourcedIngredients" },
  { id: 6, icon: <FaComments />, translationKey: "unlimitedMessaging" },
  { id: 7, icon: <FaShieldAlt />, translationKey: "fdaRegulatedPharmacies" },
  { id: 8, icon: <FaBox />, translationKey: "freeDiscreetShipping" },
  { id: 9, icon: <FaCog />, translationKey: "affordablePricing" },
  { id: 10, icon: <FaStar />, translationKey: "personalizedCare" },
];

export default function Ticker({ className = "" }: TickerProps): React.ReactElement {
  const { t } = useTranslations();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Check if device is mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Run on initial render
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Handle touch events for mobile
  const handleTouchStart = (): void => setIsPaused(true);
  const handleTouchEnd = (): void => setIsPaused(false);
  
  // Handle mouse events for desktop
  const handleMouseEnter = (): void => setIsPaused(true);
  const handleMouseLeave = (): void => setIsPaused(false);

  // Mobile specific ticker
  const MobileTicker = (): React.ReactElement => (
    <div
      className="relative w-full overflow-hidden py-2 flex items-center animate-fade-in"
      style={{ backgroundColor: BRAND_COLORS.lightBg }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="relative z-10 px-3 whitespace-nowrap font-medium flex items-center"
        style={{ backgroundColor: BRAND_COLORS.lightBg, color: BRAND_COLORS.darkAccent }}
      >
        <span className="text-xs">{t('ticker.whyLilys')}</span>
        <span className="ml-1 text-xs" style={{ color: BRAND_COLORS.accent }}>|</span>
      </div>
      <div className="w-full overflow-hidden relative">
        <div
          className="flex space-x-16"
          style={{
            animation: `slideMobile ${ANIMATION_SPEEDS.mobile}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
            whiteSpace: 'nowrap',
          }}
        >
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
            <div key={`mobile-${index}`} className="flex items-center space-x-1 text-xs font-normal">
              <span className="text-sm" style={{ color: BRAND_COLORS.accent }}>{item.icon}</span>
              <span style={{ color: BRAND_COLORS.text }}>
                {t(`ticker.items.${item.translationKey}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Desktop specific ticker
  const DesktopTicker = (): React.ReactElement => (
    <div
      className="relative w-full overflow-hidden py-2 flex items-center animate-fade-in"
      style={{ backgroundColor: BRAND_COLORS.lightBg }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="relative z-10 px-4 whitespace-nowrap font-medium flex items-center"
        style={{ backgroundColor: BRAND_COLORS.lightBg, color: BRAND_COLORS.darkAccent }}
      >
        <span className="text-base">{t('ticker.whyLilys')}</span>
        <span className="ml-2 text-base" style={{ color: BRAND_COLORS.accent }}>|</span>
      </div>
      <div className="w-full overflow-hidden relative">
        <div
          className="flex space-x-36"
          style={{
            animation: `slideDesktop ${ANIMATION_SPEEDS.desktop}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
            whiteSpace: 'nowrap',
          }}
        >
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
            <div key={`desktop-${index}`} className="flex items-center space-x-2 text-sm font-normal">
              <span className="text-lg" style={{ color: BRAND_COLORS.accent }}>{item.icon}</span>
              <span style={{ color: BRAND_COLORS.text }}>
                {t(`ticker.items.${item.translationKey}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={className}>
      {/* Render either mobile or desktop ticker based on screen width */}
      <div className="hidden md:block">
        <DesktopTicker />
      </div>
      <div className="block md:hidden">
        <MobileTicker />
      </div>

      <style jsx global>{`
        @keyframes slideDesktop {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }
        
        @keyframes slideMobile {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}