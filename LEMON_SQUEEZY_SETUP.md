# Lemon Squeezy Payment Integration - Setup Guide

## ✅ What's Been Implemented

### 1. Package Installation
- ✅ Installed `@lemonsqueezy/lemonsqueezy.js` package

### 2. Components Updated
- ✅ **UpgradeModal** (`src/components/UpgradeModal.tsx`)
  - Now uses real Lemon Squeezy checkout URLs
  - Pre-fills user email in checkout
  - Removed placeholder alerts
  
- ✅ **Navbar** (`src/components/navbar.tsx`)
  - Added Dashboard link for signed-in users

### 3. New Files Created
- ✅ **Webhook Handler** (`src/app/api/webhooks/lemonsqueezy/route.ts`)
  - Handles `order_created` events (lifetime & monthly purchases)
  - Handles `subscription_payment_success` events (monthly renewals)
  - Handles `subscription_cancelled` events
  - Includes webhook signature verification for security
  
- ✅ **Dashboard Page** (`src/app/dashboard/page.tsx`)
  - Shows current plan (Free/Monthly/Lifetime)
  - Displays topics explored
  - Shows maps generated this month
  - Lists all user's topics
  - Upgrade CTA for free users

### 4. Security
- ✅ `.env.local` is already in `.gitignore` (covered by `.env*` pattern)

---

## 🔧 Manual Setup Required

### Step 1: Create Lemon Squeezy Products

