# 🚀 Quick Start Guide - Subscription System

## 📋 **For New Developers - 15 Minutes to Productivity**

### **1. Understanding the System (5 minutes)**

```
┌─────────────────────────────────────────────────────────────────┐
│  USER JOURNEY: How Subscriptions Work                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User browses /subscriptions                                │
│  2. User selects plan → /api/stripe/subscriptions              │
│  3. Stripe checkout → Payment                                   │
│  4. Webhook → Database update                                   │
│  5. User sees active subscription in /account/subscriptions    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **2. Key Files to Know (5 minutes)**

```
📁 CRITICAL FILES (Must understand these first)
├── src/store/subscriptionStore.ts          ← User subscription state
├── src/app/api/stripe/subscriptions/route.ts ← Purchase API
├── src/app/api/stripe/webhook/route.ts      ← Stripe events
├── src/services/subscriptionService.ts     ← Business logic
└── src/types/supabase.ts                   ← Database schema

📁 FRONTEND COMPONENTS (UI layers)
├── src/app/(default)/subscriptions/page.tsx ← Plans listing
├── src/app/account/subscriptions/page.tsx   ← User's subscriptions
└── src/hooks/useSubscriptionPurchase.ts     ← Purchase logic

📁 SECURITY & UTILS (Recently added)
├── src/utils/adminAuth.ts                   ← Admin verification
├── src/utils/rateLimit.ts                   ← Rate limiting
├── src/utils/validation.ts                  ← Input validation
└── SECURITY_IMPLEMENTATION.md               ← Security setup
```

### **3. Test the System (5 minutes)**

```bash
# 1. Start the app
npm run dev

# 2. Visit these URLs
http://localhost:3000/subscriptions        # Browse plans
http://localhost:3000/account/subscriptions # User's subscriptions

# 3. Test with Stripe test cards
Card: 4242 4242 4242 4242
CVV: 123
Date: Any future date
```

## 🎯 **Common Tasks**

### **Task 1: Add New Subscription Plan**
```typescript
// 1. Add in Sanity Studio (http://localhost:3333/studio)
{
  _type: 'subscription',
  title: 'Pro Plan',
  price: 49.99,
  billingPeriod: 'monthly',
  features: [
    { featureText: 'Unlimited access' },
    { featureText: 'Priority support' }
  ],
  isActive: true
}

// 2. Create in Stripe Dashboard
// 3. Link Stripe Price ID back to Sanity
// 4. Test purchase flow
```

### **Task 2: Debug Subscription Issue**
```typescript
// 1. Check user's subscription in database
const { data } = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('user_id', 'user-uuid');

// 2. Check Stripe subscription
const subscription = await stripe.subscriptions.retrieve('sub_xxx');

// 3. Check webhook logs
console.log('Recent webhook events:', webhookLogs);

// 4. Manual sync if needed
await syncSubscriptionStatuses(userId);
```

### **Task 3: Modify Subscription Logic**
```typescript
// 1. Update business logic
// src/services/subscriptionService.ts
export async function customSubscriptionLogic() {
  // Your logic here
}

// 2. Update API endpoint
// src/app/api/stripe/subscriptions/route.ts
// Add your logic to POST handler

// 3. Update webhook handler if needed
// src/app/api/stripe/webhook/handlers/subscriptions.ts

