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
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    </>
  )
}