1. Go to [lemonsqueezy.com](https://lemonsqueezy.com) and create an account
2. Create your store
3. Create two products:

#### Product 1: BioBuddy Lifetime Access
- **Type:** One-time payment
- **Price:** $39
- **Description:** "Lifetime access to BioBuddy with unlimited topics and 150 maps per month"

#### Product 2: BioBuddy Monthly
- **Type:** Recurring subscription
- **Price:** $4.99/month
- **Description:** "Monthly subscription with unlimited topics and 100 maps per month"

4. After creating products, note down:
   - Store ID
   - Lifetime product variant ID
   - Monthly product variant ID
   - Checkout URLs for both products

### Step 2: Get API Keys

1. In Lemon Squeezy Dashboard → Settings → API
2. Create an API key
3. Copy the API key (you'll only see it once!)

### Step 3: Create `.env.local` File

Create a file named `.env.local` in the `biobuddy` directory with the following content:

```bash
# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Lemon Squeezy API Configuration
LEMONSQUEEZY_API_KEY=your_lemon_squeezy_api_key_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_signing_secret_here
LEMONSQUEEZY_STORE_ID=your_store_id_here

# Lemon Squeezy Product URLs and Variant IDs
# Replace with your actual checkout URLs from Lemon Squeezy
NEXT_PUBLIC_LEMONSQUEEZY_LIFETIME_CHECKOUT_URL=https://your-store.lemonsqueezy.com/checkout/buy/xxxxx
NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_CHECKOUT_URL=https://your-store.lemonsqueezy.com/checkout/buy/xxxxx

# Replace with your actual variant IDs from Lemon Squeezy
LEMONSQUEEZY_LIFETIME_VARIANT_ID=123456
LEMONSQUEEZY_MONTHLY_VARIANT_ID=123457
```

**Important:** Replace all placeholder values with your actual Lemon Squeezy credentials.

### Step 4: Configure Webhook (After Deployment)

⚠️ **This must be done AFTER you deploy your app to production or use ngrok for local testing**

#### Option A: Production Setup
1. Deploy your app to Vercel/Netlify/etc.
2. Go to Lemon Squeezy Dashboard → Settings → Webhooks
3. Click "+" to add a new webhook
4. Configure:
   - **URL:** `https://your-domain.com/api/webhooks/lemonsqueezy`
   - **Events to subscribe to:**
     - ✅ `order_created`
     - ✅ `subscription_payment_success`
     - ✅ `subscription_cancelled`
5. Save and copy the **Signing Secret**
6. Add the signing secret to your `.env.local` as `LEMONSQUEEZY_WEBHOOK_SECRET`
7. Redeploy your app with the new environment variable

#### Option B: Local Testing with ngrok
1. Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com)
2. Start your Next.js app: `npm run dev`
3. In another terminal, run: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Go to Lemon Squeezy Dashboard → Settings → Webhooks
6. Add webhook with URL: `https://abc123.ngrok.io/api/webhooks/lemonsqueezy`
7. Subscribe to the same events as above
8. Copy the signing secret to `.env.local`
9. Restart your dev server

---

## 🧪 Testing the Integration

### Test Checklist

#### 1. Environment Variables
```bash
# In biobuddy directory, check if all env vars are set:
cat .env.local
```

#### 2. Test Upgrade Modal
1. Start your app: `cd biobuddy && npm run dev`
2. Sign in with a test account
3. Generate 4 topics to hit the free limit
4. The UpgradeModal should appear
5. Click "Get Lifetime Access" or "Start Monthly"
6. Should redirect to Lemon Squeezy checkout with email pre-filled

#### 3. Test Webhook (Local)
1. Set up ngrok as described above
2. Create a test purchase in Lemon Squeezy (use test mode!)
3. Check your terminal logs for webhook events
4. Verify in Supabase:
   ```sql
   SELECT * FROM subscriptions WHERE user_id = 'your-test-user-id';
   ```
5. Should see a new subscription record with correct plan_type

#### 4. Test Dashboard
1. After successful purchase, go to `http://localhost:3000/dashboard`
2. Should show upgraded plan status
3. Should display correct topic count and maps count

#### 5. Test Monthly Subscription Renewal
1. In Lemon Squeezy Dashboard, manually trigger a subscription renewal event
2. Check webhook logs
3. Verify `expires_at` was extended by 30 days in Supabase

#### 6. Test Subscription Cancellation
1. In Lemon Squeezy Dashboard, cancel a test subscription
2. Check webhook logs
3. Verify subscription status changed to `cancelled` in Supabase

---

## 🔍 Troubleshooting

### Webhook not receiving events
- Check that your webhook URL is correct
- Verify webhook signing secret matches `.env.local`
- Check Lemon Squeezy webhook logs for delivery attempts
- Ensure your server is publicly accessible (use ngrok for local testing)

### User not found error in webhook
- Verify the email used in Lemon Squeezy matches the Supabase auth email exactly
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Look at webhook logs in your server terminal

### Subscription not updating
- Check Supabase table structure matches expected schema:
  ```sql
  CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'monthly', 'lifetime')),
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

### Checkout URLs not working
- Verify `NEXT_PUBLIC_LEMONSQUEEZY_LIFETIME_CHECKOUT_URL` and `NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_CHECKOUT_URL` are set correctly
- Must be full URLs, not just product IDs
- Should include `https://` at the start

---

## 📝 Important Notes

### Variant IDs
- Found in Lemon Squeezy Dashboard → Products → [Your Product] → Variants
- Each product can have multiple variants (e.g., different pricing tiers)
- Make sure you're using the variant ID, not the product ID

### Test Mode
- Lemon Squeezy has a test mode for safe testing
- Enable test mode in your Lemon Squeezy dashboard
- Test payments won't charge real money
- Use test card numbers provided by Lemon Squeezy

### Security
- Never commit `.env.local` to git
- Keep webhook signing secret secure
- Service role key gives admin access to Supabase - protect it!

### Monthly Limits
- Lifetime and Monthly plans both have 150 maps/month limit
- This is a "soft limit" - adjust in `src/lib/usage.ts` if needed
- Maps counter resets on the 1st of each month

### Email Matching
- Webhooks match users by email
- Lemon Squeezy checkout email MUST match Supabase auth email
- The integration pre-fills the email in checkout to avoid mismatches

---

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel Dashboard → Settings → Environment Variables
4. Deploy
5. Configure webhook with your production URL

### Environment Variables in Vercel
Add all variables from `.env.local` to Vercel:
- Go to your project in Vercel
- Settings → Environment Variables
- Add each variable (excluding the `NEXT_PUBLIC_` prefix for public variables)
- Redeploy after adding all variables

---

## 📊 Database Schema Reference

Your Supabase database should already have these tables (as mentioned in the prompt):

### `subscriptions` table
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users)
- plan_type: TEXT ('free' | 'monthly' | 'lifetime')
- status: TEXT ('active' | 'inactive' | 'cancelled')
- expires_at: TIMESTAMP (NULL for lifetime)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### `map_generations` table
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users)
- topic_name: TEXT
- topic_slug: TEXT
- is_regeneration: BOOLEAN
- created_at: TIMESTAMP
```

---

## ✨ Features Summary

### Free Tier (Default)
- 4 unique topics
- Unlimited regenerations of existing topics
- No map limit tracking

### Monthly Plan ($4.99/month)
- Unlimited topics
- 150 maps per month
- Cancel anytime
- Auto-renewal every 30 days

### Lifetime Plan ($39 one-time)
- Unlimited topics
- 150 maps per month
- Pay once, own forever
- All future features included

---

## 🆘 Support

If you encounter any issues:

1. Check this setup guide thoroughly
2. Review Lemon Squeezy documentation: https://docs.lemonsqueezy.com
3. Check Supabase logs for database errors
4. Review webhook delivery logs in Lemon Squeezy dashboard
5. Check your server/deployment logs for webhook processing errors

---

## 📄 Files Modified/Created

### Modified Files:
- `src/components/UpgradeModal.tsx` - Updated with real payment links
- `src/components/navbar.tsx` - Added Dashboard link

### New Files:
- `src/app/api/webhooks/lemonsqueezy/route.ts` - Webhook handler
- `src/app/dashboard/page.tsx` - User dashboard
- `LEMON_SQUEEZY_SETUP.md` - This guide

### Files to Create Manually:
- `.env.local` - Environment variables (template provided above)

---

## 🎉 Next Steps

1. ✅ Create Lemon Squeezy account and products
2. ✅ Set up `.env.local` with your credentials
3. ✅ Test locally with ngrok
4. ✅ Deploy to production
5. ✅ Configure production webhook
6. ✅ Test with real payments in test mode
7. ✅ Enable live mode when ready
8. ✅ Start accepting payments! 🚀

Good luck with your BioBuddy launch! 🎊

