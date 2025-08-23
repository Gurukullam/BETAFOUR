# Quick Test Setup Guide
## Ready to Test with Your Stripe Test Keys! 🚀

### 📋 You Have: pk_test_ and sk_test_ keys ✅
### 🎯 Next: Complete setup and start testing with test cards

---

## ⚡ Step 1: Update Configuration Files (2 minutes)

### Update `Reference-Lookup/Stripe-Integration.js`
**Find this line:**
```javascript
publishableKey: 'PASTE_YOUR_pk_test_KEY_HERE', // 👈 REPLACE WITH YOUR ACTUAL pk_test_ KEY
```

**Replace with your actual pk_test_ key:**
```javascript
publishableKey: 'pk_test_51ABC123...', // Your actual test publishable key
```

### ✅ **No webhook configuration needed for testing!**
The webhook handler is **only needed for production**. Test payments are simulated directly in the frontend.

---

## 📦 Step 2: Create Test Products in Stripe Dashboard (3 minutes)

### Go to Stripe Dashboard:
1. **Visit**: https://dashboard.stripe.com
2. **Toggle to**: "Test Mode" (top-left corner) 
3. **Navigate to**: Products
4. **Click**: "Add product"

### Create These 3 Products:

#### Weekly Plan
```
Product Name: IELTS Practice - Weekly Plan
Description: Perfect for short-term IELTS preparation
Price: $4.99 CAD
Billing: Recurring every 1 week
```
📝 **Copy the Price ID**: `price_...` (you'll need this)

#### Monthly Plan  
```
Product Name: IELTS Practice - Monthly Plan
Description: Ideal for comprehensive IELTS practice
Price: $14.99 CAD
Billing: Recurring every 1 month
```
📝 **Copy the Price ID**: `price_...` (you'll need this)

#### Quarterly Plan
```
Product Name: IELTS Practice - Quarterly Plan  
Description: Best value for complete IELTS mastery
Price: $29.99 CAD
Billing: Recurring every 3 months
```
📝 **Copy the Price ID**: `price_...` (you'll need this)

---

## 🔗 Step 3: Update Price IDs in Configuration

### Update `Reference-Lookup/Stripe-Integration.js`
**Find the SUBSCRIPTION_PLANS section and replace the placeholder price IDs:**

```javascript
const SUBSCRIPTION_PLANS = {
    weekly: {
        priceId: 'price_YOUR_ACTUAL_WEEKLY_PRICE_ID',    // 👈 PASTE YOUR WEEKLY PRICE ID
        amount: 499,
        currency: 'cad',
        interval: 'week',
        name: 'Weekly Plan',
        description: 'Perfect for short-term IELTS preparation'
    },
    monthly: {
        priceId: 'price_YOUR_ACTUAL_MONTHLY_PRICE_ID',   // 👈 PASTE YOUR MONTHLY PRICE ID
        amount: 1499,
        currency: 'cad',
        interval: 'month',
        name: 'Monthly Plan',
        description: 'Ideal for comprehensive IELTS practice'
    },
    quarterly: {
        priceId: 'price_YOUR_ACTUAL_QUARTERLY_PRICE_ID', // 👈 PASTE YOUR QUARTERLY PRICE ID
        amount: 2999,
        currency: 'cad',
        interval: 'month',
        intervalCount: 3,
        name: 'Quarterly Plan',
        description: 'Best value for complete IELTS mastery'
    }
};
```

---

## 🧪 Step 4: Add Integration to Your IELTS Page

### Add to your `IELTS/index.html` before `</body>`:
```html
<!-- Stripe Integration -->
<script src="Reference-Lookup/Include-Stripe-Integration.js"></script>
```

This will automatically:
- Load Stripe.js
- Initialize the payment integration
- Replace the existing payment form with Stripe Elements
- Add customer portal button for authenticated users

---

## 🎯 Step 5: Test with Test Cards

### Open your IELTS page and:
1. **Click**: Subscribe button
2. **Select**: Any plan (Weekly/Monthly/Quarterly)
3. **Use test card**: `4242424242424242`
4. **Expiry**: Any future date (e.g., `12/25`)
5. **CVC**: Any 3 digits (e.g., `123`)
6. **Submit payment**

### Expected Results:
✅ **Payment succeeds**  
✅ **Firebase fields updated**:
- `Subscription` = `"Y"`
- `Date_Subscription_Start` = Current date (UTC-4)
- `Date_Subscription_End` = Start date + plan duration
- `Plan` = `"Weekly"/"Monthly"/"Quarterly"`
- `Amount` = `499/1499/2999`

### Test Different Scenarios:
```
✅ Success Card: 4242424242424242
❌ Decline Card: 4000000000000002  
🔐 3D Secure: 4000002760003184
❌ Insufficient Funds: 4000000000009995
```

---

## 🔍 Step 6: Verify Integration

### Check Browser Console:
```
🎯 Look for these messages:
✅ "Stripe Integration ready!"
✅ "Payment successful with UTC-4 timezone!"
✅ "Firebase updated with validated UTC-4 subscription data"
```

### Check Firebase:
Verify your user document has the new subscription fields updated.

### Check Stripe Dashboard:
Go to Payments to see the test transaction.

---

## 🆘 Quick Troubleshooting

| **Issue** | **Solution** |
|-----------|-------------|
| "Stripe.js not loading" | Check internet connection, verify script tag |
| "No such price" | Verify price IDs copied correctly from Stripe Dashboard |
| "Payment form not showing" | Check browser console for JavaScript errors |
| "Firebase not updating" | Check Firebase console for error messages |

---

## 📞 Ready for Help

### Once you've completed configuration:
1. **Test with test card**: `4242424242424242`
2. **Check results** in browser console and Firebase
3. **Report any issues** and I'll help troubleshoot

### If everything works:
🎉 **Success!** You're ready to collect real payments with your live keys!

---

## 🚀 Next Steps After Testing

1. ✅ **All test scenarios pass**
2. 🔄 **Switch to live keys** (replace pk_test/sk_test with pk_live/sk_live)
3. 🔄 **Create live products** in Stripe Dashboard
4. 🔄 **Set testMode: false** in configuration
5. 💳 **Accept real payments!**

---

**🎯 ACTION NOW**: Update your configuration files with the actual test keys and start testing!

**💡 Need Help?** Share any error messages from browser console and I'll help troubleshoot immediately. 