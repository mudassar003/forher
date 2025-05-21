// src/app/(default)/about/page.tsx
import { Metadata } from 'next';
import React from 'react';
import PageHeader from '@/components/PageHeader';

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
      {/* Using our reusable PageHeader component */}
      <PageHeader 
        title="About Lily's"
        subtitle="Empowering women with personalized healthcare solutions and expert medical guidance."
      />
      
      {/* Mission Section */}
      <div className="py-16 bg-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-8">
            Our Mission
          </h2>
          <div className="prose prose-lg max-w-none">
            <p>
              At Lily's, we're on a mission to make medically guided weight loss simple, supportive, and accessible for every woman.
            </p>
            <p>
              We understand that lasting change starts with trusted support, which is why we've built an easy-to-use platform that connects women with licensed doctors through secure telehealth consultations. While Lily's doesn't provide medical care directly, we work hand-in-hand with <strong>Qualiphy</strong>, a reputable telehealth provider, to ensure you receive expert care tailored to your goals.
            </p>
            <p>
              Our focus is on <strong>clinically backed weight loss solutions</strong>, including prescriptions like GLP-1 medications (such as semaglutide or tirzepatide), all prescribed by licensed professionals when appropriate. Through our website, you can explore your options, complete an intake, and get connected to the care you need—all from the comfort of home.
            </p>
            <p>
              We're here to guide you every step of the way, from discovery to results. At Lily's, you're not just starting a program—you're beginning a journey with the right support behind you.
            </p>
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h3>
              <p>Qualiphy Email: contact@qualiphy.me</p>
              <p>Qualiphy Phone: +1 (424) 257-3977</p>
              <p>Qualiphy Address: 13 N San Vicente Blvd, Beverly Hills, CA 90211</p>
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