// src/sanity/schemaTypes/orderType.ts
export const orderType = {
  name: "order",
  title: "Orders",
  type: "document",
  fields: [
    // Add a display field for the Order ID at the top
    {
      name: "displayId",
      title: "Order ID",
      type: "string",
      readOnly: true,
      description: "This is the Order ID shown to customers",
      // This field gets populated automatically in document creation
      hidden: ({ document }) => !document?._id,
      options: {
        // Custom input component that shows the document ID
        inputComponent: ({ value, readOnly }) => {
          // If this is a new document without an ID yet
          if (!value) {
            return {
              reactElement: {
                component: 'div',
                props: {
                  children: 'ID will be available after saving'
                }
              }
            };
          }
          
          return {
            reactElement: {
              component: 'div',
              props: {
                style: {
                  padding: '0.5rem',
                  backgroundColor: '#f3f3f3',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                },
                children: value
              }
            }
          };
        }
      }
    },
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
          ],
          preview: {
            select: {
              name: 'name',
              quantity: 'quantity',
              price: 'price'
            },
            prepare({ name, quantity, price }) {
              return {
                title: name || 'Product',
                subtitle: `${quantity || 0} × $${price || 0} = $${(quantity || 0) * (price || 0)}`
              };
            }
          }
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
    // Stripe-specific fields
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
    },
    {
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      readOnly: true,
      description: "When the order was placed",
    }
  ],
  initialValue: {
    status: "pending",
    paymentStatus: "awaiting",
    orderDate: (new Date()).toISOString()
  },
  preview: {
    select: {
      name: 'customerName',
      email: 'email',
      id: '_id',
      status: 'status',
      paymentStatus: 'paymentStatus',
      paymentMethod: 'paymentMethod',
      total: 'total'
    },
    prepare(selection) {
      const { name, email, id, status, paymentStatus, paymentMethod, total } = selection;
      return {
        title: `${name || 'Customer'} - ${email || 'No Email'}`,
        subtitle: `ID: ${id} | ${paymentMethod || 'Unknown'} | ${status || 'Unknown'} | ${paymentStatus || 'Unknown'} | $${total || 0}`,
        media: paymentMethod === 'stripe' 
          ? { emoji: '💳' } 
          : { emoji: '💵' }
      };
    }
  }
};