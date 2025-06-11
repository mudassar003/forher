# Admin Price Sync System

A TypeScript-strict admin interface for synchronizing subscription prices between Sanity CMS and Stripe, with full support for subscription variants.

## Files Created

```
src/
├── app/
│   ├── admin/
│   │   └── price-sync/
│   │       ├── layout.tsx          # Admin layout with navigation
│   │       └── page.tsx            # Main admin page component
│   └── api/admin/
│       ├── price-comparison/
│       │   └── route.ts            # GET endpoint for price comparison
│       └── sync-price/
│           └── route.ts            # POST endpoint for individual sync
├── types/
│   └── admin-price-sync.ts        # TypeScript interfaces
└── utils/
    └── priceSync.ts               # Utility functions
```

## Features

### ✅ **Manual Control**
- View all subscriptions and variants in a comparison table
- Individual "Sync" or "Create" buttons per row
- No bulk operations - you control each action

### ✅ **Variant Support**
- Handles both base subscriptions and subscription variants
- Each variant gets its own row with status and action
- Proper Sanity path updates for variants

### ✅ **Status Tracking**
- **OK**: Prices match between Sanity and Stripe ✅
- **DIFFERENT**: Prices don't match ⚠️
- **MISSING**: No Stripe Price ID in Sanity ❌
- **NOT_FOUND**: Invalid Stripe Price ID ❌
- **ERROR**: API error occurred 🔴

### ✅ **TypeScript Strict**
- All interfaces properly defined
- No `any` types used
- Proper error handling with type guards
- Null safety everywhere

### ✅ **Vercel Compatible**
- API routes use proper Next.js patterns
- No Node.js specific APIs
- Edge runtime compatible
- Proper error responses

## Setup Instructions

### 1. Install Dependencies
```bash
# These should already be installed in your project
npm install stripe @sanity/client groq next-sanity
```

### 2. Environment Variables
Ensure these are set in your `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. Add Files to Your Project
Copy all the artifacts to their respective locations in your `src/` directory.

### 4. Update Your Admin Navigation
Add a link to the price sync page in your existing admin layout:
```tsx
<Link href="/admin/price-sync">Price Sync</Link>
```

### 5. Access the Admin Interface
Navigate to `/admin/price-sync` in your browser.

## How It Works

### 1. **Price Comparison**
- Fetches all active subscriptions from Sanity
- For each subscription (and its variants), compares Sanity price with Stripe price
- Displays status and required actions

### 2. **Individual Sync Actions**
- **Sync**: Creates new Stripe price → Archives old price → Updates Sanity
- **Create**: Creates new Stripe price → Updates Sanity (for missing price IDs)

### 3. **Variant Handling**
- Base subscriptions: Single row per subscription
- With variants: Multiple rows (one per variant)
- Each variant has its own Stripe Price ID

## API Endpoints

### GET `/api/admin/price-comparison`
Returns comparison data for all subscriptions and variants.

**Response:**
```typescript
{
  success: boolean;
  rows: PriceComparisonRow[];
  error?: string;
}
```

### POST `/api/admin/sync-price`
Syncs an individual subscription or variant price.

**Request:**
```typescript
{
  subscriptionId: string;
  variantKey?: string;    // Optional for variants
  action: 'sync' | 'create';
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  newPriceId?: string;
  error?: string;
}
```

## Usage Examples

### Basic Workflow
1. Visit `/admin/price-sync`
2. Review the comparison table
3. Click "Sync" for price mismatches
4. Click "Create" for missing price IDs
5. Refresh to see updated status

### Handling Variants
- Each variant appears as a separate row
- Variant title and key are displayed
- Actions affect only that specific variant
- Base subscription and variants are independent

## Error Handling

The system gracefully handles:
- Invalid Stripe Price IDs
- Missing Stripe Product IDs
- API rate limits
- Network failures
- Malformed Sanity data

## Security Considerations

- Admin-only routes (add authentication as needed)
- Input validation on all API endpoints
- Safe Stripe API operations
- Proper error logging

## Performance Notes

- Fetches prices individually to avoid rate limits
- Uses parallel processing where safe
- Caches comparison results until refresh
- Shows loading states for user feedback

## Extending the System

### Add Bulk Operations
```typescript
// Add to the admin page
const syncAllMismatched = async () => {
  const itemsToSync = rows.filter(row => row.needsAction);
  // Process in batches
};
```

### Add Scheduling
```typescript
// Add to API route
if (schedule) {
  // Store sync job for later execution
}
```

### Add Notifications
```typescript
// Add to sync completion
await sendSlackNotification(`Synced ${count} prices`);
```

This system provides a solid foundation for price management while maintaining full control and visibility over all operations.