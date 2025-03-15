// src/components/AddToCartButton.tsx
'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

interface AddToCartButtonProps {
  productId: string
  productTitle: string
  productPrice: number
  productImage?: string
  quantity?: number
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function AddToCartButton({
  productId,
  productTitle,
  productPrice,
  productImage,
  quantity = 1,
  variant = 'primary',
  size = 'medium',
  className = '',
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  const handleAddToCart = () => {
    addToCart({
      id: productId,
      name: productTitle,
      price: productPrice,
      quantity,
      image: productImage,
    })

    // Show success animation
    setIsAdded(true)
    setTimeout(() => {
      setIsAdded(false)
    }, 1500)
  }

  // Variant styles
  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-900 hover:bg-black text-white',
    outline: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300',
  }

  // Size styles
  const sizeStyles = {
    small: 'py-2 px-3 text-sm',
    medium: 'py-3 px-6 text-base',
    large: 'py-4 px-8 text-lg',
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdded}
      className={`
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        rounded-lg font-medium flex items-center justify-center gap-2 transition-all
        ${className}
      `}
    >
      {isAdded ? (
        <>
          <Check size={size === 'small' ? 16 : 20} />
          <span>Added to Cart</span>
        </>
      ) : (
        <>
          <ShoppingCart size={size === 'small' ? 16 : 20} />
          <span>Add to Cart</span>
        </>
      )}
    </button>
  )
}