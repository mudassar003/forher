// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import type { SanityDocumentStub } from "@sanity/client";

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
    const shippingCost = 150;
    const total = subtotal + shippingCost;

    // Create Sanity document
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
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      status: "pending",
      total,
      subtotal,
      shippingCost
    };

    // Create document in Sanity
    const response = await client.create(order);

    return NextResponse.json(
      { 
        success: true, 
        orderId: response._id,
        sanityId: response._id,
        createdAt: response._createdAt
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