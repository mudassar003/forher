"use client"

import { useState } from "react"
import { useCartStore } from "@/store/cartStore"

interface AddToCartButtonProps {
  productId: string
  productTitle: string
  productPrice: number
  productImage?: string
}

export default function AddToCartButton({ productId, productTitle, productPrice, productImage }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  const handleAddToCart = () => {
    setIsAdding(true)

    addToCart({
      id: productId,
      name: productTitle,  // ✅ Ensure product name is stored
      price: productPrice,  // ✅ Ensure price is stored
      quantity: 1,
      image: productImage,  // ✅ Ensure product image is stored
    })

    setTimeout(() => {
      setIsAdding(false)
      alert(`${productTitle} added to cart!`)
    }, 500)
  }

  return (
    <button
      onClick={handleAddToCart}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isAdding}
    >
      {isAdding ? "Adding..." : "Add to Cart"}
    </button>
  )
}
