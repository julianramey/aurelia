import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

console.log(`Function 'track-kit-engagement' up and running!`);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { kitUserId, engagementType } = await req.json();
    if (!kitUserId) {
      throw new Error('Missing kitUserId in request body');
    }
    if (!engagementType) {
      throw new Error('Missing engagementType in request body');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Using confirmed schema names: 'engagement_date' for date, 'engagement_type' for type
    const { data: existingEntry, error: selectError } = await supabaseClient
      .from('media_kit_daily_engagements')
      .select('daily_engagement_count')
      .eq('kit_user_id', kitUserId)
      .eq('engagement_date', today)        // Correct: schema has 'engagement_date' for the date
      .eq('engagement_type', engagementType)  // Correct: schema has 'engagement_type' for the type
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116: No rows found
      console.error('Error selecting daily engagement entry:', selectError);
      throw selectError;
    }

    let newEngagementCount = 1;
    if (existingEntry) {
      newEngagementCount = (existingEntry.daily_engagement_count || 0) + 1;
      const { error: updateError } = await supabaseClient
        .from('media_kit_daily_engagements')
        .update({ daily_engagement_count: newEngagementCount, updated_at: new Date().toISOString() })
        .eq('kit_user_id', kitUserId)
        .eq('engagement_date', today)        // Correct for date column
        .eq('engagement_type', engagementType); // Correct for type column
      if (updateError) {
        console.error('Error updating daily engagement count:', updateError);
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabaseClient
        .from('media_kit_daily_engagements')
        .insert({
          kit_user_id: kitUserId,
          engagement_date: today,               // Correct for date column
          engagement_type: engagementType,      // Correct for type column
          daily_engagement_count: 1,
        });
      if (insertError) {
        console.error('Error inserting new daily engagement entry:', insertError);
        throw insertError;
      }
    }

    return new Response(JSON.stringify({ message: 'Engagement tracked successfully', kitUserId, date: today, engagementType, newEngagementCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in track-kit-engagement function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

/*
Test with curl:
curl -i --location --request POST 'http://localhost:54321/functions/v1/track-kit-engagement' \
--header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
    "kitUserId": "YOUR_USER_ID_TO_TEST_WITH",
    "engagementType": "share_button_click"
}'
*/ 