// src/app/(default)/products/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Your Store',
    default: 'Products | Your Store',
  },
  description: 'Browse our selection of high-quality products.',
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* 
        You could add category navigation or breadcrumbs here that
        would be consistent across all product pages
      */}
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    </>
  )
}