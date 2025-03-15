// src/app/(default)/products/[slug]/page.tsx
import { groq } from 'next-sanity'
import { client } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'
import ProductClient from './ProductClient'
import { urlFor } from '@/sanity/lib/image'
import { Metadata } from 'next'

interface Product {
  _id: string
  title: string
  slug: { current: string }
  mainImage: any
  images: any[]
  price: number
  compareAtPrice?: number
  isOnSale: boolean
  description: string
  details: any[]
  sku?: string
  inventory?: number
  categories: { _id: string; title: string; slug: { current: string } }[]
}

interface RelatedProduct {
  _id: string
  title: string
  slug: { current: string }
  mainImage: any
  price: number
  compareAtPrice?: number
  isOnSale: boolean
}

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const product: Product | null = await getProduct(params.slug)
  
  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }
  
  return {
    title: `${product.title} | Your Store Name`,
    description: product.description,
    openGraph: {
      images: product.mainImage ? [urlFor(product.mainImage).width(1200).height(630).url()] : [],
    },
  }
}

async function getProduct(slug: string) {
  return client.fetch(
    groq`*[_type == "product" && slug.current == $slug][0] {
      _id, title, slug, mainImage, images, price, compareAtPrice, isOnSale, 
      description, details, sku, inventory, 
      "categories": categories[]->{ _id, title, slug }
    }`,
    { slug }
  )
}

async function getRelatedProducts(productId: string, categoryIds: string[], limit = 4) {
  // If we have categories, find products from the same categories, excluding the current product
  if (categoryIds && categoryIds.length > 0) {
    return client.fetch(
      groq`*[_type == "product" && _id != $productId && count((categories[]->_id)[@ in $categoryIds]) > 0][0...$limit] {
        _id, title, slug, mainImage, price, compareAtPrice, isOnSale
      }`,
      { productId, categoryIds, limit }
    )
  }
  
  // Fallback: just get some other random products
  return client.fetch(
    groq`*[_type == "product" && _id != $productId][0...$limit] {
      _id, title, slug, mainImage, price, compareAtPrice, isOnSale
    }`,
    { productId, limit }
  )
}

// Updated to use the correct type pattern for Next.js App Router
export default async function ProductPage({ 
  params, 
  searchParams 
}: { 
  params: { slug: string },
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const { slug } = params
  const product: Product | null = await getProduct(slug)
  
  if (!product) {
    notFound()
  }

  // Get category IDs from the product
  const categoryIds = product.categories ? product.categories.map(cat => cat._id) : []
  
  // Fetch related products from the same categories
  const relatedProducts: RelatedProduct[] = await getRelatedProducts(product._id, categoryIds)

  // Pre-generate the image URLs on the server with error handling
  let mainImageUrl;
  try {
    mainImageUrl = product.mainImage ? urlFor(product.mainImage).url() : undefined;
  } catch (error) {
    console.error("Error generating main image URL:", error);
    mainImageUrl = undefined;
  }
  
  let imageUrls = [];
  try {
    imageUrls = product.images && Array.isArray(product.images) 
      ? product.images.map(img => urlFor(img).url()) 
      : []
  } catch (error) {
    console.error("Error generating image URLs:", error);
    imageUrls = [];
  }

  // Pre-generate image URLs for related products too with error handling
  const relatedProductsWithUrls = relatedProducts.map(relatedProduct => {
    let mainImageUrl;
    try {
      mainImageUrl = relatedProduct.mainImage ? urlFor(relatedProduct.mainImage).url() : undefined;
    } catch (error) {
      console.error("Error generating related product image URL:", error);
      mainImageUrl = undefined;
    }
    
    return {
      ...relatedProduct,
      mainImageUrl
    };
  })

  // Pass the product data, related products, and pre-generated image URLs to the client component
  return (
    <ProductClient 
      product={{
        ...product,
        mainImageUrl,
        imageUrls
      }}
      relatedProducts={relatedProductsWithUrls}
    />
  )
}

// Add generateStaticParams to help Next.js understand the params structure for static generation
export async function generateStaticParams() {
  const products: { slug: { current: string } }[] = await client.fetch(
    groq`*[_type == "product"]{ slug { current } }`
  )
  
  return products.map((product) => ({
    slug: product.slug.current,
  }))
}