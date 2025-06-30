import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if both URL and key are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        // Disable realtime in WebContainer to avoid WebSocket issues
        params: {
          eventsPerSecond: 2,
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Database types
export interface Profile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  personality_type: 'real-me' | 'my-mask' | 'crazy-self';
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  ended_at?: string;
}

export interface Conversation {
  id: string;
  match_id: string;
  started_at: string;
  ended_at?: string;
  duration?: number;
  avg_drift_level?: number;
  feedback_events: any[];
}

export interface VoiceProfile {
  id: string;
  user_id: string;
  audio_url: string;
  analysis_data?: any;
  created_at: string;
}

// Auth helpers
export const getCurrentUser = async () => {
  if (!supabase) throw new Error('Supabase client not initialized');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.warn('Auth check failed:', error);
    return null;
  }
};

export const getProfile = async (userId: string) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data as Profile;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Profile;
};

// Matching helpers
export const findMatch = async (userId: string, personalityType: string) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  // This would implement the matching algorithm
  // For now, we'll create a simple random match
  try {
    const { data, error } = await supabase.rpc('find_match', {
      user_id: userId,
      personality: personalityType
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Matching failed:', error);
    return null;
  }
};

export const createMatch = async (user1Id: string, user2Id: string) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('matches')
    .insert({
      user1_id: user1Id,
      user2_id: user2Id,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Match;
};

// Conversation helpers
export const createConversation = async (matchId: string) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      match_id: matchId,
      started_at: new Date().toISOString(),
      feedback_events: []
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Conversation;
};

export const updateConversation = async (conversationId: string, updates: Partial<Conversation>) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', conversationId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Conversation;
};

// Voice profile helpers
export const uploadVoiceProfile = async (userId: string, audioBlob: Blob) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  const fileName = `voice-profiles/${userId}/${Date.now()}.webm`;
  
  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voice-profiles')
      .upload(fileName, audioBlob);
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('voice-profiles')
      .getPublicUrl(fileName);
    
    const { data, error } = await supabase
      .from('voice_profiles')
      .insert({
        user_id: userId,
        audio_url: publicUrl
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as VoiceProfile;
  } catch (error) {
    console.warn('Voice upload failed:', error);
    throw error;
  }
};

// Real-time subscriptions (with fallback for WebContainer)
export const subscribeToMatches = (userId: string, callback: (match: Match) => void) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    return supabase
      .channel('matches')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'matches',
        filter: `user1_id=eq.${userId},user2_id=eq.${userId}`
      }, (payload) => {
        callback(payload.new as Match);
      })
      .subscribe();
  } catch (error) {
    console.warn('Real-time subscription failed:', error);
    return { unsubscribe: () => {} };
  }
};

export const subscribeToConversations = (matchId: string, callback: (conversation: Conversation) => void) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    return supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `match_id=eq.${matchId}`
      }, (payload) => {
        callback(payload.new as Conversation);
      })
      .subscribe();
  } catch (error) {
    console.warn('Real-time subscription failed:', error);
    return { unsubscribe: () => {} };
  }
};