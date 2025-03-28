// src/app/admin/components/AdminHeader.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminHeaderProps {
  title: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Subscriptions', href: '/admin/subscriptions' },
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">{title}</h1>
        <Link 
          href="/"
          className="text-pink-600 hover:text-pink-800 text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Site
        </Link>
      </div>
      
      <nav className="flex space-x-1 overflow-x-auto pb-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-pink-100 text-pink-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="h-px bg-gray-200 mt-4"></div>
    </div>
  );
};

export default AdminHeader;