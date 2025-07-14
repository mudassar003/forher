// src/app/(default)/subscriptions/components/DescriptionSection.tsx
import PortableText from '@/components/PortableText';
import { Translations } from '@/types/subscriptionDetails';

interface DescriptionSectionProps {
  description: any;
  translations: Translations;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  description,
  translations
}) => {
  if (!description) return null;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {translations.description}
      </h3>
      <div className="prose max-w-none">
        <PortableText value={description} className="text-gray-700" />
      </div>
    </div>
  );
};