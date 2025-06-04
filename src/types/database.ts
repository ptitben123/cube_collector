export interface Profile {
  id: string;
  nickname: string | null;
  profile_picture: string | null;
  score: number;
  total_collected: number;
  total_points_gained: number;
  point_multiplier: number;
  created_at: string;
  updated_at: string;
}

export interface UnlockedSkin {
  id: string;
  profile_id: string;
  skin_id: string;
  created_at: string;
}

export interface CustomSkin {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  color: string;
  is_rounded: boolean;
  rotate: boolean;
  glow: boolean;
  pulse: boolean;
  border: boolean;
  border_color: string | null;
  shadow: boolean;
  shadow_color: string | null;
  trail: boolean;
  trail_color: string | null;
  created_at: string;
}

export interface Upgrade {
  id: string;
  profile_id: string;
  upgrade_id: string;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface ClaimedTrophy {
  id: string;
  profile_id: string;
  trophy_id: string;
  created_at: string;
}

export interface Friend {
  id: string;
  profile_id: string;
  friend_id: string;
  status: string;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}