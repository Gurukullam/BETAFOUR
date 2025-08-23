# Stripe Testing to Production Migration Guide
## IELTS Subscription System - Safe Testing to Live Deployment

### 📋 Overview
This guide walks you through testing your Stripe integration with test cards first, then safely migrating to live payments with your production keys.

---

## 🧪 Phase 1: Testing with Test Keys & Test Cards

### Why Test First?
- **Safety**: No real money transactions during development
- **Validation**: Verify all functionality works correctly
- **Debugging**: Fix issues without affecting real customers
- **Compliance**: Test all payment scenarios and edge cases

### Required Test Keys
You need **separate test keys** from your Stripe Dashboard:

```
📍 GET YOUR TEST KEYS:
1. Go to: https://dashboard.stripe.com
2. Toggle to "Test Mode" (top-left corner)
3. Navigate to: Developers > API Keys
4. Copy these TEST keys:
   - Publishable key: pk_test_...
   - Secret key: sk_test_...
5. Navigate to: Developers > Webhooks  
6. Create test webhook and get:
   - Webhook secret: whsec_test_...
```

### Test Configuration
Update your integration files with TEST keys:

#### 1. Update `Stripe-Integration.js`:
```javascript
const STRIPE_CONFIG = {
    publishableKey: 'pk_test_51ABC123...', // Your actual TEST publishable key
    testMode: true,
    currency: 'cad'
};
```

#### 2. Update `stripe-webhook-handler.html`:
```javascript
const WEBHOOK_CONFIG = {
    stripeSecretKey: 'sk_test_51ABC123...', // Your actual TEST secret key
    webhookSecret: 'whsec_test_123...', // Your actual TEST webhook secret
    testMode: true
};
```

### Test Cards for Development
Once you have test keys configured, use these test cards:

| **Purpose** | **Card Number** | **Result** |
|-------------|-----------------|------------|
| **Success** | `4242424242424242` | ✅ Payment succeeds |
| **Decline** | `4000000000000002` | ❌ Payment declined |
| **Insufficient Funds** | `4000000000009995` | ❌ Insufficient funds |
| **3D Secure** | `4000002760003184` | 🔐 Requires authentication |
| **Expired** | `4000000000000069` | ❌ Expired card |

**For all test cards:**
- Use any future expiry date (e.g., 12/25)
- Use any 3-digit CVC (e.g., 123)
- Use any billing ZIP code

---

## ✅ Phase 2: Testing Checklist

### Firebase Field Testing
Verify these fields are updated correctly in Firebase:

- [ ] `Subscription` = `"Y"` ✅
- [ ] `Date_Subscription_Start` = UTC-4 current date ✅
- [ ] `Date_Subscription_End` = Start date + plan duration ✅
- [ ] `Plan` = `"Weekly"/"Monthly"/"Quarterly"` ✅
- [ ] `Amount` = `499/1499/2999` ✅

### Payment Flow Testing
- [ ] Weekly plan ($4.99) - Test card payment ✅
- [ ] Monthly plan ($14.99) - Test card payment ✅
- [ ] Quarterly plan ($29.99) - Test card payment ✅
- [ ] Payment decline handling ✅
- [ ] 3D Secure authentication ✅
- [ ] Mobile payment form responsiveness ✅

### UTC-4 Timezone Testing
- [ ] Date conversion from web API working ✅
- [ ] Fallback timezone conversion working ✅
- [ ] Subscription end date calculation accurate ✅
- [ ] Firebase dates stored in UTC-4 format ✅

### Integration Testing
- [ ] Stripe Elements loading correctly ✅
- [ ] Payment form validation working ✅
- [ ] Success/error messages displaying ✅
- [ ] Firebase subscription status updating ✅
- [ ] User subscription access granted ✅

---

## 🚀 Phase 3: Production Migration

### When to Go Live
Only migrate to production after:
- [ ] All test scenarios pass
- [ ] Firebase integration working correctly
- [ ] Payment flows tested thoroughly
- [ ] Error handling validated
- [ ] Mobile experience verified

### Production Keys Setup

#### 1. Create Production Products in Stripe
```
📍 PRODUCTION SETUP:
1. Go to: https://dashboard.stripe.com
2. Toggle to "Live Mode" (top-left corner)  
3. Navigate to: Products
4. Create three products:
   - Weekly Plan: $4.99 CAD
   - Monthly Plan: $14.99 CAD  
   - Quarterly Plan: $29.99 CAD
5. Copy the Price IDs (price_live_...)
```

#### 2. Configure Production Webhook
```
📍 WEBHOOK SETUP:
1. In Live Mode: Developers > Webhooks
2. Add endpoint: https://yourdomain.com/stripe-webhook
3. Select events:
   ✅ checkout.session.completed
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
4. Copy webhook secret (whsec_live_...)
```

### Production Configuration Update

#### Step 1: Update API Keys
Replace test keys with your live keys:

