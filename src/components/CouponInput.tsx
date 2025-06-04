// src/components/CouponInput.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
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

interface AppliedCouponData {
  code: string;
  discountedPrice: number;
  discountAmount: number;
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
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponData | null>(null);
  const [showInput, setShowInput] = useState<boolean>(false);
  
  const { t, currentLanguage } = useTranslations();
  
  // Reset coupon when variant changes
  useEffect(() => {
    if (appliedCoupon) {
      handleRemoveCoupon();
    }
    // Clear any existing input when variant changes
    setCouponCode('');
    setError('');
    setShowInput(false);
  }, [variantKey, subscriptionId]); // Also reset when subscription changes
  
  const translations = {
    haveCoupon: currentLanguage === 'es' ? '¿Tienes un código de cupón?' : 'Have a coupon code?',
    enterCode: currentLanguage === 'es' ? 'Ingresa tu código' : 'Enter your code',
    apply: currentLanguage === 'es' ? 'Aplicar' : 'Apply',
    remove: currentLanguage === 'es' ? 'Quitar' : 'Remove',
    validating: currentLanguage === 'es' ? 'Validando...' : 'Validating...',
    couponApplied: currentLanguage === 'es' ? 'Cupón aplicado' : 'Coupon applied',
    youSave: currentLanguage === 'es' ? 'Ahorras' : 'You save',
    cancel: currentLanguage === 'es' ? 'Cancelar' : 'Cancel',
    pleaseEnterCode: currentLanguage === 'es' ? 'Por favor ingresa un código' : 'Please enter a code',
    invalidCode: currentLanguage === 'es' ? 'Código inválido' : 'Invalid code',
    errorValidating: currentLanguage === 'es' ? 'Error al validar el cupón' : 'Error validating coupon',
    couponCodePlaceholder: currentLanguage === 'es' ? 'CÓDIGO' : 'COUPON CODE',
    forThisVariant: currentLanguage === 'es' ? 'para esta variante' : 'for this variant',
    forThisPlan: currentLanguage === 'es' ? 'para este plan' : 'for this plan',
  };
  
  const handleValidateCoupon = useCallback(async (): Promise<void> => {
    if (!couponCode.trim()) {
      setError(translations.pleaseEnterCode);
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
          code: couponCode.trim().toUpperCase(),
          subscriptionId,
          variantKey,
        }),
        credentials: 'include'
      });
      
      const result: ValidateCouponResponse = await response.json();
      
      if (result.success && result.isValid && 
          result.discountedPrice !== undefined && 
          result.discountAmount !== undefined) {
        
        const appliedData: AppliedCouponData = {
          code: couponCode.trim().toUpperCase(),
          discountedPrice: result.discountedPrice,
          discountAmount: result.discountAmount,
        };
        
        setAppliedCoupon(appliedData);
        onCouponApplied(appliedData.code, appliedData.discountedPrice, appliedData.discountAmount);
        setShowInput(false);
        setCouponCode('');
      } else {
        setError(result.error || translations.invalidCode);
      }
    } catch (err) {
      console.error('Error validating coupon:', err);
      setError(translations.errorValidating);
    } finally {
      setIsValidating(false);
    }
  }, [couponCode, subscriptionId, variantKey, onCouponApplied, translations]);
  
  const handleRemoveCoupon = useCallback((): void => {
    setAppliedCoupon(null);
    setCouponCode('');
    setError('');
    setShowInput(false);
    onCouponRemoved();
  }, [onCouponRemoved]);
  
  const handleToggleInput = useCallback((): void => {
    if (showInput) {
      setShowInput(false);
      setCouponCode('');
      setError('');
    } else {
      setShowInput(true);
    }
  }, [showInput]);
  
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !isValidating && couponCode.trim()) {
      e.preventDefault();
      handleValidateCoupon();
    } else if (e.key === 'Escape') {
      handleToggleInput();
    }
  }, [isValidating, couponCode, handleValidateCoupon, handleToggleInput]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.toUpperCase();
    setCouponCode(value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  }, [error]);
  
  return (
    <div className={`w-full ${className}`}>
      <AnimatePresence mode="wait">
        {!appliedCoupon && !showInput && (
          <motion.div
            key="show-coupon-button"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={handleToggleInput}
              className="flex items-center gap-2 text-sm text-[#e63946] hover:text-[#d52d3a] underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#e63946] focus:ring-opacity-50 rounded px-1 py-1"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
              {translations.haveCoupon}
            </button>
          </motion.div>
        )}
        
        {!appliedCoupon && showInput && (
          <motion.div
            key="coupon-input-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {translations.enterCode}
                </h4>
                <button
                  onClick={handleToggleInput}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                  aria-label={translations.cancel}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={translations.couponCodePlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e63946] focus:border-transparent uppercase text-sm font-mono"
                    disabled={isValidating}
                    maxLength={20}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <button
                  onClick={handleValidateCoupon}
                  disabled={isValidating || !couponCode.trim()}
                  className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                    isValidating || !couponCode.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#e63946] text-white hover:bg-[#d52d3a] shadow-sm hover:shadow-md'
                  }`}
                  type="button"
                >
                  {isValidating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {translations.validating}
                    </div>
                  ) : (
                    translations.apply
                  )}
                </button>
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700"
                >
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </motion.div>
              )}
              
              <p className="text-xs text-gray-500">
                {variantKey 
                  ? `${translations.enterCode} ${translations.forThisVariant}` 
                  : `${translations.enterCode} ${translations.forThisPlan}`
                }
              </p>
            </div>
          </motion.div>
        )}
        
        {appliedCoupon && (
          <motion.div
            key="applied-coupon-display"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-green-50 border-2 border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    {translations.couponApplied}
                  </p>
                  <p className="text-lg font-bold text-green-900">
                    {appliedCoupon.code}
                  </p>
                  <p className="text-sm text-green-700">
                    {translations.youSave} <span className="font-semibold">${appliedCoupon.discountAmount.toFixed(2)}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-sm text-green-700 hover:text-green-900 underline transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded px-2 py-1"
                type="button"
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