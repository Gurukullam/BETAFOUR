# 🚀 Your Immediate Next Steps
## Test Keys Configured - Ready to Test!

---

## ✅ **COMPLETED:**
- **Test Keys Configured** ✅
- **Publishable Key**: `pk_test_51Rr5H03Q...` ✅ (already added to config)
- **Secret Key**: `sk_test_51Rr5H03Q...` ✅ (stored for production webhook later)

---

## 📋 **STEP 2: CREATE SUBSCRIPTION PRODUCTS**

### **🎯 Create 3 Products in Stripe Dashboard:**

#### **1️⃣ Weekly Plan**
- **Name**: `Weekly Plan`
- **Price**: `$9.99 CAD`
- **Billing**: `Recurring` → `Weekly`

#### **2️⃣ Monthly Plan** 
- **Name**: `Monthly Plan`
- **Price**: `$24.99 CAD`
- **Billing**: `Recurring` → `Monthly`

#### **3️⃣ Quarterly Plan**
- **Name**: `Quarterly Plan`
- **Price**: `$59.99 CAD`
- **Billing**: `Recurring` → `Every 3 months`

---

## 🔧 **STEP 3: UPDATE PRICE IDs**

### **📝 Replace Mock Price IDs:**
**File**: `Reference-Lookup/Stripe-Integration.js`

```javascript
const SUBSCRIPTION_PLANS = {
    weekly: {
        priceId: 'price_YOUR_ACTUAL_WEEKLY_PRICE_ID_HERE',    // ← Replace this
        amount: 999,                                          // $9.99 CAD
        currency: 'cad',
        interval: 'week',
        name: 'Weekly Plan',
        description: 'Perfect for short-term IELTS preparation'
    },
    monthly: {
        priceId: 'price_YOUR_ACTUAL_MONTHLY_PRICE_ID_HERE',   // ← Replace this
        amount: 2499,                                         // $24.99 CAD
        currency: 'cad',
        interval: 'month',
        name: 'Monthly Plan',
        description: 'Ideal for comprehensive IELTS study'
    },
    quarterly: {
        priceId: 'price_YOUR_ACTUAL_QUARTERLY_PRICE_ID_HERE', // ← Replace this
        amount: 5999,                                         // $59.99 CAD
        currency: 'cad',
        interval: 'quarter',
        name: 'Quarterly Plan',
        description: 'Best value for extended IELTS preparation'
    }
};
```

---

## 🎯 **Then Add to Your IELTS Page:**

### **Edit `IELTS/index.html`**
**Add this line before `</body>`:**
```html
<script src="../Reference-Lookup/Include-Stripe-Integration.js"></script>
```

---

### **🧪 TEST PAYMENT IMMEDIATELY:**

#### **Test Data:**
- **Card**: `4242 4242 4242 4242`
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **Name**: Your name
- **Amount**: $9.99 CAD

---

### **🔍 EXPECTED FIREBASE UPDATES:**
```javascript
// Weekly Plan Test
Date_Subscription_Start: 2024-01-15T10:30:00Z (UTC-4)
Date_Subscription_End: 2024-01-22T10:30:00Z (UTC-4) 
Subscription: "Y"
Plan: "Weekly"
Amount: "$9.99 CAD" (or "$24.99 CAD"/"$59.99 CAD")
```

---

## 🔍 **If Something Goes Wrong:**

### **Common Issues:**
1. **"Invalid API key"** → Check publishable key in config
2. **"Price not found"** → Check Price IDs match Stripe Dashboard
3. **"Payment failed"** → Use exact test card: `4242424242424242`
4. **Firebase errors** → Check browser console for specific error

### **Test Different Cards:**
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **3D Secure**: `4000002760003184`

---

## 📞 **Ready to Proceed?**

### **Your TODO List:**
1. **✅ Test keys configured** (DONE)
2. **📝 Create 3 products** in Stripe Dashboard (5 min)
3. **📝 Update Price IDs** in config file (1 min)
4. **📝 Add script** to IELTS page (30 sec)
5. **🧪 Test payment!** (1 min)

**Total time needed: ~7 minutes** ⏱️

---

## 🎯 **Production Migration (Later):**

### **When Testing Works:**
1. **Replace** `pk_test_` → `pk_live_` (you have this ✅)
2. **Add webhook** with `sk_live_` + `whsec_live_` (you have these ✅)
3. **Create live products** in Stripe Dashboard
4. **Set** `testMode: false`
5. **Go live!** 🚀

---

**🚀 Ready to create your test products in Stripe Dashboard?**

**Next**: Go to https://dashboard.stripe.com → Products → Add product 