"use client";

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

    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
  `;

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden" aria-labelledby="hair-growth-heading">
      {/* Inject the keyframes animation */}
      <style>{animationKeyframes}</style>
      
      {/* Background with gradient and animated elements */}
      <div className="absolute inset-0 z-0">
        {/* Main background gradient using enhanced color scheme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e63946] via-[#d81159] to-[#8f2d56]" />
        
        {/* Animated circles for visual interest with improved contrast */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white opacity-15 mix-blend-overlay animate-[float_6s_ease-in-out_infinite]" style={{ animationDelay: "0s" }} />
        <div className="absolute top-2/3 right-1/4 w-96 h-96 rounded-full bg-white opacity-10 mix-blend-overlay animate-[float_8s_ease-in-out_infinite]" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-pink-200 opacity-10 mix-blend-overlay animate-[float_7s_ease-in-out_infinite]" style={{ animationDelay: "2s" }} />
        
        {/* Enhanced pattern overlay */}
        <div className="absolute inset-0 opacity-15" 
             style={{ 
               backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" 
             }} 
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
          <h1 id="hair-growth-heading" className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)]">
            Grow hair <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-100 via-yellow-100 to-white">like never before</span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-medium">
            Clinically proven treatments tailored to your unique hair restoration journey
          </p>
        </motion.div>

        {/* Treatment options with tabs */}
        <motion.div 
          className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.15)] mb-12 md:mb-16 border border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          {/* Tabs */}
          <div className="flex border-b border-white/20">
            <button 
              onClick={() => setActiveTab("minoxidil")}
              className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-all ${activeTab === "minoxidil" 
                ? "text-white bg-white/20" 
                : "text-white/70 hover:text-white hover:bg-white/10"}`}
            >
              Minoxidil
            </button>
            <button 
              onClick={() => setActiveTab("finasteride")}
              className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-all ${activeTab === "finasteride" 
                ? "text-white bg-white/20" 
                : "text-white/70 hover:text-white hover:bg-white/10"}`}
            >
              Finasteride
            </button>
            <button 
              onClick={() => setActiveTab("combo")}
              className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-all ${activeTab === "combo" 
                ? "text-white bg-white/20" 
                : "text-white/70 hover:text-white hover:bg-white/10"}`}
            >
              Complete Care
            </button>
          </div>

          {/* Content based on active tab */}
          <div className="p-8 md:p-10">
            {activeTab === "minoxidil" && (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <div className="relative p-6 bg-gradient-to-br from-white/15 to-white/5 rounded-2xl border border-white/20 h-full backdrop-blur-sm shadow-lg">
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full"></div>
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
                    
                    <div className="relative z-10">
                      <div className="text-4xl font-bold text-white mb-2">Minoxidil</div>
                      <div className="h-1 w-20 bg-white/50 mb-4 rounded-full"></div>
                      <p className="text-white/80 mb-4">The most widely used treatment for hair regrowth with proven results.</p>
                      
                      <div className="flex flex-wrap gap-3 mb-6">
                        <span className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm">FDA-Approved</span>
                        <span className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm">Topical</span>
                        <span className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm">No Prescription</span>
                      </div>
                      
                      <div className="mt-6">
                        <span className="text-white/70 text-sm">Result Timeline</span>
                        <div className="w-full h-2 bg-white/10 rounded-full mt-2">
                          <div className="h-full w-3/5 bg-white/40 rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-xs text-white/60 mt-1">
                          <span>3 months</span>
                          <span>6 months</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 text-white">
                  <h3 className="text-3xl font-bold mb-4">Minoxidil Treatment</h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20">✓</span>
                      <span>Regrow hair in as little as 3–6 months</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20">✓</span>
                      <span>FDA-approved for both men and women</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20">✓</span>
                      <span>Easy-to-apply topical solution</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20">✓</span>
                      <span>Proven to increase hair count by up to 25%</span>
                    </li>
                  </ul>
                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      <span className="text-3xl font-bold">$49</span>
                      <span className="text-white/80">/month</span>
                    </div>
                    <span className="line-through text-white/50">$69</span>
                  </div>
                  <motion.button 
                    className="w-full py-4 bg-white text-[#d81159] rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Book Consultation"
                  >
                    Book Consultation
                  </motion.button>
                </div>
              </div>
            )}

            {activeTab === "finasteride" && (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <div className="relative p-6 bg-white/10 rounded-2xl border border-white/20 h-full">
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full"></div>
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
                    
                    <div className="relative z-10">
                      <div className="text-4xl font-bold text-white mb-2">Finasteride</div>
                      <div className="h-1 w-20 bg-white/50 mb-4 rounded-full"></div>
                      <p className="text-white/80 mb-4">Blocks DHT to help prevent further hair loss and maintain your hair.</p>
                      
                      <div className="flex flex-wrap gap-3 mb-6">
                        <span className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm">FDA-Approved</span>
                        <span className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm">Oral</span>
                        <span className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm">Prescription</span>
                      </div>
                      
                      <div className="mt-6">
                        <span className="text-white/70 text-sm">Result Timeline</span>
                        <div className="w-full h-2 bg-white/10 rounded-full mt-2">
                          <div className="h-full w-4/5 bg-white/40 rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-xs text-white/60 mt-1">
                          <span>3 months</span>
                          <span>6 months</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 text-white">
                  <h3 className="text-3xl font-bold mb-4">Finasteride Treatment</h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20">✓</span>
                      <span>Prevents further hair loss at the source</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20">✓</span>
                      <span>Reduces DHT, the hormone causing hair loss</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20">✓</span>
                      <span>Once-daily oral medication</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20">✓</span>
                      <span>Results visible within 3-6 months</span>
                    </li>
                  </ul>
                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      <span className="text-3xl font-bold">$59</span>
                      <span className="text-white/80">/month</span>
                    </div>
                    <span className="line-through text-white/50">$79</span>
                  </div>
                  <motion.button 
                    className="w-full py-4 bg-white text-[#e63946] rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
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
                <div className="md:w-1/2">
                  <div className="relative p-6 bg-white/10 rounded-2xl border border-white/20 h-full">
                    <div className="absolute -top-6 -right-6 bg-white text-[#e63946] text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                      BEST VALUE
                    </div>
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full"></div>
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
                    
                    <div className="relative z-10">
                      <div className="text-4xl font-bold text-white mb-2">Complete Care</div>
                      <div className="h-1 w-20 bg-white/50 mb-4 rounded-full"></div>
                      <p className="text-white/80 mb-4">Our most comprehensive solution for maximum hair regrowth and retention.</p>
                      
                      <div className="flex flex-wrap gap-3 mb-6">
                        <span className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm">Minoxidil</span>
                        <span className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm">Finasteride</span>
                        <span className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm">Biotin</span>
                      </div>
                      
                      <div className="mt-6">
                        <span className="text-white/70 text-sm">Result Timeline</span>
                        <div className="w-full h-2 bg-white/10 rounded-full mt-2">
                          <div className="h-full w-5/5 bg-white/40 rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-xs text-white/60 mt-1">
                          <span>3 months</span>
                          <span>6 months</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 text-white">
                  <h3 className="text-3xl font-bold mb-4">Complete Hair Care</h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20">✓</span>
                      <span>Minoxidil + Finasteride combination therapy</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20">✓</span>
                      <span>Targets hair loss from multiple angles</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20">✓</span>
                      <span>Biotin supplement for hair health</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20">✓</span>
                      <span>Quarterly follow-ups with hair specialists</span>
                    </li>
                  </ul>
                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      <span className="text-3xl font-bold">$89</span>
                      <span className="text-white/80">/month</span>
                    </div>
                    <span className="line-through text-white/50">$129</span>
                  </div>
                  <motion.button 
                    className="w-full py-4 bg-white text-[#e63946] rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
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

        <motion.div
          className="w-full max-w-4xl flex flex-col items-center mt-6 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm rounded-xl p-6 w-full border border-white/20 shadow-lg">
            <h3 className="text-white text-xl md:text-2xl font-bold text-center mb-4">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-4 flex flex-col items-center text-center backdrop-blur-sm border border-white/10 shadow-md">
                <div className="w-12 h-12 bg-white text-[#d81159] rounded-full flex items-center justify-center text-xl font-bold mb-3">1</div>
                <h4 className="text-white font-semibold mb-2">Online Consultation</h4>
                <p className="text-white/85 text-sm">Complete our quick assessment from anywhere, anytime</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 flex flex-col items-center text-center backdrop-blur-sm border border-white/10 shadow-md">
                <div className="w-12 h-12 bg-white text-[#d81159] rounded-full flex items-center justify-center text-xl font-bold mb-3">2</div>
                <h4 className="text-white font-semibold mb-2">Doctor Review</h4>
                <p className="text-white/85 text-sm">A licensed physician reviews your case and prescribes treatment</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 flex flex-col items-center text-center backdrop-blur-sm border border-white/10 shadow-md">
                <div className="w-12 h-12 bg-white text-[#d81159] rounded-full flex items-center justify-center text-xl font-bold mb-3">3</div>
                <h4 className="text-white font-semibold mb-2">Ongoing Support</h4>
                <p className="text-white/85 text-sm">Regular check-ins and adjustments to optimize your results</p>
              </div>
            </div>
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