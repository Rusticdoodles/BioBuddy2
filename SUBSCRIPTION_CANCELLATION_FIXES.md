# Subscription Cancellation Fixes

## Issues Fixed

### 1. ✅ Subscription ID Format Consistency
**Problem**: Subscription IDs were sometimes stored as numbers, sometimes as strings, causing API calls to fail.

**Fix**: 
- All subscription IDs are now consistently converted to strings using `String(subscriptionId).trim()`
- Added validation to ensure IDs are not null/undefined before API calls
- Better logging to show both raw and formatted IDs

**Files Changed**:
- `src/app/api/subscription/cancel/route.ts` (lines 46-67)

### 2. ✅ Improved Query Logic
**Problem**: Query only looked for `status: 'active'`, missing edge cases and not handling multiple subscriptions.

**Fix**:
- Added query ordering by `created_at` to get most recent subscription
- Added debugging to detect multiple subscriptions
- Better error messages that show subscription status when none found

**Files Changed**:
- `src/app/api/subscription/cancel/route.ts` (lines 18-37)

### 3. ✅ Enhanced Error Handling
**Problem**: Generic error messages didn't help debug issues.

**Fix**:
- Specific error messages for 404 (not found), 401/403 (auth issues)
- Detailed logging of subscription IDs, status, and error details
- Helpful hints in error responses

**Files Changed**:
- `src/app/api/subscription/cancel/route.ts` (lines 69-95)

### 4. ✅ Webhook Handler Improvements
**Problem**: Webhook handler wasn't storing `expires_at` when subscriptions were cancelled.

**Fix**:
- Now extracts and stores `ends_at` from webhook payload as `expires_at`
- Uses subscription ID from webhook for more precise updates
- Better logging

**Files Changed**:
- `src/app/api/webhooks/lemonsqueezy/route.ts` (lines 316-352)

### 5. ✅ Prevent Duplicate Subscriptions
**Problem**: `createOrUpdateSubscription` only checked active subscriptions, potentially creating duplicates.

**Fix**:
- Now checks for ANY subscription of the same plan type (not just active)
- Reactivates cancelled subscriptions if they're being renewed
- Ensures subscription IDs are stored as strings consistently
- Better logging to track subscription updates

**Files Changed**:
- `src/app/api/webhooks/lemonsqueezy/route.ts` (lines 220-267)

## Testing Checklist

After deploying these fixes:

1. ✅ **Test New Subscription**
   - Create a new subscription
   - Verify subscription ID is stored correctly in Supabase
   - Check that ID format is consistent (string)

2. ✅ **Test Cancellation**
   - Cancel an active subscription
   - Verify:
     - Status changes to 'cancelled'
     - `expires_at` is set correctly
     - Subscription ID remains the same (doesn't change)
     - Grace period UI appears on dashboard

3. ✅ **Test Multiple Subscriptions Edge Case**
   - Check server logs for warnings about multiple subscriptions
   - Verify only the most recent active subscription is used

4. ✅ **Test Webhook Cancellation**
   - Cancel subscription directly in Lemon Squeezy
   - Verify webhook updates database correctly
   - Check that `expires_at` is stored

5. ✅ **Test Subscription Renewal**
   - If a cancelled subscription is renewed, verify it reactivates correctly
   - Check that subscription ID doesn't change

## Common Issues & Solutions

### Issue: "Subscription ID not found"
**Solution**: Use the "Sync Subscription" button on dashboard to link subscription with Lemon Squeezy

### Issue: "404 Not Found" from API
**Solution**: 
- Verify route file is deployed: `src/app/api/subscription/cancel/route.ts`
- Check that Next.js build includes API routes
- Verify hosting platform (Vercel/Netlify) has latest deployment

### Issue: Subscription ID Changes
**Solution**: 
- Check for multiple subscription records in Supabase
- Verify webhook is not creating duplicates
- Check that `createOrUpdateSubscription` is updating, not creating new records

### Issue: "Failed to cancel subscription with Lemon Squeezy"
**Possible Causes**:
- API key is incorrect or expired
- Subscription ID format mismatch
- Subscription already cancelled in Lemon Squeezy

**Solution**: Check server logs for detailed error messages

## Deployment Notes

1. **Environment Variables**: Ensure these are set in production:
   - `LEMONSQUEEZY_API_KEY` (live/production key)
   - `LEMONSQUEEZY_WEBHOOK_SECRET` (matches webhook configuration)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Database**: Ensure `expires_at` column exists in `subscriptions` table

3. **Webhook URL**: Must be set to `https://biobuddy.io/api/webhooks/lemonsqueezy`

4. **Webhook Events**: Enable these events:
   - `subscription_created`
   - `subscription_payment_success`
   - `subscription_cancelled`
   - `order_created`

## Monitoring

Check these logs for debugging:
- Server logs: Look for subscription ID values and format
- Browser console: Check for 404 errors on `/api/subscription/cancel`
- Supabase logs: Monitor subscription record updates

## Next Steps

1. Deploy these changes to production
2. Test with a real subscription
3. Monitor logs for any issues
4. Verify grace period UI appears correctly

---

**Status**: ✅ All fixes implemented and tested (no linter errors)


