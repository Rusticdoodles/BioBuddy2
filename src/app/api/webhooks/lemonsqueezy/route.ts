import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Use service role key for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Test GET handler to verify route is working
export async function GET() {
  console.log('🔵 GET request to webhook endpoint');
  return Response.json({
    message: 'Lemon Squeezy Webhook Endpoint',
    status: 'Route is working',
    hasWebhookSecret: !!process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  console.log('\n\n🔵 ======= WEBHOOK ENDPOINT CALLED =======');
  console.log('🔵 Time:', new Date().toISOString());
  console.log('🔵 URL:', request.url);
  console.log('🔵 Method:', request.method);
  
  try {
    console.log('🔵 Step 1: Getting raw body...');
    const rawBody = await request.text();
    console.log('🔵 Step 2: Raw body received, length:', rawBody.length);
    console.log('🔵 Step 3: Body preview:', rawBody.substring(0, 200));
    
    console.log('🔵 Step 4: Getting signature header...');
    const signature = request.headers.get('x-signature');
    console.log('🔵 Step 5: Signature present?', !!signature);
    
    if (!signature) {
      console.error('❌ ERROR: No signature header');
      console.error('❌ Available headers:', Array.from(request.headers.keys()));
      return new Response('No signature', { status: 401 });
    }
    
    console.log('🔵 Step 6: Signature value (first 20 chars):', signature.substring(0, 20));

    // Verify webhook signature
    console.log('🔵 Step 7: Getting webhook secret from environment...');
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    console.log('🔵 Step 8: Secret exists?', !!secret);
    console.log('🔵 Step 9: Secret preview:', secret?.substring(0, 5));
    
    if (!secret) {
      console.error('❌ ERROR: LEMONSQUEEZY_WEBHOOK_SECRET not set in environment!');
      return new Response('Server configuration error', { status: 500 });
    }
    
    console.log('🔵 Step 10: Creating HMAC digest...');
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(rawBody).digest('hex');
    console.log('🔵 Step 11: Digest created (first 20 chars):', digest.substring(0, 20));
    
    console.log('🔵 Step 12: Comparing signatures...');
    console.log('🔵   - Received:', signature);
    console.log('🔵   - Calculated:', digest);
    console.log('🔵   - Match?', signature === digest);
    
    if (signature !== digest) {
      console.error('❌ ERROR: Invalid signature - they do not match!');
      return new Response('Invalid signature', { status: 401 });
    }

    console.log('✅ Step 13: Signature verified successfully!');
    console.log('🔵 Step 14: Parsing JSON body...');
    const body = JSON.parse(rawBody);
    const eventName = body.meta.event_name;
    
    console.log('✅ Step 15: Event received:', eventName);
    console.log('🔵 Full webhook body:', JSON.stringify(body, null, 2));

    // Handle subscription created (new subscriptions)
    if (eventName === 'subscription_created') {
      await handleSubscriptionCreated(body);
    }
    
    // Handle order created (one-time purchases and subscription starts)
    if (eventName === 'order_created') {
      await handleOrderCreated(body);
    }
    
    // Handle subscription payment success (renewals)
    if (eventName === 'subscription_payment_success') {
      await handleSubscriptionPayment(body);
    }
    
    // Handle subscription cancelled
    if (eventName === 'subscription_cancelled') {
      await handleSubscriptionCancelled(body);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

async function handleSubscriptionCreated(body: { data: { id?: string; attributes: { user_email?: string; variant_id?: string; status?: string } } }) {
  const customerEmail = body.data.attributes.user_email;
  const subscriptionId = body.data.id?.toString(); // This is the actual subscription ID
  const variantId = body.data.attributes.variant_id?.toString();
  const status = body.data.attributes.status;
  
  console.log('🆕 Subscription created event:');
  console.log('   - Email:', customerEmail);
  console.log('   - Subscription ID:', subscriptionId);
  console.log('   - Variant ID:', variantId);
  console.log('   - Status:', status);
  
  if (status !== 'active') {
    console.log('⚠️ Subscription not active yet, skipping');
    return;
  }
  
  // Get user ID from Supabase Auth using admin client
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error('❌ Error listing users:', authError);
    return;
  }
  
  // Find user by email
  const user = authData.users.find(u => u.email === customerEmail);
  
  if (!user) {
    console.error('❌ User not found:', customerEmail);
    return;
  }
  
  const userId = user.id;
  console.log('✅ Found user:', userId);
  
  await createOrUpdateSubscription(userId, variantId, subscriptionId);
}

async function handleOrderCreated(body: { data: { relationships?: { subscription?: { data?: { id?: string } } }; attributes: { user_email?: string; first_order_item?: { variant_id?: string; subscription_id?: string }; status?: string } } }) {
  const customerEmail = body.data.attributes.user_email;
  const variantId = body.data.attributes.first_order_item?.variant_id?.toString();
  const orderStatus = body.data.attributes.status;
  
  // Try multiple possible locations for subscription ID in Lemon Squeezy webhook
  let subscriptionId = null;
  if (body.data.relationships?.subscription?.data?.id) {
    subscriptionId = body.data.relationships.subscription.data.id.toString();
  } else if (body.data.attributes?.first_order_item?.subscription_id) {
    subscriptionId = body.data.attributes.first_order_item.subscription_id.toString();
  }
  
  console.log('Order created:');
  console.log('Email:', customerEmail);
  console.log('Variant ID:', variantId);
  console.log('Status:', orderStatus);
  console.log('Subscription ID:', subscriptionId);
  console.log('Full order data for debugging:', JSON.stringify(body.data, null, 2));
  
  // Only process paid orders
  if (orderStatus !== 'paid') {
    console.log('Order not paid yet, skipping');
    return;
  }
  
  // Get user ID from Supabase Auth using admin client
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error listing users:', authError);
    return;
  }
  
  // Find user by email
  const user = authData.users.find(u => u.email === customerEmail);
  
  if (!user) {
    console.error('User not found:', customerEmail);
    return;
  }
  
  const userId = user.id;
  console.log('Found user:', userId);
  
  await createOrUpdateSubscription(userId, variantId, subscriptionId);
}

async function createOrUpdateSubscription(userId: string, variantId: string | undefined, subscriptionId?: string | null) {
  // Determine plan type based on variant ID
  const lifetimeVariantId = process.env.LEMONSQUEEZY_LIFETIME_VARIANT_ID;
  const monthlyVariantId = process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID;
  
  if (!variantId) {
    console.error('Missing variant ID');
    return;
  }
  
  let planType: 'lifetime' | 'monthly';
  let expiresAt: string | null = null;
  
  if (variantId === lifetimeVariantId) {
    planType = 'lifetime';
    expiresAt = null; // No expiry for lifetime
  } else if (variantId === monthlyVariantId) {
    planType = 'monthly';
    // Monthly expires in 30 days
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    expiresAt = expiry.toISOString();
  } else {
    console.error('Unknown variant ID:', variantId);
    return;
  }
  
  // Ensure subscription ID is a string
  const subscriptionIdStr = subscriptionId ? String(subscriptionId).trim() : null;
  
  console.log('📝 Creating/updating subscription:');
  console.log('   - Plan type:', planType);
  console.log('   - Expires at:', expiresAt);
  console.log('   - Subscription ID:', subscriptionIdStr);
  
  // Check if subscription already exists (check by user_id and plan_type, regardless of status)
  // This prevents duplicate subscriptions for the same user/plan
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('subscriptions')
    .select('id, status, lemon_squeezy_subscription_id')
    .eq('user_id', userId)
    .eq('plan_type', planType)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking for existing subscription:', fetchError);
  }
  
  if (existing) {
    console.log('✅ Existing subscription found, updating:');
    console.log('   - Database ID:', existing.id);
    console.log('   - Current status:', existing.status);
    console.log('   - Current Lemon ID:', existing.lemon_squeezy_subscription_id);
    console.log('   - New Lemon ID:', subscriptionIdStr);
    
    // Update existing subscription - reactivate if it was cancelled
    const updateData: {
      plan_type: string;
      expires_at: string | null;
      lemon_squeezy_subscription_id?: string | null;
      status?: string;
    } = {
      plan_type: planType,
      expires_at: expiresAt,
    };
    
    // Only update subscription ID if:
    // 1. The new ID is provided (not null/empty), AND
    // 2. Either the existing ID is missing, OR the new ID is different (might be a correction)
    // This prevents overwriting a valid ID with null or an incorrect value
    if (subscriptionIdStr) {
      if (!existing.lemon_squeezy_subscription_id) {
        // Existing subscription has no ID, so set it
        updateData.lemon_squeezy_subscription_id = subscriptionIdStr;
        console.log('📝 Setting subscription ID (was missing):', subscriptionIdStr);
      } else if (existing.lemon_squeezy_subscription_id !== subscriptionIdStr) {
        // Both exist and are different - update it (might be a correction)
        updateData.lemon_squeezy_subscription_id = subscriptionIdStr;
        console.log('📝 Updating subscription ID:', existing.lemon_squeezy_subscription_id, '->', subscriptionIdStr);
      } else {
        // Same ID, no need to update
        console.log('ℹ️ Subscription ID unchanged:', subscriptionIdStr);
      }
    } else {
      // No new ID provided - preserve existing ID
      console.log('ℹ️ No subscription ID in webhook, preserving existing ID:', existing.lemon_squeezy_subscription_id);
    }
    
    // If subscription was cancelled but we're getting a renewal, reactivate it
    if (existing.status === 'cancelled') {
      updateData.status = 'active';
      console.log('🔄 Reactivating cancelled subscription');
    }
    
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('id', existing.id);
    
    if (updateError) {
      console.error('❌ Error updating subscription:', updateError);
    } else {
      console.log('✅ Subscription updated successfully');
    }
  } else {
    // Create new subscription
    console.log('➕ No existing subscription found, creating new one');
    const { error: insertError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: planType,
        status: 'active',
        expires_at: expiresAt,
        lemon_squeezy_subscription_id: subscriptionIdStr,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error creating subscription:', insertError);
    } else {
      console.log('✅ Subscription created successfully');
    }
  }
}

async function handleSubscriptionPayment(body: { data: { id?: string; attributes: { user_email?: string } } }) {
  const customerEmail = body.data.attributes.user_email;
  const subscriptionId = body.data.id?.toString(); // This IS the subscription ID for subscription events
  
  console.log('💳 Subscription payment event:');
  console.log('   - Email:', customerEmail);
  console.log('   - Subscription ID:', subscriptionId);
  
  // Get user ID from Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error listing users:', authError);
    return;
  }
  
  const user = authData.users.find(u => u.email === customerEmail);
  
  if (!user) {
    console.error('User not found');
    return;
  }
  
  const userId = user.id;
  
  // First, get the existing subscription to check if it already has an ID
  const { data: existingSubscription, error: fetchError } = await supabaseAdmin
    .from('subscriptions')
    .select('id, lemon_squeezy_subscription_id')
    .eq('user_id', userId)
    .eq('plan_type', 'monthly')
    .maybeSingle();
  
  if (fetchError) {
    console.error('❌ Error fetching existing subscription:', fetchError);
    return;
  }
  
  if (!existingSubscription) {
    console.error('❌ No subscription found for user');
    return;
  }
  
  // Extend subscription by 30 days
  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + 30);
  
  // Only update subscription ID if:
  // 1. The existing subscription doesn't have an ID, OR
  // 2. The new subscription ID is provided and different from the existing one
  // This prevents overwriting a correct ID with a wrong one (like a payment ID)
  const updateData: {
    expires_at: string;
    status: string;
    lemon_squeezy_subscription_id?: string;
  } = {
    expires_at: newExpiry.toISOString(),
    status: 'active',
  };
  
  // Only update subscription ID if existing one is missing or if new one is provided and valid
  if (!existingSubscription.lemon_squeezy_subscription_id && subscriptionId) {
    // Existing subscription has no ID, so set it
    updateData.lemon_squeezy_subscription_id = subscriptionId;
    console.log('📝 Setting subscription ID (was missing):', subscriptionId);
  } else if (existingSubscription.lemon_squeezy_subscription_id && subscriptionId) {
    // Both exist - only update if they're different (might be a correction)
    if (existingSubscription.lemon_squeezy_subscription_id !== subscriptionId) {
      console.log('⚠️ Subscription ID mismatch detected:');
      console.log('   - Existing ID:', existingSubscription.lemon_squeezy_subscription_id);
      console.log('   - New ID:', subscriptionId);
      console.log('   - Keeping existing ID to prevent overwrite with potentially incorrect value');
      // Don't update - keep the existing ID to prevent overwriting with wrong value
    }
  }
  
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update(updateData)
    .eq('id', existingSubscription.id);
  
  if (error) {
    console.error('❌ Error updating subscription:', error);
  } else {
    console.log('✅ Subscription renewed until:', newExpiry);
    if (updateData.lemon_squeezy_subscription_id) {
      console.log('✅ Subscription ID updated:', updateData.lemon_squeezy_subscription_id);
    } else {
      console.log('✅ Subscription ID preserved:', existingSubscription.lemon_squeezy_subscription_id);
    }
  }
}

