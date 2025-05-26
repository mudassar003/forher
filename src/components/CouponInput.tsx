// src/components/CouponInput.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useTranslations from '@/hooks/useTranslations';
import { ValidateCouponResponse } from '@/types/coupon';

interface CouponInputProps {
  subscriptionId: string;
  variantKey?: string;
  originalPrice: number;
  onCouponApplied: (couponCode: string, discountedPrice: number, discountAmount: number) => void;
  onCouponRemoved: () => void;
  className?: string;
}

const CouponInput: React.FC<CouponInputProps> = ({
  subscriptionId,
  variantKey,
  originalPrice,
  onCouponApplied,
  onCouponRemoved,
  className = ''
}) => {
  const [couponCode, setCouponCode] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountedPrice: number;
    discountAmount: number;
  } | null>(null);
  const [showInput, setShowInput] = useState<boolean>(false);
  
  const { t, currentLanguage } = useTranslations();
  
  // Reset coupon when variant changes
  useEffect(() => {
    if (appliedCoupon) {
      handleRemoveCoupon();
    }
  }, [variantKey]);
  
  const translations = {
    haveCoupon: currentLanguage === 'es' ? '¿Tienes un código de cupón?' : 'Have a coupon code?',
    enterCode: currentLanguage === 'es' ? 'Ingresa tu código' : 'Enter your code',
    apply: currentLanguage === 'es' ? 'Aplicar' : 'Apply',
    remove: currentLanguage === 'es' ? 'Quitar' : 'Remove',
    validating: currentLanguage === 'es' ? 'Validando...' : 'Validating...',
    couponApplied: currentLanguage === 'es' ? 'Cupón aplicado' : 'Coupon applied',
    youSave: currentLanguage === 'es' ? 'Ahorras' : 'You save',
  };
  
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setError(currentLanguage === 'es' ? 'Por favor ingresa un código' : 'Please enter a code');
      return;
    }
    
    setIsValidating(true);
    setError('');
    
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          subscriptionId,
          variantKey,
        }),
      });
      
      const result: ValidateCouponResponse = await response.json();
      
      if (result.success && result.isValid && result.discountedPrice !== undefined && result.discountAmount !== undefined) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discountedPrice: result.discountedPrice,
          discountAmount: result.discountAmount,
        });
        onCouponApplied(couponCode.toUpperCase(), result.discountedPrice, result.discountAmount);
        setShowInput(false);
      } else {
        setError(result.error || (currentLanguage === 'es' ? 'Código inválido' : 'Invalid code'));
      }
    } catch (err) {
      setError(currentLanguage === 'es' ? 'Error al validar el cupón' : 'Error validating coupon');
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setError('');
    onCouponRemoved();
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating) {
      handleValidateCoupon();
    }
  };
  
  return (
    <div className={`${className}`}>
      <AnimatePresence mode="wait">
        {!appliedCoupon && !showInput && (
          <motion.button
            key="show-coupon"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => setShowInput(true)}
            className="text-sm text-[#e63946] hover:text-[#d52d3a] underline transition-colors"
          >
            {translations.haveCoupon}
          </motion.button>
        )}
        
        {!appliedCoupon && showInput && (
          <motion.div
            key="coupon-input"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder={translations.enterCode}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e63946] focus:border-transparent uppercase"
                disabled={isValidating}
              />
              <button
                onClick={handleValidateCoupon}
                disabled={isValidating || !couponCode.trim()}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isValidating || !couponCode.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#e63946] text-white hover:bg-[#d52d3a]'
                }`}
              >
                {isValidating ? translations.validating : translations.apply}
              </button>
            </div>
            
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-600"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}
        
        {appliedCoupon && (
          <motion.div
            key="applied-coupon"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 rounded-md p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {translations.couponApplied}: {appliedCoupon.code}
                  </p>
                  <p className="text-xs text-green-600">
                    {translations.youSave} ${appliedCoupon.discountAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-sm text-green-600 hover:text-green-800 underline"
              >
                {translations.remove}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponInput;