// src/app/products/[slug]/page.tsx
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

// Solution: Use a more minimal approach without explicitly typing everything
export default async function ProductPage({ params }: any) {
  const { slug } = params
  const product: Product | null = await getProduct(slug)
  
  if (!product) {
    notFound()
  }

  // Pre-generate the image URLs on the server
  const mainImageUrl = product.mainImage ? urlFor(product.mainImage).url() : undefined
  const imageUrls = product.images ? product.images.map(img => urlFor(img).url()) : []

  // Pass the product data and pre-generated image URLs to the client component
  return (
    <ProductClient 
      product={{
        ...product,
        mainImageUrl,
        imageUrls
      }} 
    />
  )
}

// Add generateStaticParams to help Next.js understand the params structure
export async function generateStaticParams() {
  const products: { slug: { current: string } }[] = await client.fetch(
    groq`*[_type == "product"]{ "slug": slug.current }`
  )
  
  return products.map((product) => ({
    slug: product.slug.current,
  }))
}