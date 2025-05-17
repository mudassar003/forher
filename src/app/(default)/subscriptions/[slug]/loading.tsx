// src/app/(default)/subscriptions/[slug]/loading.tsx
import React from 'react';

export default function SubscriptionLoading() {
  return (
    <div className="bg-white min-h-screen pt-10">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb loading skeleton */}
          <div className="bg-gray-100 h-8 w-1/3 rounded-md mb-10 animate-pulse"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left column loading skeletons */}
            <div>
              <div className="h-10 bg-gray-200 w-3/4 rounded-md mb-6 animate-pulse"></div>
              <div className="h-8 bg-gray-200 w-1/4 rounded-md mb-8 animate-pulse"></div>
              
              {/* Image placeholder */}
              <div className="w-full h-[400px] bg-gray-200 rounded-lg mb-8 animate-pulse"></div>
              
              {/* Description placeholders */}
              <div className="h-8 bg-gray-200 w-1/3 rounded-md mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md w-4/5 animate-pulse"></div>
              </div>
            </div>
            
            {/* Right column loading skeletons */}
            <div>
              <div className="bg-gray-100 rounded-xl p-8 mb-8">
                <div className="h-8 bg-gray-200 w-2/5 rounded-md mb-6 animate-pulse"></div>
                
                {/* Features placeholders */}
                <div className="space-y-4 mb-8">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-gray-200 mr-3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
                
                {/* CTA placeholder */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="h-12 bg-gray-200 rounded-full w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-1/2 mx-auto mt-4 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}