**`Stripe-Integration.js`:**
```javascript
const STRIPE_CONFIG = {
    publishableKey: 'pk_live_YOUR_ACTUAL_LIVE_KEY', // Your live publishable key
    testMode: false, // Set to false for production
    currency: 'cad'
};
```

**`stripe-webhook-handler.html`:**
```javascript
const WEBHOOK_CONFIG = {
    stripeSecretKey: 'sk_live_YOUR_ACTUAL_LIVE_KEY', // Your live secret key
    webhookSecret: 'whsec_live_YOUR_ACTUAL_WEBHOOK_SECRET', // Your live webhook secret
    testMode: false // Set to false for production
};
```

#### Step 2: Update Product Price IDs
```javascript
const SUBSCRIPTION_PLANS = {
    weekly: {
        priceId: 'price_live_WEEKLY_PRICE_ID', // Your live weekly price ID
        amount: 499,
        currency: 'cad',
        interval: 'week',
        name: 'Weekly Plan'
    },
    monthly: {
        priceId: 'price_live_MONTHLY_PRICE_ID', // Your live monthly price ID
        amount: 1499,
        currency: 'cad',
        interval: 'month', 
        name: 'Monthly Plan'
    },
    quarterly: {
        priceId: 'price_live_QUARTERLY_PRICE_ID', // Your live quarterly price ID
        amount: 2999,
        currency: 'cad',
        interval: 'month',
        intervalCount: 3,
        name: 'Quarterly Plan'
    }
};
```

---

## 🔒 Security Best Practices

### Key Management
- [ ] Never expose secret keys in frontend code
- [ ] Use environment variables in production
- [ ] Rotate keys regularly
- [ ] Monitor key usage in Stripe Dashboard

### Webhook Security
- [ ] Always verify webhook signatures
- [ ] Use HTTPS for all webhook endpoints
- [ ] Implement webhook event deduplication
- [ ] Log all webhook events for audit

### Production Monitoring
- [ ] Set up Stripe Dashboard notifications
- [ ] Monitor payment success/failure rates
- [ ] Track subscription metrics
- [ ] Set up alerts for failed payments

---

## 🧪 Your Current Setup Plan

### Step 1: Get Test Keys (Now)
```
🎯 ACTION REQUIRED:
1. Go to Stripe Dashboard (Test Mode)
2. Get your test keys:
   - pk_test_... (publishable)
   - sk_test_... (secret)
   - whsec_test_... (webhook)
3. Update configuration files
4. Test with test cards
```

### Step 2: Test Everything
- Use test cards: `4242424242424242`
- Verify Firebase field updates
- Test all three subscription plans
- Validate UTC-4 timezone logic

### Step 3: Go Live (After Testing)
```
🚀 PRODUCTION MIGRATION:
1. Replace test keys with your live keys:
   - pk_live_... (you have this)
   - sk_live_... (you have this)  
   - whsec_live_... (you have this)
2. Update Price IDs with live product IDs
3. Set testMode: false
4. Test with real cards
```

---

## 🆚 Test vs Live Comparison

| **Aspect** | **Test Mode** | **Live Mode** |
|------------|---------------|---------------|
| **Keys** | `pk_test_...`, `sk_test_...` | `pk_live_...`, `sk_live_...` |
| **Cards** | Test cards only | Real cards only |
| **Money** | No real transactions | Real money processed |
| **Products** | Test products | Live products |
| **Webhooks** | Test webhook endpoint | Live webhook endpoint |
| **Dashboard** | Test data | Live transaction data |

---

## 📞 Support & Troubleshooting

### Common Issues
- **"No such price"**: Update Price IDs to match your products
- **"Test card in live mode"**: Switch to test mode or use real cards
- **Webhook not receiving**: Check endpoint URL and HTTPS
- **Authentication failed**: Verify API keys are correct

### Testing Resources
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
- [3D Secure Testing](https://stripe.com/docs/testing#regulatory-cards)

---

## ✅ Migration Checklist

### Pre-Migration
- [ ] All tests passing with test keys
- [ ] Firebase integration working
- [ ] UTC-4 timezone logic validated
- [ ] Error handling tested
- [ ] Mobile experience verified

### Migration Process
- [ ] Live products created in Stripe
- [ ] Live webhook endpoint configured
- [ ] Configuration files updated with live keys
- [ ] Price IDs updated to live products
- [ ] testMode set to false

### Post-Migration Validation
- [ ] Small real payment test
- [ ] Firebase field updates verified
- [ ] Subscription access granted
- [ ] Webhook events processing
- [ ] Customer portal access working

---

**🎯 NEXT STEPS**: Get your test keys from Stripe Dashboard and start testing with test cards!

**📧 Need Help?** The Stripe integration is ready - just need your test keys to begin safe testing.

---

**Document Version**: 1.0  
**Created**: December 2024  
**Target**: Safe testing before live deployment 