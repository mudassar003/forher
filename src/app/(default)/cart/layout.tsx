import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart - Your Store',
  description: 'View and manage your shopping cart',
};

interface CartLayoutProps {
  children: React.ReactNode;
}

export default function CartLayout({ children }: CartLayoutProps) {
  return <>{children}</>;
}