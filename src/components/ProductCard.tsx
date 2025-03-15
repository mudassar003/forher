// src/components/ProductCard.tsx
'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    slug: { current: string };
    price: number;
    compareAtPrice?: number;
    isOnSale: boolean;
    mainImageUrl?: string;
    categories?: { 
      _id: string; 
      title: string; 
      slug: { current: string } 
    }[];
  };
  variant?: 'default' | 'compact';
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: product._id,
      name: product.title,
      price: product.price,
      quantity: 1,
      image: product.mainImageUrl
    });
  };

  if (variant === 'compact') {
    return (
      <Link 
        href={`/products/${product.slug.current}`}
        className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
          {product.mainImageUrl && (
            <Image
              src={product.mainImageUrl}
              alt={product.title}
              fill
              sizes="64px"
              className="object-cover"
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {product.title}
          </h3>
          
          <div className="flex items-center">
            {product.compareAtPrice && product.isOnSale ? (
              <>
                <span className="text-sm text-indigo-600 font-medium">${product.price.toFixed(2)}</span>
                <span className="text-xs text-gray-500 line-through ml-1">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium">${product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    );
  }
  
  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug.current}`}>
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
          <div className="relative h-64 w-full bg-gray-100">
            {product.mainImageUrl && (
              <Image
                src={product.mainImageUrl}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            
            {product.isOnSale && (
              <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-bold uppercase rounded-full px-3 py-1">
                Sale
              </div>
            )}
            
            {/* Quick actions overlay */}
            <div className={`absolute bottom-0 left-0 right-0 bg-white bg-opacity-95 py-2 px-3 flex justify-between transition-transform duration-200 ${
              isHovered ? 'translate-y-0' : 'translate-y-full'
            }`}>
              <button 
                onClick={handleAddToCart}
                className="text-gray-800 hover:text-indigo-600 p-1 transition-colors"
                aria-label="Add to cart"
              >
                <ShoppingCart size={20} />
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Handle wishlist logic
                }}
                className="text-gray-800 hover:text-indigo-600 p-1 transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart size={20} />
              </button>
            </div>
          </div>
          
          <div className="p-4 flex flex-col flex-grow">
            {product.categories && product.categories.length > 0 && (
              <div className="mb-1">
                <span className="text-xs text-gray-500">
                  {product.categories[0].title}
                </span>
              </div>
            )}
            
            <h3 className="font-medium text-base mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[2.5rem]">
              {product.title}
            </h3>
            
            <div className="flex items-center mt-auto">
              {product.compareAtPrice && product.isOnSale ? (
                <>
                  <span className="text-indigo-600 font-medium">${product.price.toFixed(2)}</span>
                  <span className="text-gray-500 line-through ml-2 text-sm">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="font-medium">${product.price.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}