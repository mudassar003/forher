// src/sanity/schemaTypes/orderType.ts
export const orderType = {
  name: "order",
  title: "Orders",
  type: "document",
  fields: [
    {
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule: any) => Rule.required().email()
    },
    {
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (Rule: any) => Rule.required()
    },
    {
      name: "address",
      title: "Address",
      type: "string",
      validation: (Rule: any) => Rule.required()
    },
    {
      name: "apartment",
      title: "Apartment/Suite",
      type: "string"
    },
    {
      name: "city",
      title: "City",
      type: "string",
      validation: (Rule: any) => Rule.required()
    },
    {
      name: "country",
      title: "Country",
      type: "string",
      validation: (Rule: any) => Rule.required()
    },
    {
      name: "postalCode",
      title: "Postal Code",
      type: "string"
    },
    {
      name: "phone",
      title: "Phone",
      type: "string",
      validation: (Rule: any) => Rule.required()
    },
    {
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: {
        list: [
          { title: "Cash on Delivery", value: "cod" },
          { title: "Stripe", value: "stripe" }
        ]
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: "shippingMethod",
      title: "Shipping Method",
      type: "string",
      options: {
        list: [{ title: "Standard Delivery", value: "standard" }]
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: "cart",
      title: "Cart Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "productId", title: "Product ID", type: "string", validation: (Rule: any) => Rule.required() },
            { name: "name", title: "Product Name", type: "string", validation: (Rule: any) => Rule.required() },
            { name: "quantity", title: "Quantity", type: "number", validation: (Rule: any) => Rule.required().min(1) },
            { name: "price", title: "Price", type: "number", validation: (Rule: any) => Rule.required().min(0) },
            { name: "image", title: "Image", type: "string" }
          ]
        }
      ],
      validation: (Rule: any) => Rule.required().min(1)
    },
    {
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" }
        ]
      },
      initialValue: "pending",
      validation: (Rule: any) => Rule.required()
    },
    {
      name: "total",
      title: "Total Amount",
      type: "number",
      validation: (Rule: any) => Rule.required().min(0)
    },
    {
      name: "subtotal",
      title: "Subtotal",
      type: "number",
      validation: (Rule: any) => Rule.required().min(0)
    },
    {
      name: "shippingCost",
      title: "Shipping Cost",
      type: "number",
      validation: (Rule: any) => Rule.required().min(0)
    },
    // New Stripe-specific fields
    {
      name: "stripeSessionId",
      title: "Stripe Session ID",
      type: "string",
      description: "The ID of the Stripe checkout session"
    },
    {
      name: "stripePaymentIntentId",
      title: "Stripe Payment Intent ID",
      type: "string",
      description: "The ID of the Stripe payment intent"
    },
    {
      name: "stripeCustomerId",
      title: "Stripe Customer ID",
      type: "string",
      description: "The ID of the Stripe customer for recurring payments"
    },
    {
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",
      options: {
        list: [
          { title: "Awaiting Payment", value: "awaiting" },
          { title: "Payment Processing", value: "processing" },
          { title: "Payment Failed", value: "failed" },
          { title: "Paid", value: "paid" },
          { title: "Refunded", value: "refunded" },
          { title: "Partially Refunded", value: "partially_refunded" }
        ]
      },
      initialValue: "awaiting"
    }
  ],
  initialValue: {
    status: "pending",
    paymentStatus: "awaiting"
  },
  preview: {
    select: {
      title: '_id',
      customerName: 'customerName',
      status: 'status',
      paymentStatus: 'paymentStatus',
      paymentMethod: 'paymentMethod',
      total: 'total'
    },
    prepare(selection: any) {
      const { title, customerName, status, paymentStatus, paymentMethod, total } = selection;
      return {
        title: `Order ${title.substring(0, 8)}`,
        subtitle: `${customerName} - ${paymentMethod} - ${status} - ${paymentStatus} - $${total}`
      };
    }
  }
};