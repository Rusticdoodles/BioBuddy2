-- Migration: Ensure expires_at column exists in subscriptions table
-- Purpose: Support subscription grace period feature
-- Date: 2025-11-16
-- Description: When a subscription is cancelled, store when it will expire
--              to allow users to continue accessing premium features until the end
-- Note: Your database already has expires_at column, so this migration is optional

-- Add the expires_at column (if it doesn't exist)
-- Most likely this already exists in your schema
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.expires_at IS 'When the subscription period expires. Used for cancelled subscriptions to provide grace period access.';

-- Optional: Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at) 
WHERE expires_at IS NOT NULL;

-- Note: This migration is safe to run multiple times (uses IF NOT EXISTS)


