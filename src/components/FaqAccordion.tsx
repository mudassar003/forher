"use client"; 

import { useState, useRef, useEffect } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

const faqData = [
  {
    question: "What is Lily's?",
    answer: `Lily's is a 100% online platform with over 1 million subscribers that connects patients to licensed 
    healthcare professionals in all 50 states. We offer support for weight loss, hair regrowth, mental health, 
    and skincare.

    Through our simple online process you can connect with licensed medical providers who can 
    recommend customized treatment plans including prescription treatments, if appropriate, shipped 
    right to your door.`,
  },
  {
    question: "How does Lily's work?",
    answer: `Lily's works by connecting you to healthcare professionals through an easy online process. 
    You fill out a health questionnaire, and a licensed provider will review it to recommend personalized 
    treatments. If prescribed, your treatment is delivered directly to your door.`,
  },
  {
    question: "Who are the providers at Lily's?",
    answer: `Lily's partners with licensed healthcare professionals who specialize in weight loss, hair regrowth, 
    mental health, and skincare. These providers are fully licensed and experienced in delivering online 
    healthcare services.`,
  },
];

const FaqAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const accordionRefs = useRef<Array<HTMLDivElement | null>>([]);
  
  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleAccordion(index);
    }
  };

  const toggleAccordion = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  // Scroll into view when accordion opens
  useEffect(() => {
    if (openIndex !== null && accordionRefs.current[openIndex]) {
      const timer = setTimeout(() => {
        accordionRefs.current[openIndex]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest'
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [openIndex]);

  return (
    <section className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <h2 className="text-2xl md:text-3xl font-medium mb-8 text-center">Frequently Asked Questions</h2>
      
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div 
            key={index} 
            ref={(el) => { accordionRefs.current[index] = el; }}
            className="border border-gray-100 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <h3>
              <button
                id={`faq-button-${index}`}
                aria-expanded={openIndex === index ? "true" : "false"} {/* This line is fixed */}
                aria-controls={`faq-panel-${index}`}
                className="w-full flex justify-between items-center px-6 py-5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink-400"
                onClick={() => toggleAccordion(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                <span className="text-2xl md:text-4xl font-normal text-left text-gray-800 pr-4">
                  {item.question}
                </span>
                <span 
                  className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300
                              md:w-12 md:h-12 ${
                                openIndex === index 
                                  ? "bg-[#fc4e87] text-white" 
                                  : "bg-[#fff1f8] text-[#fc4e87]"
                              }`}
                  aria-hidden="true"
                >
                  {openIndex === index ? (
                    <FiMinus className="text-2xl" />
                  ) : (
                    <FiPlus className="text-2xl" />
                  )}
                </span>
              </button>
            </h3>

            <div
              id={`faq-panel-${index}`}
              role="region"
              aria-labelledby={`faq-button-${index}`}
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-6 pt-2 text-gray-700">
                <p className="text-md md:text-xl leading-relaxed whitespace-pre-line">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      

    </section>
  );
};

export default FaqAccordion;