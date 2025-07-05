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
  shape?: 'square' | 'circle' | 'triangle' | 'diamond' | 'star' | 'hexagon';
}

interface CollectibleSkin {
  name: string;
  description: string;
  color: string;
  price: number;
  shape?: 'square' | 'circle' | 'triangle' | 'diamond' | 'star' | 'hexagon';
  glow?: boolean;
  pulse?: boolean;
  border?: boolean;
  borderColor?: string;
  shadow?: boolean;
  shadowColor?: string;
}

interface BotSkin {
  name: string;
  description: string;
  color: string;
  price: number;
  glow?: boolean;
  pulse?: boolean;
  border?: boolean;
  borderColor?: string;
  shadow?: boolean;
  shadowColor?: string;
  shape?: 'square' | 'circle' | 'triangle' | 'diamond' | 'star' | 'hexagon';
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
    type: 'points' | 'skin' | 'multiplier' | 'collectible_skin' | 'bot_skin';
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
  unlockedCollectibleSkins: string[];
  activeCollectibleSkinId: string;
  botCount: number;
  unlockedBotSkins: string[];
  activeBotSkinId: string;
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
  collectibleSkins: Record<string, CollectibleSkin>;
  unlockedCollectibleSkins: string[];
  activeCollectibleSkin: CollectibleSkin;
  setActiveCollectibleSkin: (skinId: string) => void;
  purchaseCollectibleSkin: (skinId: string, price: number) => void;
  botCount: number;
  purchaseBot: () => void;
  botSkins: Record<string, BotSkin>;
  unlockedBotSkins: string[];
  activeBotSkin: BotSkin;
  setActiveBotSkin: (skinId: string) => void;
  purchaseBotSkin: (skinId: string, price: number) => void;
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
    price: 0,
    shape: 'square'
  },
  red: {
    name: 'Red Cube',
    description: 'A fiery red cube',
    color: '#ef4444',
    price: 100,
    shape: 'square'
  },
  blue: {
    name: 'Blue Cube',
    description: 'A cool blue cube',
    color: '#3b82f6',
    price: 150,
    shape: 'square'
  },
  green: {
    name: 'Green Cube',
    description: 'A natural green cube',
    color: '#22c55e',
    price: 200,
    shape: 'square'
  },
  purple: {
    name: 'Purple Cube',
    description: 'A mystical purple cube',
    color: '#a855f7',
    price: 300,
    shape: 'square'
  },
  gold: {
    name: 'Golden Cube',
    description: 'A precious golden cube',
    color: '#fbbf24',
    price: 500,
    glow: true,
    shape: 'square'
  },
  diamond: {
    name: 'Diamond Cube',
    description: 'A sparkling diamond cube',
    color: '#e5e7eb',
    price: 1000,
    glow: true,
    pulse: true,
    shape: 'diamond'
  },
  rainbow: {
    name: 'Rainbow Cube',
    description: 'A colorful rainbow cube',
    color: '#ff6b6b',
    price: 2000,
    rainbow: true,
    glow: true,
    shape: 'square'
  },
  neon: {
    name: 'Neon Cube',
    description: 'A bright neon cube',
    color: '#00ff88',
    price: 1500,
    glow: true,
    pulse: true,
    shape: 'square'
  },
  shadow: {
    name: 'Shadow Cube',
    description: 'A mysterious shadow cube',
    color: '#1f2937',
    price: 800,
    shadow: true,
    shadowColor: '#000000',
    shape: 'square'
  },
  fire: {
    name: 'Fire Cube',
    description: 'A blazing fire cube',
    color: '#ff4500',
    price: 1200,
    glow: true,
    trail: true,
    trailColor: '#ff6b35',
    shape: 'square'
  },
  ice: {
    name: 'Ice Cube',
    description: 'A frozen ice cube',
    color: '#87ceeb',
    price: 1000,
    glow: true,
    isRounded: true,
    shape: 'square'
  },
  metal: {
    name: 'Metal Cube',
    description: 'A shiny metal cube',
    color: '#c0c0c0',
    price: 600,
    metallic: true,
    border: true,
    borderColor: '#808080',
    shape: 'square'
  },
  plasma: {
    name: 'Plasma Cube',
    description: 'An energetic plasma cube',
    color: '#ff00ff',
    price: 3000,
    glow: true,
    pulse: true,
    rotate: true,
    shape: 'square'
  },
  void: {
    name: 'Void Cube',
    description: 'A cube from the void',
    color: '#000000',
    price: 2500,
    border: true,
    borderColor: '#8b5cf6',
    glow: true,
    shape: 'square'
  },
  crystal: {
    name: 'Crystal Cube',
    description: 'A beautiful crystal cube',
    color: '#fef3c7',
    price: 1800,
    isRounded: true,
    glow: true,
    pulse: true,
    shape: 'square'
  },
  // New shape-based skins
  circle_blue: {
    name: 'Blue Orb',
    description: 'A smooth blue sphere',
    color: '#3b82f6',
    price: 400,
    shape: 'circle',
    glow: true
  },
  circle_red: {
    name: 'Red Orb',
    description: 'A fiery red sphere',
    color: '#ef4444',
    price: 450,
    shape: 'circle',
    pulse: true
  },
  triangle_green: {
    name: 'Green Arrow',
    description: 'A sharp green triangle',
    color: '#22c55e',
    price: 350,
    shape: 'triangle'
  },
  triangle_purple: {
    name: 'Purple Spike',
    description: 'A mystical purple triangle',
    color: '#a855f7',
    price: 600,
    shape: 'triangle',
    glow: true
  },
  star_gold: {
    name: 'Golden Star',
    description: 'A shining golden star',
    color: '#fbbf24',
    price: 800,
    shape: 'star',
    glow: true,
    pulse: true
  },
  star_silver: {
    name: 'Silver Star',
    description: 'A brilliant silver star',
    color: '#e5e7eb',
    price: 700,
    shape: 'star',
    glow: true
  },
  hexagon_cyan: {
    name: 'Cyan Hex',
    description: 'A futuristic cyan hexagon',
    color: '#06b6d4',
    price: 900,
    shape: 'hexagon',
    glow: true
  },
  hexagon_orange: {
    name: 'Orange Hex',
    description: 'A vibrant orange hexagon',
    color: '#f97316',
    price: 850,
    shape: 'hexagon',
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
    trailColor: '#ff6b35',
    shape: 'square'
  },
  // Trophy reward skins
  cosmic: {
    name: 'Cosmic Cube',
    description: 'A cube from outer space',
    color: '#4c1d95',
    price: 0,
    exclusive: true,
    glow: true,
    pulse: true,
    border: true,
    borderColor: '#8b5cf6',
    shape: 'square'
  },
  phoenix: {
    name: 'Phoenix Cube',
    description: 'A cube reborn from flames',
    color: '#dc2626',
    price: 0,
    exclusive: true,
    glow: true,
    trail: true,
    trailColor: '#f97316',
    shape: 'square'
  },
  galaxy: {
    name: 'Galaxy Cube',
    description: 'A cube containing galaxies',
    color: '#1e1b4b',
    price: 0,
    exclusive: true,
    glow: true,
    pulse: true,
    rainbow: true,
    shape: 'square'
  },
  quantum: {
    name: 'Quantum Cube',
    description: 'A cube that exists in multiple dimensions',
    color: '#059669',
    price: 0,
    exclusive: true,
    glow: true,
    pulse: true,
    rotate: true,
    shape: 'diamond'
  },
  eternal: {
    name: 'Eternal Cube',
    description: 'A cube that transcends time',
    color: '#fbbf24',
    price: 0,
    exclusive: true,
    glow: true,
    pulse: true,
    trail: true,
    trailColor: '#ffffff',
    border: true,
    borderColor: '#f59e0b',
    shape: 'star'
  }
};

