# 🔑 API Key Management Strategy

## 🛡️ Secure Development Workflow

### **Current Issue:**
- GitHub blocks pushes with hardcoded API keys
- We need keys for development but can't commit them
- Manual removal/re-addition is inefficient

### **✅ Solution: Environment-Based Keys**

**For Development (Local):**
```javascript
// Use hardcoded keys for local development
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_...');
```

**For Production (Vercel):**
```javascript
// Use environment variables only
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

### **🔄 Automated Workflow:**

**Before GitHub Push:**
```bash
# Run pre-push script
./scripts/pre-push.sh
git add .
git commit -m "Your commit message"
git push origin main
```

**After GitHub Push:**
```bash
# Run post-push script to restore keys
./scripts/post-push.sh
```

### **📁 File Structure:**
```
vercel-stripe-backend/
├── api/
│   ├── create-payment-intent.js (env only)
│   ├── create-transfer.js (env only)
│   └── ...
├── .env.local (local development keys)
├── .env.production (production keys)
└── scripts/
    ├── pre-push.sh
    └── post-push.sh
```

### **🔧 Implementation:**

1. **Create .env.local** (not committed to Git)
2. **Create pre-push script** to remove keys
3. **Create post-push script** to restore keys
4. **Use environment variables** in production

### **✅ Benefits:**
- ✅ Development works with local keys
- ✅ GitHub pushes succeed without keys
- ✅ Production uses secure environment variables
- ✅ Automated workflow reduces manual work
- ✅ No risk of accidentally committing keys

---

## 💰 Revenue Calculation Explanation

### **How Revenue is Generated:**

**Platform Revenue Sources:**
1. **Tip Processing Fees** - 2.9% + $0.30 per tip
2. **Platform Service Fees** - Additional percentage from tips
3. **Subscription Revenue** - Premium features
4. **AdSense Revenue** - Display ads

### **Revenue Calculation Logic:**

**For $1.00 Tip:**
- **Creator Receives:** $0.97 (after Stripe fees)
- **Platform Revenue:** $0.03 (Stripe fee)
- **Additional Platform Fee:** $0.10 (example)
- **Total Platform Revenue:** $0.13 per $1.00 tip

### **Why Revenue Shows $2.00 Instead of $1.00:**

**Possible Reasons:**
1. **Duplicate Tip Processing** - Tip processed twice
2. **Test vs Live Transactions** - Both counted
3. **Platform Fee Calculation** - Fees added to total
4. **Multiple Tip Sources** - Different tip methods

### **Revenue Metrics Breakdown:**

**Platform Revenue =**
- Stripe processing fees (2.9% + $0.30)
- Platform service fees (additional %)
- Subscription revenue
- AdSense revenue

**Creator Earnings =**
- Tip amount minus Stripe fees
- Minus platform service fees
- Available for cashout

### **Fix Revenue Calculation:**

The issue is likely in the admin analytics where platform revenue is being calculated incorrectly. We need to:

1. **Separate tip amounts from platform fees**
2. **Only count actual platform revenue**
3. **Exclude duplicate transactions**
4. **Show clear breakdown of revenue sources**

**This explains why you see $2.00 instead of $1.00 - the system is likely counting both the tip amount AND the platform fees as revenue.** 