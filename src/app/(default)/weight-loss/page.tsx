// Example page showing how to use the WeightLossSubscriptions component
// src/app/(default)/weight-loss/page.tsx

import { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import WeightLossSubscriptions from '@/components/WeightLossSubscriptions';
import HowItWorks from '@/components/HowItWorks';
import RotatingSection from '@/components/RotatingSection';
import NewHairLossSection from '@/components/NewHairLossSection';

export const metadata: Metadata = {
  title: 'Weight Loss Programs',
  description: 'Explore our specialized weight loss subscription plans designed for effective and sustainable weight management',
};

export default async function WeightLossPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative Bubbles - Top Section */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#ffe6f0] opacity-20 blur-3xl"></div>
      <div className="absolute top-40 right-0 w-96 h-96 rounded-full bg-[#f9dde5] opacity-30 blur-3xl"></div>
      <div className="absolute -top-10 right-1/4 w-40 h-40 rounded-full bg-[#ffb3c1] opacity-10 blur-2xl"></div>
      
      {/* Header Section */}
      <PageHeader 
        title="Weight Loss Programs"
        subtitle="Clinically-proven treatments to help you lose weight and keep it off"
      />

      {/* Rotating Section with BMI Calculator */}
      <RotatingSection />
      
      {/* Product Overview Section */}
      <NewHairLossSection />
      
      {/* How It Works Section */}
      <HowItWorks />
      
      {/* Subscription Plans Section */}
      <div className="relative py-12 bg-white">
        {/* Background bubbles */}
        <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-[#f0f7ff] opacity-30 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-[#ffeef2] opacity-40 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl font-bold mb-10 text-center" style={{ color: "#e63946" }}>
            Our Weight Loss Plans
          </h2>
          
          {/* Weight Loss Subscription Component */}
          <WeightLossSubscriptions />
        </div>
      </div>
      
      {/* Bottom bubbles */}
      <div className="absolute bottom-10 left-1/3 w-60 h-60 rounded-full bg-[#ffe6f0] opacity-30 blur-3xl"></div>
      <div className="absolute -bottom-20 right-1/4 w-48 h-48 rounded-full bg-[#f9dde5] opacity-20 blur-2xl"></div>
    </div>
  );
}