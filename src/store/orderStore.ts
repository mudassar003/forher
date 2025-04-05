// src/store/orderStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Define types for order data
export interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  image: string | null;
}

export interface Order {
  id: string;
  customer_name: string;
  email: string;
  address: string;
  apartment?: string | null;
  city?: string | null;
  country?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  total: number;
  subtotal?: number | null;
  shipping_cost?: number | null;
  status: string;
  payment_status?: string | null;
  payment_method?: string | null;
  created_at: string;
  items: OrderItem[];
}

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
  isFetched: boolean; // Track if we've fetched at least once
  
  // Actions
  fetchUserOrders: (userEmail: string, forceRefresh?: boolean) => Promise<void>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  selectOrder: (order: Order | null) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  isFetched: false,
  
  fetchUserOrders: async (userEmail: string, forceRefresh: boolean = false) => {
    // Skip if already loading 
    if (get().loading) {
      return;
    }
    
    // Skip if we've already fetched and not forcing refresh
    if (get().isFetched && !forceRefresh) {
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      // Type safety: cast the email to a string to satisfy TypeScript
      // This is safe because we've already checked userEmail exists in the component
      const email = userEmail as string;
      
      // Fetch orders from Supabase
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, customer_name, email, address, apartment, city, country, postal_code, phone, subtotal, shipping_cost, total, status, payment_status, payment_method, created_at")
        .eq("email", email)
        .order("created_at", { ascending: false });
      
      if (ordersError) {
        throw new Error(ordersError.message);
      }
      
      if (!ordersData || ordersData.length === 0) {
        set({ 
          orders: [],
          loading: false,
          isFetched: true
        });
        return;
      }
      
      // Now fetch order items for each order
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order: any) => {
          const { data: orderItems, error: itemsError } = await supabase
            .from("order_items")
            .select("id, product_id, name, quantity, price, image")
            .eq("order_id", order.id);

          if (itemsError) {
            console.error(`Error fetching items for order ${order.id}:`, itemsError);
            return { ...order, items: [] };
          }

          return { ...order, items: orderItems || [] };
        })
      );
      
      set({ 
        orders: ordersWithItems,
        loading: false,
        isFetched: true,
        error: null
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
        loading: false,
        isFetched: true
      });
    }
  },
  
  getOrderById: async (orderId: string) => {
    // Check if the order is already in our state
    const existingOrder = get().orders.find(order => order.id === orderId);
    if (existingOrder) {
      return existingOrder;
    }
    
    try {
      // Fetch the order from Supabase
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, customer_name, email, address, apartment, city, country, postal_code, phone, subtotal, shipping_cost, total, status, payment_status, payment_method, created_at")
        .eq("id", orderId)
        .single();
      
      if (orderError || !order) {
        return null;
      }
      
      // Fetch order items
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("id, product_id, name, quantity, price, image")
        .eq("order_id", orderId);
      
      if (itemsError) {
        return { ...order, items: [] };
      }
      
      return { ...order, items: orderItems || [] };
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      return null;
    }
  },
  
  selectOrder: (order: Order | null) => {
    set({ selectedOrder: order });
  },
  
  clearOrders: () => {
    set({ 
      orders: [],
      selectedOrder: null,
      isFetched: false 
    });
  }
}));