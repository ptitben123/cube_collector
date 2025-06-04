import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, saveUserData, saveUnlockedSkin, saveUpgrade, saveCustomSkin } from '../lib/supabase';

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

const availableSkins: Record<string, Skin> = {
  default: {
    name: 'Default',
    description: 'The standard white cube',
    color: '#ffffff',
    price: 0
  },
  blue: {
    name: 'Blue Cube',
    description: 'A sleek blue variant',
    color: '#3b82f6',
    price: 100
  },
  green: {
    name: 'Green Cube',
    description: 'An emerald-colored cube',
    color: '#10b981',
    price: 100
  },
  red: {
    name: 'Red Cube',
    description: 'A fiery red cube',
    color: '#ef4444',
    price: 100
  },
  purple: {
    name: 'Purple Cube',
    description: 'A mystical purple cube',
    color: '#8b5cf6',
    price: 150
  },
  rounded: {
    name: 'Rounded Cube',
    description: 'Softer edges for a smoother look',
    color: '#ffffff',
    isRounded: true,
    price: 200
  },
  diamond: {
    name: 'Diamond',
    description: 'Rotated for a diamond shape',
    color: '#60a5fa',
    rotate: true,
    price: 300
  },
  glowing: {
    name: 'Glowing Cube',
    description: 'A cube with a mystical glow',
    color: '#f9a8d4',
    glow: true,
    price: 500
  },
  neon: {
    name: 'Neon Cube',
    description: 'A vibrant neon cube',
    color: '#4ade80',
    glow: true,
    border: true,
    borderColor: '#22c55e',
    price: 400
  },
  sunset: {
    name: 'Sunset Cube',
    description: 'Warm sunset colors',
    color: '#fb923c',
    shadow: true,
    shadowColor: '#ef4444',
    price: 450
  },
  ice: {
    name: 'Ice Cube',
    description: 'Crystal clear and cold',
    color: '#bfdbfe',
    isRounded: true,
    glow: true,
    price: 550
  },
  void: {
    name: 'Void Cube',
    description: 'Dark as the night',
    color: '#1e1b4b',
    shadow: true,
    shadowColor: '#312e81',
    price: 600
  },
  toxic: {
    name: 'Toxic Cube',
    description: 'Dangerously glowing',
    color: '#84cc16',
    glow: true,
    pulse: true,
    price: 650
  },
  lava: {
    name: 'Lava Cube',
    description: 'Hot and dangerous',
    color: '#dc2626',
    glow: true,
    pulse: true,
    price: 700
  },
  crystal: {
    name: 'Crystal Cube',
    description: 'Shimmering beauty',
    color: '#e879f9',
    isRounded: true,
    glow: true,
    border: true,
    borderColor: '#d946ef',
    price: 750
  },
  ocean: {
    name: 'Ocean Cube',
    description: 'Deep sea vibes',
    color: '#0ea5e9',
    isRounded: true,
    shadow: true,
    shadowColor: '#0369a1',
    price: 800
  },
  rainbow: {
    name: 'Rainbow Cube',
    description: 'A rare cube that changes colors (Trophy Exclusive)',
    color: '#ff0000',
    glow: true,
    pulse: true,
    price: 0,
    exclusive: true
  },
  golden: {
    name: 'Golden Cube',
    description: 'A prestigious golden cube (Trophy Exclusive)',
    color: '#fbbf24',
    glow: true,
    rotate: true,
    border: true,
    borderColor: '#f59e0b',
    price: 0,
    exclusive: true
  },
  galaxy: {
    name: 'Galaxy Cube',
    description: 'A mesmerizing cosmic cube (Trophy Exclusive)',
    color: '#7c3aed',
    glow: true,
    isRounded: true,
    rotate: true,
    shadow: true,
    shadowColor: '#4c1d95',
    price: 0,
    exclusive: true
  },
  quantum: {
    name: 'Quantum Cube',
    description: 'Transcends space and time (Trophy Exclusive)',
    color: '#0f172a',
    glow: true,
    rotate: true,
    pulse: true,
    border: true,
    borderColor: '#6366f1',
    price: 0,
    exclusive: true
  },
  phoenix: {
    name: 'Phoenix Cube',
    description: 'Born from eternal flames (Trophy Exclusive)',
    color: '#ea580c',
    glow: true,
    rotate: true,
    pulse: true,
    shadow: true,
    shadowColor: '#dc2626',
    price: 0,
    exclusive: true
  },
  prism: {
    name: 'Prism',
    description: 'Refracts light in beautiful ways',
    color: '#ffffff',
    rainbow: true,
    glow: true,
    isRounded: true,
    price: 1000
  },
  chrome: {
    name: 'Chrome',
    description: 'Sleek metallic finish',
    color: '#e2e8f0',
    metallic: true,
    isRounded: true,
    price: 1200
  },
  plasma: {
    name: 'Plasma',
    description: 'Energetic plasma trails',
    color: '#8b5cf6',
    trail: true,
    trailColor: '#c4b5fd',
    glow: true,
    price: 1500
  },
  nebula: {
    name: 'Nebula',
    description: 'Contains the beauty of space',
    color: '#1e1b4b',
    trail: true,
    trailColor: '#818cf8',
    glow: true,
    shadow: true,
    shadowColor: '#4c1d95',
    price: 2000
  },
  spirit: {
    name: 'Spirit',
    description: 'Ethereal and mysterious',
    color: '#f0fdfa',
    pulse: true,
    glow: true,
    trail: true,
    trailColor: '#99f6e4',
    price: 2500
  },
  antimatter: {
    name: 'Antimatter',
    description: 'Defies the laws of physics',
    color: '#000000',
    border: true,
    borderColor: '#ffffff',
    glow: true,
    trail: true,
    trailColor: '#334155',
    price: 3000
  }
};