const defaultCollectibleSkins: Record<string, CollectibleSkin> = {
  default: {
    name: 'Yellow Square',
    description: 'Classic yellow collectible',
    color: '#fbbf24',
    price: 0,
    shape: 'square'
  },
  red_square: {
    name: 'Red Square',
    description: 'A red collectible square',
    color: '#ef4444',
    price: 50,
    shape: 'square'
  },
  blue_square: {
    name: 'Blue Square',
    description: 'A blue collectible square',
    color: '#3b82f6',
    price: 75,
    shape: 'square'
  },
  green_circle: {
    name: 'Green Dot',
    description: 'A green circular collectible',
    color: '#22c55e',
    price: 100,
    shape: 'circle'
  },
  purple_circle: {
    name: 'Purple Orb',
    description: 'A mystical purple orb',
    color: '#a855f7',
    price: 150,
    shape: 'circle',
    glow: true
  },
  orange_triangle: {
    name: 'Orange Triangle',
    description: 'A triangular orange collectible',
    color: '#f97316',
    price: 125,
    shape: 'triangle'
  },
  cyan_triangle: {
    name: 'Cyan Arrow',
    description: 'A sharp cyan triangle',
    color: '#06b6d4',
    price: 175,
    shape: 'triangle',
    glow: true
  },
  pink_diamond: {
    name: 'Pink Diamond',
    description: 'A precious pink diamond',
    color: '#ec4899',
    price: 200,
    shape: 'diamond',
    glow: true,
    pulse: true
  },
  gold_star: {
    name: 'Gold Star',
    description: 'A shining golden star',
    color: '#fbbf24',
    price: 300,
    shape: 'star',
    glow: true
  },
  silver_star: {
    name: 'Silver Star',
    description: 'A brilliant silver star',
    color: '#e5e7eb',
    price: 250,
    shape: 'star'
  },
  teal_hex: {
    name: 'Teal Hexagon',
    description: 'A futuristic teal hexagon',
    color: '#14b8a6',
    price: 350,
    shape: 'hexagon',
    glow: true
  },
  rainbow_circle: {
    name: 'Rainbow Orb',
    description: 'A colorful rainbow orb',
    color: '#ff6b6b',
    price: 500,
    shape: 'circle',
    glow: true,
    pulse: true
  },
  // New collectible skins
  emerald_square: {
    name: 'Emerald Square',
    description: 'A precious emerald square',
    color: '#10b981',
    price: 180,
    shape: 'square',
    glow: true
  },
  ruby_circle: {
    name: 'Ruby Circle',
    description: 'A brilliant ruby circle',
    color: '#dc2626',
    price: 220,
    shape: 'circle',
    glow: true,
    pulse: true
  },
  sapphire_diamond: {
    name: 'Sapphire Diamond',
    description: 'A stunning sapphire diamond',
    color: '#1d4ed8',
    price: 280,
    shape: 'diamond',
    glow: true
  },
  amethyst_triangle: {
    name: 'Amethyst Triangle',
    description: 'A mystical amethyst triangle',
    color: '#7c3aed',
    price: 240,
    shape: 'triangle',
    glow: true,
    pulse: true
  },
  topaz_hex: {
    name: 'Topaz Hexagon',
    description: 'A golden topaz hexagon',
    color: '#f59e0b',
    price: 320,
    shape: 'hexagon',
    glow: true
  },
  platinum_star: {
    name: 'Platinum Star',
    description: 'A rare platinum star',
    color: '#e5e7eb',
    price: 400,
    shape: 'star',
    glow: true,
    border: true,
    borderColor: '#9ca3af'
  },
  neon_pink_circle: {
    name: 'Neon Pink Orb',
    description: 'A vibrant neon pink orb',
    color: '#ec4899',
    price: 160,
    shape: 'circle',
    glow: true,
    pulse: true
  },
  electric_blue_square: {
    name: 'Electric Blue Square',
    description: 'An electric blue square',
    color: '#0ea5e9',
    price: 140,
    shape: 'square',
    glow: true
  },
  lime_triangle: {
    name: 'Lime Triangle',
    description: 'A bright lime triangle',
    color: '#84cc16',
    price: 130,
    shape: 'triangle',
    glow: true
  },
  magenta_diamond: {
    name: 'Magenta Diamond',
    description: 'A vibrant magenta diamond',
    color: '#d946ef',
    price: 260,
    shape: 'diamond',
    pulse: true
  },
  turquoise_hex: {
    name: 'Turquoise Hexagon',
    description: 'A beautiful turquoise hexagon',
    color: '#06b6d4',
    price: 290,
    shape: 'hexagon',
    glow: true
  },
  coral_star: {
    name: 'Coral Star',
    description: 'A warm coral star',
    color: '#f97316',
    price: 270,
    shape: 'star',
    glow: true
  },
  obsidian_square: {
    name: 'Obsidian Square',
    description: 'A dark obsidian square',
    color: '#1f2937',
    price: 350,
    shape: 'square',
    border: true,
    borderColor: '#6b7280',
    shadow: true,
    shadowColor: '#000000'
  },
  crystal_circle: {
    name: 'Crystal Orb',
    description: 'A transparent crystal orb',
    color: '#f3f4f6',
    price: 380,
    shape: 'circle',
    glow: true,
    pulse: true,
    border: true,
    borderColor: '#d1d5db'
  },
  void_triangle: {
    name: 'Void Triangle',
    description: 'A mysterious void triangle',
    color: '#000000',
    price: 420,
    shape: 'triangle',
    border: true,
    borderColor: '#8b5cf6',
    glow: true
  },
  // Trophy reward collectible skins
  celestial_star: {
    name: 'Celestial Star',
    description: 'A star from the heavens',
    color: '#fbbf24',
    price: 0,
    shape: 'star',
    glow: true,
    pulse: true,
    border: true,
    borderColor: '#f59e0b'
  },
  nebula_circle: {
    name: 'Nebula Orb',
    description: 'An orb containing cosmic dust',
    color: '#8b5cf6',
    price: 0,
    shape: 'circle',
    glow: true,
    pulse: true
  },
  meteor_diamond: {
    name: 'Meteor Diamond',
    description: 'A diamond forged in space',
    color: '#ef4444',
    price: 0,
    shape: 'diamond',
    glow: true,
    trail: true
  },
  aurora_hex: {
    name: 'Aurora Hexagon',
    description: 'A hexagon with aurora colors',
    color: '#06b6d4',
    price: 0,
    shape: 'hexagon',
    glow: true,
    pulse: true,
    border: true,
    borderColor: '#0891b2'
  }
};

