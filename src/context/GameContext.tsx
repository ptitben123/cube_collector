import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, saveUserData, saveUnlockedSkin, saveUpgrade, saveCustomSkin, saveControls, saveTrophy } from '../lib/supabase';

interface Skin {
  name: string;
  description: string;
  color: string;
  price: number;
  isRounded?: boolean;
  rotate?: boolean;
  glow?: boolean;
  exclusive?: boolean;
  pulse?: boolean;
  border?: boolean;
  borderColor?: string;
  shadow?: boolean;
  shadowColor?: string;
  trail?: boolean;
  trailColor?: string;
  rainbow?: boolean;
  metallic?: boolean;
  custom?: boolean;
}

interface Upgrade {
  name: string;
  description: string;
  price: number;
  maxLevel: number;
  effect: (level: number) => number;
}

interface Trophy {
  id: string;
  name: string;
  description: string;
  requirement: number;
  reward: {
    type: 'points' | 'skin' | 'multiplier';
    value: number | string;
  };
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
}

interface Controls {
  upKey: string;
  downKey: string;
  leftKey: string;
  rightKey: string;
  shopKey: string;
  inventoryKey: string;
}

interface Friend {
  id: string;
  nickname: string;
  profilePicture?: string;
  status: 'online' | 'offline';
  lastSeen: Date;
}

interface GameContextType {
  score: number;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number, skinId: string) => void;
  skins: Record<string, Skin>;
  unlockedSkins: string[];
  activeSkin: Skin;
  setActiveSkin: (skinId: string) => void;
  controls: Controls;
  updateControls: (newControls: Controls) => void;
  upgrades: Record<string, Upgrade>;
  upgradeLevel: Record<string, number>;
  purchaseUpgrade: (upgradeId: string) => void;
  getUpgradeEffect: (upgradeId: string) => number;
  totalCollected: number;
  addCollected: () => void;
  trophies: Trophy[];
  claimedTrophies: string[];
  claimTrophyReward: (trophyId: string) => void;
  resetProgress: () => void;
  createCustomSkin: (skinData: Partial<Skin>) => void;
  customSkins: Record<string, Skin>;
  nickname: string;
  updateNickname: (newNickname: string) => void;
  profilePicture: string;
  updateProfilePicture: (newPicture: string) => void;
  totalPointsGained: number;
  friends: Friend[];
  pendingFriends: Friend[];
  addFriend: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  acceptFriendRequest: (friendId: string) => void;
  rejectFriendRequest: (friendId: string) => void;
}

interface GameProviderProps {
  children: React.ReactNode;
  session: Session | null;
}

const defaultControls: Controls = {
  upKey: 'w',
  downKey: 's',
  leftKey: 'a',
  rightKey: 'd',
  shopKey: 'e',
  inventoryKey: 'q'
};

// ... (all the previous skins, upgrades, and trophies arrays remain unchanged)

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<GameProviderProps> = ({ children, session }) => {
  const [score, setScore] = useState(0);
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['default']);
  const [activeSkinId, setActiveSkinId] = useState('default');
  const [controls, setControls] = useState<Controls>(defaultControls);
  const [upgradeLevel, setUpgradeLevel] = useState<Record<string, number>>({});
  const [totalCollected, setTotalCollected] = useState(0);
  const [claimedTrophies, setClaimedTrophies] = useState<string[]>([]);
  const [pointMultiplier, setPointMultiplier] = useState(1);
  const [customSkins, setCustomSkins] = useState<Record<string, Skin>>({});
  const [nickname, setNickname] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [totalPointsGained, setTotalPointsGained] = useState(0);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingFriends, setPendingFriends] = useState<Friend[]>([]);

  // Load user data when session changes
  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user) return;

      try {
        // Load profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setScore(profile.score || 0);
          setNickname(profile.nickname || '');
          setProfilePicture(profile.profile_picture || '');
          setTotalCollected(profile.total_collected || 0);
          setTotalPointsGained(profile.total_points_gained || 0);
          setPointMultiplier(profile.point_multiplier || 1);
          setControls(profile.controls || defaultControls);
          setClaimedTrophies(profile.claimed_trophies || []);
        }

        // Load unlocked skins
        const { data: skins } = await supabase
          .from('unlocked_skins')
          .select('skin_id')
          .eq('profile_id', session.user.id);

        if (skins) {
          const skinIds = skins.map(skin => skin.skin_id);
          setUnlockedSkins(['default', ...skinIds]);
        }

        // Load custom skins
        const { data: customSkinData } = await supabase
          .from('custom_skins')
          .select('*')
          .eq('profile_id', session.user.id);

        if (customSkinData) {
          const customSkinsMap: Record<string, Skin> = {};
          customSkinData.forEach(skin => {
            customSkinsMap[`custom_${skin.id}`] = {
              name: skin.name,
              description: skin.description || '',
              color: skin.color,
              price: 0,
              custom: true,
              isRounded: skin.is_rounded,
              rotate: skin.rotate,
              glow: skin.glow,
              pulse: skin.pulse,
              border: skin.border,
              borderColor: skin.border_color,
              shadow: skin.shadow,
              shadowColor: skin.shadow_color,
              trail: skin.trail,
              trailColor: skin.trail_color
            };
          });
          setCustomSkins(customSkinsMap);
        }

        // Load upgrades
        const { data: upgradeData } = await supabase
          .from('upgrades')
          .select('upgrade_id, level')
          .eq('profile_id', session.user.id);

        if (upgradeData) {
          const upgradeLevels: Record<string, number> = {};
          upgradeData.forEach(upgrade => {
            upgradeLevels[upgrade.upgrade_id] = upgrade.level;
          });
          setUpgradeLevel(upgradeLevels);
        }

      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [session]);

  // Save user data when it changes
  useEffect(() => {
    const saveData = async () => {
      if (!session?.user) return;

      await saveUserData(session.user.id, {
        nickname,
        profile_picture: profilePicture,
        score,
        total_collected: totalCollected,
        total_points_gained: totalPointsGained,
        point_multiplier: pointMultiplier,
        controls,
        claimed_trophies: claimedTrophies
      });
    };

    const debounceTimer = setTimeout(saveData, 1000);
    return () => clearTimeout(debounceTimer);
  }, [session, score, nickname, profilePicture, totalCollected, totalPointsGained, pointMultiplier, controls, claimedTrophies]);

  // ... (all previous functions remain unchanged)

  const updateControls = async (newControls: Controls) => {
    if (!session?.user) return;
    setControls(newControls);
    await saveControls(session.user.id, newControls);
  };

  const claimTrophyReward = async (trophyId: string) => {
    if (!session?.user) return;
    
    const trophy = trophyRoad.find(t => t.id === trophyId);
    if (trophy && !claimedTrophies.includes(trophyId) && totalCollected >= trophy.requirement) {
      if (trophy.reward.type === 'points') {
        setScore(prev => prev + (trophy.reward.value as number));
        setTotalPointsGained(prev => prev + (trophy.reward.value as number));
      } else if (trophy.reward.type === 'skin') {
        setUnlockedSkins(prev => [...prev, trophy.reward.value as string]);
        await saveUnlockedSkin(session.user.id, trophy.reward.value as string);
      } else if (trophy.reward.type === 'multiplier') {
        setPointMultiplier(prev => prev * (trophy.reward.value as number));
      }
      setClaimedTrophies(prev => [...prev, trophyId]);
      await saveTrophy(session.user.id, trophyId);
    }
  };

  // ... (remaining code and context provider remain unchanged)

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};