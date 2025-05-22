// src/components/DebugSubscriptionData.tsx
'use client';

interface DebugSubscriptionDataProps {
  subscriptions: any[];
  title?: string;
}

const DebugSubscriptionData: React.FC<DebugSubscriptionDataProps> = ({ 
  subscriptions, 
  title = "Debug Subscription Data" 
}) => {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg my-4 text-xs">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <div className="space-y-2">
        <p><strong>Total Subscriptions:</strong> {subscriptions.length}</p>
        {subscriptions.map((subscription, index) => (
          <div key={subscription._id || index} className="border-l-2 border-blue-500 pl-2">
            <p><strong>#{index + 1}: {subscription.title}</strong></p>
            <p>ID: {subscription._id}</p>
            <p>Has Variants: {subscription.hasVariants ? 'YES' : 'NO'}</p>
            <p>Variant Count: {subscription.variants?.length || 0}</p>
            {subscription.variants && subscription.variants.length > 0 && (
              <div className="ml-2 mt-1">
                <p className="font-medium">Variants:</p>
                {subscription.variants.map((variant: any, vIndex: number) => (
                  <div key={variant._key || vIndex} className="ml-2 text-xs">
                    <p>• {variant.title} - ${variant.price} ({variant.billingPeriod})</p>
                    <p>  Key: {variant._key}, Dosage: {variant.dosageAmount} {variant.dosageUnit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugSubscriptionData;