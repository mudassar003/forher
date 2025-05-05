//src/app/%28default%29/subscriptions/components/SubscriptionCard.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscriptionPurchase } from '@/hooks/useSubscriptionPurchase';
import { useAuthStore } from '@/store/authStore';
import { SubscriptionFeature } from '@/types/subscription-page';
import useTranslations from '@/hooks/useTranslations';

interface SubscriptionCardProps {
  id: string;
  title: string;
  titleEs?: string;
  description?: string;
  descriptionEs?: string;
  price: number;
  billingPeriod: string;
  features: SubscriptionFeature[];
  featuresEs?: SubscriptionFeature[];
  categories?: Array<{
    _id: string;
    title: string;
    titleEs?: string;
  }>;
  cardType?: 'basic' | 'standard' | 'premium';
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  id,
  title,
  titleEs,
  description,
  descriptionEs,
  price,
  billingPeriod,
  features = [],
  featuresEs = [],
  categories,
  cardType = 'basic' // Default to basic styling
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { user, isAuthenticated, checkSession } = useAuthStore();
  const { purchaseSubscription, isLoading, error } = useSubscriptionPurchase();
  const router = useRouter();
  const { t, currentLanguage } = useTranslations();
  
  // Check auth state when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      checkSession();
    }
  }, [isAuthenticated, checkSession]);

  // Get the content based on current language
  const getLocalizedTitle = (): string => {
    if (currentLanguage === 'es' && titleEs) {
      return titleEs;
    }
    return title;
  };
  
  const getLocalizedDescription = (): string | undefined => {
    if (currentLanguage === 'es' && descriptionEs) {
      return descriptionEs;
    }
    return description;
  };
  
  const getLocalizedFeatures = (): SubscriptionFeature[] => {
    if (currentLanguage === 'es' && featuresEs && featuresEs.length > 0) {
      return featuresEs;
    }
    return features;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine proper billing period display
  const getBillingPeriodDisplay = (): string => {
    if (currentLanguage === 'es') {
      switch (billingPeriod.toLowerCase()) {
        case 'monthly':
          return '/mes';
        case 'quarterly':
          return '/trimestre';
        case 'annually':
          return '/año';
        default:
          return `/${billingPeriod}`;
      }
    } else {
      switch (billingPeriod.toLowerCase()) {
        case 'monthly':
          return '/month';
        case 'quarterly':
          return '/quarter';
        case 'annually':
          return '/year';
        default:
          return `/${billingPeriod}`;
      }
    }
  };

  // Handle the subscription purchase or redirect to login
  const handleSubscribe = async (): Promise<void> => {
    if (isProcessing || isLoading) return;
    
    // Store current path in sessionStorage
    const currentPath = window.location.pathname;
    sessionStorage.setItem('subscriptionReturnPath', currentPath);
    
    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      // Save intended subscription ID to purchase after login
      sessionStorage.setItem('pendingSubscriptionId', id);
      const returnUrl = encodeURIComponent('/subscriptions');
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Store appointment page as the return URL after successful purchase
      sessionStorage.setItem('loginReturnUrl', '/appointment');
      
      const result = await purchaseSubscription(id);
      
      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      }
    } catch (err) {
      console.error('Failed to initiate subscription purchase:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get localized subscription button text
  const getSubscribeButtonText = (): string => {
    if (isProcessing || isLoading) {
      return currentLanguage === 'es' ? 'Procesando...' : 'Processing...';
    }
    
    if (isAuthenticated) {
      return currentLanguage === 'es' ? 'Suscribirse Ahora' : 'Subscribe Now';
    }
    
    return currentLanguage === 'es' ? 'Iniciar Sesión para Suscribirse' : 'Sign In to Subscribe';
  };

  return (
    <div 
      className="plan-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`plan-header ${cardType}-header`}>
        <div className="plan-name">{getLocalizedTitle().toUpperCase()}</div>
        <div className="plan-price">{formatCurrency(price)}<span className="plan-period">{getBillingPeriodDisplay()}</span></div>
      </div>
      
      <div className="plan-features">
        {getLocalizedFeatures().filter(feature => feature && feature.featureText).map((feature, index) => (
          <div key={index} className="feature-item">
            <div className={`feature-icon ${cardType}-icon`}>✓</div>
            <div className="feature-text">{feature.featureText}</div>
          </div>
        ))}
      </div>
      
      <div className="plan-cta">
        <button
          onClick={handleSubscribe}
          disabled={isProcessing || isLoading}
          className={`subscribe-btn btn-${cardType} ${(isProcessing || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {getSubscribeButtonText()}
        </button>
        
        {error && (
          <p className="mt-2 text-xs text-red-600 text-center">
            {error}
          </p>
        )}
      </div>
      
      <div className={`plan-footer ${cardType}-footer`}></div>
      
      <style jsx>{`
        .plan-card {
          background-color: white;
          border-radius: 10px;
          overflow: hidden;
          width: 100%;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
        }
        
        .plan-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(230, 57, 70, 0.1);
        }
        
        .plan-header {
          padding: 20px;
          text-align: center;
          color: white;
          position: relative;
        }
        
        .plan-header::after {
          content: "";
          position: absolute;
          height: 20px;
          width: 20px;
          background-color: white;
          left: 0;
          bottom: -10px;
          transform: rotate(45deg);
        }
        
        .plan-header::before {
          content: "";
          position: absolute;
          height: 20px;
          width: 20px;
          background-color: white;
          right: 0;
          bottom: -10px;
          transform: rotate(45deg);
        }
        
        .basic-header {
          background-color: #d81159; /* Dark pink/rose */
        }
        
        .premium-header {
          background: linear-gradient(90deg, #e63946 0%, #ff4d6d 100%); /* Red to pink gradient */
        }
        
        .standard-header {
          background-color: #ff4d6d; /* Pink */
        }
        
        .plan-name {
          font-size: 26px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .plan-price {
          font-size: 24px;
          font-weight: 500;
        }
        
        .plan-period {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .plan-features {
          padding: 30px 25px;
          flex-grow: 1;
        }
        
        .feature-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;
          color: #666;
        }
        
        .feature-icon {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          margin-right: 12px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        }
        
        .basic-icon {
          background-color: #d81159; /* Dark pink/rose */
        }
        
        .premium-icon {
          background-color: #e63946; /* Red */
        }
        
        .standard-icon {
          background-color: #ff4d6d; /* Pink */
        }
        
        .feature-text {
          font-size: 15px;
          line-height: 1.4;
        }
        
        .plan-footer {
          height: 20px;
        }
        
        .basic-footer {
          background-color: #d81159; /* Dark pink/rose */
        }
        
        .premium-footer {
          background: linear-gradient(90deg, #e63946 0%, #ff4d6d 100%); /* Red to pink gradient */
        }
        
        .standard-footer {
          background-color: #ff4d6d; /* Pink */
        }
        
        .plan-cta {
          padding: 0 25px 25px;
          text-align: center;
        }
        
        .subscribe-btn {
          display: inline-block;
          width: 100%;
          padding: 12px 0;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          border: none;
        }
        
        .btn-basic {
          background-color: white;
          color: #d81159;
          border: 1px solid #d81159;
        }
        
        .btn-basic:hover {
          background-color: #fdf2f7;
          transform: translateY(-2px);
        }
        
        .btn-premium {
          background: linear-gradient(90deg, #e63946 0%, #ff4d6d 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(230, 57, 70, 0.2);
        }
        
        .btn-premium:hover {
          box-shadow: 0 6px 20px rgba(230, 57, 70, 0.3);
          transform: translateY(-2px);
        }
        
        .btn-standard {
          background-color: white;
          color: #ff4d6d;
          border: 1px solid #ff4d6d;
        }
        
        .btn-standard:hover {
          background-color: #fff5f7;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default SubscriptionCard;