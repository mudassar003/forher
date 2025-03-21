"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

export default function HairLoss() {
  const [activeTab, setActiveTab] = useState("minoxidil");

  // Add keyframes for animations
  const animationKeyframes = `
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Inject the keyframes animation */}
      <style>{animationKeyframes}</style>
      {/* Background with improved overlay - matched to your site's color scheme */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/70 to-[#ff4d6d]/70 z-10 mix-blend-multiply" />
        <Image
          src="/images/picture3.png"
          alt="Hair treatment background"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          className="brightness-105 contrast-105 saturate-105"
        />
      </div>

      {/* Content container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 md:px-8 py-16 flex flex-col items-center">
        {/* Animated headline with better typography */}
        <motion.div 
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight text-white drop-shadow-[0_3px_5px_rgba(0,0,0,0.3)]">
            Regain Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-200 to-white">Confidence</span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-pink-100/90 max-w-3xl mx-auto font-medium">
            Clinically proven treatments tailored to your unique hair restoration journey
          </p>
        </motion.div>

        {/* Treatment options with tabs */}
        <motion.div 
          className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.25)] mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          {/* Tabs */}
          <div className="flex border-b border-white/20">
            <button 
              onClick={() => setActiveTab("minoxidil")}
              className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-all ${activeTab === "minoxidil" 
                ? "text-white bg-gradient-to-r from-pink-600/80 to-purple-600/80" 
                : "text-white/70 hover:text-white hover:bg-white/10"}`}
            >
              Minoxidil
            </button>
            <button 
              onClick={() => setActiveTab("finasteride")}
              className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-all ${activeTab === "finasteride" 
                ? "text-white bg-gradient-to-r from-pink-600/80 to-purple-600/80" 
                : "text-white/70 hover:text-white hover:bg-white/10"}`}
            >
              Finasteride
            </button>
            <button 
              onClick={() => setActiveTab("combo")}
              className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-all ${activeTab === "combo" 
                ? "text-white bg-gradient-to-r from-pink-600/80 to-purple-600/80" 
                : "text-white/70 hover:text-white hover:bg-white/10"}`}
            >
              Complete Care
            </button>
          </div>

          {/* Content based on active tab */}
          <div className="p-8 md:p-10">
            {activeTab === "minoxidil" && (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 relative h-[300px] md:h-[380px] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/Regrow_Hair.webp"
                    alt="Minoxidil Treatment"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="md:w-1/2 text-white">
                  <h3 className="text-3xl font-bold mb-4">Minoxidil Treatment</h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="text-pink-300 mr-2">✓</span>
                      <span>Regrow hair in as little as 3–6 months</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-300 mr-2">✓</span>
                      <span>FDA-approved for both men and women</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-300 mr-2">✓</span>
                      <span>Easy-to-apply topical solution</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-300 mr-2">✓</span>
                      <span>Proven to increase hair count by up to 25%</span>
                    </li>
                  </ul>
                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      <span className="text-3xl font-bold">$49</span>
                      <span className="text-pink-200">/month</span>
                    </div>
                    <span className="line-through text-white/50">$69</span>
                  </div>
                  <motion.button 
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Treatment
                  </motion.button>
                </div>
              </div>
            )}

            {activeTab === "finasteride" && (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 relative h-[300px] md:h-[380px] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/Regrow_Hair.webp"
                    alt="Finasteride Treatment"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="md:w-1/2 text-white">
                  <h3 className="text-3xl font-bold mb-4">Finasteride Treatment</h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="text-pink-300 mr-2">✓</span>
                      <span>Prevents further hair loss at the source</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-300 mr-2">✓</span>
                      <span>Reduces DHT, the hormone causing hair loss</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-300 mr-2">✓</span>
                      <span>Once-daily oral medication</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-300 mr-2">✓</span>
                      <span>Results visible within 3-6 months</span>
                    </li>
                  </ul>
                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      <span className="text-3xl font-bold">$59</span>
                      <span className="text-pink-200">/month</span>
                    </div>
                    <span className="line-through text-white/50">$79</span>
                  </div>
                  <motion.button 
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Treatment
                  </motion.button>
                </div>
              </div>
            )}

            {activeTab === "combo" && (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 relative h-[300px] md:h-[380px] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/Regrow_Hair.webp"
                    alt="Complete Hair Care"
                    layout="fill"
                    objectFit="cover"
                  />
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                    BEST VALUE
                  </div>
                </div>
                <div className="md:w-1/2 text-white">
                  <h3 className="text-3xl font-bold mb-4">Complete Hair Care</h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="text-pink-300 mr-2">✓</span>
                      <span>Minoxidil + Finasteride combination therapy</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-300 mr-2">✓</span>
                      <span>Targets hair loss from multiple angles</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-300 mr-2">✓</span>
                      <span>Biotin supplement for hair health</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-300 mr-2">✓</span>
                      <span>Quarterly follow-ups with hair specialists</span>
                    </li>
                  </ul>
                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      <span className="text-3xl font-bold">$89</span>
                      <span className="text-pink-200">/month</span>
                    </div>
                    <span className="line-through text-white/50">$129</span>
                  </div>
                  <motion.button 
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Treatment
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Wave SVG at bottom - Smooth wave transition */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden z-10">
        <svg
          className="relative block w-full h-24"
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