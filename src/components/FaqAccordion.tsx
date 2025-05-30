// src/components/FaqAccordion.tsx
"use client"; 

import { useState, useRef, useEffect } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import useTranslations from "@/hooks/useTranslations";

// Strict TypeScript interfaces
interface FaqItem {
  questionKey: string;
  answerKey: string;
}

interface FaqAccordionProps {
  className?: string;
}

// FAQ data with translation keys
const faqData: FaqItem[] = [
  {
    questionKey: "whatIsLilys.question",
    answerKey: "whatIsLilys.answer",
  },
  {
    questionKey: "howItWorks.question",
    answerKey: "howItWorks.answer",
  },
  {
    questionKey: "whoAreProviders.question",
    answerKey: "whoAreProviders.answer",
  },
];

const FaqAccordion: React.FC<FaqAccordionProps> = ({ className = "" }) => {
  const { t } = useTranslations();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const accordionRefs = useRef<Array<HTMLDivElement | null>>([]);
  
  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleAccordion(index);
    }
  };

  const toggleAccordion = (index: number): void => {
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
    <div className={`max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6 ${className}`}>
      <h2 
        className="text-center text-3xl md:text-5xl font-bold mb-4"
        style={{ color: "#e63946" }}
      >
        {t('faqAccordion.title')}
      </h2>
      
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
                aria-expanded={openIndex === index}
                aria-controls={`faq-panel-${index}`}
                className="w-full flex justify-between items-center px-6 py-5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink-400"
                onClick={() => toggleAccordion(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                type="button"
              >
                <span className="text-2xl md:text-4xl font-normal text-left text-gray-800 pr-4">
                  {t(`faqAccordion.questions.${item.questionKey}`)}
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
                  {t(`faqAccordion.questions.${item.answerKey}`)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqAccordion;