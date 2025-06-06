import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, saveUserData, saveUnlockedSkin, saveUpgrade, saveCustomSkin, saveControls, saveTrophy, saveFriendRequest, acceptFriendRequest as acceptFriendRequestDB, rejectFriendRequest as rejectFriendRequestDB, removeFriend as removeFriendDB } from '../lib/supabase';

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

const defaultSkins: Record<string, Skin> = {
  default: {
    name: 'Default',
    description: 'The classic cube',
    color: '#ffffff',
    price: 0
  },
  red: {
    name: 'Red Cube',
    description: 'A fiery red cube',
    color: '#ef4444',
    price: 100
  },
  blue: {
    name: 'Blue Cube',
    description: 'A cool blue cube',
    color: '#3b82f6',
    price: 150
  },
  green: {
    name: 'Green Cube',
    description: 'A natural green cube',
    color: '#22c55e',
    price: 200
  },
  purple: {
    name: 'Purple Cube',
    description: 'A mystical purple cube',
    color: '#a855f7',
    price: 300
  },
  gold: {
    name: 'Golden Cube',
    description: 'A precious golden cube',
    color: '#fbbf24',
    price: 500,
    glow: true
  },
  diamond: {
    name: 'Diamond Cube',
    description: 'A sparkling diamond cube',
    color: '#e5e7eb',
    price: 1000,
    glow: true,
    pulse: true
  },
  rainbow: {
    name: 'Rainbow Cube',
    description: 'A colorful rainbow cube',
    color: '#ff6b6b',
    price: 2000,
    rainbow: true,
    glow: true
  },
  neon: {
    name: 'Neon Cube',
    description: 'A bright neon cube',
    color: '#00ff88',
    price: 1500,
    glow: true,
    pulse: true
  },
  shadow: {
    name: 'Shadow Cube',
    description: 'A mysterious shadow cube',
    color: '#1f2937',
    price: 800,
    shadow: true,
    shadowColor: '#000000'
  },
  fire: {
    name: 'Fire Cube',
    description: 'A blazing fire cube',
    color: '#ff4500',
    price: 1200,
    glow: true,
    trail: true,
    trailColor: '#ff6b35'
  },
  ice: {
    name: 'Ice Cube',
    description: 'A frozen ice cube',
    color: '#87ceeb',
    price: 1000,
    glow: true,
    isRounded: true
  },
  metal: {
    name: 'Metal Cube',
    description: 'A shiny metal cube',
    color: '#c0c0c0',
    price: 600,
    metallic: true,
    border: true,
    borderColor: '#808080'
  },
  plasma: {
    name: 'Plasma Cube',
    description: 'An energetic plasma cube',
    color: '#ff00ff',
    price: 3000,
    glow: true,
    pulse: true,
    rotate: true
  },
  void: {
    name: 'Void Cube',
    description: 'A cube from the void',
    color: '#000000',
    price: 2500,
    border: true,
    borderColor: '#8b5cf6',
    glow: true
  },
  crystal: {
    name: 'Crystal Cube',
    description: 'A beautiful crystal cube',
    color: '#fef3c7',
    price: 1800,
    isRounded: true,
    glow: true,
    pulse: true
  },
  legendary: {
    name: 'Legendary Cube',
    description: 'The ultimate cube',
    color: '#ffd700',
    price: 0,
    exclusive: true,
    glow: true,
    pulse: true,
    rotate: true,
    trail: true,
    trailColor: '#ff6b35'
  }
};

const upgradeDefinitions: Record<string, Upgrade> = {
  speed: {
    name: 'Speed Boost',
    description: 'Increases movement speed',
    price: 50,
    maxLevel: 10,
    effect: (level) => 2 + level * 0.5
  },
  points: {
    name: 'Point Multiplier',
    description: 'Increases points per collectible',
    price: 100,
    maxLevel: 5,
    effect: (level) => 1 + level * 0.5
  },
  magnet: {
    name: 'Magnet Range',
    description: 'Increases collection range',
    price: 75,
    maxLevel: 8,
    effect: (level) => level * 10
  },
  spawn: {
    name: 'Spawn Rate',
    description: 'Increases collectible spawn rate',
    price: 125,
    maxLevel: 6,
    effect: (level) => level * 0.1
  },
  bonus: {
    name: 'Bonus Chance',
    description: 'Chance for bonus points',
    price: 200,
    maxLevel: 5,
    effect: (level) => level * 0.05
  },
  combo: {
    name: 'Combo Multiplier',
    description: 'Multiplier for consecutive collections',
    price: 300,
    maxLevel: 4,
    effect: (level) => 1 + level * 0.25
  },
  shield: {
    name: 'Shield Duration',
    description: 'Protection from obstacles',
    price: 400,
    maxLevel: 3,
    effect: (level) => level * 2
  },
  chain: {
    name: 'Chain Reaction',
    description: 'Collect nearby items automatically',
    price: 500,
    maxLevel: 3,
    effect: (level) => level * 15
  },
  vacuum: {
    name: 'Vacuum Effect',
    description: 'Pull collectibles towards you',
    price: 600,
    maxLevel: 3,
    effect: (level) => level * 20
  }
};

const trophyRoad: Trophy[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Collect your first 10 cubes',
    requirement: 10,
    reward: { type: 'points', value: 50 },
    tier: 'bronze'
  },
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Collect 50 cubes',
    requirement: 50,
    reward: { type: 'points', value: 200 },
    tier: 'bronze'
  },
  {
    id: 'cube_collector',
    name: 'Cube Collector',
    description: 'Collect 100 cubes',
    requirement: 100,
    reward: { type: 'skin', value: 'red' },
    tier: 'bronze'
  },
  {
    id: 'dedicated_player',
    name: 'Dedicated Player',
    description: 'Collect 250 cubes',
    requirement: 250,
    reward: { type: 'points', value: 500 },
    tier: 'silver'
  },
  {
    id: 'cube_master',
    name: 'Cube Master',
    description: 'Collect 500 cubes',
    requirement: 500,
    reward: { type: 'skin', value: 'gold' },
    tier: 'silver'
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Collect 1000 cubes',
    requirement: 1000,
    reward: { type: 'multiplier', value: 1.5 },
    tier: 'gold'
  },
  {
    id: 'cube_legend',
    name: 'Cube Legend',
    description: 'Collect 2500 cubes',
    requirement: 2500,
    reward: { type: 'skin', value: 'diamond' },
    tier: 'gold'
  },
  {
    id: 'ultimate_collector',
    name: 'Ultimate Collector',
    description: 'Collect 5000 cubes',
    requirement: 5000,
    reward: { type: 'skin', value: 'legendary' },
    tier: 'diamond'
  },
  {
    id: 'transcendent',
    name: 'Transcendent',
    description: 'Collect 10000 cubes',
    requirement: 10000,
    reward: { type: 'multiplier', value: 2 },
    tier: 'legendary'
  }
];

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

  const allSkins = { ...defaultSkins, ...customSkins };

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

        // Load claimed trophies
        const { data: trophyData } = await supabase
          .from('claimed_trophies')
          .select('trophy_id')
          .eq('profile_id', session.user.id);

        if (trophyData) {
          setClaimedTrophies(trophyData.map(t => t.trophy_id));
        }

        // Load friends
        const { data: friendsData } = await supabase
          .from('friends')
          .select(`
            friend_id,
            status,
            profiles!friends_friend_id_fkey(nickname, profile_picture)
          `)
          .eq('profile_id', session.user.id);

        if (friendsData) {
          const friendsList: Friend[] = friendsData.map(friend => ({
            id: friend.friend_id,
            nickname: friend.profiles?.nickname || 'Unknown',
            profilePicture: friend.profiles?.profile_picture || undefined,
            status: friend.status as 'online' | 'offline',
            lastSeen: new Date()
          }));
          setFriends(friendsList);
        }

        // Load pending friend requests
        const { data: requestsData } = await supabase
          .from('friend_requests')
          .select(`
            sender_id,
            profiles!friend_requests_sender_id_fkey(nickname, profile_picture)
          `)
          .eq('receiver_id', session.user.id);

        if (requestsData) {
          const pendingList: Friend[] = requestsData.map(request => ({
            id: request.sender_id,
            nickname: request.profiles?.nickname || 'Unknown',
            profilePicture: request.profiles?.profile_picture || undefined,
            status: 'offline' as const,
            lastSeen: new Date()
          }));
          setPendingFriends(pendingList);
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
        point_multiplier: pointMultiplier
      });
    };

    const debounceTimer = setTimeout(saveData, 1000);
    return () => clearTimeout(debounceTimer);
  }, [session, score, nickname, profilePicture, totalCollected, totalPointsGained, pointMultiplier]);

  const addPoints = (amount: number) => {
    const finalAmount = Math.floor(amount * pointMultiplier);
    setScore(prev => prev + finalAmount);
    setTotalPointsGained(prev => prev + finalAmount);
  };

  const spendPoints = async (amount: number, skinId: string) => {
    if (!session?.user || score < amount) return;
    
    setScore(prev => prev - amount);
    setUnlockedSkins(prev => [...prev, skinId]);
    await saveUnlockedSkin(session.user.id, skinId);
  };

  const setActiveSkin = (skinId: string) => {
    setActiveSkinId(skinId);
  };

  const updateControls = async (newControls: Controls) => {
    if (!session?.user) return;
    setControls(newControls);
    await saveControls(session.user.id, newControls);
  };

  const purchaseUpgrade = async (upgradeId: string) => {
    if (!session?.user) return;
    
    const upgrade = upgradeDefinitions[upgradeId];
    const currentLevel = upgradeLevel[upgradeId] || 0;
    
    if (currentLevel >= upgrade.maxLevel || score < upgrade.price) return;
    
    setScore(prev => prev - upgrade.price);
    setUpgradeLevel(prev => ({ ...prev, [upgradeId]: currentLevel + 1 }));
    await saveUpgrade(session.user.id, upgradeId, currentLevel + 1);
  };

  const getUpgradeEffect = (upgradeId: string): number => {
    const upgrade = upgradeDefinitions[upgradeId];
    const level = upgradeLevel[upgradeId] || 0;
    return upgrade ? upgrade.effect(level) : 0;
  };

  const addCollected = () => {
    setTotalCollected(prev => prev + 1);
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

  const resetProgress = () => {
    setScore(0);
    setUnlockedSkins(['default']);
    setActiveSkinId('default');
    setUpgradeLevel({});
    setTotalCollected(0);
    setClaimedTrophies([]);
    setPointMultiplier(1);
    setCustomSkins({});
    setTotalPointsGained(0);
  };

  const createCustomSkin = async (skinData: Partial<Skin>) => {
    if (!session?.user || score < 30000) return;
    
    setScore(prev => prev - 30000);
    
    const skinId = `custom_${Date.now()}`;
    const newSkin: Skin = {
      name: skinData.name || 'Custom Skin',
      description: skinData.description || 'A custom skin',
      color: skinData.color || '#ffffff',
      price: 0,
      custom: true,
      isRounded: skinData.isRounded || false,
      rotate: skinData.rotate || false,
      glow: skinData.glow || false,
      pulse: skinData.pulse || false,
      border: skinData.border || false,
      borderColor: skinData.borderColor || '#ffffff',
      shadow: skinData.shadow || false,
      shadowColor: skinData.shadowColor || '#000000',
      trail: skinData.trail || false,
      trailColor: skinData.trailColor || '#ffffff'
    };
    
    setCustomSkins(prev => ({ ...prev, [skinId]: newSkin }));
    setUnlockedSkins(prev => [...prev, skinId]);
    
    await saveCustomSkin(session.user.id, {
      name: newSkin.name,
      description: newSkin.description,
      color: newSkin.color,
      is_rounded: newSkin.isRounded,
      rotate: newSkin.rotate,
      glow: newSkin.glow,
      pulse: newSkin.pulse,
      border: newSkin.border,
      border_color: newSkin.borderColor,
      shadow: newSkin.shadow,
      shadow_color: newSkin.shadowColor,
      trail: newSkin.trail,
      trail_color: newSkin.trailColor
    });
  };

  const updateNickname = (newNickname: string) => {
    setNickname(newNickname);
  };

  const updateProfilePicture = (newPicture: string) => {
    setProfilePicture(newPicture);
  };

  const addFriend = async (friendId: string) => {
    if (!session?.user) return;
    
    try {
      await saveFriendRequest(session.user.id, friendId);
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!session?.user) return;
    
    try {
      await removeFriendDB(session.user.id, friendId);
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const acceptFriendRequest = async (friendId: string) => {
    if (!session?.user) return;
    
    try {
      await acceptFriendRequestDB(session.user.id, friendId);
      
      // Move from pending to friends
      const pendingFriend = pendingFriends.find(f => f.id === friendId);
      if (pendingFriend) {
        setFriends(prev => [...prev, pendingFriend]);
        setPendingFriends(prev => prev.filter(f => f.id !== friendId));
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const rejectFriendRequest = async (friendId: string) => {
    if (!session?.user) return;
    
    try {
      await rejectFriendRequestDB(session.user.id, friendId);
      setPendingFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const value: GameContextType = {
    score,
    addPoints,
    spendPoints,
    skins: allSkins,
    unlockedSkins,
    activeSkin: allSkins[activeSkinId] || allSkins.default,
    setActiveSkin,
    controls,
    updateControls,
    upgrades: upgradeDefinitions,
    upgradeLevel,
    purchaseUpgrade,
    getUpgradeEffect,
    totalCollected,
    addCollected,
    trophies: trophyRoad,
    claimedTrophies,
    claimTrophyReward,
    resetProgress,
    createCustomSkin,
    customSkins,
    nickname,
    updateNickname,
    profilePicture,
    updateProfilePicture,
    totalPointsGained,
    friends,
    pendingFriends,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    rejectFriendRequest
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};