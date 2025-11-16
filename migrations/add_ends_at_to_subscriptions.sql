-- Migration: Add ends_at column to subscriptions table
-- Purpose: Support subscription grace period feature
-- Date: 2025-11-16
-- Description: When a subscription is cancelled, store when it will expire
--              to allow users to continue accessing premium features until the end

-- Add the ends_at column
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.ends_at IS 'When the subscription period ends. Used for cancelled subscriptions to provide grace period access.';

-- Optional: Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_ends_at ON subscriptions(ends_at) 
WHERE ends_at IS NOT NULL;

-- Note: This migration is safe to run multiple times (uses IF NOT EXISTS)


