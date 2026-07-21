import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Example function to sync a user (mirrors the Android SupabaseClient.kt functionality)
export const syncUserToSupabase = async (whatsappNumber, email, fullName, role) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({ email, full_name: fullName, role, whatsapp: whatsappNumber }, { onConflict: 'email' })
      .select();

    if (error) throw error;
    console.log("User synced to Supabase successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Error syncing user to Supabase:", err);
    return { success: false, error: err };
  }
};

export const submitPollVote = async (userId, pollId, pointsReward) => {
  if (!userId) throw new Error('User must be logged in to vote.');
  
  // 1. Check if user already voted
  const actionName = `poll_vote_${pollId}`;
  const { data: existingVotes, error: checkError } = await supabase
    .from('point_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('action', actionName);
    
  if (checkError) throw checkError;
  if (existingVotes && existingVotes.length > 0) {
    throw new Error('You have already voted in this poll!');
  }

  // 2. Insert into point_logs
  const { error: insertError } = await supabase
    .from('point_logs')
    .insert({
      user_id: userId,
      action: actionName,
      points_awarded: pointsReward
    });
    
  if (insertError) throw insertError;

  // 3. Update profiles table to add points
  // We first need to get current points since Supabase RPC for increment isn't set up yet
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', userId)
    .single();
    
  if (profileError) throw profileError;
  
  const currentPoints = profile?.points || 0;
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ points: currentPoints + pointsReward })
    .eq('id', userId);
    
  if (updateError) throw updateError;
  
  return { success: true, pointsAwarded: pointsReward };
};
