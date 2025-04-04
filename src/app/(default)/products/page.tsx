// src/app/(default)/products/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { groq } from 'next-sanity'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

// Define TypeScript interfaces for our data
interface Category {
  _id: string
  title: string
  slug?: {
    current: string
  }
}

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
  categories?: Category[]
}

interface CategoryProducts {
  categories: Category[]
  productsByCategory: Record<string, Product[]>
  uncategorizedProducts: Product[]
  allProducts: Product[]
  error?: string
}

// A more robust function to fetch products and organize by category
async function getCategoriesWithProducts(): Promise<CategoryProducts> {
  try {
    // First fetch all products - this is guaranteed to work if your original page worked
    const products: Product[] = await client.fetch(
      groq`*[_type == "product"] {
        _id,
        title,
        slug,
        mainImage,
        price,
        compareAtPrice,
        isOnSale,
        categories[]-> { _id, title, slug }
      }`
    )
    
    // Extract all unique categories from the products
    const categoriesMap: Record<string, Category> = {}
    products.forEach(product => {
      if (product.categories && product.categories.length > 0) {
        product.categories.forEach(category => {
          if (category && category._id) {
            categoriesMap[category._id] = category
          }
        })
      }
    })
    
    const categories = Object.values(categoriesMap)
    
    // Group products by category
    const productsByCategory: Record<string, Product[]> = {}
    categories.forEach(category => {
      productsByCategory[category._id] = []
    })
    
    // Add products to their respective categories
    products.forEach(product => {
      if (product.categories && product.categories.length > 0) {
        product.categories.forEach(category => {
          if (category && productsByCategory[category._id]) {
            productsByCategory[category._id].push(product)
          }
        })
      }
    })
    
    // Handle uncategorized products
    const uncategorizedProducts = products.filter(product => 
      !product.categories || product.categories.length === 0
    )
    
    return {
      categories,
      productsByCategory,
      uncategorizedProducts,
      allProducts: products, // Return this for fallback
    }
  } catch (error: unknown) {
    console.error("Error fetching data:", error)
    // Return empty data rather than failing completely
    return {
      categories: [],
      productsByCategory: {},
      uncategorizedProducts: [],
      allProducts: [], 
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export default async function ProductsPage() {
  const { 
    categories, 
    productsByCategory, 
    uncategorizedProducts,
    allProducts,
    error
  } = await getCategoriesWithProducts()

  // Debug information that will appear in the server logs
  console.log("Debug: Categories found:", categories.length)
  console.log("Debug: Total products:", allProducts.length)
  if (error) console.error("Error in data fetching:", error)

  // ProductCard component for consistent styling
  const ProductCard = ({ product }: { product: Product }) => (
    <Link 
      href={`/products/${product.slug.current}`}
      className="group"
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
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
        
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-[#fe92b5] transition-colors line-clamp-3 min-h-[4.5rem]">
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
          
          {product.categories && product.categories.length > 0 && (
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
  )

  return (
    <div>
      {/* Hero Section with brand color and styling */}
      <div style={{ background: "#F7F7F7" }}>
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 
              className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
              style={{ color: "#e63946" }} // Brand red color
            >
              Our Products
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-700">
              Browse our selection of high-quality products
            </p>
          </div>
        </div>
      </div>

      {/* Main content with product listings */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* FALLBACK: If no categories were found, just show all products */}
          {categories.length === 0 && allProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Display products by category */}
          {categories.map(category => {
            const categoryProducts = productsByCategory[category._id] || []
            
            // Only render category section if it has products
            if (categoryProducts.length === 0) return null
            
            return (
              <div key={category._id} className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-200">
                  {category.title}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )
          })}
          
          {/* Display uncategorized products if any */}
          {uncategorizedProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-200">
                Other Products
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {uncategorizedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}
          
          {/* Show error if no products at all */}
          {allProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No products found.</p>
              {error && (
                <p className="mt-2 text-red-500">
                  There was an error loading products. Please try again later.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}