const defaultBotSkins: Record<string, BotSkin> = {
  default: {
    name: 'Standard Bot',
    description: 'Basic green collection bot',
    color: '#22c55e',
    price: 0,
    shape: 'square'
  },
  blue_bot: {
    name: 'Blue Bot',
    description: 'A cool blue collection bot',
    color: '#3b82f6',
    price: 200,
    shape: 'square'
  },
  red_bot: {
    name: 'Red Bot',
    description: 'A fiery red collection bot',
    color: '#ef4444',
    price: 250,
    shape: 'square',
    glow: true
  },
  purple_bot: {
    name: 'Purple Bot',
    description: 'A mystical purple bot',
    color: '#a855f7',
    price: 300,
    shape: 'square',
    pulse: true
  },
  gold_bot: {
    name: 'Golden Bot',
    description: 'A precious golden bot',
    color: '#fbbf24',
    price: 500,
    shape: 'square',
    glow: true,
    pulse: true
  },
  stealth_bot: {
    name: 'Stealth Bot',
    description: 'A dark stealth bot',
    color: '#1f2937',
    price: 400,
    shape: 'square',
    border: true,
    borderColor: '#6b7280'
  },
  neon_bot: {
    name: 'Neon Bot',
    description: 'A bright neon bot',
    color: '#00ff88',
    price: 600,
    shape: 'square',
    glow: true,
    pulse: true
  },
  crystal_bot: {
    name: 'Crystal Bot',
    description: 'A transparent crystal bot',
    color: '#f3f4f6',
    price: 700,
    shape: 'square',
    glow: true,
    border: true,
    borderColor: '#d1d5db'
  },
  // Different shapes for bots
  circle_bot: {
    name: 'Orb Bot',
    description: 'A spherical collection bot',
    color: '#06b6d4',
    price: 350,
    shape: 'circle',
    glow: true
  },
  triangle_bot: {
    name: 'Arrow Bot',
    description: 'A triangular speed bot',
    color: '#f97316',
    price: 380,
    shape: 'triangle',
    glow: true
  },
  diamond_bot: {
    name: 'Diamond Bot',
    description: 'A diamond-shaped precision bot',
    color: '#e5e7eb',
    price: 450,
    shape: 'diamond',
    glow: true,
    pulse: true
  },
  star_bot: {
    name: 'Star Bot',
    description: 'A star-shaped elite bot',
    color: '#fbbf24',
    price: 550,
    shape: 'star',
    glow: true,
    pulse: true
  },
  hex_bot: {
    name: 'Hex Bot',
    description: 'A hexagonal tactical bot',
    color: '#8b5cf6',
    price: 480,
    shape: 'hexagon',
    glow: true
  },
  // Premium bot skins
  rainbow_bot: {
    name: 'Rainbow Bot',
    description: 'A colorful rainbow bot',
    color: '#ff6b6b',
    price: 800,
    shape: 'square',
    glow: true,
    pulse: true
  },
  plasma_bot: {
    name: 'Plasma Bot',
    description: 'An energetic plasma bot',
    color: '#ff00ff',
    price: 900,
    shape: 'square',
    glow: true,
    pulse: true,
    border: true,
    borderColor: '#c084fc'
  },
  void_bot: {
    name: 'Void Bot',
    description: 'A mysterious void bot',
    color: '#000000',
    price: 750,
    shape: 'square',
    border: true,
    borderColor: '#8b5cf6',
    glow: true
  },
  fire_bot: {
    name: 'Fire Bot',
    description: 'A blazing fire bot',
    color: '#ff4500',
    price: 650,
    shape: 'square',
    glow: true,
    shadow: true,
    shadowColor: '#ff6b35'
  },
  ice_bot: {
    name: 'Ice Bot',
    description: 'A frozen ice bot',
    color: '#87ceeb',
    price: 580,
    shape: 'square',
    glow: true,
    border: true,
    borderColor: '#bfdbfe'
  },
  // Trophy reward bot skins
  titan_bot: {
    name: 'Titan Bot',
    description: 'A massive titan collection bot',
    color: '#374151',
    price: 0,
    shape: 'square',
    glow: true,
    border: true,
    borderColor: '#6b7280'
  },
  guardian_bot: {
    name: 'Guardian Bot',
    description: 'A protective guardian bot',
    color: '#059669',
    price: 0,
    shape: 'hexagon',
    glow: true,
    pulse: true
  },
  sentinel_bot: {
    name: 'Sentinel Bot',
    description: 'An advanced sentinel bot',
    color: '#dc2626',
    price: 0,
    shape: 'diamond',
    glow: true,
    pulse: true,
    border: true,
    borderColor: '#ef4444'
  },
  omega_bot: {
    name: 'Omega Bot',
    description: 'The ultimate collection bot',
    color: '#7c3aed',
    price: 0,
    shape: 'star',
    glow: true,
    pulse: true,
    border: true,
    borderColor: '#8b5cf6'
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
    id: 'collector_pro',
    name: 'Collector Pro',
    description: 'Collect 750 cubes',
    requirement: 750,
    reward: { type: 'collectible_skin', value: 'celestial_star' },
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
    id: 'automation_begins',
    name: 'Automation Begins',
    description: 'Collect 1500 cubes',
    requirement: 1500,
    reward: { type: 'bot_skin', value: 'titan_bot' },
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
    id: 'cosmic_explorer',
    name: 'Cosmic Explorer',
    description: 'Collect 3500 cubes',
    requirement: 3500,
    reward: { type: 'skin', value: 'cosmic' },
    tier: 'gold'
  },
  {
    id: 'nebula_hunter',
    name: 'Nebula Hunter',
    description: 'Collect 4500 cubes',
    requirement: 4500,
    reward: { type: 'collectible_skin', value: 'nebula_circle' },
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
    id: 'guardian_awakens',
    name: 'Guardian Awakens',
    description: 'Collect 6500 cubes',
    requirement: 6500,
    reward: { type: 'bot_skin', value: 'guardian_bot' },
    tier: 'diamond'
  },
  {
    id: 'phoenix_rising',
    name: 'Phoenix Rising',
    description: 'Collect 8000 cubes',
    requirement: 8000,
    reward: { type: 'skin', value: 'phoenix' },
    tier: 'diamond'
  },
  {
    id: 'meteor_shower',
    name: 'Meteor Shower',
    description: 'Collect 9500 cubes',
    requirement: 9500,
    reward: { type: 'collectible_skin', value: 'meteor_diamond' },
    tier: 'diamond'
  },
  {
    id: 'transcendent',
    name: 'Transcendent',
    description: 'Collect 10000 cubes',
    requirement: 10000,
    reward: { type: 'multiplier', value: 2 },
    tier: 'legendary'
  },
  {
    id: 'galaxy_master',
    name: 'Galaxy Master',
    description: 'Collect 12500 cubes',
    requirement: 12500,
    reward: { type: 'skin', value: 'galaxy' },
    tier: 'legendary'
  },
  {
    id: 'sentinel_protocol',
    name: 'Sentinel Protocol',
    description: 'Collect 15000 cubes',
    requirement: 15000,
    reward: { type: 'bot_skin', value: 'sentinel_bot' },
    tier: 'legendary'
  },
  {
    id: 'aurora_borealis',
    name: 'Aurora Borealis',
    description: 'Collect 17500 cubes',
    requirement: 17500,
    reward: { type: 'collectible_skin', value: 'aurora_hex' },
    tier: 'legendary'
  },
  {
    id: 'quantum_leap',
    name: 'Quantum Leap',
    description: 'Collect 20000 cubes',
    requirement: 20000,
    reward: { type: 'skin', value: 'quantum' },
    tier: 'legendary'
  },
  {
    id: 'dimensional_rift',
    name: 'Dimensional Rift',
    description: 'Collect 25000 cubes',
    requirement: 25000,
    reward: { type: 'multiplier', value: 2.5 },
    tier: 'legendary'
  },
  {
    id: 'omega_protocol',
    name: 'Omega Protocol',
    description: 'Collect 30000 cubes',
    requirement: 30000,
    reward: { type: 'bot_skin', value: 'omega_bot' },
    tier: 'legendary'
  },
  {
    id: 'infinity_collector',
    name: 'Infinity Collector',
    description: 'Collect 35000 cubes',
    requirement: 35000,
    reward: { type: 'multiplier', value: 3 },
    tier: 'legendary'
  },
  {
    id: 'eternal_champion',
    name: 'Eternal Champion',
    description: 'Collect 40000 cubes',
    requirement: 40000,
    reward: { type: 'skin', value: 'eternal' },
    tier: 'legendary'
  },
  {
    id: 'universe_master',
    name: 'Universe Master',
    description: 'Collect 45000 cubes',
    requirement: 45000,
    reward: { type: 'multiplier', value: 4 },
    tier: 'legendary'
  },
  {
    id: 'omnipotent',
    name: 'Omnipotent',
    description: 'Collect 50000 cubes - The ultimate achievement',
    requirement: 50000,
    reward: { type: 'multiplier', value: 5 },
    tier: 'legendary'
  }
];

