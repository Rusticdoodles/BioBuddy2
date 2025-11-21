import { createClient } from '@supabase/supabase-js';

// Use service role key for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user's subscription - check for active first, then any monthly subscription
    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_type', 'monthly')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching subscription:', fetchError);
      return Response.json({ error: 'Failed to fetch subscription' }, { status: 500 });
    }

    // Check for multiple subscriptions (debugging)
    const { data: allSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status, lemon_squeezy_subscription_id, created_at')
      .eq('user_id', userId)
      .eq('plan_type', 'monthly');

    if (allSubscriptions && allSubscriptions.length > 1) {
      console.warn('⚠️ Multiple monthly subscriptions found:', allSubscriptions.map(s => ({
        id: s.id,
        status: s.status,
        lemon_id: s.lemon_squeezy_subscription_id,
        created: s.created_at
      })));
    }

    if (!subscription) {
      return Response.json({ 
        error: 'No active monthly subscription found',
        hint: allSubscriptions && allSubscriptions.length > 0 
          ? `Found ${allSubscriptions.length} subscription(s) but none are active. Status: ${allSubscriptions.map(s => s.status).join(', ')}`
          : 'No subscriptions found for this user.'
      }, { status: 404 });
    }

    if (!subscription.lemon_squeezy_subscription_id) {
      return Response.json({ 
        error: 'Subscription ID not found',
        hint: 'Try using the "Sync Subscription" button first to link your subscription with Lemon Squeezy.'
      }, { status: 404 });
    }

    // Cancel subscription via Lemon Squeezy API
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      console.error('LEMONSQUEEZY_API_KEY not set');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Ensure subscription ID is a string (Lemon Squeezy API requires string format)
    const subscriptionId = String(subscription.lemon_squeezy_subscription_id).trim();
    
    console.log('🔍 Subscription details:');
    console.log('   - Database ID:', subscription.id);
    console.log('   - Lemon Squeezy ID (raw):', subscription.lemon_squeezy_subscription_id);
    console.log('   - Lemon Squeezy ID (formatted):', subscriptionId);
    console.log('   - Status:', subscription.status);
    console.log('   - Plan Type:', subscription.plan_type);

    if (!subscriptionId || subscriptionId === 'null' || subscriptionId === 'undefined') {
      return Response.json({ 
        error: 'Invalid subscription ID',
        hint: 'The subscription ID is missing or invalid. Try syncing your subscription first.'
      }, { status: 400 });
    }

    console.log('🚀 Attempting to cancel subscription via Lemon Squeezy API:', subscriptionId);

    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
      {
        method: 'PATCH',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          data: {
            type: 'subscriptions',
            id: subscriptionId,
            attributes: {
              cancelled: true,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Failed to parse error response' };
      }
      
      console.error('❌ Lemon Squeezy API error:');
      console.error('   - Status:', response.status);
      console.error('   - Subscription ID used:', subscriptionId);
      console.error('   - Error details:', JSON.stringify(errorData, null, 2));
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to cancel subscription with Lemon Squeezy';
      if (response.status === 404) {
        errorMessage = 'Subscription not found in Lemon Squeezy. The subscription ID may be incorrect.';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'Authentication failed with Lemon Squeezy. Please check API key configuration.';
      } else if (errorData?.errors?.[0]?.detail) {
        errorMessage = errorData.errors[0].detail;
      }
      
      return Response.json(
        { 
          error: errorMessage,
          details: errorData,
          subscriptionId: subscriptionId
        },
        { status: response.status }
      );
    }

    console.log('✅ Subscription cancelled successfully in Lemon Squeezy');
    
    // Parse the response to get cancellation details
    let cancelResponseData;
    try {
      cancelResponseData = await response.json();
      console.log('📄 Cancellation response data received');
    } catch (parseError) {
      console.error('❌ Failed to parse Lemon Squeezy response:', parseError);
      // Continue anyway - cancellation succeeded
      cancelResponseData = null;
    }

    // Extract the ends_at date from Lemon Squeezy response
    const endsAt = cancelResponseData?.data?.attributes?.ends_at;
    
    if (endsAt) {
      console.log('📅 Subscription will end at:', endsAt);
    } else {
      console.warn('⚠️ No ends_at date found in Lemon Squeezy response, using expires_at from database');
    }

    // Update subscription status in database
    // Store expires_at from Lemon Squeezy if available, otherwise keep existing
    console.log('💾 Updating database: setting status to cancelled');
    const updateData: { status: string; expires_at?: string } = { 
      status: 'cancelled'
    };
    
    if (endsAt) {
      updateData.expires_at = endsAt;
    }
    
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscription.id);

    if (updateError) {
      console.error('❌ Error updating subscription status:', updateError);
      return Response.json({ error: 'Failed to update subscription status' }, { status: 500 });
    }

    console.log('✅ Database updated successfully - subscription cancellation complete!');
    
    // Use the endsAt from Lemon Squeezy if available, otherwise use existing expires_at
    const finalExpiresAt = endsAt || subscription.expires_at;
    console.log('📅 Subscription will remain active until:', finalExpiresAt);

    return Response.json({ 
      success: true, 
      message: 'Subscription cancelled successfully',
      expiresAt: finalExpiresAt
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

