"use client"; 

import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

const faqData = [
  {
    question: "What is Hers?",
    answer: `Hers is a 100% online platform with over 1 million subscribers that connects patients to licensed 
    healthcare professionals in all 50 states. We offer support for weight loss, hair regrowth, mental health, 
    and skincare.

    Through our simple online process you can connect with licensed medical providers who can 
    recommend customized treatment plans including prescription treatments, if appropriate, shipped 
    right to your door.`,
  },
  {
    question: "How does Hers work?",
    answer: `Hers works by connecting you to healthcare professionals through an easy online process. 
    You fill out a health questionnaire, and a licensed provider will review it to recommend personalized 
    treatments. If prescribed, your treatment is delivered directly to your door.`,
  },
  {
    question: "Who are the providers at Hers?",
    answer: `Hers partners with licensed healthcare professionals who specialize in weight loss, hair regrowth, 
    mental health, and skincare. These providers are fully licensed and experienced in delivering online 
    healthcare services.`,
  },
];

const FaqAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {faqData.map((item, index) => (
        <div key={index} className="border-b border-gray-200">
          <button
            className="w-full flex justify-between items-center py-6"
            onClick={() => toggleAccordion(index)}
          >
            <h2 className="text-4xl font-normal text-left">
              {item.question}
            </h2>
            <span className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full transition-all duration-200 hover:bg-black hover:text-white hover:w-14 hover:h-14">
              {openIndex === index ? (
                <FiMinus className="text-4xl" />
              ) : (
                <FiPlus className="text-4xl" />
              )}
            </span>
          </button>

          {openIndex === index && (
            <div className="pb-6 text-gray-700">
              <p className="text-md leading-relaxed whitespace-pre-line">
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FaqAccordion;