const SAVE_VERSION = '1.3.0';
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
  const [unlockedCollectibleSkins, setUnlockedCollectibleSkins] = useState<string[]>(['default']);
  const [activeCollectibleSkinId, setActiveCollectibleSkinId] = useState('default');
  const [botCount, setBotCount] = useState(0);
  const [unlockedBotSkins, setUnlockedBotSkins] = useState<string[]>(['default']);
  const [activeBotSkinId, setActiveBotSkinId] = useState('default');

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
    setUnlockedCollectibleSkins(data.unlockedCollectibleSkins || ['default']);
    setActiveCollectibleSkinId(data.activeCollectibleSkinId || 'default');
    setBotCount(data.botCount || 0);
    setUnlockedBotSkins(data.unlockedBotSkins || ['default']);
    setActiveBotSkinId(data.activeBotSkinId || 'default');
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
      lastSaved: now,
      unlockedCollectibleSkins,
      activeCollectibleSkinId,
      botCount,
      unlockedBotSkins,
      activeBotSkinId
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
  }, [score, unlockedSkins, activeSkinId, controls, upgradeLevel, totalCollected, claimedTrophies, pointMultiplier, customSkins, nickname, profilePicture, totalPointsGained, unlockedCollectibleSkins, activeCollectibleSkinId, botCount, unlockedBotSkins, activeBotSkinId]);

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
      lastSaved: new Date().toLocaleString(),
      unlockedCollectibleSkins,
      activeCollectibleSkinId,
      botCount,
      unlockedBotSkins,
      activeBotSkinId
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
    if (skinId) {
      setUnlockedSkins(prev => [...prev, skinId]);
    }
  };

  const setActiveSkin = (skinId: string) => {
    setActiveSkinId(skinId);
  };

  const setActiveCollectibleSkin = (skinId: string) => {
    setActiveCollectibleSkinId(skinId);
  };

  const setActiveBotSkin = (skinId: string) => {
    setActiveBotSkinId(skinId);
  };

  const purchaseCollectibleSkin = (skinId: string, price: number) => {
    if (score < price) return;
    
    setScore(prev => prev - price);
    setUnlockedCollectibleSkins(prev => [...prev, skinId]);
  };

  const purchaseBotSkin = (skinId: string, price: number) => {
    if (score < price) return;
    
    setScore(prev => prev - price);
    setUnlockedBotSkins(prev => [...prev, skinId]);
  };

  const purchaseBot = () => {
    setBotCount(prev => prev + 1);
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
      } else if (trophy.reward.type === 'collectible_skin') {
        setUnlockedCollectibleSkins(prev => [...prev, trophy.reward.value as string]);
      } else if (trophy.reward.type === 'bot_skin') {
        setUnlockedBotSkins(prev => [...prev, trophy.reward.value as string]);
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
    setUnlockedCollectibleSkins(['default']);
    setActiveCollectibleSkinId('default');
    setBotCount(0);
    setUnlockedBotSkins(['default']);
    setActiveBotSkinId('default');
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
      trailColor: skinData.trailColor || '#ffffff',
      shape: skinData.shape || 'square'
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
    lastSaved,
    collectibleSkins: defaultCollectibleSkins,
    unlockedCollectibleSkins,
    activeCollectibleSkin: defaultCollectibleSkins[activeCollectibleSkinId] || defaultCollectibleSkins.default,
    setActiveCollectibleSkin,
    purchaseCollectibleSkin,
    botCount,
    purchaseBot,
    botSkins: defaultBotSkins,
    unlockedBotSkins,
    activeBotSkin: defaultBotSkins[activeBotSkinId] || defaultBotSkins.default,
    setActiveBotSkin,
    purchaseBotSkin
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