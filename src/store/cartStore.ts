//src/store/cartStore.ts

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Define cart item type
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

// Define store state and actions
interface CartState {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

// Zustand store with persistence
export const useCartStore = create(
  persist<CartState>(
    (set) => ({
      cart: [],

      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find((cartItem) => cartItem.id === item.id)
          if (existingItem) {
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem
              ),
            }
          }
          return { cart: [...state.cart, item] }
        }),

      removeFromCart: (id) =>
        set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })),

      clearCart: () => set({ cart: [] }),
    }),
    { name: "cart-storage" } // Saves cart data to local storage
  )
)
