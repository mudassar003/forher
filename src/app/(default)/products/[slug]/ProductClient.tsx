//src/app/products/[slug]/ProductClient.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { ShoppingCart, ArrowLeft, Check, Truck, Shield, RotateCcw } from 'lucide-react'
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
    categories?: {
      _id: string
      title: string
      slug: { current: string }
    }[]
  }
  relatedProducts: {
    _id: string
    title: string
    slug: { current: string }
    price: number
    compareAtPrice?: number
    isOnSale: boolean
    mainImageUrl?: string
  }[]
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const addToCart = useCartStore((state) => state.addToCart)
  
  // Ensure mainImageUrl is always included in imageUrls array for the thumbnail gallery
  const allImages = product.mainImageUrl 
    ? [product.mainImageUrl, ...product.imageUrls.filter(url => url !== product.mainImageUrl)]
    : product.imageUrls
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }
  
  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.title,
      price: product.price,
      quantity: quantity,
      image: product.mainImageUrl
    })
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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-6">
        <Link href="/products" className="text-gray-600 hover:text-[#fe92b5] inline-flex items-center gap-1 transition-colors">
          <ArrowLeft size={16} />
          <span>Back to all products</span>
        </Link>
      </div>
      
      {/* Main product section - 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-8 lg:mb-12">
        {/* Left column - Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative h-[300px] sm:h-[400px] w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            {allImages.length > 0 ? (
              <Image
                src={allImages[activeImageIndex]}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {allImages.map((imageUrl, index) => (
                <button
                  key={index}
                  className={`relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 border ${
                    activeImageIndex === index ? 'border-[#fe92b5]' : 'border-gray-200'
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <Image
                    src={imageUrl}
                    alt={`${product.title} - Image ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Right column - Product Details */}
        <div className="flex flex-col">
          {/* Categories and title */}
          <div className="mb-4">
            {product.categories && product.categories.length > 0 && (
              <div className="flex gap-2 mb-2">
                {product.categories.map(category => (
                  <Link 
                    key={category._id}
                    href={`/products?category=${category.slug.current}`}
                    className="text-sm text-[#fe92b5] hover:text-[#f96897] font-medium"
                  >
                    {category.title}
                  </Link>
                ))}
              </div>
            )}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline mb-6">
            <span className="text-xl lg:text-2xl font-semibold text-gray-900">${product.price.toFixed(2)} USD</span>
            {product.compareAtPrice && product.isOnSale && (
              <span className="ml-2 text-lg text-gray-500 line-through">${product.compareAtPrice.toFixed(2)}</span>
            )}
            {product.isOnSale && (
              <span className="ml-2 bg-pink-100 text-[#fc4e87] text-sm font-medium px-3 py-1 rounded-full">
                {Math.round((1 - product.price / (product.compareAtPrice || product.price)) * 100)}% OFF
              </span>
            )}
          </div>
          
          {/* Brief description */}
          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Availability and shipping */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-green-600">
              <Check size={18} />
              <span className="text-sm font-medium">In Stock</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Truck size={18} />
              <span className="text-sm">Free shipping on orders over $50</span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center border border-gray-300 rounded-md w-28 h-10">
              <button 
                onClick={decreaseQuantity}
                className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-[#fe92b5] transition-colors"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="flex-1 text-center text-gray-900">{quantity}</span>
              <button 
                onClick={increaseQuantity}
                className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-[#fe92b5] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 lg:mb-6">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-md flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-1 bg-gray-900 hover:bg-black text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              Buy Now
            </button>
          </div>

          {/* Customer confidence indicators */}
          <div className="mt-auto grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">Secure payment</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">30-day returns</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Tabs: Details, Shipping, Reviews */}
      <div className="mb-16">
        <div className="border-b border-gray-200 mb-4 lg:mb-6">
          <div className="flex flex-wrap space-x-0 sm:space-x-8">
            <button
              onClick={() => setActiveTab('description')} 
              className={`py-3 mr-4 sm:mr-0 text-sm font-medium border-b-2 ${
                activeTab === 'description' 
                  ? 'border-[#fe92b5] text-[#fe92b5]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab('shipping')} 
              className={`py-3 text-sm font-medium border-b-2 ${
                activeTab === 'shipping' 
                  ? 'border-[#fe92b5] text-[#fe92b5]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Shipping & Returns
            </button>
            <button
              onClick={() => setActiveTab('reviews')} 
              className={`py-3 text-sm font-medium border-b-2 ${
                activeTab === 'reviews' 
                  ? 'border-[#fe92b5] text-[#fe92b5]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Customer Reviews
            </button>
          </div>
        </div>
        
        <div className="prose max-w-none">
          {activeTab === 'description' && (
            <div className="text-gray-800 leading-relaxed">
              {product.details && <PortableText value={product.details} />}
            </div>
          )}
          
          {activeTab === 'shipping' && (
            <div className="text-gray-800 leading-relaxed">
              <h3 className="text-xl font-semibold mb-4">Shipping Information</h3>
              <p className="mb-4">We ship to most countries worldwide via standard and express shipping options.</p>
              <ul className="list-disc pl-5 mb-6 space-y-2">
                <li>Standard Shipping: 5-7 business days</li>
                <li>Express Shipping: 2-3 business days</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Return Policy</h3>
              <p>We want you to be completely satisfied with your purchase. If you're not happy with your order, we accept returns within 30 days of delivery.</p>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="text-gray-800 leading-relaxed">
              <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
              <p>This product has not been reviewed yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map(relatedProduct => (
              <Link 
                key={relatedProduct._id}
                href={`/products/${relatedProduct.slug.current}`}
                className="group"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                  <div className="relative h-36 sm:h-48 md:h-64 w-full bg-gray-100">
                    {relatedProduct.mainImageUrl ? (
                      <Image
                        src={relatedProduct.mainImageUrl}
                        alt={relatedProduct.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-400">
                        No image
                      </div>
                    )}
                    {relatedProduct.isOnSale && (
                      <div className="absolute top-2 right-2 bg-[#fc4e87] text-white text-xs font-bold uppercase rounded-full px-2 py-1">
                        Sale
                      </div>
                    )}
                  </div>
                  
                  <div className="p-2 sm:p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-[#fe92b5] transition-colors line-clamp-2">
                      {relatedProduct.title}
                    </h3>
                    
                    <div className="flex items-center mt-auto">
                      {relatedProduct.compareAtPrice && relatedProduct.isOnSale ? (
                        <>
                          <span className="text-[#fe92b5] font-medium">${relatedProduct.price.toFixed(2)}</span>
                          <span className="text-gray-500 line-through ml-2 text-xs">
                            ${relatedProduct.compareAtPrice.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="font-medium">${relatedProduct.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}