```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Initialize user data in Supabase
export const initializeUserData = async (userId: string) => {
  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      // Create profile if it doesn't exist
      await supabase.from('profiles').insert([{ 
        id: userId,
        score: 0,
        total_collected: 0,
        total_points_gained: 0,
        point_multiplier: 1,
        controls: {
          upKey: 'w',
          downKey: 's',
          leftKey: 'a',
          rightKey: 'd',
          shopKey: 'e',
          inventoryKey: 'q'
        },
        claimed_trophies: []
      }]);
      
      // Add default skin
      await supabase.from('unlocked_skins').insert([{
        profile_id: userId,
        skin_id: 'default'
      }]);

      // Initialize upgrades with level 0
      const defaultUpgrades = ['speed', 'points', 'magnet', 'spawn', 'bonus', 'combo', 'shield', 'chain', 'vacuum'];
      await Promise.all(defaultUpgrades.map(upgradeId => 
        supabase.from('upgrades').insert([{
          profile_id: userId,
          upgrade_id: upgradeId,
          level: 0
        }])
      ));
    }

    return true;
  } catch (error) {
    console.error('Error initializing user data:', error);
    return false;
  }
};

// Save user data to Supabase
export const saveUserData = async (userId: string, data: {
  nickname?: string;
  profile_picture?: string;
  score?: number;
  total_collected?: number;
  total_points_gained?: number;
  point_multiplier?: number;
  controls?: Record<string, string>;
  claimed_trophies?: string[];
}) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

// Save controls
export const saveControls = async (userId: string, controls: Record<string, string>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        controls,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving controls:', error);
    return false;
  }
};

// Save trophy
export const saveTrophy = async (userId: string, trophyId: string) => {
  try {
    const { error } = await supabase
      .from('claimed_trophies')
      .insert([{
        profile_id: userId,
        trophy_id: trophyId
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving trophy:', error);
    return false;
  }
};

// Save friend request
export const saveFriendRequest = async (senderId: string, receiverId: string) => {
  try {
    const { error } = await supabase
      .from('friend_requests')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving friend request:', error);
    return false;
  }
};

// Accept friend request
export const acceptFriendRequest = async (userId: string, friendId: string) => {
  try {
    // Start a transaction
    const { error: deleteError } = await supabase
      .from('friend_requests')
      .delete()
      .match({ sender_id: friendId, receiver_id: userId });

    if (deleteError) throw deleteError;

    // Add friend relationship (bidirectional)
    await Promise.all([
      supabase.from('friends').insert([{
        profile_id: userId,
        friend_id: friendId
      }]),
      supabase.from('friends').insert([{
        profile_id: friendId,
        friend_id: userId
      }])
    ]);

    return true;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return false;
  }
};

// Reject friend request
export const rejectFriendRequest = async (userId: string, friendId: string) => {
  try {
    const { error } = await supabase
      .from('friend_requests')
      .delete()
      .match({ sender_id: friendId, receiver_id: userId });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return false;
  }
};

// Remove friend
export const removeFriend = async (userId: string, friendId: string) => {
  try {
    // Remove both directions of the friendship
    await Promise.all([
      supabase.from('friends')
        .delete()
        .match({ profile_id: userId, friend_id: friendId }),
      supabase.from('friends')
        .delete()
        .match({ profile_id: friendId, friend_id: userId })
    ]);

    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    return false;
  }
};

// Save unlocked skin
export const saveUnlockedSkin = async (userId: string, skinId: string) => {
  try {
    const { error } = await supabase
      .from('unlocked_skins')
      .insert([{
        profile_id: userId,
        skin_id: skinId
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving unlocked skin:', error);
    return false;
  }
};

// Save upgrade
export const saveUpgrade = async (userId: string, upgradeId: string, level: number) => {
  try {
    const { data: existing } = await supabase
      .from('upgrades')
      .select('*')
      .eq('profile_id', userId)
      .eq('upgrade_id', upgradeId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('upgrades')
        .update({ 
          level,
          updated_at: new Date().toISOString()
        })
        .eq('profile_id', userId)
        .eq('upgrade_id', upgradeId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('upgrades')
        .insert([{
          profile_id: userId,
          upgrade_id: upgradeId,
          level
        }]);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error saving upgrade:', error);
    return false;
  }
};

// Save custom skin
export const saveCustomSkin = async (userId: string, skin: {
  name: string;
  description?: string;
  color: string;
  is_rounded?: boolean;
  rotate?: boolean;
  glow?: boolean;
  pulse?: boolean;
  border?: boolean;
  border_color?: string;
  shadow?: boolean;
  shadow_color?: string;
  trail?: boolean;
  trail_color?: string;
}) => {
  try {
    const { error, data } = await supabase
      .from('custom_skins')
      .insert([{
        profile_id: userId,
        ...skin
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Also add to unlocked_skins
    if (data) {
      await supabase
        .from('unlocked_skins')
        .insert([{
          profile_id: userId,
          skin_id: `custom_${data.id}`
        }]);
    }

    return true;
  } catch (error) {
    console.error('Error saving custom skin:', error);
    return false;
  }
};

// Load all user data
export const loadUserData = async (userId: string) => {
  try {
    const [
      profileResponse,
      skinsResponse,
      upgradesResponse,
      customSkinsResponse,
      trophiesResponse,
      friendsResponse,
      friendRequestsResponse
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('unlocked_skins').select('skin_id').eq('profile_id', userId),
      supabase.from('upgrades').select('*').eq('profile_id', userId),
      supabase.from('custom_skins').select('*').eq('profile_id', userId),
      supabase.from('claimed_trophies').select('trophy_id').eq('profile_id', userId),
      supabase.from('friends').select('*').eq('profile_id', userId),
      supabase.from('friend_requests').select('*').eq('receiver_id', userId)
    ]);

    return {
      profile: profileResponse.data,
      unlockedSkins: skinsResponse.data?.map(s => s.skin_id) || [],
      upgrades: upgradesResponse.data || [],
      customSkins: customSkinsResponse.data || [],
      claimedTrophies: trophiesResponse.data?.map(t => t.trophy_id) || [],
      friends: friendsResponse.data || [],
      friendRequests: friendRequestsResponse.data || []
    };
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};
```