const availableUpgrades: Record<string, Upgrade> = {
  speed: {
    name: 'Movement Speed',
    description: 'Increase your movement speed',
    price: 150,
    maxLevel: 5,
    effect: (level) => 5 + level * 1
  },
  points: {
    name: 'Point Multiplier',
    description: 'Earn more points per collection',
    price: 250,
    maxLevel: 3,
    effect: (level) => 1 + level * 0.5
  },
  magnet: {
    name: 'Collection Range',
    description: 'Increase your collection radius',
    price: 200,
    maxLevel: 4,
    effect: (level) => level * 5
  },
  spawn: {
    name: 'Spawn Rate',
    description: 'Increase collectible spawn frequency',
    price: 300,
    maxLevel: 3,
    effect: (level) => level * 0.2
  },
  bonus: {
    name: 'Bonus Points',
    description: 'Chance to get extra points',
    price: 350,
    maxLevel: 3,
    effect: (level) => level * 0.15
  },
  combo: {
    name: 'Combo System',
    description: 'Chain collections for bonus points',
    price: 400,
    maxLevel: 4,
    effect: (level) => level * 0.1
  },
  shield: {
    name: 'Shield Duration',
    description: 'Temporary invincibility after collecting',
    price: 500,
    maxLevel: 3,
    effect: (level) => level * 0.5
  },
  chain: {
    name: 'Chain Reaction',
    description: 'Chance to spawn bonus collectibles',
    price: 600,
    maxLevel: 4,
    effect: (level) => level * 0.1
  },
  vacuum: {
    name: 'Point Vacuum',
    description: 'Automatically collect nearby points',
    price: 800,
    maxLevel: 3,
    effect: (level) => level * 10
  }
};

