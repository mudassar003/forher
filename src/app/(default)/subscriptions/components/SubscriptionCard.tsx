//src/app/(default)/subscriptions/components/SubscriptionCard.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscriptionPurchase } from '@/hooks/useSubscriptionPurchase';
import { useAuthStore } from '@/store/authStore';
import { SubscriptionFeature, BlockContent } from '@/types/subscription-page';
import useTranslations from '@/hooks/useTranslations';
import Modal from '@/components/Modal';
import PortableText from '@/components/PortableText';

interface SubscriptionCardProps {
  id: string;
  title: string;
  titleEs?: string;
  description?: BlockContent[]; // Updated to BlockContent array
  descriptionEs?: BlockContent[]; // Updated to BlockContent array
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
  
  const getLocalizedDescription = (): BlockContent[] | undefined => {
    if (currentLanguage === 'es' && descriptionEs && descriptionEs.length > 0) {
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

  // Check if description exists and has content
  const hasDescription = (): boolean => {
    const localizedDescription = getLocalizedDescription();
    
    // First check if it exists and is an array
    if (!localizedDescription || !Array.isArray(localizedDescription) || localizedDescription.length === 0) {
      return false;
    }
    
    // Then check if any block has actual text content
    return localizedDescription.some(block => 
      block && block.children && Array.isArray(block.children) && 
      block.children.some(child => child && child.text && child.text.trim().length > 0)
    );
  };

  // Get view details button text
  const getViewDetailsText = (): string => {
    return currentLanguage === 'es' ? 'Ver Detalles' : 'View Details';
  };

  return (
    <>
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
          {hasDescription() && (
            <button
              onClick={() => setIsModalOpen(true)}
              className={`view-details-btn mb-3 ${cardType}-details-btn`}
              aria-label="View subscription details"
            >
              {getViewDetailsText()}
            </button>
          )}
          
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
            display: flex;
            flex-direction: column;
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
          
          .view-details-btn {
            display: inline-block;
            width: 100%;
            padding: 10px 0;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            border: 1px solid;
            background-color: white;
          }
          
          .basic-details-btn {
            color: #d81159;
            border-color: #d81159;
          }
          
          .basic-details-btn:hover {
            background-color: rgba(216, 17, 89, 0.05);
          }
          
          .premium-details-btn {
            color: #e63946;
            border-color: #e63946;
          }
          
          .premium-details-btn:hover {
            background-color: rgba(230, 57, 70, 0.05);
          }
          
          .standard-details-btn {
            color: #ff4d6d;
            border-color: #ff4d6d;
          }
          
          .standard-details-btn:hover {
            background-color: rgba(255, 77, 109, 0.05);
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

      {/* Description Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={getLocalizedTitle()}
          className="max-w-2xl"
        >
          <div className="subscription-details">
            {/* Description content */}
            <div className="description-content text-gray-700">
              {hasDescription() ? (
                <PortableText value={getLocalizedDescription() || []} />
              ) : null}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default SubscriptionCard;