import Link from 'next/link'

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        Sorry, the product you're looking for doesn't exist or has been removed.
      </p>
      <Link 
        href="/products" 
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
      >
        View All Products
      </Link>
    </div>
  )
}