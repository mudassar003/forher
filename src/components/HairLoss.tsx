"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HairLoss() {
  return (
    <section className="relative w-full min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
      {/* High-quality background image - Fixed gradient overlay for consistent look regardless of image quality */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-pink-600/70 z-10 mix-blend-multiply" />
        <Image
          src="/images/picture3.png"
          alt="Beautiful hair background"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          className="brightness-110 contrast-105"
        />
      </div>

      {/* Content container */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 py-16 flex flex-col items-center">
        {/* Heading with enhanced text shadow for better readability */}
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Grow hair like
          </h1>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            never before
          </h2>
        </motion.div>

        {/* Regrow card - Completely redesigned */}
        <motion.div 
          className="w-80 md:w-96 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.25)] mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-gradient-to-br from-[#ff5b8d] to-[#f83d7b] p-6 relative">
            {/* Top content */}
            <div className="text-white mb-20">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Regrow hair in</h3>
              <h4 className="text-2xl md:text-3xl font-bold">3–6 months with</h4>
              <h4 className="text-2xl md:text-3xl font-bold mt-1">Minoxidil</h4>
            </div>
            
            {/* Hand image repositioned and optimized */}
            <div className="absolute bottom-0 right-0 w-60 h-60 flex items-end justify-end">
              <Image
                src="/images/Regrow_Hair.webp"
                alt="Hand holding Minoxidil pill"
                width={240}
                height={240}
                style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
              />
            </div>
            
            {/* Button with glass effect and improved positioning */}
            <motion.button 
              className="absolute bottom-6 right-6 px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold text-sm md:text-base shadow-lg border border-white/30"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              Get started
            </motion.button>
          </div>
        </motion.div>

        {/* Action buttons - Enhanced with better styling */}
        <motion.div 
          className="flex gap-5 w-full max-w-md justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button 
            className="w-1/2 py-4 bg-white text-[#222] rounded-full font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Get started
          </motion.button>
          <motion.button 
            className="w-1/2 py-4 bg-[#d13964] text-white rounded-full font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            See if I'm eligible
          </motion.button>
        </motion.div>
      </div>

      {/* Wave SVG at bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden z-10">
        <svg
          className="relative block w-full h-16 md:h-24"
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
          fill="white"
        >
          <path 
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
          />
        </svg>
      </div>
    </section>
  );
}