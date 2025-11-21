import { supabase } from './supabase';
import { findSimilarTopic } from '@/utils/topic-matching';

const FREE_TOPIC_LIMIT = 4;
const MONTHLY_MAP_LIMIT = 100;

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'monthly' | 'lifetime';
  status: 'active' | 'inactive' | 'cancelled';
  lemon_squeezy_subscription_id?: string;
  expires_at?: string; // When the subscription period expires
  created_at: string;
  updated_at: string;
}

export interface MapGeneration {
  id: string;
  user_id: string;
  topic_name: string;
  topic_slug: string;
  is_regeneration: boolean;
  created_at: string;
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    // First try to get active subscription
    const { data: activeData, error: activeError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (activeError) {
      console.error('Error fetching active subscription:', activeError);
    }

    if (activeData) {
      return activeData;
    }

    // If no active subscription, check for cancelled subscription that hasn't expired
    const { data: cancelledData, error: cancelledError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'cancelled')
      .maybeSingle();

    if (cancelledError) {
      console.error('Error fetching cancelled subscription:', cancelledError);
      return null;
    }

    // Check if cancelled subscription still has time left
    if (cancelledData && cancelledData.expires_at) {
      const expiresAt = new Date(cancelledData.expires_at);
      const now = new Date();
      
      if (expiresAt > now) {
        // Subscription is cancelled but still active until expires_at
        return cancelledData;
      }
    }

    return null;
  } catch (error) {
    console.error('Exception fetching subscription:', error);
    return null;
  }
}

export async function getTopicsUsed(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('map_generations')
      .select('topic_slug')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching topics used:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Extract unique topic slugs
    const uniqueSlugs = Array.from(new Set(data.map(record => record.topic_slug).filter(Boolean)));
    return uniqueSlugs;
  } catch (error) {
    console.error('Exception fetching topics used:', error);
    return [];
  }
}

export async function getMapsThisMonth(userId: string): Promise<number> {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('map_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      console.error('Error fetching maps this month:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Exception fetching maps this month:', error);
    return 0;
  }
}

export interface CanGenerateMapResult {
  allowed: boolean;
  reason?: 'free_limit_reached' | 'monthly_limit_reached';
  matchedTopicSlug?: string; // The topic slug that was matched (may differ from input due to fuzzy matching)
  isExactMatch?: boolean; // Whether it was an exact match or fuzzy match
}

export async function canGenerateMap(
  userId: string,
  topicName: string
): Promise<CanGenerateMapResult> {
  try {
    // Normalize topic name
    const topicSlug = topicName.toLowerCase().trim();

    // Get user's subscription
    const subscription = await getUserSubscription(userId);

    // Get topics already used by user
    const topicsUsed = await getTopicsUsed(userId);

    // If user has lifetime subscription
    if (subscription?.plan_type === 'lifetime') {
      const mapsThisMonth = await getMapsThisMonth(userId);
      if (mapsThisMonth >= MONTHLY_MAP_LIMIT) {
        return { allowed: false, reason: 'monthly_limit_reached' };
      }
      return { allowed: true };
    }

    // If user has monthly subscription
    if (subscription?.plan_type === 'monthly') {
      const mapsThisMonth = await getMapsThisMonth(userId);
      if (mapsThisMonth >= MONTHLY_MAP_LIMIT) {
        return { allowed: false, reason: 'monthly_limit_reached' };
      }
      return { allowed: true };
    }

    // If user has no subscription (free tier)
    // Use fuzzy matching to find similar topics (handles typos)
    const topicMatch = findSimilarTopic(topicSlug, topicsUsed, 0.9, 0.85);
    
    if (topicMatch && topicMatch.isMatch) {
      // Found a close match (likely a typo) - treat as regeneration
      console.log(`🔍 Fuzzy match found: "${topicSlug}" matches "${topicMatch.topicSlug}" (similarity: ${(topicMatch.similarity * 100).toFixed(1)}%)`);
      return { 
        allowed: true,
        matchedTopicSlug: topicMatch.topicSlug,
        isExactMatch: topicMatch.similarity === 1.0
      };
    }
    
    // Check for exact match (backwards compatibility)
    const isExactMatch = topicsUsed.includes(topicSlug);
    if (isExactMatch) {
      return { 
        allowed: true,
        matchedTopicSlug: topicSlug,
        isExactMatch: true
      };
    }

    // New topic - check limit
    if (topicsUsed.length >= FREE_TOPIC_LIMIT) {
      return { allowed: false, reason: 'free_limit_reached' };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking if user can generate map:', error);
    // On error, allow generation (fail open)
    return { allowed: true };
  }
}

export async function trackMapGeneration(
  userId: string,
  topicName: string,
  isRegeneration: boolean,
  matchedTopicSlug?: string
): Promise<MapGeneration | null> {
  try {
    const topicSlug = topicName.toLowerCase().trim();
    
    // If a matched topic slug was provided (from fuzzy matching), use it
    // Otherwise, use the normalized input topic slug
    let finalTopicSlug = topicSlug;
    
    if (matchedTopicSlug) {
      finalTopicSlug = matchedTopicSlug;
      console.log(`📝 Using matched topic slug: "${finalTopicSlug}" (from input: "${topicSlug}")`);
    } else if (isRegeneration) {
      // If it's a regeneration but no matched slug provided, try fuzzy matching
      const topicsUsed = await getTopicsUsed(userId);
      const topicMatch = findSimilarTopic(topicSlug, topicsUsed, 0.9, 0.85);
      
      if (topicMatch && topicMatch.isMatch) {
        finalTopicSlug = topicMatch.topicSlug;
        console.log(`🔍 Fuzzy matched regeneration: "${topicSlug}" -> "${finalTopicSlug}"`);
      }
    }

    const { data, error } = await supabase
      .from('map_generations')
      .insert({
        user_id: userId,
        topic_name: topicName,
        topic_slug: finalTopicSlug,
        is_regeneration: isRegeneration,
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking map generation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception tracking map generation:', error);
    return null;
  }
}