const trophyRoad: Trophy[] = [
  {
    id: 'beginner',
    name: 'Beginner Collector',
    description: 'Collect 10 squares',
    requirement: 10,
    reward: { type: 'points', value: 5 },
    tier: 'bronze'
  },
  {
    id: 'novice',
    name: 'Novice Collector',
    description: 'Collect 25 squares',
    requirement: 25,
    reward: { type: 'points', value: 10 },
    tier: 'bronze'
  },
  {
    id: 'intermediate',
    name: 'Skilled Collector',
    description: 'Collect 50 squares',
    requirement: 50,
    reward: { type: 'skin', value: 'rainbow' },
    tier: 'silver'
  },
  {
    id: 'advanced',
    name: 'Expert Collector',
    description: 'Collect 100 squares',
    requirement: 100,
    reward: { type: 'skin', value: 'golden' },
    tier: 'gold'
  },
  {
    id: 'master',
    name: 'Master Collector',
    description: 'Collect 250 squares',
    requirement: 250,
    reward: { type: 'multiplier', value: 2 },
    tier: 'gold'
  },
  {
    id: 'elite',
    name: 'Elite Collector',
    description: 'Collect 400 squares',
    requirement: 400,
    reward: { type: 'skin', value: 'quantum' },
    tier: 'diamond'
  },
  {
    id: 'legend',
    name: 'Legendary Collector',
    description: 'Collect 500 squares',
    requirement: 500,
    reward: { type: 'skin', value: 'galaxy' },
    tier: 'legendary'
  },
  {
    id: 'mythic',
    name: 'Mythic Collector',
    description: 'Collect 750 squares',
    requirement: 750,
    reward: { type: 'skin', value: 'phoenix' },
    tier: 'legendary'
  },
  {
    id: 'speedster',
    name: 'Speedster',
    description: 'Collect 1000 squares',
    requirement: 1000,
    reward: { type: 'multiplier', value: 3 },
    tier: 'legendary'
  },
  {
    id: 'collector_king',
    name: 'Collector King',
    description: 'Collect 1500 squares',
    requirement: 1500,
    reward: { type: 'points', value: 200 },
    tier: 'legendary'
  },
  {
    id: 'ultimate_master',
    name: 'Ultimate Master',
    description: 'Collect 2000 squares',
    requirement: 2000,
    reward: { type: 'multiplier', value: 5 },
    tier: 'legendary'
  },
  {
    id: 'cube_god',
    name: 'Cube God',
    description: 'Collect 3000 squares',
    requirement: 3000,
    reward: { type: 'points', value: 500 },
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
          setClaimedTrophies(trophyData.map(trophy => trophy.trophy_id));
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
    const upgradeMultiplier = getUpgradeEffect('points');
    const bonusChance = getUpgradeEffect('bonus');
    const comboMultiplier = getUpgradeEffect('combo');
    
    let finalAmount = amount * upgradeMultiplier * pointMultiplier;
    
    if (Math.random() < bonusChance) {
      finalAmount *= 2;
    }
    
    if (comboMultiplier > 0) {
      finalAmount *= (1 + comboMultiplier);
    }
    
    const roundedAmount = Math.floor(finalAmount);
    setScore(prev => prev + roundedAmount);
    setTotalPointsGained(prev => prev + roundedAmount);
  };

  const spendPoints = async (amount: number, skinId: string) => {
    if (!session?.user || score < amount || unlockedSkins.includes(skinId)) return;

    setScore(prev => prev - amount);
    setUnlockedSkins(prev => [...prev, skinId]);
    await saveUnlockedSkin(session.user.id, skinId);
  };

  const setActiveSkin = (skinId: string) => {
    if (unlockedSkins.includes(skinId)) {
      setActiveSkinId(skinId);
    }
  };

  const updateControls = (newControls: Controls) => {
    setControls(newControls);
  };

  const purchaseUpgrade = async (upgradeId: string) => {
    if (!session?.user) return;

    const upgrade = availableUpgrades[upgradeId];
    const currentLevel = upgradeLevel[upgradeId] || 0;
    
    if (upgrade && currentLevel < upgrade.maxLevel && score >= upgrade.price) {
      const newLevel = currentLevel + 1;
      setScore(prev => prev - upgrade.price);
      setUpgradeLevel(prev => ({
        ...prev,
        [upgradeId]: newLevel
      }));
      await saveUpgrade(session.user.id, upgradeId, newLevel);
    }
  };

  const getUpgradeEffect = (upgradeId: string): number => {
    const upgrade = availableUpgrades[upgradeId];
    const level = upgradeLevel[upgradeId] || 0;
    return upgrade ? upgrade.effect(level) : 0;
  };

  const addCollected = () => {
    setTotalCollected(prev => prev + 1);
  };

  const claimTrophyReward = (trophyId: string) => {
    const trophy = trophyRoad.find(t => t.id === trophyId);
    if (trophy && !claimedTrophies.includes(trophyId) && totalCollected >= trophy.requirement) {
      if (trophy.reward.type === 'points') {
        setScore(prev => prev + (trophy.reward.value as number));
        setTotalPointsGained(prev => prev + (trophy.reward.value as number));
      } else if (trophy.reward.type === 'skin') {
        setUnlockedSkins(prev => [...prev, trophy.reward.value as string]);
      } else if (trophy.reward.type === 'multiplier') {
        setPointMultiplier(prev => prev * (trophy.reward.value as number));
      }
      setClaimedTrophies(prev => [...prev, trophyId]);
    }
  };

  const createCustomSkin = async (skinData: Partial<Skin>) => {
    if (!session?.user || score < 30000) return;

    const skinId = `custom_${Date.now()}`;
    const newSkin: Skin = {
      name: skinData.name || 'Custom Skin',
      description: skinData.description || 'A personally designed skin',
      color: skinData.color || '#ffffff',
      price: 0,
      custom: true,
      ...skinData
    };
    
    setCustomSkins(prev => ({
      ...prev,
      [skinId]: newSkin
    }));
    setUnlockedSkins(prev => [...prev, skinId]);
    setScore(prev => prev - 30000);

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

  const resetProgress = () => {
    setScore(0);
    setUnlockedSkins(['default']);
    setActiveSkinId('default');
    setControls(defaultControls);
    setUpgradeLevel({});
    setTotalCollected(0);
    setClaimedTrophies([]);
    setPointMultiplier(1);
    setCustomSkins({});
    setNickname('');
    setProfilePicture('');
    setTotalPointsGained(0);
    setFriends([]);
    setPendingFriends([]);
  };

  const addFriend = (friendId: string) => {
    const newFriend: Friend = {
      id: friendId,
      nickname: `Friend ${friendId}`,
      status: 'offline',
      lastSeen: new Date()
    };
    setPendingFriends(prev => [...prev, newFriend]);
  };

  const removeFriend = (friendId: string) => {
    setFriends(prev => prev.filter(friend => friend.id !== friendId));
  };

  const acceptFriendRequest = (friendId: string) => {
    const friend = pendingFriends.find(f => f.id === friendId);
    if (friend) {
      setFriends(prev => [...prev, friend]);
      setPendingFriends(prev => prev.filter(f => f.id !== friendId));
    }
  };

  const rejectFriendRequest = (friendId: string) => {
    setPendingFriends(prev => prev.filter(f => f.id !== friendId));
  };

  const activeSkin = availableSkins[activeSkinId] || customSkins[activeSkinId] || availableSkins.default;

  const value = {
    score,
    addPoints,
    spendPoints,
    skins: { ...availableSkins, ...customSkins },
    unlockedSkins,
    activeSkin,
    setActiveSkin,
    controls,
    updateControls,
    upgrades: availableUpgrades,
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