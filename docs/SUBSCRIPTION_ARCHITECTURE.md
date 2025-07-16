# 🏢 Enterprise Subscription System Documentation

## 📋 **Table of Contents**
1. [Architecture Overview](#architecture-overview)
2. [Data Flow Diagrams](#data-flow-diagrams)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Security Implementation](#security-implementation)
7. [Error Handling](#error-handling)
8. [Monitoring & Debugging](#monitoring--debugging)
9. [Development Guidelines](#development-guidelines)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## 🏗️ **Architecture Overview**

### **System Components**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│     STRIPE      │    │    SUPABASE     │    │     SANITY      │
│  (Payments &    │    │  (Operational   │    │  (Content       │
│  Subscriptions) │    │   Database)     │    │  Management)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │                 │
                    │   NEXT.JS APP   │
                    │                 │
                    └─────────────────┘
```

### **Data Flow Strategy**
- **Stripe**: Source of truth for payment status and subscription lifecycle
- **Supabase**: Primary operational database for application logic
- **Sanity**: Content management and subscription configuration
- **Next.js**: API layer orchestrating all systems

### **Tech Stack**
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Stripe Webhooks
- **Database**: Supabase (PostgreSQL)
- **CMS**: Sanity
- **Payments**: Stripe
- **State Management**: Zustand
- **Validation**: Zod
- **Rate Limiting**: Redis (with in-memory fallback)

---

## 🔄 **Data Flow Diagrams**

### **1. Subscription Purchase Flow**
```
User                Next.js App           Stripe              Supabase           Sanity
 │                       │                  │                    │                 │
 │ 1. Select Plan        │                  │                    │                 │
 │──────────────────────▶│                  │                    │                 │
 │                       │ 2. Validate      │                    │                 │
 │                       │    Input         │                    │                 │
 │                       │                  │                    │                 │
 │                       │ 3. Create        │                    │                 │
 │                       │    Checkout      │                    │                 │
 │                       │──────────────────▶│                    │                 │
 │                       │                  │                    │                 │
 │                       │ 4. Checkout URL  │                    │                 │
 │                       │◀──────────────────│                    │                 │
 │                       │                  │                    │                 │
 │ 5. Redirect to        │                  │                    │                 │
 │    Stripe Checkout    │                  │                    │                 │
 │◀──────────────────────│                  │                    │                 │
 │                       │                  │                    │                 │
 │ 6. Complete Payment   │                  │                    │                 │
 │──────────────────────────────────────────▶│                    │                 │
 │                       │                  │                    │                 │
 │                       │                  │ 7. Webhook         │                 │
 │                       │                  │    (checkout.      │                 │
 │                       │                  │    session.        │                 │
 │                       │                  │    completed)      │                 │
 │                       │◀──────────────────│                    │                 │
 │                       │                  │                    │                 │
 │                       │ 8. Update Subscription Status         │                 │
 │                       │────────────────────────────────────────▶│                 │
 │                       │                  │                    │                 │
 │                       │ 9. Update CMS Data                    │                 │
 │                       │────────────────────────────────────────────────────────▶│
 │                       │                  │                    │                 │
 │ 10. Success Redirect  │                  │                    │                 │
 │◀──────────────────────│                  │                    │                 │
```

### **2. Subscription Cancellation Flow**
```
User                Next.js App           Stripe              Supabase           Sanity
 │                       │                  │                    │                 │
 │ 1. Cancel Request     │                  │                    │                 │
 │──────────────────────▶│                  │                    │                 │
 │                       │ 2. Validate      │                    │                 │
 │                       │    User & Sub    │                    │                 │
 │                       │                  │                    │                 │
 │                       │ 3. Cancel in     │                    │                 │
 │                       │    Stripe        │                    │                 │
 │                       │──────────────────▶│                    │                 │
 │                       │                  │                    │                 │
 │                       │ 4. Update Local  │                    │                 │
 │                       │    Database      │                    │                 │
 │                       │────────────────────────────────────────▶│                 │
 │                       │                  │                    │                 │
 │                       │ 5. Update CMS    │                    │                 │
 │                       │────────────────────────────────────────────────────────▶│
 │                       │                  │                    │                 │
 │                       │                  │ 6. Webhook         │                 │
 │                       │                  │    (subscription.  │                 │
 │                       │                  │    deleted)        │                 │
 │                       │◀──────────────────│                    │                 │
 │                       │                  │                    │                 │
 │ 7. Confirmation       │                  │                    │                 │
 │◀──────────────────────│                  │                    │                 │
```

### **3. Webhook Processing Flow**
```
Stripe Webhook          Next.js API         Supabase           Sanity
       │                      │                │                 │
       │ 1. Event Notification│                │                 │
       │─────────────────────▶│                │                 │
       │                      │ 2. Verify     │                 │
       │                      │    Signature  │                 │
       │                      │               │                 │
       │                      │ 3. Process    │                 │
       │                      │    Event      │                 │
       │                      │               │                 │
       │                      │ 4. Update     │                 │
       │                      │    Database   │                 │
       │                      │──────────────▶│                 │
       │                      │               │                 │
       │                      │ 5. Update CMS │                 │
       │                      │───────────────────────────────▶│
       │                      │               │                 │
       │ 6. Success Response  │               │                 │
       │◀─────────────────────│               │                 │
```

---

## 🗃️ **Database Schema**

### **Supabase Tables**

#### **user_subscriptions**
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  sanity_id TEXT, -- Reference to Sanity CMS
  sanity_subscription_id TEXT, -- Reference to subscription config
  subscription_name TEXT,
  plan_id TEXT,
  plan_name TEXT,
  stripe_session_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  billing_amount DECIMAL,
  billing_period TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  is_active BOOLEAN DEFAULT false,
  has_appointment_access BOOLEAN DEFAULT false,
  appointment_discount_percentage INTEGER,
  appointments_included INTEGER,
  appointments_used INTEGER DEFAULT 0,
  variant_key TEXT, -- For subscription variants
  coupon_code TEXT,
  coupon_discount_type TEXT,
  coupon_discount_value DECIMAL,
  original_price DECIMAL,
  cancellation_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status) WHERE NOT is_deleted;
CREATE INDEX idx_user_subscriptions_active ON user_subscriptions(is_active, user_id) WHERE NOT is_deleted;
```

### **Sanity Schemas**

#### **subscription (Product Configuration)**
```typescript
{
  _type: 'subscription',
  title: string,
  titleEs?: string,
  description: string,
  price: number,
  billingPeriod: 'monthly' | 'three_month' | 'six_month' | 'annually' | 'other',
  customBillingPeriodMonths?: number,
  stripePriceId?: string,
  stripeProductId?: string,
  hasVariants?: boolean,
  variants?: Array<{
    _key: string,
    title: string,
    price: number,
    billingPeriod: string,
    stripePriceId?: string,
    isDefault?: boolean,
    isPopular?: boolean
  }>,
  features: Array<{ featureText: string }>,
  appointmentAccess?: boolean,
  appointmentDiscountPercentage?: number,
  allowCoupons?: boolean,
  excludedCoupons?: Array<Reference>,
  isActive: boolean,
  sortOrder?: number
}
```

#### **userSubscription (User's Active Subscriptions)**
```typescript
{
  _type: 'userSubscription',
  userId: string,
  userEmail: string,
  subscription: Reference, // to subscription
  variantKey?: string,
  startDate: string,
  endDate?: string,
  nextBillingDate?: string,
  status: 'pending' | 'active' | 'cancelled' | 'past_due' | 'trialing',
  isActive: boolean,
  stripeSubscriptionId?: string,
  stripeCustomerId?: string,
  billingPeriod: string,
  billingAmount: number,
  hasAppointmentAccess?: boolean,
  appointmentDiscountPercentage?: number,
  stripeSessionId?: string,
  appliedCouponId?: string,
  appliedCouponCode?: string,
  originalPrice?: number,
  cancellationDate?: string
}
```

---

## 🚀 **API Endpoints**

### **Subscription Management**

#### **POST /api/stripe/subscriptions**
Creates a new subscription purchase session.

**Request:**
```typescript
{
  subscriptionId: string,
  userId: string,
  userEmail: string,
  variantKey?: string,
  couponCode?: string
}
```

**Response:**
```typescript
{
  success: boolean,
  sessionId?: string,
  url?: string, // Stripe checkout URL
  error?: string,
  metadata?: {
    subscriptionId: string,
    variantKey?: string,
    price: number,
    billingPeriod: string,
    couponApplied?: boolean
  }
}
```

**Security:**
- Authentication required
- Rate limiting: 5 requests per hour per user
- Input validation with Zod
- User ownership verification

#### **POST /api/stripe/subscriptions/cancel**
Cancels a user's subscription.

**Request:**
```typescript
{
  subscriptionId: string, // Supabase UUID or Stripe ID
  immediate?: boolean // Default: true
}
```

**Response:**
```typescript
{
  success: boolean,
  message?: string,
  error?: string,
  status?: string,
  cancelled_immediately?: boolean
}
```

**Security:**
- Authentication required
- User ownership verification
- Rate limiting: 20 requests per 5 minutes
- Input validation

#### **POST /api/stripe/subscriptions/status**
Syncs subscription status with Stripe.

**Request:**
```typescript
{
  userId: string
}
```

**Response:**
```typescript
{
  success: boolean,
  updated?: number, // Count of updated subscriptions
  error?: string
}
```

### **Admin Endpoints**

#### **GET /api/admin/check-status**
Checks if current user has admin privileges.

**Response:**
```typescript
{
  success: boolean,
  isAdmin: boolean,
  email?: string
}
```

#### **POST /api/admin/subscriptions/update-status**
Force update subscription status (admin only).

**Request:**
```typescript
{
  subscriptionId: string,
  status: string,
  isActive: boolean
}
```

**Security:**
- Admin authentication required
- Rate limiting: 30 requests per minute
- Audit logging

### **Webhook Endpoints**

#### **POST /api/stripe/webhook**
Handles Stripe webhook events.

**Supported Events:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

**Security:**
- Stripe signature verification
- Idempotency handling
- Error recovery

---

## 🎨 **Frontend Components**

### **State Management (Zustand)**

#### **subscriptionStore.ts**
```typescript
interface UserSubscriptionState {
  subscriptions: Subscription[];
  hasActiveSubscription: boolean;
  loading: boolean;
  error: string | null;
  cancellingId: string | null;
  syncingSubscriptions: boolean;
  isFetched: boolean;
  lastSyncTime: number | null;
  syncInProgress: boolean;
  
  // Actions
  fetchUserSubscriptions: (userId: string, forceRefresh?: boolean) => Promise<void>;
  cancelUserSubscription: (subscriptionId: string) => Promise<boolean>;
  syncSubscriptionStatuses: (userId: string) => Promise<boolean>;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  resetSubscriptionStore: () => void;
}
```

**Key Features:**
- **Caching**: 30-second cache for subscription data
- **Loading States**: Prevents duplicate API calls
- **Error Handling**: Safe error messages
- **Cross-tab Sync**: BroadcastChannel for real-time updates
- **Optimistic Updates**: Immediate UI updates with server sync

### **Hooks**

#### **useSubscriptionPurchase.ts**
```typescript
export function useSubscriptionPurchase() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const purchaseSubscription = useCallback(async (
    subscriptionId: string,
    variantKey?: string,
    couponCode?: string
  ): Promise<SubscriptionPurchaseResult> => {
    // Implementation with:
    // - Auth verification
    // - Rate limiting
    // - Retry logic
    // - Error handling
  }, []);
  
  return { isLoading, error, purchaseSubscription, clearError };
}
```

#### **useSubscriptionPricing.ts**
```typescript
export function useSubscriptionPricing(
  subscription: any,
  selectedVariant: SubscriptionVariant | null,
  selectedBase: boolean,
  discountedPrice: number | null,
  currentLanguage: string
): UsePricingReturn {
  // Returns formatted pricing information
  // Handles variants, discounts, internationalization
}
```

### **Component Structure**

```
src/
├── components/
│   ├── subscription/
│   │   ├── SubscriptionCard.tsx
│   │   ├── SubscriptionGrid.tsx
│   │   ├── VariantSelector.tsx
│   │   ├── PurchaseSection.tsx
│   │   └── SubscriptionFAQ.tsx
│   └── account/
│       ├── SubscriptionsList.tsx
│       ├── SubscriptionModal.tsx
│       └── StatusBadge.tsx
├── app/
│   ├── (default)/subscriptions/
│   │   ├── page.tsx
│   │   ├── [slug]/page.tsx
│   │   └── components/
│   └── account/subscriptions/
│       ├── page.tsx
│       └── components/
└── hooks/
    ├── useSubscriptionPurchase.ts
    ├── useSubscriptionPricing.ts
    └── useSubscriptionSync.ts
```

---

## 🔒 **Security Implementation**

### **Authentication & Authorization**

#### **Admin Authentication**
```typescript
// Server-side only (NOT exposed to client)
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
```

#### **User Authentication**
```typescript
export async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? null : user;
}
```

### **Rate Limiting**

#### **Redis-based with Fallback**
```typescript
// Different limits for different operations
- General API: 100 requests per 15 minutes
- Subscription Operations: 20 requests per 5 minutes  
- Purchase Operations: 5 requests per hour
- Admin Operations: 30 requests per minute
```

#### **Implementation**
```typescript
// Redis primary, memory fallback
const rateLimitResult = await subscriptionRateLimit(req, userId);
if (!rateLimitResult.success) {
  return createRateLimitResponse(rateLimitResult);
}
```

### **Input Validation**

#### **Zod Schemas**
```typescript
export const subscriptionPurchaseSchema = z.object({
  subscriptionId: z.string().uuid(),
  userId: z.string().uuid(),
  userEmail: z.string().email(),
  variantKey: z.string().optional(),
  couponCode: z.string().max(50).optional(),
});
```

### **Error Handling**

#### **Safe Error Messages**
```typescript
export function createSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
      .replace(/password|token|secret|key/gi, '[REDACTED]')
      .replace(/\b\d{4,}\b/g, '[REDACTED]');
  }
  return 'An unexpected error occurred';
}
```

---

## 📊 **Monitoring & Debugging**

### **Logging Strategy**

#### **Subscription Operations**
```typescript
// Purchase flow
console.log('🚀 Starting subscription purchase...');
console.log('📨 Purchase request data:', sanitizedData);
console.log('✅ Variant found:', selectedVariant.title);
console.log('💰 Pricing details:', pricingInfo);
console.log('🎉 Subscription purchase completed');

// Error logging
console.error('❌ Error creating subscription:', error);
console.error('Error stack:', error.stack);
```

#### **Webhook Processing**
```typescript
console.log(`⚡ Received Stripe webhook event: ${event.type}`);
console.log(`Processing subscription update for ${subscription.id}`);
console.log(`✅ Updated subscription status to: ${status}`);
```

### **Health Checks**

#### **Database Connectivity**
```typescript
// Check Supabase connection
const { data, error } = await supabase.from('user_subscriptions').select('id').limit(1);

// Check Sanity connection  
const sanityHealth = await sanityClient.fetch('*[_type == "subscription"][0]');
```

#### **External Services**
```typescript
// Stripe API health
const stripeHealth = await stripe.accounts.retrieve();

// Redis health (if configured)
const redisHealth = await redis.ping();
```

### **Performance Monitoring**

#### **API Response Times**
```typescript
const startTime = Date.now();
// ... operation
const totalTime = Date.now() - startTime;
console.log(`🎉 Subscription purchase completed in ${totalTime}ms`);
```

#### **Database Query Performance**
```typescript
// Monitor slow queries
const queryStart = Date.now();
const result = await supabase.from('user_subscriptions').select('*');
const queryTime = Date.now() - queryStart;

if (queryTime > 1000) {
  console.warn(`⚠️ Slow query detected: ${queryTime}ms`);
}
```

---

## 👨‍💻 **Development Guidelines**

### **Code Structure**

#### **File Organization**
```
src/
├── app/
│   ├── api/
│   │   └── stripe/
│   │       ├── subscriptions/
│   │       │   ├── route.ts
│   │       │   ├── cancel/route.ts
│   │       │   └── status/route.ts
│   │       └── webhook/
│   │           ├── route.ts
│   │           └── handlers/
│   └── (routes)/
├── components/
├── hooks/
├── lib/
├── services/
├── store/
├── types/
└── utils/
```

#### **Naming Conventions**
```typescript
// API Routes
POST /api/stripe/subscriptions          // Create subscription
POST /api/stripe/subscriptions/cancel   // Cancel subscription
POST /api/stripe/subscriptions/status   // Sync status

// Components
SubscriptionCard.tsx                     // Individual subscription
SubscriptionGrid.tsx                     // Collection of subscriptions
VariantSelector.tsx                      // Variant selection UI

// Hooks
useSubscriptionPurchase.ts              // Purchase functionality
useSubscriptionPricing.ts               // Pricing calculations

// Services
subscriptionService.ts                  // Business logic
paymentService.ts                       // Payment processing

// Types
subscription.ts                         // Subscription interfaces
supabase.ts                            // Database types
```

### **Error Handling Patterns**

#### **API Routes**
```typescript
try {
  // Validate input
  const validation = validateRequest(schema, data);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: validation.error },
      { status: 400 }
    );
  }

  // Check authentication
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Check rate limits
  const rateLimitResult = await checkRateLimit(req, user.id);
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  // Process request
  const result = await processSubscription(validatedData);
  
  return NextResponse.json({
    success: true,
    data: result
  });
} catch (error) {
  console.error('API Error:', error);
  return NextResponse.json(
    { success: false, error: createSafeErrorMessage(error) },
    { status: 500 }
  );
}
```

#### **Frontend Components**
```typescript
const { isLoading, error, purchaseSubscription } = useSubscriptionPurchase();

const handlePurchase = async () => {
  try {
    const result = await purchaseSubscription(subscriptionId, variantKey);
    if (result.success) {
      // Redirect to checkout
      window.location.href = result.url;
    } else {
      // Show error message
      setError(result.error);
    }
  } catch (error) {
    setError('Purchase failed. Please try again.');
  }
};
```

### **Testing Strategy**

#### **Unit Tests**
```typescript
// Test utility functions
describe('subscriptionHelpers', () => {
  test('formatPriceWithBillingPeriod', () => {
    expect(formatPriceWithBillingPeriod(29.99, 'monthly')).toBe('$29.99/month');
    expect(formatPriceWithBillingPeriod(99.99, 'annually')).toBe('$99.99/year ($8.33 per month)');
  });
});

// Test API endpoints
describe('/api/stripe/subscriptions', () => {
  test('creates subscription successfully', async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

#### **Integration Tests**
```typescript
// Test complete subscription flow
describe('Subscription Flow', () => {
  test('user can purchase subscription', async () => {
    // 1. Create subscription in Sanity
    // 2. Make purchase request
    // 3. Verify Stripe session created
    // 4. Simulate webhook
    // 5. Verify database updated
  });
});
```

---

## 🐛 **Troubleshooting Guide**

### **Common Issues**

#### **1. Subscription Not Activating**
```typescript
// Check webhook processing
console.log('Webhook events received:', webhookLogs);

// Verify database updates
const subscription = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('stripe_subscription_id', stripeId)
  .single();

// Check Stripe status
const stripeSubscription = await stripe.subscriptions.retrieve(stripeId);
```

**Solution Steps:**
1. Check webhook endpoint is receiving events
2. Verify Stripe webhook secret is correct
3. Check database for subscription record
4. Manually sync status if needed

#### **2. Payment Failures**
```typescript
// Check customer payment methods
const customer = await stripe.customers.retrieve(customerId, {
  expand: ['default_source']
});

// Check subscription payment status
const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
  expand: ['latest_invoice.payment_intent']
});
```

**Solution Steps:**
1. Check payment method validity
2. Verify customer has sufficient funds
3. Check for 3D Secure authentication
4. Review Stripe dashboard for declined payments

#### **3. Data Sync Issues**
```typescript
// Check for data inconsistencies
const supabaseData = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('user_id', userId);

const sanityData = await sanityClient.fetch(
  `*[_type == "userSubscription" && userId == $userId]`,
  { userId }
);

// Compare data
const inconsistencies = findDataInconsistencies(supabaseData, sanityData);
```

**Solution Steps:**
1. Run data consistency check
2. Identify source of truth (usually Stripe)
3. Update inconsistent records
4. Implement monitoring to prevent future issues

### **Debug Commands**

#### **Check User Subscriptions**
```bash
# Via Supabase CLI
supabase db query "SELECT * FROM user_subscriptions WHERE user_id = 'user-uuid'"

# Via API
curl -X GET "https://your-app.com/api/admin/subscriptions?userId=user-uuid" \
  -H "Authorization: Bearer admin-token"
```

#### **Sync Stripe Status**
```bash
# Force sync for specific user
curl -X POST "https://your-app.com/api/stripe/subscriptions/status" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-uuid"}'
```

#### **Check Webhook Logs**
```bash
# View recent webhook events
stripe events list --limit 50

# Get specific event
stripe events retrieve evt_webhook_id
```

### **Performance Optimization**

#### **Database Queries**
```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_user_subscriptions_user_status 
ON user_subscriptions(user_id, status) WHERE NOT is_deleted;

-- Optimize subscription lookup
CREATE INDEX CONCURRENTLY idx_user_subscriptions_stripe_lookup
ON user_subscriptions(stripe_subscription_id) WHERE is_active;
```

#### **Caching Strategy**
```typescript
// Cache subscription data
const cacheKey = `user_subscriptions:${userId}`;
const cachedData = await redis.get(cacheKey);

if (cachedData) {
  return JSON.parse(cachedData);
}

const subscriptions = await fetchSubscriptions(userId);
await redis.setex(cacheKey, 300, JSON.stringify(subscriptions)); // 5 min cache
```

---

## 📈 **Scaling Considerations**

### **Database Performance**
- **Connection Pooling**: Use pgBouncer for high concurrent connections
- **Read Replicas**: Separate read/write operations
- **Partitioning**: Partition large tables by user_id or date
- **Indexing**: Monitor query performance and add indexes

### **API Performance**
- **Rate Limiting**: Implement per-endpoint limits
- **Request Deduplication**: Prevent duplicate operations
- **Async Processing**: Use queues for heavy operations
- **Caching**: Cache frequent queries

### **Monitoring & Alerting**
- **Error Rates**: Monitor API error rates
- **Response Times**: Track API performance
- **Webhook Failures**: Alert on webhook processing failures
- **Database Health**: Monitor connection counts and query performance

---

## 🚀 **Getting Started (New Developer)**

### **1. Environment Setup**
```bash
# Clone repository
git clone <repository-url>
cd forher

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in required values (see SECURITY_IMPLEMENTATION.md)

# Start development server
npm run dev
```

### **2. Database Access**
```bash
# Connect to Supabase
npx supabase login
npx supabase link --project-ref <project-ref>

# Run migrations (if any)
npx supabase db push
```

### **3. First Changes**
1. **Read this documentation** completely
2. **Explore the codebase** following the file structure
3. **Test locally** with Stripe test keys
4. **Make small changes** first to understand the flow
5. **Ask questions** about anything unclear

### **4. Common Development Tasks**

#### **Add New Subscription Plan**
1. Create in Sanity Studio
2. Add Stripe Product/Price
3. Link Stripe IDs in Sanity
4. Test purchase flow
5. Update frontend if needed

#### **Modify Subscription Logic**
1. Update database schema if needed
2. Modify API endpoints
3. Update webhook handlers
4. Test with Stripe webhook simulator
5. Update frontend components

#### **Debug Subscription Issue**
1. Check user's subscription in database
2. Verify Stripe subscription status
3. Check webhook logs
4. Review application logs
5. Use troubleshooting guide

---

## 📚 **Additional Resources**

### **Documentation Links**
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Supabase Documentation](https://supabase.com/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

### **Internal Resources**
- `SECURITY_IMPLEMENTATION.md` - Security setup guide
- `API_REFERENCE.md` - Detailed API documentation
- `DEPLOYMENT_GUIDE.md` - Production deployment steps
- `TESTING_GUIDE.md` - Testing procedures

### **Support Channels**
- **Code Reviews**: All subscription-related changes require review
- **Documentation**: Update this doc when making architectural changes
- **Monitoring**: Check dashboards for system health
- **Alerts**: Set up notifications for critical failures

---

*This documentation is maintained by the development team. Last updated: [Current Date]*
*For questions or updates, contact the team lead or create an issue in the repository.*