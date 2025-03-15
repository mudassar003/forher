// src/app/(default)/products/[slug]/page.tsx
import { groq } from 'next-sanity'
import { client } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'
import ProductClient from './ProductClient'
import { urlFor } from '@/sanity/lib/image'

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

type ParamsType = Promise<{ slug: string }>;

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

export default async function ProductPage({ 
  params, 
  searchParams 
}: { 
  params: ParamsType,
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
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

export async function generateStaticParams() {
  const products: { slug: { current: string } }[] = await client.fetch(
    groq`*[_type == "product"]{ slug { current } }`
  )
  
  return products.map((product) => ({
    slug: product.slug.current,
  }))
}