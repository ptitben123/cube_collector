import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface SaveData {
  score: number;
  unlockedSkins: string[];
  activeSkinId: string;
  controls: Controls;
  upgradeLevel: Record<string, number>;
  totalCollected: number;
  claimedTrophies: string[];
  pointMultiplier: number;
  customSkins: Record<string, Skin>;
  nickname: string;
  profilePicture: string;
  totalPointsGained: number;
  saveVersion: string;
  lastSaved: string;
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
  exportSave: () => void;
  importSave: (file: File) => Promise<boolean>;
  lastSaved: string;
}

interface GameProviderProps {
  children: React.ReactNode;
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

const SAVE_VERSION = '1.0.0';
const STORAGE_KEY = 'cubeCollectorData';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [score, setScore] = useState(0);
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['default']);
  const [activeSkinId, setActiveSkinId] = useState('default');
  const [controls, setControls] = useState<Controls>(defaultControls);
  const [upgradeLevel, setUpgradeLevel] = useState<Record<string, number>>({});
  const [totalCollected, setTotalCollected] = useState(0);
  const [claimedTrophies, setClaimedTrophies] = useState<string[]>([]);
  const [pointMultiplier, setPointMultiplier] = useState(1);
  const [customSkins, setCustomSkins] = useState<Record<string, Skin>>({});
  const [nickname, setNickname] = useState('Player');
  const [profilePicture, setProfilePicture] = useState('');
  const [totalPointsGained, setTotalPointsGained] = useState(0);
  const [lastSaved, setLastSaved] = useState('');

  const allSkins = { ...defaultSkins, ...customSkins };

  // Load data from localStorage on mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        // Try localStorage first
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const data: SaveData = JSON.parse(savedData);
          loadGameData(data);
          return;
        }

        // Try sessionStorage as backup
        const sessionData = sessionStorage.getItem(STORAGE_KEY);
        if (sessionData) {
          const data: SaveData = JSON.parse(sessionData);
          loadGameData(data);
          // Copy to localStorage
          localStorage.setItem(STORAGE_KEY, sessionData);
          return;
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    loadSavedData();
  }, []);

  const loadGameData = (data: SaveData) => {
    setScore(data.score || 0);
    setUnlockedSkins(data.unlockedSkins || ['default']);
    setActiveSkinId(data.activeSkinId || 'default');
    setControls(data.controls || defaultControls);
    setUpgradeLevel(data.upgradeLevel || {});
    setTotalCollected(data.totalCollected || 0);
    setClaimedTrophies(data.claimedTrophies || []);
    setPointMultiplier(data.pointMultiplier || 1);
    setCustomSkins(data.customSkins || {});
    setNickname(data.nickname || 'Player');
    setProfilePicture(data.profilePicture || '');
    setTotalPointsGained(data.totalPointsGained || 0);
    setLastSaved(data.lastSaved || '');
  };

  // Save data to both localStorage and sessionStorage whenever state changes
  useEffect(() => {
    const now = new Date().toLocaleString();
    const dataToSave: SaveData = {
      score,
      unlockedSkins,
      activeSkinId,
      controls,
      upgradeLevel,
      totalCollected,
      claimedTrophies,
      pointMultiplier,
      customSkins,
      nickname,
      profilePicture,
      totalPointsGained,
      saveVersion: SAVE_VERSION,
      lastSaved: now
    };
    
    const jsonData = JSON.stringify(dataToSave);
    
    try {
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, jsonData);
      // Also save to sessionStorage as backup
      sessionStorage.setItem(STORAGE_KEY, jsonData);
      setLastSaved(now);
    } catch (error) {
      console.error('Error saving data:', error);
      // If localStorage fails, try sessionStorage only
      try {
        sessionStorage.setItem(STORAGE_KEY, jsonData);
      } catch (sessionError) {
        console.error('Error saving to session storage:', sessionError);
      }
    }
  }, [score, unlockedSkins, activeSkinId, controls, upgradeLevel, totalCollected, claimedTrophies, pointMultiplier, customSkins, nickname, profilePicture, totalPointsGained]);

  const exportSave = () => {
    const dataToExport: SaveData = {
      score,
      unlockedSkins,
      activeSkinId,
      controls,
      upgradeLevel,
      totalCollected,
      claimedTrophies,
      pointMultiplier,
      customSkins,
      nickname,
      profilePicture,
      totalPointsGained,
      saveVersion: SAVE_VERSION,
      lastSaved: new Date().toLocaleString()
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cube-collector-save-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importSave = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data: SaveData = JSON.parse(text);
      
      // Validate the save file
      if (!data.saveVersion || typeof data.score !== 'number') {
        throw new Error('Invalid save file format');
      }

      // Load the data
      loadGameData(data);
      
      // Save to storage
      const jsonData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, jsonData);
      sessionStorage.setItem(STORAGE_KEY, jsonData);
      
      return true;
    } catch (error) {
      console.error('Error importing save file:', error);
      return false;
    }
  };

  const addPoints = (amount: number) => {
    const finalAmount = Math.floor(amount * pointMultiplier);
    setScore(prev => prev + finalAmount);
    setTotalPointsGained(prev => prev + finalAmount);
  };

  const spendPoints = (amount: number, skinId: string) => {
    if (score < amount) return;
    
    setScore(prev => prev - amount);
    setUnlockedSkins(prev => [...prev, skinId]);
  };

  const setActiveSkin = (skinId: string) => {
    setActiveSkinId(skinId);
  };

  const updateControls = (newControls: Controls) => {
    setControls(newControls);
  };

  const purchaseUpgrade = (upgradeId: string) => {
    const upgrade = upgradeDefinitions[upgradeId];
    const currentLevel = upgradeLevel[upgradeId] || 0;
    
    if (currentLevel >= upgrade.maxLevel || score < upgrade.price) return;
    
    setScore(prev => prev - upgrade.price);
    setUpgradeLevel(prev => ({ ...prev, [upgradeId]: currentLevel + 1 }));
  };

  const getUpgradeEffect = (upgradeId: string): number => {
    const upgrade = upgradeDefinitions[upgradeId];
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
    setNickname('Player');
    setProfilePicture('');
    setLastSaved('');
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const createCustomSkin = (skinData: Partial<Skin>) => {
    if (score < 30000) return;
    
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
  };

  const updateNickname = (newNickname: string) => {
    setNickname(newNickname);
  };

  const updateProfilePicture = (newPicture: string) => {
    setProfilePicture(newPicture);
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
    exportSave,
    importSave,
    lastSaved
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