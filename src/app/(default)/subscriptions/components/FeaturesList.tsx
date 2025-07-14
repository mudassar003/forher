// src/app/(default)/subscriptions/components/FeaturesList.tsx
import { Translations } from '@/types/subscriptionDetails';

interface FeaturesListProps {
  features: Array<{ featureText: string }>;
  translations: Translations;
}

export const FeaturesList: React.FC<FeaturesListProps> = ({
  features,
  translations
}) => {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-3">
        {translations.included}
      </h3>
      {features.map((feature, index) => (
        <div key={index} className="flex items-start">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center mt-0.5 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#e63946" className="w-4 h-4">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-gray-700">{feature.featureText}</div>
        </div>
      ))}
    </div>
  );
};