// 4. Update frontend state
// src/store/subscriptionStore.ts
```

## 🔧 **Development Workflow**

### **Before Making Changes**
1. **Read the architecture docs** (SUBSCRIPTION_ARCHITECTURE.md)
2. **Test locally** with Stripe test mode
3. **Check existing tests** don't break
4. **Follow security guidelines**

### **Making Changes**
1. **Database first** - Update schema if needed
2. **API second** - Update endpoints
3. **Frontend third** - Update components
4. **Test thoroughly** - All user flows

### **After Changes**
1. **Test with real Stripe webhook** (use ngrok)
2. **Check logs** for errors
3. **Update documentation** if needed
4. **Code review** before merge

## 🔍 **Debugging Checklist**

### **Subscription Not Working?**
```bash
# Check these in order:
□ User authenticated?
□ Stripe webhook received?
□ Database updated?
□ Frontend state updated?
□ No rate limiting?
□ No validation errors?
```

### **Payment Failing?**
```bash
# Check these:
□ Valid payment method?
□ Stripe test/live mode correct?
□ Customer exists in Stripe?
□ 3D Secure if required?
□ Webhook endpoint accessible?
```

### **Data Inconsistency?**
```bash
# Check these:
□ Stripe subscription status?
□ Supabase record exists?
□ Sanity record exists?
□ Webhook processed successfully?
□ Manual sync needed?
```

## 📊 **Key Metrics to Monitor**

### **Health Indicators**
- **Subscription Conversion Rate**: % of users who complete purchase
- **Webhook Success Rate**: % of webhooks processed successfully
- **Database Sync Status**: Consistency between Stripe ↔ Supabase
- **API Response Times**: Purchase and cancel endpoints
- **Error Rates**: Failed purchases, webhook failures

### **Business Metrics**
- **Active Subscriptions**: Currently paying users
- **Churn Rate**: Subscription cancellations
- **Revenue Metrics**: MRR, ARR from subscriptions
- **Plan Popularity**: Which plans are most popular

## 🚨 **Emergency Procedures**

### **If Webhooks Are Failing**
```bash
# 1. Check webhook endpoint health
curl -X POST https://your-app.com/api/stripe/webhook

# 2. Check Stripe webhook logs
stripe events list --limit 10

# 3. Manual sync if needed
# Via API or database query

# 4. Fix webhook and replay events
stripe events resend evt_webhook_id
```

### **If Payments Are Failing**
```bash
# 1. Check Stripe dashboard for errors
# 2. Verify API keys are correct
# 3. Check webhook endpoint is accessible
# 4. Review application logs
# 5. Contact Stripe support if needed
```

### **If Database Is Corrupted**
```bash
# 1. Identify scope of issue
# 2. Backup current data
# 3. Use Stripe as source of truth
# 4. Run data sync script
# 5. Verify data integrity
```

## 🔐 **Security Checklist**

### **Before Deploying**
```bash
□ All environment variables set?
□ Admin emails configured correctly?
□ Rate limiting enabled?
□ Input validation working?
□ Error messages don't leak data?
□ HTTPS enabled?
□ Webhook signature verification?
```

### **Regular Security Tasks**
```bash
□ Review admin access list
□ Check for suspicious activity
□ Monitor rate limiting metrics
□ Update dependencies
□ Review error logs
□ Test backup procedures
```

## 📚 **Learning Resources**

### **Must-Read Documentation**
1. **SUBSCRIPTION_ARCHITECTURE.md** - Complete system overview
2. **SECURITY_IMPLEMENTATION.md** - Security setup and guidelines
3. **Stripe Documentation** - Payment processing
4. **Supabase Documentation** - Database operations

### **Code Examples**
```typescript
// Example: Creating a new subscription
const result = await fetch('/api/stripe/subscriptions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriptionId: 'plan-uuid',
    userId: 'user-uuid',
    userEmail: 'user@example.com'
  })
});

// Example: Canceling a subscription
const result = await fetch('/api/stripe/subscriptions/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriptionId: 'sub-uuid',
    immediate: true
  })
});

// Example: Using subscription store
const { 
  subscriptions, 
  hasActiveSubscription, 
  fetchUserSubscriptions 
} = useSubscriptionStore();

useEffect(() => {
  if (user?.id) {
    fetchUserSubscriptions(user.id);
  }
}, [user?.id]);
```

## 🎉 **You're Ready!**

After reading this guide, you should be able to:
- ✅ Understand the subscription system architecture
- ✅ Test the system locally
- ✅ Debug common issues
- ✅ Make basic changes safely
- ✅ Know where to find help

**Next Steps:**
1. Read the full SUBSCRIPTION_ARCHITECTURE.md
2. Make your first small change
3. Test thoroughly
4. Ask questions in team chat

**Remember:** This is an enterprise-level system handling real payments. Always test thoroughly and follow security guidelines!

---

*Happy coding! 🚀*