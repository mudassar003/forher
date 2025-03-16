//src/app/about/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutUs() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero Section */}
      <div className="bg-blue-600 rounded-xl overflow-hidden mb-16">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              About Direct2Her
            </h1>
            <p className="text-blue-100 text-lg mb-8">
              We're on a mission to make healthcare accessible, convenient, and personalized for women everywhere.
            </p>
            <Link 
              href="/consultation" 
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium rounded-lg px-6 py-3 inline-block w-fit transition-colors">
              Book a Consultation
            </Link>
          </div>
          <div className="lg:w-1/2 h-64 lg:h-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-transparent lg:hidden" />
            <div className="relative h-full">
              <Image 
                src="/images/healthcare-team.jpg" 
                alt="Healthcare professionals" 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
          Our Mission
        </h2>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 mb-8">
            At Direct2Her, we specialize in <strong>online consultations that bring expert healthcare directly to you—no waiting rooms, no hassle</strong>. Our telehealth platform allows individuals across the nation to <strong>access safe, effective treatments</strong> for <strong>weight loss, hair care, sexual wellness, and birth control</strong> from the comfort of their own home.
          </p>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mt-12 mb-6">
          Why Choose Us?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Medical Expertise</h3>
            <p className="text-gray-600">
              Our treatments are backed by science and prescribed by licensed healthcare providers.
            </p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Personalized Plans</h3>
            <p className="text-gray-600">
              Every individual's journey is different—we create a strategy tailored to <strong>your</strong> body and goals.
            </p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Convenience & Accessibility</h3>
            <p className="text-gray-600">
              With our telehealth platform, you can access <strong>effective healthcare solutions from the comfort of your home</strong>.
            </p>
          </div>
        </div>
      </div>
      
      {/* Team Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-10 text-center">
          Meet Our Team
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mb-4 relative w-40 h-40 mx-auto">
              <div className="rounded-full overflow-hidden w-full h-full relative">
                <Image 
                  src="/images/doctor-1.jpg" 
                  alt="Dr. Emily Johnson" 
                  fill 
                  className="object-cover"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Dr. Emily Johnson</h3>
            <p className="text-blue-600 mb-2">Chief Medical Officer</p>
            <p className="text-gray-600 text-sm">
              Board-certified physician with over 15 years of experience in women's health.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mb-4 relative w-40 h-40 mx-auto">
              <div className="rounded-full overflow-hidden w-full h-full relative">
                <Image 
                  src="/images/doctor-2.jpg" 
                  alt="Dr. Michael Chen" 
                  fill 
                  className="object-cover"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Dr. Michael Chen</h3>
            <p className="text-blue-600 mb-2">Weight Management Specialist</p>
            <p className="text-gray-600 text-sm">
              Specialized in creating effective, sustainable weight management programs.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mb-4 relative w-40 h-40 mx-auto">
              <div className="rounded-full overflow-hidden w-full h-full relative">
                <Image 
                  src="/images/doctor-3.jpg" 
                  alt="Dr. Sarah Williams" 
                  fill 
                  className="object-cover"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Dr. Sarah Williams</h3>
            <p className="text-blue-600 mb-2">Sexual Health Specialist</p>
            <p className="text-gray-600 text-sm">
              Dedicated to providing compassionate care in sexual wellness and health.
            </p>
          </div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="bg-blue-50 py-16 px-4 rounded-xl mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-10 text-center">
            What Our Patients Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex text-yellow-400 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-700 mb-4">
                "Direct2Her has completely changed how I manage my health. The consultation was thorough, and my doctor created a plan specifically for my needs. I've seen amazing results!"
              </p>
              <p className="font-medium text-gray-900">Jessica T.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex text-yellow-400 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-700 mb-4">
                "The convenience of accessing quality healthcare from home is unmatched. I was skeptical at first, but my experience with Direct2Her has been nothing short of excellent."
              </p>
              <p className="font-medium text-gray-900">Amanda R.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Ready to Take the First Step?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of satisfied patients who've transformed their lives with our expert care and personalized treatment plans.
        </p>
        <Link 
          href="/consultation" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-8 py-3.5 inline-block transition-colors">
          Schedule Your Consultation Today
        </Link>
      </div>
    </div>
  );
}