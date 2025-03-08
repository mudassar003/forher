//src/app/products/[slug]/ProductClient.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import AddToCartButton from '@/components/AddToCartButton'
import { useCartStore } from '@/store/cartStore'

interface ProductClientProps {
  product: {
    _id: string
    title: string
    slug: { current: string }
    price: number
    compareAtPrice?: number
    isOnSale: boolean
    description: string
    details: any[]
    mainImageUrl?: string
    imageUrls: string[]
  }
}

export default function ProductClient({ product }: ProductClientProps) {
  const [quantity, setQuantity] = useState(1)
  const addToCart = useCartStore((state) => state.addToCart)
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }
  
  const handleBuyNow = () => {
    // Add to cart first
    addToCart({
      id: product._id,
      name: product.title,
      price: product.price,
      quantity: quantity,
      image: product.mainImageUrl
    })
    
    // Redirect to checkout
    window.location.href = '/checkout'
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/products" className="text-gray-600 hover:underline inline-flex items-center">
          ← Back to all products
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="relative h-96 w-full mb-4 rounded-lg overflow-hidden">
            {product.mainImageUrl && (
              <Image
                src={product.mainImageUrl}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-cover"
              />
            )}
          </div>

          {product.imageUrls && product.imageUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.imageUrls.map((imageUrl, index) => (
                <div key={index} className="relative h-24 rounded-md overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={`${product.title} - Image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 25vw, 12vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <p className="text-gray-800 text-2xl font-semibold">${product.price.toFixed(2)} USD</p>

          {product.isOnSale && (
            <span className="bg-red-500 text-white text-sm font-bold uppercase rounded-full px-3 py-1">
              Immediate Dispatch Available
            </span>
          )}

          {/* Quantity Selector */}
          <div className="mt-4 flex items-center">
            <button 
              onClick={decreaseQuantity}
              className="border px-4 py-2 text-lg"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="mx-4 text-lg">{quantity}</span>
            <button 
              onClick={increaseQuantity}
              className="border px-4 py-2 text-lg"
            >
              +
            </button>
          </div>

          {/* Buttons: Add to Cart & Buy It Now */}
          <div className="mt-6 space-y-3">
            <AddToCartButton 
              productId={product._id} 
              productTitle={product.title} 
              productPrice={product.price}
              productImage={product.mainImageUrl}
            />
            <button 
              onClick={handleBuyNow}
              className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition"
            >
              Buy It Now
            </button>
          </div>

          {/* Customer View Counter */}
          <div className="mt-4 text-sm text-gray-600">
            👀 185 customers are viewing this product
          </div>

          {/* Product Details */}
          {product.details && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Product Details</h2>
              <div className="prose prose-blue max-w-none">
                <PortableText value={product.details} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}