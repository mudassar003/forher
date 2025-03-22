"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PackageOption {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  features: string[];
  badge?: string;
  badgeColor?: string;
  cta: string;
  ctaAction: string;
  paymentOptions: string[];
}

interface PackagesProps {
  showHeading?: boolean;
}

export default function Packages({ showHeading = true }: PackagesProps) {
  const [hoveredPackage, setHoveredPackage] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>("compounded");
  const [isAnimating, setIsAnimating] = useState(false);

  const packageOptions: PackageOption[] = [
    {
      id: "compounded",
      title: "Success by Sesame",
      subtitle: "(compounded semaglutide included)",
      price: 249,
      badge: "Most popular",
      badgeColor: "#e63946",
      features: [
        "Video consults, labs and unlimited messaging",
        "4 pre-measured injectable syringes of compounded semaglutide per month*",
        "Medication cost included (insurance not accepted)",
        "Same flat price, no matter the medication dose",
        "Medication supplied from a registered 503B pharmacy",
        "Free shipping + home delivery"
      ],
      cta: "Start with compounded semaglutide",
      ctaAction: "/service/start-compounded",
      paymentOptions: ["HSA, FSA, credit card"]
    },
    {
      id: "prescription",
      title: "Success by Sesame",
      subtitle: "(prescription sent to your pharmacy)",
      price: 89,
      badge: "Best with insurance",
      badgeColor: "#333333",
      features: [
        "Video consults, labs and unlimited messaging",
        "Prescription for brand-name GLP-1 medications such as Wegovy, Zepbound, Saxenda or oral weight loss medications (when appropriate)",
        "Medication cost not included",
        "Assistance with insurance paperwork to reduce cost of medication",
        "Pharmacy pickup or home delivery options"
      ],
      cta: "Start with prescription only",
      ctaAction: "/service/start-prescription",
      paymentOptions: ["HSA, FSA, credit card"]
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  const badgeVariants = {
    initial: { scale: 1 },
    pulse: { 
      scale: [1, 1.1, 1],
      transition: { duration: 1.5, repeat: Infinity, repeatType: "loop" as const }
    }
  };

  // Handle package selection
  const handlePackageSelect = (packageId: string) => {
    if (packageId !== selectedPackage && !isAnimating) {
      setIsAnimating(true);
      setSelectedPackage(packageId);
      
      // Reset animating state after animation completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }
  };

  // Handle CTA button click
  const handleCTAClick = (actionUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = actionUrl;
  };

  return (
    <section className="py-12 px-4 sm:px-6 md:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {showHeading && (
          <motion.div 
            className="text-center mb-10 md:mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal mb-4" style={{ color: "#e63946" }}>
              Weight Loss Programs
            </h2>
            <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto">
              Choose the plan that works best for you and your goals
            </p>
          </motion.div>
        )}

        {/* Sticky tab selector for mobile */}
        <div className="md:hidden sticky top-0 z-10 bg-white shadow-md mb-6 rounded-lg">
          <div className="grid grid-cols-2 p-2 gap-2">
            {packageOptions.map((pkg) => (
              <button
                key={`mobile-tab-${pkg.id}`}
                className={`py-3 px-3 rounded-lg text-sm font-medium transition-all ${
                  selectedPackage === pkg.id
                    ? "text-white shadow-md"
                    : "text-gray-600 bg-gray-100"
                }`}
                style={{ 
                  background: selectedPackage === pkg.id 
                    ? `linear-gradient(90deg, ${pkg.badgeColor}, ${pkg.badgeColor === "#e63946" ? "#ff4d6d" : "#555555"} 100%)` 
                    : ""
                }}
                onClick={() => handlePackageSelect(pkg.id)}
              >
                ${pkg.price}/mo
                <span className="block text-xs truncate opacity-80">
                  {pkg.id === "compounded" ? "With medication" : "Prescription only"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          className="grid md:grid-cols-2 gap-8 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="wait">
            {packageOptions.map((pkg) => (
              ((selectedPackage === pkg.id) || typeof window !== 'undefined' && window.innerWidth >= 768) && (
                <motion.div
                  key={pkg.id}
                  className={`rounded-xl overflow-hidden bg-white relative transition-all duration-300 ${
                    hoveredPackage === pkg.id ? "shadow-xl" : "shadow-md"
                  } ${selectedPackage === pkg.id ? "md:shadow-xl md:scale-105 z-10" : ""}`}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ y: -5 }}
                  onMouseEnter={() => setHoveredPackage(pkg.id)}
                  onMouseLeave={() => setHoveredPackage(null)}
                  onClick={() => handlePackageSelect(pkg.id)}
                >
                  {pkg.badge && (
                    <motion.div 
                      className="absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm font-medium shadow-md"
                      style={{ 
                        background: `linear-gradient(90deg, ${pkg.badgeColor}, ${pkg.badgeColor === "#e63946" ? "#ff4d6d" : "#555555"} 100%)`
                      }}
                      variants={badgeVariants}
                      initial="initial"
                      animate="pulse"
                    >
                      {pkg.badge}
                    </motion.div>
                  )}
                  
                  <div className="p-6 sm:p-8">
                    <div className="md:min-h-[100px]">
                      <h3 className="text-2xl font-semibold mb-1">{pkg.title}</h3>
                      <p className="text-gray-600 mb-3">{pkg.subtitle}</p>
                      
                      <div className="mb-6">
                        <div className="flex items-baseline">
                          <span className="text-3xl sm:text-4xl font-bold" style={{ color: pkg.badgeColor }}>
                            ${pkg.price}
                          </span>
                          <span className="text-sm text-gray-500 font-normal ml-1">/mo</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-b border-gray-100 py-6 mb-6">
                      <h4 className="text-base font-medium mb-4">What's included:</h4>
                      <ul className="space-y-3">
                        {pkg.features.map((feature, index) => (
                          <motion.li 
                            key={index} 
                            className="flex items-start"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <div className="mr-3 mt-1.5 flex-shrink-0">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM12 5.7L7.8 10.7C7.7 10.8 7.6 10.9 7.4 10.9C7.2 10.9 7.1 10.8 7 10.7L4 7.3C3.9 7.1 3.9 6.9 4 6.7C4.1 6.5 4.3 6.4 4.5 6.4C4.7 6.4 4.9 6.5 5 6.7L7.4 9.4L11.1 5.1C11.3 4.9 11.6 4.9 11.8 5.1C12 5.3 12.1 5.5 12 5.7Z" 
                                  fill={pkg.badgeColor === "#e63946" ? "#e63946" : "#4F46E5"} 
                                />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-xs uppercase text-gray-500 tracking-wider mb-1">Payment options</h4>
                      <p className="text-sm text-gray-700">{pkg.paymentOptions.join(", ")}</p>
                    </div>
                    
                    <motion.button
                      className="w-full py-3.5 px-4 rounded-full text-white font-medium transition-all hover:shadow-lg relative overflow-hidden group"
                      style={{ 
                        background: `linear-gradient(90deg, ${pkg.badgeColor}, ${pkg.badgeColor === "#e63946" ? "#ff4d6d" : "#555555"} 100%)`
                      }}
                      onClick={(e) => handleCTAClick(pkg.ctaAction, e)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10">{pkg.cta}</span>
                      <motion.div
                        className="absolute inset-0 w-0 bg-white bg-opacity-20"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </motion.div>
        
        <motion.div 
          className="hidden md:flex justify-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm text-gray-500 max-w-lg text-center">
            *All medications require a consultation with a licensed healthcare provider. Prescription-only plans do not include the cost of medication.
          </p>
        </motion.div>
      </div>
    </section>
  );
}