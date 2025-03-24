// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import type { SanityDocumentStub } from "@sanity/client";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  country: string;
  postalCode?: string;
  phone: string;
  paymentMethod: string;
  shippingMethod: string;
  billingAddressType: string;
  cart: CartItem[];
  [key: string]: any; 
}

interface SanityOrder extends SanityDocumentStub {
  _type: "order";
  email: string;
  customerName: string;
  address: string;
  apartment?: string;
  city: string;
  country: string;
  postalCode?: string;
  phone: string;
  paymentMethod: string;
  shippingMethod: string;
  cart: {
    // Removed _key field as Sanity will handle it automatically
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  status: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  paymentStatus: string; 
}

interface SupabaseOrder {
  email: string;
  customer_name: string;
  address: string;
  apartment?: string;
  city: string;
  country: string;
  postal_code?: string;
  phone: string;
  payment_method: string;
  shipping_method: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  sanity_id?: string;
  payment_status: string; 
}

interface SupabaseOrderItem {
  order_id: string;
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export async function POST(req: Request) {
  try {
    const data: OrderData = await req.json();

    // Validate required fields
    const requiredFields = [
      'email', 'firstName', 'lastName', 
      'address', 'city', 'country', 'phone',
      'paymentMethod', 'shippingMethod', 'cart'
    ];
    
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate cart
    if (!Array.isArray(data.cart) || data.cart.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart cannot be empty" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = data.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = 15; // Updated to match checkout page ($15)
    const total = subtotal + shippingCost;

    // Initial payment status based on payment method
    const initialPaymentStatus = data.paymentMethod === 'cod' ? 'awaiting' : 'awaiting';

    // Create Sanity document - WITHOUT explicitly setting _key
    const order: SanityOrder = {
      _type: "order",
      email: data.email,
      customerName: `${data.firstName} ${data.lastName}`.trim(),
      address: data.address,
      apartment: data.apartment,
      city: data.city,
      country: data.country,
      postalCode: data.postalCode,
      phone: data.phone,
      paymentMethod: data.paymentMethod,
      shippingMethod: data.shippingMethod,
      cart: data.cart.map((item) => ({
        // Let Sanity handle the _key automatically
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      status: "pending",
      total,
      subtotal,
      shippingCost,
      paymentStatus: initialPaymentStatus
    };

    console.log("Creating order in Sanity");

    // Create document in Sanity
    const sanityResponse = await client.create(order);
    const sanityId = sanityResponse._id;

    console.log(`✅ Created Sanity order: ${sanityId}`);

    // Prepare Supabase order data
    const supabaseOrder: SupabaseOrder = {
      email: data.email,
      customer_name: `${data.firstName} ${data.lastName}`.trim(),
      address: data.address,
      apartment: data.apartment,
      city: data.city,
      country: data.country,
      postal_code: data.postalCode,
      phone: data.phone,
      payment_method: data.paymentMethod,
      shipping_method: data.shippingMethod,
      status: "pending",
      total,
      subtotal,
      shipping_cost: shippingCost,
      sanity_id: sanityId,
      payment_status: initialPaymentStatus
    };

    // Insert into Supabase using a transaction approach
    const { data: supabaseOrderData, error: orderError } = await supabase
      .from('orders')
      .insert(supabaseOrder)
      .select('id')
      .single();

    if (orderError) {
      console.error("Supabase order creation error:", orderError);
      throw new Error(`Failed to create order in Supabase: ${orderError.message}`);
    }

    // Get the order ID from Supabase
    const orderId = supabaseOrderData.id;
    
    console.log(`✅ Created Supabase order: ${orderId}`);

    // Prepare order items for Supabase
    const orderItems: SupabaseOrderItem[] = data.cart.map(item => ({
      order_id: orderId,
      product_id: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image
    }));

    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error("Supabase order items creation error:", itemsError);
      // Attempt to clean up the order since items failed
      await supabase.from('orders').delete().eq('id', orderId);
      throw new Error(`Failed to create order items in Supabase: ${itemsError.message}`);
    }

    return NextResponse.json(
      { 
        success: true, 
        orderId: sanityId, // For backward compatibility
        sanityId: sanityId,
        supabaseId: orderId,
        createdAt: sanityResponse._createdAt
      }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Order processing error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to create order",
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          details: error.details
        })
      }, 
      { status: 500 }
    );
  }
}