import { createClient } from '@supabase/supabase-js';

// Use service role key for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * This endpoint syncs subscription data from Lemon Squeezy API
 * Use this to manually fix subscriptions that are missing the lemon_squeezy_subscription_id
 */
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      console.error('LEMONSQUEEZY_API_KEY not set');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Get user's email from Supabase
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData) {
      console.error('Error fetching user:', userError);
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const userEmail = userData.user.email;

    // Get user's subscription from database
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_type', 'monthly')
      .eq('status', 'active')
      .maybeSingle();

    if (subError) {
      console.error('Error fetching subscription:', subError);
      return Response.json({ error: 'Failed to fetch subscription' }, { status: 500 });
    }

    if (!subscription) {
      return Response.json({ error: 'No active monthly subscription found' }, { status: 404 });
    }

    // Always re-sync to ensure we have the latest subscription ID
    console.log('🔄 Syncing subscription for user:', userEmail);
    if (subscription.lemon_squeezy_subscription_id) {
      console.log('ℹ️ Current stored subscription ID:', subscription.lemon_squeezy_subscription_id);
      console.log('ℹ️ Will update with latest ID from Lemon Squeezy...');
    }

    // Fetch subscriptions from Lemon Squeezy API
    const response = await fetch(
      'https://api.lemonsqueezy.com/v1/subscriptions',
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Lemon Squeezy API error:', errorData);
      return Response.json(
        { error: 'Failed to fetch subscriptions from Lemon Squeezy' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('📊 Fetched subscriptions from Lemon Squeezy');
    console.log('📊 Total subscriptions:', data.data?.length);
    
    // Find subscription matching user's email
    const lemonSubscription = data.data?.find((sub: { attributes: { user_email?: string; status: string } }) => 
      sub.attributes.user_email?.toLowerCase() === userEmail?.toLowerCase() &&
      sub.attributes.status === 'active'
    );

    if (!lemonSubscription) {
      console.error('❌ No matching subscription found for email:', userEmail);
      console.error('❌ Available subscriptions:', data.data?.map((s: { id: string; attributes: { user_email?: string; status: string } }) => ({
        id: s.id,
        email: s.attributes.user_email,
        status: s.attributes.status
      })));
      return Response.json({ 
        error: 'No matching active subscription found in Lemon Squeezy',
        hint: 'Make sure the email in Lemon Squeezy matches your account email'
      }, { status: 404 });
    }

    // The subscription ID should be a string
    const lemonSubscriptionId = String(lemonSubscription.id);
    
    console.log('✅ Found matching subscription:');
    console.log('   - Subscription ID:', lemonSubscriptionId);
    console.log('   - Email:', lemonSubscription.attributes.user_email);
    console.log('   - Status:', lemonSubscription.attributes.status);
    console.log('   - Full subscription object:', JSON.stringify(lemonSubscription, null, 2));

    // Update database with the subscription ID
    console.log('💾 Updating database with subscription ID:', lemonSubscriptionId);
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({ lemon_squeezy_subscription_id: lemonSubscriptionId })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('❌ Error updating subscription:', updateError);
      return Response.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    console.log('✅ Successfully synced subscription ID:', lemonSubscriptionId);

    return Response.json({ 
      success: true, 
      message: 'Subscription ID synced successfully',
      subscriptionId: lemonSubscriptionId
    });

  } catch (error) {
    console.error('Error syncing subscription:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}


