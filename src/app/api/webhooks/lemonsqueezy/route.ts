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
  
  console.log('Creating subscription:', planType, expiresAt, subscriptionId);
  
  // Check if subscription already exists
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  
  if (existing) {
    console.log('Active subscription already exists, updating');
    // Update existing subscription
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        plan_type: planType,
        expires_at: expiresAt,
        lemon_squeezy_subscription_id: subscriptionId,
      })
      .eq('id', existing.id);
    
    if (updateError) {
      console.error('Error updating subscription:', updateError);
    } else {
      console.log('Subscription updated successfully');
    }
  } else {
    // Create new subscription
    const { error: insertError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: planType,
        status: 'active',
        expires_at: expiresAt,
        lemon_squeezy_subscription_id: subscriptionId,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating subscription:', insertError);
    } else {
      console.log('Subscription created successfully');
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
  
  // Extend subscription by 30 days
  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + 30);
  
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      expires_at: newExpiry.toISOString(),
      status: 'active',
      lemon_squeezy_subscription_id: subscriptionId,
    })
    .eq('user_id', userId)
    .eq('plan_type', 'monthly');
  
  if (error) {
    console.error('❌ Error updating subscription:', error);
  } else {
    console.log('✅ Subscription renewed until:', newExpiry);
    console.log('✅ Subscription ID stored:', subscriptionId);
  }
}

async function handleSubscriptionCancelled(body: { data: { attributes: { user_email?: string } } }) {
  const customerEmail = body.data.attributes.user_email;
  
  console.log('Subscription cancelled for:', customerEmail);
  
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
  
  // Mark subscription as cancelled
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'cancelled',
    })
    .eq('user_id', userId)
    .eq('plan_type', 'monthly');
  
  if (error) {
    console.error('Error cancelling subscription:', error);
  } else {
    console.log('Subscription cancelled in database');
  }
}

