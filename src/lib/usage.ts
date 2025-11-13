import { supabase } from './supabase';

const FREE_TOPIC_LIMIT = 4;
const MONTHLY_MAP_LIMIT = 100;

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'monthly' | 'lifetime';
  status: 'active' | 'inactive' | 'cancelled';
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
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data;
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
    const isRegeneration = topicsUsed.includes(topicSlug);
    
    if (isRegeneration) {
      // Regenerating existing topic - always allow
      return { allowed: true };
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
  isRegeneration: boolean
): Promise<MapGeneration | null> {
  try {
    const topicSlug = topicName.toLowerCase().trim();

    const { data, error } = await supabase
      .from('map_generations')
      .insert({
        user_id: userId,
        topic_name: topicName,
        topic_slug: topicSlug,
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

