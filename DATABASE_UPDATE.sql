-- Add lemon_squeezy_subscription_id column to subscriptions table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id TEXT;

-- Optional: Add an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_squeezy_id 
ON subscriptions(lemon_squeezy_subscription_id);


