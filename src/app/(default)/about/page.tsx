// src/app/(default)/about/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
  title: 'About Us | Lily\'s',
  description: 'Learn about Lily\'s, our mission, and how we provide expert healthcare through online consultations.',
};

// Define proper interfaces for our component props
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Feature Card Component
const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 transition-all hover:shadow-xl">
    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pink-500 text-white mb-5">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
    <p className="mt-2 text-base text-black">{description}</p>
  </div>
);

export default function AboutPage() {
  // Define feature content
  const features: FeatureCardProps[] = [
    {
      title: "Medical Expertise",
      description: "Our treatments are backed by science and prescribed by licensed healthcare providers who specialize in women's health.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      )
    },
    {
      title: "Personalized Plans",
      description: "Every individual's health journey is different—we create a strategy tailored to your body and goals for optimal results.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      )
    },
    {
      title: "Convenience & Accessibility",
      description: "With our telehealth platform, you can access effective health solutions from the comfort of your home, on your schedule.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
        </svg>
      )
    }
  ];

  return (
    <main className="bg-white">
      {/* Hero Section - Updated with standardized styling */}
      <div style={{ background: "#F7F7F7" }}>
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 
              className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
              style={{ color: "#e63946" }}
            >
              About Lily&apos;s
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-700">
              Healthcare designed for women, delivered to your door.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Our Mission
              </h2>
              <p className="mt-4 text-lg text-black">
                At Lily's, we're on a mission to make medically guided weight loss simple, supportive, and accessible for every woman.
              </p>
              <p className="mt-4 text-lg text-black">
                We understand that lasting change starts with trusted support, which is why we've built an easy-to-use platform that connects women with licensed doctors through secure telehealth consultations. While Lily's doesn't provide medical care directly, we work hand-in-hand with <strong>Qualiphy</strong>, a reputable telehealth provider, to ensure you receive expert care tailored to your goals.
              </p>
              <p className="mt-4 text-lg text-black">
                Our focus is on <strong>clinically backed weight loss solutions</strong>, including prescriptions like GLP-1 medications (such as semaglutide or tirzepatide), all prescribed by licensed professionals when appropriate. Through our website, you can explore your options, complete an intake, and get connected to the care you need—all from the comfort of home.
              </p>
              <p className="mt-4 text-lg text-black">
                We're here to guide you every step of the way, from discovery to results. At Lily's, you're not just starting a program—you're beginning a journey with the right support behind you.
              </p>
              <p className="mt-4 text-lg text-black">
                Qualiphy Email: contact@qualiphy.me
              </p>
              <p className="mt-4 text-lg text-black">
              Qualiphy Phone: +1 (424) 257-3977
              </p>
              <div className="mt-6">
                <Link href="/subscriptions" className="inline-flex px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50">
                  Book a Consultation
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <div className="relative h-64 w-full bg-gradient-to-r from-pink-100 to-pink-200 flex items-center justify-center">
                  <div className="absolute inset-0 bg-pink-600 opacity-10"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Us?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-black lg:mx-auto">
              We believe in accessible, personalized healthcare for all women.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}