// src/app/(default)/subscriptions/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Your Store',
    default: 'Subscription Plans | Your Store',
  },
  description: 'Browse our selection of subscription plans for premium benefits and services.',
}

export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="min-h-screen bg-white relative overflow-hidden">
        {/* Global bubble elements that appear throughout the layout */}
        <div className="fixed top-0 right-0 w-96 h-96 rounded-full bg-[#ffe6f0] opacity-10 blur-3xl"></div>
        <div className="fixed bottom-0 left-0 w-64 h-64 rounded-full bg-[#f9dde5] opacity-5 blur-2xl"></div>
        <div className="fixed top-1/3 left-1/4 w-32 h-32 rounded-full bg-[#ffb3c1] opacity-10 blur-xl"></div>
        <div className="fixed bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-[#f0f7ff] opacity-10 blur-3xl"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </>
  )
}