import Image from 'next/image'
import Link from 'next/link'
import { groq } from 'next-sanity'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

// Define TypeScript interface for our product data
interface Product {
  _id: string
  title: string
  slug: {
    current: string
  }
  mainImage: any
  price: number
  compareAtPrice?: number
  isOnSale: boolean
  categories: Array<{
    _id: string
    title: string
  }>
}

// Fetch all products from Sanity
async function getProducts() {
  return client.fetch(
    groq`*[_type == "product"] {
      _id,
      title,
      slug,
      mainImage,
      price,
      compareAtPrice,
      isOnSale,
      "categories": categories[]->{ _id, title }
    }`
  )
}

export default async function ProductsPage() {
  const products: Product[] = await getProducts()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link 
            key={product._id} 
            href={`/products/${product.slug.current}`}
            className="group"
          >
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-64 w-full">
                {product.mainImage && (
                  <Image
                    src={urlFor(product.mainImage).url()}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {product.isOnSale && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold uppercase rounded-full px-3 py-1">
                    Sale
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">
                  {product.title}
                </h3>
                
                <div className="flex items-center mt-2">
                  {product.compareAtPrice && product.isOnSale ? (
                    <>
                      <span className="text-red-600 font-medium text-lg">${product.price.toFixed(2)}</span>
                      <span className="text-gray-500 line-through ml-2 text-sm">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="font-medium text-lg">${product.price.toFixed(2)}</span>
                  )}
                </div>
                
                {product.categories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.categories.map((category) => (
                      <span 
                        key={category._id}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {category.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}