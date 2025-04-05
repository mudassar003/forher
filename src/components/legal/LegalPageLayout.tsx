// src/components/legal/LegalPageLayout.tsx
import React, { ReactNode } from 'react';
import Link from 'next/link';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
  relatedLinks?: Array<{
    href: string;
    label: string;
  }>;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  lastUpdated,
  children,
  relatedLinks = []
}) => {
  // Default related links if none provided
  const defaultLinks = [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-of-service', label: 'Terms of Service' },
    { href: '/cookie-policy', label: 'Cookie Policy' },
    { href: '/ccpa-notice', label: 'CCPA Notice' },
  ];

  // Filter out the current page from related links
  const links = relatedLinks.length > 0 
    ? relatedLinks 
    : defaultLinks.filter(link => !link.href.includes(title.toLowerCase().replace(/\s+/g, '-')));

  return (
    <main className="bg-white">
      {/* Hero Section - Styled like the About page */}
      <div style={{ background: "#F7F7F7" }}>
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 
              className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
              style={{ color: "#e63946" }}
            >
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose max-w-none text-gray-700">
          <p className="text-lg">
            Last Updated: {lastUpdated}
          </p>
          
          {children}
          
          {/* Related Policies Section */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-4">Related Policies</h3>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-blue-600 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LegalPageLayout;