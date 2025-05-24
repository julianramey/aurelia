import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log(`Function 'track-kit-view' up and running!`);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { kitUserId } = await req.json();
    if (!kitUserId) {
      throw new Error('Missing kitUserId in request body');
    }

    // Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your Edge Function settings
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Upsert logic: Try to increment, if conflict (row exists), update.
    // If no conflict (row doesn't exist), insert.
    // Supabase upsert with onConflict doesn't directly support incrementing like this.
    // We'll use a transaction or a plpgsql function for atomicity if high concurrency is expected.
    // For now, a simpler approach: select, then insert or update.

    // Check if a record for this kit_user_id and today's date already exists
    const { data: existingEntry, error: selectError } = await supabaseClient
      .from('media_kit_daily_views')
      .select('daily_view_count')
      .eq('kit_user_id', kitUserId)
      .eq('view_date', today)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116: No rows found, which is fine
      console.error('Error selecting daily view entry:', selectError);
      throw selectError;
    }

    let newViewCount = 1;
    if (existingEntry) {
      newViewCount = (existingEntry.daily_view_count || 0) + 1;
      const { error: updateError } = await supabaseClient
        .from('media_kit_daily_views')
        .update({ daily_view_count: newViewCount, updated_at: new Date().toISOString() })
        .eq('kit_user_id', kitUserId)
        .eq('view_date', today);
      if (updateError) {
        console.error('Error updating daily view count:', updateError);
        throw updateError;
      }
    } else {
      // No entry for today, insert a new one
      const { error: insertError } = await supabaseClient
        .from('media_kit_daily_views')
        .insert({
          kit_user_id: kitUserId,
          view_date: today,
          daily_view_count: 1,
        });
      if (insertError) {
        console.error('Error inserting new daily view entry:', insertError);
        throw insertError;
      }
    }

    return new Response(JSON.stringify({ message: 'View tracked successfully', kitUserId, date: today, newViewCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in track-kit-view function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

/* 
Test with curl:
curl -i --location --request POST 'http://localhost:54321/functions/v1/track-kit-view' \
--header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
    "kitUserId": "YOUR_USER_ID_TO_TEST_WITH"
}'

Replace YOUR_SUPABASE_ANON_KEY with your actual anon key 
(or service_role_key if testing locally and your function expects that for auth override, though typically for client calls anon key is used for row-level policy checks if any were applicable on the function itself, here we use service_role for DB ops).

And YOUR_USER_ID_TO_TEST_WITH with a valid UUID from your auth.users table.
Ensure the user_id exists in auth.users because of the foreign key constraint on media_kit_daily_views.kit_user_id.
*/ 