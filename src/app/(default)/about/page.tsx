// src/app/about/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Lily\'s',
  description: 'Learn about Lily\'s, our mission, and how we provide expert healthcare through online consultations.',
};

export default function AboutPage(): JSX.Element {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">About</span>
              <span className="block text-pink-600">Lily&apos;s</span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500 sm:max-w-3xl">
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
              <p className="mt-4 text-lg text-gray-500">
                At Lily&apos;s, we specialize in <strong>online consultations that bring expert healthcare directly to you—no waiting rooms, no hassle</strong>. Our telehealth platform allows individuals across the nation to <strong>access safe, effective treatments</strong> for <strong>weight loss, hair care, sexual wellness, and birth control</strong> from the comfort of their own home.
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
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              We believe in accessible, personalized healthcare for all women.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Medical Expertise */}
              <div className="bg-white rounded-lg shadow-lg p-6 transition-all hover:shadow-xl">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pink-500 text-white mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Medical Expertise</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our treatments are backed by science and prescribed by licensed healthcare providers who specialize in women&apos;s health.
                </p>
              </div>

              {/* Personalized Plans */}
              <div className="bg-white rounded-lg shadow-lg p-6 transition-all hover:shadow-xl">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pink-500 text-white mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Personalized Plans</h3>
                <p className="mt-2 text-base text-gray-500">
                  Every individual&apos;s health journey is different—we create a strategy tailored to <strong>your</strong> body and goals for optimal results.
                </p>
              </div>

              {/* Convenience & Accessibility */}
              <div className="bg-white rounded-lg shadow-lg p-6 transition-all hover:shadow-xl">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pink-500 text-white mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Convenience & Accessibility</h3>
                <p className="mt-2 text-base text-gray-500">
                  With our telehealth platform, you can access <strong>effective health solutions from the comfort of your home</strong>, on your schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl text-center mb-12">
            Our Services
          </h2>
          
          <div className="grid grid-cols-1 gap-y-8 gap-x-8 md:grid-cols-2">
            {/* Weight Loss */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Weight Loss</h3>
              </div>
              <p className="text-gray-600">
                Access personalized weight management solutions with medications, supplements, and ongoing support to help you achieve your goals.
              </p>
            </div>
            
            {/* Hair Care */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 11.5a3.5 3.5 0 1 1 3.5 3.5M12 8v3.5m2 3h1c1.9 0 3 1.3 3 3s-1.1 3-3 3h-5.5c-1.9 0-3-1.3-3-3s1.1-3 3-3H9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Hair Care</h3>
              </div>
              <p className="text-gray-600">
                Our hair loss treatments help women restore hair growth, increase thickness, and prevent further loss with clinically-proven solutions.
              </p>
            </div>
            
            {/* Sexual Wellness */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Sexual Wellness</h3>
              </div>
              <p className="text-gray-600">
                Address intimacy and sexual health concerns with compassionate care and effective treatments tailored to your needs.
              </p>
            </div>
            
            {/* Birth Control */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Birth Control</h3>
              </div>
              <p className="text-gray-600">
                Get convenient access to birth control prescriptions and family planning resources with ongoing support from our healthcare providers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-pink-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to take control of your health?</span>
            <span className="block text-pink-200">Start your journey today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/subscriptions" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-pink-600 bg-white hover:bg-pink-50">
                View Subscription Plans
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link href="/subscriptions" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800">
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slogans Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-base font-semibold text-pink-600 tracking-wide uppercase">Our Values</h2>
            <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
              Healthcare on your terms
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-pink-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-pink-600">1</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Accessible Care</h3>
              <p className="mt-2 text-base text-gray-500">
                &quot;Breaking barriers to women&apos;s healthcare, one consultation at a time.&quot;
              </p>
            </div>
            <div className="text-center">
              <div className="bg-pink-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-pink-600">2</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Privacy First</h3>
              <p className="mt-2 text-base text-gray-500">
                &quot;Your health journey, your private conversation.&quot;
              </p>
            </div>
            <div className="text-center">
              <div className="bg-pink-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-pink-600">3</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Your Schedule</h3>
              <p className="mt-2 text-base text-gray-500">
                &quot;Expert healthcare on your time, not ours.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}