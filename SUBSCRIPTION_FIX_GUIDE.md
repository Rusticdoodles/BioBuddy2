# Subscription Cancellation Fix Guide

## The Problem

When trying to cancel a subscription, you're getting an error: "Failed to cancel subscription: Subscription ID not found"

This happens because the `lemon_squeezy_subscription_id` field in your database is NULL. The webhook wasn't correctly capturing the subscription ID from Lemon Squeezy.

## What Was Fixed

### 1. Updated Webhook Handler (`src/app/api/webhooks/lemonsqueezy/route.ts`)
- Fixed how the subscription ID is extracted from webhook payloads
- Now checks multiple possible locations for the subscription ID
- Added better logging to debug webhook data
- Updated `handleSubscriptionPayment` to also capture subscription IDs

### 2. Created Sync Endpoint (`src/app/api/subscription/sync/route.ts`)
- New API endpoint that fetches active subscriptions from Lemon Squeezy
- Matches them to your database subscriptions by email
- Updates the database with the correct subscription ID

### 3. Updated Dashboard UI (`src/app/dashboard/page.tsx`)
- Added "Sync Subscription" button for monthly subscribers
- Cancel button now suggests syncing if subscription ID is missing
- Better error handling and user feedback

### 4. Updated Environment Template (`env.template`)
- Added `LEMONSQUEEZY_API_KEY` requirement

## How to Fix Your Current Subscription

You have **3 options** to fix your existing subscription:

### Option 1: Use the Sync Button (Easiest) ⭐

1. Make sure `LEMONSQUEEZY_API_KEY` is in your `.env.local` file
2. Restart your development server
3. Go to your Dashboard at `http://localhost:3000/dashboard`
4. Click the **"Sync Subscription"** button
5. This will fetch your subscription ID from Lemon Squeezy and update your database
6. After syncing, you can use the "Cancel Subscription" button

### Option 2: Manual Database Update

If you know your Lemon Squeezy subscription ID:

1. Go to [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com/subscriptions)
2. Find your subscription and copy the ID (it's in the URL: `/subscriptions/12345`)
3. Go to your Supabase SQL Editor
4. Run this query (replace `YOUR_SUBSCRIPTION_ID` and `YOUR_USER_ID`):

```sql
UPDATE subscriptions 
SET lemon_squeezy_subscription_id = 'YOUR_SUBSCRIPTION_ID'
WHERE user_id = 'YOUR_USER_ID' 
  AND plan_type = 'monthly' 
  AND status = 'active';
```

### Option 3: Wait for Next Webhook Event

The webhook is now fixed, so when your next subscription payment is processed (or any other webhook event), it will automatically capture and store the subscription ID.

## Testing the Fix

### Test New Subscriptions

1. Create a new test subscription in Lemon Squeezy (use test mode)
2. Check your server logs - you should see:
   ```
   Subscription ID: 123456
   ```
3. Verify in Supabase that the `lemon_squeezy_subscription_id` column is populated

### Test Cancellation

1. Make sure your subscription has a subscription ID (use Sync button or manual update)
2. Click "Cancel Subscription" on the dashboard
3. You should see a confirmation
4. Verify in Lemon Squeezy that the subscription is cancelled

## Environment Variables Checklist

Make sure your `.env.local` has all these variables:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Lemon Squeezy API (required for cancel/sync)
LEMONSQUEEZY_API_KEY=your_api_key_here  # ⚠️ MAKE SURE THIS IS SET

# Lemon Squeezy Webhook (required for webhooks)
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret

# Product Configuration
LEMONSQUEEZY_LIFETIME_VARIANT_ID=your_lifetime_variant_id
LEMONSQUEEZY_MONTHLY_VARIANT_ID=your_monthly_variant_id

# Checkout URLs
NEXT_PUBLIC_LEMONSQUEEZY_LIFETIME_CHECKOUT_URL=https://...
NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_CHECKOUT_URL=https://...
```

## Where to Get LEMONSQUEEZY_API_KEY

1. Go to [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com)
2. Click on **Settings** → **API**
3. Click **Create API Key** or use an existing one
4. Copy the key and add it to your `.env.local`
5. **Restart your dev server** after adding it

## Troubleshooting

### "Server configuration error" when syncing
- Make sure `LEMONSQUEEZY_API_KEY` is set in `.env.local`
- Restart your development server after adding it

### "No matching active subscription found in Lemon Squeezy"
- Verify the subscription exists and is active in Lemon Squeezy dashboard
- Make sure the email in Lemon Squeezy exactly matches your account email
- Check that you're in the correct mode (test vs live)

### Webhook not capturing subscription ID for new subscriptions
- Check your server logs when webhook fires
- Look for "Subscription ID:" in the logs
- If still NULL, check the "Full order data for debugging" log to see the actual webhook structure
- You may need to adjust the webhook parsing based on Lemon Squeezy's actual response

### Still having issues?
- Check the server console logs for detailed error messages
- Verify all environment variables are set correctly
- Check Lemon Squeezy webhook delivery logs
- Ensure your subscription is truly active in Lemon Squeezy

## Future Subscriptions

All new subscriptions created after this fix will automatically have their subscription ID captured, so they'll be able to cancel without any issues.

## Common Errors and Solutions

### "Failed to cancel subscription with Lemon Squeezy"

**Cause:** The API was using the wrong HTTP method (DELETE instead of PATCH).

**Fixed in latest update:**
- Changed from DELETE to PATCH method
- Added proper request body with `cancelled: true` attribute
- Added better error logging and user feedback

**Solution:** The code is now fixed. Just restart your dev server and try canceling again.

---

## Summary of Changes

**Files Modified:**
- ✅ `src/app/api/webhooks/lemonsqueezy/route.ts` - Fixed subscription ID extraction
- ✅ `src/app/api/subscription/cancel/route.ts` - Fixed cancellation API method (PATCH instead of DELETE)
- ✅ `src/app/dashboard/page.tsx` - Added sync functionality
- ✅ `env.template` - Added required environment variables

**Files Created:**
- ✅ `src/app/api/subscription/sync/route.ts` - New sync endpoint
- ✅ `SUBSCRIPTION_FIX_GUIDE.md` - This guide

---

**Next Step:** Restart your dev server and try canceling your subscription again!