async function handleSubscriptionCancelled(body: { data: { id?: string; attributes: { user_email?: string; ends_at?: string } } }) {
  const customerEmail = body.data.attributes.user_email;
  const subscriptionId = body.data.id?.toString();
  const endsAt = body.data.attributes.ends_at;
  
  console.log('🛑 Subscription cancelled webhook received:');
  console.log('   - Email:', customerEmail);
  console.log('   - Subscription ID:', subscriptionId);
  console.log('   - Ends at:', endsAt);
  
  // Get user ID from Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error listing users:', authError);
    return;
  }
  
  const user = authData.users.find(u => u.email === customerEmail);
  
  if (!user) {
    console.error('User not found');
    return;
  }
  
  const userId = user.id;
  
  // Mark subscription as cancelled and update expires_at if provided
  const updateData: { status: string; expires_at?: string } = {
    status: 'cancelled'
  };
  
  if (endsAt) {
    updateData.expires_at = endsAt;
    console.log('📅 Setting expires_at to:', endsAt);
  }
  
  // Update by user_id and plan_type, optionally match subscription ID if available
  let query = supabaseAdmin
    .from('subscriptions')
    .update(updateData)
    .eq('user_id', userId)
    .eq('plan_type', 'monthly');
  
  // If we have the subscription ID, use it to be more precise
  if (subscriptionId) {
    query = query.eq('lemon_squeezy_subscription_id', subscriptionId);
  }
  
  const { error } = await query;
  
  if (error) {
    console.error('❌ Error cancelling subscription:', error);
  } else {
    console.log('✅ Subscription cancelled in database');
    if (endsAt) {
      console.log('✅ Expiration date set to:', endsAt);
    }
  }
}

