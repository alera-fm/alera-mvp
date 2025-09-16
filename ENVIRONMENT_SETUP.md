# ALERA Environment Variables Setup Guide

## 🔧 **REQUIRED ENVIRONMENT VARIABLES**

### **1. Stripe Configuration (Required for Subscription System)**
```bash
# Stripe Secret Key (from Stripe Dashboard > Developers > API Keys)
STRIPE_SECRET_KEY=sk_test_51...  # or sk_live_51... for production

# Stripe Publishable Key (from Stripe Dashboard > Developers > API Keys)
STRIPE_PUBLISHABLE_KEY=pk_test_51...  # or pk_live_51... for production

# Stripe Webhook Secret (from Stripe Dashboard > Developers > Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend Stripe Key (same as publishable key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...  # Must match STRIPE_PUBLISHABLE_KEY
```

### **2. Stripe Product Price IDs (Required)**
```bash
# Plus Plan Price ID - $4.99/month (create in Stripe Dashboard > Products)
STRIPE_PLUS_PRICE_ID=price_...

# Pro Plan Price ID - $14.99/month (create in Stripe Dashboard > Products)  
STRIPE_PRO_PRICE_ID=price_...
```

### **3. Existing Environment Variables (Keep These)**
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Authentication
JWT_SECRET=your-jwt-secret-key

# OpenAI (for AI agent)
OPENAI_API_KEY=your-openai-api-key

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com  # or http://localhost:3000 for dev

# Email Configuration
EMAIL_FROM=noreply@your-domain.com
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@your-domain.com
EMAIL_PASS=your-email-password
```

## 📋 **STRIPE SETUP INSTRUCTIONS**

### **Step 1: Get API Keys**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Copy **Publishable key** (starts with `pk_test_` or `pk_live_`)
4. Copy **Secret key** (starts with `sk_test_` or `sk_live_`)

### **Step 2: Create Products (UPDATED PRICING)**
1. In Stripe Dashboard, go to **Products**
2. Click **+ Add product**

#### **Create Plus Plan:**
- **Name**: "ALERA Plus"
- **Price**: **$4.99 USD**
- **Billing**: Monthly
- **Description**: "Perfect for growing artists"
- Copy the **Price ID** (starts with `price_`)

#### **Create Pro Plan:**
- **Name**: "ALERA Pro"
- **Price**: **$14.99 USD**
- **Billing**: Monthly  
- **Description**: "For serious artists and labels"
- Copy the **Price ID** (starts with `price_`)

### **Step 3: Set Up Webhook**
1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **+ Add endpoint**
3. **URL**: `https://your-domain.com/api/stripe/webhook`
4. **Select these events**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Copy the **Webhook Secret** (starts with `whsec_`)

## 📝 **COMPLETE .env.local FILE TEMPLATE**

```bash
# ===== EXISTING CONFIGURATION =====
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Authentication  
JWT_SECRET=your-jwt-secret-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Email Configuration
EMAIL_FROM=noreply@your-domain.com
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@your-domain.com
EMAIL_PASS=your-email-password

# Slack Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# ===== NEW STRIPE CONFIGURATION =====
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product Price IDs (UPDATED PRICING)
STRIPE_PLUS_PRICE_ID=price_...   # $4.99/month Plus Plan
STRIPE_PRO_PRICE_ID=price_...    # $14.99/month Pro Plan

# Frontend Stripe Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

## 🚀 **DEPLOYMENT CHECKLIST**

### **1. Environment Variables**
- [ ] Add all Stripe keys to `.env.local`
- [ ] Create Plus plan ($4.99/month) in Stripe
- [ ] Create Pro plan ($14.99/month) in Stripe
- [ ] Get Price IDs and add to environment
- [ ] Set up webhook endpoint
- [ ] Get webhook secret and add to environment
- [ ] Add Slack webhook URL to environment

### **2. Dependencies**
```bash
npm install stripe @stripe/stripe-js
```

### **3. Database Migrations**
```bash
# Run in order:
psql -d your_database -f lib/migrations/025_create_subscriptions_table.sql
psql -d your_database -f lib/migrations/026_create_ai_usage_table.sql  
psql -d your_database -f lib/migrations/027_migrate_existing_users_to_trial.sql
psql -d your_database -f lib/migrations/028_create_subscription_events_table.sql
```

### **4. Test Subscription Flow**
```bash
npm run dev
# 1. Navigate to /dashboard - see trial countdown
# 2. Try creating EP/Album as trial user - should be blocked
# 3. Click upgrade button - should open Stripe checkout
# 4. Test Fan Zone tab restrictions for Plus users
```

## 💰 **UPDATED PRICING STRUCTURE**

| Tier | Price | Features |
|------|-------|----------|
| **Trial** | Free (2 months) | 1 Single release, 1,500 AI tokens/day |
| **Plus** | **$4.99/month** | Unlimited releases, 100k AI tokens/month, basic fan management |
| **Pro** | **$14.99/month** | Everything + email campaigns, fan import, monetization |

## ⚠️ **IMPORTANT NOTES**

1. **Test Environment**: Use `sk_test_` keys for development
2. **Production**: Switch to `sk_live_` keys for production
3. **Webhook URL**: Must be publicly accessible (use ngrok for local testing)
4. **Price IDs**: Must match exactly what you create in Stripe Dashboard

Once you add these environment variables with the updated pricing, your subscription system will be fully operational! 🎉
