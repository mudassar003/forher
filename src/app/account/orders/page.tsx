"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Import Supabase client

// Define the types for order and order item structures
interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  image: string | null;
}

interface Order {
  id: string;
  customer_name: string;
  email: string;
  address: string;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = (await supabase.auth.getUser()).data.user;

      // Fetch orders from Supabase
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, customer_name, email, address, total, status, created_at")
        .eq("email", user?.email) // Filter by user email
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setLoading(false);
        return;
      }

      // Now fetch order items based on order_id
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order: any) => {
          const { data: orderItems, error: itemsError } = await supabase
            .from("order_items")
            .select("id, product_id, name, quantity, price, image")
            .eq("order_id", order.id); // Fetch order items linked to the order ID

          if (itemsError) {
            console.error("Error fetching order items:", itemsError);
            return { ...order, items: [] };
          }

          return { ...order, items: orderItems };
        })
      );

      setOrders(ordersWithItems);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Orders</h2>
      {orders.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 flex justify-center items-center">
          <p>You have no orders.</p>
          <button className="ml-4 px-4 py-2 bg-black text-white rounded-lg">
            Find a treatment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow-md rounded-lg p-6">
              <p>Order ID: {order.id}</p>
              <p>Customer: {order.customer_name}</p>
              <p>Email: {order.email}</p>
              <p>Address: {order.address}</p>
              <p>Total: ${order.total}</p>
              <p>Status: {order.status}</p>
              <p>Created at: {new Date(order.created_at).toLocaleDateString()}</p>

              {/* Order Items */}
              <h3 className="mt-4 font-semibold text-gray-800">Order Items</h3>
              {order.items && order.items.length > 0 ? (
                <ul className="space-y-2 mt-2">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between items-center">
                      <div>
                        <p>{item.name}</p>
                        <p>Qty: {item.quantity}</p>
                        <p>${item.price} each</p>
                      </div>
                      <img
                        src={item.image || "/default-image.jpg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No items for this order</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
