// src/app/(default)/subscriptions/components/SubscriptionBreadcrumb.tsx
import Link from 'next/link';
import { Translations } from '@/types/subscriptionDetails';

interface SubscriptionBreadcrumbProps {
  translations: Translations;
  title: string;
}

export const SubscriptionBreadcrumb: React.FC<SubscriptionBreadcrumbProps> = ({
  translations,
  title
}) => {
  return (
    <div className="bg-gray-50 py-4">
      <div className="container mx-auto px-4">
        <nav className="flex text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            {translations.home}
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link href="/subscriptions" className="text-gray-500 hover:text-gray-700">
            {translations.subscriptions}
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-900 font-medium">{title}</span>
        </nav>
      </div>
    </div>
  );
};