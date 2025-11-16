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

    // Get user's subscription
    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_type', 'monthly')
      .eq('status', 'active')
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching subscription:', fetchError);
      return Response.json({ error: 'Failed to fetch subscription' }, { status: 500 });
    }

    if (!subscription) {
      return Response.json({ error: 'No active monthly subscription found' }, { status: 404 });
    }

    if (!subscription.lemon_squeezy_subscription_id) {
      return Response.json({ error: 'Subscription ID not found' }, { status: 404 });
    }

    // Cancel subscription via Lemon Squeezy API
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      console.error('LEMONSQUEEZY_API_KEY not set');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    console.log('Attempting to cancel subscription:', subscription.lemon_squeezy_subscription_id);

    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subscription.lemon_squeezy_subscription_id}`,
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
            id: subscription.lemon_squeezy_subscription_id,
            attributes: {
              cancelled: true,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Lemon Squeezy API error:', errorData);
      console.error('Response status:', response.status);
      console.error('Subscription ID:', subscription.lemon_squeezy_subscription_id);
      
      // Return more detailed error information
      const errorMessage = errorData.errors?.[0]?.detail || 'Failed to cancel subscription with Lemon Squeezy';
      return Response.json(
        { error: errorMessage, details: errorData },
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
    // Note: We keep expires_at as-is since that's when the subscription access actually ends
    console.log('💾 Updating database: setting status to cancelled');
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({ 
        status: 'cancelled'
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('❌ Error updating subscription status:', updateError);
      return Response.json({ error: 'Failed to update subscription status' }, { status: 500 });
    }

    console.log('✅ Database updated successfully - subscription cancellation complete!');
    console.log('📅 Subscription will remain active until:', subscription.expires_at);

    return Response.json({ 
      success: true, 
      message: 'Subscription cancelled successfully',
      endsAt: subscription.expires_at
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

